// ═══════════════════════════════════════════════════════════════
// ingest-nz-customs-tariff — dedicated Tier A ingester for the
// `nz-customs-tariff` knowledge source (Aironaut pilot / Pīkau / Gateway).
//
// The NZ Customs Working Tariff Document (WTD) has no machine-readable feed —
// it publishes per-section PDFs. Per the Tier A fallback rule this ingester
// combines TWO official sources into one knowledge source:
//
//   1. WCO HS 2022 baseline — UN Comtrade reference H6.json (keyless, JSON):
//      every 2/4/6-digit code + description. The classification skeleton.
//   2. NZ Customs WTD index page (customs.govt.nz) — scraped daily for the
//      per-section effective dates + PDF pointers. The NZ freshness signal:
//      when Customs reissues a section, the page text changes, the combined
//      hash changes, and the chunks re-sync the same morning.
//
// Chunking: one chunk per 4-digit HS heading (~1,250), each carrying its
// 6-digit code rows + the NZ WTD section citation (PDF URL + effective date),
// plus one index chunk per WTD section. 1536-dim Gemini embeddings via the
// shared helper, batched. Codes and dates are stored verbatim from the
// sources — this ingester never synthesises a code, a rate, or a date.
// Duty RATES live in the section PDFs and are deliberately NOT extracted:
// a rate the pipeline can't read verbatim is a rate it must not invent.
//
// Runs daily at 05:30 NZT via pg_cron (before the generic tier-A sweep at
// 06:00, which skips source_type='custom' rows — this one). Same contract as
// knowledge-ingest-tier-a: hash-diff, no-retry-on-block, alert-once-per-day,
// flag dependent agents on change, embeddings best-effort with backfill.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOURCE_SLUG = "nz-customs-tariff";
const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";
const WTD_URL = "https://www.customs.govt.nz/business/tariffs/working-tariff-document/";
const HS22_URL = "https://comtradeapi.un.org/files/v1/app/reference/H6.json";
const EMBED_DIM = 1536;
const EMBED_BATCH = 100;          // batchEmbedContents requests per call
const INSERT_BATCH = 200;
const FETCH_TIMEOUT_MS = 30000;
const RATE_LIMIT_MS = 1000;       // ≥1s between outbound calls (source + Gemini)
const TIME_BUDGET_MS = 300_000;   // stop embedding past this; backfill next run

const GEMINI_BATCH_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (res.status === 403 || res.status === 429 || res.status === 451) {
      throw new BlockedError(`HTTP ${res.status}`, res.status);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

class BlockedError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

// ── WTD index page → per-section effective dates + PDF pointers ────────────
interface WtdSection {
  roman: string;          // "VIII"
  chapters: number[];     // [41, 42, 43]
  title: string;          // "Raw hides and skins, leather, ..."
  pdfUrl: string;
  effective: string | null; // "1 January 2026"
}

function parseWtdSections(html: string): { sections: WtdSection[]; docEffective: string | null } {
  const sections: WtdSection[] = [];
  const re = /href="(\/media\/[^"]+\.pdf)"[^>]*title="Section ([IVX]+),? ?Chapters? ([\d\s–-]+):\s*([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const [, href, roman, chapterSpan, title] = m;
    const nums = chapterSpan.match(/\d+/g)?.map(Number) ?? [];
    const chapters: number[] = [];
    if (nums.length === 2 && nums[1] > nums[0]) {
      for (let c = nums[0]; c <= nums[1]; c++) chapters.push(c);
    } else {
      chapters.push(...nums);
    }
    // The "Effective d Month yyyy" note follows the link in the page flow.
    const tail = html.slice(m.index, m.index + 1200);
    const eff = tail.match(/Effective\s+(\d{1,2}\s+\w+\s+\d{4})/i);
    sections.push({
      roman,
      chapters,
      title: title.replace(/&amp;/g, "&").replace(/&#x2019;/g, "'").trim(),
      pdfUrl: `https://www.customs.govt.nz${href}`,
      effective: eff ? eff[1] : null,
    });
  }
  const doc = html.match(/recent updates,\s*effective\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  return { sections, docEffective: doc ? doc[1] : null };
}

// ── HS 2022 baseline (UN Comtrade H6 reference) ─────────────────────────────
interface H6Entry {
  id: string;
  text: string;
  parent: string;
  aggrlevel: number;
}

function stripCodePrefix(text: string, id: string): string {
  return text.startsWith(`${id} - `) ? text.slice(id.length + 3) : text;
}

interface HeadingChunk {
  chunkId: string;
  content: string;
}

function buildChunks(entries: H6Entry[], sections: WtdSection[], docEffective: string | null): HeadingChunk[] {
  const chapterToSection = new Map<number, WtdSection>();
  for (const s of sections) for (const c of s.chapters) chapterToSection.set(c, s);

  const chapters = new Map<string, string>();   // "01" -> description
  const headings = new Map<string, string>();   // "0101" -> description
  const subs = new Map<string, string[]>();     // "0101" -> ["0101.21 — ..."]

  for (const e of entries) {
    if (e.aggrlevel === 2) chapters.set(e.id, stripCodePrefix(e.text, e.id));
    else if (e.aggrlevel === 4) headings.set(e.id, stripCodePrefix(e.text, e.id));
    else if (e.aggrlevel === 6) {
      const h = e.id.slice(0, 4);
      const line = `${e.id.slice(0, 4)}.${e.id.slice(4)} — ${stripCodePrefix(e.text, e.id)}`;
      if (!subs.has(h)) subs.set(h, []);
      subs.get(h)!.push(line);
    }
  }

  const chunks: HeadingChunk[] = [];
  for (const [hid, htext] of headings) {
    const chapterNum = Number(hid.slice(0, 2));
    const chapterText = chapters.get(hid.slice(0, 2)) ?? "";
    const sec = chapterToSection.get(chapterNum);
    const lines = subs.get(hid) ?? [`${hid}.00 — ${htext}`];
    const nzRef = sec
      ? `NZ Working Tariff: Section ${sec.roman} (${sec.title}), effective ${sec.effective ?? docEffective ?? "see customs.govt.nz"} — ${sec.pdfUrl}`
      : `NZ Working Tariff: see ${WTD_URL}`;
    chunks.push({
      chunkId: `hs-${hid}`,
      content: [
        `HS heading ${hid} — ${htext}`,
        `Chapter ${hid.slice(0, 2)}: ${chapterText}`,
        `Codes (HS 2022 / WCO baseline, 6-digit):`,
        ...lines,
        nzRef,
        `Duty rates and NZ 8/11-digit statistical splits are in the WTD section PDF above — quote them only from that document, never from memory.`,
      ].join("\n"),
    });
  }

  // Section-level index chunks: the freshness + navigation layer.
  for (const s of sections) {
    chunks.push({
      chunkId: `wtd-section-${s.roman.toLowerCase()}`,
      content: [
        `NZ Working Tariff Document — Section ${s.roman}, Chapters ${s.chapters[0]}${s.chapters.length > 1 ? `–${s.chapters[s.chapters.length - 1]}` : ""}: ${s.title}`,
        `Effective ${s.effective ?? docEffective ?? "unknown"}. Official PDF: ${s.pdfUrl}`,
        `Published by the New Zealand Customs Service (customs.govt.nz). This section holds the legally applicable NZ duty rates for its chapters.`,
      ].join("\n"),
    });
  }
  return chunks;
}

// ── Batched Gemini embeddings, 1536-dim ─────────────────────────────────────
async function embedBatch(texts: string[], apiKey: string): Promise<Array<number[] | null>> {
  try {
    const r = await fetch(`${GEMINI_BATCH_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((t) => ({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: t.slice(0, 8000) }] },
          outputDimensionality: EMBED_DIM,
        })),
      }),
    });
    if (!r.ok) {
      console.error("[embed-batch] failed", r.status, await r.text().catch(() => ""));
      return texts.map(() => null);
    }
    const j = await r.json();
    const embs = j?.embeddings;
    if (!Array.isArray(embs)) return texts.map(() => null);
    return texts.map((_, i) => (Array.isArray(embs[i]?.values) ? embs[i].values : null));
  } catch (err) {
    console.error("[embed-batch] exception", (err as Error).message);
    return texts.map(() => null);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const started = Date.now();
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") ?? null;
    const admin = createClient(supabaseUrl, serviceKey);

    let force = false;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      force = body?.force === true;
    }

    const { data: source, error: srcErr } = await admin
      .from("knowledge_sources")
      .select("source_slug, source_name, tier, url, api_endpoint, refresh_cadence_days, last_fetched_at, last_content_hash, dependent_agents, active")
      .eq("source_slug", SOURCE_SLUG)
      .maybeSingle();
    if (srcErr) throw srcErr;
    if (!source || !source.active) {
      return new Response(JSON.stringify({ ok: false, error: `${SOURCE_SLUG} not seeded or inactive` }), {
        status: 412, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fail = async (status: string, message: string, blocked = false) => {
      await admin.from("knowledge_sources").update({
        last_status: status, last_error: message, blocked, updated_at: new Date().toISOString(),
      }).eq("source_slug", SOURCE_SLUG);
      await admin.from("knowledge_alerts").insert({
        source_slug: SOURCE_SLUG,
        alert_type: blocked ? "source_blocked" : "fetch_error",
        severity: "warning",
        message: `Tier A source "nz-customs-tariff": ${message}`,
        detail: { message },
      });
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    // ── Fetch both official sources; never proceed on a partial read ───────
    let wtdHtml: string;
    let h6Raw: string;
    try {
      wtdHtml = await fetchText(WTD_URL);
      await sleep(RATE_LIMIT_MS);
      h6Raw = await fetchText(HS22_URL);
    } catch (e) {
      if (e instanceof BlockedError) return await fail("blocked", `blocked scraping (${e.message}) — not retrying`, true);
      return await fail("error", e instanceof Error ? e.message : "fetch failed");
    }

    const { sections, docEffective } = parseWtdSections(wtdHtml);
    if (sections.length < 15) {
      return await fail("error", `WTD index parse found only ${sections.length} sections — page layout may have changed`);
    }

    let entries: H6Entry[];
    try {
      const parsed = JSON.parse(h6Raw);
      entries = (parsed?.results ?? parsed) as H6Entry[];
      if (!Array.isArray(entries) || entries.length < 5000) throw new Error(`H6 reference too small (${entries?.length ?? 0})`);
    } catch (e) {
      return await fail("error", `HS 2022 baseline parse failed: ${e instanceof Error ? e.message : "bad JSON"}`);
    }

    // Combined content hash: HS codes + the WTD freshness text (titles, dates,
    // pdf paths — includes file sizes, so a reissued PDF flips the hash).
    const freshnessText = sections
      .map((s) => `${s.roman}|${s.title}|${s.effective}|${s.pdfUrl}`)
      .join("\n") + `\ndoc:${docEffective}`;
    const contentHash = await sha256(`${freshnessText}\n${entries.length}\n${await sha256(h6Raw)}`);
    const nowIso = new Date().toISOString();

    const summary = {
      sections: sections.length,
      docEffective,
      chunksWritten: 0,
      embedded: 0,
      embedBackfilled: 0,
      agentsFlagged: 0,
      changed: false,
    };

    // ── Unchanged: bump watermark + backfill any missing vectors ───────────
    if (!force && contentHash === source.last_content_hash) {
      if (geminiKey) {
        const { data: missing } = await admin
          .from("knowledge_chunks")
          .select("id, content")
          .eq("source_slug", SOURCE_SLUG)
          .is("embedding", null)
          .limit(500);
        for (let i = 0; i < (missing ?? []).length; i += EMBED_BATCH) {
          if (Date.now() - started > TIME_BUDGET_MS) break;
          const slice = (missing ?? []).slice(i, i + EMBED_BATCH);
          const vecs = await embedBatch(slice.map((c) => c.content), geminiKey);
          for (let k = 0; k < slice.length; k++) {
            if (vecs[k]) {
              await admin.from("knowledge_chunks").update({ embedding: vecs[k] as unknown as string }).eq("id", slice[k].id);
              summary.embedBackfilled++;
            }
          }
          await sleep(RATE_LIMIT_MS);
        }
      }
      await admin.from("knowledge_sources").update({
        last_fetched_at: nowIso, last_status: "unchanged", last_error: null, blocked: false, updated_at: nowIso,
      }).eq("source_slug", SOURCE_SLUG);
      return new Response(JSON.stringify({ ok: true, ms: Date.now() - started, ...summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Changed (or first load / forced): rebuild the chunk set ────────────
    const chunks = buildChunks(entries, sections, docEffective);
    summary.changed = true;

    // Embed first (bounded by the time budget), then replace atomically-ish:
    // rows land with vectors where we got them; the rest backfill next run.
    const vectors: Array<number[] | null> = new Array(chunks.length).fill(null);
    if (geminiKey) {
      for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
        if (Date.now() - started > TIME_BUDGET_MS) {
          console.warn(`[ingest] time budget hit at chunk ${i}/${chunks.length}; rest backfills next run`);
          break;
        }
        const slice = chunks.slice(i, i + EMBED_BATCH);
        const vecs = await embedBatch(slice.map((c) => c.content), geminiKey);
        for (let k = 0; k < vecs.length; k++) vectors[i + k] = vecs[k];
        await sleep(RATE_LIMIT_MS);
      }
    }

    await admin.from("knowledge_chunks").delete().eq("source_slug", SOURCE_SLUG);

    const pointer = `NZ Customs Working Tariff Document (${WTD_URL}) + WCO HS 2022 baseline (UN Comtrade H6), retrieved ${nowIso.slice(0, 10)}`;
    for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
      const slice = chunks.slice(i, i + INSERT_BATCH);
      const rows = await Promise.all(slice.map(async (c, k) => ({
        source_slug: SOURCE_SLUG,
        chunk_id: c.chunkId,
        chunk_index: i + k,
        content: c.content,
        embedding: vectors[i + k] ? (vectors[i + k] as unknown as string) : null,
        tier: source.tier,
        retrieved_at: nowIso,
        source_pointer: pointer,
        hash: await sha256(c.content),
        tokens: Math.round(c.content.length / 4),
      })));
      const { error: insErr } = await admin
        .from("knowledge_chunks")
        .upsert(rows, { onConflict: "source_slug,chunk_id" });
      if (insErr) throw insErr;
      summary.chunksWritten += rows.length;
    }
    summary.embedded = vectors.filter(Boolean).length;

    if (source.last_content_hash) {
      const { data: flagged } = await admin.rpc("flag_knowledge_source_change", {
        p_source_slug: SOURCE_SLUG,
        p_old_hash: source.last_content_hash,
        p_new_hash: contentHash,
      });
      if (typeof flagged === "number") summary.agentsFlagged = flagged;
    }

    await admin.from("knowledge_sources").update({
      last_fetched_at: nowIso, last_content_hash: contentHash,
      last_status: "ok", last_error: null, blocked: false, updated_at: nowIso,
    }).eq("source_slug", SOURCE_SLUG);

    return new Response(JSON.stringify({ ok: true, ms: Date.now() - started, embeddingConfigured: !!geminiKey, ...summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

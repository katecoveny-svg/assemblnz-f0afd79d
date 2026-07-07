"use client";

import { useCallback, useRef, useState } from "react";

// ── champagne canon ──────────────────────────────────────────────────────────
const PAPER = "#FBFAF6";
const CLOUD = "#FFFFFF";
const INK = "#1A1918";
const GREY = "#5A5850";
const GOLD = "#BFA37A";
const GOLD_DEEP = "#A88A5E";
const SAND = "#EFEADC";
const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const mono = "var(--font-mono), 'Space Mono', ui-monospace, monospace";

export interface SlimAgent {
  slug: string;
  name: string;
  role: string;
  kind: "orchestrate" | "image" | "copy" | "video" | "podcast" | "roster";
  blurb: string;
  accent: string;
  interactive: boolean;
}

interface Receipt {
  agent: string;
  kind: string;
  provider: string;
  model: string;
  costNzd: number;
  trust: string;
  briefSummary: string;
  spec?: string;
  createdAt: string;
}

interface Asset {
  id: string;
  kind: "image" | "video" | "copy" | "podcast";
  agent: string;
  url: string; // data URL, static path, or text
  isText?: boolean;
  caption: string;
  receipt?: Receipt;
}

let idc = 0;
const uid = () => `a${++idc}_${Math.round(performance.now())}`;

export function CreativeWorkspace({ agents }: { agents: SlimAgent[] }) {
  const interactive = agents.filter((a) => a.interactive);
  const roster = agents.filter((a) => !a.interactive);
  const [active, setActive] = useState<SlimAgent>(interactive[0]);
  const [gallery, setGallery] = useState<Asset[]>([]);
  const addAsset = useCallback((a: Asset) => setGallery((g) => [a, ...g]), []);

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK }}>
      <Header remaining={gallery.length} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "232px minmax(0,1fr) 300px",
          gap: 0,
          alignItems: "stretch",
          maxWidth: 1440,
          margin: "0 auto",
        }}
        className="cw-grid"
      >
        <AgentRail interactive={interactive} roster={roster} active={active} onPick={setActive} />
        <section style={{ padding: "22px 26px", borderLeft: `1px solid ${SAND}`, borderRight: `1px solid ${SAND}`, minHeight: "70vh" }}>
          <AgentStage key={active.slug} agent={active} onAsset={addAsset} />
        </section>
        <GalleryRail gallery={gallery} />
      </div>
      <style>{`
        @media (max-width: 940px) {
          .cw-grid { grid-template-columns: 1fr !important; }
          .cw-grid > * { border: none !important; }
        }
      `}</style>
    </div>
  );
}

function Header({ remaining }: { remaining: number }) {
  return (
    <header style={{ padding: "20px 26px 14px", maxWidth: 1440, margin: "0 auto" }}>
      <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: GREY }}>
        assembl · demo · draft-only
      </p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 38, margin: "6px 0 2px", letterSpacing: "-0.02em" }}>
        auaha<span style={{ color: GOLD }}>.</span> the creative kete
      </h1>
      <p style={{ fontSize: 13.5, color: GREY, maxWidth: 640 }}>
        A creative studio in a chat. Describe what you need — Prism art-directs and generates the image, Muse writes
        the words, Flux films it, Verse voices it. Everything real, on-brand, yours to approve.
        {remaining > 0 && <span style={{ color: GOLD_DEEP }}> · {remaining} in this session</span>}
      </p>
    </header>
  );
}

function AgentRail({
  interactive,
  roster,
  active,
  onPick,
}: {
  interactive: SlimAgent[];
  roster: SlimAgent[];
  active: SlimAgent;
  onPick: (a: SlimAgent) => void;
}) {
  return (
    <nav style={{ padding: "22px 16px" }}>
      <p style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: GREY, marginBottom: 10 }}>
        the makers
      </p>
      {interactive.map((a) => {
        const on = a.slug === active.slug;
        return (
          <button
            key={a.slug}
            onClick={() => onPick(a)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              marginBottom: 6,
              borderRadius: 12,
              border: `1px solid ${on ? a.accent : SAND}`,
              background: on ? CLOUD : "transparent",
              boxShadow: on ? "0 1px 8px rgba(26,25,24,0.05)" : "none",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: a.accent }} />
              <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 600 }}>{a.name}</span>
            </span>
            <span style={{ fontSize: 11, color: GREY }}>{a.role}</span>
          </button>
        );
      })}
      <p style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: GREY, margin: "18px 0 8px" }}>
        the rest of the kete
      </p>
      {roster.map((a) => (
        <div key={a.slug} style={{ padding: "5px 12px", opacity: 0.75 }}>
          <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 600 }}>{a.name}</span>
          <span style={{ fontSize: 11, color: GREY, display: "block" }}>{a.role}</span>
        </div>
      ))}
    </nav>
  );
}

// ── the stage switches on agent kind ─────────────────────────────────────────
function AgentStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 26, margin: 0 }}>{agent.name}</h2>
        <p style={{ fontSize: 13, color: GREY, maxWidth: 560, marginTop: 4 }}>{agent.blurb}</p>
      </div>
      {agent.kind === "image" && <ImageStage agent={agent} onAsset={onAsset} />}
      {agent.kind === "video" && <VideoStage agent={agent} onAsset={onAsset} />}
      {agent.kind === "podcast" && <PodcastStage agent={agent} onAsset={onAsset} />}
      {(agent.kind === "copy" || agent.kind === "orchestrate") && <ChatStage agent={agent} onAsset={onAsset} />}
    </div>
  );
}

// Shared honest-error / not-configured panel
function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div
      style={{
        border: `1px solid ${tone === "warn" ? "#D8B45A" : SAND}`,
        background: tone === "warn" ? "#FBF3DD" : CLOUD,
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 12.5,
        color: tone === "warn" ? "#6B531C" : GREY,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

function Composer({
  placeholder,
  cta,
  busy,
  onSend,
}: {
  placeholder: string;
  cta: string;
  busy: boolean;
  onSend: (text: string) => void;
}) {
  const [v, setV] = useState("");
  const send = () => {
    if (!v.trim() || busy) return;
    onSend(v.trim());
    setV("");
  };
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
        }}
        placeholder={placeholder}
        rows={2}
        style={{
          flex: 1,
          resize: "vertical",
          border: `1px solid ${SAND}`,
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 13.5,
          fontFamily: "inherit",
          background: CLOUD,
          color: INK,
        }}
      />
      <button
        onClick={send}
        disabled={busy}
        style={{
          alignSelf: "flex-end",
          padding: "10px 18px",
          borderRadius: 12,
          border: "none",
          background: busy ? SAND : INK,
          color: busy ? GREY : PAPER,
          fontSize: 13,
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "…" : cta}
      </button>
    </div>
  );
}

function ReceiptChip({ r }: { r: Receipt }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10.5, color: GREY, marginTop: 6, lineHeight: 1.5 }}>
      <span style={{ color: GOLD_DEEP }}>◆ mana receipt</span> · {r.provider} · {r.model}
      {r.spec ? ` · ${r.spec}` : ""} · ~${r.costNzd.toFixed(2)} est.
      <br />
      <span style={{ color: "#7A7566" }}>{r.trust}</span>
    </div>
  );
}

async function handleApi(res: Response): Promise<{ nc?: { envVar: string; detail: string }; err?: string; data?: any }> {
  if (res.status === 429) {
    const j = await res.json().catch(() => ({}));
    return { err: j.error ?? "Rate limit reached (20/hour)." };
  }
  const j = await res.json().catch(() => ({}));
  if (j.notConfigured) return { nc: { envVar: j.envVar, detail: j.detail } };
  if (j.error) return { err: j.error };
  return { data: j };
}

// ── IMAGE (Prism) ────────────────────────────────────────────────────────────
function ImageStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  const [busy, setBusy] = useState(false);
  const [imgs, setImgs] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [nc, setNc] = useState<{ envVar: string; detail: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastBrief, setLastBrief] = useState("");

  const run = async (brief: string) => {
    setBusy(true); setErr(null); setNc(null); setLastBrief(brief);
    try {
      const res = await fetch("/api/creative/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, agent: agent.slug, count: 4, aspectRatio: "1:1" }),
      });
      const { nc, err, data } = await handleApi(res);
      if (nc) setNc(nc);
      else if (err) setErr(err);
      else {
        setImgs(data.images);
        setReceipt(data.receipt);
        data.images.forEach((url: string, i: number) =>
          onAsset({ id: uid(), kind: "image", agent: agent.name, url, caption: `${brief.slice(0, 40)} · v${i + 1}`, receipt: data.receipt }),
        );
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Composer placeholder="Describe the shot — subject, mood, light, palette. e.g. 'editorial hero for a Wellington gin brand, botanical, moody, low key'" cta="Generate ×4" busy={busy} onSend={run} />
      {lastBrief && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {["more editorial", "warmer", "darker, add fog", "wider crop"].map((q) => (
            <button key={q} onClick={() => run(`${lastBrief} — ${q}`)} disabled={busy}
              style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 999, border: `1px solid ${SAND}`, background: CLOUD, color: GREY, cursor: busy ? "default" : "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}
      {busy && <Notice>Prism is art-directing four variations…</Notice>}
      {nc && <Notice tone="warn">Image generation is not configured on this environment. Set <b>{nc.envVar}</b> (or FAL_KEY) to switch it on. {nc.detail}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}
      {imgs.length > 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginTop: 16 }}>
            {imgs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`variation ${i + 1}`} style={{ width: "100%", borderRadius: 12, border: `1px solid ${SAND}` }} />
            ))}
          </div>
          {receipt && <ReceiptChip r={receipt} />}
        </div>
      )}
    </div>
  );
}

// ── VIDEO (Flux) ─────────────────────────────────────────────────────────────
function VideoStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [video, setVideo] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [nc, setNc] = useState<{ envVar: string; detail: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (brief: string) => {
    setBusy(true); setErr(null); setNc(null); setVideo(null); setStatus("Flux is framing the shot…");
    try {
      const res = await fetch("/api/creative/video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, aspectRatio: "16:9" }),
      });
      const { nc, err, data } = await handleApi(res);
      if (nc) { setNc(nc); return; }
      if (err) { setErr(err); return; }
      const rec = data.receipt as Receipt;
      setReceipt(rec);
      if (data.done && data.video) {
        finish(data.video, rec, brief);
        return;
      }
      // poll Veo
      setStatus("Rendering with Veo — this takes a minute or two…");
      const op = data.operation as string;
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 6000));
        const pr = await fetch("/api/creative/video/poll", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: op }),
        });
        const pj = await pr.json().catch(() => ({}));
        if (pj.done && pj.video) { finish(pj.video, rec, brief); return; }
        if (pj.error) { setErr(pj.error); return; }
        setStatus(`Rendering with Veo… (${(i + 1) * 6}s)`);
      }
      setErr("Video is taking longer than expected — try again.");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const finish = (url: string, rec: Receipt, brief: string) => {
    setVideo(url); setStatus("");
    onAsset({ id: uid(), kind: "video", agent: agent.name, url, caption: brief.slice(0, 44), receipt: rec });
  };

  return (
    <div>
      <Composer placeholder="Describe one 15-second scene — subject, motion, camera, light. e.g. 'slow dolly across a sunlit Auckland rooftop bar at golden hour'" cta="Film it" busy={busy} onSend={run} />
      {busy && <Notice>{status}</Notice>}
      {nc && <Notice tone="warn">Video is not configured. Set <b>{nc.envVar}</b> (Fal Kling) or GEMINI_API_KEY (Veo). {nc.detail}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}
      {video && (
        <div style={{ marginTop: 16 }}>
          <video src={video} controls style={{ width: "100%", borderRadius: 12, border: `1px solid ${SAND}` }} />
          {receipt && <ReceiptChip r={receipt} />}
        </div>
      )}
    </div>
  );
}

// ── PODCAST (Verse) ──────────────────────────────────────────────────────────
function PodcastStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  const [busy, setBusy] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [nc, setNc] = useState<{ envVar: string; detail: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (topic: string) => {
    setBusy(true); setErr(null); setNc(null); setAudio(null); setScript("");
    try {
      const res = await fetch("/api/creative/podcast", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const { nc, err, data } = await handleApi(res);
      if (nc) setNc(nc);
      else if (err) setErr(err);
      else {
        setAudio(data.audio); setScript(data.script); setReceipt(data.receipt);
        onAsset({ id: uid(), kind: "podcast", agent: agent.name, url: data.audio, caption: topic.slice(0, 44), receipt: data.receipt });
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Composer placeholder="Give Verse a topic — it writes the script and voices it. e.g. 'a 40-second welcome for a new café loyalty app'" cta="Write & voice" busy={busy} onSend={run} />
      {busy && <Notice>Verse is writing the script and recording…</Notice>}
      {nc && <Notice tone="warn">Podcast voice is not configured. Set <b>{nc.envVar}</b> (or GEMINI_API_KEY for the Google TTS fallback). {nc.detail}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}
      {audio && (
        <div style={{ marginTop: 16 }}>
          <audio src={audio} controls style={{ width: "100%" }} />
          {script && <p style={{ fontSize: 13, color: INK, background: CLOUD, border: `1px solid ${SAND}`, borderRadius: 12, padding: "12px 14px", marginTop: 12, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{script}</p>}
          {receipt && <ReceiptChip r={receipt} />}
        </div>
      )}
    </div>
  );
}

// ── CHAT (Muse / Auaha, streamed) ────────────────────────────────────────────
function ChatStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [nc, setNc] = useState<{ envVar: string; detail: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const run = async (text: string) => {
    setBusy(true); setNc(null);
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/creative/copy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, agent: agent.slug }),
      });
      const ct = res.headers.get("Content-Type") ?? "";
      if (ct.includes("application/json")) {
        const j = await res.json().catch(() => ({}));
        if (j.notConfigured) { setNc({ envVar: j.envVar, detail: j.detail }); setMsgs(next); return; }
        if (j.error) { setMsgs([...next, { role: "assistant", content: `[${j.error}]` }]); return; }
      }
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      if (acc.trim()) onAsset({ id: uid(), kind: "copy", agent: agent.name, url: acc, isText: true, caption: text.slice(0, 44) });
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `[${(e as Error).message}]` }]);
    } finally {
      setBusy(false);
    }
  };

  const starters = agent.kind === "orchestrate"
    ? ["Full campaign for a switch-and-win energy offer.", "Launch package for a new Wellington café."]
    : ["Three headlines for a winter single-origin.", "A LinkedIn post announcing a pilot."];

  return (
    <div>
      {msgs.length === 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          {starters.map((s) => (
            <button key={s} onClick={() => run(s)} disabled={busy}
              style={{ fontSize: 12, padding: "7px 12px", borderRadius: 999, border: `1px solid ${SAND}`, background: CLOUD, color: GREY, cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%" }}>
            <div style={{
              background: m.role === "user" ? INK : CLOUD,
              color: m.role === "user" ? PAPER : INK,
              border: m.role === "user" ? "none" : `1px solid ${SAND}`,
              borderRadius: 14, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
            }}>
              {m.content || (busy ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {nc && <Notice tone="warn">Copy generation is not configured. Set <b>{nc.envVar}</b>. {nc.detail}</Notice>}
      <Composer placeholder={agent.kind === "orchestrate" ? "Describe the whole brief…" : "Ask Muse for words…"} cta="Send" busy={busy} onSend={run} />
    </div>
  );
}

// ── GALLERY RAIL ─────────────────────────────────────────────────────────────
function GalleryRail({ gallery }: { gallery: Asset[] }) {
  return (
    <aside style={{ padding: "22px 16px" }}>
      <p style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: GREY, marginBottom: 10 }}>
        this session
      </p>
      {gallery.length === 0 && <p style={{ fontSize: 12.5, color: GREY }}>Everything you generate lands here — download on hover, receipt under each.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {gallery.map((a) => (
          <div key={a.id} style={{ border: `1px solid ${SAND}`, borderRadius: 12, background: CLOUD, overflow: "hidden" }}>
            <GalleryThumb a={a} />
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{a.agent} · {a.kind}</div>
              <div style={{ fontSize: 11, color: GREY }}>{a.caption}</div>
              {a.receipt && (
                <div style={{ fontFamily: mono, fontSize: 9.5, color: GOLD_DEEP, marginTop: 3 }}>
                  ◆ {a.receipt.provider} · ~${a.receipt.costNzd.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function GalleryThumb({ a }: { a: Asset }) {
  const dl = (ext: string) => {
    const el = document.createElement("a");
    el.href = a.url;
    el.download = `auaha-${a.kind}-${a.id}.${ext}`;
    el.click();
  };
  if (a.kind === "image")
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.url} alt={a.caption} onClick={() => dl("png")} style={{ width: "100%", display: "block", cursor: "pointer" }} title="Download" />;
  if (a.kind === "video")
    return <video src={a.url} muted loop onClick={() => dl("mp4")} onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()} onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()} style={{ width: "100%", display: "block", cursor: "pointer" }} />;
  if (a.kind === "podcast") return <div style={{ padding: 10 }}><audio src={a.url} controls style={{ width: "100%" }} /></div>;
  return <div style={{ padding: 10, fontSize: 11.5, color: INK, maxHeight: 120, overflow: "auto", whiteSpace: "pre-wrap" }}>{a.url.slice(0, 400)}</div>;
}

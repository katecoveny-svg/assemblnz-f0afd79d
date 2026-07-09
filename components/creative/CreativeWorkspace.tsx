"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Mārama cosmic canon ──────────────────────────────────────────────────────
const BG = "#09090F";
const CARD = "#0A0A13";
const GLASS = "rgba(18,18,34,0.62)";
const GLASS2 = "rgba(10,10,19,0.66)";
const INK = "#EDEBF5";
const MUT = "rgba(237,235,245,0.60)";
const FAINT = "rgba(237,235,245,0.34)";
const LINE = "rgba(255,255,255,0.08)";
const KOWHAI = "#D4A843";
const KOWHAI_L = "#F0D078";
const POUNAMU = "#3A7D6E";
const POUNAMU_L = "#5AADA0";
const disp = "'Helvetica Neue', Arial, 'Segoe UI', sans-serif";
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

// accent → lighter companion for the orb highlight
const ACCENT_L: Record<string, string> = {
  auaha: "#E7CC8E",
  prism: "#DFBE86",
  muse: "#D3B27E",
  flux: "#C2A473",
  verse: "#B49A6C",
};
const lighten = (slug: string) => ACCENT_L[slug] ?? KOWHAI_L;

let idc = 0;
const uid = () => `a${++idc}_${Math.round(performance.now())}`;

export function CreativeWorkspace({ agents }: { agents: SlimAgent[] }) {
  const interactive = agents.filter((a) => a.interactive);
  const roster = agents.filter((a) => !a.interactive);
  const [active, setActive] = useState<SlimAgent>(interactive[0]);
  const [gallery, setGallery] = useState<Asset[]>([]);
  const addAsset = useCallback((a: Asset) => setGallery((g) => [a, ...g]), []);

  return (
    <div className="auaha3d" style={{ position: "relative", minHeight: "100vh", background: `radial-gradient(1200px 700px at 50% -8%, #141225 0%, ${BG} 62%)`, color: INK, overflow: "hidden" }}>
      <Backdrop />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage: "url(/brand/creative-agency/pattern-studio.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
          opacity: 0.14,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "26px 24px 96px" }}>
        <BrandBar sessionCount={gallery.length} />

        <section style={{ textAlign: "center", margin: "34px 0 6px" }}>
          <p style={{ fontFamily: disp, fontWeight: 700, fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: FAINT, margin: "0 0 14px" }}>
            The creative kete · a studio in a chat
          </p>
          <h1 style={{ fontFamily: disp, fontWeight: 300, fontSize: "clamp(28px,4.8vw,52px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 auto", maxWidth: "18ch", textWrap: "balance" as const }}>
            Describe it once.{" "}
            <b style={{ fontWeight: 900, background: `linear-gradient(92deg, ${KOWHAI_L}, ${KOWHAI} 55%, ${POUNAMU_L})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Auaha assembles the whole thing.
            </b>
          </h1>
          <p style={{ color: MUT, fontSize: 15, lineHeight: 1.6, maxWidth: "58ch", margin: "16px auto 0" }}>
            Pick a maker, give it a brief. Muse writes it, Prism art-directs and generates it, Flux films it, Verse
            voices it — real models behind every panel, on-brand, yours to approve. Nothing publishes on its own.
          </p>
        </section>

        {/* console-in-place: orb selector + active stage live in one glass surface */}
        <ConsolePanel interactive={interactive} active={active} onPick={setActive} onAsset={addAsset} />

        {gallery.length > 0 && <SessionGallery gallery={gallery} />}

        <RosterStrip roster={roster} />

        <footer style={{ marginTop: 58, paddingTop: 24, borderTop: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <p style={{ margin: 0, color: FAINT, fontSize: 11.5, lineHeight: 1.7, maxWidth: "64ch" }}>
            <b style={{ color: MUT }}>Concept · demo.</b> AUAHA runs on real generation keys (Imagen · Gemini · Fal · ElevenLabs).
            A missing key returns a named panel, never a 500. Action dispatch stays off — nothing here publishes or emails on its own.
            Keys are never surfaced. Built in Aotearoa.
          </p>
          <div style={{ fontFamily: disp, fontWeight: 900, letterSpacing: "0.5em", fontSize: 13, color: MUT }}>AUAHA</div>
        </footer>
      </div>

      <style>{styles}</style>
    </div>
  );
}

// ── ambient backdrop: starfield canvas + drifting nebula orbs ─────────────────
function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cx = cv.getContext("2d");
    if (!cx) return;
    let W = 0, H = 0, t = 0, raf = 0;
    let stars: { x: number; y: number; r: number; o: number; s: number; ph: number }[] = [];
    const init = () => {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
      stars = Array.from({ length: 190 }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.2,
        o: Math.random() * 0.7 + 0.1, s: Math.random() * 2 + 0.4, ph: Math.random() * 7,
      }));
    };
    const draw = () => {
      cx.clearRect(0, 0, W, H);
      t += 0.016;
      for (const s of stars) {
        const b = (Math.sin(t * s.s + s.ph) + 1) / 2;
        const a = 0.1 + b * s.o * 0.9;
        cx.beginPath();
        cx.arc(s.x, s.y, s.r * (0.7 + b * 0.5), 0, 7);
        cx.fillStyle = `rgba(235,238,250,${a})`;
        cx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    init();
    draw();
    addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", init); };
  }, []);
  return (
    <>
      <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div className="orb" style={{ width: 420, height: 300, top: -40, left: -30, background: "radial-gradient(circle, rgba(212,168,67,0.10), transparent 70%)", ["--d" as string]: "17s" }} />
      <div className="orb" style={{ width: 360, height: 360, top: 320, right: -70, background: "radial-gradient(circle, rgba(58,125,110,0.09), transparent 70%)", ["--d" as string]: "21s", ["--del" as string]: "-4s" }} />
      <div className="orb" style={{ width: 300, height: 300, bottom: 120, left: "8%", background: "radial-gradient(circle, rgba(58,106,156,0.08), transparent 70%)", ["--d" as string]: "19s", ["--del" as string]: "-8s" }} />
    </>
  );
}

function BrandBar({ sessionCount }: { sessionCount: number }) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", padding: "13px 20px", border: `1px solid ${LINE}`, borderRadius: 18, background: `linear-gradient(180deg, ${GLASS}, ${GLASS2})`, backdropFilter: "blur(14px)", boxShadow: "0 20px 60px -30px rgba(0,0,0,0.9)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <ConstellationMark />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: disp, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: KOWHAI_L, opacity: 0.85 }}>Assembl · Auaha Creative Pack</span>
          <span className="wm" style={{ fontFamily: disp, fontWeight: 900, fontSize: 22, letterSpacing: "0.5em", textTransform: "uppercase" }}>Auaha</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Chip dot={POUNAMU_L}>5 makers live</Chip>
        <Chip dot={KOWHAI}>20 gens / hour</Chip>
        <Chip dot="#C6784E">Dispatch off</Chip>
        {sessionCount > 0 ? <Chip>{sessionCount} this session</Chip> : <Chip>Mana receipt on every output</Chip>}
      </div>
    </header>
  );
}

function Chip({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10.5, letterSpacing: "0.02em", color: MUT, padding: "6px 11px", border: `1px solid ${LINE}`, borderRadius: 999, background: "rgba(255,255,255,0.02)" }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, boxShadow: `0 0 8px ${dot}` }} />}
      {children}
    </span>
  );
}

function ConstellationMark() {
  return (
    <svg className="mark" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="ag" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#F0D078" /><stop offset="50%" stopColor="#D4A843" /><stop offset="100%" stopColor="#8B6020" /></radialGradient>
        <radialGradient id="ap" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#7ACFC2" /><stop offset="50%" stopColor="#3A7D6E" /><stop offset="100%" stopColor="#1E5044" /></radialGradient>
        <radialGradient id="apl" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#5AADA0" /><stop offset="50%" stopColor="#2E6B5E" /><stop offset="100%" stopColor="#153D35" /></radialGradient>
        <radialGradient id="ahi" cx="35%" cy="30%" r="28%"><stop offset="0%" stopColor="#fff" stopOpacity="0.6" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id="al" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D4A843" stopOpacity="0.6" /><stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.55" /></linearGradient>
      </defs>
      <line x1="18" y1="8" x2="8" y2="26" stroke="url(#al)" strokeWidth="1.2" />
      <line x1="18" y1="8" x2="28" y2="26" stroke="url(#al)" strokeWidth="1.2" />
      <line x1="8" y1="26" x2="28" y2="26" stroke="url(#al)" strokeWidth="1.2" />
      <circle cx="18" cy="8" r="4.5" fill="url(#ag)" /><circle cx="18" cy="8" r="4.5" fill="url(#ahi)" />
      <circle cx="8" cy="26" r="4.5" fill="url(#ap)" /><circle cx="8" cy="26" r="4.5" fill="url(#ahi)" />
      <circle cx="28" cy="26" r="4.5" fill="url(#apl)" /><circle cx="28" cy="26" r="4.5" fill="url(#ahi)" />
    </svg>
  );
}

// ── the console: agent orbs + the active stage, all in one glass surface ──────
function ConsolePanel({
  interactive,
  active,
  onPick,
  onAsset,
}: {
  interactive: SlimAgent[];
  active: SlimAgent;
  onPick: (a: SlimAgent) => void;
  onAsset: (a: Asset) => void;
}) {
  return (
    <div style={{ position: "relative", margin: "30px auto 0", maxWidth: 940, border: `1px solid rgba(212,168,67,0.24)`, borderRadius: 24, background: `linear-gradient(180deg, rgba(24,24,44,0.72), ${GLASS2})`, backdropFilter: "blur(16px)", boxShadow: "0 40px 90px -44px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 60px -24px rgba(212,168,67,0.32)", padding: "22px 22px 24px" }}>
      {/* orb selector */}
      <div className="orbrow" style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,3vw,30px)", flexWrap: "wrap", paddingBottom: 20, borderBottom: `1px solid ${LINE}`, marginBottom: 20 }}>
        {interactive.map((a, i) => {
          const on = a.slug === active.slug;
          return (
            <button
              key={a.slug}
              onClick={() => onPick(a)}
              className={`orbbtn${on ? " on" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: 0 }}
              aria-pressed={on}
            >
              <span
                className="orb3"
                style={{
                  ["--a" as string]: a.accent,
                  ["--al" as string]: lighten(a.slug),
                  ["--bdel" as string]: `${-i * 0.6}s`,
                  width: 58, height: 58, borderRadius: "50%", position: "relative", display: "grid", placeItems: "center",
                  background: `radial-gradient(circle at 36% 30%, ${lighten(a.slug)}, ${a.accent} 52%, #2a1f0a 100%)`,
                  boxShadow: on
                    ? `0 0 0 2px ${a.accent}, 0 0 0 6px rgba(212,168,67,0.14), 0 12px 30px -8px rgba(0,0,0,0.8), 0 0 34px -2px ${a.accent}`
                    : `0 0 0 1px rgba(255,255,255,0.12), 0 12px 30px -12px rgba(0,0,0,0.8), 0 0 26px -6px ${a.accent}`,
                  transform: on ? "translateY(-4px) scale(1.06)" : "none",
                  transition: "transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s",
                }}
              >
                <span style={{ position: "relative", zIndex: 2, fontFamily: disp, fontWeight: 900, fontSize: 19, color: "#140f04", textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}>{a.name[0]}</span>
              </span>
              <span style={{ fontFamily: disp, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: on ? INK : MUT }}>{a.name}</span>
              <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: FAINT }}>{a.role}</span>
            </button>
          );
        })}
      </div>

      {/* active maker header + stage */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: disp, fontWeight: 900, fontSize: 22, letterSpacing: "0.01em", margin: 0 }}>{active.name}</h2>
          <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: active.accent }}>{active.role}</span>
        </div>
        <p style={{ fontSize: 13, color: MUT, maxWidth: "62ch", margin: "6px 0 0", lineHeight: 1.6 }}>{active.blurb}</p>
      </div>

      <AgentStage key={active.slug} agent={active} onAsset={onAsset} />
    </div>
  );
}

// ── the stage switches on agent kind (logic preserved) ───────────────────────
function AgentStage({ agent, onAsset }: { agent: SlimAgent; onAsset: (a: Asset) => void }) {
  return (
    <div style={{ marginTop: 14 }}>
      {agent.kind === "image" && <ImageStage agent={agent} onAsset={onAsset} />}
      {agent.kind === "video" && <VideoStage agent={agent} onAsset={onAsset} />}
      {agent.kind === "podcast" && <PodcastStage agent={agent} onAsset={onAsset} />}
      {(agent.kind === "copy" || agent.kind === "orchestrate") && <ChatStage agent={agent} onAsset={onAsset} />}
    </div>
  );
}

// Shared honest-error / not-configured panel (dark)
function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  const warn = tone === "warn";
  return (
    <div style={{ border: `1px solid ${warn ? "rgba(212,168,67,0.42)" : LINE}`, background: warn ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.02)", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: warn ? KOWHAI_L : MUT, marginTop: 12, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Raw photo / clip dropzone for Prism + Flux social pipelines. */
function MediaUpload({
  accept,
  label,
  preview,
  onChange,
}: {
  accept: string;
  label: string;
  preview: string | null;
  onChange: (dataUrl: string | null, file: File | null) => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minHeight: 88,
          borderRadius: 14,
          border: `1px dashed rgba(212,168,67,0.45)`,
          background: "rgba(212,168,67,0.06)",
          cursor: "pointer",
          padding: 14,
          textAlign: "center",
        }}
      >
        <input
          type="file"
          accept={accept}
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0] ?? null;
            if (!f) {
              onChange(null, null);
              return;
            }
            if (f.size > 12 * 1024 * 1024) {
              onChange(null, null);
              return;
            }
            onChange(await fileToDataUrl(f), f);
          }}
        />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: KOWHAI_L }}>{label}</span>
        <span style={{ fontSize: 11, color: FAINT }}>Raw upload → social still / reel · max 12MB</span>
      </label>
      {preview ? (
        <div style={{ marginTop: 10, position: "relative" }}>
          {preview.startsWith("data:video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={preview} controls style={{ width: "100%", maxHeight: 180, borderRadius: 12, border: `1px solid ${LINE}`, objectFit: "cover" }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Reference upload" style={{ width: "100%", maxHeight: 180, borderRadius: 12, border: `1px solid ${LINE}`, objectFit: "cover" }} />
          )}
          <button
            type="button"
            onClick={() => onChange(null, null)}
            style={{ marginTop: 6, fontSize: 11, color: FAINT, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            clear upload
          </button>
        </div>
      ) : null}
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
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
        placeholder={placeholder}
        rows={2}
        className="brief"
        style={{ flex: 1, resize: "vertical", border: `1px solid ${LINE}`, borderRadius: 13, padding: "12px 14px", fontSize: 13.5, fontFamily: "inherit", background: "rgba(9,9,15,0.7)", color: INK, lineHeight: 1.5 }}
      />
      <button
        onClick={send}
        disabled={busy}
        style={{ alignSelf: "stretch", padding: "0 20px", borderRadius: 13, border: "none", background: busy ? "rgba(255,255,255,0.06)" : `linear-gradient(180deg, ${KOWHAI_L}, ${KOWHAI})`, color: busy ? FAINT : "#1a1406", fontFamily: disp, fontWeight: 900, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: busy ? "default" : "pointer", whiteSpace: "nowrap", boxShadow: busy ? "none" : "0 12px 30px -14px rgba(212,168,67,0.7), inset 0 1px 0 rgba(255,255,255,0.5)" }}
      >
        {busy ? "…" : cta}
      </button>
    </div>
  );
}

function Starters({ items, busy, onPick }: { items: string[]; busy: boolean; onPick: (s: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {items.map((s) => (
        <button key={s} onClick={() => onPick(s)} disabled={busy} className="seed"
          style={{ fontFamily: mono, fontSize: 11, padding: "6px 12px", borderRadius: 999, border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.02)", color: MUT, cursor: busy ? "default" : "pointer" }}>
          {s}
        </button>
      ))}
    </div>
  );
}

function ReceiptChip({ r }: { r: Receipt }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10.5, color: MUT, marginTop: 8, lineHeight: 1.5 }}>
      <span style={{ color: KOWHAI_L }}>◆ mana receipt</span> · {r.provider} · {r.model}
      {r.spec ? ` · ${r.spec}` : ""} · ~${r.costNzd.toFixed(2)} est.
      <br />
      <span style={{ color: FAINT }}>{r.trust}</span>
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
  const [refUrl, setRefUrl] = useState<string | null>(null);

  const run = async (brief: string) => {
    setBusy(true); setErr(null); setNc(null); setLastBrief(brief);
    try {
      const res = await fetch("/api/creative/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: refUrl
            ? `${brief}\n\nSocial still from uploaded reference — keep subject, invent on-brand framing.`
            : brief,
          agent: agent.slug,
          count: 4,
          aspectRatio: "1:1",
          referenceDataUrl: refUrl ?? undefined,
        }),
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
      <MediaUpload
        accept="image/*"
        label="Upload a raw photo for social stills"
        preview={refUrl}
        onChange={(url) => setRefUrl(url)}
      />
      <Composer placeholder="Describe the shot — or upload a photo and steer: 'Instagram 4:5, warmer, crop tighter'" cta="Generate ×4" busy={busy} onSend={run} />
      {!lastBrief && <Starters busy={busy} onPick={run} items={["Editorial hero of a kōwhai branch at dawn, Aotearoa light.", "Instagram still from this upload — navy training-field mood.", "Product still for a Wellington gin, botanical, low key."]} />}
      {lastBrief && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {["more editorial", "warmer", "darker, add fog", "wider crop", "9:16 story crop"].map((q) => (
            <button key={q} onClick={() => run(`${lastBrief} — ${q}`)} disabled={busy} className="seed"
              style={{ fontFamily: mono, fontSize: 11, padding: "6px 12px", borderRadius: 999, border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.02)", color: MUT, cursor: busy ? "default" : "pointer" }}>
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
              <img key={i} src={src} alt={`variation ${i + 1}`} style={{ width: "100%", borderRadius: 12, border: `1px solid ${LINE}` }} />
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
  const [started, setStarted] = useState(false);
  const [refUrl, setRefUrl] = useState<string | null>(null);

  const run = async (brief: string) => {
    setBusy(true); setErr(null); setNc(null); setVideo(null); setStarted(true); setStatus("Flux is framing the shot…");
    try {
      const res = await fetch("/api/creative/video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: refUrl
            ? `${brief}\n\nImage-to-video / edit from the uploaded reference. Hook in 2s. Social reel energy.`
            : brief,
          aspectRatio: "9:16",
          referenceDataUrl: refUrl ?? undefined,
        }),
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
      <MediaUpload
        accept="image/*,video/*"
        label="Upload a raw photo or clip for the reel"
        preview={refUrl}
        onChange={(url) => setRefUrl(url)}
      />
      <Composer placeholder="Describe the 15s reel — or upload footage and steer the cut. e.g. 'hook on the leash reset, soft blush grade'" cta="Film it" busy={busy} onSend={run} />
      {!started && <Starters busy={busy} onPick={run} items={["One unbroken push through a misty rimu forest into first light.", "9:16 reel from this upload — hook in 2 seconds.", "Golden-hour dolly across an Auckland rooftop bar."]} />}
      {busy && <Notice>{status}</Notice>}
      {nc && <Notice tone="warn">Video is not configured. Set <b>{nc.envVar}</b> (Fal Kling) or GEMINI_API_KEY (Veo). {nc.detail}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}
      {video && (
        <div style={{ marginTop: 16 }}>
          <video src={video} controls style={{ width: "100%", borderRadius: 12, border: `1px solid ${LINE}` }} />
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
  const [started, setStarted] = useState(false);

  const run = async (topic: string) => {
    setBusy(true); setErr(null); setNc(null); setAudio(null); setScript(""); setStarted(true);
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
      {!started && <Starters busy={busy} onPick={run} items={["A 30-second warm NZ voice intro for a sustainability podcast.", "A 40-second welcome for a new café loyalty app."]} />}
      {busy && <Notice>Verse is writing the script and recording…</Notice>}
      {nc && <Notice tone="warn">Podcast voice is not configured. Set <b>{nc.envVar}</b> (or GEMINI_API_KEY for the Google TTS fallback). {nc.detail}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}
      {audio && (
        <div style={{ marginTop: 16 }}>
          <audio src={audio} controls style={{ width: "100%" }} />
          {script && <p style={{ fontSize: 13, color: INK, background: "rgba(9,9,15,0.7)", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", marginTop: 12, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{script}</p>}
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
    ? ["Full campaign for a switch-and-win energy offer.", "Launch package for a new Wellington café.", "Social pack from a raw session clip — reel + carousel + caption."]
    : ["Three headlines for a winter single-origin.", "A LinkedIn post announcing a pilot.", "Instagram carousel from this week's upload — educational, NZ voice."];

  return (
    <div>
      {msgs.length === 0 && <Starters busy={busy} onPick={run} items={starters} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%" }}>
            <div style={{
              background: m.role === "user" ? `linear-gradient(180deg, ${KOWHAI_L}, ${KOWHAI})` : "rgba(9,9,15,0.7)",
              color: m.role === "user" ? "#1a1406" : INK,
              border: m.role === "user" ? "none" : `1px solid ${LINE}`,
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

// ── SESSION GALLERY (below the console) ──────────────────────────────────────
function SessionGallery({ gallery }: { gallery: Asset[] }) {
  return (
    <section style={{ marginTop: 44 }}>
      <SectionHead num="01" title="This session · every output carries its receipt" lead="Everything you generate lands here — click to download; model, provider and cost sit under each, never the raw prompt." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {gallery.map((a) => (
          <div key={a.id} className="tile" style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: CARD, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <GalleryThumb a={a} />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.04em" }}>{a.agent} · {a.kind}</div>
              <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{a.caption}</div>
              {a.receipt && (
                <div style={{ fontFamily: mono, fontSize: 9.5, color: KOWHAI_L, marginTop: 4 }}>
                  ◆ {a.receipt.provider} · ~${a.receipt.costNzd.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
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
  return <div style={{ padding: 12, fontSize: 11.5, color: INK, maxHeight: 140, overflow: "auto", whiteSpace: "pre-wrap", background: "rgba(9,9,15,0.5)" }}>{a.url.slice(0, 400)}</div>;
}

// ── ROSTER STRIP ─────────────────────────────────────────────────────────────
function RosterStrip({ roster }: { roster: SlimAgent[] }) {
  if (roster.length === 0) return null;
  return (
    <section style={{ marginTop: 44 }}>
      <SectionHead num="02" title="The rest of the kete" lead="Real roster, not interactive chat surfaces in this build — they hold colour, cadence, social, events and formal writing across a campaign." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
        {roster.map((a) => (
          <div key={a.slug} className="rnode" style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${LINE}`, borderRadius: 14, padding: "13px 15px", background: "rgba(14,14,26,0.5)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flex: "none", display: "grid", placeItems: "center", background: "radial-gradient(circle at 34% 28%, #B79A6B, #8A7350 62%, #3a2f1a 100%)", fontFamily: disp, fontWeight: 900, fontSize: 12, color: "#140f04", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}>{a.name[0]}</div>
            <div>
              <h4 style={{ margin: 0, fontFamily: disp, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em" }}>{a.name}</h4>
              <p style={{ margin: "2px 0 0", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: FAINT }}>{a.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHead({ num, title, lead }: { num: string; title: string; lead: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.16em", color: KOWHAI, opacity: 0.8 }}>{num}</span>
        <span style={{ fontFamily: disp, fontWeight: 300, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", color: MUT }}>{title}</span>
        <span style={{ flex: 1, height: 1, background: LINE }} />
      </div>
      <p style={{ color: MUT, fontSize: 13.5, maxWidth: "62ch", margin: 0, lineHeight: 1.6 }}>{lead}</p>
    </div>
  );
}

const styles = `
  .auaha3d .wm{
    background:linear-gradient(92deg,#fff 0%,#fff 42%,${KOWHAI} 72%,${POUNAMU} 100%);
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
    filter:drop-shadow(0 0 14px rgba(212,168,67,.5)) drop-shadow(0 0 36px rgba(58,125,110,.22));
    animation:auaha-wm 5s ease-in-out infinite;
  }
  @keyframes auaha-wm{0%,100%{filter:drop-shadow(0 0 14px rgba(212,168,67,.55)) drop-shadow(0 0 36px rgba(212,168,67,.22))}50%{filter:drop-shadow(0 0 24px rgba(255,220,80,.9)) drop-shadow(0 0 64px rgba(212,168,67,.5))}}
  .auaha3d .mark{filter:drop-shadow(0 0 12px rgba(212,168,67,1)) drop-shadow(0 0 32px rgba(212,168,67,.55)) drop-shadow(0 0 64px rgba(240,208,120,.2));animation:auaha-mark 3s ease-in-out infinite}
  @keyframes auaha-mark{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  .auaha3d .orb3{animation:auaha-bob 4.8s ease-in-out infinite var(--bdel,0s)}
  @keyframes auaha-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .auaha3d .orbbtn.on .orb3{animation:none}
  .auaha3d .orb3::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.6),transparent 44%)}
  .auaha3d .orb{position:fixed;border-radius:50%;filter:blur(70px);z-index:1;pointer-events:none;animation:auaha-drift var(--d,16s) ease-in-out infinite var(--del,0s)}
  @keyframes auaha-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-16px) scale(1.08)}66%{transform:translate(-12px,10px) scale(.93)}}
  .auaha3d .brief:focus{outline:none;border-color:rgba(212,168,67,.5);box-shadow:0 0 0 3px rgba(212,168,67,.12)}
  .auaha3d .brief::placeholder{color:${FAINT}}
  .auaha3d .seed:hover{color:${INK};border-color:rgba(212,168,67,.4);background:rgba(212,168,67,.06)}
  .auaha3d .tile{transition:transform .2s ease,border-color .2s ease}
  .auaha3d .tile:hover{transform:translateY(-3px);border-color:rgba(212,168,67,.35)}
  .auaha3d .rnode{transition:.2s}
  .auaha3d .rnode:hover{border-color:rgba(138,115,80,.5);background:rgba(20,20,36,.6)}
  .auaha3d button:focus-visible{outline:2px solid ${KOWHAI};outline-offset:3px;border-radius:8px}
  @media (max-width:640px){.auaha3d .wm{font-size:18px;letter-spacing:.32em}}
  @media (prefers-reduced-motion:reduce){.auaha3d *{animation:none!important}}
`;

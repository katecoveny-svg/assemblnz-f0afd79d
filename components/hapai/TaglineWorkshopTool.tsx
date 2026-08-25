"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Download, Loader2, PenLine, Share2, Sparkles, Star, Trash2 } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { useToolGate } from "@/lib/hapai/use-tool-gate";

const SHORTLIST_STORAGE = "assembl-tagline-workshop-shortlist";

const STYLES = [
  { name: "Statement", hint: "declarative, full sentence" },
  { name: "Question", hint: "provocative, ends in ?" },
  { name: "Promise", hint: "what we will give you" },
  { name: "Verb-led", hint: "starts with an action word" },
  { name: "Metaphor", hint: "image or analogy" },
] as const;
const TONES = ["Quiet", "Bold", "Warm", "Editorial"] as const;
const PER_STYLE = [2, 3, 4] as const;

// The fixed assembl tagline may never surface as a candidate.
const RESERVED_TAGLINE = "mahi that earns its proof";

function isReserved(tagline: string) {
  return (
    tagline
      .toLowerCase()
      .replace(/[.!?…]+\s*$/, "")
      .trim() === RESERVED_TAGLINE
  );
}

type Groups = Record<string, { tagline: string }[]>;

// Shortlist store — localStorage-backed so the list survives reloads, exposed
// through useSyncExternalStore so hydration stays clean.
const EMPTY_SHORTLIST: string[] = [];
let shortlistCache: string[] | null = null;
const shortlistListeners = new Set<() => void>();

function readShortlist(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(SHORTLIST_STORAGE) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function getShortlistSnapshot(): string[] {
  if (shortlistCache === null) shortlistCache = readShortlist();
  return shortlistCache;
}

function subscribeShortlist(listener: () => void) {
  shortlistListeners.add(listener);
  return () => shortlistListeners.delete(listener);
}

function writeShortlist(next: string[]) {
  shortlistCache = next;
  try {
    localStorage.setItem(SHORTLIST_STORAGE, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep the in-memory list */
  }
  shortlistListeners.forEach((listener) => listener());
}

const labelClass = "font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]";
const textareaClass =
  "mt-1.5 min-h-[64px] w-full resize-y rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3f7373]";

export function TaglineWorkshopTool() {
  const [attributes, setAttributes] = useState("");
  const [audience, setAudience] = useState("");
  const [whatYouDo, setWhatYouDo] = useState("");
  const [styles, setStyles] = useState<string[]>(STYLES.map((style) => style.name));
  const [perStyle, setPerStyle] = useState<number>(3);
  const [tone, setTone] = useState<string>("Quiet");

  const [groups, setGroups] = useState<Groups>({});
  const [ranMeta, setRanMeta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const shortlist = useSyncExternalStore(
    subscribeShortlist,
    getShortlistSnapshot,
    () => EMPTY_SHORTLIST,
  );
  const gate = useToolGate("tagline-workshop");

  function toggleStyle(name: string) {
    setStyles((current) =>
      current.includes(name) ? current.filter((style) => style !== name) : [...current, name],
    );
  }

  function toggleShortlist(tagline: string) {
    writeShortlist(
      shortlist.includes(tagline)
        ? shortlist.filter((item) => item !== tagline)
        : [...shortlist, tagline],
    );
  }

  const canCompose =
    Boolean(attributes.trim() && audience.trim() && whatYouDo.trim()) && styles.length > 0 && !loading;

  async function compose() {
    setError("");
    setLoading(true);
    try {
      const response = await gate.fetch("/api/hapai/tagline-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributes: attributes.trim(),
          audience: audience.trim(),
          whatYouDo: whatYouDo.trim(),
          styles,
          perStyle,
          tone,
        }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not compose taglines just now.");
      const next: Groups = {};
      for (const [style, items] of Object.entries((data.groups ?? {}) as Groups)) {
        const clean = (Array.isArray(items) ? items : [])
          .map((item) => ({ tagline: String(item?.tagline ?? "").trim() }))
          .filter((item) => item.tagline && !isReserved(item.tagline))
          .slice(0, 4);
        if (clean.length) next[style] = clean;
      }
      if (!Object.keys(next).length) {
        throw new Error("No taglines returned. Try a little more source detail.");
      }
      setGroups(next);
      setRanMeta(`${styles.length} styles · ${perStyle} each · ${tone.toLowerCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compose taglines just now.");
    } finally {
      setLoading(false);
    }
  }

  function resetInputs() {
    setAttributes("");
    setAudience("");
    setWhatYouDo("");
    setError("");
  }

  async function copyTagline(tagline: string) {
    await navigator.clipboard.writeText(tagline);
    setCopied(tagline);
    setTimeout(() => setCopied((current) => (current === tagline ? "" : current)), 1600);
  }

  function downloadShortlist() {
    const blob = new Blob([shortlist.join("\n")], { type: "text/plain;charset=utf-8" });
    const date = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement("a");
    const url = URL.createObjectURL(blob);
    anchor.download = `tagline-shortlist-${date}.txt`;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <HapaiToolShell
      kicker="hapai · marketing"
      title="Tagline workshop."
      description="Generate tagline candidates across five styles, then shortlist the lines worth human review."
      toolPath="/hapai/tagline-workshop"
      shareTitle="Tagline workshop. — assembl"
      shareText="Generate tagline candidates across five styles, then shortlist the lines worth human review."
      posture="Draft language only. A human chooses and clears the final line."
      highlights={[
        {
          title: "share",
          body: "copy the link, email it, or embed it",
          icon: <Share2 className="h-5 w-5" aria-hidden />,
        },
        {
          title: "draft",
          body: "create the draft, then review before publishing",
          icon: <Sparkles className="h-5 w-5" aria-hidden />,
        },
        {
          title: "shortlist",
          body: "star the lines that land and download them as a .txt",
          icon: <PenLine className="h-5 w-5" aria-hidden />,
        },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid content-start gap-5">
          <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
            <label className="block">
              <span className={labelClass}>What do you stand for · 3-5 words or short phrases</span>
              <textarea
                className={textareaClass}
                maxLength={200}
                value={attributes}
                onChange={(event) => setAttributes(event.target.value)}
                placeholder="restrained, evidence-led, aotearoa-grounded"
              />
            </label>
            <label className="mt-4 block">
              <span className={labelClass}>Who is this for · 1-2 sentences</span>
              <textarea
                className={textareaClass}
                maxLength={300}
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="NZ operators who need useful agent workflows without a platform switch."
              />
            </label>
            <label className="mt-4 block">
              <span className={labelClass}>What you actually do · plain english</span>
              <textarea
                className={textareaClass}
                maxLength={400}
                value={whatYouDo}
                onChange={(event) => setWhatYouDo(event.target.value)}
                placeholder="we help nz teams run compliance workflows with agent assistance and named human review."
              />
            </label>
          </div>

          <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
            <p className={labelClass}>Styles to include</p>
            <div className="mt-2 grid gap-2">
              {STYLES.map((style) => (
                <label
                  key={style.name}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2 text-sm transition ${
                    styles.includes(style.name)
                      ? "border-[#3f7373] bg-[#eef4f4]"
                      : "border-[rgba(35,33,31,0.12)] bg-white hover:bg-[#f3f5f3]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={styles.includes(style.name)}
                    onChange={() => toggleStyle(style.name)}
                    className="h-4 w-4 shrink-0 accent-[#3f7373]"
                  />
                  <span className="text-[#313c42]">
                    {style.name} <span className="text-[12px] text-[#68766f]">· {style.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <p className={`mt-5 ${labelClass}`}>Candidates per style</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PER_STYLE.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={perStyle === value}
                  onClick={() => setPerStyle(value)}
                  className={`min-h-[40px] min-w-[52px] rounded-[10px] border px-3.5 text-sm transition ${
                    perStyle === value
                      ? "border-[#313c42] bg-[#313c42] text-white"
                      : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <p className={`mt-5 ${labelClass}`}>Tone</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TONES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={tone === value}
                  onClick={() => setTone(value)}
                  className={`min-h-[40px] rounded-[10px] border px-3.5 text-sm transition ${
                    tone === value
                      ? "border-[#313c42] bg-[#313c42] text-white"
                      : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={!canCompose}
                onClick={() => void compose()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#313c42] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden />
                )}
                Compose taglines
              </button>
              <button
                type="button"
                onClick={resetInputs}
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-5 text-sm text-[#313c42] transition hover:bg-[#f3f5f3]"
              >
                Reset
              </button>
              <span className="flex items-center">{gate.counter}</span>
            </div>
            {error ? <p className="mt-3 text-xs text-[#9A3412]">{error}</p> : null}
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]">
              Draft only · a human clears the final line
            </p>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-light text-[#313c42]">Candidates</h2>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#68766f]">
                {loading ? "composing…" : ranMeta || "ready"}
              </p>
            </div>
            {Object.keys(groups).length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-[#5A5550]">
                Describe the brand, choose the styles, and candidate taglines land here grouped by
                style. Star the ones worth keeping.
              </p>
            ) : (
              <div className="mt-4 grid gap-5">
                {Object.entries(groups).map(([style, items]) => (
                  <section key={style}>
                    <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#3f7373]">
                      {style}
                    </h3>
                    <div className="mt-2 grid gap-2.5">
                      {items.map((item) => {
                        const saved = shortlist.includes(item.tagline);
                        return (
                          <article
                            key={item.tagline}
                            className="rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white p-3.5"
                          >
                            <p className="text-sm leading-relaxed text-[#313c42]">{item.tagline}</p>
                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(35,33,31,0.08)] pt-2.5">
                              <p className="font-mono text-[12px] tracking-[0.12em] text-[#68766f]">
                                {item.tagline.length} chars
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleShortlist(item.tagline)}
                                  className={`inline-flex h-9 items-center gap-1.5 rounded-[8px] border px-3 font-mono text-[12px] transition ${
                                    saved
                                      ? "border-[#b8964f] bg-[#FBF3E2] text-[#8A5B10]"
                                      : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                                  }`}
                                >
                                  <Star
                                    className={`h-3.5 w-3.5 ${saved ? "fill-[#b8964f] text-[#b8964f]" : ""}`}
                                    aria-hidden
                                  />
                                  {saved ? "Saved" : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void copyTagline(item.tagline)}
                                  className={`inline-flex h-9 items-center gap-1.5 rounded-[8px] border px-3 font-mono text-[12px] transition ${
                                    copied === item.tagline
                                      ? "border-[#3f7373] bg-[#3f7373] text-white"
                                      : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                                  }`}
                                >
                                  {copied === item.tagline ? (
                                    <Check className="h-3.5 w-3.5" aria-hidden />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" aria-hidden />
                                  )}
                                  {copied === item.tagline ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
            <h2 className="font-display text-xl font-light text-[#313c42]">
              Shortlist ({shortlist.length})
            </h2>
            {shortlist.length === 0 ? (
              <p className="mt-3 text-sm text-[#5A5550]">No saved taglines yet.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {shortlist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start justify-between gap-3 rounded-[8px] border border-[rgba(35,33,31,0.1)] bg-white px-3 py-2 text-sm text-[#313c42]"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => toggleShortlist(item)}
                      aria-label={`Remove "${item}" from shortlist`}
                      className="mt-0.5 shrink-0 text-[#68766f] transition hover:text-[#313c42]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={shortlist.length === 0}
                onClick={downloadShortlist}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-4 text-sm text-[#313c42] transition hover:bg-[#f3f5f3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download as .txt
              </button>
              <button
                type="button"
                disabled={shortlist.length === 0}
                onClick={() => writeShortlist([])}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-4 text-sm text-[#313c42] transition hover:bg-[#f3f5f3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear shortlist
              </button>
            </div>
          </aside>
        </div>
      </div>
      {gate.modal}
    </HapaiToolShell>
  );
}

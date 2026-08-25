"use client";

import { useState } from "react";
import { Check, Copy, Loader2, MessageSquareText, RefreshCw, Share2, Sparkles } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { useToolGate } from "@/lib/hapai/use-tool-gate";

const PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook"] as const;
const TONES = ["Founder voice", "Brand voice", "Casual", "Professional"] as const;
const LENGTHS = [
  { value: "short", label: "Short · 120", maxChars: 120 },
  { value: "medium", label: "Medium · 280", maxChars: 280 },
  { value: "long", label: "Long · 2000", maxChars: 2000 },
] as const;
const HASHTAG_COUNTS = ["0", "3", "5", "10"] as const;

type Variant = { caption: string };

function hashtagCountOf(text: string) {
  return (text.match(/(^|\s)#[\p{L}\p{N}_-]+/gu) || []).length;
}

const labelClass = "font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]";

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-[40px] rounded-[10px] border px-3.5 text-sm transition ${
            value === option.value
              ? "border-[#313c42] bg-[#313c42] text-white"
              : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function CaptionComposerTool() {
  const [source, setSource] = useState("");
  const [platform, setPlatform] = useState<string>("LinkedIn");
  const [tone, setTone] = useState<string>("Founder voice");
  const [length, setLength] = useState<string>("medium");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState<string>("0");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [ranMeta, setRanMeta] = useState("");
  const [variation, setVariation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const gate = useToolGate("caption-composer");

  const canCompose = source.trim().length >= 8 && !loading;
  const maxChars = LENGTHS.find((option) => option.value === length)?.maxChars ?? 280;

  async function compose(regenerate: boolean) {
    setError("");
    setLoading(true);
    const pass = regenerate ? variation + 1 : 1;
    try {
      const response = await gate.fetch("/api/hapai/caption-composer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.trim(),
          platform,
          tone,
          length,
          cta: cta.trim(),
          hashtagCount: hashtags,
          variation: pass,
        }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not compose captions just now.");
      const clean = (Array.isArray(data.variants) ? data.variants : [])
        .map((item: { caption?: string }) => ({ caption: String(item?.caption ?? "").trim() }))
        .filter((item: Variant) => item.caption)
        .slice(0, 5);
      if (!clean.length) throw new Error("No captions returned. Try a little more source detail.");
      setVariants(clean);
      setVariation(pass);
      setRanMeta(`${platform} · ${tone.toLowerCase()} · ${maxChars} chars max`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compose captions just now.");
    } finally {
      setLoading(false);
    }
  }

  async function copyVariant(index: number) {
    await navigator.clipboard.writeText(variants[index].caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1300);
  }

  return (
    <HapaiToolShell
      kicker="hapai · marketing"
      title="Caption composer."
      description="Draft LinkedIn, Instagram, X, and Facebook captions tuned to each platform's rhythm."
      toolPath="/hapai/caption-composer"
      shareTitle="Caption composer. — assembl"
      shareText="Draft LinkedIn, Instagram, X, and Facebook captions tuned to each platform's rhythm."
      posture="Draft captions only. Check claims, permissions, and platform fit before posting."
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
          title: "platform fit",
          body: "each variant follows the platform's length and hashtag habits",
          icon: <MessageSquareText className="h-5 w-5" aria-hidden />,
        },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
          <label className="block">
            <span className={labelClass}>Source content · 2-3 sentences</span>
            <textarea
              className="mt-1.5 min-h-[140px] w-full resize-y rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3f7373]"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Paste the product, event, announcement, or update you are posting about."
            />
          </label>

          <p className={`mt-4 ${labelClass}`}>Platform</p>
          <ChipRow
            options={PLATFORMS.map((value) => ({ value, label: value }))}
            value={platform}
            onChange={setPlatform}
          />

          <p className={`mt-4 ${labelClass}`}>Tone</p>
          <ChipRow
            options={TONES.map((value) => ({ value, label: value }))}
            value={tone}
            onChange={setTone}
          />

          <p className={`mt-4 ${labelClass}`}>Length</p>
          <ChipRow options={LENGTHS} value={length} onChange={setLength} />

          <label className="mt-4 block">
            <span className={labelClass}>Call-to-action · optional</span>
            <input
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 text-sm outline-none focus:border-[#3f7373]"
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="Book a pilot, read more, join us"
            />
          </label>

          <p className={`mt-4 ${labelClass}`}>Hashtag count</p>
          <ChipRow
            options={HASHTAG_COUNTS.map((value) => ({ value, label: value === "0" ? "None" : value }))}
            value={hashtags}
            onChange={setHashtags}
          />

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!canCompose}
              onClick={() => void compose(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#313c42] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Compose captions
            </button>
            <button
              type="button"
              disabled={!canCompose || variants.length === 0}
              onClick={() => void compose(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-5 text-sm text-[#313c42] transition hover:bg-[#f3f5f3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Regenerate
            </button>
            <span className="flex items-center">{gate.counter}</span>
          </div>
          {error ? <p className="mt-3 text-xs text-[#9A3412]">{error}</p> : null}
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[#68766f]">
            Draft only · check claims before posting
          </p>
        </div>

        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-light text-[#313c42]">Variants</h2>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#68766f]">
              {loading ? "composing…" : ranMeta || "waiting for source content"}
            </p>
          </div>
          {variants.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-[#5A5550]">
              Paste what you are posting about, pick the platform and tone, and up to five caption
              drafts land here with character and hashtag counts.
            </p>
          ) : (
            <div className="mt-4 grid gap-3.5">
              {variants.map((variant, index) => (
                <article
                  key={`${variation}-${index}`}
                  className="rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white p-4"
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#313c42]">
                    {variant.caption}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(35,33,31,0.1)] pt-3">
                    <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[#68766f]">
                      {variant.caption.length} chars · {hashtagCountOf(variant.caption)} hashtags
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyVariant(index)}
                      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border px-3.5 font-mono text-[12px] transition ${
                        copiedIndex === index
                          ? "border-[#3f7373] bg-[#3f7373] text-white"
                          : "border-[rgba(35,33,31,0.14)] bg-white text-[#313c42] hover:bg-[#f3f5f3]"
                      }`}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {copiedIndex === index ? "Copied" : "Copy"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {gate.modal}
    </HapaiToolShell>
  );
}

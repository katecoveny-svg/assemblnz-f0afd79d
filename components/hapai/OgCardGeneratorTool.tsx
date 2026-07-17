"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, RotateCcw, Sparkles } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { coverDraw, hexToRgba, loadCampaignImage, wrapLines } from "@/components/ad-studio/compose";

const BRAND_NAME = "assembl";

const ACCENTS = [
  { value: "waihanga", label: "Waihanga", detail: "pounamu", colour: "#3f7373" },
  { value: "manaaki", label: "Manaaki", detail: "kōkōwai", colour: "#3f7373" },
  { value: "pikau", label: "Pīkau", detail: "kikorangi", colour: "#3B7CB5" },
  { value: "arataki", label: "Arataki", detail: "karaka", colour: "#D4842A" },
  { value: "auaha", label: "Auaha", detail: "kahurangi", colour: "#5B4FA0" },
  { value: "ako", label: "Ako", detail: "parauri", colour: "#6B5843" },
  { value: "matauranga", label: "Mātauranga", detail: "pōuriuri", colour: "#3D5A7A" },
  { value: "hoko", label: "Hoko", detail: "waiporoporo", colour: "#7B3F8F" },
  { value: "toro", label: "Tōro", detail: "mangū", colour: "#313c42" },
  { value: "custom", label: "Custom", detail: "colour picker", colour: "#3f7373" },
] as const;

const VESSELS = [
  { value: "none", label: "No vessel", src: "" },
  { value: "waihanga", label: "Waihanga vessel", src: "/img/kete/waihanga-vessel-square.jpg" },
  { value: "manaaki", label: "Manaaki vessel", src: "/img/kete/manaaki-vessel-warm-square.jpg" },
  { value: "pikau", label: "Pīkau vessel", src: "/img/kete/pikau-vessel-blue-square.jpg" },
  { value: "arataki", label: "Arataki vessel", src: "/img/kete/arataki-vessel-amber-square.jpg" },
  { value: "auaha", label: "Auaha vessel", src: "/img/kete/auaha-vessel-purple-square.jpg" },
  { value: "ako", label: "Ako vessel", src: "/img/kete/ako-vessel-amber.jpg" },
  { value: "matauranga", label: "Mātauranga vessel", src: "/img/kete/matauranga-vessel-tall.jpg" },
  { value: "hoko", label: "Hoko vessel", src: "/img/kete/hoko-vessel-violet.jpg" },
  { value: "toro", label: "Tōro vessel", src: "/img/kete/toro-vessel-charcoal.jpg" },
] as const;

const LAYOUTS = [
  { value: "left", label: "Left-aligned", detail: "text on left, vessel on right" },
  { value: "centre", label: "Centred", detail: "text centred, vessel behind" },
  { value: "right", label: "Right-aligned", detail: "text on right, vessel on left" },
] as const;

const WORDMARKS = [
  { value: "top-left", label: "Top-left" },
  { value: "top-right", label: "Top-right" },
  { value: "bottom-left", label: "Bottom-left" },
  { value: "hide", label: "Hide wordmark" },
] as const;

const DEFAULTS = {
  headline: "Adoption tools that lift your team.",
  subline: "single-purpose tools · no prompting · no platform switch",
  eyebrow: "built in aotearoa · hapai",
  accent: "waihanga",
  customAccent: "#3f7373",
  vessel: "waihanga",
  layout: "left",
  wordmark: "top-left",
} as const;

function slugify(value: string) {
  return (
    (value || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "untitled"
  );
}

function wordmarkPosition(pos: string): [number, number, CanvasTextAlign] {
  if (pos === "top-right") return [1120, 70, "right"];
  if (pos === "bottom-left") return [80, 570, "left"];
  return [80, 70, "left"];
}

const labelClass = "font-mono text-[10px] uppercase tracking-[0.16em] text-[#68766f]";
const inputClass =
  "mt-1.5 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 text-sm outline-none focus:border-[#3f7373]";
const cardClass = "rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5";

function RadioStack<T extends { value: string; label: string }>({
  name,
  options,
  value,
  onChange,
  detailOf,
  swatchOf,
}: {
  name: string;
  options: readonly T[];
  value: string;
  onChange: (value: string) => void;
  detailOf?: (option: T) => string;
  swatchOf?: (option: T) => string;
}) {
  return (
    <div className="mt-2 grid gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-sm transition ${
            value === option.value
              ? "border-[#3f7373] bg-[#eef4f4]"
              : "border-[rgba(35,33,31,0.12)] bg-white hover:bg-[#f3f5f3]"
          }`}
        >
          {swatchOf ? (
            <span
              aria-hidden
              className="h-6 w-6 shrink-0 rounded-full border border-[rgba(35,33,31,0.18)]"
              style={{ background: swatchOf(option) }}
            />
          ) : null}
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 shrink-0 accent-[#3f7373]"
          />
          <span className="flex w-full flex-wrap items-baseline justify-between gap-x-2 text-[#313c42]">
            <span>{option.label}</span>
            {detailOf ? <small className="text-[11px] text-[#68766f]">{detailOf(option)}</small> : null}
          </span>
        </label>
      ))}
    </div>
  );
}

export function OgCardGeneratorTool() {
  const [headline, setHeadline] = useState<string>(DEFAULTS.headline);
  const [subline, setSubline] = useState<string>(DEFAULTS.subline);
  const [eyebrow, setEyebrow] = useState<string>(DEFAULTS.eyebrow);
  const [accent, setAccent] = useState<string>(DEFAULTS.accent);
  const [customAccent, setCustomAccent] = useState<string>(DEFAULTS.customAccent);
  const [vessel, setVessel] = useState<string>(DEFAULTS.vessel);
  const [layout, setLayout] = useState<string>(DEFAULTS.layout);
  const [wordmark, setWordmark] = useState<string>(DEFAULTS.wordmark);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCache = useRef(new Map<string, Promise<HTMLImageElement>>());
  const renderToken = useRef(0);

  const loadVessel = useCallback((src: string) => {
    const cached = imageCache.current.get(src);
    if (cached) return cached;
    const promise = loadCampaignImage(src);
    imageCache.current.set(src, promise);
    return promise;
  }, []);

  const renderCard = useCallback(async () => {
    const token = ++renderToken.current;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const head = headline.trim() || "Your headline here.";
    const sub = subline.trim();
    const eye = eyebrow.trim();
    const accentHex =
      accent === "custom"
        ? customAccent
        : ACCENTS.find((option) => option.value === accent)?.colour ?? "#3f7373";
    const vesselSrc = VESSELS.find((option) => option.value === vessel)?.src ?? "";

    let img: HTMLImageElement | null = null;
    if (vesselSrc) {
      try {
        img = await loadVessel(vesselSrc);
      } catch {
        img = null;
      }
    }
    if (token !== renderToken.current) return; // a newer render superseded this one

    canvas.width = 1200;
    canvas.height = 630;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = hexToRgba(accentHex, 0.08);
    ctx.fillRect(0, 0, 1200, 12);

    if (img) {
      const size = layout === "centre" ? 520 : 480;
      const vx = layout === "left" ? 1200 - size - 80 : layout === "right" ? 80 : (1200 - size) / 2;
      const vy = (630 - size) / 2;
      ctx.save();
      ctx.globalAlpha = layout === "centre" ? 0.25 : 0.88;
      ctx.beginPath();
      ctx.rect(vx, vy, size, size);
      ctx.clip();
      ctx.translate(vx, vy);
      coverDraw(ctx, img, size, size);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    const align: CanvasTextAlign = layout === "centre" ? "center" : layout === "right" ? "right" : "left";
    const tx = layout === "left" ? 80 : layout === "right" ? 1120 : 600;
    const maxWidth = layout === "centre" ? 760 : 620;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";

    if (eye) {
      ctx.fillStyle = accentHex;
      ctx.font = '600 14px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(eye.toUpperCase(), tx, 178);
    }

    ctx.fillStyle = accentHex;
    ctx.font = 'italic 72px "Cormorant Garamond", Georgia, serif';
    const headLines = wrapLines(ctx, head, maxWidth).slice(0, 4);
    headLines.forEach((line, index) => ctx.fillText(line, tx, 280 + index * 78));
    const nextY = 280 + headLines.length * 78;

    if (sub) {
      ctx.fillStyle = "#5A5853";
      ctx.font = '20px "IBM Plex Mono", ui-monospace, monospace';
      const subLines = wrapLines(ctx, sub, maxWidth).slice(0, 4);
      const subY = Math.min(nextY + 18, 500);
      subLines.forEach((line, index) => ctx.fillText(line, tx, subY + index * 30));
    }

    if (wordmark !== "hide") {
      const [wmx, wmy, wma] = wordmarkPosition(wordmark);
      ctx.fillStyle = "#3f7373";
      ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = wma;
      ctx.fillText(BRAND_NAME, wmx, wmy);
    }
  }, [headline, subline, eyebrow, accent, customAccent, vessel, layout, wordmark, loadVessel]);

  // Live preview: debounce re-renders as inputs change.
  useEffect(() => {
    const timer = setTimeout(() => {
      void renderCard();
    }, 150);
    return () => clearTimeout(timer);
  }, [renderCard]);

  function downloadPng() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const anchor = document.createElement("a");
      const url = URL.createObjectURL(blob);
      anchor.download = `og-card-${slugify(headline)}.png`;
      anchor.href = url;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function resetForm() {
    setHeadline(DEFAULTS.headline);
    setSubline(DEFAULTS.subline);
    setEyebrow(DEFAULTS.eyebrow);
    setAccent(DEFAULTS.accent);
    setCustomAccent(DEFAULTS.customAccent);
    setVessel(DEFAULTS.vessel);
    setLayout(DEFAULTS.layout);
    setWordmark(DEFAULTS.wordmark);
  }

  return (
    <HapaiToolShell
      kicker="hapai · marketing"
      title="Share card maker."
      description="Make a branded share card for a link you're posting — headline, accent colour, vessel image, ready to download."
      toolPath="/hapai/og-card-generator"
      shareTitle="Share card maker. — assembl"
      shareText="Make a branded share card for a link you're posting — headline, accent colour, vessel image, ready to download."
      posture="Draft share cards only. Check copy, image rights, and brand fit before publishing."
      highlights={[
        {
          title: "share",
          body: "copy the link, email it, or embed it",
          icon: <Sparkles className="h-5 w-5" aria-hidden />,
        },
        {
          title: "draft",
          body: "create the draft, then review before publishing",
          icon: <ImageIcon className="h-5 w-5" aria-hidden />,
        },
        {
          title: "local",
          body: "cards render in your browser and download as png",
          icon: <Download className="h-5 w-5" aria-hidden />,
        },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid content-start gap-5">
          <div className={cardClass}>
            <label className="block">
              <span className={labelClass}>Headline</span>
              <input
                className={inputClass}
                type="text"
                maxLength={80}
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
              />
            </label>
            <label className="mt-4 block">
              <span className={labelClass}>Subline (optional)</span>
              <input
                className={inputClass}
                type="text"
                maxLength={120}
                value={subline}
                onChange={(event) => setSubline(event.target.value)}
              />
            </label>
            <label className="mt-4 block">
              <span className={labelClass}>Eyebrow (optional)</span>
              <input
                className={inputClass}
                type="text"
                maxLength={40}
                value={eyebrow}
                onChange={(event) => setEyebrow(event.target.value)}
              />
            </label>
          </div>

          <div className={cardClass}>
            <p className={labelClass}>Accent colour</p>
            <RadioStack
              name="accent"
              options={ACCENTS}
              value={accent}
              onChange={setAccent}
              detailOf={(option) => option.detail}
              swatchOf={(option) => option.colour}
            />
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={customAccent}
                onChange={(event) => setCustomAccent(event.target.value)}
                aria-label="Custom accent colour"
                className="h-11 w-14 rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white p-1"
              />
              <p className="text-xs text-[#68766f]">Custom colour is used when custom is selected.</p>
            </div>
            <p className={`mt-6 ${labelClass}`}>Background vessel</p>
            <RadioStack
              name="vessel"
              options={VESSELS}
              value={vessel}
              onChange={setVessel}
              detailOf={(option) => (option.src ? "image background" : "paper background only")}
            />
          </div>

          <div className={cardClass}>
            <p className={labelClass}>Layout</p>
            <RadioStack
              name="layout"
              options={LAYOUTS}
              value={layout}
              onChange={setLayout}
              detailOf={(option) => option.detail}
            />
            <p className={`mt-6 ${labelClass}`}>Wordmark position</p>
            <RadioStack name="wordmark" options={WORDMARKS} value={wordmark} onChange={setWordmark} />
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void renderCard()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#313c42] px-5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Generate card
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-5 text-sm text-[#313c42] transition hover:bg-[#f3f5f3]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reset
              </button>
              <button
                type="button"
                onClick={downloadPng}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#3f7373] px-5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download PNG
              </button>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#68766f]">
              All cards render locally in your browser
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-[#f3f5f3] p-4">
            <div className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white">
              <canvas
                ref={canvasRef}
                width={1200}
                height={630}
                aria-label="Share card preview"
                className="block aspect-[1200/630] h-auto w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[11px] text-[#68766f]">
              <span>1200×630 png</span>
              <button
                type="button"
                onClick={downloadPng}
                className="min-h-[44px] text-[#3f7373] underline underline-offset-2 transition hover:opacity-80"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </HapaiToolShell>
  );
}

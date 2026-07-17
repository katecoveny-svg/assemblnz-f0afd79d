"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Download, ImageIcon, KeyRound } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import {
  composeFlags,
  composeForFal,
  composeFull,
} from "@/lib/vessel-studio/composePrompt";
import {
  activeFlagNegatives,
  activeNegatives,
  AR_OPTIONS,
  FAL_AR_MAP,
  getKete,
  KETE_OPTIONS,
  LIGHTING_OPTIONS,
  MOTION_OPTIONS,
  PRICE_REDUX,
  PRICE_TEXT,
  REF_MAX_BYTES,
  REF_VALID_TYPES,
  reduxAspectFor,
} from "@/lib/vessel-studio/keteOptions";
import {
  computeCrop,
  isExtremeCrop,
  loadImageFromFile,
  loadImageFromUrl,
  type FocalPoint,
} from "@/lib/vessel-studio/cropToFocal";
import { EXPORT_SIZES, fileNameFor } from "@/lib/vessel-studio/socialSizes";
import type {
  AspectRatio,
  LightingToken,
  MotionToken,
  ReferenceImage,
  VesselStudioState,
} from "@/lib/vessel-studio/types";

// ─── Video mode config — ported verbatim from the legacy standalone ─────────
const VIDEO_AR_OPTIONS = ["16:9", "9:16", "1:1"] as const;
const VIDEO_DURATION_OPTIONS = ["5s", "8s", "10s"] as const;
const VIDEO_CAMERA_MOTIONS = [
  { id: "slow orbit", clause: "Camera rotates 30 degrees clockwise over the duration." },
  { id: "static", clause: "Camera holds still." },
  { id: "gentle drift", clause: "Camera drifts slowly to the right." },
  { id: "slow push-in", clause: "Camera dollies slowly forward." },
] as const;
const VIDEO_MODELS = {
  kling2: { display: "Kling 2.0", price: 0.5, blurb: "best balance · ~$0.50", supportsI2V: true },
  veo3: { display: "Veo 3", price: 3.0, blurb: "google premium 1080p · ~$3.00", supportsI2V: false },
  hailuo: { display: "Hailuo 02", price: 0.3, blurb: "minimax · budget · ~$0.30", supportsI2V: true },
} as const;
type VideoModelKey = keyof typeof VIDEO_MODELS;
const VIDEO_NEGATIVES = [
  "text", "logos", "patterns", "carvings", "kowhaiwhai",
  "neon", "sci-fi", "people", "faces", "text overlays", "UI",
] as const;

// Video grammars — natural-prose cinematic descriptions, distinct from the
// still-life image grammars. Copied verbatim from the legacy standalone.
const KETE_VIDEO_GRAMMARS: Record<string, string> = {
  waihanga:
    "A slow cinematic orbit around a sculptural Waihanga evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent jade pounamu glass plates stacked horizontally in architectural rhythm, topped with a tilted cream stoneware pitched-roof element evoking a quiet home.",
  auaha:
    "A slow cinematic orbit around a sculptural Auaha evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent deep violet and dusty plum glass plates stacked at a dynamic tilt, topped with a raw-edged organic cream stoneware shell evoking creative motion.",
  arataki:
    "A slow cinematic orbit around a sculptural Arataki evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent amber and honey glass plates stacked with a forward lean, topped with a flowing cream stoneware spear-form evoking direction.",
  manaaki:
    "A slow cinematic orbit around a sculptural Manaaki evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent terracotta and warm rose glass plates stacked in soft hospitality rhythm, topped with a smooth cream stoneware dome evoking welcome and protection.",
  pikau:
    "A slow cinematic orbit around a sculptural Pīkau evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent cobalt and ice-blue glass plates stacked with a soft horizontal drift, topped with a flowing cream stoneware crescent evoking quiet movement.",
  hoko:
    "A slow cinematic orbit around a sculptural Hoko evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent mulberry and aubergine glass plates stacked horizontally, topped with a balanced cream stoneware ovoid form evoking exchange.",
  ako:
    "A slow cinematic orbit around a sculptural Ako evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent warm sepia and oak glass plates stacked with quiet stillness, topped with a contemplative cream stoneware orb evoking learning and reflection.",
  toro:
    "A slow cinematic orbit around a sculptural Tōro evidence vessel: cream stoneware ceramic base on a brushed-brass wire square display stand, layered translucent smoky charcoal and warm grey glass plates stacked horizontally, topped with a quiet cream stoneware oval evoking home.",
};

const LS_KEY = "assembl_fal_key";
const LS_HIST = "assembl_vessel_history";
const LS_REF = "assembl_vessel_reference";
const HIST_MAX = 12;

type GalleryCard = {
  id: string;
  prompt_full: string;
  prompt_to_fal: string;
  kete: string;
  ar: string;
  mode?: string;
  media_type?: "image" | "video";
  model?: string;
  duration?: string;
  camera?: string;
  had_reference?: boolean;
  image_url: string;
  generated_at: string;
};

// localStorage-backed stores exposed through useSyncExternalStore so hydration
// stays clean (same pattern as the tagline workshop shortlist).
function createLocalStore<T>(storageKey: string, decode: (raw: string | null) => T, serverValue: T) {
  let cache = serverValue;
  let hydrated = false;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): T {
      if (!hydrated) {
        let raw: string | null = null;
        try {
          raw = localStorage.getItem(storageKey);
        } catch {
          raw = null; // private mode / blocked storage
        }
        cache = decode(raw);
        hydrated = true;
      }
      return cache;
    },
    getServerSnapshot(): T {
      return serverValue;
    },
    set(value: T, encoded: string | null) {
      cache = value;
      hydrated = true;
      try {
        if (encoded === null) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, encoded);
      } catch (e) {
        // QuotaExceededError etc. — keep the in-memory value for this session
        console.warn("vessel studio: could not persist to localStorage:", e);
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const EMPTY_HISTORY: GalleryCard[] = [];

const keyStore = createLocalStore<string>(LS_KEY, (raw) => (raw || "").trim(), "");

const referenceStore = createLocalStore<ReferenceImage | null>(
  LS_REF,
  (raw) => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as ReferenceImage;
      return parsed?.dataUrl ? parsed : null;
    } catch {
      return null;
    }
  },
  null,
);

const historyStore = createLocalStore<GalleryCard[]>(
  LS_HIST,
  (raw) => {
    if (!raw) return EMPTY_HISTORY;
    try {
      const arr = JSON.parse(raw) as GalleryCard[];
      return Array.isArray(arr) ? arr.slice(0, HIST_MAX) : EMPTY_HISTORY;
    } catch {
      return EMPTY_HISTORY;
    }
  },
  EMPTY_HISTORY,
);

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function readAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("could not read file"));
    r.readAsDataURL(file);
  });
}

function videoEndpoint(model: VideoModelKey, hasReference: boolean): string {
  if (model === "kling2") {
    return hasReference
      ? "https://fal.run/fal-ai/kling-video/v2/master/image-to-video"
      : "https://fal.run/fal-ai/kling-video/v2/master/text-to-video";
  }
  if (model === "veo3") {
    // Veo 3 in this build uses text-to-video only.
    return "https://fal.run/fal-ai/veo3";
  }
  return hasReference
    ? "https://fal.run/fal-ai/minimax/hailuo-02/standard/image-to-video"
    : "https://fal.run/fal-ai/minimax/hailuo-02/standard/text-to-video";
}

function buildVideoBody(
  model: VideoModelKey,
  opts: { prompt: string; image_url: string | null; duration: string; aspect_ratio: string },
): Record<string, unknown> {
  const durationSec = parseInt(opts.duration, 10) || 8;
  const negativePrompt = VIDEO_NEGATIVES.join(", ");
  if (model === "kling2") {
    const body: Record<string, unknown> = {
      prompt: opts.prompt,
      duration: String(durationSec >= 10 ? 10 : 5), // Kling supports 5 or 10
      aspect_ratio: opts.aspect_ratio,
      cfg_scale: 0.5,
      negative_prompt: negativePrompt,
    };
    if (opts.image_url) body.image_url = opts.image_url;
    return body;
  }
  if (model === "veo3") {
    return {
      prompt: opts.prompt,
      aspect_ratio: opts.aspect_ratio,
      duration: `${durationSec}s`,
      negative_prompt: negativePrompt,
      generate_audio: false,
    };
  }
  const body: Record<string, unknown> = {
    prompt: opts.prompt,
    duration: String(durationSec >= 10 ? 10 : 6), // Hailuo standard supports 6 or 10
    prompt_optimizer: false,
    resolution: "1080p",
  };
  if (opts.image_url) body.image_url = opts.image_url;
  return body;
}

// Try a few common shapes Fal video models use to expose the result URL.
function extractVideoUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.video === "string") return d.video;
  if (d.video && typeof d.video === "object" && "url" in d.video) {
    return String((d.video as { url?: unknown }).url ?? "") || null;
  }
  if (Array.isArray(d.videos) && d.videos[0]) {
    const first = d.videos[0] as { url?: string } | string;
    return typeof first === "string" ? first : first.url ?? null;
  }
  const output = d.output as { video?: { url?: string } } | undefined;
  if (output?.video?.url) return output.video.url;
  if (typeof d.url === "string" && /\.(mp4|webm|mov)/i.test(d.url)) return d.url;
  return null;
}

async function extractErrorDetail(resp: Response): Promise<string> {
  let detail = `${resp.status} ${resp.statusText}`;
  try {
    const errBody = (await resp.json()) as Record<string, unknown> | null;
    if (errBody && (errBody.detail || errBody.message || errBody.error)) {
      const m = errBody.detail || errBody.message || errBody.error;
      detail = typeof m === "string" ? m : JSON.stringify(m);
    }
  } catch {
    // keep the status line
  }
  return detail.slice(0, 280);
}

async function downloadCardMedia(card: GalleryCard) {
  const isVideo = card.media_type === "video";
  try {
    const r = await fetch(card.image_url);
    const blob = await r.blob();
    const ts = Date.parse(card.generated_at) || Date.now();
    triggerDownload(blob, isVideo ? `assembl-${card.kete}-video-${ts}.mp4` : `assembl-${card.kete}-${ts}.jpg`);
  } catch {
    window.open(card.image_url, "_blank", "noopener");
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Crop → wordmark → jpeg blob. Every size export carries the brand, exactly as
// the legacy tool draws it (brand-all-exports).
function exportSizeBlob(
  img: HTMLImageElement,
  focal: FocalPoint,
  targetW: number,
  targetH: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const c = document.createElement("canvas");
    c.width = targetW;
    c.height = targetH;
    const ctx = c.getContext("2d");
    if (!ctx) return reject(new Error("canvas context unavailable"));
    ctx.imageSmoothingQuality = "high";
    const crop = computeCrop(img, focal, targetW, targetH);
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, targetW, targetH);
    const markSize = Math.max(18, Math.round(targetW * 0.024));
    const pad = Math.round(targetW * 0.03);
    ctx.font = `600 ${markSize}px 'Cormorant Garamond', Georgia, serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillText("assembl", targetW - pad + 1, targetH - pad + 1);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("assembl", targetW - pad, targetH - pad);
    c.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("blob generation failed"))),
      "image/jpeg",
      0.92,
    );
  });
}

function naturalPngBlob(img: HTMLImageElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const ctx = c.getContext("2d");
    if (!ctx) return reject(new Error("canvas context unavailable"));
    ctx.drawImage(img, 0, 0);
    c.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("blob generation failed"))),
      "image/png",
    );
  });
}

// ─── shared style tokens (pearl canon) ──────────────────────────────────────
const hairline = "border-[rgba(49,60,66,0.12)]";
const labelClass = "font-mono text-[10px] uppercase tracking-[0.16em] text-[#68766f]";
const cardClass = `rounded-[10px] border ${hairline} bg-white/70 p-5`;
const inputClass = `mt-1.5 h-11 w-full rounded-[10px] border ${hairline} bg-white px-3 font-mono text-[12.5px] text-[#313c42] outline-none focus:border-[#3f7373]`;
const chipOff = `border ${hairline} bg-white text-[#313c42] hover:bg-[#f3f5f3]`;
const chipOn = "border-[#313c42] bg-[#313c42] text-white";
const chipClass = "min-h-[36px] rounded-[8px] px-3 py-1.5 font-mono text-[12px] lowercase tracking-[0.06em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8964f]";
const smallBtn = `rounded-[8px] border ${hairline} bg-white px-3 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[#313c42] transition hover:bg-[#f3f5f3]`;

function ChipRow<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  titleOf,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  titleOf?: (option: T) => string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          title={titleOf?.(option)}
          onClick={() => onChange(option)}
          className={`${chipClass} ${value === option ? chipOn : chipOff}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// ─── Export modal ───────────────────────────────────────────────────────────
function ExportModal({
  image,
  sourceLabel,
  onClose,
}: {
  image: HTMLImageElement;
  sourceLabel: string;
  onClose: () => void;
}) {
  const [focal, setFocal] = useState<FocalPoint>({ x: 0.5, y: 0.5 });
  const [zipping, setZipping] = useState(false);
  const [warningMap, setWarningMap] = useState<Record<string, boolean>>({});
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRefs = useRef(new Map<string, HTMLCanvasElement>());
  const draggingRef = useRef(false);

  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof EXPORT_SIZES[number][]>();
    for (const sz of EXPORT_SIZES) {
      const arr = byGroup.get(sz.group) ?? [];
      arr.push(sz);
      byGroup.set(sz.group, arr);
    }
    return Array.from(byGroup.entries());
  }, []);

  // Block body scroll + Esc closes.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const drawSource = useCallback(() => {
    const c = sourceCanvasRef.current;
    if (!c) return;
    const MAX_W = 600;
    const MAX_H = 480;
    let dw = image.naturalWidth;
    let dh = image.naturalHeight;
    if (dw > MAX_W) {
      dh = dh * (MAX_W / dw);
      dw = MAX_W;
    }
    if (dh > MAX_H) {
      dw = dw * (MAX_H / dh);
      dh = MAX_H;
    }
    dw = Math.round(dw);
    dh = Math.round(dh);
    c.width = dw;
    c.height = dh;
    c.style.width = `${dw}px`;
    c.style.height = `${dh}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(image, 0, 0, dw, dh);
    setDisplaySize((prev) => (prev.w === dw && prev.h === dh ? prev : { w: dw, h: dh }));
  }, [image]);

  const renderAllPreviews = useCallback(() => {
    const nextWarn: Record<string, boolean> = {};
    EXPORT_SIZES.forEach((sz) => {
      const key = fileNameFor(sz);
      const cv = previewRefs.current.get(key);
      if (!cv) return;
      const targetAR = sz.w / sz.h;
      let tw: number;
      let th: number;
      if (targetAR >= 1) {
        tw = 120;
        th = Math.round(120 / targetAR);
      } else {
        th = 120;
        tw = Math.round(120 * targetAR);
      }
      cv.width = tw;
      cv.height = th;
      cv.style.width = `${tw}px`;
      cv.style.height = `${th}px`;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingQuality = "high";
      const crop = computeCrop(image, focal, sz.w, sz.h);
      ctx.clearRect(0, 0, tw, th);
      ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, tw, th);
      nextWarn[key] = isExtremeCrop(crop);
    });
    setWarningMap(nextWarn);
  }, [focal, image]);

  useEffect(() => {
    drawSource();
    renderAllPreviews();
  }, [drawSource, renderAllPreviews]);

  const focalFromPointer = useCallback((clientX: number, clientY: number): FocalPoint => {
    const c = sourceCanvasRef.current;
    if (!c) return { x: 0.5, y: 0.5 };
    const r = c.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const ny = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    return { x: nx, y: ny };
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (draggingRef.current) setFocal(focalFromPointer(e.clientX, e.clientY));
    }
    function onTouchMove(e: TouchEvent) {
      if (draggingRef.current && e.touches[0]) {
        setFocal(focalFromPointer(e.touches[0].clientX, e.touches[0].clientY));
      }
    }
    function up() {
      draggingRef.current = false;
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", up);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", up);
    document.addEventListener("touchcancel", up);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", up);
      document.removeEventListener("touchcancel", up);
    };
  }, [focalFromPointer]);

  async function downloadOne(sz: (typeof EXPORT_SIZES)[number]) {
    try {
      const blob = await exportSizeBlob(image, focal, sz.w, sz.h);
      triggerDownload(blob, fileNameFor(sz));
    } catch (err) {
      console.error("size export failed:", err);
    }
  }

  async function downloadNaturalPng() {
    try {
      const blob = await naturalPngBlob(image);
      triggerDownload(blob, `assembl-vessel-${Date.now()}.png`);
    } catch (err) {
      console.error("png export failed:", err);
    }
  }

  async function downloadAllZip() {
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const sz of EXPORT_SIZES) {
        const blob = await exportSizeBlob(image, focal, sz.w, sz.h);
        zip.file(fileNameFor(sz), blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerDownload(zipBlob, `assembl-vessel-pack-${Date.now()}.zip`);
    } catch (err) {
      console.error("zip failed:", err);
    } finally {
      setZipping(false);
    }
  }

  // The canvas sits inside a wrapper with 6px padding — match that offset.
  const dotLeft = focal.x * displaySize.w + 6;
  const dotTop = focal.y * displaySize.h + 6;

  return (
    <div className="fixed inset-0 z-[1000] flex items-stretch justify-center">
      <button
        type="button"
        aria-label="close panel"
        className="absolute inset-0 cursor-default bg-[rgba(49,60,66,0.42)] backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vessel-export-title"
        className={`relative m-4 w-full max-w-[1240px] overflow-y-auto rounded-[10px] border ${hairline} bg-white p-6 shadow-[0_24px_60px_-20px_rgba(49,60,66,0.25)] md:m-8`}
        style={{ maxHeight: "calc(100vh - 40px)" }}
      >
        <header className={`mb-5 flex flex-wrap items-start justify-between gap-4 border-b ${hairline} pb-4`}>
          <div>
            <p className={labelClass}>surface</p>
            <h2 id="vessel-export-title" className="mt-1 font-display text-[28px] font-light leading-tight text-[#313c42]">
              compose for the surface
            </h2>
            <p className="mt-1 font-mono text-[10.5px] tracking-[0.06em] text-[#68766f]">
              drag the focal point — every size below updates live
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={downloadNaturalPng} className={smallBtn}>
              download png · {image.naturalWidth}×{image.naturalHeight}
            </button>
            <button
              type="button"
              onClick={downloadAllZip}
              disabled={zipping}
              className="rounded-[8px] border border-[#b8964f] bg-white px-4 py-2 font-mono text-[11px] lowercase tracking-[0.18em] text-[#313c42] transition enabled:hover:bg-[#f3f5f3] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {zipping ? "building zip…" : "download all as zip"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="close panel"
              className={`h-9 w-9 rounded-[8px] border ${hairline} bg-white text-lg leading-none text-[#68766f] transition hover:bg-[#f3f5f3] hover:text-[#313c42]`}
            >
              ×
            </button>
          </div>
        </header>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2.5">
            <div
              className={`relative inline-block self-start rounded-[8px] border ${hairline} bg-[#f3f5f3] p-1.5`}
              style={{ lineHeight: 0 }}
            >
              <canvas
                ref={sourceCanvasRef}
                className="block max-w-full cursor-crosshair rounded-[4px]"
                onClick={(e) => setFocal(focalFromPointer(e.clientX, e.clientY))}
                aria-label="source image"
              />
              <div
                role="slider"
                aria-label="focal point"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={Number(focal.x.toFixed(2))}
                tabIndex={0}
                onMouseDown={(e) => {
                  draggingRef.current = true;
                  e.preventDefault();
                }}
                onTouchStart={(e) => {
                  draggingRef.current = true;
                  e.preventDefault();
                }}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 0.05 : 0.01;
                  let nx = focal.x;
                  let ny = focal.y;
                  let handled = false;
                  if (e.key === "ArrowLeft") { nx = Math.max(0, focal.x - step); handled = true; }
                  if (e.key === "ArrowRight") { nx = Math.min(1, focal.x + step); handled = true; }
                  if (e.key === "ArrowUp") { ny = Math.max(0, focal.y - step); handled = true; }
                  if (e.key === "ArrowDown") { ny = Math.min(1, focal.y + step); handled = true; }
                  if (handled) {
                    e.preventDefault();
                    setFocal({ x: nx, y: ny });
                  }
                }}
                className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-[#b8964f] bg-[rgba(63,115,115,0.28)] shadow-[0_0_0_1px_rgba(49,60,66,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f7373] active:cursor-grabbing"
                style={{ left: `${dotLeft}px`, top: `${dotTop}px` }}
              >
                <span aria-hidden className="absolute bottom-1 left-1/2 top-1 w-px -translate-x-1/2 bg-[#313c42]" />
                <span aria-hidden className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-[#313c42]" />
              </div>
            </div>
            <p className="font-mono text-[10.5px] leading-[1.6] tracking-[0.04em] text-[#68766f]">
              drag the <b className="font-normal text-[#313c42]">gold dot</b> to set the focal point. previews
              update live. {sourceLabel ? `· ${sourceLabel}` : ""}
            </p>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {groups.map(([groupName, sizes]) => (
              <div key={groupName} className="flex flex-col gap-2">
                <div className={`border-b ${hairline} pb-1 font-display text-base font-light italic text-[#68766f]`}>
                  {groupName}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                  {sizes.map((sz) => {
                    const key = fileNameFor(sz);
                    return (
                      <div
                        key={key}
                        className={`relative flex flex-col items-center gap-2 rounded-[8px] border ${hairline} bg-[#f3f5f3] p-2.5`}
                      >
                        {warningMap[key] ? (
                          <span
                            title="extreme crop — consider regenerating native at this size."
                            aria-label="extreme crop warning"
                            className="absolute right-2 top-2 h-2.5 w-2.5 cursor-help rounded-full bg-[#B85C38] shadow-[0_0_0_2px_#f3f5f3]"
                          />
                        ) : null}
                        <div className="flex h-[120px] w-[120px] items-center justify-center">
                          <canvas
                            ref={(el) => {
                              if (el) previewRefs.current.set(key, el);
                              else previewRefs.current.delete(key);
                            }}
                            className={`block rounded-[2px] border ${hairline} bg-white`}
                          />
                        </div>
                        <div className="text-center font-mono text-[10px] leading-tight tracking-[0.08em]">
                          <div className="text-[#313c42]">{sz.name}</div>
                          <div className="text-[#68766f]">
                            {sz.w}×{sz.h}
                          </div>
                        </div>
                        <button type="button" onClick={() => downloadOne(sz)} className={smallBtn}>
                          download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main tool ──────────────────────────────────────────────────────────────
export function VesselStudioTool() {
  // prompt builder state
  const [kete, setKete] = useState("waihanga");
  const [ar, setAr] = useState<AspectRatio>("4:5");
  const [motion, setMotion] = useState<MotionToken>("slow gentle rotation");
  const [lighting, setLighting] = useState<LightingToken>(LIGHTING_OPTIONS[0]);
  const [sref, setSref] = useState("");
  const [variants, setVariants] = useState(1);
  const [customMaterial, setCustomMaterial] = useState("");
  const [customForm, setCustomForm] = useState("");
  const [customPalette, setCustomPalette] = useState("");
  const reference = useSyncExternalStore(
    referenceStore.subscribe,
    referenceStore.getSnapshot,
    referenceStore.getServerSnapshot,
  );
  const [imagePromptStrength, setImagePromptStrength] = useState(0.35);
  const [refDragging, setRefDragging] = useState(false);
  // free prompt mode
  const [freePromptOn, setFreePromptOn] = useState(false);
  const [freePromptText, setFreePromptText] = useState("");
  // mode + video state
  const [mode, setMode] = useState<"image" | "video">("image");
  const [videoCamera, setVideoCamera] = useState<(typeof VIDEO_CAMERA_MOTIONS)[number]["id"]>("slow orbit");
  const [videoDuration, setVideoDuration] = useState<(typeof VIDEO_DURATION_OPTIONS)[number]>("8s");
  const [videoAR, setVideoAR] = useState<(typeof VIDEO_AR_OPTIONS)[number]>("16:9");
  const [videoModel, setVideoModel] = useState<VideoModelKey>("kling2");
  const [videoConfirming, setVideoConfirming] = useState(false);
  // fal key — stored in this browser only, never sent to the assembl server
  const falKey = useSyncExternalStore(keyStore.subscribe, keyStore.getSnapshot, keyStore.getServerSnapshot);
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyFlash, setKeyFlash] = useState(false);
  // generation
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharedStatus, setSharedStatus] = useState<{ text: string; tone: "ok" | "error" }>({
    text: "shared image balance ready · save your own key only if you need more runs",
    tone: "ok",
  });
  const [runsUsed, setRunsUsed] = useState<number | null>(null);
  const [hourLimit, setHourLimit] = useState(3);
  // gallery + cost
  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getServerSnapshot,
  );
  const [sessionGenerations, setSessionGenerations] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  // export modal
  const [exportImage, setExportImage] = useState<HTMLImageElement | null>(null);
  const [exportLabel, setExportLabel] = useState("");
  // copy button
  const [copied, setCopied] = useState(false);

  const keyPanelRef = useRef<HTMLDivElement | null>(null);
  const refZoneRef = useRef<HTMLDivElement | null>(null);
  const refFileRef = useRef<HTMLInputElement | null>(null);
  const sizePrepRef = useRef<HTMLInputElement | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keteOption = getKete(kete);
  const isPortrait = !!keteOption.portrait;
  const hasReference = !!reference?.dataUrl;
  const modelInfo = VIDEO_MODELS[videoModel];

  useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  const studioState: VesselStudioState = useMemo(
    () => ({
      kete,
      ar,
      motion,
      lighting,
      sref,
      variants,
      customMaterial,
      customForm,
      customPalette,
      reference,
      imagePromptStrength,
    }),
    [kete, ar, motion, lighting, sref, variants, customMaterial, customForm, customPalette, reference, imagePromptStrength],
  );

  const freePrompt = freePromptOn && freePromptText.trim().length > 0 ? freePromptText.trim() : null;

  const composeVideoPrompt = useCallback((): string => {
    const negTail = "No text, no logos, no patterns, no people, no neon, no sci-fi.";
    if (freePrompt) {
      return freePrompt.toLowerCase().includes("no text") || freePrompt.toLowerCase().includes("no logos")
        ? freePrompt
        : `${freePrompt} ${negTail}`;
    }
    let grammar: string;
    if (keteOption.id === "custom") {
      const parts = [customMaterial.trim(), customForm.trim(), customPalette.trim()].filter(Boolean);
      grammar = parts.length
        ? `A slow cinematic orbit around a sculptural Custom evidence vessel: ${parts.join(", ")}.`
        : "A slow cinematic orbit around a sculptural evidence vessel (custom material grammar not set yet).";
    } else {
      grammar = KETE_VIDEO_GRAMMARS[keteOption.id] || "";
    }
    const camera =
      VIDEO_CAMERA_MOTIONS.find((m) => m.id === videoCamera)?.clause ?? VIDEO_CAMERA_MOTIONS[0].clause;
    return `${grammar} ${camera} Soft natural sunlight from upper-left casts a long warm shadow on a cream paper backdrop. Aesop × Cereal editorial product photography, museum quality, calm Aotearoa intelligence object. Hasselblad 100mm macro f4 cinematic depth of field. ${negTail}`;
  }, [freePrompt, keteOption, customMaterial, customForm, customPalette, videoCamera]);

  const fullPrompt = useMemo(() => {
    if (mode === "video") return composeVideoPrompt();
    if (freePrompt) return `${freePrompt} ${composeFlags(studioState)}`;
    return composeFull(studioState);
  }, [mode, composeVideoPrompt, freePrompt, studioState]);

  const falPrompt = useMemo(() => {
    if (freePrompt) {
      const flagNegInline = `(${activeFlagNegatives(keteOption)
        .map((n) => `no ${n}`)
        .join(", ")})`;
      return `${freePrompt} ${flagNegInline}`;
    }
    return composeForFal(studioState);
  }, [freePrompt, keteOption, studioState]);

  const anchors = useMemo(() => {
    const list = mode === "video" ? [...VIDEO_NEGATIVES] : [...activeNegatives(keteOption)];
    const flagSet = new Set(mode === "video" ? [...VIDEO_NEGATIVES] : [...activeFlagNegatives(keteOption)]);
    const seen = new Set<string>();
    const out: { token: string; isFlag: boolean }[] = [];
    for (const token of list) {
      if (seen.has(token)) continue;
      seen.add(token);
      out.push({ token, isFlag: flagSet.has(token) });
    }
    return out;
  }, [mode, keteOption]);

  const promptMeta =
    mode === "video"
      ? `${keteOption.name} · ${videoAR} · ${videoDuration} · ${modelInfo.display}`
      : `${keteOption.name} · ${ar} · ${variants}× variant${variants > 1 ? "s" : ""}`;

  const modeIndicator = useMemo(() => {
    if (mode === "video") {
      const isI2V = hasReference && modelInfo.supportsI2V;
      const tag = isI2V ? "image-to-video" : "text-to-video";
      const refNote = hasReference && !modelInfo.supportsI2V ? " · reference ignored (model is text-only)" : "";
      return `mode: ${tag} · ${modelInfo.display.toLowerCase()} · ${videoDuration} · ${videoAR}${refNote}`;
    }
    if (hasReference) {
      const mapped = reduxAspectFor(ar);
      const arNote = mapped !== ar ? ` · ar ${ar} → ${mapped}` : "";
      return `mode: image-to-image · flux pro v1.1 ultra/redux · anchor ${imagePromptStrength.toFixed(2)}${arNote}`;
    }
    return "mode: text-to-image · flux pro v1.1";
  }, [mode, hasReference, modelInfo, videoDuration, videoAR, ar, imagePromptStrength]);

  const generateLabel = useMemo(() => {
    if (generating) return "generating…";
    if (mode === "video") {
      if (videoConfirming) {
        return `confirm — generate ${modelInfo.display.toLowerCase()} ${videoDuration} clip`;
      }
      return hasReference && modelInfo.supportsI2V ? "generate video from reference" : "generate video";
    }
    return hasReference ? "generate from reference" : "generate";
  }, [generating, mode, videoConfirming, modelInfo, videoDuration, hasReference]);

  function showError(msg: string) {
    const suffix = /limit reached|shared balance|try again in an hour/i.test(msg)
      ? ""
      : ". check your key or try again";
    setError(`generation failed — ${msg}${suffix}.`);
  }

  function saveReference(next: ReferenceImage | null) {
    referenceStore.set(next, next?.dataUrl ? JSON.stringify(next) : null);
    setImagePromptStrength(0.35);
  }

  async function loadReferenceFile(file: File | null) {
    if (!file) return;
    if (!REF_VALID_TYPES.includes(file.type)) {
      showError(`unsupported image type: ${file.type || "unknown"}. use jpeg, png, or webp`);
      return;
    }
    if (file.size > REF_MAX_BYTES) {
      showError(`reference image too large (${humanBytes(file.size)}). max 8 MB — try compressing it`);
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      saveReference({ dataUrl, filename: file.name || "reference", sizeBytes: file.size });
      setError(null);
    } catch (err) {
      showError(`could not read file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function saveKey(value: string) {
    const v = value.trim();
    keyStore.set(v, v || null);
    setError(null);
  }

  function flashKeyPanel() {
    keyPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setKeyFlash(true);
    setTimeout(() => setKeyFlash(false), 1400);
    showError("paste a fal.ai key first");
  }

  function addToGallery(cards: GalleryCard[]) {
    const next = [...cards, ...historyStore.getSnapshot()].slice(0, HIST_MAX);
    historyStore.set(next, JSON.stringify(next));
  }

  async function generateImage() {
    if (generating) return;
    setError(null);
    setGenerating(true);

    const key = falKey.trim();
    const useRedux = hasReference;
    const promptForFal = falPrompt;
    const promptFull = fullPrompt;

    // Correct Fal endpoint for image-guided Flux Pro is v1.1-ultra/redux.
    const endpoint = useRedux
      ? "https://fal.run/fal-ai/flux-pro/v1.1-ultra/redux"
      : "https://fal.run/fal-ai/flux-pro/v1.1";
    const directBody = useRedux
      ? {
          prompt: promptForFal,
          image_url: reference?.dataUrl,
          image_prompt_strength: imagePromptStrength,
          aspect_ratio: reduxAspectFor(ar),
          num_images: variants,
          enable_safety_checker: true,
          output_format: "jpeg",
        }
      : {
          prompt: promptForFal,
          image_size: FAL_AR_MAP[ar] || "square_hd",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: variants,
          enable_safety_checker: true,
          output_format: "jpeg",
        };

    try {
      const usingPersonalKey = !!key;
      const resp = usingPersonalKey
        ? await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Key ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(directBody),
          })
        : await fetch("/api/hapai/vessel-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: promptForFal,
              aspectRatio: ar,
              motion,
              sref: useRedux ? reference?.dataUrl : "",
              mode: useRedux ? "redux" : "text",
              modelKey: useRedux ? "flux-pro-v1.1-ultra-redux" : "flux-pro-v1.1",
              variants,
              imagePromptStrength,
            }),
          });

      if (!resp.ok) {
        let detail = await extractErrorDetail(resp);
        if (useRedux && /image_url|too large|payload|413|request entity/i.test(detail)) {
          detail = `${detail} — try a smaller reference image (under ~5 MB)`;
        }
        if (!usingPersonalKey && resp.status === 429) {
          setSharedStatus({
            text: "hourly limit reached · bring your own fal.ai key or try again in an hour",
            tone: "error",
          });
          setRunsUsed(hourLimit);
        }
        throw new Error(detail);
      }

      const data = (await resp.json()) as {
        images?: { url?: string }[];
        url?: string;
        remaining?: number;
        hourLimit?: number;
      };
      const images = Array.isArray(data.images) && data.images.length
        ? data.images
        : data.url
          ? [{ url: data.url }]
          : [];
      if (!images.length) throw new Error("no images returned");

      const now = new Date().toISOString();
      addToGallery(
        images
          .filter((img): img is { url: string } => !!img?.url)
          .map((img) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            prompt_full: promptFull,
            prompt_to_fal: promptForFal,
            kete,
            ar,
            mode: useRedux ? "redux" : "text",
            image_url: img.url,
            generated_at: now,
          })),
      );

      setSessionGenerations((n) => n + images.length);
      setSessionCost((c) => c + images.length * (useRedux ? PRICE_REDUX : PRICE_TEXT));

      if (usingPersonalKey) {
        setSharedStatus({ text: "using your saved fal.ai key · shared balance not used", tone: "ok" });
      } else {
        const limit = Number(data.hourLimit || 3);
        const remaining = Math.max(0, Number(data.remaining ?? 0));
        const used = Math.max(1, limit - remaining);
        setHourLimit(limit);
        setRunsUsed(used);
        setSharedStatus({
          text: `generated using assembl's shared fal.ai balance · ${used} of ${limit} runs this hour`,
          tone: "ok",
        });
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setGenerating(false);
    }
  }

  async function generateVideo() {
    if (generating) return;
    setError(null);

    // Video runs are bring-your-own-key only — never on the shared balance.
    const key = falKey.trim();
    if (!key) {
      flashKeyPanel();
      return;
    }

    // Two-click confirmation guardrail.
    if (!videoConfirming) {
      setVideoConfirming(true);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => setVideoConfirming(false), 8000);
      return;
    }
    setVideoConfirming(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

    const model = videoModel;
    const hasRef = hasReference;
    if (model === "veo3" && hasRef) {
      const proceed = window.confirm(
        "Veo 3 is text-to-video only in this build — your reference image will be IGNORED.\n\nFor image-to-video that respects your reference, switch to Kling 2.0 or Hailuo 02.\n\nProceed with text-only Veo 3 anyway?",
      );
      if (!proceed) return;
    }

    setGenerating(true);
    const endpoint = videoEndpoint(model, hasRef && model !== "veo3");
    const body = buildVideoBody(model, {
      prompt: composeVideoPrompt(),
      image_url: hasRef && model !== "veo3" ? reference?.dataUrl ?? null : null,
      duration: videoDuration,
      aspect_ratio: videoAR,
    });

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(await extractErrorDetail(resp));

      const data = (await resp.json()) as unknown;
      const videoUrl = extractVideoUrl(data);
      if (!videoUrl) throw new Error("no video url in response");

      addToGallery([
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          prompt_full: composeVideoPrompt(),
          prompt_to_fal: composeVideoPrompt(),
          kete,
          ar: videoAR,
          media_type: "video",
          model,
          duration: videoDuration,
          camera: videoCamera,
          had_reference: hasRef && model !== "veo3",
          image_url: videoUrl,
          generated_at: new Date().toISOString(),
        },
      ]);
      setSessionGenerations((n) => n + 1);
      setSessionCost((c) => c + VIDEO_MODELS[model].price);
    } catch (err) {
      showError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setGenerating(false);
    }
  }

  async function loadGalleryCardAsReference(card: GalleryCard) {
    try {
      const r = await fetch(card.image_url);
      if (!r.ok) throw new Error(`fetch failed (${r.status})`);
      const blob = await r.blob();
      if (blob.size > REF_MAX_BYTES) throw new Error(`image too large (${humanBytes(blob.size)})`);
      const dataUrl = await readAsDataUrl(blob);
      const ts = Date.parse(card.generated_at) || Date.now();
      saveReference({ dataUrl, filename: `gallery-${card.kete}-${ts}.jpg`, sizeBytes: blob.size });
      setError(null);
      refZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      showError(
        `couldn't use gallery image as reference: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function openExportFromCard(card: GalleryCard) {
    try {
      const img = await loadImageFromUrl(card.image_url);
      setExportLabel(`from gallery · ${card.kete} · ${card.ar}`);
      setExportImage(img);
    } catch (err) {
      showError(`couldn't open size export: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function openExportFromFile(file: File | null) {
    if (!file) return;
    if (!REF_VALID_TYPES.includes(file.type)) {
      showError(`unsupported image type: ${file.type || "unknown"}. use jpeg, png, or webp`);
      return;
    }
    if (file.size > REF_MAX_BYTES) {
      showError(`image too large (${humanBytes(file.size)}). max 8 MB`);
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setExportLabel(`uploaded · ${file.name} · ${humanBytes(file.size)}`);
      setExportImage(img);
    } catch (err) {
      showError(`couldn't open size export: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked — nothing else to do without execCommand
    }
  }

  function resetAll() {
    setKete("waihanga");
    setAr("4:5");
    setMotion("slow gentle rotation");
    setLighting(LIGHTING_OPTIONS[0]);
    setSref("");
    setVariants(1);
    setCustomMaterial("");
    setCustomForm("");
    setCustomPalette("");
  }

  function selectKete(id: string) {
    setKete(id);
    const k = getKete(id);
    // Only apply fields the preset declares — switching back to a kete with no
    // defaults leaves ar/motion sticky at whatever the user last picked.
    if (k.defaultAspectRatio && AR_OPTIONS.includes(k.defaultAspectRatio)) setAr(k.defaultAspectRatio);
    if (k.defaultMotion && MOTION_OPTIONS.includes(k.defaultMotion)) setMotion(k.defaultMotion);
  }

  function switchMode(next: "image" | "video") {
    setMode(next);
    setVideoConfirming(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    // Founder portrait is image-mode only — fall back to waihanga in video mode.
    if (next === "video" && isPortrait) setKete("waihanga");
  }

  function toggleFreePrompt(on: boolean) {
    setFreePromptOn(on);
    if (on && !freePromptText.trim()) {
      // Prefill with the currently-composed prompt so the user has a start point.
      const seed = mode === "video" ? composeVideoPrompt() : composeFull(studioState);
      setFreePromptText(mode === "video" ? seed : seed.replace(/--[a-z]+ [^-]*?(?=( --|$))/g, "").trim());
    }
  }

  const keteNote = isPortrait
    ? "founder portrait — warm cream interior, soft natural light, calm editorial portrait, dachshund optional"
    : "each kete is a stacked still-life — cream stoneware top + base, kete-coloured translucent glass plates between them, on a small brass wire display stand. cream paper backdrop only.";

  const grammarPreview =
    mode === "video"
      ? keteOption.id === "custom"
        ? ""
        : KETE_VIDEO_GRAMMARS[keteOption.id] || ""
      : keteOption.grammar;

  return (
    <HapaiToolShell
      kicker="hapai · marketing"
      title="Vessel studio."
      description="A quiet prompt builder for branded hero imagery and vessel-led campaign assets."
      toolPath="/hapai/vessel-studio"
      shareTitle="Vessel studio. — assembl"
      shareText="A quiet prompt builder for branded hero imagery and vessel-led campaign assets."
      posture="Draft imagery only. A named person picks, checks, and publishes the final asset."
      highlights={[
        {
          title: "shared balance",
          body: "image generation works with assembl's shared launch balance",
          icon: <ImageIcon className="h-5 w-5" aria-hidden />,
        },
        {
          title: "your key",
          body: "save your own fal.ai key to bypass shared limits or generate video",
          icon: <KeyRound className="h-5 w-5" aria-hidden />,
        },
        {
          title: "local",
          body: "prompts and reference images stay in this browser",
          icon: <Download className="h-5 w-5" aria-hidden />,
        },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* ── LEFT: prompt builder ── */}
        <div className="grid content-start gap-5">
          <div className={cardClass}>
            <p className={labelClass}>
              kete <span className="normal-case tracking-[0.12em] text-[#68766f]/80">· vessel form for the pillar</span>
            </p>
            <p className="mt-2 font-mono text-[10.5px] italic leading-relaxed tracking-[0.04em] text-[#68766f]">
              {keteNote}
            </p>
            <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label="kete form">
              {KETE_OPTIONS.map((k) => {
                const disabledInVideo = mode === "video" && !!k.portrait;
                const selected = kete === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabledInVideo}
                    title={
                      disabledInVideo
                        ? "video mode is for vessels — switch back to image mode for founder portraits"
                        : undefined
                    }
                    onClick={() => selectKete(k.id)}
                    className={`flex items-baseline justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition ${
                      selected ? "border-[#3f7373] bg-[#eef4f4]" : `${hairline} bg-white hover:bg-[#f3f5f3]`
                    } ${disabledInVideo ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span className="font-display text-[20px] font-normal leading-tight text-[#313c42]">
                      {k.label}
                    </span>
                    <span className="font-mono text-[10px] lowercase tracking-[0.12em] text-[#68766f]">
                      {k.pillar}
                      {disabledInVideo ? " · image mode only" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {keteOption.id === "custom" ? (
              <div className={`mt-3 grid gap-2.5 rounded-[10px] border ${hairline} bg-[#f3f5f3] p-3.5`}>
                {(
                  [
                    ["material", customMaterial, setCustomMaterial, "e.g. translucent jade mineral, silk organza, glass-organza membrane…"],
                    ["form", customForm, setCustomForm, "e.g. monolithic organic form, blooming layered petals, archive-bloom folds…"],
                    ["palette", customPalette, setCustomPalette, "e.g. soft gold light points scattered through the material, warm amber glow…"],
                  ] as const
                ).map(([label, value, setter, placeholder]) => (
                  <label key={label} className="block">
                    <span className={labelClass}>{label}</span>
                    <textarea
                      rows={2}
                      value={value}
                      spellCheck={false}
                      placeholder={placeholder}
                      onChange={(e) => setter(e.target.value)}
                      className={`mt-1 w-full resize-y rounded-[8px] border ${hairline} bg-white px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-[#313c42] outline-none focus:border-[#3f7373]`}
                    />
                  </label>
                ))}
              </div>
            ) : grammarPreview ? (
              <div className={`mt-3 rounded-[10px] border ${hairline} bg-[#f3f5f3] p-3.5`}>
                <p className={labelClass}>{mode === "video" ? "video grammar · locked" : "material grammar · locked"}</p>
                <p className="mt-1.5 font-mono text-[11.5px] leading-[1.6] tracking-[0.02em] text-[#68766f]">
                  {grammarPreview}
                </p>
              </div>
            ) : null}

            {isPortrait ? (
              <p className="mt-3 border-l-2 border-[#b8964f] py-1 pl-3 font-mono text-[11px] italic leading-[1.6] tracking-[0.04em] text-[#68766f]">
                tip: upload one of your existing brand portraits as a reference image for style consistency.
                anchor strength 0.45–0.6 works well for founder content.
              </p>
            ) : null}
          </div>

          {mode === "image" ? (
            <div className={cardClass}>
              <p className={labelClass}>aspect ratio</p>
              <ChipRow options={AR_OPTIONS} value={ar} onChange={setAr} ariaLabel="aspect ratio" />
              <p className={`mt-5 ${labelClass}`}>motion</p>
              <ChipRow options={MOTION_OPTIONS} value={motion} onChange={setMotion} ariaLabel="motion" />
              <label className="mt-5 block">
                <span className={labelClass}>
                  style reference (sref){" "}
                  <span className="normal-case tracking-[0.12em] text-[#68766f]/80">· optional url · midjourney only</span>
                </span>
                <input
                  className={inputClass}
                  type="text"
                  value={sref}
                  placeholder="https://…"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setSref(e.target.value)}
                />
              </label>
              <label className="mt-5 block">
                <span className={labelClass}>lighting</span>
                <select
                  className={inputClass}
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value as LightingToken)}
                >
                  {LIGHTING_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <p className={`mt-5 ${labelClass}`}>variants</p>
              <div className="mt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="fewer variants"
                  onClick={() => setVariants((v) => Math.max(1, v - 1))}
                  className={`h-11 w-11 rounded-[10px] border ${hairline} bg-white font-mono text-sm transition hover:bg-[#f3f5f3]`}
                >
                  −
                </button>
                <span className="min-w-[22px] text-center font-mono text-sm text-[#313c42]">{variants}</span>
                <button
                  type="button"
                  aria-label="more variants"
                  onClick={() => setVariants((v) => Math.min(4, v + 1))}
                  className={`h-11 w-11 rounded-[10px] border ${hairline} bg-white font-mono text-sm transition hover:bg-[#f3f5f3]`}
                >
                  +
                </button>
                <span className="ml-1 font-mono text-[10.5px] tracking-[0.12em] text-[#68766f]">
                  images per run · 1–4
                </span>
              </div>
            </div>
          ) : (
            <div className={cardClass}>
              <p className={labelClass}>camera motion</p>
              <ChipRow
                options={VIDEO_CAMERA_MOTIONS.map((m) => m.id)}
                value={videoCamera}
                onChange={setVideoCamera}
                ariaLabel="camera motion"
                titleOf={(id) => VIDEO_CAMERA_MOTIONS.find((m) => m.id === id)?.clause ?? ""}
              />
              <p className={`mt-5 ${labelClass}`}>duration</p>
              <ChipRow options={VIDEO_DURATION_OPTIONS} value={videoDuration} onChange={setVideoDuration} ariaLabel="duration" />
              <p className={`mt-5 ${labelClass}`}>aspect ratio</p>
              <ChipRow options={VIDEO_AR_OPTIONS} value={videoAR} onChange={setVideoAR} ariaLabel="video aspect ratio" />
              <p className={`mt-5 ${labelClass}`}>resolution</p>
              <p className={`mt-2 inline-flex items-center gap-2 rounded-[8px] border ${hairline} bg-[#f3f5f3] px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-[#313c42]`}>
                1080p <span className="text-[9.5px] lowercase tracking-[0.16em] text-[#68766f]">pinned</span>
              </p>
              <p className={`mt-5 ${labelClass}`}>model</p>
              <div className="mt-2 grid gap-1.5" role="radiogroup" aria-label="video model">
                {(Object.keys(VIDEO_MODELS) as VideoModelKey[]).map((id) => {
                  const m = VIDEO_MODELS[id];
                  const selected = videoModel === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setVideoModel(id)}
                      className={`flex items-baseline justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition ${
                        selected ? "border-[#3f7373] bg-[#eef4f4]" : `${hairline} bg-white hover:bg-[#f3f5f3]`
                      }`}
                    >
                      <span className="font-mono text-[12px] text-[#313c42]">{m.display}</span>
                      <span className="font-mono text-[10.5px] tracking-[0.06em] text-[#68766f]">{m.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={cardClass} ref={refZoneRef}>
            <p className={labelClass}>
              reference image{" "}
              <span className="normal-case tracking-[0.12em] text-[#68766f]/80">· visual anchor for fal redux</span>
            </p>
            {reference?.dataUrl ? (
              <div className={`mt-2 rounded-[10px] border ${hairline} bg-[#f3f5f3] p-3`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reference.dataUrl}
                  alt={reference.filename || "reference"}
                  className={`block max-h-[240px] max-w-[240px] rounded-[8px] border ${hairline}`}
                />
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                  <span className="break-all font-mono text-[10.5px] tracking-[0.08em] text-[#68766f]">
                    {reference.filename} · {humanBytes(reference.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => saveReference(null)}
                    className="font-mono text-[10.5px] lowercase tracking-[0.16em] text-[#313c42] underline-offset-2 hover:underline"
                  >
                    remove
                  </button>
                </div>
                <div className="mt-3">
                  <p className="font-mono text-[10.5px] lowercase tracking-[0.18em] text-[#68766f]">
                    anchor to reference: <span className="text-[#313c42]">{imagePromptStrength.toFixed(2)}</span>
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={imagePromptStrength}
                    aria-label="image prompt strength"
                    onChange={(e) => setImagePromptStrength(parseFloat(e.target.value))}
                    className="mt-2 h-1 w-full cursor-pointer accent-[#3f7373]"
                  />
                  <div className="mt-1.5 flex justify-between font-mono text-[9.5px] tracking-[0.14em] text-[#68766f]">
                    <span>loose</span>
                    <span>← anchor →</span>
                    <span>tight</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="upload reference image"
                onClick={() => refFileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    refFileRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setRefDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setRefDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setRefDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setRefDragging(false);
                  void loadReferenceFile(e.dataTransfer?.files?.[0] ?? null);
                }}
                className={`mt-2 flex h-[180px] cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#b8964f] transition ${
                  refDragging ? "bg-[#f0e9d8]" : "bg-[#f3f5f3] hover:bg-[#eef4f4]"
                }`}
              >
                <span className="px-4 text-center font-mono text-[12px] italic tracking-[0.04em] text-[#68766f]">
                  drag an image here, or click to upload
                </span>
              </div>
            )}
            <input
              ref={refFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                void loadReferenceFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <p className="mt-2 font-mono text-[10px] leading-[1.5] tracking-[0.04em] text-[#68766f]">
              saved in this browser. up to ~5MB before localStorage may complain — reduce file size if so.
            </p>
          </div>
        </div>

        {/* ── RIGHT: key + prompt + generate + gallery ── */}
        <div className="grid content-start gap-5">
          <div
            ref={keyPanelRef}
            className={`rounded-[10px] border p-5 transition-shadow ${
              keyFlash ? "border-[#b8964f] shadow-[0_0_0_2px_#b8964f]" : "border-[#b8964f]/60"
            } bg-[#f3f5f3]`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-mono text-[11px] lowercase tracking-[0.18em] text-[#313c42]">fal.ai api key</h3>
              <span
                className={`font-mono text-[10.5px] tracking-[0.12em] ${falKey ? "text-[#2e5a58]" : "text-[#68766f]"}`}
              >
                {falKey ? `saved · ${falKey.slice(0, 4)}…${falKey.slice(-4)}` : "not set"}
              </span>
            </div>
            <p className="mt-2.5 font-mono text-[10.5px] leading-[1.5] tracking-[0.04em] text-[#68766f]">
              image generation works with assembl&apos;s shared launch balance. save your own key here to bypass
              shared limits or generate video. get a key at{" "}
              <a
                href="https://fal.ai/dashboard/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#313c42] underline underline-offset-2"
              >
                fal.ai/dashboard/keys
              </a>
              . your key is saved in this browser only — it is never sent to assembl.
            </p>
            <div className="mt-2.5 flex items-stretch gap-1.5">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                placeholder="paste fal.ai api key"
                autoComplete="off"
                spellCheck={false}
                aria-label="fal.ai api key"
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveKey(keyInput);
                  }
                }}
                className={`min-w-0 flex-1 rounded-[8px] border ${hairline} bg-white px-2.5 py-2 font-mono text-[12px] text-[#313c42] outline-none focus:border-[#3f7373]`}
              />
              <button
                type="button"
                aria-pressed={showKey}
                onClick={() => setShowKey((s) => !s)}
                className={smallBtn}
              >
                {showKey ? "hide" : "show"}
              </button>
              <button
                type="button"
                onClick={() => saveKey(keyInput)}
                className="rounded-[8px] border border-[#313c42] bg-[#313c42] px-3.5 py-1.5 font-mono text-[11px] lowercase tracking-[0.12em] text-white transition hover:opacity-90"
              >
                save
              </button>
            </div>
            <p className="mt-2 font-mono text-[9.5px] tracking-[0.04em] text-[#68766f]">
              cost: ~$0.04 / image (flux pro v1.1) · ~$0.05 / image (ultra/redux i2i) · ~$0.30–$3.00 / clip (video)
              <button
                type="button"
                onClick={() => {
                  saveKey("");
                  setKeyInput("");
                }}
                className="ml-2 text-[#B85C38] underline underline-offset-2"
              >
                forget key
              </button>
            </p>
            <div
              className={`mt-3 rounded-[8px] border px-2.5 py-2 font-mono text-[10px] lowercase leading-[1.45] tracking-[0.08em] ${
                sharedStatus.tone === "error"
                  ? "border-[rgba(159,74,54,0.28)] text-[#B85C38]"
                  : "border-[rgba(63,115,115,0.18)] text-[#2e5a58]"
              } bg-white/70`}
            >
              {sharedStatus.text}
              {runsUsed !== null && !falKey ? (
                <span className="mt-1 flex items-center gap-1" aria-label={`${runsUsed} of ${hourLimit} runs used this hour`}>
                  {Array.from({ length: hourLimit }).map((_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={`inline-block h-1.5 w-1.5 rounded-full ${i < runsUsed ? "bg-[#2e5a58]" : "bg-[rgba(63,115,115,0.22)]"}`}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          </div>

          <div className={`inline-flex self-start rounded-full border ${hairline} bg-[#f3f5f3] p-1`} role="tablist" aria-label="generation mode">
            {(["image", "video"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-full px-4.5 py-1.5 font-mono text-[11px] capitalize tracking-[0.18em] transition ${
                  mode === m ? "bg-[#313c42] text-white" : "text-[#68766f] hover:text-[#313c42]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className={cardClass}>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className={labelClass}>prompt</p>
                <h2 className="mt-0.5 font-display text-[24px] font-light text-[#313c42]">
                  {freePromptOn ? "free · custom" : "composed"}
                </h2>
              </div>
              <span className="font-mono text-[10.5px] text-[#68766f]">
                {freePromptOn ? `free prompt mode · ${freePromptText.trim().length} chars` : promptMeta}
              </span>
            </div>
            <label className={`mt-3 flex cursor-pointer items-center gap-2 rounded-[8px] border ${hairline} bg-[#f3f5f3] px-2.5 py-2`}>
              <input
                type="checkbox"
                checked={freePromptOn}
                onChange={(e) => toggleFreePrompt(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[#3f7373]"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#313c42]">free prompt mode</span>
              <span className="ml-auto font-mono text-[9.5px] tracking-[0.04em] text-[#68766f]">
                bypass kete grammar · type whatever you want
              </span>
            </label>
            {freePromptOn ? (
              <textarea
                value={freePromptText}
                spellCheck={false}
                onChange={(e) => setFreePromptText(e.target.value)}
                placeholder="Type your custom prompt here. The kete grammar, motion clauses, and lighting hints are all bypassed when this is on. Negative anchors are still appended unless you delete them at the end."
                className={`mt-3 min-h-[140px] w-full resize-y rounded-[8px] border ${hairline} bg-white p-3 font-mono text-[12px] leading-[1.55] text-[#313c42] outline-none focus:border-[#3f7373]`}
              />
            ) : (
              <div
                aria-live="polite"
                className={`mt-3 min-h-[80px] whitespace-pre-wrap break-words rounded-[8px] border ${hairline} bg-[#f3f5f3] p-4 font-mono text-[12.5px] leading-[1.65] text-[#313c42]`}
              >
                {fullPrompt}
              </div>
            )}

            <div className={`mt-4 rounded-[8px] border ${hairline} bg-[#f3f5f3] p-3.5`}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10.5px] lowercase tracking-[0.18em] text-[#68766f]">
                  negative anchors · always pinned
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.12em] text-[#68766f]">
                  {anchors.length} pinned
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="negative anchors">
                {anchors.map(({ token, isFlag }) => (
                  <span
                    key={token}
                    title={isFlag ? `--no ${token}` : `body inline: no ${token}`}
                    className={`rounded-[6px] border ${hairline} bg-white px-2 py-1 font-mono text-[10.5px] lowercase tracking-[0.06em] text-[#68766f]`}
                  >
                    <span aria-hidden className="mr-1 text-[#B85C38]">
                      −
                    </span>
                    {token}
                  </span>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10.5px] leading-[1.65] tracking-[0.02em] text-[#68766f]">
                these are doing work. each one keeps midjourney (and flux) from drifting toward something
                off-brand — text overlays, kōwhaiwhai patterns, carvings, neon/sci-fi tropes, and the
                architectural caged look (armature, cage, rails, spine, metal frame).
              </p>
            </div>

            <p className="mt-4 text-center font-mono text-[10px] lowercase tracking-[0.16em] text-[#68766f]">
              {modeIndicator}
            </p>
            {mode === "video" ? (
              <p className="mt-2 border-l-2 border-[#b8964f] bg-[#f3f5f3] px-3 py-2 font-mono text-[11px] leading-[1.55] tracking-[0.04em] text-[#68766f]">
                video generation costs ~<b className="font-normal text-[#313c42]">${modelInfo.price.toFixed(2)}</b> per
                clip · slow (60–180s) · confirm before generating · runs on your own fal.ai key only
              </p>
            ) : null}
            <button
              type="button"
              disabled={generating}
              onClick={() => (mode === "video" ? void generateVideo() : void generateImage())}
              className={`mt-3 flex w-full items-center justify-center gap-3 rounded-[10px] px-5 py-4 font-mono text-[12.5px] lowercase tracking-[0.22em] text-white transition disabled:cursor-not-allowed disabled:opacity-55 ${
                videoConfirming ? "bg-[#b8964f]" : "bg-[#3f7373] hover:bg-[#2e5a58]"
              }`}
            >
              {generateLabel}
              {generating ? (
                <span className="inline-flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b8964f] motion-reduce:animate-none"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </span>
              ) : null}
            </button>
            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-[8px] border border-[#D9C2B6] bg-[#F4E9E4] px-3.5 py-2.5 font-mono text-[12px] leading-[1.55] text-[#7A2E15]"
              >
                {error}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2.5">
              <button
                type="button"
                onClick={copyPrompt}
                className={`flex-1 rounded-[10px] border px-3.5 py-2.5 font-mono text-[11px] lowercase tracking-[0.18em] transition ${
                  copied ? "border-[#313c42] bg-[#313c42] text-white" : `${hairline} bg-white text-[#313c42] hover:bg-[#f3f5f3]`
                }`}
              >
                {copied ? "copied" : "copy prompt"}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className={`flex-1 rounded-[10px] border ${hairline} bg-white px-3.5 py-2.5 font-mono text-[11px] lowercase tracking-[0.18em] text-[#313c42] transition hover:bg-[#f3f5f3]`}
              >
                reset
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className={labelClass}>results</p>
                <h2 className="mt-0.5 font-display text-[24px] font-light text-[#313c42]">generations</h2>
              </div>
              <span className="font-mono text-[10.5px] text-[#68766f]">
                {history.length} saved
                <span className="mx-2 text-[#68766f]/60">·</span>
                <button
                  type="button"
                  title="open the size-export panel for an image you didn't generate here"
                  onClick={() => sizePrepRef.current?.click()}
                  className="lowercase tracking-[0.16em] text-[#313c42] underline underline-offset-2 hover:opacity-80"
                >
                  size-prep an image
                </button>
              </span>
              <input
                ref={sizePrepRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  void openExportFromFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="mt-4 grid gap-4">
              {history.length === 0 ? (
                <p className={`rounded-[10px] border border-dashed ${hairline} px-4 py-7 text-center font-mono text-[11px] lowercase tracking-[0.14em] text-[#68766f]`}>
                  no generations yet · choose a kete, hit generate
                </p>
              ) : (
                history.map((card) => {
                  const isVideo = card.media_type === "video";
                  const stamp = new Date(card.generated_at).toLocaleString("en-NZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  });
                  const keteDisplay = getKete(card.kete)?.name ?? card.kete;
                  return (
                    <div key={card.id} className={`grid gap-2.5 rounded-[10px] border ${hairline} bg-white p-3.5`}>
                      {isVideo ? (
                        <video
                          src={card.image_url}
                          controls
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className={`block w-full max-w-[560px] rounded-[8px] border ${hairline} bg-black`}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.image_url}
                          alt={`${keteDisplay} · ${card.ar}`}
                          loading="lazy"
                          className={`block w-full max-w-[480px] rounded-[8px] border ${hairline}`}
                        />
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <span className="font-mono text-[10.5px] tracking-[0.1em] text-[#68766f]">
                          {stamp} · {keteDisplay} · {card.ar}
                          {isVideo
                            ? ` · ${VIDEO_MODELS[card.model as VideoModelKey]?.display ?? card.model ?? "video"} · ${card.duration ?? ""} · ${card.camera ?? ""}`
                            : ""}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => void downloadCardMedia(card)} className={smallBtn}>
                            download
                          </button>
                          {!isVideo ? (
                            <>
                              <button
                                type="button"
                                title="pipe url into the midjourney --sref field"
                                onClick={() => setSref(card.image_url)}
                                className={smallBtn}
                              >
                                use as sref
                              </button>
                              <button
                                type="button"
                                title="load this image into the fal redux reference field"
                                onClick={() => void loadGalleryCardAsReference(card)}
                                className={smallBtn}
                              >
                                use as reference
                              </button>
                              <button
                                type="button"
                                title="open the size-export panel for this image"
                                onClick={() => void openExportFromCard(card)}
                                className={smallBtn}
                              >
                                export sizes
                              </button>
                            </>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p className="mt-4 text-right font-mono text-[10.5px] tracking-[0.1em] text-[#68766f]">
              this session: {sessionGenerations} generation{sessionGenerations === 1 ? "" : "s"} · ~$
              {sessionCost.toFixed(2)} usd at fal.ai flux pro pricing
            </p>
          </div>
        </div>
      </div>

      {exportImage ? (
        <ExportModal image={exportImage} sourceLabel={exportLabel} onClose={() => setExportImage(null)} />
      ) : null}
    </HapaiToolShell>
  );
}

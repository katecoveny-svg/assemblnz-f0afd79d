"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandImageMaker } from "./BrandImageMaker";
import { ASSEMBL_CREATIVE_ASSETS, ASSEMBL_CREATIVE_BRAND, ASSEMBL_CREATIVE_PROFILE, ASSEMBL_CREATIVE_STARTERS, assemblImageBrief } from "@/lib/creative/assembl-brand";
import { canvasFontFamily } from "@/lib/creative/canvas-font";
import { PRODUCT_DESTINATIONS } from "@/lib/product-destinations";
import styles from "./assembl-studio.module.css";

type StudioTab = "brand" | "image";
type FilterMode = "original" | "plum" | "night";
type AspectId = "1:1" | "4:5" | "9:16" | "16:9";

interface BrandAsset {
  id: string;
  label: string;
  note: string;
  src: string;
  promptCue: string;
}

interface GenerationReceipt {
  provider?: string;
  model?: string;
  trust?: string;
}

const BRAND_ASSETS: readonly BrandAsset[] = ASSEMBL_CREATIVE_ASSETS;

const ASPECTS: Array<{
  id: AspectId;
  label: string;
  note: string;
  width: number;
  height: number;
}> = [
  { id: "1:1", label: "square", note: "1080 × 1080", width: 1080, height: 1080 },
  { id: "4:5", label: "portrait", note: "1080 × 1350", width: 1080, height: 1350 },
  { id: "9:16", label: "story", note: "1080 × 1920", width: 1080, height: 1920 },
  { id: "16:9", label: "landscape", note: "1920 × 1080", width: 1920, height: 1080 },
];

const STARTERS = ASSEMBL_CREATIVE_STARTERS;

const FILTERS: Array<{ id: FilterMode; label: string; note: string }> = [
  { id: "original", label: "original", note: "no grade" },
  { id: "plum", label: "plum filter", note: "warm editorial" },
  { id: "night", label: "plum night", note: "deeper contrast" },
];

const RAMPS: Record<Exclude<FilterMode, "original">, string[]> = {
  plum: ["#240B21", "#654A4E", "#916A70", "#FFFDFB"],
  night: ["#240B21", "#654A4E", "#916A70", "#F5F1F2"],
};

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rampColour(stops: string[], position: number) {
  const value = Math.max(0, Math.min(1, position));
  const scaled = value * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const start = hexToRgb(stops[index]);
  const end = hexToRgb(stops[index + 1]);
  return {
    r: start.r + (end.r - start.r) * mix,
    g: start.g + (end.g - start.g) * mix,
    b: start.b + (end.b - start.b) * mix,
  };
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawWordmark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  night: boolean,
) {
  const size = Math.max(22, Math.round(width * 0.034));
  const margin = Math.max(28, Math.round(width * 0.04));
  context.save();
  context.font = `500 ${size}px ${canvasFontFamily()}`;
  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  const word = "assembl";
  const wordWidth = context.measureText(word).width;
  const dotWidth = context.measureText("·").width;
  const x = width - margin - wordWidth - dotWidth;
  const y = height - margin;
  context.fillStyle = night ? "#FFFDFB" : "#240B21";
  context.fillText(word, x, y);
  context.fillStyle = "#916A70";
  context.fillText("·", x + wordWidth, y);
  context.restore();
}

function renderArtwork(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  filter: FilterMode,
  intensity: number,
  wordmark: boolean,
) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser could not prepare the image.");

  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  drawCover(context, image, width, height);

  if (filter !== "original") {
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const stops = RAMPS[filter];
    const strength = Math.max(0, Math.min(1, intensity / 100));
    const contrast = filter === "night" ? 1.22 : 1.1;

    for (let index = 0; index < pixels.length; index += 4) {
      let luminance =
        (pixels[index] * 0.299 +
          pixels[index + 1] * 0.587 +
          pixels[index + 2] * 0.114) /
        255;
      luminance = Math.max(0, Math.min(1, (luminance - 0.5) * contrast + 0.5));
      const graded = rampColour(stops, luminance);
      pixels[index] = pixels[index] * (1 - strength) + graded.r * strength;
      pixels[index + 1] =
        pixels[index + 1] * (1 - strength) + graded.g * strength;
      pixels[index + 2] =
        pixels[index + 2] * (1 - strength) + graded.b * strength;
    }
    context.putImageData(imageData, 0, 0);

    const vignette = context.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.38,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(
      1,
      filter === "night"
        ? `rgba(5,1,4,${0.36 * strength})`
        : `rgba(36,11,33,${0.16 * strength})`,
    );
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  if (wordmark) drawWordmark(context, width, height, filter === "night");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be opened."));
    image.src = src;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function looksLikePhoto(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(?:avif|heic|heif|jpe?g|png|webp)$/i.test(file.name)
  );
}

function looksLikeHeic(file: File) {
  return (
    /heic|heif/i.test(file.type) || /\.(?:heic|heif)$/i.test(file.name)
  );
}

async function browserReadyPhoto(file: File) {
  if (!looksLikeHeic(file)) return file;

  const { heicTo } = await import("heic-to/csp");
  const converted = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.9,
  });

  if (!(converted instanceof Blob)) {
    throw new Error("That HEIC photo could not be converted.");
  }
  return converted;
}

async function prepareReferenceDataUrl(src: string) {
  const image = await loadImage(src);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, 1536 / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The reference image could not be prepared.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function CreativeStudioShell({ initialTool }: { initialTool?: string }) {
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTool === "image" ? "image" : "brand");
  const [designImage, setDesignImage] = useState<{ src: string; label: string } | undefined>();
  const chooseTab = (tab: StudioTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", tab === "brand" ? "brand-maker" : "image");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="assembl home">assembl</Link>
        <nav aria-label="Primary"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio" aria-current="page">Studio</Link></nav>
      </header>
      <section className={styles.intro} aria-labelledby="studio-title">
        <div><p className={styles.eyebrow}>Studio / make with assembl</p><h1 id="studio-title">Make it look<br />like assembl.</h1><p>The same world as the homepage. Shape a post, prepare an image and download something you can use.</p></div>
        <aside className={styles.brand} aria-label="Current assembl brand">
          <div className={styles.palette}>{Object.entries(ASSEMBL_CREATIVE_BRAND.palette).map(([name, colour]) => <span key={name} style={{ background: colour }} title={`${name} ${colour}`} />)}</div>
          <strong>One shared visual direction.</strong><p>Plum. Rose. Paper. Instrument Sans. Sculptural spaces and useful things coming together.</p>
          <a href={PRODUCT_DESTINATIONS.studio.workspace} target="_blank" rel="noopener noreferrer">Open private Creative Studio ↗</a>
        </aside>
      </section>
      <nav className={styles.tools} aria-label="Creative studio tools" id="studio-tools">
        <button type="button" aria-pressed={activeTab === "brand"} onClick={() => chooseTab("brand")}>01 / Design a post</button>
        <button type="button" aria-pressed={activeTab === "image"} onClick={() => chooseTab("image")}>02 / Prepare an image</button>
        <p>Edit and export here. Review before sharing.</p>
      </nav>
      <section hidden={activeTab !== "brand"} aria-label="Design a post"><BrandImageMaker assembl imageSeed={designImage} /></section>
      <section hidden={activeTab !== "image"} aria-label="Prepare an image"><AssemblImageMaker onUseImage={(src, label) => { setDesignImage({ src, label }); chooseTab("brand"); }} /></section>
    </main>
  );
}

function AssemblImageMaker({ onUseImage }: { onUseImage: (src: string, label: string) => void }) {
  const [brief, setBrief] = useState<string>(STARTERS[0].brief);
  const [aspectId, setAspectId] = useState<AspectId>("4:5");
  const [filter, setFilter] = useState<FilterMode>("original");
  const [intensity, setIntensity] = useState(76);
  const [wordmark, setWordmark] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState(BRAND_ASSETS[0].id);
  const [referenceSrc, setReferenceSrc] = useState(BRAND_ASSETS[0].src);
  const [imageSrc, setImageSrc] = useState(BRAND_ASSETS[0].src);
  const [sourceLabel, setSourceLabel] = useState(BRAND_ASSETS[0].label);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Start from this assembl asset, upload your own, or generate a new image.",
  );
  const [receipt, setReceipt] = useState<GenerationReceipt | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspect = useMemo(
    () => ASPECTS.find((item) => item.id === aspectId) ?? ASPECTS[1],
    [aspectId],
  );
  const selectedAsset =
    BRAND_ASSETS.find((asset) => asset.id === selectedAssetId) ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return undefined;
    let active = true;

    Promise.all([loadImage(imageSrc), document.fonts.ready])
      .then(([image]) => {
        if (!active) return;
        const previewWidth = aspect.width >= aspect.height ? 960 : 720;
        const previewHeight = Math.round(
          previewWidth * (aspect.height / aspect.width),
        );
        renderArtwork(
          canvas,
          image,
          previewWidth,
          previewHeight,
          filter,
          intensity,
          wordmark,
        );
        setError("");
      })
      .catch((renderError: Error) => {
        if (active) setError(renderError.message);
      });

    return () => {
      active = false;
    };
  }, [aspect, filter, imageSrc, intensity, wordmark]);

  const chooseAsset = (asset: BrandAsset) => {
    setSelectedAssetId(asset.id);
    setReferenceSrc(asset.src);
    setImageSrc(asset.src);
    setSourceLabel(asset.label);
    setReceipt(null);
    setError("");
    setNotice(
      `${asset.label} is ready. Apply a plum treatment, download it, or use it as the generation reference.`,
    );
  };

  const upload = async (file: File | null) => {
    if (!file) return;
    if (!looksLikePhoto(file)) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Please choose a photo smaller than 25MB.");
      return;
    }
    setUploading(true);
    setError("");
    setNotice("Opening your photo in this browser…");
    try {
      const photo = await browserReadyPhoto(file);
      const dataUrl = await blobToDataUrl(photo);
      await loadImage(dataUrl);
      setSelectedAssetId("upload");
      setReferenceSrc(dataUrl);
      setImageSrc(dataUrl);
      setSourceLabel(file.name);
      setReceipt(null);
      setError("");
      setNotice(
        "Your upload stays in this browser unless you choose generate. Plum treatment is ready now.",
      );
    } catch {
      setError(
        "That photo could not be opened. Try a JPEG, PNG, WebP or HEIC photo smaller than 25MB.",
      );
      setNotice("Your photo has not left your device.");
    } finally {
      setUploading(false);
    }
  };

  const generate = async () => {
    if (brief.trim().length < 3 || busy) {
      setError("Add a short image brief first.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("Preparing one on-brand draft for you to review…");

    try {
      const referenceDataUrl = referenceSrc
        ? await prepareReferenceDataUrl(referenceSrc)
        : undefined;
      const response = await fetch("/api/creative/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: brief.trim(),
          brandProfile: ASSEMBL_CREATIVE_PROFILE,
          brandAssetId: selectedAsset?.id,
          aspectRatio: aspectId,
          count: 1,
          agent: "prism",
          referenceDataUrl,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        images?: string[];
        receipt?: GenerationReceipt;
        remaining?: number;
        error?: string;
        notConfigured?: boolean;
      };

      if (!response.ok || data.error || !data.images?.[0]) {
        if (data.notConfigured) {
          throw new Error(
            "Image generation is not connected on this release yet. You can still upload or use the included assembl assets.",
          );
        }
        throw new Error(data.error || "The image could not be generated.");
      }

      setImageSrc(data.images[0]);
      setReferenceSrc(data.images[0]);
      setSelectedAssetId("generated");
      setSourceLabel("generated draft");
      setReceipt(data.receipt ?? null);
      setNotice(
        `One draft is ready for review.${
          typeof data.remaining === "number"
            ? ` ${data.remaining} generations remain in this hourly window.`
            : ""
        }`,
      );
    } catch (generationError) {
      setError((generationError as Error).message);
      setNotice(
        "The included assembl assets and upload filter are still available.",
      );
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!imageSrc) return;
    setError("");
    setNotice("Preparing the full-size PNG…");
    try {
      await document.fonts.ready;
      const image = await loadImage(imageSrc);
      const canvas = document.createElement("canvas");
      renderArtwork(
        canvas,
        image,
        aspect.width,
        aspect.height,
        filter,
        intensity,
        wordmark,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("The PNG could not be prepared.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assembl-image-${aspectId.replace(":", "x")}-${filter}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Full-size PNG downloaded to your device.");
    } catch (downloadError) {
      setError((downloadError as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-8 md:px-7 md:py-12 min-[1920px]:max-w-[2200px] min-[1920px]:px-12 min-[1920px]:py-20">
      <p className="mb-6 max-w-[720px] text-base leading-7 text-[#F5F1F2]">Choose a current Assembl reference, upload your own, or generate a draft. Use the result in your post, or export the image. Nothing publishes automatically.</p>

      <div className="grid gap-7 xl:grid-cols-[0.82fr_1.18fr] min-[1920px]:gap-10">
        <div className="space-y-6 min-[1920px]:space-y-10">
          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <div className="mb-4">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#F5F1F2]">
                  01 · Starting point
                </p>
                <h2 className="mt-2 font-sans text-[24px] font-medium tracking-[-0.03em] text-[#FFFDFB]">
                  assembl assets
                </h2>
              </div>
            </div>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-12 cursor-pointer items-center justify-center border border-[#916A70] bg-[#F5F1F2] px-4 py-3 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-within:ring-2 focus-within:ring-[#FFFDFB] focus-within:ring-offset-2 focus-within:ring-offset-[#240B21]">
                {uploading ? "opening photo…" : "choose a photo"}
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    void upload(input.files?.[0] ?? null).finally(() => {
                      input.value = "";
                    });
                  }}
                />
              </label>
              <label className="flex min-h-12 cursor-pointer items-center justify-center border border-[#916A70]/55 px-4 py-3 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#F5F1F2] outline-none hover:border-[#916A70] focus-within:ring-2 focus-within:ring-[#916A70] focus-within:ring-offset-2 focus-within:ring-offset-[#240B21]">
                take a photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    void upload(input.files?.[0] ?? null).finally(() => {
                      input.value = "";
                    });
                  }}
                />
              </label>
            </div>
            <p className="mb-4 font-mono text-[12px] leading-4 uppercase tracking-[0.08em] text-[#B6ACB3]">
              Camera roll, files or camera · JPEG, PNG, WebP and HEIC · up to 25MB
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BRAND_ASSETS.map((asset) => {
                const selected = selectedAssetId === asset.id;
                return (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => chooseAsset(asset)}
                    aria-pressed={selected}
                    className={`group overflow-hidden border text-left outline-none focus-visible:ring-2 focus-visible:ring-[#916A70] ${
                      selected
                        ? "border-[#916A70]"
                        : "border-white/10 hover:border-[#916A70]/55"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.src}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span className="block bg-[#240B21] p-3">
                      <span className="block text-[12px] font-medium text-[#FFFDFB]">
                        {asset.label}
                      </span>
                      <span className="mt-1 block font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                        {asset.note}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#F5F1F2]">
              02 · Image brief
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.1em] text-[#B6ACB3]">
                what should the image show?
              </span>
              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={5}
                className="w-full resize-y border border-white/15 bg-[#240B21] px-4 py-3 text-[14px] leading-6 text-[#FFFDFB] outline-none placeholder:text-[#8A7B85] focus:border-[#916A70] focus:ring-2 focus:ring-[#916A70]/20"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  type="button"
                  key={starter.label}
                  onClick={() => setBrief(starter.brief)}
                  className="border border-white/15 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3] outline-none hover:border-[#916A70] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#916A70]"
                >
                  {starter.label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.1em] text-[#B6ACB3]">
                social format
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ASPECTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectId(item.id)}
                    aria-pressed={aspectId === item.id}
                    className={`border px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#916A70] ${
                      aspectId === item.id
                        ? "border-[#916A70] bg-[#F5F1F2] text-[#240B21]"
                        : "border-white/15 bg-[#240B21] text-[#F5F1F2]"
                    }`}
                  >
                    <span className="block text-[12px] font-medium">
                      {item.label}
                    </span>
                    <span className="mt-1 block font-mono text-[12px] uppercase tracking-[0.06em] opacity-70">
                      {item.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void generate()}
              disabled={busy}
              className="mt-5 min-h-12 w-full border border-[#916A70] bg-[#F5F1F2] px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#FFFDFB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#240B21] disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "preparing one draft…" : "generate on-brand image"}
            </button>
            <p className="mt-3 font-mono text-[12px] uppercase leading-4 tracking-[0.06em] text-[#8A7B85]">
              Your brief and chosen reference are sent securely to the
              generation provider when you press generate. Review every draft
              before use.
            </p>
          </section>
        </div>

        <div className="xl:sticky xl:top-[112px] xl:self-start">
          <section className="border border-[#916A70]/25 bg-[#240B21] p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#F5F1F2]">
                  03 · Plum treatment
                </p>
                <h2 className="mt-2 font-sans text-[24px] font-medium tracking-[-0.03em] text-[#FFFDFB]">
                  {sourceLabel}
                </h2>
              </div>
              {receipt?.provider && (
                <p className="font-mono text-[12px] uppercase tracking-[0.07em] text-[#B6ACB3]">
                  {receipt.provider} · {receipt.model}
                </p>
              )}
            </div>

            <div className="mt-5 overflow-hidden border border-white/10 bg-[#0B030A]">
              <canvas
                ref={canvasRef}
                className="block h-auto max-h-[68svh] w-full object-contain"
                aria-label="Filtered image preview"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={`border px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#916A70] ${
                    filter === item.id
                      ? "border-[#916A70] bg-[#F5F1F2] text-[#240B21]"
                      : "border-white/15 bg-[#240B21] text-[#F5F1F2]"
                  }`}
                >
                  <span className="block text-[12px] font-medium">
                    {item.label}
                  </span>
                  <span className="mt-1 hidden font-mono text-[12px] uppercase tracking-[0.06em] opacity-65 sm:block">
                    {item.note}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label>
                <span className="mb-2 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3]">
                  filter strength <span>{intensity}%</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                  disabled={filter === "original"}
                  className="h-2 w-full cursor-pointer accent-[#916A70] disabled:opacity-35"
                />
              </label>
              <label className="flex min-h-10 items-center gap-2 border border-white/15 px-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                <input
                  type="checkbox"
                  checked={wordmark}
                  onChange={(event) => setWordmark(event.target.checked)}
                  className="accent-[#916A70]"
                />
                add wordmark
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={styles.toolButton} onClick={async () => {
                try {
                  await document.fonts.ready;
                  const canvas = document.createElement("canvas");
                  renderArtwork(canvas, await loadImage(imageSrc), aspect.width, aspect.height, filter, intensity, false);
                  onUseImage(canvas.toDataURL("image/png"), sourceLabel);
                } catch (e) { setError((e as Error).message); }
              }}>Use image in my post</button>
              <button type="button" className={styles.toolButton} onClick={() => {
                const blob = new Blob([assemblImageBrief(brief, aspectId, selectedAsset?.promptCue)], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "assembl-image-brief.txt"; a.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                setNotice("Image brief downloaded with the current assembl art direction.");
              }}>Download image brief</button>
              <button
                type="button"
                onClick={() => void download()}
                className="min-h-11 flex-1 border border-[#916A70] bg-[#F5F1F2] px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.11em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#FFFDFB]"
              >
                download full-size PNG
              </button>
              <button
                type="button"
                onClick={() => {
                  setReferenceSrc("");
                  setSelectedAssetId("none");
                  setNotice(
                    "Reference cleared. The current preview remains available to filter and download.",
                  );
                }}
                className="border border-white/15 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3] outline-none hover:border-[#916A70] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#916A70]"
              >
                clear reference
              </button>
            </div>

            <p
              className="mt-4 min-h-5 font-mono text-[12px] uppercase leading-4 tracking-[0.07em] text-[#B6ACB3]"
              aria-live="polite"
            >
              {notice}
            </p>
            {error && (
              <p
                className="mt-3 border border-[#916A70]/45 bg-[#240B21] px-3 py-3 text-[12px] leading-5 text-[#FFFDFB]"
                role="alert"
              >
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

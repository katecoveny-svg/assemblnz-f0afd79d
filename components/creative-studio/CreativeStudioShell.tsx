"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type StudioTab = "image" | "design" | "captions";
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

const TABS: Array<{
  id: StudioTab;
  label: string;
  note: string;
}> = [
  {
    id: "image",
    label: "create an image",
    note: "generate, upload or start from an assembl asset",
  },
  {
    id: "design",
    label: "style a graphic",
    note: "materials, motion, social sizes and exports",
  },
  {
    id: "captions",
    label: "write captions",
    note: "six platform versions in the assembl voice",
  },
];

const BRAND_ASSETS: BrandAsset[] = [
  {
    id: "plum-field",
    label: "plum field",
    note: "fluid material · landscape",
    src: "/images/site/assembl-shader-8471.png",
    promptCue:
      "fluid plum material, soft depth, warm mineral highlights and generous negative space",
  },
  {
    id: "evidence-vessel",
    label: "evidence vessel",
    note: "sculptural object · 16:9",
    src: "/images/site/hero-evidence-vessel.png",
    promptCue:
      "a single sculptural vessel, assembled physical detail, grounded shadow and editorial restraint",
  },
  {
    id: "macro-material",
    label: "macro material",
    note: "surface detail · 4:3",
    src: "/images/site/vessel-macro-proof-detail.png",
    promptCue:
      "macro material study, tactile layers, graphite detail and precise studio lighting",
  },
  {
    id: "aotearoa-light",
    label: "Aotearoa light",
    note: "coastal atmosphere · 16:9",
    src: "/images/site/landscape-coast-aotearoa.png",
    promptCue:
      "Aotearoa coastal light, real landscape atmosphere, restrained colour and no tourism clichés",
  },
];

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

const STARTERS = [
  {
    label: "active journey",
    brief:
      "An editorial flat-lay showing a customer journey being assembled during a genuine wait. Real paper, graphite annotations and one clear prepared handoff.",
  },
  {
    label: "sculptural object",
    brief:
      "A single sculptural object assembling from plum paper, graphite linework and restrained rose-gold material. Physical, precise and beautifully lit.",
  },
  {
    label: "Aotearoa landscape",
    brief:
      "A wide atmospheric Aotearoa landscape at first light, with a subtle sense of separate parts resolving into one useful path.",
  },
  {
    label: "human handoff",
    brief:
      "Two sets of hands reviewing a clear prepared brief at a real worktable. Warm New Zealand light, calm competence and no staged technology clichés.",
  },
];

const FILTERS: Array<{ id: FilterMode; label: string; note: string }> = [
  { id: "original", label: "original", note: "no grade" },
  { id: "plum", label: "plum filter", note: "warm editorial" },
  { id: "night", label: "plum night", note: "deeper contrast" },
];

const RAMPS: Record<Exclude<FilterMode, "original">, string[]> = {
  plum: ["#160713", "#654A4E", "#E9BCA9", "#FFFDFB"],
  night: ["#050104", "#240B21", "#654A4E", "#F5F1F2"],
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
  context.font = `500 ${size}px "Instrument Sans", Arial, sans-serif`;
  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  const word = "assembl";
  const wordWidth = context.measureText(word).width;
  const dotWidth = context.measureText("·").width;
  const x = width - margin - wordWidth - dotWidth;
  const y = height - margin;
  context.fillStyle = night ? "#FFFDFB" : "#240B21";
  context.fillText(word, x, y);
  context.fillStyle = "#E9BCA9";
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

function generationBrief(
  brief: string,
  aspect: AspectId,
  reference: BrandAsset | null,
) {
  return [
    brief.trim(),
    "",
    "assembl visual direction:",
    "Create an original, premium editorial image for an Aotearoa New Zealand audience.",
    "Use deep plum #240B21, chalk #F5F1F2, paper #FFFDFB, graphite #2E2C2C and restrained rose gold #E9BCA9.",
    "Prefer real materials, physical depth, one clear subject, useful negative space and natural Aotearoa light.",
    "No green cast, generic gradients, sparkle, chatbot imagery, floating technology or embedded text.",
    "Do not add a logo. The studio applies the assembl wordmark after generation.",
    `Compose for ${aspect} without placing important detail at the edges.`,
    reference ? `Reference direction: ${reference.promptCue}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function CreativeStudioShell() {
  const [activeTab, setActiveTab] = useState<StudioTab>("image");
  const [visited, setVisited] = useState<Set<StudioTab>>(
    () => new Set<StudioTab>(["image"]),
  );

  const chooseTab = (tab: StudioTab) => {
    setActiveTab(tab);
    setVisited((current) => new Set(current).add(tab));
  };

  return (
    <div className="min-h-[100svh] bg-[#120510] text-[#F5F1F2]">
      <header className="flex min-h-14 items-center justify-between gap-5 border-b border-white/10 bg-[#240B21] px-4 py-3 md:min-h-16 md:px-7">
        <Link
          href="/"
          aria-label="assembl home"
          className="rounded-sm text-[22px] font-medium tracking-[-0.055em] text-[#FFFDFB] outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#240B21]"
        >
          assembl<span className="text-[#E9BCA9]">·</span>
        </Link>
        <div className="min-w-0 text-center">
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-[#FFFDFB] md:text-[10px]">
            Creative studio
          </p>
          <p className="mt-1 hidden font-mono text-[7px] uppercase tracking-[0.12em] text-[#B6ACB3] sm:block md:text-[8px]">
            Generate securely · edit in your browser · download to your device
          </p>
        </div>
        <Link
          href="/"
          className="rounded-sm font-mono text-[8px] font-medium uppercase tracking-[0.12em] text-[#F5F1F2] outline-none hover:text-[#E9BCA9] focus-visible:ring-2 focus-visible:ring-[#E9BCA9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#240B21] md:text-[9px]"
        >
          Back to site <span aria-hidden="true">↙</span>
        </Link>
      </header>

      <nav
        aria-label="Creative studio tools"
        className="sticky top-0 z-30 border-b border-white/10 bg-[#120510]/95 px-3 py-3 backdrop-blur md:px-7"
      >
        <div className="mx-auto grid max-w-[1180px] grid-cols-3 gap-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => chooseTab(tab.id)}
                aria-pressed={active}
                className={`min-w-0 border px-3 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#E9BCA9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120510] md:px-5 ${
                  active
                    ? "border-[#E9BCA9] bg-[#E9BCA9] text-[#240B21]"
                    : "border-white/15 bg-[#240B21] text-[#F5F1F2] hover:border-[#E9BCA9]/70"
                }`}
              >
                <span className="block text-[12px] font-medium leading-tight tracking-[-0.01em] md:text-[15px]">
                  {tab.label}
                </span>
                <span
                  className={`mt-1 hidden font-mono text-[7px] uppercase tracking-[0.08em] md:block md:text-[8px] ${
                    active ? "text-[#654A4E]" : "text-[#B6ACB3]"
                  }`}
                >
                  {tab.note}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <section hidden={activeTab !== "image"}>
        <AssemblImageMaker />
      </section>

      {visited.has("design") && (
        <section hidden={activeTab !== "design"} className="bg-[#120510]">
          <iframe
            src="/tools/assembl-creative-studio.html#studio"
            title="assembl graphic and motion studio"
            className="h-[calc(100svh-120px)] min-h-[720px] w-full border-0 bg-[#120510]"
            sandbox="allow-scripts allow-downloads"
            referrerPolicy="no-referrer"
          />
        </section>
      )}

      {visited.has("captions") && (
        <section hidden={activeTab !== "captions"} className="bg-[#120510]">
          <iframe
            src="/tools/assembl-creative-studio.html#captions"
            title="assembl caption studio"
            className="h-[calc(100svh-120px)] min-h-[760px] w-full border-0 bg-[#120510]"
            sandbox="allow-scripts allow-downloads"
            referrerPolicy="no-referrer"
          />
        </section>
      )}
    </div>
  );
}

function AssemblImageMaker() {
  const [brief, setBrief] = useState(STARTERS[0].brief);
  const [aspectId, setAspectId] = useState<AspectId>("4:5");
  const [filter, setFilter] = useState<FilterMode>("plum");
  const [intensity, setIntensity] = useState(76);
  const [wordmark, setWordmark] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState(BRAND_ASSETS[0].id);
  const [referenceSrc, setReferenceSrc] = useState(BRAND_ASSETS[0].src);
  const [imageSrc, setImageSrc] = useState(BRAND_ASSETS[0].src);
  const [sourceLabel, setSourceLabel] = useState(BRAND_ASSETS[0].label);
  const [busy, setBusy] = useState(false);
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

    loadImage(imageSrc)
      .then((image) => {
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
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10MB.");
      return;
    }
    try {
      const dataUrl = await blobToDataUrl(file);
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
      setError("The upload could not be opened.");
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
          brief: generationBrief(brief, aspectId, selectedAsset),
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
    <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-7 md:py-12">
      <div className="mb-8 grid gap-5 border-b border-white/10 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#E9BCA9]">
            Image maker · draft then review
          </p>
          <h1 className="mt-4 max-w-[760px] font-sans text-[clamp(36px,6vw,74px)] font-medium leading-[0.94] tracking-[-0.055em] text-[#FFFDFB]">
            create the image. grade it plum.
          </h1>
        </div>
        <p className="max-w-[560px] text-[14px] leading-6 text-[#B6ACB3] md:text-[16px]">
          Begin with an assembl asset, upload a photograph or describe a new
          image. The plum filter, social crop and wordmark are applied here
          before you download. Nothing publishes automatically.
        </p>
      </div>

      <div className="grid gap-7 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#E9BCA9]">
                  01 · Starting point
                </p>
                <h2 className="mt-2 font-sans text-[24px] font-medium tracking-[-0.03em] text-[#FFFDFB]">
                  assembl assets
                </h2>
              </div>
              <label className="cursor-pointer border border-[#E9BCA9]/45 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#F5F1F2] hover:border-[#E9BCA9] focus-within:ring-2 focus-within:ring-[#E9BCA9]">
                upload image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void upload(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BRAND_ASSETS.map((asset) => {
                const selected = selectedAssetId === asset.id;
                return (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => chooseAsset(asset)}
                    aria-pressed={selected}
                    className={`group overflow-hidden border text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] ${
                      selected
                        ? "border-[#E9BCA9]"
                        : "border-white/10 hover:border-[#E9BCA9]/55"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.src}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span className="block bg-[#120510] p-3">
                      <span className="block text-[12px] font-medium text-[#FFFDFB]">
                        {asset.label}
                      </span>
                      <span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                        {asset.note}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#E9BCA9]">
              02 · Image brief
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.1em] text-[#B6ACB3]">
                what should the image show?
              </span>
              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={5}
                className="w-full resize-y border border-white/15 bg-[#120510] px-4 py-3 text-[14px] leading-6 text-[#FFFDFB] outline-none placeholder:text-[#8A7B85] focus:border-[#E9BCA9] focus:ring-2 focus:ring-[#E9BCA9]/20"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  type="button"
                  key={starter.label}
                  onClick={() => setBrief(starter.brief)}
                  className="border border-white/15 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.08em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
                >
                  {starter.label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.1em] text-[#B6ACB3]">
                social format
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ASPECTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectId(item.id)}
                    aria-pressed={aspectId === item.id}
                    className={`border px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] ${
                      aspectId === item.id
                        ? "border-[#E9BCA9] bg-[#E9BCA9] text-[#240B21]"
                        : "border-white/15 bg-[#120510] text-[#F5F1F2]"
                    }`}
                  >
                    <span className="block text-[11px] font-medium">
                      {item.label}
                    </span>
                    <span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.06em] opacity-70">
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
              className="mt-5 min-h-12 w-full border border-[#E9BCA9] bg-[#E9BCA9] px-5 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#FFFDFB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#240B21] disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "preparing one draft…" : "generate on-brand image"}
            </button>
            <p className="mt-3 font-mono text-[7px] uppercase leading-4 tracking-[0.06em] text-[#8A7B85]">
              Your brief and chosen reference are sent securely to the
              generation provider when you press generate. Review every draft
              before use.
            </p>
          </section>
        </div>

        <div className="xl:sticky xl:top-[112px] xl:self-start">
          <section className="border border-[#E9BCA9]/25 bg-[#240B21] p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#E9BCA9]">
                  03 · Plum treatment
                </p>
                <h2 className="mt-2 font-sans text-[24px] font-medium tracking-[-0.03em] text-[#FFFDFB]">
                  {sourceLabel}
                </h2>
              </div>
              {receipt?.provider && (
                <p className="font-mono text-[7px] uppercase tracking-[0.07em] text-[#B6ACB3]">
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
                  className={`border px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] ${
                    filter === item.id
                      ? "border-[#E9BCA9] bg-[#E9BCA9] text-[#240B21]"
                      : "border-white/15 bg-[#120510] text-[#F5F1F2]"
                  }`}
                >
                  <span className="block text-[11px] font-medium">
                    {item.label}
                  </span>
                  <span className="mt-1 hidden font-mono text-[7px] uppercase tracking-[0.06em] opacity-65 sm:block">
                    {item.note}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label>
                <span className="mb-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.09em] text-[#B6ACB3]">
                  filter strength <span>{intensity}%</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                  disabled={filter === "original"}
                  className="h-2 w-full cursor-pointer accent-[#E9BCA9] disabled:opacity-35"
                />
              </label>
              <label className="flex min-h-10 items-center gap-2 border border-white/15 px-3 font-mono text-[8px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                <input
                  type="checkbox"
                  checked={wordmark}
                  onChange={(event) => setWordmark(event.target.checked)}
                  className="accent-[#E9BCA9]"
                />
                add wordmark
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void download()}
                className="min-h-11 flex-1 border border-[#E9BCA9] bg-[#E9BCA9] px-4 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.11em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#FFFDFB]"
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
                className="border border-white/15 px-4 py-3 font-mono text-[8px] uppercase tracking-[0.09em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
              >
                clear reference
              </button>
            </div>

            <p
              className="mt-4 min-h-5 font-mono text-[8px] uppercase leading-4 tracking-[0.07em] text-[#B6ACB3]"
              aria-live="polite"
            >
              {notice}
            </p>
            {error && (
              <p
                className="mt-3 border border-[#E9BCA9]/45 bg-[#120510] px-3 py-3 text-[12px] leading-5 text-[#FFFDFB]"
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BrandAspectId = "linkedin" | "square" | "portrait" | "story";
type BrandLayout = "editorial" | "centred" | "statement";

interface BrandFormat {
  id: BrandAspectId;
  label: string;
  note: string;
  width: number;
  height: number;
}

interface BrandKit {
  brandName: string;
  primary: string;
  accent: string;
  paper: string;
  headline: string;
  supporting: string;
  layout: BrandLayout;
  creditAssembl: boolean;
}

const BRAND_FORMATS: BrandFormat[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    note: "1200 × 627",
    width: 1200,
    height: 627,
  },
  {
    id: "square",
    label: "square",
    note: "1080 × 1080",
    width: 1080,
    height: 1080,
  },
  {
    id: "portrait",
    label: "portrait",
    note: "1080 × 1350",
    width: 1080,
    height: 1350,
  },
  {
    id: "story",
    label: "story",
    note: "1080 × 1920",
    width: 1080,
    height: 1920,
  },
];

const BRAND_PRESETS = [
  {
    label: "plum",
    primary: "#240B21",
    accent: "#E9BCA9",
    paper: "#FFFDFB",
  },
  {
    label: "coast",
    primary: "#17384D",
    accent: "#D6A55A",
    paper: "#F5F0E7",
  },
  {
    label: "pounamu",
    primary: "#173B34",
    accent: "#D2A04C",
    paper: "#F7F3EA",
  },
];

const DEFAULT_KIT: BrandKit = {
  brandName: "your brand",
  primary: "#240B21",
  accent: "#E9BCA9",
  paper: "#FFFDFB",
  headline: "Make the useful thing visible.",
  supporting:
    "One clear idea, prepared in your colours and ready for the place you want to share it.",
  layout: "editorial",
  creditAssembl: true,
};

const STORAGE_KEY = "assembl-creative-studio-brand-kit-v1";

function readFileAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadBrowserImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be opened."));
    image.src = src;
  });
}

function isSupportedImage(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(?:avif|heic|heif|jpe?g|png|webp)$/i.test(file.name)
  );
}

function isHeic(file: File) {
  return /heic|heif/i.test(file.type) || /\.(?:heic|heif)$/i.test(file.name);
}

async function makeBrowserReady(file: File) {
  if (!isHeic(file)) return file;
  const { heicTo } = await import("heic-to/csp");
  const converted = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.9,
  });
  if (!(converted instanceof Blob)) {
    throw new Error("That HEIC image could not be converted.");
  }
  return converted;
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function readableInk(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.58 ? "#20141E" : "#FFFDFB";
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

function fittedLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.join(" ").length < text.trim().length && lines.length) {
    let final = lines[lines.length - 1];
    while (final.length > 1 && context.measureText(`${final}…`).width > maxWidth) {
      final = final.slice(0, -1);
    }
    lines[lines.length - 1] = `${final.trim()}…`;
  }
  return lines;
}

function drawBrandArtwork(
  canvas: HTMLCanvasElement,
  format: BrandFormat,
  kit: BrandKit,
  background: HTMLImageElement | null,
  logo: HTMLImageElement | null,
  preview = false,
) {
  const previewScale = preview
    ? Math.min(1, (format.width >= format.height ? 940 : 720) / format.width)
    : 1;
  const width = Math.max(1, Math.round(format.width * previewScale));
  const height = Math.max(1, Math.round(format.height * previewScale));
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the artwork.");

  const scale = width / format.width;
  const margin = Math.round(Math.max(42, format.width * 0.06) * scale);
  const primaryInk = readableInk(kit.primary);
  context.clearRect(0, 0, width, height);
  context.fillStyle = kit.primary;
  context.fillRect(0, 0, width, height);

  if (background) {
    drawCover(context, background, width, height);
    const wash = context.createLinearGradient(0, 0, width, height);
    const strong = kit.layout === "centred" ? 0.76 : 0.9;
    wash.addColorStop(0, rgba(kit.primary, strong));
    wash.addColorStop(0.58, rgba(kit.primary, kit.layout === "statement" ? 0.42 : 0.62));
    wash.addColorStop(1, rgba(kit.primary, 0.18));
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
  } else {
    const field = context.createLinearGradient(0, 0, width, height);
    field.addColorStop(0, kit.primary);
    field.addColorStop(0.7, rgba(kit.accent, 0.38));
    field.addColorStop(1, kit.paper);
    context.fillStyle = field;
    context.fillRect(0, 0, width, height);
  }

  context.fillStyle = kit.accent;
  context.fillRect(0, 0, width, Math.max(5, Math.round(11 * scale)));

  const plateHeight = Math.round(Math.max(72, format.height * 0.075) * scale);
  const plateWidth = Math.round(Math.max(250, format.width * 0.29) * scale);
  context.save();
  context.globalAlpha = 0.94;
  context.fillStyle = kit.paper;
  context.fillRect(margin, margin, plateWidth, plateHeight);
  context.restore();

  if (logo) {
    const pad = Math.round(18 * scale);
    const maxLogoWidth = plateWidth - pad * 2;
    const maxLogoHeight = plateHeight - pad * 2;
    const logoScale = Math.min(
      maxLogoWidth / logo.naturalWidth,
      maxLogoHeight / logo.naturalHeight,
    );
    const logoWidth = logo.naturalWidth * logoScale;
    const logoHeight = logo.naturalHeight * logoScale;
    context.drawImage(
      logo,
      margin + pad,
      margin + (plateHeight - logoHeight) / 2,
      logoWidth,
      logoHeight,
    );
  } else {
    context.fillStyle = readableInk(kit.paper);
    context.font = `600 ${Math.round(Math.max(24, format.width * 0.027) * scale)}px "Instrument Sans", Arial, sans-serif`;
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillText(
      kit.brandName.trim() || "your brand",
      margin + Math.round(20 * scale),
      margin + plateHeight / 2,
      plateWidth - Math.round(40 * scale),
    );
  }

  const isLandscape = format.width > format.height;
  const centred = kit.layout === "centred";
  const statement = kit.layout === "statement";
  const contentWidth = centred
    ? width - margin * 2.2
    : isLandscape
      ? width * 0.62
      : width - margin * 2;
  const headlineSize = Math.round(
    Math.max(
      44,
      (isLandscape ? format.width * 0.064 : format.width * 0.085) *
        (statement ? 1.08 : 1),
    ) * scale,
  );
  const lineHeight = Math.round(headlineSize * 0.91);
  const x = centred ? width / 2 : margin;
  const startY = statement
    ? Math.round(height * 0.58)
    : centred
      ? Math.round(height * 0.34)
      : Math.round(height * (isLandscape ? 0.37 : 0.34));

  context.textAlign = centred ? "center" : "left";
  context.textBaseline = "top";
  context.fillStyle = primaryInk;
  context.font = `600 ${headlineSize}px "Instrument Sans", Arial, sans-serif`;
  const headlineLines = fittedLines(
    context,
    kit.headline || "Make something worth sharing.",
    contentWidth,
    isLandscape ? 3 : 5,
  );
  headlineLines.forEach((line, index) => {
    context.fillText(line, x, startY + index * lineHeight);
  });

  const supportY = startY + headlineLines.length * lineHeight + Math.round(28 * scale);
  const supportSize = Math.round(Math.max(18, format.width * 0.021) * scale);
  context.font = `400 ${supportSize}px "Instrument Sans", Arial, sans-serif`;
  context.fillStyle = primaryInk;
  context.globalAlpha = 0.82;
  const supportLines = fittedLines(
    context,
    kit.supporting,
    Math.min(contentWidth, isLandscape ? width * 0.52 : contentWidth),
    isLandscape ? 3 : 4,
  );
  supportLines.forEach((line, index) => {
    context.fillText(line, x, supportY + index * Math.round(supportSize * 1.35));
  });
  context.globalAlpha = 1;

  const footerSize = Math.round(Math.max(13, format.width * 0.0125) * scale);
  const footerBandHeight = Math.round(margin * 1.55);
  context.fillStyle = rgba(kit.primary, 0.84);
  context.fillRect(0, height - footerBandHeight, width, footerBandHeight);
  context.font = `500 ${footerSize}px "IBM Plex Mono", monospace`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = primaryInk;
  context.globalAlpha = 0.72;
  context.fillText(
    `${format.label.toUpperCase()} · ${format.width}×${format.height}`,
    margin,
    height - margin,
  );
  if (kit.creditAssembl) {
    context.textAlign = "right";
    context.fillText("MADE WITH ASSEMBL.CO.NZ", width - margin, height - margin);
  }
  context.globalAlpha = 1;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BrandImageMaker() {
  const [kit, setKit] = useState<BrandKit>(DEFAULT_KIT);
  const [formatId, setFormatId] = useState<BrandAspectId>("linkedin");
  const [backgroundSrc, setBackgroundSrc] = useState(
    "/images/site/assembl-shader-8471.png",
  );
  const [backgroundLabel, setBackgroundLabel] = useState("assembl material field");
  const [logoSrc, setLogoSrc] = useState("");
  const [logoLabel, setLogoLabel] = useState("brand name set in type");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Add your brand, shape the message, then download or share the finished PNG.",
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const format = useMemo(
    () => BRAND_FORMATS.find((item) => item.id === formatId) ?? BRAND_FORMATS[0],
    [formatId],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved) as Partial<BrandKit>;
        setKit((current) => ({ ...current, ...parsed }));
        setNotice("Your saved brand kit is ready on this device.");
      } catch {
        // A damaged local preference should never block the maker.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let active = true;

    Promise.all([
      backgroundSrc ? loadBrowserImage(backgroundSrc) : Promise.resolve(null),
      logoSrc ? loadBrowserImage(logoSrc) : Promise.resolve(null),
      document.fonts.ready,
    ])
      .then(([background, logo]) => {
        if (!active) return;
        drawBrandArtwork(canvas, format, kit, background, logo, true);
        setError("");
      })
      .catch((renderError: Error) => {
        if (active) setError(renderError.message);
      });

    return () => {
      active = false;
    };
  }, [backgroundSrc, format, kit, logoSrc]);

  const updateKit = <Key extends keyof BrandKit>(key: Key, value: BrandKit[Key]) => {
    setKit((current) => ({ ...current, [key]: value }));
  };

  const uploadImage = async (file: File | null, kind: "background" | "logo") => {
    if (!file) return;
    const limit = kind === "logo" ? 8 : 25;
    if (!isSupportedImage(file)) {
      setError("Please choose a JPEG, PNG, WebP or HEIC image.");
      return;
    }
    if (file.size > limit * 1024 * 1024) {
      setError(`Please choose an image smaller than ${limit}MB.`);
      return;
    }
    setBusy(true);
    setError("");
    setNotice(`Opening your ${kind} in this browser…`);
    try {
      const ready = await makeBrowserReady(file);
      const dataUrl = await readFileAsDataUrl(ready);
      await loadBrowserImage(dataUrl);
      if (kind === "background") {
        setBackgroundSrc(dataUrl);
        setBackgroundLabel(file.name);
      } else {
        setLogoSrc(dataUrl);
        setLogoLabel(file.name);
      }
      setNotice(
        `Your ${kind} is ready. It stays in this browser and is not uploaded by this maker.`,
      );
    } catch (uploadError) {
      setError((uploadError as Error).message);
      setNotice("Nothing was uploaded.");
    } finally {
      setBusy(false);
    }
  };

  const makeBlob = async () => {
    await document.fonts.ready;
    const [background, logo] = await Promise.all([
      backgroundSrc ? loadBrowserImage(backgroundSrc) : Promise.resolve(null),
      logoSrc ? loadBrowserImage(logoSrc) : Promise.resolve(null),
    ]);
    const canvas = document.createElement("canvas");
    drawBrandArtwork(canvas, format, kit, background, logo);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("The PNG could not be prepared.");
    return blob;
  };

  const filename = () => {
    const name = (kit.brandName || "brand")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${name || "brand"}-${format.id}-assembl-maker.png`;
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("Preparing the full-size PNG…");
    try {
      downloadBlob(await makeBlob(), filename());
      setNotice("Full-size PNG downloaded. It is ready to post or send.");
    } catch (downloadError) {
      setError((downloadError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("Preparing your image for sharing…");
    try {
      const blob = await makeBlob();
      const file = new File([blob], filename(), { type: "image/png" });
      const shareData: ShareData = {
        files: [file],
        title: `${kit.brandName || "Your brand"} social image`,
        text: kit.headline,
      };
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setNotice("Image handed to your device’s share menu.");
      } else {
        downloadBlob(blob, filename());
        setNotice(
          "Direct image sharing is not available in this browser, so the PNG was downloaded for you.",
        );
      }
    } catch (shareError) {
      if ((shareError as DOMException).name === "AbortError") {
        setNotice("Share cancelled. Your draft is still here.");
      } else {
        setError((shareError as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  const copyMakerLink = async () => {
    const link = `${window.location.origin}/creative-studio?tool=brand-maker#studio-tools`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Brand image maker link copied. Send it to someone who needs it.");
    } catch {
      setNotice(`Share this link: ${link}`);
    }
  };

  const saveKit = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kit));
      setNotice("Brand name, colours and layout saved on this device.");
    } catch {
      setError("This browser could not save the brand kit locally.");
    }
  };

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-8 md:px-7 md:py-12 min-[1920px]:max-w-[2200px] min-[1920px]:px-12 min-[1920px]:py-20">
      <div className="mb-8 grid gap-5 border-b border-white/10 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end min-[1920px]:mb-12 min-[1920px]:gap-12 min-[1920px]:pb-12">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#E9BCA9] min-[1920px]:text-[12px]">
            Free brand image maker · no account needed
          </p>
          <h2 className="mt-4 max-w-[940px] font-sans text-[clamp(42px,6vw,92px)] font-medium leading-[0.9] tracking-[-0.06em] text-[#FFFDFB] min-[1920px]:mt-7 min-[1920px]:max-w-[1320px] min-[1920px]:text-[clamp(92px,5.4vw,152px)]">
            make it yours. make it easy to share.
          </h2>
        </div>
        <div>
          <p className="max-w-[700px] text-[14px] leading-6 text-[#C8BDC4] md:text-[17px] min-[1920px]:max-w-[920px] min-[1920px]:text-[22px] min-[1920px]:leading-8">
            Add your colours, logo, message and photograph. The maker prepares a
            finished social image at the correct size. Download it or open your
            device’s share menu when you are ready.
          </p>
          <p className="mt-3 font-mono text-[12px] uppercase leading-4 tracking-[0.08em] text-[#8F7F89] min-[1920px]:text-[12px]">
            Your logo and photograph stay in this browser. Nothing publishes
            automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[0.86fr_1.14fr] min-[1920px]:gap-10">
        <div className="space-y-5 min-[1920px]:space-y-8">
          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#E9BCA9]">
              01 · Your brand
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3]">
                brand name
              </span>
              <input
                value={kit.brandName}
                maxLength={44}
                onChange={(event) => updateKit("brandName", event.target.value)}
                className="min-h-12 w-full border border-white/15 bg-[#120510] px-4 py-3 text-[15px] text-[#FFFDFB] outline-none focus:border-[#E9BCA9] focus:ring-2 focus:ring-[#E9BCA9]/20"
              />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {BRAND_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setKit((current) => ({
                      ...current,
                      primary: preset.primary,
                      accent: preset.accent,
                      paper: preset.paper,
                    }))
                  }
                  className="border border-white/15 bg-[#120510] p-3 text-left outline-none hover:border-[#E9BCA9] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
                >
                  <span className="flex gap-1" aria-hidden="true">
                    {[preset.primary, preset.accent, preset.paper].map((colour) => (
                      <span
                        key={colour}
                        className="h-4 flex-1 border border-white/15"
                        style={{ backgroundColor: colour }}
                      />
                    ))}
                  </span>
                  <span className="mt-2 block font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {(
                [
                  ["primary", "primary"],
                  ["accent", "accent"],
                  ["paper", "paper"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="min-w-0">
                  <span className="mb-2 block truncate font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3]">
                    {label}
                  </span>
                  <span className="flex min-h-10 items-center gap-2 border border-white/15 bg-[#120510] px-2">
                    <input
                      type="color"
                      value={kit[key]}
                      onChange={(event) => updateKit(key, event.target.value)}
                      className="h-7 w-7 shrink-0 cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="min-w-0 truncate font-mono text-[12px] uppercase text-[#B6ACB3]">
                      {kit[key]}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-12 cursor-pointer items-center justify-center border border-[#E9BCA9] bg-[#E9BCA9] px-4 py-3 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-within:ring-2 focus-within:ring-[#FFFDFB]">
                {logoSrc ? "replace logo" : "add logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.heic,.heif"
                  className="sr-only"
                  disabled={busy}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    void uploadImage(input.files?.[0] ?? null, "logo").finally(() => {
                      input.value = "";
                    });
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setLogoSrc("");
                  setLogoLabel("brand name set in type");
                  setNotice("Logo removed. The brand name will be typeset instead.");
                }}
                disabled={!logoSrc}
                className="min-h-12 border border-white/15 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9] disabled:cursor-not-allowed disabled:opacity-35"
              >
                use brand name
              </button>
            </div>
            <p className="mt-3 truncate font-mono text-[12px] uppercase tracking-[0.06em] text-[#8A7B85]">
              {logoLabel}
            </p>
          </section>

          <section className="border border-white/10 bg-[#240B21] p-4 md:p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#E9BCA9]">
              02 · Message and image
            </p>
            <label className="mt-4 block">
              <span className="mb-2 flex justify-between font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3]">
                headline <span>{kit.headline.length}/90</span>
              </span>
              <textarea
                value={kit.headline}
                maxLength={90}
                rows={3}
                onChange={(event) => updateKit("headline", event.target.value)}
                className="w-full resize-y border border-white/15 bg-[#120510] px-4 py-3 text-[16px] leading-6 text-[#FFFDFB] outline-none focus:border-[#E9BCA9] focus:ring-2 focus:ring-[#E9BCA9]/20"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 flex justify-between font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3]">
                supporting line <span>{kit.supporting.length}/180</span>
              </span>
              <textarea
                value={kit.supporting}
                maxLength={180}
                rows={4}
                onChange={(event) => updateKit("supporting", event.target.value)}
                className="w-full resize-y border border-white/15 bg-[#120510] px-4 py-3 text-[14px] leading-6 text-[#FFFDFB] outline-none focus:border-[#E9BCA9] focus:ring-2 focus:ring-[#E9BCA9]/20"
              />
            </label>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-12 cursor-pointer items-center justify-center border border-[#E9BCA9]/60 px-4 py-3 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#F5F1F2] outline-none hover:border-[#E9BCA9] focus-within:ring-2 focus-within:ring-[#E9BCA9]">
                {backgroundSrc ? "replace photograph" : "add photograph"}
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="sr-only"
                  disabled={busy}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    void uploadImage(input.files?.[0] ?? null, "background").finally(
                      () => {
                        input.value = "";
                      },
                    );
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setBackgroundSrc("");
                  setBackgroundLabel("brand colour field");
                  setNotice("Photograph removed. Your colours now form the background.");
                }}
                className="min-h-12 border border-white/15 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.09em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
              >
                use colour field
              </button>
            </div>
            <p className="mt-3 truncate font-mono text-[12px] uppercase tracking-[0.06em] text-[#8A7B85]">
              {backgroundLabel}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {(
                [
                  ["editorial", "editorial"],
                  ["centred", "centred"],
                  ["statement", "statement"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateKit("layout", id)}
                  aria-pressed={kit.layout === id}
                  className={`min-h-11 border px-2 py-2 font-mono text-[12px] uppercase tracking-[0.07em] outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] ${
                    kit.layout === id
                      ? "border-[#E9BCA9] bg-[#E9BCA9] text-[#240B21]"
                      : "border-white/15 bg-[#120510] text-[#B6ACB3]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="xl:sticky xl:top-[112px] xl:self-start">
          <section className="border border-[#E9BCA9]/25 bg-[#240B21] p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#E9BCA9]">
                  03 · Ready to shape and share
                </p>
                <h3 className="mt-2 font-sans text-[26px] font-medium tracking-[-0.035em] text-[#FFFDFB]">
                  {kit.brandName || "your brand"}
                </h3>
              </div>
              <p className="font-mono text-[12px] uppercase tracking-[0.07em] text-[#B6ACB3]">
                {format.label} · {format.note}
              </p>
            </div>

            <div className="mt-5 overflow-hidden border border-white/10 bg-[#0B030A]">
              <canvas
                ref={canvasRef}
                className="block h-auto max-h-[66svh] w-full object-contain"
                aria-label={`${kit.brandName || "Brand"} social image preview`}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BRAND_FORMATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormatId(item.id)}
                  aria-pressed={formatId === item.id}
                  className={`border px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] ${
                    formatId === item.id
                      ? "border-[#E9BCA9] bg-[#E9BCA9] text-[#240B21]"
                      : "border-white/15 bg-[#120510] text-[#F5F1F2]"
                  }`}
                >
                  <span className="block text-[12px] font-medium">{item.label}</span>
                  <span className="mt-1 block font-mono text-[12px] uppercase tracking-[0.06em] opacity-65">
                    {item.note}
                  </span>
                </button>
              ))}
            </div>

            <label className="mt-5 flex min-h-11 items-center gap-3 border border-white/15 px-3 font-mono text-[12px] uppercase leading-4 tracking-[0.08em] text-[#B6ACB3]">
              <input
                type="checkbox"
                checked={kit.creditAssembl}
                onChange={(event) => updateKit("creditAssembl", event.target.checked)}
                className="accent-[#E9BCA9]"
              />
              keep “made with assembl” so others can find the maker
            </label>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void download()}
                disabled={busy}
                className="min-h-12 border border-[#E9BCA9] bg-[#E9BCA9] px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#240B21] outline-none hover:bg-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#FFFDFB] disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "preparing…" : "download PNG"}
              </button>
              <button
                type="button"
                onClick={() => void shareImage()}
                disabled={busy}
                className="min-h-12 border border-[#E9BCA9]/70 px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#FFFDFB] outline-none hover:border-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9] disabled:cursor-wait disabled:opacity-60"
              >
                share image
              </button>
              <button
                type="button"
                onClick={saveKit}
                className="min-h-11 border border-white/15 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
              >
                save kit on this device
              </button>
              <button
                type="button"
                onClick={() => void copyMakerLink()}
                className="min-h-11 border border-white/15 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[#B6ACB3] outline-none hover:border-[#E9BCA9] hover:text-[#FFFDFB] focus-visible:ring-2 focus-visible:ring-[#E9BCA9]"
              >
                copy maker link
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

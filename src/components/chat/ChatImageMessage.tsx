import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Download, AlertCircle, RefreshCw } from "lucide-react";

interface ChatImageMessageProps {
  /** Final image URL (https://… or data:image/…). When undefined and `loading` is true, shows skeleton. */
  url?: string;
  alt?: string;
  /** Optional caption rendered below the image */
  caption?: string;
  /** Show shimmering "generating" placeholder */
  loading?: boolean;
  /** Accent colour (kete colour) for the loading shimmer + ring */
  accentColor?: string;
}

/**
 * Inline chat image with a Mārama-themed loading skeleton, gentle reveal animation,
 * fallback error state, and a download affordance on hover.
 *
 * Used by the agent chat stream when an assistant message contains a generated image.
 */
export default function ChatImageMessage({
  url,
  alt = "Generated image",
  caption,
  loading = false,
  accentColor = "hsl(var(--primary))",
}: ChatImageMessageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading || !url) {
    return (
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border"
        style={{
          aspectRatio: "1 / 1",
          background:
            "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 50%, hsl(var(--muted)) 100%)",
          backgroundSize: "200% 200%",
          borderColor: "rgba(142,129,119,0.18)",
          boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
          <motion.div
            animate={{ rotate: [0, 8, -6, 0], scale: [1, 1.06, 0.98, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 0 20px ${accentColor}30`,
            }}
          >
            <ImageIcon size={18} style={{ color: accentColor }} />
          </motion.div>
          <p
            className="font-display text-[11px] tracking-wide"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Weaving your image…
          </p>
          <div className="flex gap-1 mt-1">
            {[0, 0.18, 0.36].map((delay) => (
              <motion.span
                key={delay}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accentColor }}
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error fallback ────────────────────────────────────────────────
  if (errored) {
    return (
      <div
        className="w-full max-w-sm rounded-2xl border px-4 py-6 flex items-center gap-3"
        style={{
          background: "hsl(var(--card))",
          borderColor: "rgba(200,90,84,0.25)",
          boxShadow: "0 8px 30px rgba(111,97,88,0.06)",
        }}
      >
        <AlertCircle size={18} style={{ color: "hsl(var(--destructive))" }} />
        <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          Couldn't load this image.
        </div>
      </div>
    );
  }

  // ── Loaded image ──────────────────────────────────────────────────
  return (
    <motion.figure
      initial={{ opacity: 0, y: 6, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full max-w-sm overflow-hidden rounded-2xl border"
      style={{
        background: "hsl(var(--card))",
        borderColor: "rgba(142,129,119,0.18)",
        boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
      }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: "hsl(var(--muted))" }}
          aria-hidden
        />
      )}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className="block w-full h-auto"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 320ms ease" }}
      />
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1.5"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(142,129,119,0.18)",
          color: "hsl(var(--foreground))",
        }}
        aria-label="Download image"
        title="Download"
      >
        <Download size={12} />
      </a>
      {caption && (
        <figcaption
          className="px-3 py-2 text-[11px] font-body"
          style={{
            color: "hsl(var(--muted-foreground))",
            borderTop: "1px solid rgba(142,129,119,0.12)",
          }}
        >
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

/**
 * Pulls image URLs out of a freeform assistant message. Recognises:
 *   • markdown images: ![alt](url)
 *   • bare data URLs: data:image/png;base64,...
 *   • bracketed marker: [IMAGE: url]
 *   • generation marker: [GENERATING_IMAGE] / [GENERATING_IMAGE: prompt]
 *
 * Returns the cleaned text (with markers removed) plus extracted images
 * and a `generating` flag so the UI can show the skeleton.
 */
export function extractInlineImages(content: string): {
  text: string;
  images: { url: string; alt?: string }[];
  generating: boolean;
  generatingPrompt?: string;
} {
  if (!content) return { text: "", images: [], generating: false };

  const images: { url: string; alt?: string }[] = [];
  let generating = false;
  let generatingPrompt: string | undefined;
  let text = content;

  // Generation marker
  const genMatch = text.match(/\[GENERATING_IMAGE(?::\s*([^\]]+))?\]/i);
  if (genMatch) {
    generating = true;
    generatingPrompt = genMatch[1]?.trim();
    text = text.replace(genMatch[0], "").trim();
  }

  // Markdown images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/gi, (_m, alt, url) => {
    images.push({ url, alt: alt || undefined });
    return "";
  });

  // [IMAGE: url] markers
  text = text.replace(/\[IMAGE:\s*(https?:\/\/[^\s\]]+|data:image\/[^\s\]]+)\]/gi, (_m, url) => {
    images.push({ url });
    return "";
  });

  // Bare data URLs (rare but possible)
  text = text.replace(/(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)/g, (_m, url) => {
    images.push({ url });
    return "";
  });

  return { text: text.replace(/\n{3,}/g, "\n\n").trim(), images, generating, generatingPrompt };
}

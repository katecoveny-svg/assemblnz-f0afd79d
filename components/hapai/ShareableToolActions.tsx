"use client";

import { useMemo, useState } from "react";
import { Check, Code2, Copy, Share2 } from "lucide-react";

type ShareableToolActionsProps = {
  title: string;
  text: string;
  path: string;
  embed?: boolean;
};

const ORIGIN = "https://www.assembl.co.nz";

export function ShareableToolActions({ title, text, path, embed = true }: ShareableToolActionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const url = `${ORIGIN}${path}`;
  const embedCode = useMemo(
    () => `<iframe src="${url}" title="${title}" loading="lazy" style="width:100%;min-height:760px;border:0;border-radius:8px;"></iframe>`,
    [title, url],
  );

  async function copy(value: string, key: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Sharing was cancelled.
      }
    }
    await copy(url, "link");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(250,247,242,0.20),rgba(250,247,242,0.08))] px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#FFF7EC]/18"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
      <button
        type="button"
        onClick={() => copy(url, "link")}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 text-sm text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:text-white"
      >
        {copied === "link" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied === "link" ? "Copied" : "Copy link"}
      </button>
      {embed ? (
        <button
          type="button"
          onClick={() => copy(embedCode, "embed")}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 text-sm text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:text-white"
        >
          {copied === "embed" ? <Check className="h-4 w-4" aria-hidden /> : <Code2 className="h-4 w-4" aria-hidden />}
          {copied === "embed" ? "Embed copied" : "Copy embed"}
        </button>
      ) : null}
    </div>
  );
}

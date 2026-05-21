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
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#23211F] px-5 text-sm font-medium text-white transition hover:bg-[#2B6B57]"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
      <button
        type="button"
        onClick={() => copy(url, "link")}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] px-5 text-sm text-[#5A5550] transition hover:text-[#23211F]"
      >
        {copied === "link" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied === "link" ? "Copied" : "Copy link"}
      </button>
      {embed ? (
        <button
          type="button"
          onClick={() => copy(embedCode, "embed")}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] px-5 text-sm text-[#5A5550] transition hover:text-[#23211F]"
        >
          {copied === "embed" ? <Check className="h-4 w-4" aria-hidden /> : <Code2 className="h-4 w-4" aria-hidden />}
          {copied === "embed" ? "Embed copied" : "Copy embed"}
        </button>
      ) : null}
    </div>
  );
}

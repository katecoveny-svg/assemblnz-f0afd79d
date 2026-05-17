"use client";

import { useState } from "react";
import { Mail, Share2 } from "lucide-react";

type ElectrifyShareButtonsProps = {
  title: string;
  text: string;
  url: string;
  tone?: "light" | "dark";
};

export default function ElectrifyShareButtons({
  title,
  text,
  url,
  tone = "light",
}: ElectrifyShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  function copyLink() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled; fall through to a copy action.
      }
    }
    copyLink();
  }

  const base =
    "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors";
  const primary =
    tone === "dark"
      ? "bg-mist-50 text-pounamu-900 hover:bg-white"
      : "bg-pounamu-900 text-mist-50 hover:bg-pounamu-800";
  const secondary =
    tone === "dark"
      ? "border border-mist-50/35 text-mist-50 hover:bg-mist-50/10"
      : "border border-taupe-300 text-pounamu-900 hover:bg-white/70";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={nativeShare} className={`${base} ${primary}`}>
        <Share2 className="mr-2 h-4 w-4" aria-hidden />
        Share
      </button>
      <button type="button" onClick={copyLink} className={`${base} ${secondary}`}>
        {copied ? "Copied" : "Copy link"}
      </button>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={`${base} ${secondary}`}>
        LinkedIn
      </a>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={`${base} ${secondary}`}>
        X
      </a>
      <a href={emailUrl} className={`${base} ${secondary}`}>
        <Mail className="mr-2 h-4 w-4" aria-hidden />
        Email
      </a>
    </div>
  );
}

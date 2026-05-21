"use client";

/**
 * Global page-level share cluster for /hapai.
 * Distinct from the assessment-result share — this is the "pass it on" CTA
 * at the bottom of the landing page for visitors who didn't take the quiz.
 */

import { useState } from "react";

const SHARE_TEXT =
  "Most NZ teams do not need more jargon. They need one useful internal tool for one real job. HAPAI from assembl is the practical place to start.";

const SHARE_URL = "https://www.assembl.co.nz/hapai";

export default function HapaiShareButtons() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "HAPAI — practical internal tools for real work",
          text: SHARE_TEXT,
          url: SHARE_URL,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  }

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Worth 60 seconds: one real task, one useful tool")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + SHARE_URL)}`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={nativeShare}
        className="px-6 py-3 rounded-md bg-mist-50 text-pounamu-900 font-medium hover:bg-white transition-colors"
      >
        Share
      </button>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-md border border-mist-50/40 text-mist-50 font-medium hover:bg-mist-50/10 transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-md border border-mist-50/40 text-mist-50 font-medium hover:bg-mist-50/10 transition-colors"
      >
        X / Twitter
      </a>
      <a
        href={emailUrl}
        className="px-6 py-3 rounded-md border border-mist-50/40 text-mist-50 font-medium hover:bg-mist-50/10 transition-colors"
      >
        Email
      </a>
      <button
        onClick={copyLink}
        className="px-6 py-3 rounded-md border border-mist-50/40 text-mist-50 font-medium hover:bg-mist-50/10 transition-colors"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

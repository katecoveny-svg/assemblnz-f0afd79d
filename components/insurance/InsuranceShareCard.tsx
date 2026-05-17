"use client";

import { useRef } from "react";
import type { CoverageCategory } from "@/lib/insurance/coverage-rules";

const STATUS_COLOURS = {
  green: "#2B6B57",
  amber: "#D4A853",
  red: "#AC5838",
};

export default function InsuranceShareCard({ categories }: { categories: CoverageCategory[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function drawCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "#2B6B57";
    ctx.font = 'italic 68px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("Am I covered?", 72, 110);
    ctx.font = '20px "IBM Plex Mono", monospace';
    ctx.fillText("INSURANCE GAP ANALYSIS · NZ ESTIMATE", 76, 150);

    categories.forEach((category, index) => {
      const x = 80 + index * 220;
      ctx.fillStyle = STATUS_COLOURS[category.status];
      ctx.beginPath();
      ctx.arc(x + 70, 285, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FAF7F2";
      ctx.font = 'bold 32px "Inter", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(category.status.toUpperCase(), x + 70, 296);
      ctx.fillStyle = "#23211F";
      ctx.font = '24px "Inter", sans-serif';
      ctx.fillText(category.label, x + 70, 380);
      ctx.font = '18px "IBM Plex Mono", monospace';
      ctx.fillText(category.gapNzd > 0 ? `$${category.gapNzd.toLocaleString("en-NZ")} gap` : "covered", x + 70, 416);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "#2B6B57";
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("assembl", 76, 560);
    ctx.font = '16px "IBM Plex Mono", monospace';
    ctx.fillText("indicative only · talk to an independent insurance adviser", 230, 558);
  }

  function downloadPng() {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = "insurance-gap-analysis.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  }

  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <h2 className="font-display text-3xl italic text-[color:var(--assembl-pounamu)]">
        Shareable traffic lights.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
        Downloads a PNG with only the five traffic lights and dollar gaps. No
        income, mortgage, or personal input detail is included.
      </p>
      <canvas ref={canvasRef} className="mt-4 hidden" aria-hidden />
      <button
        type="button"
        onClick={downloadPng}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-pounamu-900 px-5 text-sm font-medium text-mist-50 hover:bg-pounamu-800"
      >
        Download PNG
      </button>
    </div>
  );
}

"use client";

import { Mail, Printer } from "lucide-react";

export function FoodAuditResultActions({ venueName, resultUrl }: { venueName: string; resultUrl: string }) {
  const subject = encodeURIComponent(`Food safety record — ${venueName}`);
  const body = encodeURIComponent(`Kia ora,\n\nFood safety record is ready here:\n${resultUrl}\n\nUse Print / Save as PDF to file it with the daily Food Control Plan records.\n`);

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#AC5838] px-5 text-sm font-medium text-white"
      >
        <Printer className="h-4 w-4" aria-hidden />
        Download as PDF
      </button>
      <a
        href={`mailto:?subject=${subject}&body=${body}`}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] px-5 text-sm font-medium text-[#23211F]"
      >
        <Mail className="h-4 w-4" aria-hidden />
        Email the record
      </a>
    </div>
  );
}

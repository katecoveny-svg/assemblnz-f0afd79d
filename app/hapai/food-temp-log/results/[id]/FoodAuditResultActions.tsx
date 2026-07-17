"use client";

import { Mail, Printer } from "lucide-react";
import { ToolLeadCapture } from "@/components/hapai/ToolLeadCapture";

export function FoodAuditResultActions({ venueName, resultUrl }: { venueName: string; resultUrl: string }) {
  const subject = encodeURIComponent(`Food safety record — ${venueName}`);
  const body = encodeURIComponent(`Kia ora,\n\nFood safety record is ready here:\n${resultUrl}\n\nUse Print / Save as PDF to file it with the daily Food Control Plan records.\n`);

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#3f7373] px-5 text-sm font-medium text-white"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Download as PDF
        </button>
        <a
          href={`mailto:?subject=${subject}&body=${body}`}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] px-5 text-sm font-medium text-[#313c42]"
        >
          <Mail className="h-4 w-4" aria-hidden />
          Email the record
        </a>
      </div>
      <div className="mt-5 max-w-xl">
        <ToolLeadCapture
          toolSlug="food-temp-log"
          title="Email me this record"
          blurb="Optional. We’ll send a copy of this food safety record. The log works either way."
          payload={{ venueName }}
        />
      </div>
    </div>
  );
}

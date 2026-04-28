import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import type { GroundingPayload } from "@/lib/mcpChat";
import { CitationPreviewModal } from "./CitationPreviewModal";

interface GroundingBadgeProps {
  grounding: GroundingPayload;
  /** Optional kete accent for subtle highlights. */
  accentColor?: string;
}

/**
 * Compact, audit-first grounding panel shown beneath each assistant message
 * when the response was grounded against Assembl's curated NZ regulation
 * corpus. Displays:
 *   - Confidence pill (high / medium / low)
 *   - Mana citation verification (PASS / FLAG / FAIL)
 *   - Expandable list of citation sources with clickable links when the
 *     `source` field looks like a URL.
 */
export function GroundingBadge({ grounding, accentColor = "#9D8C7D" }: GroundingBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!grounding || grounding.chunk_count === 0) return null;

  const conf = grounding.confidence;
  const verification = grounding.verification;

  const confColors: Record<string, { bg: string; fg: string; label: string }> = {
    high: { bg: "#D8E6D6", fg: "#3F5A3D", label: "High confidence" },
    medium: { bg: "#F4E2C5", fg: "#7A5A2E", label: "Medium confidence" },
    low: { bg: "#F0CFCD", fg: "#7A3A36", label: "Low confidence" },
    none: { bg: "#EDE7DC", fg: "#6F6158", label: "No grounding" },
  };
  const c = confColors[conf] ?? confColors.none;

  const verifIcon =
    verification?.status === "PASS" ? <ShieldCheck className="w-3 h-3" /> :
    verification?.status === "FLAG" ? <ShieldAlert className="w-3 h-3" /> :
    verification?.status === "FAIL" ? <ShieldX className="w-3 h-3" /> :
    null;

  const verifColors: Record<string, { bg: string; fg: string }> = {
    PASS: { bg: "#D8E6D6", fg: "#3F5A3D" },
    FLAG: { bg: "#F4E2C5", fg: "#7A5A2E" },
    FAIL: { bg: "#F0CFCD", fg: "#7A3A36" },
    NOT_APPLICABLE: { bg: "#EDE7DC", fg: "#6F6158" },
  };
  const v = verification ? (verifColors[verification.status] ?? verifColors.NOT_APPLICABLE) : null;

  const isUrl = (s: string) => /^https?:\/\//i.test(s);

  return (
    <div
      className="mt-2 rounded-xl text-[11px]"
      style={{
        background: "rgba(255,255,255,0.6)",
        border: `1px solid ${accentColor}33`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header row — confidence + mana + toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: c.bg, color: c.fg }}
            title={`Grounding confidence: ${conf}`}
          >
            {c.label}
          </span>
          {v && verification && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: v.bg, color: v.fg }}
              title={verification.message}
            >
              {verifIcon}
              Mana: {verification.status}
            </span>
          )}
          <span style={{ color: "#6F6158" }}>
            {grounding.chunk_count} {grounding.chunk_count === 1 ? "source" : "sources"}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-3 h-3" style={{ color: "#6F6158" }} />
        ) : (
          <ChevronDown className="w-3 h-3" style={{ color: "#6F6158" }} />
        )}
      </button>

      {open && (
        <div className="px-2.5 pb-2 pt-1 space-y-1.5 border-t" style={{ borderColor: `${accentColor}22` }}>
          {grounding.sources.map((s, i) => {
            const cited = verification?.cited_chunk_ids.includes(s.chunk_id);
            return (
              <div key={s.chunk_id} className="flex items-start gap-1.5 leading-snug">
                <span
                  className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-semibold mt-px"
                  style={{
                    background: cited ? "#D8E6D6" : "#EDE7DC",
                    color: cited ? "#3F5A3D" : "#6F6158",
                  }}
                  title={cited ? "Cited in this reply" : "Retrieved but not cited"}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div style={{ color: "#3D4250" }} className="font-medium truncate">
                    {s.citation || s.source}
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: "#6F6158" }}>
                    <span className="uppercase tracking-wide" style={{ fontSize: "9px" }}>
                      Tier {s.tier}
                    </span>
                    {isUrl(s.source) ? (
                      <a
                        href={s.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 hover:underline"
                        style={{ color: accentColor }}
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="truncate">{s.source}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {verification?.message && (
            <div className="pt-1 italic" style={{ color: "#6F6158", fontSize: "10px" }}>
              {verification.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GroundingBadge;

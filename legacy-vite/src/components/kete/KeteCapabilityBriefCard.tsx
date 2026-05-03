import { motion } from "framer-motion";
import { Check, MessageSquare, Shield, Sparkles } from "lucide-react";
import { getKeteBrief } from "@/data/keteCapabilityBriefs";
import { resolveKete } from "@/components/kete/KeteConfig";

interface KeteCapabilityBriefCardProps {
  /** Canonical kete id, e.g. "manaaki", "waihanga", "toro" */
  keteId: string;
  /** Optional: hide the CTA when used in marketing contexts */
  hideCta?: boolean;
  className?: string;
}

/**
 * Reusable brief card that renders the marketing-ready capability
 * explainer for any kete. Pulls from KETE_CAPABILITY_BRIEFS
 * and uses the canonical kete colour from KETE_CONFIG so each
 * card is automatically on-brand.
 */
const KeteCapabilityBriefCard = ({
  keteId,
  hideCta = false,
  className = "",
}: KeteCapabilityBriefCardProps) => {
  const brief = getKeteBrief(keteId);
  const kete = resolveKete(keteId);

  if (!brief || !kete) return null;

  const accent = kete.color;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-3xl p-8 md:p-10 ${className}`}
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow:
          "10px 10px 30px rgba(166,166,180,0.25), -8px -8px 24px rgba(255,255,255,0.95)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div
            className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2"
            style={{ color: `${accent}CC`, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {brief.sector}
          </div>
          <h2
            className="text-3xl md:text-4xl font-light leading-tight"
            style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
          >
            {brief.name} —{" "}
            <span style={{ color: accent }}>{brief.tagline}</span>
          </h2>
        </div>
      </div>

      {/* One-liner */}
      <p
        className="text-base md:text-lg leading-relaxed mb-8 max-w-3xl"
        style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250CC" }}
      >
        {brief.oneLiner}
      </p>

      {/* Capabilities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {brief.capabilities.map((cap) => (
          <div
            key={cap}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: `1px solid ${accent}25`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
            >
              <Check size={14} style={{ color: accent }} />
            </div>
            <span
              className="text-sm leading-snug"
              style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
            >
              {cap}
            </span>
          </div>
        ))}
      </div>

      {/* Meta row: channels + grounded-in */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}
        >
          <MessageSquare size={16} style={{ color: accent }} className="mt-0.5 shrink-0" />
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-wider mb-1"
              style={{ color: "#3D425088", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Channels
            </div>
            <div
              className="text-sm"
              style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
            >
              {brief.channels.join(" · ")}
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}
        >
          <Shield size={16} style={{ color: accent }} className="mt-0.5 shrink-0" />
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-wider mb-1"
              style={{ color: "#3D425088", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Grounded in
            </div>
            <div
              className="text-sm leading-snug"
              style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
            >
              {brief.groundedIn}
            </div>
          </div>
        </div>
      </div>

      {/* Proof point */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}
      >
        <Sparkles size={16} style={{ color: accent }} className="mt-0.5 shrink-0" />
        <p
          className="text-sm md:text-base font-medium leading-snug"
          style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
        >
          {brief.proofPoint}
        </p>
      </div>

      {!hideCta && (
        <div className="mt-6 text-right">
          <span
            className="text-sm font-mono"
            style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            → {brief.cta}
          </span>
        </div>
      )}
    </motion.section>
  );
};

export default KeteCapabilityBriefCard;

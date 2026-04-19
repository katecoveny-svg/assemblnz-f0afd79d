// ═══════════════════════════════════════════════════════════════
// Public, anonymous-readable evidence pack at /evidence/share/:token
// Loads only when the owner has explicitly minted a share token.
// Renders a clean, branded view with "Powered by Assembl" footer.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, Calendar, Hash, ExternalLink, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const TEAL = "#4AA5A8";
const CHARCOAL = "#3D4250";

interface SharedPack {
  id: string;
  kete: string;
  action_type: string;
  watermark: string;
  signed_by: string | null;
  signed_at: string | null;
  created_at: string;
  evidence_json: Record<string, unknown>;
  share_view_count: number;
}

const KETE_LABEL: Record<string, string> = {
  manaaki: "Manaaki / Hospitality",
  waihanga: "Waihanga / Construction",
  auaha: "Auaha / Creative",
  arataki: "Arataki / Automotive",
  pikau: "Pikau / Logistics",
  hoko: "Hoko / Property",
  ako: "Ako / Education",
  toro: "Tōro / Whānau",
};

export default function EvidencePackSharePage() {
  const { token } = useParams<{ token: string }>();
  const [pack, setPack] = useState<SharedPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select("id, kete, action_type, watermark, signed_by, signed_at, created_at, evidence_json, share_view_count")
        .eq("share_token", token)
        .eq("is_publicly_shared", true)
        .maybeSingle();

      if (error || !data) {
        setError("This evidence pack is no longer available or the link is invalid.");
        setLoading(false);
        return;
      }

      setPack(data as SharedPack);
      setLoading(false);

      // Best-effort view counter — fire and forget.
      supabase.rpc("increment_evidence_share_view", { _token: token }).then(() => {});
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <div className="animate-pulse text-sm" style={{ color: "#9CA3AF" }}>
          Loading evidence pack…
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFBFC" }}>
        <SEO title="Evidence pack unavailable | Assembl" description="This shared evidence pack is no longer available." />
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(232,169,72,0.12)" }}>
            <AlertTriangle size={20} style={{ color: "#4AA5A8" }} />
          </div>
          <h1 className="text-lg font-medium mb-2" style={{ color: CHARCOAL }}>
            This pack isn't available
          </h1>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
            {error ?? "The owner may have revoked the share link, or it expired."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: TEAL, color: "#fff" }}
          >
            Visit assembl.co.nz
          </Link>
        </div>
      </div>
    );
  }

  const keteLabel = KETE_LABEL[pack.kete] ?? pack.kete;
  const signedAt = pack.signed_at ?? pack.created_at;
  const ej = pack.evidence_json ?? {};
  const summary = (ej.summary as string) || (ej.body as string) || "";
  const findings = Array.isArray(ej.findings)
    ? (ej.findings as Array<{ label?: string; status?: string; risk_level?: string }>)
    : [];
  const sections = Array.isArray(ej.sections)
    ? (ej.sections as Array<{ agent?: string; title?: string; body?: string }>)
    : [];

  return (
    <div className="min-h-screen" style={{ background: "#FAFBFC" }}>
      <SEO
        title={`${pack.action_type} — evidence pack | Assembl`}
        description={`Signed evidence pack from a ${keteLabel} workflow on Assembl. Watermark ${pack.watermark.slice(0, 8)}.`}
      />

      {/* Light header */}
      <header className="px-4 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${TEAL}15` }}>
              <ShieldCheck size={14} style={{ color: TEAL }} />
            </div>
            <span className="text-sm font-medium tracking-wide" style={{ color: CHARCOAL }}>
              assembl
            </span>
          </Link>
          <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>
            Shared evidence pack
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-[2px] uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", background: `${TEAL}12`, color: TEAL, border: `1px solid ${TEAL}30` }}
          >
            <Sparkles size={10} /> {keteLabel}
          </div>
          <h1 className="text-3xl sm:text-4xl font-light leading-tight" style={{ color: CHARCOAL }}>
            {pack.action_type}
          </h1>
          {summary && (
            <p className="text-base mt-3 max-w-2xl" style={{ color: "#6B7280", lineHeight: 1.65 }}>
              {summary}
            </p>
          )}
        </motion.div>

        {/* Meta strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <MetaTile icon={<Calendar size={12} />} label="Signed" value={new Date(signedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })} />
          <MetaTile icon={<FileText size={12} />} label="Signed by" value={pack.signed_by ?? "—"} />
          <MetaTile icon={<Hash size={12} />} label="Watermark" value={`${pack.watermark.slice(0, 12)}…`} mono />
          <MetaTile icon={<ShieldCheck size={12} />} label="Status" value="Verified" valueColor={TEAL} />
        </motion.div>

        {/* Findings */}
        {findings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(74,165,168,0.15)" }}
          >
            <h2 className="text-sm font-medium mb-4" style={{ color: CHARCOAL }}>
              Findings
            </h2>
            <div className="space-y-2">
              {findings.map((f, i) => {
                const status = (f.status ?? f.risk_level ?? "info").toLowerCase();
                const isOk = status === "ok" || status === "low" || status === "pass";
                const isWarn = status === "warn" || status === "medium" || status === "review";
                const colour = isOk ? TEAL : isWarn ? "#4AA5A8" : "#C85A54";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colour }} />
                    <p className="text-[13px] flex-1" style={{ color: CHARCOAL }}>
                      {f.label ?? "—"}
                    </p>
                    <span
                      className="text-[10px] tracking-[2px] uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: colour }}
                    >
                      {isOk ? "PASS" : isWarn ? "REVIEW" : "FLAG"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Sections */}
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            {sections.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(74,165,168,0.12)" }}
              >
                {s.agent && (
                  <p
                    className="text-[10px] tracking-[2px] uppercase mb-2"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }}
                  >
                    {s.agent}
                  </p>
                )}
                {s.title && (
                  <h3 className="text-base font-medium mb-2" style={{ color: CHARCOAL }}>
                    {s.title}
                  </h3>
                )}
                {s.body && (
                  <p className="text-sm" style={{ color: "#6B7280", lineHeight: 1.65 }}>
                    {s.body}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Powered-by footer = the growth loop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-2xl text-center"
          style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}25` }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${TEAL}18` }}>
              <ShieldCheck size={14} style={{ color: TEAL }} />
            </div>
            <span className="text-sm font-medium" style={{ color: CHARCOAL }}>
              Powered by assembl
            </span>
          </div>
          <p className="text-[13px] mb-4 max-w-md mx-auto" style={{ color: "#6B7280" }}>
            Every Assembl workflow leaves a signed, watermarked paper trail like this one. Built for NZ businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{ background: TEAL, color: "#fff" }}
            >
              See how it works <ExternalLink size={12} />
            </Link>
            <Link
              to="/evidence"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.7)", color: CHARCOAL, border: "1px solid rgba(0,0,0,0.06)" }}
            >
              Browse more packs
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function MetaTile({
  icon,
  label,
  value,
  mono,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "#9CA3AF" }}>
        {icon}
        <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {label}
        </span>
      </div>
      <p
        className="text-[13px] font-medium truncate"
        style={{
          color: valueColor ?? CHARCOAL,
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        }}
      >
        {value}
      </p>
    </div>
  );
}

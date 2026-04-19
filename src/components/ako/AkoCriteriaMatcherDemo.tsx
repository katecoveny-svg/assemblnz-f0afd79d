/**
 * AKO Licensing Criteria Matcher — flagship interactive demo.
 *
 * Centre uploads / pastes a current policy → APEX-AKO matches it line-by-line
 * against the 20 April 2026 licensing criteria → NOVA-AKO drafts replacement
 * language → MANA writes the dated evidence pack.
 *
 * Pure UI, deterministic mock data so the brief is always presentable.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileSearch, Sparkles, FileCheck, Check,
  AlertTriangle, AlertCircle, ArrowRight, Loader2,
} from "lucide-react";

type GapStatus = "compliant" | "partial" | "gap";

interface GapRow {
  code: string;
  category: string;
  status: GapStatus;
  retained: "retained" | "simplified" | "removed";
  current: string;
  newCriterion: string;
  rewrite?: string;
}

const SAMPLE_POLICY_NAME = "Tūi & Pīwakawaka ECC — Health & Safety Policy v3.2";

const MOCK_RESULTS: GapRow[] = [
  {
    code: "HS17",
    category: "Health & Safety",
    status: "gap",
    retained: "simplified",
    current: "\"Sleeping children will be checked at regular intervals by staff on duty.\"",
    newCriterion: "Each sleeping child checked every 10 minutes; check logged with timestamp + checker initials.",
    rewrite: "\"All sleeping tamariki are checked every 10 minutes. Each check is logged in the sleep register with the time and the staff member's initials. Check overdue alerts go to the head teacher's tablet.\"",
  },
  {
    code: "GMA1",
    category: "Governance",
    status: "partial",
    retained: "retained",
    current: "\"The licensee maintains current records of staff qualifications and police vets.\"",
    newCriterion: "Licensee maintains a single live register: PCs, first-aid currency, police vets, safety-checks — with expiry alerts at 60/30/7 days.",
    rewrite: "\"Tūi & Pīwakawaka ECC maintains a single live register of every kaiako's practising certificate, first-aid currency, police vet, and safety-check. Expiry reminders go to the head teacher 60, 30, and 7 days out.\"",
  },
  {
    code: "C2",
    category: "Curriculum",
    status: "compliant",
    retained: "retained",
    current: "\"Te Whāriki underpins all programme planning. Learning stories link to the five strands.\"",
    newCriterion: "Te Whāriki integration with documented evidence per child per term, mapped to the five strands.",
  },
  {
    code: "P14",
    category: "Premises",
    status: "gap",
    retained: "removed",
    current: "\"Outdoor playground inspection completed weekly using the OSCAR checklist.\"",
    newCriterion: "REMOVED · the OSCAR checklist requirement is removed in the 20 April 2026 update. Centres may use any documented inspection method.",
    rewrite: "\"Outdoor area inspected weekly. Method documented in the operations manual. Hazards logged and actioned within agreed timeframes.\"",
  },
  {
    code: "S9",
    category: "Staffing",
    status: "partial",
    retained: "simplified",
    current: "\"Adult-to-child ratios are maintained at all times in line with regulatory requirements.\"",
    newCriterion: "Ratio snapshots evidenced at five daily transitions (drop-off, lunch, nap, outside play, pick-up) with counts per age group.",
    rewrite: "\"Tūi & Pīwakawaka ECC captures a ratio snapshot at five transitions every day: drop-off, lunch, nap, outside play, pick-up. Counts are tagged by age group on the head teacher's tablet.\"",
  },
];

const ACCENT = "#7BA7C7";
const ACCENT_LIGHT = "#A8C8DD";

const STATUS_META: Record<GapStatus, { label: string; color: string; icon: typeof Check }> = {
  compliant: { label: "compliant", color: "#3A7D6E", icon: Check },
  partial: { label: "partial", color: "#4AA5A8", icon: AlertTriangle },
  gap: { label: "gap", color: "#C0594F", icon: AlertCircle },
};

const RETAINED_META: Record<GapRow["retained"], { label: string; color: string }> = {
  retained: { label: "RETAINED", color: "#6B7280" },
  simplified: { label: "SIMPLIFIED", color: ACCENT },
  removed: { label: "REMOVED", color: "#9C7CC9" },
};

type Stage = "idle" | "scanning" | "results";

export default function AkoCriteriaMatcherDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const start = () => {
    setStage("scanning");
    setTimeout(() => setStage("results"), 2200);
  };

  const reset = () => {
    setStage("idle");
    setActiveRow(null);
  };

  const counts = MOCK_RESULTS.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { compliant: 0, partial: 0, gap: 0 } as Record<GapStatus, number>,
  );

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${ACCENT}25`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* Pipeline strip */}
      <div className="flex items-center gap-2 flex-wrap mb-6 text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: ACCENT }}>
        <span>APEX-AKO</span>
        <ArrowRight size={10} style={{ color: ACCENT_LIGHT }} />
        <span>NOVA-AKO</span>
        <ArrowRight size={10} style={{ color: ACCENT_LIGHT }} />
        <span>MANA</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[9px]" style={{ background: `${ACCENT}15`, color: ACCENT }}>
          HIGH-RISK · admin assistance only
        </span>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: `${ACCENT}08`, border: `1.5px dashed ${ACCENT}50` }}
            >
              <Upload size={32} style={{ color: ACCENT, margin: "0 auto 12px" }} />
              <h4 className="text-base font-medium mb-1" style={{ color: "#3D4250" }}>
                Upload your current policy
              </h4>
              <p className="text-[12px] mb-4" style={{ color: "#6B7280" }}>
                PDF, Word, or paste a URL. We'll match it line-by-line against the 20 April 2026 criteria.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={start}
                  className="px-5 py-2.5 rounded-full text-[12px] font-medium transition-all hover:gap-2.5 inline-flex items-center gap-2"
                  style={{ background: ACCENT, color: "white", boxShadow: `0 6px 20px ${ACCENT}40` }}
                >
                  <Sparkles size={13} /> Run sample · {SAMPLE_POLICY_NAME}
                </button>
                <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
                  or drag a file here
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <Loader2 size={28} style={{ color: ACCENT, margin: "0 auto 12px" }} className="animate-spin" />
            <p className="text-[13px]" style={{ color: "#3D4250" }}>
              APEX-AKO is matching <strong>{SAMPLE_POLICY_NAME}</strong> against ~78 criteria…
            </p>
            <div className="mt-4 max-w-sm mx-auto">
              <div className="space-y-1.5 text-[11px] text-left" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  ✓ Loaded 20 Apr 2026 criteria corpus (78 items)
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  ✓ Parsed 14 policy sections from upload
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  ✓ NOVA-AKO drafting rewrites in centre voice
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                  ✓ MANA signing evidence pack
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Headline */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(["compliant", "partial", "gap"] as GapStatus[]).map((s) => {
                const meta = STATUS_META[s];
                const Icon = meta.icon;
                return (
                  <div
                    key={s}
                    className="rounded-xl p-3 text-center"
                    style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}30` }}
                  >
                    <Icon size={16} style={{ color: meta.color, margin: "0 auto 4px" }} />
                    <div className="text-2xl font-light" style={{ color: meta.color, fontFamily: "'Lato', sans-serif" }}>
                      {counts[s]}
                    </div>
                    <div className="text-[10px] tracking-wider uppercase" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
                      {meta.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gap rows */}
            <div className="space-y-2">
              {MOCK_RESULTS.map((row) => {
                const meta = STATUS_META[row.status];
                const RetMeta = RETAINED_META[row.retained];
                const Icon = meta.icon;
                const isOpen = activeRow === row.code;
                return (
                  <div
                    key={row.code}
                    className="rounded-xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${meta.color}25` }}
                  >
                    <button
                      onClick={() => setActiveRow(isOpen ? null : row.code)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-black/[0.02]"
                    >
                      <Icon size={14} style={{ color: meta.color, flexShrink: 0 }} />
                      <span className="text-[11px] tracking-wider px-2 py-0.5 rounded" style={{ background: `${meta.color}15`, color: meta.color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {row.code}
                      </span>
                      <span className="text-[12px]" style={{ color: "#3D4250" }}>{row.category}</span>
                      <span className="text-[9px] tracking-[2px] uppercase ml-auto" style={{ color: RetMeta.color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {RetMeta.label}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3 text-[12px] leading-relaxed" style={{ color: "#3D4250" }}>
                            <div>
                              <p className="text-[9px] tracking-[2px] uppercase mb-1" style={{ color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                                CURRENT POLICY LINE
                              </p>
                              <p style={{ color: "#6B7280" }}>{row.current}</p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[2px] uppercase mb-1" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                                20 APR 2026 CRITERION
                              </p>
                              <p>{row.newCriterion}</p>
                            </div>
                            {row.rewrite && (
                              <div className="rounded-lg p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
                                <p className="text-[9px] tracking-[2px] uppercase mb-1" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                                  NOVA-AKO DRAFT REWRITE · centre voice
                                </p>
                                <p>{row.rewrite}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Receipt */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t text-[11px]" style={{ borderColor: "rgba(0,0,0,0.06)", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
              <FileCheck size={12} style={{ color: "#3A7D6E" }} />
              <span>MANA · evidence pack #ako-3a8f · 20 Apr 2026 criteria corpus v1 · signed</span>
              <button
                onClick={reset}
                className="ml-auto text-[11px] underline"
                style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Run again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

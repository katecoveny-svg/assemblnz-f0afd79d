import { motion } from "framer-motion";
import { Check, Shield, FileText, Building, ClipboardCheck } from "lucide-react";

/**
 * Three additional sections for the Hanga (Waihanga) landing page:
 *   1. Compliance Pipeline visual (KAHU → IHO → TĀ → MAHARA → MANA)
 *   2. Beyond consenting tools comparison (vs single-purpose AI)
 *   3. Pricing tiers (Hanga Core + Hanga Complete)
 *
 * Extracted into its own component so the parent landing page stays
 * focused on hero / agents / chat. Reuses the parent's brand tokens
 * via the `accent` and `text` props so we don't duplicate the colour
 * palette or hard-code values.
 */
export interface HangaPipelineComparisonProps {
  /** Pounamu accent colour (hex) — pass the parent landing's `C.pounamu`. */
  accent: string;
  /** Primary text colour (hex) — pass the parent landing's `C.text`. */
  text: string;
  /** Secondary/body text colour (hex) — pass `C.textSecondary`. */
  textSecondary: string;
  /** Tertiary/dim colour (hex) — pass `C.textTertiary`. */
  textTertiary: string;
  /** Glass card style object — pass the parent landing's `glass`. */
  glass: React.CSSProperties;
}

export default function HangaPipelineComparison({
  accent,
  text,
  textSecondary,
  textTertiary,
  glass,
}: HangaPipelineComparisonProps) {
  const stages = [
    { code: "KAHU", role: "Receive", detail: "Inbound check, PII detection, rate limit", icon: Shield },
    { code: "IHO", role: "Ground", detail: "Route to right model and specialist agent", icon: Building },
    { code: "TĀ", role: "Gate", detail: "Policy rules · IPP 3A · tikanga · macrons", icon: ClipboardCheck },
    { code: "MAHARA", role: "Reason", detail: "Cite Act, section, evidence, NZ context", icon: FileText },
    { code: "MANA", role: "Approve", detail: "Human PCBU clicks DRAFT → SIGNED", icon: Check },
  ];

  const comparisonRows: Array<[string, boolean, boolean]> = [
    ["Pre-check building consents", true, true],
    ["Section 14G product technical statements", true, true],
    ["SWMS · SSSP · hazard register (ĀRAI)", false, true],
    ["NZS 3910 · CCA payment claims (KAUPAPA)", false, true],
    ["RMA · iwi consultation (RAWA)", false, true],
    ["Subdivision under Land Transfer Act (TERRA)", false, true],
    ["BIM · clash detection (ATA)", false, true],
    ["GETS-compliant tender prep (PINNACLE)", false, true],
    ["Quality · producer statements (PAI)", false, true],
    ["Tikanga Māori governance (Wai 2252)", false, true],
    ["Named human approver on every output", true, true],
  ];

  const tiers = [
    {
      name: "Hanga Core",
      price: "$249",
      setup: "$490 setup",
      cadence: "/month",
      features: [
        "Site Safety + Consents + Project Delivery",
        "5 named users",
        "Evidence pack export",
        "NZ-only data residency",
      ],
      featured: false,
    },
    {
      name: "Hanga Complete",
      price: "$529",
      setup: "$990 setup",
      cadence: "/month",
      features: [
        "All 9 agents · all 8 modules",
        "15 named users",
        "Cross-agent coordination",
        "Priority support · onboarding included",
      ],
      featured: true,
    },
  ];

  return (
    <>
      {/* Compliance Pipeline (Kahu → Iho → Tā → Mahara → Mana) */}
      <section className="relative px-6 py-28" style={{ background: `${accent}06` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[5px] mb-4 uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>— compliance pipeline —</p>
            <h2 className="text-2xl sm:text-[36px] font-light mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", color: text }}>Five stages. Every output, every time.</h2>
            <p className="text-[15px] max-w-2xl mx-auto leading-[1.7]" style={{ color: textSecondary }}>
              Named compliance gates run as code. If any stage fails, the output halts. Every result ships as a DRAFT to a named human approver — nothing is signed, lodged, or paid without their click.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {stages.map((s, i) => (
              <motion.div
                key={s.code}
                className="rounded-3xl p-5 text-center"
                style={glass}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${accent}12` }}>
                  <s.icon size={18} style={{ color: accent }} />
                </div>
                <div className="text-[13px] font-medium tracking-[2px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: accent }}>{s.code}</div>
                <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: textTertiary }}>{s.role}</div>
                <div className="text-[12px] leading-[1.5]" style={{ color: textSecondary }}>{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond consenting tools — comparison vs single-purpose AI */}
      <section className="relative px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[5px] mb-4 uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>— beyond consenting —</p>
            <h2 className="text-2xl sm:text-[36px] font-light mb-3" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", color: text }}>One platform across the full lifecycle.</h2>
            <p className="text-[15px] max-w-2xl mx-auto leading-[1.7]" style={{ color: textSecondary }}>
              New Zealand has good AI tools for building consents. Hanga goes further — site safety, contracts, environmental compliance, BIM, tendering, quality, and subdivision — all in one governed pipeline.
            </p>
          </motion.div>
          <div className="rounded-3xl overflow-hidden" style={glass}>
            <div className="grid grid-cols-[1.6fr_1fr_1fr] text-[13px]">
              <div className="p-4 sm:p-5 border-b" style={{ color: textTertiary, fontFamily: "'IBM Plex Mono', monospace", borderColor: `${accent}18` }}>capability</div>
              <div className="p-4 sm:p-5 border-b text-center" style={{ color: textSecondary, borderColor: `${accent}18` }}>consenting-only AI</div>
              <div className="p-4 sm:p-5 border-b text-center font-medium" style={{ color: accent, borderColor: `${accent}18` }}>Hanga</div>
              {comparisonRows.flatMap(([label, comp, hanga], i) => {
                const isLast = i === comparisonRows.length - 1;
                const border = isLast ? "transparent" : `${accent}10`;
                return [
                  <div key={`${i}-l`} className="px-4 sm:px-5 py-4 border-b" style={{ color: text, borderColor: border }}>{label}</div>,
                  <div key={`${i}-c`} className="px-4 sm:px-5 py-4 border-b text-center" style={{ color: comp ? accent : textTertiary, borderColor: border }}>{comp ? "✓" : "—"}</div>,
                  <div key={`${i}-h`} className="px-4 sm:px-5 py-4 border-b text-center" style={{ color: hanga ? accent : textTertiary, fontWeight: hanga ? 500 : 400, borderColor: border }}>{hanga ? "✓" : "—"}</div>,
                ];
              })}
            </div>
          </div>
          <p className="text-[12px] mt-6 text-center" style={{ color: textTertiary }}>
            Built for Aotearoa, not adapted from Australia. Wai 2252 four-step framework + Te Mana Raraunga principles run as code.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[5px] mb-4 uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>— pricing —</p>
            <h2 className="text-2xl sm:text-[36px] font-light" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", color: text }}>Built for NZ builders.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                className="rounded-3xl p-8"
                style={{
                  ...glass,
                  border: tier.featured ? `1px solid ${accent}` : (glass.border as string | undefined),
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-[12px] tracking-[2px] uppercase mb-3" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>{tier.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-light" style={{ color: text }}>{tier.price}</span>
                  <span className="text-sm" style={{ color: textSecondary }}>{tier.cadence}</span>
                </div>
                <div className="text-[12px] mb-6" style={{ color: textSecondary }}>+ {tier.setup} · NZD ex GST · annual prepay = 1 month free</div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: text }}>
                      <Check size={14} style={{ color: accent, marginTop: 3, flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-[12px] mt-8 max-w-xl mx-auto" style={{ color: textTertiary }}>
            14-day free trial · no credit card · we&apos;ll email a draft SWMS for your last project before the trial expires — yours to keep.
          </p>
        </div>
      </section>
    </>
  );
}

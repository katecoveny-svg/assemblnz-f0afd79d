import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  GitBranch,
  Cpu,
  BrainCircuit,
  BadgeCheck,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/**
 * HowItWorksFlow — interactive 5-stage governance pipeline.
 * Mirrors what the live platform actually does for every agent request:
 *   1. Kahu    — policy detection / intake gate
 *   2. Iho     — model router + specialist routing
 *   3. Tā      — execution + NZ-correct generation
 *   4. Mahara  — memory + cross-verification
 *   5. Mana    — assurance + human-in-the-loop sign-off
 *
 * Styling uses the Pearl/Mārama Whenua light tokens (no dark surfaces, no neon).
 */

const ease = [0.22, 1, 0.36, 1] as const;

const PEARL = {
  bg: "#FBFAF7",
  linen: "#F3F4F2",
  opal: "#E8EEEC",
  ink: "#0E1513",
  pounamu: "#1F4D47",
  seaGlass: "#C4D6D2",
  muted: "#8B8479",
  bodyInk: "rgba(14,21,19,0.72)",
  softGold: "#D9BC7A",
  dustyRose: "#D5C0C8",
  warmLinen: "#E6D8C6",
} as const;

type StageId = "kahu" | "iho" | "ta" | "mahara" | "mana";

interface Stage {
  id: StageId;
  num: string;
  name: string;
  question: string;
  desc: string;
  icon: typeof ShieldCheck;
  accent: string;
  visual: StageId;
}

const STAGES: Stage[] = [
  {
    id: "kahu",
    num: "01",
    name: "Kahu",
    question: "What's allowed here?",
    desc: "Policy detection. PII masking, tikanga check, and a tier gate before any model sees the request.",
    icon: ShieldCheck,
    accent: PEARL.pounamu,
    visual: "kahu",
  },
  {
    id: "iho",
    num: "02",
    name: "Iho",
    question: "Which specialist handles this?",
    desc: "Routing. Iho classifies the intent, picks the right kete and specialist agent, and selects the right model for the job.",
    icon: GitBranch,
    accent: PEARL.softGold,
    visual: "iho",
  },
  {
    id: "ta",
    num: "03",
    name: "Tā",
    question: "Does the work, properly.",
    desc: "Execution + NZ correctness. Generates the draft against current NZ legislation, your business context and your evidence templates.",
    icon: Cpu,
    accent: PEARL.warmLinen,
    visual: "ta",
  },
  {
    id: "mahara",
    num: "04",
    name: "Mahara",
    question: "Checks against what we've learned.",
    desc: "Memory + cross-verification. Pulls prior decisions, business memory and the knowledge base; flags anything that contradicts the past.",
    icon: BrainCircuit,
    accent: PEARL.dustyRose,
    visual: "mahara",
  },
  {
    id: "mana",
    num: "05",
    name: "Mana",
    question: "Proves it was done right.",
    desc: "Assurance + human-in-the-loop. Assembles the evidence pack, locks the audit trail, and waits for a named operator to sign off.",
    icon: BadgeCheck,
    accent: PEARL.pounamu,
    visual: "mana",
  },
];

/* ─── Tiny atoms ─── */
const Mono = ({ children, color, size = 11 }: { children: React.ReactNode; color?: string; size?: number }) => (
  <span
    style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: size,
      letterSpacing: "0.14em",
      color: color ?? PEARL.muted,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

const RowBadge = ({
  active,
  label,
  status = "ok",
  delay = 0,
}: {
  active: boolean;
  label: string;
  status?: "ok" | "warn";
  delay?: number;
}) => {
  const colour = status === "ok" ? PEARL.pounamu : "#B8860B";
  const Icon = status === "ok" ? CheckCircle2 : AlertTriangle;
  return (
    <motion.div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: `1px solid ${PEARL.opal}`,
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={active ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.4, ease }}
    >
      <Icon size={13} style={{ color: colour, flexShrink: 0 }} />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: PEARL.bodyInk,
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
};

/* ─── Per-stage visuals — modelled on the real pipeline ─── */
const KahuVisual = ({ active }: { active: boolean }) => (
  <div className="space-y-2.5">
    <RowBadge active={active} label="PII detected · masked at intake" delay={0.1} />
    <RowBadge active={active} label="Tier check · Operator plan · OK" delay={0.25} />
    <RowBadge active={active} label="Tikanga check · respectful handling of taonga data" delay={0.4} />
    <RowBadge active={active} label="Rate limit · within hourly budget" delay={0.55} />
  </div>
);

const IhoVisual = ({ active }: { active: boolean }) => {
  const targets = [
    { kete: "Manaaki", agent: "AROHA", picked: false },
    { kete: "Manaaki", agent: "AURA", picked: true },
    { kete: "Waihanga", agent: "ĀRAI", picked: false },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Mono>intent</Mono>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 18,
            color: PEARL.pounamu,
          }}
        >
          "guest experience workflow"
        </span>
      </div>
      <div className="space-y-1.5">
        {targets.map((t, i) => (
          <motion.div
            key={t.agent}
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{
              background: t.picked ? "rgba(217,188,122,0.18)" : "rgba(255,255,255,0.6)",
              border: `1px solid ${t.picked ? PEARL.softGold : PEARL.opal}`,
            }}
            initial={{ opacity: 0, x: -8 }}
            animate={active ? { opacity: t.picked ? 1 : 0.55, x: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease }}
          >
            <Mono color={t.picked ? PEARL.pounamu : PEARL.muted}>
              {t.kete}
            </Mono>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: t.picked ? 600 : 400,
                color: PEARL.ink,
              }}
            >
              {t.agent}
            </span>
            {t.picked && (
              <span
                className="ml-auto"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: PEARL.pounamu }}
              >
                ROUTED
              </span>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <Mono>model</Mono>
        <Mono color={PEARL.pounamu}>gemini-2.5-flash · NZ region</Mono>
      </div>
    </div>
  );
};

const TaVisual = ({ active }: { active: boolean }) => {
  const sources = [
    "Food Act 2014 · s 39 — Food Control Plans",
    "MPI verification cycle — current",
    "Your business memory · last audit Mar 2026",
    "Evidence pack template · Manaaki / FCP",
  ];
  return (
    <div className="space-y-2">
      <Mono>generating draft against</Mono>
      {sources.map((s, i) => (
        <motion.div
          key={s}
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, y: 4 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 + i * 0.18, duration: 0.4, ease }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: PEARL.pounamu }}
            animate={
              active
                ? { opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }
                : {}
            }
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: PEARL.bodyInk,
            }}
          >
            {s}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const MaharaVisual = ({ active }: { active: boolean }) => (
  <div className="space-y-2.5">
    <RowBadge active={active} label="Matches prior decision · 2026-03-18" delay={0.1} />
    <RowBadge active={active} label="Cross-verified against agent_knowledge_base" delay={0.25} />
    <RowBadge
      active={active}
      label="Flagged · supplier policy changed since last run"
      status="warn"
      delay={0.4}
    />
    <RowBadge active={active} label="No contradictions in business memory" delay={0.55} />
  </div>
);

const ManaVisual = ({ active }: { active: boolean }) => (
  <div className="space-y-3">
    <motion.div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: `1px solid ${PEARL.opal}`,
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease }}
    >
      <div className="flex items-center justify-between mb-2">
        <Mono color={PEARL.pounamu}>evidence pack · ready</Mono>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: PEARL.muted,
          }}
        >
          v1 · 24/04/26
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 19,
          lineHeight: 1.3,
          color: PEARL.ink,
          marginBottom: 10,
        }}
      >
        File · forward · footnote.
      </p>
      <div className="space-y-1">
        {["3 sources cited", "1 risk flagged for review", "Audit trail locked"].map(
          (line, i) => (
            <motion.div
              key={line}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.3 }}
            >
              <CheckCircle2 size={12} style={{ color: PEARL.pounamu }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: PEARL.bodyInk,
                }}
              >
                {line}
              </span>
            </motion.div>
          ),
        )}
      </div>
    </motion.div>
    <motion.div
      className="flex items-center justify-between px-3 py-2 rounded-xl"
      style={{
        background: "rgba(217,188,122,0.18)",
        border: `1px solid ${PEARL.softGold}`,
      }}
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : {}}
      transition={{ delay: 0.7, duration: 0.4 }}
    >
      <Mono color={PEARL.pounamu}>awaiting human sign-off</Mono>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: PEARL.pounamu,
        }}
      >
        Kate H. · Operator
      </span>
    </motion.div>
  </div>
);

const VISUALS: Record<StageId, React.FC<{ active: boolean }>> = {
  kahu: KahuVisual,
  iho: IhoVisual,
  ta: TaVisual,
  mahara: MaharaVisual,
  mana: ManaVisual,
};

/* ─── Component ─── */
const HowItWorksFlow = () => {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const stage = STAGES[active];
  const Visual = VISUALS[stage.visual];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 items-start">
      {/* Left: stage selector */}
      <div className="space-y-2.5">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => {
                setActive(i);
                setAutoPlay(false);
              }}
              className="w-full text-left rounded-2xl p-5 transition-all duration-300"
              style={{
                background: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
                border: `1px solid ${isActive ? s.accent : PEARL.opal}`,
                boxShadow: isActive
                  ? `0 8px 30px rgba(111,97,88,0.10)`
                  : "0 1px 0 rgba(255,255,255,0.4) inset",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              whileHover={{ x: isActive ? 0 : 3 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background: isActive ? `${s.accent}25` : "rgba(255,255,255,0.7)",
                    border: `1px solid ${isActive ? s.accent : PEARL.opal}`,
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? PEARL.pounamu : PEARL.muted }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Mono color={isActive ? PEARL.pounamu : PEARL.muted}>
                      stage {s.num}
                    </Mono>
                    <span style={{ color: PEARL.opal }}>·</span>
                    <Mono color={isActive ? PEARL.pounamu : PEARL.muted}>{s.name}</Mono>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: 22,
                      lineHeight: 1.2,
                      color: PEARL.ink,
                      marginBottom: 6,
                    }}
                  >
                    "{s.question}"
                  </p>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        key="desc"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease }}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          color: PEARL.bodyInk,
                          overflow: "hidden",
                        }}
                      >
                        {s.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Controls */}
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${PEARL.opal}`,
              color: PEARL.bodyInk,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
            }}
          >
            {autoPlay ? <Pause size={11} /> : <Play size={11} />}
            {autoPlay ? "Pause" : "Auto-play"}
          </button>
          <div className="flex gap-2">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActive(i);
                  setAutoPlay(false);
                }}
                aria-label={`Jump to ${s.name}`}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === active ? PEARL.pounamu : PEARL.opal,
                  transform: i === active ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: live visual preview */}
      <div className="relative">
        <div
          className="rounded-2xl p-7 min-h-[380px] flex flex-col"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${PEARL.opal}`,
            boxShadow: "0 14px 40px rgba(111,97,88,0.10)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div
            className="flex items-center justify-between pb-4 mb-5"
            style={{ borderBottom: `1px solid ${PEARL.opal}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: stage.accent, boxShadow: `0 0 0 4px ${stage.accent}30` }}
              />
              <Mono color={PEARL.pounamu}>
                stage {stage.num} · {stage.name}
              </Mono>
            </div>
            <Mono>live demo</Mono>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease }}
              >
                <Visual active={true} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="mt-5 pt-4 flex items-center gap-2"
            style={{ borderTop: `1px solid ${PEARL.opal}` }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: PEARL.pounamu }}
            />
            <Mono>logged · audit_log · request_id #r4f9c1</Mono>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksFlow;

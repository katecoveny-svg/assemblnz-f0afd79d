import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Database, CheckCircle2, AlertTriangle, Layers, Fingerprint, Globe } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const C = {
  bg: "#09090F",
  gold: "#A8DDDB",
  goldDim: "#4AA5A8",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.5)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Glass = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: C.glass, borderColor: C.glassBorder,
    boxShadow: "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)", ...style,
  }}>{children}</div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-display text-[11px] tracking-[5px] uppercase mb-3" style={{ fontWeight: 700, color: C.gold }}>{children}</p>
);

const SH = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`font-display text-foreground mb-4 ${className}`} style={{ fontWeight: 300, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "0.04em", lineHeight: 1.15 }}>{children}</h2>
);

/* ── Data table ── */
const DATA_TABLE = [
  { category: "Conversation data", storage: "Encrypted at rest (AES-256)", retention: "90-day retention", control: "Delete anytime from your dashboard" },
  { category: "Business profile", storage: "Isolated per account (RLS enforced)", retention: "While account is active", control: "Used only to personalise your workflows — never sold" },
  { category: "Usage analytics", storage: "Aggregated and anonymised", retention: "Rolling 12 months", control: "Cannot be attributed to you individually" },
  { category: "Payment data", storage: "Processed by Stripe — PCI DSS", retention: "Not stored by Assembl", control: "Stripe's privacy policy applies" },
  { category: "Māori-tagged data", storage: "NZ-only storage, tapu/noa classified", retention: "Governed by iwi/hapū agreement", control: "Māori governance gate required for any access" },
];

/* ── Never list ── */
const NEVER_LIST = [
  "Sell your data to third parties — ever, under any circumstances",
  "Use your conversations to train AI models without your explicit opt-in",
  "Share your data with government agencies without a valid court order",
  "Store any data outside Aotearoa New Zealand",
  "Use your business information for our own marketing or benchmarking",
  "Process Māori-tagged data through public generative AI models",
];

/* ── Compliance badges ── */
const COMPLIANCE_BADGES = [
  { label: "NZ Privacy Act 2020", desc: "Full compliance with all 13 Information Privacy Principles including IPP 3A (effective 1 May 2026)", icon: Shield },
  { label: "NZ Data Residency", desc: "All data stored and processed in Auckland-region data centres", icon: Globe },
  { label: "NZISM Aligned", desc: "NZ Information Security Manual controls applied via signal-security", icon: Lock },
  { label: "Te Mana Raraunga", desc: "Māori Data Sovereignty principles enforced at runtime", icon: Fingerprint },
  { label: "HIPC Aware", desc: "Health Information Privacy Code compliance for care-related data", icon: FileText },
  { label: "SHA-256 Hash Chain", desc: "Tamper-evident audit logs across all pipeline operations", icon: Database },
];

/* ── Ngā Pou e Whā ── */
const NGA_POU = [
  { pou: "Rangatiratanga", english: "Autonomy", desc: "Tino rangatiratanga over data — Te Tiriti Article 2 alignment. Self-determination over how data is collected, stored, and used.", color: C.gold },
  { pou: "Kaitiakitanga", english: "Stewardship", desc: "We are stewards, not owners. Data sovereignty control plane enforces guardianship at runtime with policy-as-code gates.", color: C.pounamu },
  { pou: "Manaakitanga", english: "Hospitality", desc: "Every interaction respects the mana of the individual. Consent is informed, explicit, and revocable at any time.", color: C.pounamuLight },
  { pou: "Whanaungatanga", english: "Relationships", desc: "Data relationships are transparent. The data whakapapa audit trail tracks lineage from input through every transformation.", color: C.goldDim },
];

/* ── Control Plane Architecture ── */
const CONTROL_PLANE = [
  { title: "Māori Data Registry", desc: "Mandatory tagging: provenance/whakapapa, iwi relevance, tapu/noa classification, permitted purposes, and locality rules.", icon: Database },
  { title: "Policy-as-Code Gates", desc: "Runtime enforcement of purpose binding, region-locking (NZ-only), and a 'no-public-GenAI' default for Māori-tagged data.", icon: Lock },
  { title: "Data Whakapapa Logs", desc: "Tamper-evident SHA-256 hash-chain audit trail tracking lineage from inputs to transformations and outputs.", icon: Layers },
  { title: "Māori Governance Gates", desc: "First-class workflow primitive generating governance packs for kaitiaki/co-governance review before any data access.", icon: Shield },
  { title: "Simulation-First Testing", desc: "Benefit/harm tradeoffs assessed against digital twins before onboarding real iwi data. No live data without validated simulation.", icon: Eye },
];

/* ── Testing Regime ── */
const TESTING_REGIME = [
  { stage: "Kahu", label: "Intake", desc: "Every input hashed (SHA-256), tagged simulated/live. Corrupt or unreadable inputs rejected — no unverified data enters the pipeline." },
  { stage: "Iho", label: "Orchestration", desc: "Central router validates data classification (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED), applies PII masking, enforces IPP 3A disclosure." },
  { stage: "Tā", label: "Execution", desc: "Agent actions logged with full attribution. Māori governance gates enforced. Tapu content hard-blocked from generation." },
  { stage: "Mahara", label: "Memory", desc: "Business memory retention validated. TTL enforcement, archival policies, and relevance scoring verified per run." },
  { stage: "Mana", label: "Compliance", desc: "Final compliance check — every output verified against NZ legislation, evidence pack signed, audit entry sealed with hash chain." },
];

/* ── Mead's Five Tests ── */
const MEADS_TESTS = [
  { test: "Tika", desc: "Is the use of this data correct and appropriate?" },
  { test: "Pono", desc: "Is it truthful and genuine in its intent?" },
  { test: "Aroha", desc: "Does it show respect and compassion for the people involved?" },
  { test: "Tikanga", desc: "Does it follow proper cultural protocols and processes?" },
  { test: "Mana", desc: "Does it enhance and protect the mana of those whose data it represents?" },
];

export default function DataSovereigntyPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.white }} className="font-body">
      <SEO title="Data Sovereignty — Your Data is Taonga | Assembl" description="How Assembl protects your data with NZ Privacy Act 2020 compliance, Māori Data Sovereignty protocols, and tamper-evident audit trails." path="/data-sovereignty" />
      <BrandNav />

      {/* ── HERO ── */}
      <section className="max-w-[900px] mx-auto px-6 pt-28 pb-20 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Eyebrow>Data Sovereignty</Eyebrow>
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="font-display mb-6"
          style={{ fontWeight: 300, fontSize: "clamp(2.8rem, 7vw, 5.5rem)", letterSpacing: "0.04em", lineHeight: 1.1,
            background: `linear-gradient(135deg, ${C.gold} 0%, #e8c97a 50%, ${C.gold} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Your Data is Taonga
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="font-body max-w-[660px] mx-auto" style={{ fontWeight: 300, fontSize: "clamp(1rem, 2.2vw, 1.2rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.72)" }}>
          Taonga are treasures — things of value to be protected, preserved, and kept in trust. We treat your business data the same way. Enforced at runtime, not just in policy documents.
        </motion.p>
      </section>

      {/* ── NGĀ POU E WHĀ ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-10">
          <Eyebrow>Ngā Pou e Whā</Eyebrow>
          <SH>Four Pillars of Governance</SH>
          <p className="font-body text-base leading-relaxed max-w-[640px]" style={{ fontWeight: 300, color: C.muted }}>
            Every workflow, every data access, every output is governed by four pou — grounded in Te Tiriti o Waitangi and enforced through our sovereignty control plane.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NGA_POU.map((p, i) => (
            <motion.div key={p.pou} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-6 h-full" style={{ borderTop: `3px solid ${p.color}` }}>
                <span className="font-mono-jb text-[10px] tracking-[0.12em] uppercase" style={{ color: p.color }}>{p.english}</span>
                <h3 className="font-display text-xl mt-2 mb-3 text-foreground" style={{ fontWeight: 300 }}>{p.pou}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: C.muted }}>{p.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SOVEREIGNTY CONTROL PLANE ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-10">
          <Eyebrow>Sovereignty Control Plane</Eyebrow>
          <SH>Enforced at Runtime, Not Just on Paper</SH>
          <p className="font-body text-base leading-relaxed max-w-[640px]" style={{ fontWeight: 300, color: C.muted }}>
            The sovereignty control plane makes Māori governance enforceable at runtime across all data access, tool calls, and model calls. Five components work together.
          </p>
        </motion.div>

        <div className="space-y-3">
          {CONTROL_PLANE.map((item, i) => (
            <motion.div key={item.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.pounamu}15`, border: `1px solid ${C.pounamu}30` }}>
                  <item.icon size={18} style={{ color: C.pounamu }} />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground mb-1" style={{ fontWeight: 700 }}>{item.title}</h3>
                  <p className="font-body text-xs leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MEAD'S FIVE TESTS ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-10">
          <Eyebrow>Cultural Compliance</Eyebrow>
          <SH>Prof. Hirini Moko Mead's Five Tests</SH>
          <p className="font-body text-base leading-relaxed max-w-[640px]" style={{ fontWeight: 300, color: C.muted }}>
            Every workflow involving Māori data is assessed against Mead's Five Tests — the foundational framework for tikanga-aligned decision making.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {MEADS_TESTS.map((t, i) => (
            <motion.div key={t.test} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-5 h-full text-center">
                <div className="font-display text-2xl mb-2" style={{ fontWeight: 300, color: C.gold }}>{t.test}</div>
                <p className="font-body text-[11px] leading-relaxed" style={{ color: C.muted }}>{t.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE TESTING REGIME ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-10">
          <Eyebrow>Five-Stage Testing Regime</Eyebrow>
          <SH>Every Run is Verified</SH>
          <p className="font-body text-base leading-relaxed max-w-[640px]" style={{ fontWeight: 300, color: C.muted }}>
            The five-stage compliance pipeline validates every workflow from intake to sign-off. Simulation-first testing ensures no live data is processed without validated digital twin runs.
          </p>
        </motion.div>

        <div className="space-y-3">
          {TESTING_REGIME.map((s, i) => (
            <motion.div key={s.stage} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-5 flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0 w-14">
                  <span className="font-mono-jb text-[9px] tracking-widest uppercase" style={{ color: C.gold }}>{s.label}</span>
                  <span className="font-display text-lg mt-1" style={{ fontWeight: 300, color: C.white }}>{s.stage}</span>
                  {i < TESTING_REGIME.length - 1 && <div className="w-px h-4 mt-2" style={{ background: `${C.pounamu}30` }} />}
                </div>
                <p className="font-body text-xs leading-relaxed pt-1" style={{ color: C.muted }}>{s.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DATA CLASSIFICATION ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-10">
          <Eyebrow>Data Classification</Eyebrow>
          <SH>Four-Tier Protection</SH>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { tier: "PUBLIC", desc: "Non-sensitive, openly shareable", color: C.pounamuLight },
            { tier: "INTERNAL", desc: "Business use only, not externally shared", color: C.pounamu },
            { tier: "CONFIDENTIAL", desc: "PII, financial data — encrypted and access-controlled", color: C.goldDim },
            { tier: "RESTRICTED", desc: "Māori-tagged, tapu content — governance gates enforced", color: "#E44D4D" },
          ].map((t, i) => (
            <motion.div key={t.tier} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-4 h-full" style={{ borderTop: `2px solid ${t.color}` }}>
                <span className="font-mono-jb text-[10px] tracking-widest" style={{ color: t.color }}>{t.tier}</span>
                <p className="font-body text-[11px] mt-2 leading-relaxed" style={{ color: C.muted }}>{t.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE HOLD ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-8">
          <Eyebrow>Transparency</Eyebrow>
          <SH>What We Hold</SH>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
          <Glass style={{ padding: 0, overflow: "hidden" }}>
            <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_1.2fr_1.8fr] gap-4 px-6 py-3" style={{ background: `${C.pounamu}15`, borderBottom: `1px solid ${C.glassBorder}` }}>
              {["Data category", "How it is stored", "Retention", "Your control"].map(h => (
                <span key={h} className="font-mono-jb text-[10px] tracking-[0.12em] uppercase" style={{ color: C.gold, fontWeight: 700 }}>{h}</span>
              ))}
            </div>
            {DATA_TABLE.map((row, i) => (
              <div key={row.category} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_1.2fr_1.8fr] gap-2 sm:gap-4 px-6 py-4" style={{ borderBottom: i < DATA_TABLE.length - 1 ? `1px solid ${C.glassBorder}` : "none", background: i % 2 === 1 ? "rgba(58,125,110,0.04)" : "transparent" }}>
                <span className="font-display text-sm text-foreground" style={{ fontWeight: 700 }}>{row.category}</span>
                <span className="font-body text-xs" style={{ color: C.muted }}>{row.storage}</span>
                <span className="font-mono-jb text-xs" style={{ color: C.pounamu }}>{row.retention}</span>
                <span className="font-body text-xs" style={{ color: C.muted }}>{row.control}</span>
              </div>
            ))}
          </Glass>
        </motion.div>
      </section>

      {/* ── WHAT WE NEVER DO ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-8">
          <Eyebrow>Our Commitments</Eyebrow>
          <SH>What We Never Do</SH>
        </motion.div>

        <div className="space-y-3">
          {NEVER_LIST.map((item, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.3}>
              <Glass className="flex items-start gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(228,77,77,0.1)", border: "1px solid rgba(228,77,77,0.3)" }}>
                  <span className="font-mono-jb text-xs font-bold" style={{ color: "#E44D4D" }}>✕</span>
                </div>
                <div>
                  <span className="font-display text-sm text-foreground" style={{ fontWeight: 700 }}>Never. </span>
                  <span className="font-body text-sm" style={{ color: C.muted }}>{item}</span>
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMPLIANCE BADGES ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="mb-8">
          <Eyebrow>Compliance</Eyebrow>
          <SH>Standards We Meet</SH>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPLIANCE_BADGES.map((badge, i) => (
            <motion.div key={badge.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Glass className="p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.pounamu}15` }}>
                    <badge.icon size={16} style={{ color: C.pounamu }} />
                  </div>
                  <span className="font-display text-sm text-foreground" style={{ fontWeight: 700 }}>{badge.label}</span>
                </div>
                <p className="font-body text-xs leading-relaxed" style={{ color: C.muted }}>{badge.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── IPP 3A SECTION ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Glass className="p-8" style={{ borderLeft: `4px solid ${C.gold}`, background: `linear-gradient(135deg, ${C.gold}08, transparent)` }}>
            <Eyebrow>IPP 3A — Effective 1 May 2026</Eyebrow>
            <SH className="!text-xl">Third-Party Data Notification</SH>
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
              When any workflow utilises information collected indirectly — from the Shared Context Bus, third-party APIs, or cross-kete data — our agents automatically provide a mandatory disclosure notice naming the source and purpose of use. This is enforced by the Kahu compliance engine at the intake stage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Consent notices generated automatically", "Source attribution on every indirect data use", "Audit log entry for every disclosure", "Subject access pack available on request"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: C.pounamu }} />
                  <span className="font-body text-xs" style={{ color: C.muted }}>{item}</span>
                </div>
              ))}
            </div>
          </Glass>
        </motion.div>
      </section>

      {/* ── CARE PRINCIPLES ── */}
      <section className="max-w-[1080px] mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Glass className="p-8" style={{ borderLeft: `4px solid ${C.pounamu}`, background: `linear-gradient(135deg, ${C.pounamu}08, transparent)` }}>
            <Eyebrow>Te Tiriti Commitment</Eyebrow>
            <SH className="!text-xl">CARE Principles for Indigenous Data</SH>
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.72)" }}>
              Assembl is committed to the principles of Te Tiriti o Waitangi. We recognise Māori rights to data sovereignty — tino rangatiratanga over their taonga.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { letter: "C", word: "Collective benefit", desc: "Data ecosystems that benefit Indigenous peoples" },
                { letter: "A", word: "Authority to control", desc: "Recognising rights to govern data about communities" },
                { letter: "R", word: "Responsibility", desc: "Accountable relationships with communities" },
                { letter: "E", word: "Ethics", desc: "Minimising harm, maximising benefit" },
              ].map(care => (
                <div key={care.letter} className="rounded-xl p-4" style={{ background: `${C.pounamu}10`, border: `1px solid ${C.pounamu}20` }}>
                  <div className="font-display text-2xl mb-1" style={{ fontWeight: 300, color: C.gold }}>{care.letter}</div>
                  <div className="font-display text-xs text-foreground mb-1" style={{ fontWeight: 700 }}>{care.word}</div>
                  <div className="font-body text-[10px] leading-relaxed" style={{ color: C.muted }}>{care.desc}</div>
                </div>
              ))}
            </div>
          </Glass>
        </motion.div>
      </section>

      {/* ── CONTACT ── */}
      <section className="max-w-[1080px] mx-auto px-6 pt-8 pb-24">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Glass className="p-10 text-center" style={{ background: `linear-gradient(135deg, ${C.pounamu}08, transparent)` }}>
            <Eyebrow>Get in Touch</Eyebrow>
            <SH className="!text-xl">Questions About Your Data?</SH>
            <p className="font-body text-sm mb-8 max-w-lg mx-auto" style={{ color: C.muted, lineHeight: 1.75 }}>
              We welcome any questions about how we handle your taonga. Our privacy team responds within one business day.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="mailto:privacy@assembl.co.nz" className="font-body text-sm px-6 py-3 rounded-xl transition-all" style={{ background: C.pounamu, color: C.white }}>
                privacy@assembl.co.nz
              </a>
              <Link to="/privacy" className="font-body text-sm px-6 py-3 rounded-xl transition-all" style={{ border: `1px solid ${C.glassBorder}`, color: C.muted }}>
                Privacy Policy
              </Link>
            </div>
          </Glass>
        </motion.div>
      </section>

      <BrandFooter />
    </div>
  );
}

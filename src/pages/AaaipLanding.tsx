// ═══════════════════════════════════════════════════════════════
// AAAIP — Landing page for Professor Gill Dobbie
// Designed to frame Assembl as an AAAIP industry partner with
// a live demo CTA, partnership value props, and research alignment.
// ═══════════════════════════════════════════════════════════════

import React, { lazy, Suspense } from "react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Globe,
  Layers,
  Play,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

/* ─── Tokens ─── */
const C = {
  bg: "#060610",
  surface: "#0B0B1A",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.93)",
  t2: "rgba(255,255,255,0.60)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
  card: "rgba(255,255,255,0.03)",
};

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* ─── Reusable pieces ─── */
const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }} className={`max-w-6xl mx-auto px-6 sm:px-10 ${className}`}>
    {children}
  </motion.section>
);

const GlassCard = ({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) => (
  <motion.div variants={fade} className={`rounded-2xl p-6 sm:p-8 backdrop-blur-sm ${className}`} style={{
    background: accent ? `linear-gradient(135deg, ${C.pounamu}14, ${C.pounamu}08)` : C.card,
    border: `1px solid ${accent ? `${C.pounamu}30` : C.border}`,
  }}>
    {children}
  </motion.div>
);

const IconCircle = ({ icon: Icon, color = C.pounamuLight, size = 20 }: { icon: React.ElementType; color?: string; size?: number }) => (
  <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}14`, border: `1px solid ${color}18` }}>
    <Icon size={size} style={{ color }} />
  </div>
);

const StatBlock = ({ value, label, color = C.pounamuGlow }: { value: string; label: string; color?: string }) => (
  <motion.div variants={fade} className="text-center">
    <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color }}>{value}</p>
    <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: C.t2 }}>{label}</p>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════ */
export default function AaaipLanding() {
  return (
    <LightPageShell>
    <div className="min-h-screen" style={{ background: C.bg }}>
      <SEO
        title="AAAIP Industry Partner — Assembl"
        description="Assembl: a production multi-agent platform built in Aotearoa, offering real-world agentic AI evidence for the AAAIP national research platform."
      />
      <BrandNav />

      <div className="relative z-10">

        {/* ═══ HERO ═══ */}
        <Section className="pt-20 sm:pt-28 pb-16">
          <motion.div variants={fade}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-8" style={{ background: `${C.pounamu}15`, color: C.pounamuLight, border: `1px solid ${C.pounamu}25` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.pounamuLight }} />
              Aotearoa Agentic AI Platform · Industry Partner
            </div>
          </motion.div>

          <motion.h1 variants={fade} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl" style={{ color: C.t1 }}>
            Real-world agentic AI
            <br />
            <span style={{ color: C.pounamuLight }}>built in Aotearoa</span>
          </motion.h1>

          <motion.p variants={fade} className="text-lg sm:text-xl leading-relaxed mt-6 max-w-2xl" style={{ color: C.t2 }}>
            Assembl is a production multi-agent platform running across NZ industries — the live testbed the AAAIP proposal needs to prove agentic AI works here.
          </motion.p>

          <motion.div variants={fade} className="flex flex-wrap gap-4 mt-10">
            <Link
              to="/aaaip"
              className="inline-flex items-center gap-3 rounded-xl px-7 py-4 text-[15px] font-bold transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${C.pounamu}, ${C.pounamuLight})`, color: C.white, boxShadow: `0 8px 32px ${C.pounamu}40` }}
            >
              <Play size={18} /> Launch Live Demo
            </Link>
            <Link
              to="/aaaip/researcher"
              className="inline-flex items-center gap-3 rounded-xl px-7 py-4 text-[15px] font-bold transition-all hover:brightness-110"
              style={{ background: `${C.white}08`, color: C.t1, border: `1px solid ${C.border}` }}
            >
              <FlaskConical size={18} /> Researcher Console
            </Link>
          </motion.div>
        </Section>

        {/* ═══ STATS BAR ═══ */}
        <Section className="pb-16">
          <motion.div variants={fade} className="rounded-2xl py-8 px-6" style={{ background: `linear-gradient(135deg, ${C.pounamu}10, ${C.navy}10)`, border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <StatBlock value="48" label="Specialist AI Agents" />
              <StatBlock value="10" label="Digital Twin Pilots" color={C.goldLight} />
              <StatBlock value="5" label="NZ Industry Kete" />
              <StatBlock value="5-stage" label="Compliance Pipeline" color={C.goldLight} />
            </div>
          </motion.div>
        </Section>

        {/* ═══ WHAT THE AAAIP GETS ═══ */}
        <Section className="pb-20">
          <motion.div variants={fade} className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.t1 }}>
              What Assembl brings to the AAAIP
            </h2>
            <p className="text-base mt-3 max-w-2xl" style={{ color: C.t2 }}>
              The AAAIP needs real-world proof, not more theory. Assembl offers production evidence, SME reach, and research data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                title: "Live Industry Testbed",
                body: "A production system running across 13+ NZ industries with real legislation. Real-world data on how agents perform, where they fail, how they coordinate — not simulations of simulations.",
                color: C.pounamuLight,
              },
              {
                icon: Users,
                title: "The SME Angle",
                body: "97% of NZ businesses are small. Beca, Spark, and Fonterra can't represent them. Assembl demonstrates that agentic AI works for the hairdresser, the cafe, the builder — not just corporates.",
                color: C.goldLight,
              },
              {
                icon: Shield,
                title: "Hallucination Research",
                body: "A five-stage compliance pipeline (Kahu → Iho → Tā → Mahara → Mana) designed to catch AI errors in high-stakes legal contexts. Real data on where agents fail and how the pipeline catches them.",
                color: C.pounamuGlow,
              },
            ].map((item) => (
              <GlassCard key={item.title}>
                <IconCircle icon={item.icon} color={item.color} />
                <h3 className="text-lg font-bold mt-5 mb-3" style={{ color: C.t1 }}>{item.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>{item.body}</p>
              </GlassCard>
            ))}
          </div>
        </Section>

        {/* ═══ PLATFORM ARCHITECTURE ═══ */}
        <Section className="pb-20">
          <motion.div variants={fade} className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.t1 }}>
              Platform architecture
            </h2>
            <p className="text-base mt-3 max-w-2xl" style={{ color: C.t2 }}>
              Every agent output passes through a policy-governed compliance pipeline before reaching the user. Uncertain cases are escalated to a human in the loop.
            </p>
          </motion.div>

          {/* Pipeline visual */}
          <GlassCard accent className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { name: "Kahu", desc: "Regulatory context flagging", color: C.pounamuLight },
                { name: "Iho", desc: "Intent classification & routing", color: C.pounamuGlow },
                { name: "Tā", desc: "Response formatting", color: C.goldLight },
                { name: "Mahara", desc: "Source legislation check", color: C.gold },
                { name: "Mana", desc: "Governance & sign-off", color: C.pounamuLight },
              ].map((stage, i) => (
                <motion.div key={stage.name} variants={fade} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-sm font-black mb-2" style={{ background: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}25` }}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold" style={{ color: C.t1 }}>{stage.name}</p>
                  <p className="text-[11px] mt-1 leading-snug" style={{ color: C.t3 }}>{stage.desc}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <GlassCard>
              <div className="flex items-start gap-4">
                <IconCircle icon={Layers} color={C.pounamuLight} />
                <div>
                  <h4 className="text-base font-bold mb-2" style={{ color: C.t1 }}>Multi-agent orchestration</h4>
                  <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>
                    48 specialist agents coordinate through Iho — a central intelligence layer that classifies intent, routes to the right specialists, and ensures responses don't contradict each other.
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-start gap-4">
                <IconCircle icon={Globe} color={C.goldLight} />
                <div>
                  <h4 className="text-base font-bold mb-2" style={{ color: C.t1 }}>Tikanga governance layer</h4>
                  <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>
                    Cultural governance built into the architecture. Outputs are checked against four pou — Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga — with a default-deny approach.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </Section>

        {/* ═══ DIGITAL TWIN PILOTS ═══ */}
        <Section className="pb-20">
          <motion.div variants={fade} className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.t1 }}>
              10 digital twin pilots — live now
            </h2>
            <p className="text-base mt-3 max-w-2xl" style={{ color: C.t2 }}>
              Every pilot runs a deterministic simulator under live policy governance. Click "Launch Demo" to run any of them.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: "01", name: "Clinic Scheduling", desc: "Patient triage, slot allocation, fairness drift, emergency reprioritisation", group: "Foundation" },
              { num: "02", name: "Human-Robot Collaboration", desc: "ISO 15066 safety, zone occupancy, force limits, intent classification", group: "Foundation" },
              { num: "03", name: "Drug Screening", desc: "96-well plate dispatch, IRB consent, dosage limits, reproducibility", group: "Foundation" },
              { num: "04", name: "Community Moderation", desc: "Harm detection, te reo respect, Māori data sovereignty, PII leak prevention", group: "Foundation" },
              { num: "05", name: "Waihanga — Construction", desc: "Site safety, photo documentation, hazard escalation, WorkSafe compliance", group: "Industry" },
              { num: "06", name: "Pikau — Freight & Customs", desc: "Cold-chain monitoring, driver hours, eco-driving, customs declarations", group: "Industry" },
              { num: "07", name: "Manaaki — Hospitality", desc: "Guest safety, allergens, accessibility, overbooking protection", group: "Industry" },
              { num: "08", name: "Auaha — Creative", desc: "Nine-agent studio, claim register, Fair Trading Act, no autonomous publishing", group: "Industry" },
              { num: "09", name: "Toro — Whānau Navigator", desc: "SMS-first family support, parental consent, age-appropriate, wellbeing crisis", group: "Industry" },
              { num: "10", name: "Arataki — Automotive", desc: "Finance quotes, CCCFA disclosure, odometer integrity, ICE-vs-EV calculator", group: "Industry" },
            ].map((p) => (
              <motion.div key={p.num} variants={fade} className="rounded-xl p-5 flex gap-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${p.group === "Foundation" ? C.pounamuLight : C.goldLight}14`, color: p.group === "Foundation" ? C.pounamuLight : C.goldLight }}>
                  {p.num}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-bold" style={{ color: C.t1 }}>{p.name}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${p.group === "Foundation" ? C.pounamuLight : C.goldLight}12`, color: p.group === "Foundation" ? C.pounamuLight : C.goldLight }}>{p.group}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.t3 }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fade} className="mt-8 text-center">
            <Link
              to="/aaaip"
              className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-[15px] font-bold transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${C.pounamu}, ${C.pounamuLight})`, color: C.white, boxShadow: `0 8px 32px ${C.pounamu}40` }}
            >
              <Play size={18} /> Launch Demo Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </Section>

        {/* ═══ AAAIP ALIGNMENT ═══ */}
        <Section className="pb-20">
          <motion.div variants={fade} className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.t1 }}>
              Research alignment
            </h2>
            <p className="text-base mt-3 max-w-2xl" style={{ color: C.t2 }}>
              Assembl's R&D agenda maps directly to the AAAIP's core research questions.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                aaaip: "How do AI agents maintain reliability in real-world deployment?",
                assembl: "Production compliance pipeline with five-stage verification, audit logging, and measurable error rates across 48 agents operating on NZ legislation.",
                icon: Shield,
              },
              {
                aaaip: "How should multiple agents coordinate without contradicting each other?",
                assembl: "Iho orchestration layer classifies intent, routes to specialist agents, and reconciles cross-domain responses (e.g., employment law + health & safety + food safety).",
                icon: Brain,
              },
              {
                aaaip: "How can AI systems align with NZ values and Te Tiriti obligations?",
                assembl: "Tikanga governance framework with four pou, Māori data sovereignty controls (iwi consent, whakapapa tagging, data residency), and default-deny for culturally sensitive content.",
                icon: Globe,
              },
              {
                aaaip: "How do we test agentic AI safely before real-world deployment?",
                assembl: "Ten deterministic digital twins with reproducible seeds, covering clinic scheduling to construction sites. Every agent decision is simulation-tested and policy-governed.",
                icon: FlaskConical,
              },
              {
                aaaip: "How can agentic AI serve all New Zealanders, not just large corporates?",
                assembl: "Purpose-built for SMEs — the 97% of NZ businesses that can't afford enterprise AI. Five industry kete covering hospitality, construction, creative, automotive, and freight.",
                icon: Users,
              },
            ].map((item) => (
              <GlassCard key={item.aaaip}>
                <div className="flex gap-5">
                  <IconCircle icon={item.icon} color={C.pounamuLight} />
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.gold }}>AAAIP Research Question</p>
                    <p className="text-[15px] font-semibold mb-3" style={{ color: C.t1 }}>{item.aaaip}</p>
                    <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>{item.assembl}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Section>

        {/* ═══ CTA ═══ */}
        <Section className="pb-24">
          <motion.div variants={fade} className="rounded-2xl p-10 sm:p-14 text-center" style={{
            background: `linear-gradient(135deg, ${C.pounamu}18, ${C.navy}15)`,
            border: `1px solid ${C.pounamu}25`,
          }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: C.t1 }}>
              Run the demo
            </h2>
            <p className="text-base max-w-xl mx-auto mb-8" style={{ color: C.t2 }}>
              Ten digital twin pilots. Policy-governed agents. Full audit trail. See simulation-tested agentic AI running live — then export the data.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/aaaip"
                className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-[15px] font-bold transition-all hover:brightness-110 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${C.pounamu}, ${C.pounamuLight})`, color: C.white, boxShadow: `0 8px 32px ${C.pounamu}40` }}
              >
                <Play size={18} /> Launch Demo Dashboard
              </Link>
              <Link
                to="/aaaip/researcher"
                className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-[15px] font-bold transition-all hover:brightness-110"
                style={{ background: `${C.white}08`, color: C.t1, border: `1px solid ${C.border}` }}
              >
                <FlaskConical size={18} /> Researcher Console
              </Link>
            </div>
          </motion.div>
        </Section>

        <BrandFooter />
      </div>
    </div>
    </LightPageShell>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Eye, FileCheck, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

const C = {
  bg: "#060610",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.6)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.6, ease },
};

const PIPELINE_STAGES = [
  {
    name: "Kahu",
    meaning: "The Cloak",
    role: "Policy & Compliance Gate",
    desc: "Scans every request against NZ legislation, Māori Data Sovereignty rules, and your business policies before any action is taken.",
    examples: ["Privacy Act 2020 compliance", "Cultural data classification (tapu/noa)", "Industry-specific regulation checks"],
    icon: Shield,
    color: C.pounamu,
  },
  {
    name: "Iho",
    meaning: "The Core",
    role: "Intent Router & Tool Loader",
    desc: "Understands what you're asking, routes to the right specialist agent, and loads the correct industry tools and context.",
    examples: ["Routes 'WoF check' → Arataki kete", "Loads Building Code tools for consenting", "Multi-agent symbiotic handoffs"],
    icon: Users,
    color: "#2A5A8C",
  },
  {
    name: "Tā",
    meaning: "The Mark",
    role: "Execution & Brand Voice",
    desc: "Executes the task while enforcing NZ English, your brand voice, and professional output standards.",
    examples: ["NZ English spelling enforcement", "Brand-consistent document formatting", "Citation format: Act + Section + Year"],
    icon: FileCheck,
    color: C.gold,
  },
  {
    name: "Mahara",
    meaning: "Memory & Recall",
    role: "Citation Verification",
    desc: "Verifies every legislative citation is accurate, current, and properly formatted before it reaches you.",
    examples: ["Cross-references legislation.govt.nz", "Flags outdated or repealed sections", "Confidence scoring (🟢/🟡/🔴)"],
    icon: BookOpen,
    color: C.pounamuGlow,
  },
  {
    name: "Mana",
    meaning: "Authority & Integrity",
    role: "Disclaimer & Evidence Layer",
    desc: "Injects professional disclaimers, generates tamper-evident audit trails, and produces sign-off-ready evidence packs.",
    examples: ["'Draft only — requires professional review'", "SHA-256 hash-chain audit logs", "Evidence pack generation"],
    icon: Eye,
    color: "#E8E8E8",
  },
];

const DIFFERENTIATORS = [
  { stat: "5", label: "Governance stages", desc: "Every output passes through all five before reaching you" },
  { stat: "26", label: "NZ sources monitored", desc: "Daily scans of legislation.govt.nz, MBIE, IRD, WorkSafe, and more" },
  { stat: "0", label: "Overseas competitors with this", desc: "No global platform has cultural safety checks built in" },
];

const TikangaGovernancePage = () => (
  <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
    <SEO
      title="Tikanga Governance Pipeline — assembl"
      description="The only workflow platform with a 5-stage cultural and legislative compliance pipeline built for Aotearoa. Kahu, Iho, Tā, Mahara, Mana."
    />
    <BrandNav />

    {/* Hero */}
    <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-16">
      <motion.p
        className="text-[11px] font-semibold tracking-[5px] uppercase mb-7"
        style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
      >
        GOVERNANCE PIPELINE
      </motion.p>

      <motion.h1
        className="max-w-3xl"
        style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease }}
      >
        Five stages between{" "}
        <span style={{ background: `linear-gradient(135deg, ${C.pounamu}, ${C.pounamuGlow})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          your question
        </span>
        {" "}and the answer
      </motion.h1>

      <motion.p
        className="max-w-xl mt-6 text-base sm:text-lg leading-[1.7]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.t2 }}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease }}
      >
        Every workflow output is checked against NZ legislation, cultural safety standards, and your business rules — before it reaches you. No overseas platform does this.
      </motion.p>
    </section>

    {/* Stats */}
    <section className="px-6 py-12" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {DIFFERENTIATORS.map((d, i) => (
          <motion.div key={d.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5, ease }}>
            <p className="text-4xl font-light mb-1" style={{ fontFamily: "'Lato', sans-serif", color: C.pounamuGlow }}>{d.stat}</p>
            <p className="text-[15px] font-medium mb-1" style={{ color: C.t1 }}>{d.label}</p>
            <p className="text-[13px]" style={{ color: C.t3 }}>{d.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Pipeline */}
    <section className="px-6 py-20 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fade} className="text-center mb-16">
          <p className="text-[11px] font-bold tracking-[4px] uppercase mb-4" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>
            THE GOLDEN SEQUENCE
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif", lineHeight: 1.15 }}>
            Kahu → Iho → Tā → Mahara → Mana
          </h2>
          <p className="text-[15px] leading-relaxed max-w-xl mx-auto" style={{ color: C.t2 }}>
            Every request flows through all five stages in order. Nothing is skipped. Nothing is optional.
          </p>
        </motion.div>

        <div className="space-y-6">
          {PIPELINE_STAGES.map((stage, i) => (
            <motion.div
              key={stage.name}
              className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 2px 20px ${stage.color}06`,
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
            >
              {/* Stage number */}
              <span className="absolute top-6 right-8 text-[64px] font-light opacity-[0.04]" style={{ fontFamily: "'Lato', sans-serif" }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${stage.color}14` }}>
                  <stage.icon size={28} style={{ color: stage.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-xl font-medium" style={{ color: C.t1 }}>{stage.name}</h3>
                    <span className="text-[12px] italic" style={{ color: C.t3 }}>"{stage.meaning}"</span>
                  </div>
                  <p className="text-[13px] font-semibold uppercase tracking-[2px] mb-3" style={{ color: stage.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {stage.role}
                  </p>
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: C.t2 }}>{stage.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.examples.map((ex) => (
                      <span key={ex} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: `${stage.color}10`, color: `${stage.color}cc`, border: `1px solid ${stage.color}20` }}>
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Cultural framework */}
    <section className="px-6 py-20" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-4xl mx-auto">
        <motion.div {...fade} className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[4px] uppercase mb-4" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>
            CULTURAL SAFETY
          </p>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif", lineHeight: 1.15 }}>
            Built on Ngā Pou e Whā and Mead's Five Tests
          </h2>
          <p className="text-[15px] leading-relaxed max-w-xl mx-auto" style={{ color: C.t2 }}>
            Cultural safety isn't a feature we added — it's the foundation the pipeline was built on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { title: "Rangatiratanga", desc: "Self-determination — iwi and hapū retain control over their data and how it's used." },
            { title: "Kaitiakitanga", desc: "Guardianship — data is treated as a taonga (treasure) with duty of care." },
            { title: "Manaakitanga", desc: "Care & respect — outputs uphold dignity and avoid cultural harm." },
            { title: "Whanaungatanga", desc: "Relationships — decisions consider community impact, not just individual benefit." },
          ].map((pou, i) => (
            <motion.div
              key={pou.title}
              className="rounded-2xl p-7"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
            >
              <h3 className="text-lg font-medium mb-2" style={{ color: C.pounamuGlow }}>{pou.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: C.t3 }}>{pou.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fade} className="mt-12 rounded-2xl p-8 text-center" style={{ background: `${C.pounamu}08`, border: `1px solid ${C.pounamu}20` }}>
          <p className="text-[14px] leading-relaxed mb-1" style={{ color: C.t2 }}>
            <strong style={{ color: C.t1 }}>Hard blocks enforced:</strong> The pipeline will never generate karakia, whaikōrero, or waiata. Sacred content requires human speakers — always.
          </p>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 py-24 text-center">
      <div className="max-w-xl mx-auto">
        <motion.div {...fade}>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif", lineHeight: 1.15 }}>
            See governed workflows in action
          </h2>
          <p className="text-[15px] leading-relaxed mb-10" style={{ color: C.t2 }}>
            Every output checked, cited, and ready for sign-off.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="cta-glass-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
              Get started <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
              Book a walkthrough
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default TikangaGovernancePage;

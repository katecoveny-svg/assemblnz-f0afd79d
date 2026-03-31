import { motion } from "framer-motion";
import { ArrowRight, Target, Users, Globe, Rocket, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import AgentAvatar from "@/components/AgentAvatar";

const ROADMAP = [
  { quarter: "Q1 2026", title: "Platform Launch", desc: "44 agents live with NZ legislation training, voice interface, and SPARK app builder.", done: true },
  { quarter: "Q2 2026", title: "MCP API & Integrations", desc: "Accounting, job management, and Google Workspace integrations. Public API for enterprise.", done: false },
  { quarter: "Q3 2026", title: "Industry Suites", desc: "Dedicated multi-agent workflows for construction, hospitality, and property management.", done: false },
  { quarter: "Q4 2026", title: "Enterprise & Government", desc: "SOC 2 certification, on-premise deployment options, and government procurement compliance.", done: false },
];

const MARKET_STATS = [
  { value: "$4.2B", label: "NZ SaaS Market by 2027" },
  { value: "620K", label: "NZ SMEs" },
  { value: "73%", label: "Want specialist tools but lack resources" },
  { value: "6+", label: "Avg. platforms per business" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      <BrandNav />

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-foreground mb-4">
            The operating system for <span className="text-gradient-hero">NZ business</span>
          </h1>
          <p className="text-sm sm:text-base font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most businesses know they need to comply with NZ law. They just don't have time to read it all. Assembl has — 50+ Acts, from the Holidays Act to the Health and Safety at Work Act. Our 44 specialist tools turn that legislation into plain-English guidance, instant document generation, and compliance checks that take seconds instead of hours.
          </p>
        </motion.div>
      </section>

      {/* Vision */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-mono-jb text-muted-foreground uppercase tracking-widest">Our Vision</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground mt-2 mb-4">
                Built for <span className="text-gradient-hero">Aotearoa</span>
              </h2>
              <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
                Most business tools are trained on US data, US laws, and US business practices. They don't know what PAYE is. They've never heard of the Building Act. They can't calculate KiwiSaver contributions.
              </p>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                Assembl changes that. Every tool is grounded in 50+ New Zealand Acts and trained on the specific regulations, standards, and cultural context that NZ businesses operate within. Powered by AI trained on NZ legislation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Target size={20} />, title: "Purpose-built", desc: "Not adapted — built from the ground up for NZ" },
                { icon: <Shield size={20} />, title: "Legislation-first", desc: "50+ NZ Acts embedded in every response" },
                { icon: <Users size={20} />, title: "SME-focused", desc: "Priced for the 620K businesses that need it most" },
                { icon: <Globe size={20} />, title: "Always on", desc: "24/7 specialist tools that never take leave" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl p-4 border border-border bg-card" style={{ backdropFilter: "blur(12px)" }}>
                  <div className="text-primary mb-2">{item.icon}</div>
                  <p className="text-xs font-display font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-center text-foreground mb-10">
            The <span className="text-gradient-hero">market</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MARKET_STATS.map((s) => (
              <div key={s.label} className="text-center rounded-xl p-5 border border-border bg-card">
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-gradient-hero mb-1">{s.value}</p>
                <p className="text-[10px] font-body text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-center text-foreground mb-10">
            <span className="text-gradient-hero">Roadmap</span>
          </h2>
          <div className="space-y-4">
            {ROADMAP.map((item, i) => (
              <motion.div
                key={item.quarter}
                className="flex gap-4 rounded-xl p-5 border border-border bg-card"
                style={{ backdropFilter: "blur(12px)", borderColor: item.done ? "hsl(var(--primary) / 0.3)" : undefined }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="shrink-0">
                  <span className={`text-[10px] font-mono-jb font-bold px-2.5 py-1 rounded-full ${item.done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.quarter}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-xs font-body text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-28 h-28 rounded-full mx-auto mb-5 object-contain border-2 border-border"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground mb-3">
            Built by <span className="text-gradient-hero">Kate</span>
          </h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work. Every tool is trained on real NZ legislation — not generic overseas advice. My goal is to give every Kiwi business access to enterprise-grade business intelligence at a price they can afford."
          </p>
          <p className="text-xs font-display font-bold text-foreground">Kate</p>
          <p className="text-[11px] font-body text-muted-foreground">Founder & CEO · Auckland, New Zealand</p>
          <Link to="/#contact" className="inline-flex items-center gap-2 mt-4 text-sm font-display font-bold text-primary hover:text-foreground transition-colors">
            Get in touch <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default AboutPage;

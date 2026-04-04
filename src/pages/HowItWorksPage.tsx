import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import IhoRoutingVisualizer from "@/components/demo/IhoRoutingVisualizer";

const STEPS = [
  {
    num: "01",
    title: "Understand your business",
    desc: "During your Launch Sprint, we map your current workflows, tools, and pain points. We run 4 hours of focused strategy sessions to understand exactly where manual work drains your team.",
    color: "#D4A843",
  },
  {
    num: "02",
    title: "Design your automation",
    desc: "Our team designs a custom Assembl configuration using the kete (packs) and specialist agents that match your industry and workflows. You see the design and we iterate based on your feedback.",
    color: "#3A7D6E",
  },
  {
    num: "03",
    title: "Deploy & evolve",
    desc: "We deploy your Assembl instance and run weekly optimisation calls for the first month. Your team learns the platform, and we monitor for improvement opportunities.",
    color: "#1A3A5C",
  },
];

const KETE = [
  { name: "Manaaki", sub: "Hospitality, Venues & Tourism", agents: 8, color: "#D4A843", to: "/manaaki" },
  { name: "Hanga", sub: "Construction & Trade", agents: 6, color: "#3A7D6E", to: "/hanga" },
  { name: "Auaha", sub: "Creative Industries & Media", agents: 8, color: "#F0D078", to: "/auaha" },
  { name: "Pakihi", sub: "Finance & Professional Services", agents: 8, color: "#1A3A5C", to: "/pakihi" },
  { name: "Hangarau", sub: "Technology & Software", agents: 8, color: "#5AADA0", to: "/hangarau" },
  { name: "Te Kāhui Reo", sub: "Māori Organisations & Cultural Institutions", agents: 8, color: "#3A6A9C", to: "/te-kahui-reo" },
  { name: "Tōroa", sub: "Family Navigator", agents: 1, color: "#D4A843", to: "/toroa" },
];

const SECTION = "relative px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";
const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" as const }, transition: { duration: 0.6 } };

const HowItWorksPage = () => (
  <div className="min-h-screen flex flex-col" style={{ background: "#09090F", color: "#FFFFFF" }}>
    <SEO title="How Assembl Works — The Operating System for NZ Business" description="Assembl packages 44 specialist AI agents into 7 industry-specific kete. Built for how NZ businesses actually run." path="/how-it-works" />
    <BrandNav />

    {/* Hero */}
    <section className="pt-24 pb-12 px-6 sm:px-8 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
          HOW IT WORKS
        </span>
        <h1 className="text-3xl sm:text-5xl max-w-3xl mx-auto mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          The operating system built for how NZ businesses actually run.
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
          Assembl packages 44 specialist AI agents into 7 industry-specific kete (packs). Each agent handles one core workflow: quoting, payroll, planning, marketing, compliance, execution, and reporting. They work together, stay in your data, and run on your schedule.
        </p>
      </motion.div>
    </section>

    {/* 3-Step Process */}
    <section className={SECTION}>
      <div className={INNER}>
        <motion.div {...fade} className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Three steps to a working AI business layer
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} className="rounded-2xl p-8 relative" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
              <span className="text-[40px] font-light absolute top-6 right-6" style={{ fontFamily: "'Lato', sans-serif", color: `${s.color}20` }}>{s.num}</span>
              <div className="w-10 h-1 rounded-full mb-5" style={{ background: s.color }} />
              <h3 className="text-lg mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* The Kete */}
    <section className={SECTION}>
      <div className={INNER}>
        <motion.div {...fade} className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
            NGĀ KETE
          </span>
          <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            7 industry packs, 44 specialist agents
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {KETE.map((k, i) => (
            <motion.div key={k.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}>
              <Link to={k.to} className="block rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
                <div className="w-full h-1 rounded-full mb-4" style={{ background: k.color }} />
                <h3 className="text-base mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>{k.name}</h3>
                <p className="text-xs mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}>{k.sub}</p>
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${k.color}15`, color: k.color }}>{k.agents} agents</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing model */}
    <section className={SECTION}>
      <div className={`${INNER} max-w-3xl text-center`}>
        <motion.div {...fade}>
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>
            PRICING
          </span>
          <h2 className="text-2xl sm:text-3xl mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Transparent, usage-based pricing
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
            Every customer starts with a Launch Sprint (from NZ$2,500 setup), then pays a monthly subscription based on which kete you adopt. No per-seat charges. No hidden fees.
          </p>
          <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, background: "transparent", border: "1px solid rgba(58,125,110,0.4)", color: "#3A7D6E" }}>
            See full pricing <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className={SECTION}>
      <div className={`${INNER} max-w-2xl text-center mx-auto`}>
        <motion.div {...fade}>
          <h2 className="text-2xl sm:text-3xl mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Ready to see how it works for your business?
          </h2>
          <p className="text-sm mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
            Book a free 30-minute discovery call. We'll map your workflows and show you exactly which agents can run them.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, background: "#D4A843", color: "#09090F" }}>
            Book a Launch Sprint <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default HowItWorksPage;

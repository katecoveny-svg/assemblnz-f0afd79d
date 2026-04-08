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
    desc: "During onboarding, we help you map your current workflows, tools, and pain points. We start with a 30-minute discovery call before any contract is signed.",
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
  { name: "Manaaki", sub: "Hospitality", color: "#D4A843", to: "/manaaki" },
  { name: "Waihanga", sub: "Construction", color: "#3A7D6E", to: "/hanga" },
  { name: "Auaha", sub: "Creative", color: "#F0D078", to: "/auaha" },
  { name: "Arataki", sub: "Automotive", color: "#1A3A5C", to: "/arataki" },
  { name: "Pikau", sub: "Freight & Customs", color: "#5AADA0", to: "/pikau" },
];

const SECTION = "relative px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";
const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" as const }, transition: { duration: 0.6 } };

const HowItWorksPage = () => (
  <div className="min-h-screen flex flex-col" style={{ background: "#09090F", color: "#FFFFFF" }}>
    <SEO title="How Assembl Works — Specialist operational workflows for NZ business" description="Assembl gives NZ businesses specialist operational workflows across five industry kete. Reduces admin, surfaces risk earlier, keeps people in control." path="/how-it-works" />
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
          Assembl packages specialist operational workflows into five industry kete — Manaaki (hospitality), Waihanga (construction), Auaha (creative), Arataki (automotive), Pikau (freight & customs). Each kete handles core workflows for its industry. They work together, stay in your data, and run on your schedule.
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
            Five industry kete, built in Aotearoa
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {KETE.map((k, i) => (
            <motion.div key={k.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}>
              <Link to={k.to} className="block rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
                <div className="w-full h-1 rounded-full mb-4" style={{ background: k.color }} />
                <h3 className="text-base mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>{k.name}</h3>
                <p className="text-xs mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}>{k.sub}</p>
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${k.color}15`, color: k.color }}>Explore →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Iho Routing Demo */}
    <section className={SECTION} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={`${INNER} max-w-3xl`}>
        <motion.div {...fade} className="text-center mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>
            LIVE DEMO
          </span>
          <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            See Iho route in real time
          </h2>
          <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
            Type any business question and watch the routing engine classify intent, load skills, and select the right agent.
          </p>
        </motion.div>
        <IhoRoutingVisualizer />
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
            Plans start from NZ$590/mo + $1,490 setup (NZD ex GST). Family plan from $29/mo. Setup fees can be split across the first 3 invoices on request.
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
            Book a discovery call <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default HowItWorksPage;

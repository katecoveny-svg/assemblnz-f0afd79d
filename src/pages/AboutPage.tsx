import { motion } from "framer-motion";
import { ArrowRight, Target, Users, Rocket, Globe, TrendingUp, Layers, Zap, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";

const MARKET_STATS = [
  { value: "530K+", label: "NZ businesses", icon: Users },
  { value: "97%", label: "are SMEs", icon: TrendingUp },
  { value: "$0", label: "NZ-built AI OS alternatives", icon: Target },
  { value: "42", label: "industry agents at launch", icon: Layers },
];

const GO_TO_MARKET = [
  {
    channel: "Direct",
    description: "assembl.nz — organic search, content marketing, and agent demo viral loops",
    icon: Globe,
    color: "#00FF88",
  },
  {
    channel: "Channel Partners",
    description: "Accountants, business consultants, and industry associations as referral partners",
    icon: Users,
    color: "#00E5FF",
  },
  {
    channel: "Events & Expos",
    description: "NZ Field Days, Hospitality NZ Expo, BuildNZ, TechWeek — live demo stations",
    icon: Calendar,
    color: "#B388FF",
  },
  {
    channel: "AssemblFund",
    description: "Free or discounted access for Kiwi startups and community organisations",
    icon: Zap,
    color: "#FF2D9B",
  },
];

const ROADMAP = [
  {
    phase: "Q1 2026",
    title: "Foundation",
    items: ["42 agents launched", "Supabase backend live", "Stripe billing active", "Brand DNA scanner"],
    status: "complete",
  },
  {
    phase: "Q2 2026",
    title: "Growth",
    items: ["Voice agents (ElevenLabs)", "MCP API for enterprise", "Channel partner program", "Mobile app beta"],
    status: "current",
  },
  {
    phase: "Q3 2026",
    title: "Scale",
    items: ["Enterprise tier launch", "White-label agent builder", "NZ-wide compliance automation", "Xero integration"],
    status: "upcoming",
  },
  {
    phase: "Q4 2026",
    title: "Expand",
    items: ["Australia market entry", "Industry vertical partnerships", "AI workflow marketplace", "Series A preparation"],
    status: "upcoming",
  },
];

const PRICING_SUMMARY = [
  { tier: "Free", price: "$0", description: "3 messages per agent — try before you buy", color: "#A1A1AA" },
  { tier: "Starter", price: "$89/mo", description: "1 agent, 100 messages, NZ legislation", color: "#10B981" },
  { tier: "Pro", price: "$299/mo", description: "3 agents + SPARK, 500 messages, Brand DNA", color: "#10B981" },
  { tier: "Business", price: "$599/mo", description: "All 42 agents, 2,000 messages, Command Centre", color: "#10B981" },
  { tier: "Enterprise", price: "Custom", description: "Unlimited agents, API access, custom training, SLA", color: "#B388FF" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField />
      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* HERO */}
      <section className="relative z-10 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.span
            className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-4 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            About Assembl
          </motion.span>
          <motion.h1
            className="text-3xl sm:text-5xl lg:text-6xl font-syne font-bold text-foreground mb-6 leading-[1.1]"
            style={{ letterSpacing: "-0.03em" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            The first AI operating system{" "}
            <span className="text-gradient-hero">built for New Zealand.</span>
          </motion.h1>
          <motion.p
            className="text-sm sm:text-lg font-jakarta text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Assembl gives every NZ business access to 42 AI agents trained on our legislation,
            our culture, and the way Kiwi businesses actually work. No more generic overseas advice.
          </motion.p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              className="rounded-2xl p-6 sm:p-8 border"
              style={{
                background: "rgba(14,14,26,0.6)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(0,255,136,0.1)",
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-lg sm:text-xl font-syne font-extrabold text-foreground mb-3">
                <span style={{ color: "#00FF88" }}>Vision</span>
              </h2>
              <p className="text-sm font-jakarta text-foreground/80 leading-relaxed">
                Every New Zealand business — from sole traders to enterprises — has an AI operations layer
                that understands NZ law, speaks our language, and works 24/7. Assembl becomes the default
                business operating system for Aotearoa, then expands across the Pacific.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-6 sm:p-8 border"
              style={{
                background: "rgba(14,14,26,0.6)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(0,229,255,0.1)",
              }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-lg sm:text-xl font-syne font-extrabold text-foreground mb-3">
                <span style={{ color: "#00E5FF" }}>Mission</span>
              </h2>
              <p className="text-sm font-jakarta text-foreground/80 leading-relaxed">
                To democratise AI for NZ business by providing industry-specific agents grounded in real
                legislation, delivered at SME-friendly pricing. We replace six fragmented platforms with one
                intelligence layer — saving businesses time, money, and compliance headaches.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MARKET OPPORTUNITY */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Market <span className="text-gradient-hero">opportunity</span>
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {MARKET_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center rounded-2xl p-5 border"
                style={{
                  background: "rgba(14,14,26,0.5)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon size={20} className="mx-auto mb-2 text-muted-foreground/60" />
                <div className="text-2xl sm:text-3xl font-syne font-extrabold text-gradient-hero">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-jakarta text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-sm font-jakarta text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            New Zealand has over 530,000 businesses, 97% of which are SMEs. There is currently no
            AI operating system built specifically for NZ legislation and business practices. Assembl
            is the first — and aims to be the default.
          </motion.p>
        </div>
      </section>

      {/* PRODUCT OVERVIEW */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What <span className="text-gradient-hero">Assembl</span> includes
          </motion.h2>
          <motion.p
            className="text-sm font-jakarta text-muted-foreground text-center mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            One subscription. Entire business operations.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "42 AI Agents", desc: "Deep specialists across 16 NZ industries — not generic chatbots" },
              { title: "NZ Legislation Engine", desc: "50+ Acts of Parliament embedded with proactive compliance alerts" },
              { title: "Brand DNA Scanner", desc: "Scan your website and every agent learns your brand voice and context" },
              { title: "SPARK App Builder", desc: "No-code AI app generation — quote calculators, forms, dashboards" },
              { title: "Document Intelligence", desc: "Upload contracts, invoices, plans — structured extraction in seconds" },
              { title: "Voice Agents", desc: "Natural phone and IVR agents powered by ElevenLabs (coming soon)" },
              { title: "Command Centre", desc: "Unified dashboard for compliance, maintenance, and workflow management" },
              { title: "Embeddable Widgets", desc: "Drop AI chat into any website — branded, trained, and always on" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-3 rounded-xl p-4 border"
                style={{
                  background: "rgba(14,14,26,0.4)",
                  borderColor: "rgba(255,255,255,0.05)",
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#00FF88" }} />
                <div>
                  <h3 className="text-sm font-syne font-bold text-foreground">{feature.title}</h3>
                  <p className="text-[11px] font-jakarta text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Pricing <span className="text-gradient-hero">strategy</span>
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRICING_SUMMARY.map((plan, i) => (
              <motion.div
                key={plan.tier}
                className="rounded-xl p-4 border text-center"
                style={{
                  background: "rgba(14,14,26,0.5)",
                  borderColor: plan.tier === "Pro" ? `${plan.color}30` : "rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-[10px] font-mono-jb text-muted-foreground">{plan.tier}</span>
                <div className="text-lg font-syne font-extrabold mt-1" style={{ color: plan.color }}>{plan.price}</div>
                <p className="text-[10px] font-jakarta text-muted-foreground mt-1">{plan.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GO TO MARKET */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Go-to-market <span className="text-gradient-hero">strategy</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GO_TO_MARKET.map((channel, i) => (
              <motion.div
                key={channel.channel}
                className="rounded-2xl p-6 border"
                style={{
                  background: "rgba(14,14,26,0.5)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <channel.icon size={20} className="mb-3" style={{ color: channel.color }} />
                <h3 className="text-sm font-syne font-bold text-foreground mb-1">{channel.channel}</h3>
                <p className="text-[11px] font-jakarta text-muted-foreground leading-relaxed">{channel.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Product <span className="text-gradient-hero">roadmap</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {ROADMAP.map((phase, i) => (
              <motion.div
                key={phase.phase}
                className="rounded-2xl p-5 border relative overflow-hidden"
                style={{
                  background: "rgba(14,14,26,0.5)",
                  backdropFilter: "blur(12px)",
                  borderColor: phase.status === "current"
                    ? "rgba(0,255,136,0.2)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: phase.status === "current" ? "0 0 30px rgba(0,255,136,0.05)" : "none",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {phase.status === "current" && (
                  <span className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
                )}
                <span className="text-[10px] font-mono-jb text-muted-foreground">{phase.phase}</span>
                <h3 className="text-sm font-syne font-bold text-foreground mt-1 mb-3">{phase.title}</h3>
                <ul className="space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11px] font-jakarta text-foreground/70">
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{
                          background: phase.status === "complete"
                            ? "#00FF88"
                            : phase.status === "current"
                            ? "#00E5FF"
                            : "rgba(255,255,255,0.2)",
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <span
                  className="inline-block mt-3 text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
                  style={{
                    background: phase.status === "complete"
                      ? "rgba(0,255,136,0.1)"
                      : phase.status === "current"
                      ? "rgba(0,229,255,0.1)"
                      : "rgba(255,255,255,0.03)",
                    color: phase.status === "complete"
                      ? "#00FF88"
                      : phase.status === "current"
                      ? "#00E5FF"
                      : "rgba(255,255,255,0.3)",
                  }}
                >
                  {phase.status === "complete" ? "SHIPPED" : phase.status === "current" ? "IN PROGRESS" : "PLANNED"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate Harland, Founder of Assembl"
            className="w-28 h-28 rounded-full mx-auto mb-6 object-contain border-2"
            style={{ borderColor: "rgba(0,255,136,0.2)" }}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
          <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-foreground mb-3">
            Founded by <span className="text-gradient-hero">Kate Harland</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6">
            Kate built Assembl because NZ businesses deserve AI tools that understand our laws, our culture,
            and the way we work. Based in Auckland, she's on a mission to make Assembl the default operating
            system for every Kiwi business.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            className="rounded-2xl p-8 sm:p-10 border"
            style={{
              background: "rgba(14,14,26,0.6)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(0,255,136,0.15)",
              boxShadow: "0 0 60px rgba(0,255,136,0.05)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-foreground mb-3">
              Interested in partnering?
            </h2>
            <p className="text-sm font-jakarta text-muted-foreground mb-6">
              Whether you're an investor, channel partner, or enterprise — let's talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/#contact"
                className="cta-glass-green inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold font-jakarta"
              >
                Get in touch <ArrowRight size={14} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold font-jakarta transition-all duration-300"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#FAFAFA",
                }}
              >
                View pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AboutPage;

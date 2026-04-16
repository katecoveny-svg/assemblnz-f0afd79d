import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, MessageSquare, Users, Zap, Globe, Lock, FileText, Scale, Phone, Layers, Database, TrendingUp, ChevronRight } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

/* ─── animation presets ─── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─── reusable glass card ─── */
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    {children}
  </div>
);

/* ─── count-up hook ─── */
function useCountUp(end: number, duration = 1800, suffix = "", prefix = "") {
  const [val, setVal] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as any, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * end);
      setVal(`${prefix}${current.toLocaleString()}${suffix}`);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration, suffix, prefix]);

  return { ref, val };
}

/* ─── section nav ─── */
const SECTIONS = [
  { id: "product", label: "Product" },
  { id: "market", label: "Market" },
  { id: "governance", label: "Governance" },
  { id: "financials", label: "Financials" },
  { id: "roadmap", label: "Roadmap" },
  { id: "contact", label: "Contact" },
];

const SectionNav = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <nav
      className="sticky top-[57px] z-40 hidden md:flex items-center justify-center gap-6 py-3 text-[13px]"
      style={{
        background: "rgba(9,9,15,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className="font-body font-medium text-gray-500 hover:text-foreground transition-colors"
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
};

/* ─── particle stars ─── */
const Stars = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "rgba(255,255,255,0.4)",
          }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
};

/* ─── SMS phone mockup ─── */
const SMS_CONVO = [
  { from: "user", text: "Hey, I need a plumber for a leaking tap in Mt Eden. Can someone come this week?" },
  { from: "agent", text: "Kia ora! I can help with that. I've got two certified plumbers available this week in the Mt Eden area." },
  { from: "agent", text: "Thursday 10am–12pm with Dave ($95/hr + GST)\nFriday 2pm–4pm with Sarah ($110/hr + GST)\n\nWould either of those work?" },
  { from: "user", text: "Thursday with Dave works" },
  { from: "agent", text: "Locked in ✓\n\nDave will be at your place Thursday 10am. He'll text you 30 min before arrival. You'll get a quote before any work starts.\n\nAnything else?" },
  { from: "user", text: "That was easy. Cheers" },
];

const PhoneMockup = () => (
  <div className="relative mx-auto w-[300px] sm:w-[320px]">
    {/* phone frame */}
    <div
      className="rounded-[36px] border-2 p-3 pt-10 pb-6"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: "rgba(9,9,15,0.95)",
      }}
    >
      {/* notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black border border-gray-200" />
      {/* carrier */}
      <div className="text-center text-[10px] font-mono text-gray-400 mb-3">+64 22 ASSEMBL</div>
      {/* messages */}
      <div className="space-y-3 px-1 max-h-[400px] overflow-hidden">
        {SMS_CONVO.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.25, duration: 0.5, ease }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-line ${
                msg.from === "user" ? "text-foreground" : "text-white/90"
              }`}
              style={{
                background:
                  msg.from === "user"
                    ? "rgba(58,125,110,0.14)"
                    : "rgba(255,255,255,0.05)",
                border: `1px solid ${msg.from === "user" ? "rgba(58,125,110,0.22)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {msg.from === "agent" && (
                <span className="block text-[10px] font-mono mb-1" style={{ color: "#3A6A9C" }}>
                  assembl agent
                </span>
              )}
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── main page ─── */
const InvestPage = () => {
  const stat1 = useCountUp(97, 1400, "%");
  const stat2 = useCountUp(0, 200);
  const stat3 = useCountUp(530, 1600, "K+");
  const stat4 = useCountUp(2.6, 1600, "M", "$");

  return (
    <div className="min-h-screen" style={{ background: "#FAFBFC", color: "#3D4250" }}>
      <BrandNav />
      <SectionNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative overflow-hidden px-6 py-24 md:py-36 max-w-6xl mx-auto text-center">
        <Stars />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10">
          <motion.div variants={fadeUp}>
            <span
              className="inline-block rounded-full px-4 py-1.5 text-[12px] font-mono font-medium mb-8"
              style={{ background: "rgba(212,168,67,0.1)", color: "#3A6A9C", border: "1px solid rgba(212,168,67,0.2)" }}
            >
              First to market in New Zealand
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-light leading-[1.1] tracking-tight mb-6"
          >
            Your customers text.
            <br />
            <span style={{ color: "#5AADA0" }}>A specialist agent answers.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-2xl mx-auto text-base md:text-lg text-white/55 font-body leading-relaxed mb-10"
          >
            Assembl turns any NZ phone number into a specialist agent. Customers text a question, the agent handles it.
            Bookings, compliance checks, customer service, intake forms. No app download. No login. Just a text.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:assembl@assembl.co.nz"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-black transition-shadow hover:shadow-[0_0_30px_rgba(58,125,110,0.30)]"
              style={{ background: "#5AADA0" }}
            >
              Talk to the founder <ArrowRight size={16} />
            </a>
            <button
              onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-foreground border border-gray-300 hover:border-white/40 transition-colors"
            >
              See it work
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 2. STATS BAR ═══ */}
      <section className="px-6 max-w-5xl mx-auto -mt-4 mb-20">
        <Glass className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { ref: stat1.ref, val: stat1.val, label: "SMS open rate in NZ" },
            { ref: stat2.ref, val: stat2.val, label: "Direct competitors in NZ" },
            { ref: stat3.ref, val: stat3.val, label: "NZ SMEs addressable" },
            { ref: stat4.ref, val: stat4.val, label: "Projected ARR Month 18" },
          ].map((s, i) => (
            <div key={i} className="py-8 px-6 text-center">
              <span ref={s.ref} className="block text-2xl md:text-3xl font-mono font-bold" style={{ color: "#5AADA0" }}>
                {s.val}
              </span>
              <span className="text-[12px] text-white/40 font-body mt-1 block">{s.label}</span>
            </div>
          ))}
        </Glass>
      </section>

      {/* ═══ 3. PRODUCT DEMO ═══ */}
      <section id="product" className="px-6 max-w-6xl mx-auto py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-light mb-4">
            How it works
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 font-body mb-14 max-w-xl">
            A real conversation between a customer and an Assembl agent — no app, no portal, just SMS.
          </motion.p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <PhoneMockup />
          <div className="space-y-5">
            {[
              {
                icon: MessageSquare,
                title: "Natural language, no menus",
                desc: "Customers write like texting a mate. The agent understands intent, context, and kiwi slang.",
              },
              {
                icon: Users,
                title: "Human-in-the-loop by default",
                desc: "High-value decisions route to human approval. Configurable thresholds for every workflow.",
              },
              {
                icon: Globe,
                title: "Built for Aotearoa",
                desc: "Dedicated NZ phone numbers with UEMA-compliant opt-in/opt-out. Te reo support planned. Privacy Act audit trail.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease }}
              >
                <Glass className="p-6 flex gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(212,168,67,0.08)" }}
                  >
                    <f.icon size={18} style={{ color: "#3A6A9C" }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[15px] mb-1">{f.title}</h3>
                    <p className="text-[13px] text-gray-500 font-body leading-relaxed">{f.desc}</p>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. MARKET OPPORTUNITY ═══ */}
      <section id="market" className="px-6 max-w-5xl mx-auto py-20">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-light mb-12"
        >
          Market opportunity
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { stat: "$0", label: "Cost to reach existing customers", desc: "SMS is already on every phone. No app installs, no onboarding friction." },
            { stat: "3 min", label: "Average response time", desc: "Compared to 4+ hours for typical NZ SMEs. Speed wins repeat business." },
            { stat: "15%+", label: "GDP uplift from generative AI by 2038", desc: "From Aotearoa's national AI strategy. This market is being built now." },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease }}
            >
              <Glass className="p-7 h-full">
                <span className="block text-3xl font-mono font-bold mb-2" style={{ color: "#5AADA0" }}>
                  {c.stat}
                </span>
                <h3 className="font-display font-bold text-[15px] mb-2">{c.label}</h3>
                <p className="text-[12.5px] text-white/40 font-body leading-relaxed">{c.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 5. GOVERNANCE & COMPLIANCE ═══ */}
      <section id="governance" className="px-6 max-w-5xl mx-auto py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-light mb-3">
            Governance &amp; compliance
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 font-body mb-12 max-w-2xl">
            Not an afterthought. Our regulatory framework is the product.
          </motion.p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-5">
          {([
            {
              tag: "Te Tiriti o Waitangi",
              tagColor: "#5AADA0",
              title: "Māori Data Sovereignty",
              content:
                "We recognise the six principles of Te Mana Raraunga: rangatiratanga (self-determination), whakapapa (data lineage), whanaungatanga (reciprocal relationships), kotahitanga (collective benefit), manaakitanga (dignity and care), and kaitiakitanga (guardianship). Māori data is taonga. Our governance framework gives Māori communities decision-making authority over data that relates to them.",
            },
            {
              tag: "Privacy Act 2020",
              tagColor: "#3A6A9C",
              title: "13 IPPs with automated decision controls",
              content:
                "IPP 8 compliance for automated decisions: data accuracy verification before every agent action. Human review for consequential decisions. Breach notification within 72 hours. Cross-border data transfer safeguards documented. Privacy Impact Assessment completed before launch.",
            },
            {
              tag: "Algorithm Charter",
              tagColor: "#C85A54",
              title: "Aligned with Aotearoa's world-first charter",
              content:
                "Full transparency on how our agents make decisions. Te Ao Māori perspective embedded in design. Human oversight at every consequential decision point. Algorithm Impact Assessment completed.",
            },
            {
              tag: "UEMA 2007 & Consumer Protection",
              tagColor: "#5AADA0",
              title: "SMS compliance baked into the platform",
              content:
                'Every message includes sender identification, functional opt-out ("reply STOP"), and documented consent trails. Fair Trading Act alignment: agents disclose they\'re AI, never misrepresent capabilities.',
            },
          ] as const).map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
            >
              <Glass className="p-7 h-full">
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-mono font-medium mb-4"
                  style={{
                    color: c.tagColor,
                    background: `${c.tagColor}12`,
                    border: `1px solid ${c.tagColor}30`,
                  }}
                >
                  {c.tag}
                </span>
                <h3 className="font-display font-bold text-lg mb-3">{c.title}</h3>
                <p className="text-[13px] text-gray-500 font-body leading-relaxed">{c.content}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 6. FINANCIAL PROJECTIONS ═══ */}
      <section id="financials" className="px-6 max-w-5xl mx-auto py-20">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-light mb-12"
        >
          Financial projections
        </motion.h2>

        {/* pricing table */}
        <Glass className="overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] font-body">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-6 py-4 font-display font-bold text-white/70">Tier</th>
                  <th className="px-6 py-4 font-display font-bold text-white/70">Price</th>
                  <th className="px-6 py-4 font-display font-bold text-white/70">Messages</th>
                  <th className="px-6 py-4 font-display font-bold text-white/70">Includes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { tier: "Starter", price: "$99/mo", msgs: "500", inc: "1 agent" },
                  { tier: "Professional", price: "$249/mo", msgs: "2,000", inc: "3 agents + CRM integration" },
                  { tier: "Enterprise", price: "$499/mo", msgs: "5,000", inc: "Unlimited agents + API + custom workflows" },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-white/4 last:border-0">
                    <td className="px-6 py-4 font-medium">{r.tier}</td>
                    <td className="px-6 py-4 font-mono" style={{ color: "#5AADA0" }}>{r.price}</td>
                    <td className="px-6 py-4 font-mono text-white/60">{r.msgs}</td>
                    <td className="px-6 py-4 text-gray-500">{r.inc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Glass>

        {/* stats bar */}
        <Glass className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { val: "~240", label: "Customers to break even" },
            { val: "Month 9", label: "Break-even target" },
            { val: "$2.64M", label: "ARR at Month 18" },
            { val: "78%", label: "Gross margin target" },
          ].map((s, i) => (
            <div key={i} className="py-6 px-5 text-center">
              <span className="block text-lg md:text-xl font-mono font-bold" style={{ color: "#3A6A9C" }}>
                {s.val}
              </span>
              <span className="text-[11px] text-white/35 font-body mt-1 block">{s.label}</span>
            </div>
          ))}
        </Glass>
      </section>

      {/* ═══ 7. ROADMAP ═══ */}
      <section id="roadmap" className="px-6 max-w-4xl mx-auto py-20">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-light mb-14"
        >
          Roadmap
        </motion.h2>
        <div className="relative pl-8 border-l border-white/8 space-y-12">
          {[
            {
              phase: "Phase 1",
              time: "Now – Month 3",
              title: "Foundation & First Customers",
              color: "#5AADA0",
              items: [
                "NZ telco integration & dedicated +64 numbers",
                "Single-agent MVP live",
                "First 10 paying customers",
                "UEMA compliance & PIA complete",
              ],
            },
            {
              phase: "Phase 2",
              time: "Month 4–9",
              title: "Multi-Agent & Integrations",
              color: "#3A6A9C",
              items: [
                "Professional tier launch",
                "Xero, ServiceM8, Jobber connectors",
                "240 customers — break-even",
              ],
            },
            {
              phase: "Phase 3",
              time: "Month 10–15",
              title: "Platform & Scale",
              color: "#C85A54",
              items: [
                "Enterprise tier & workflow builder",
                "API for developers",
                "Te reo Māori support",
                "Government pilot programme",
                "800+ customers",
              ],
            },
            {
              phase: "Phase 4",
              time: "Month 16–24",
              title: "Market Leadership",
              color: "#5AADA0",
              items: [
                "Agent marketplace",
                "Australia expansion",
                "Voice-to-agent capability",
                "$5M+ ARR",
              ],
            },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease }}
              className="relative"
            >
              {/* dot */}
              <div
                className="absolute -left-[37px] top-1 w-3 h-3 rounded-full border-2"
                style={{ borderColor: p.color, background: "#FAFBFC", boxShadow: `0 0 12px ${p.color}40` }}
              />
              <span className="text-[11px] font-mono text-white/35 block mb-1">{p.time}</span>
              <h3 className="font-display font-bold text-lg mb-1">
                <span style={{ color: p.color }} className="font-mono text-[12px] mr-2">
                  {p.phase}
                </span>
                {p.title}
              </h3>
              <ul className="space-y-1 mt-3">
                {p.items.map((it, j) => (
                  <li key={j} className="text-[13px] text-gray-500 font-body flex items-start gap-2">
                    <ChevronRight size={12} className="mt-0.5 shrink-0" style={{ color: p.color }} />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 8. COMPETITIVE MOAT ═══ */}
      <section className="px-6 max-w-5xl mx-auto py-20">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-light mb-12"
        >
          Competitive moat
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              icon: Phone,
              title: "NZ telco relationships",
              desc: "NZ telco integration, dedicated +64 numbers, short code provisioning. Not something a foreign entrant can replicate quickly.",
              accent: "#5AADA0",
            },
            {
              icon: Shield,
              title: "Regulatory compliance as product",
              desc: "UEMA, Privacy Act, Algorithm Charter, Treaty compliance. Built into the architecture, not bolted on.",
              accent: "#3A6A9C",
            },
            {
              icon: Layers,
              title: "NZ-specific agent training",
              desc: "GST, ACC, employment law, council regulations, industry licensing. Agents that understand how NZ actually works.",
              accent: "#5AADA0",
            },
            {
              icon: Database,
              title: "Network effects",
              desc: "Every interaction improves agents for that vertical. First-mover data advantage compounds over time.",
              accent: "#3A6A9C",
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
            >
              <Glass className="p-7 h-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c.accent}10` }}
                >
                  <c.icon size={18} style={{ color: c.accent }} />
                </div>
                <h3 className="font-display font-bold text-[15px] mb-2">{c.title}</h3>
                <p className="text-[13px] text-white/40 font-body leading-relaxed">{c.desc}</p>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 9. CTA ═══ */}
      <section id="contact" className="px-6 max-w-3xl mx-auto py-24 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-display font-light mb-4"
          >
            This market won't stay empty.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 font-body mb-10 max-w-lg mx-auto">
            If you're interested in NZ's first text-to-agent platform, let's talk.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:assembl@assembl.co.nz"
               className="cta-glass-gold inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold"

            >
              Email Kate <ArrowRight size={16} />
            </a>
            <a
              href="mailto:assembl@assembl.co.nz"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-foreground border border-gray-300 hover:border-white/40 transition-colors"
            >
              Request Business Plan
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="px-6 py-8 border-t border-white/6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="font-display font-light tracking-[4px] uppercase text-[13px]">
          ASSEMBL
        </Link>
        <span className="text-[12px] text-gray-400 font-body">
          © 2026 Assembl. Built in Aotearoa New Zealand.
        </span>
      </footer>
    </div>
  );
};

export default InvestPage;

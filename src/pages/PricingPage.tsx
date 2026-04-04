import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Shield, Brain, Eye, FileText, Database, Lock, Globe, Heart, PenTool, Monitor, Phone, MessageCircle, Mic, Mail, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { PRICING, SETUP_FEE, ANNUAL_DISCOUNT } from "@/data/pricing";
import { STRIPE_TIERS } from "@/data/stripeTiers";

const ease = [0.16, 1, 0.3, 1];

/* ── Section A: Hero ── */
const PricingHero = () => (
  <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: "rgba(255,255,255,0.3)",
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </div>
    <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
      <p className="text-[11px] font-display tracking-[5px] uppercase mb-4" style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>
        SIMPLE, TRANSPARENT PRICING
      </p>
      <h1 className="text-3xl sm:text-5xl font-display mb-4 text-foreground" style={{ fontWeight: 300, letterSpacing: "-0.02em" }}>
        One platform, every agent, every kete
      </h1>
      <p className="text-base sm:text-lg font-body max-w-2xl mx-auto mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
        All 44+ specialist agents and all 9 industry kete included on every plan. No hidden add-ons. All prices in NZD + GST.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}>
        <Sparkles size={14} style={{ color: "#D4A843" }} />
        <span className="text-xs font-body" style={{ color: "#D4A843" }}>14-day free trial on Essentials — no credit card required</span>
      </div>
    </div>
  </section>
);

/* ── Section B: Pricing Toggle + Tiers ── */
const PricingTiers = () => {
  const [annual, setAnnual] = useState(false);

  const tiers = [
    {
      ...PRICING.essentials,
      accent: "#3A7D6E",
      badge: "GETTING STARTED",
      stripeLink: `/signup?plan=essentials`,
      who: "Perfect for sole traders, small cafes, and one-person operations",
      practice: "500 queries = about 25 questions a day. Ask about compliance, generate documents, check legislation — all day, every working day.",
      example: "A cafe owner asks: 'Is my food control plan up to date for the new MPI changes?' and gets a compliance check in seconds.",
    },
    {
      ...PRICING.business,
      accent: "#D4A843",
      badge: "MOST POPULAR",
      stripeLink: `/signup?plan=business`,
      who: "Built for growing teams — construction firms, accounting practices, hospitality groups",
      practice: "2,000 queries across 10 users = your whole team using Assembl throughout the day. Plus priority support when you need answers fast.",
      example: "A construction PM asks: 'Generate a site safety plan for our Ponsonby build' and gets a compliant SSSP in minutes.",
    },
    {
      ...PRICING.enterprise,
      accent: "#5B8FA8",
      badge: "ENTERPRISE",
      stripeLink: "/contact",
      who: "For organisations with complex compliance needs — multi-site operators, iwi entities, government contractors",
      practice: "Unlimited users and queries. Dedicated support. Custom integrations with your existing systems.",
      example: "An enterprise admin says: 'Audit all our employment agreements against the new ERA amendments' and gets a full compliance report.",
    },
  ];

  return (
    <section id="plans" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-5">
        {/* Annual / Monthly toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-body transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{ background: annual ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            aria-label="Toggle annual billing"
          >
            <div
              className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300"
              style={{
                left: annual ? "calc(100% - 26px)" : "2px",
                background: annual ? "#D4A843" : "rgba(255,255,255,0.5)",
              }}
            />
          </button>
          <span className={`text-sm font-body transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <span className="ml-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(58,125,110,0.15)", color: "#5AADA0" }}>
              SAVE {ANNUAL_DISCOUNT}%
            </span>
          </span>
        </div>

        {/* Setup fee callout */}
        <div className="text-center mb-10">
          <p className="text-xs font-body text-muted-foreground">
            One-time setup fee: <span className="font-mono text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{SETUP_FEE.label}</span> — {SETUP_FEE.description.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tiers.map((t, i) => {
            const price = annual ? t.annualPrice : t.price;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease }}
                className="glass-card glow-card-hover p-6 rounded-2xl flex flex-col relative"
                style={{
                  borderColor: t.popular ? "rgba(212,168,67,0.3)" : undefined,
                  borderWidth: t.popular ? 2 : undefined,
                }}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-display px-4 py-1 rounded-full" style={{ background: t.accent, color: "#0F1623", fontWeight: 700, letterSpacing: "2px" }}>
                    MOST POPULAR
                  </span>
                )}
                <span className="text-[9px] font-display tracking-[3px] uppercase mb-3" style={{ color: t.accent, fontWeight: 700 }}>{t.badge}</span>
                <h3 className="text-xl font-display text-foreground mb-1" style={{ fontWeight: 300 }}>{t.name}</h3>
                <p className="text-xs font-body text-muted-foreground/60 mb-4">{t.descriptor}</p>

                <div className="mb-1">
                  <span className="text-3xl font-mono text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground/50 ml-1">/mo + GST</span>
                </div>
                {annual && (
                  <p className="text-[11px] font-body text-muted-foreground/40 mb-4 line-through">
                    ${t.price}/mo
                  </p>
                )}
                {!annual && <div className="mb-4" />}

                <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />

                <ul className="space-y-2.5 mb-6 flex-1">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: t.accent }} />{f}
                    </li>
                  ))}
                </ul>

                {/* Who / Practice / Example */}
                <div className="mb-5 rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${t.accent}18` }}>
                  <div>
                    <span className="text-[9px] font-display tracking-[2px] uppercase mr-1.5" style={{ color: t.accent, fontWeight: 700 }}>WHO</span>
                    <span className="text-[10px] font-body leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{t.who}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-display tracking-[2px] uppercase mr-1.5" style={{ color: t.accent, fontWeight: 700 }}>IN PRACTICE</span>
                    <span className="text-[10px] font-body leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{t.practice}</span>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: `${t.accent}10`, borderLeft: `2px solid ${t.accent}50` }}>
                    <span className="text-[9px] font-display tracking-[2px] uppercase mr-1.5" style={{ color: t.accent, fontWeight: 700 }}>EXAMPLE</span>
                    <p className="text-[10px] font-body leading-snug mt-0.5 italic" style={{ color: "rgba(255,255,255,0.5)" }}>{t.example}</p>
                  </div>
                </div>

                {t.trial && (
                  <p className="text-[10px] font-body text-center mb-3" style={{ color: "#5AADA0" }}>
                    {t.trial}
                  </p>
                )}

                <Link
                  to={t.stripeLink}
                  className="block w-full text-center py-3 rounded-lg text-sm font-body font-medium transition-all hover:scale-[1.02]"
                  style={{
                    background: t.popular ? t.accent : "transparent",
                    color: t.popular ? "#0F1623" : t.accent,
                    border: t.popular ? "none" : `1px solid ${t.accent}40`,
                    boxShadow: t.popular ? `0 0 20px rgba(212,168,67,0.2)` : undefined,
                  }}
                >
                  {t.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[11px] font-body text-muted-foreground/40 text-center mt-8 max-w-2xl mx-auto">
          All prices in NZ$ + GST. Setup fee covers workflow mapping, tool integration, agent configuration, and launch.
        </p>
      </div>
    </section>
  );
};

/* ── Section C: What's Inside ── */
const SHARED_AGENTS = [
  { icon: Brain, name: "Iho", desc: "Intelligent routing heart" },
  { icon: Shield, name: "SIGNAL", desc: "Security & IT" },
  { icon: Eye, name: "Kahu", desc: "Compliance check" },
  { icon: FileText, name: "Tā", desc: "Audit trail" },
  { icon: Database, name: "Mahara", desc: "Business memory" },
  { icon: Lock, name: "Mana", desc: "Access control" },
  { icon: Globe, name: "Te Reo", desc: "Bilingual support" },
  { icon: Heart, name: "Tikanga", desc: "Cultural governance" },
  { icon: PenTool, name: "Elite Copy", desc: "Writing quality" },
];

const KETE_SUMMARY = [
  { name: "Manaaki", eng: "Hospitality & Tourism", count: 9, accent: "#FFD700" },
  { name: "Hanga", eng: "Construction", count: 9, accent: "#00CED1" },
  { name: "Auaha", eng: "Creative & Media", count: 9, accent: "#FF8C00" },
  { name: "Pakihi", eng: "Business & Commerce", count: 11, accent: "#4169E1" },
  { name: "Waka", eng: "Transport & Vehicles", count: 3, accent: "#FF7F50" },
  { name: "Hangarau", eng: "Technology", count: 12, accent: "#00BFFF" },
  { name: "Hauora", eng: "Health & Lifestyle", count: 8, accent: "#00FF7F" },
  { name: "Te Kāhui Reo", eng: "Māori Business Intelligence", count: 8, accent: "#FF69B4" },
  { name: "Tōroa", eng: "Family Navigator", count: 1, accent: "#87CEEB" },
];

const CHANNELS = [
  { icon: Monitor, label: "Web Dashboard" },
  { icon: Phone, label: "SMS" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Mic, label: "Voice" },
  { icon: Mail, label: "Email" },
];

const CapabilityMap = () => (
  <section className="py-16 sm:py-20">
    <div className="max-w-6xl mx-auto px-5">
      <h2 className="text-lg sm:text-2xl font-display text-center mb-2 text-foreground" style={{ fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
        Included on every plan
      </h2>
      <p className="text-sm font-body text-center text-muted-foreground mb-12 max-w-xl mx-auto">
        44+ specialist agents across 9 industry kete, powered by a shared governance layer.
      </p>

      {/* Channels */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-display tracking-[3px] uppercase text-muted-foreground mb-3" style={{ fontWeight: 700 }}>CHANNELS</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {CHANNELS.map(c => (
            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <c.icon size={16} className="text-primary" />
              <span className="text-xs font-body text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kete Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {KETE_SUMMARY.map(k => (
          <motion.div key={k.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-4 text-center" style={{ borderTop: `2px solid ${k.accent}` }}>
            <h3 className="text-sm font-display text-foreground mb-0.5" style={{ fontWeight: 300 }}>{k.name}</h3>
            <p className="text-[10px] font-body text-muted-foreground/50 mb-1">{k.eng}</p>
            <span className="text-[9px] font-mono" style={{ color: k.accent, fontFamily: "'JetBrains Mono', monospace" }}>{k.count} agents</span>
          </motion.div>
        ))}
      </div>

      {/* Shared Foundation */}
      <div className="glass-card rounded-2xl p-5 mt-4">
        <p className="text-[10px] font-display tracking-[3px] uppercase text-muted-foreground mb-4" style={{ fontWeight: 700 }}>ASSEMBL CORE — Shared governance layer</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {SHARED_AGENTS.map(a => (
            <div key={a.name} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                <a.icon size={18} className="text-primary" />
              </div>
              <p className="text-[10px] font-display text-foreground" style={{ fontWeight: 300 }}>{a.name}</p>
              <p className="text-[8px] font-body text-muted-foreground/40">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ── Section D: Tōroa ── */
const ToroaSection = () => {
  const features = ["Photo → school notice parsed", "Fridge photo → meal plan", "Live bus tracking", "Weather → dress the kids", "Smart reminders", "Homework tracker"];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <p className="text-[11px] font-display tracking-[5px] uppercase mb-3" style={{ fontWeight: 700, color: "#89CFF0" }}>FOR WHĀNAU</p>
        <h2 className="text-xl sm:text-3xl font-display text-foreground mb-6" style={{ fontWeight: 300 }}>Tōroa — Your family's intelligent navigator</h2>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card glow-card-hover rounded-2xl p-8 inline-block text-left" style={{ borderColor: "rgba(137,207,240,0.2)" }}>
          <p className="text-2xl font-mono text-foreground mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>NZ$29<span className="text-sm text-muted-foreground">/month + GST</span></p>
          <p className="text-xs font-body text-muted-foreground mb-5">No app. No login. Just text.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <Check size={12} style={{ color: "#89CFF0" }} className="shrink-0" />{f}
              </div>
            ))}
          </div>
          <a href={PRICING.toroa.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 rounded-lg text-sm font-body font-medium transition-all hover:scale-[1.02]" style={{ background: "#89CFF0", color: "#0F1623" }}>
            Start with Tōroa
          </a>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Section E: FAQ ── */
const FAQS = [
  { q: "What's included in the setup fee?", a: "The $749 + GST setup fee covers workflow mapping, tool integration, agent configuration, team training, and launch support. We get your Assembl instance running and connected to your existing systems." },
  { q: "What's a kete?", a: "A kete is a traditional Māori woven basket, typically crafted from harakeke (New Zealand flax). We use it as a metaphor for our industry packs — each kete is a carefully woven collection of specialist tools designed for a specific industry." },
  { q: "Do all plans include all agents?", a: "Yes! Every plan — Essentials, Business, and Enterprise — includes access to all 44+ specialist agents across all 9 industry kete. Plans differ by user count, query volume, and support level." },
  { q: "Is there a free trial?", a: "Yes! Essentials comes with a 14-day free trial, no credit card required. Start using all agents immediately and upgrade anytime." },
  { q: "How does the annual discount work?", a: "Pay annually and save 20%. That's $159/mo for Essentials, $319/mo for Business, or $639/mo for Enterprise — all + GST." },
  { q: "Where is my data stored?", a: "All data stays in New Zealand on NZ-hosted infrastructure. We follow the NZ Privacy Act 2020, and our tikanga governance layer ensures your data is treated with the care and respect it deserves." },
  { q: "What powers Assembl?", a: "We use a mix of leading models: Claude for logic, compliance, and legal reasoning. Gemini for voice, multimodal, and speed. Haiku for fast routing. Flux 2 Pro and Ideogram for images. Runway and Kling for video. Iho — the heart of Assembl — picks the best tool for each task automatically." },
  { q: "Do I need technical knowledge?", a: "No. We handle all the setup. Your team just texts, chats, or uses the dashboard. If you can send a text message, you can use Assembl." },
  { q: "What's the difference between Tōroa and the business plans?", a: "Tōroa is our consumer product for families — $29/mo, SMS-first, helps with school notices, meals, budgets, and daily family life. The business plans (Essentials, Business, Enterprise) are for organisations that need the full business operations platform." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes. You can change plans at any time. Upgrades take effect immediately, downgrades at the end of your billing period." },
  { q: "What happens when I hit my query limit?", a: "You'll get a friendly heads-up when you're approaching your limit. You can upgrade instantly, or any unused queries roll over to the next month. We'll never cut you off mid-conversation." },
  { q: "Can I switch between plans?", a: "Yes — upgrade anytime (takes effect immediately) or downgrade at the end of your billing period. No lock-in contracts, no penalties." },
  { q: "What does the setup fee cover exactly?", a: "We map your workflows, configure your agents, integrate with your existing tools (Xero, MYOB, Google Workspace, etc.), train your team, and stay with you through launch. It's hands-on — not a template." },
  { q: "Is my data safe?", a: "Your data stays in New Zealand on NZ-hosted infrastructure. We're Privacy Act 2020 compliant, and our tikanga governance layer adds an extra layer of cultural care. We never sell your data or use it to train models." },
];

const TRUST_BADGES = [
  "14-day free trial",
  "Cancel anytime",
  "NZ-owned & operated",
  "Your data stays in NZ",
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="text-lg sm:text-2xl font-display text-center mb-8 text-foreground" style={{ fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card glow-card-hover rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium font-body pr-4 text-foreground">{faq.q}</span>
                <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 text-muted-foreground ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                    <div className="px-5 pb-4">
                      <p className="text-xs font-body leading-relaxed text-muted-foreground">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {TRUST_BADGES.map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-body px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Section F: CTA Footer ── */
const CTAFooter = () => (
  <section className="py-16 sm:py-20" style={{ borderTop: "2px solid hsl(var(--primary))" }}>
    <div className="max-w-2xl mx-auto px-5 text-center">
      <h2 className="text-xl sm:text-3xl font-display text-foreground mb-3" style={{ fontWeight: 300 }}>
        Ready to get started?
      </h2>
      <p className="text-sm font-body text-muted-foreground mb-8 max-w-lg mx-auto">
        Start your 14-day free trial or book a call to see Assembl in action.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Link to="/signup?plan=essentials" className="px-7 py-3 rounded-full text-sm font-body font-medium transition-all hover:scale-[1.02]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          Start free trial
        </Link>
        <Link to="/contact" className="px-7 py-3 rounded-full text-sm font-body font-medium border transition-all" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
          Book a demo
        </Link>
      </div>
      <p className="text-xs font-body text-muted-foreground/40">
        Or email us: <a href="mailto:assembl@assembl.co.nz" className="underline hover:text-foreground transition-colors">assembl@assembl.co.nz</a>
      </p>
    </div>
  </section>
);

/* ── Main Page ── */
const PricingPage = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO
      title="Assembl Pricing — From $199/mo + GST | All Agents, All Kete"
      description="44+ specialist tools across 9 industry kete from $199/mo + GST. 14-day free trial, no credit card required. Built for Aotearoa."
      path="/pricing"
    />
    <BrandNav />
    <PricingHero />
    <div className="max-w-6xl mx-auto w-full px-5"><div className="section-divider" /></div>
    <PricingTiers />
    <div className="max-w-6xl mx-auto w-full px-5"><div className="section-divider" /></div>
    <CapabilityMap />
    <div className="max-w-6xl mx-auto w-full px-5"><div className="section-divider" /></div>
    <ToroaSection />
    <div className="max-w-3xl mx-auto w-full px-5"><div className="section-divider" /></div>
    <FAQSection />
    <CTAFooter />
    <div className="mt-auto"><BrandFooter /></div>
  </div>
);

export default PricingPage;

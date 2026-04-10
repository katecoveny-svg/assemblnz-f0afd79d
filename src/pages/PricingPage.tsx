import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Rocket, Layers, Package, Crown, Shield, Brain, Eye, FileText, Database, Lock, Globe, Heart, PenTool, Monitor, Phone, MessageCircle, Mic, Mail } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

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
        HE KETE MĀTAURANGA
      </p>
      <h1 className="text-3xl sm:text-5xl font-display mb-4 text-foreground" style={{ fontWeight: 300, letterSpacing: "-0.02em" }}>
        NZ enterprises<Link to="/claims-register#claim-1" className="text-primary hover:underline align-super text-[0.5em]">¹</Link> with fewer than 20 staff<Link to="/claims-register#claim-2" className="text-primary hover:underline align-super text-[0.5em]">²</Link> produce a signed evidence pack today.<Link to="/claims-register#claim-3" className="text-primary hover:underline align-super text-[0.5em]">³</Link>
      </h1>
      <p className="text-base sm:text-lg font-body max-w-2xl mx-auto mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
        Pick the kete that matches your industry. Each run produces a signed, sourced evidence pack your team can file, forward, or footnote.
      </p>
      {/* Privacy Act 2020 · IPP 3A banner */}
      <div className="glass-card rounded-xl px-6 py-4 max-w-xl mx-auto mb-8 text-left" style={{ borderLeft: "2px solid hsl(var(--primary))" }}>
        <p className="text-[10px] font-display tracking-[3px] uppercase mb-2" style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>
          Privacy Act 2020 · IPP 3A
        </p>
        <ul className="space-y-1">
          {["Consent notices", "Audit log", "Subject access pack", "Breach notification"].map((b) => (
            <li key={b} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Check size={12} className="text-primary shrink-0" />{b}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/contact" className="px-7 py-3 rounded-full text-sm font-body font-medium transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          Book a discovery call
        </Link>
        <button onClick={() => document.getElementById("packs")?.scrollIntoView({ behavior: "smooth" })} className="px-7 py-3 rounded-full text-sm font-body font-medium border transition-all" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
          Explore the kete
        </button>
      </div>
    </div>
  </section>
);

/* ── Section B: Offer Stack ── */
const OFFERS = [
  { icon: Rocket, badge: "START HERE", badgeColor: "hsl(var(--primary))", title: "Talk to us first", desc: "Every business is different. We start with a 30-minute discovery call to map your workflows, pick the right kete, and agree what success looks like before you sign anything.", time: "Up and running in 10 business days", price: "Free 30-minute discovery call", cta: "Book a call", to: "/contact" },
  { icon: Layers, badge: "FOUNDATION", badgeColor: "hsl(var(--pounamu))", title: "Core Platform", desc: "Included in every subscription. Your central routing engine (Iho), governance pipeline, SIGNAL security, SMS/WhatsApp messaging, and dashboard access.", price: "Included in every plan", note: "This is the foundation. Every kete runs on Core.", includes: ["Iho routing engine", "SIGNAL security agent", "Compliance pipeline (Kahu → Iho → Tā → Mahara → Mana)", "SMS & WhatsApp access", "Dashboard & analytics", "NZ data residency on Enterprise"] },
  { icon: Package, badge: "SPECIALIST AI", badgeColor: "hsl(var(--tangaroa-light))", title: "Industry Kete", desc: "Each kete is a complete AI operations hub with specialist agents, governance pipeline, and evidence pack output. Every workflow run ends in a signed pack — structured, sourced, and ready to file.", price: "From NZ$1,490/month", list: "Manaaki · Waihanga · Auaha · Arataki · Pikau", cta: "See all packs", scrollTo: "packs" },
  { icon: Crown, badge: "ENTERPRISE", badgeColor: "hsl(var(--primary))", title: "Enterprise", desc: "All 5 kete, unlimited seats, attested NZ data residency, 99.9% uptime SLA, named success manager, signed quarterly compliance review. Replaces a fraction of a full-time compliance manager.", price: "NZ$2,990/month + $2,890 setup", cta: "Talk to us", to: "/contact", includes: ["Named success manager", "Quarterly compliance review (signed)", "Monthly audit report", "NZ data residency (attested)", "99.9% uptime SLA"] },
];

const OfferStack = () => (
  <section className="py-16 sm:py-20">
    <div className="max-w-6xl mx-auto px-5">
      <h2 className="text-lg sm:text-2xl font-display text-center mb-10 text-foreground" style={{ fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
        How we work with you
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OFFERS.map((o, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease }} className="glass-card glow-card-hover p-6 rounded-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                <o.icon size={20} style={{ color: o.badgeColor }} />
              </div>
              <span className="text-[9px] font-display tracking-[3px] uppercase px-2 py-0.5 rounded-full" style={{ background: `${o.badgeColor}20`, color: o.badgeColor, fontWeight: 700 }}>
                {o.badge}
              </span>
            </div>
            <h3 className="text-base font-display text-foreground mb-2" style={{ fontWeight: 300 }}>{o.title}</h3>
            <p className="text-xs font-body text-muted-foreground mb-3 flex-1">{o.desc}</p>
            {o.includes && (
              <ul className="space-y-1 mb-3">
                {o.includes.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] font-body text-muted-foreground">
                    <Check size={12} className="text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
            )}
            {o.list && <p className="text-[11px] font-body text-muted-foreground/60 mb-3">{o.list}</p>}
            {o.time && <p className="text-[11px] font-body text-muted-foreground/50 mb-1">⏱ {o.time}</p>}
            <p className="text-sm font-mono text-foreground mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{o.price}</p>
            {o.note && <p className="text-[10px] font-body text-muted-foreground/40 italic mb-3">{o.note}</p>}
            {o.cta && o.to && (
              <Link to={o.to} className="text-xs font-body font-medium text-primary hover:underline mt-auto">{o.cta} →</Link>
            )}
            {o.cta && o.scrollTo && (
              <button onClick={() => document.getElementById(o.scrollTo!)?.scrollIntoView({ behavior: "smooth" })} className="text-xs font-body font-medium text-primary hover:underline mt-auto text-left">{o.cta} →</button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Section C: Pricing Tiers ── */
const TIERS = [
  {
    name: "Family", sub: "$29/mo", accent: "hsl(var(--pounamu))", badge: "WHĀNAU",
    price: "NZ$29/mo", setup: "No setup fee",
    best: "NZ whānau — household coordination by SMS, no app required",
    packsPerMonth: null,
    features: ["SMS-first family agent", "School notices, calendar, meals", "Budget tracking", "Transport & bus times", "Up to 6 family members", "Email support"],
    goodFor: "Busy households · Parents juggling school & work · Whānau on the go",
    cta: "Join the waitlist", highlight: false,
  },
  {
    name: "Operator", sub: "$1,490/mo", accent: "hsl(var(--pounamu-light))", badge: "ENTRY",
    price: "NZ$1,490/mo", setup: "+ $590 setup (splittable across first 3 invoices)",
    best: "Sole traders and micro-SMEs — one industry, one team, one source of truth",
    packsPerMonth: "20 evidence packs/mo",
    features: ["1 industry kete (your pick)", "Up to 5 seats", "Tikanga compliance layer", "Privacy Act 2020 + AAAIP alignment", "SMS, WhatsApp & dashboard access", "3 training hours / year", "Email support, 1 business day", "99.0% uptime"],
    goodFor: "Builders · Cafés · Single-discipline trades · Owner-operator carriers · Solo agencies",
    cta: "Talk to us", highlight: false,
  },
  {
    name: "Leader", sub: "$1,990/mo", accent: "hsl(var(--primary))", badge: "MOST POPULAR",
    price: "NZ$1,990/mo", setup: "+ $1,290 setup (splittable across first 3 invoices)",
    best: "Multi-discipline SMEs and growing teams — covers two parts of the business with quarterly compliance review",
    packsPerMonth: "60 evidence packs/mo",
    features: ["2 industry kete (your pick)", "Up to 15 seats", "Quarterly compliance review (signed)", "Monthly audit report", "8 training hours / year", "Email + chat, 4 business hours", "99.5% uptime", "Optional NZ data residency"],
    goodFor: "Hospitality groups · Construction firms · Multi-disc trades · Creative studios · Workshops",
    cta: "Talk to us", highlight: true,
  },
  {
    name: "Enterprise", sub: "$2,990/mo", accent: "hsl(var(--tangaroa))", badge: "FULL PLATFORM",
    price: "NZ$2,990/mo", setup: "+ $2,890 setup (splittable across first 3 invoices)",
    best: "Multi-site, regulated, high-stakes operations — every kete, the SLA, and a named human to call",
    packsPerMonth: "200 evidence packs/mo",
    features: ["All 5 industry kete", "Unlimited seats", "Data at rest in NZ⁷", "99.9% uptime SLA", "Named success manager", "Quarterly compliance review (signed)", "Monthly audit report", "16 training hours / year", "Priority phone + chat, 1 business hour"],
    goodFor: "Multi-site hospo · Construction PMO · Regional freight · Franchise networks · Regulated operations",
    cta: "Talk to us", highlight: false,
  },
  {
    name: "Outcome", sub: "from $5,000/mo", accent: "hsl(var(--primary))", badge: "BESPOKE",
    price: "From NZ$5,000/mo", setup: "Scoped per engagement",
    best: "Engagements where Assembl takes on the result — freight routes, maintenance scheduling, fleet uptime",
    packsPerMonth: "Unlimited evidence packs",
    features: ["All 5 industry kete", "Unlimited seats", "SLA", "Bespoke scoping", "Named success manager", "Base fee + 10–20% of measured savings"],
    goodFor: "Outcome-based engagements · Route optimisation · Maintenance scheduling · Fleet uptime",
    cta: "Talk to us", highlight: false,
  },
];

const PricingTiers = () => (
  <section id="packs" className="py-16 sm:py-20">
    <div className="max-w-6xl mx-auto px-5">
      <h2 className="text-lg sm:text-2xl font-display text-center mb-2 text-foreground" style={{ fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
        Choose your kete
      </h2>
      <p className="text-sm font-body text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        Every plan includes Assembl Core: Iho routing engine, SIGNAL security, compliance pipeline, SMS/WhatsApp, and your dashboard. Every kete run ends in a signed evidence pack.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {TIERS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, ease }}
            className="glass-card glow-card-hover p-6 rounded-2xl flex flex-col relative"
            style={{ borderColor: t.highlight ? "rgba(212,168,67,0.3)" : undefined, borderWidth: t.highlight ? 2 : undefined }}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-display px-4 py-1 rounded-full" style={{ background: t.accent, color: "hsl(var(--primary-foreground))", fontWeight: 700, letterSpacing: "2px" }}>
                MOST POPULAR
              </span>
            )}
            <span className="text-[9px] font-display tracking-[3px] uppercase mb-3" style={{ color: t.accent, fontWeight: 700 }}>{t.badge}</span>
            <h3 className="text-lg font-display text-foreground mb-0.5" style={{ fontWeight: 300 }}>{t.name}</h3>
            <p className="text-xs font-body text-muted-foreground/50 mb-3">{t.sub}</p>
            <p className="text-base font-mono text-foreground mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{t.price}</p>
            <p className="text-[11px] font-body text-muted-foreground/50 mb-4">NZD ex GST · {t.setup}</p>
            {t.packsPerMonth && (
              <div className="rounded-lg px-3 py-2 mb-4 flex items-center gap-2" style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}>
                <span className="text-[10px] font-display tracking-[2px] uppercase" style={{ color: t.accent, fontWeight: 700 }}>PACKS</span>
                <span className="text-xs font-mono text-foreground/80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.packsPerMonth}</span>
              </div>
            )}
            <p className="text-xs font-body text-muted-foreground mb-4 italic">Best for: {t.best}</p>
            <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
            <ul className="space-y-2 mb-4 flex-1">
              {t.features.map(f => {
                const hasFootnote = f.includes("⁷");
                const text = hasFootnote ? f.replace("⁷", "") : f;
                return (
                  <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: t.accent }} />
                    {text}
                    {hasFootnote && <Link to="/claims-register#claim-7" className="text-primary hover:underline align-super text-[0.7em]">⁷</Link>}
                  </li>
                );
              })}
            </ul>
            <p className="text-[10px] font-body text-muted-foreground/40 mb-4">Good for: {t.goodFor}</p>
            <Link to="/contact" className="block w-full text-center py-3 rounded-lg text-sm font-body font-medium transition-all" style={{ background: t.accent, color: t.highlight ? "hsl(var(--primary-foreground))" : "#fff" }}>
              {t.cta}
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="text-sm font-body text-center mt-8 italic" style={{ color: "hsl(var(--primary))" }}>
        Save 12% on annual plans with code ANNUAL12.
      </p>
      <p className="text-[11px] font-body text-muted-foreground/40 text-center mt-3 max-w-2xl mx-auto">
        All prices in NZD, ex GST (add 15% at invoice). Setup fees can be split across the first 3 invoices on request. Monthly subscriptions include platform hosting, AI compute, agent support, and governance. Existing customers on the legacy model are grandfathered until 2027-04-08.
      </p>
      <p className="text-xs font-body text-center mt-6 mb-2">
        <span className="text-[11px] font-display tracking-[3px] uppercase" style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>OUTCOME — FROM $5,000/MO</span>
      </p>
      <p className="text-[11px] font-body text-muted-foreground/50 text-center max-w-xl mx-auto mb-4">
        Bespoke engagements where Assembl takes on the outcome — freight route optimisation, building maintenance scheduling, fleet uptime. Base fee + 10–20% of measured savings. Scoped per engagement.
      </p>
      <p className="text-xs font-body text-center">
        <Link to="/contact" className="text-primary hover:underline">Talk to us about an Outcome engagement →</Link>
      </p>
    </div>
  </section>
);

/* ── Section D: Capability Map ── */
const SHARED_AGENTS = [
  { icon: Brain, name: "Iho", desc: "Central routing engine" },
  { icon: Shield, name: "SIGNAL", desc: "Security & IT" },
  { icon: Eye, name: "Kahu", desc: "Compliance check" },
  { icon: FileText, name: "Tā", desc: "Audit trail" },
  { icon: Database, name: "Mahara", desc: "Business memory" },
  { icon: Lock, name: "Mana", desc: "Access control" },
  { icon: Globe, name: "Te Reo", desc: "Bilingual support" },
  { icon: Heart, name: "Tikanga", desc: "Cultural governance" },
  { icon: PenTool, name: "Elite Copy", desc: "Writing quality" },
];

const KETE_DATA = [
  { name: "Manaaki", eng: "Hospitality", desc: "Food safety, liquor licensing, guest experience, tourism operations", accent: "hsl(var(--primary))" },
  { name: "Waihanga", eng: "Construction", desc: "Site safety, consenting, project management, quality and sign-off", accent: "hsl(var(--pounamu))" },
  { name: "Auaha", eng: "Creative", desc: "Brief to publish — copy, image, video, podcast, ads, analytics", accent: "hsl(var(--kowhai-light))" },
  { name: "Arataki", eng: "Business Operations", desc: "Dealership compliance, finance disclosure, and customer enquiry — the showroom back office handled.", accent: "hsl(var(--tangaroa-light))" },
  { name: "Pikau", eng: "Freight & Customs", desc: "Route optimisation, declarations, broker hand-off, customs compliance", accent: "hsl(var(--tangaroa))" },
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
        What's inside each kete
      </h2>
      <p className="text-sm font-body text-center text-muted-foreground mb-12 max-w-xl mx-auto">
        Five locked industry kete, powered by a shared governance layer. Pick the kete that match your business.
      </p>

      {/* Channels */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-display tracking-[3px] uppercase text-muted-foreground mb-3" style={{ fontWeight: 700 }}>CHANNELS — How you reach your agents</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {CHANNELS.map(c => (
            <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <c.icon size={16} className="text-primary" />
              <span className="text-xs font-body text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-body text-muted-foreground/40 text-center mt-3">Any channel reaches any agent through Iho</p>
      </div>

      {/* Kete Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {KETE_DATA.map(k => (
          <motion.div key={k.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card glow-card-hover rounded-2xl p-5 flex flex-col" style={{ borderTop: `2px solid ${k.accent}` }}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-display text-foreground" style={{ fontWeight: 300 }}>{k.name}</h3>
            </div>
            <p className="text-[11px] font-body text-muted-foreground/60 mb-2">{k.eng}</p>
            <p className="text-xs font-body text-muted-foreground flex-1">{k.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Tōroa separate */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card glow-card-hover rounded-2xl p-5 max-w-md mx-auto" style={{ borderTop: "2px solid hsl(var(--primary))" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-display tracking-[2px] uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(212,168,67,0.15)", color: "hsl(var(--primary))", fontWeight: 700 }}>CONSUMER</span>
        </div>
        <h3 className="text-base font-display text-foreground mb-1" style={{ fontWeight: 300 }}>Tōro</h3>
        <p className="text-[11px] font-body text-muted-foreground/60 mb-2">Family Navigator · 1 agent</p>
        <p className="text-xs font-body text-muted-foreground">SMS-first family AI. No app. Just text. $29/mo</p>
      </motion.div>

      {/* Shared Foundation */}
      <div className="glass-card rounded-2xl p-5 mt-4">
        <p className="text-[10px] font-display tracking-[3px] uppercase text-muted-foreground mb-4" style={{ fontWeight: 700 }}>ASSEMBL CORE — Shared across every kete</p>
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
        <p className="text-[10px] font-body text-muted-foreground/30 text-center mt-4">
          User → Kahu (check) → Iho (route) → Tā (log) → Mahara (memory) → Mana (access) → Agent
        </p>
      </div>
    </div>
  </section>
);

/* ── Section E: Tōroa ── */
const ToroaSection = () => {
  const features = ["Photo → school notice parsed", "Fridge photo → meal plan", "Live bus tracking", "Weather → dress the kids", "Smart reminders", "Homework tracker"];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <p className="text-[11px] font-display tracking-[5px] uppercase mb-3" style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>FOR WHĀNAU</p>
        <h2 className="text-xl sm:text-3xl font-display text-foreground mb-6" style={{ fontWeight: 300 }}>Tōro — Your family's intelligent navigator</h2>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card glow-card-hover rounded-2xl p-8 inline-block text-left" style={{ borderColor: "rgba(212,168,67,0.2)" }}>
          <p className="text-2xl font-mono text-foreground mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>NZ$29<span className="text-sm text-muted-foreground">/month</span></p>
          <p className="text-xs font-body text-muted-foreground mb-5">No app. No login. Just text.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <Check size={12} className="text-primary shrink-0" />{f}
              </div>
            ))}
          </div>
          <Link to="/toroa" className="block w-full text-center py-3 rounded-lg text-sm font-body font-medium transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            Join the beta waitlist
          </Link>
          <p className="text-[10px] font-body text-muted-foreground/30 text-center mt-3">2 whānau already waiting</p>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Section F: FAQ ── */
const FAQS = [
  { q: "What's a kete?", a: "A kete is a traditional Māori woven basket, typically crafted from harakeke (New Zealand flax). We use it as a metaphor for our industry packs — each kete is a carefully woven collection of AI agents designed for a specific industry." },
  { q: "How does onboarding work?", a: "Book a 30-minute discovery call. We map your workflows, agree on the right kete and tier, then run a 10-business-day setup: kickoff workshop, data import, brand kit, two policy gates, and a pilot kit. The setup fee covers the work. If we miss the 10-day window, we refund the setup fee." },
  { q: "Can I start with one kete and add more later?", a: "Absolutely. Operator includes 1 kete. Leader includes 2. Enterprise includes all 5. You can also add an extra kete to Operator or Leader for $290/mo per kete without changing tiers." },
  { q: "How does SMS/WhatsApp work?", a: "You get a dedicated NZ phone number for each kete. Your team texts questions and the right agent answers in seconds. WhatsApp groups let your team share photos, voice messages, and documents directly with agents." },
  { q: "Where is my data stored?", a: "Operator and Leader run on standard NZ-region infrastructure. Enterprise includes attested NZ data residency. We follow the NZ Privacy Act 2020 and our tikanga governance layer ensures your data is treated with the care and respect it deserves." },
  { q: "What AI models do you use?", a: "We use a mix: Claude for logic, compliance, and legal reasoning. Gemini for voice, multimodal, and speed. Iho (our routing engine) picks the best model for each task automatically." },
  { q: "Do I need technical knowledge?", a: "No. We handle all the setup. Your team just texts, chats, or uses the dashboard. If you can send a text message, you can use Assembl." },
  { q: "What's the difference between Family and the business tiers?", a: "Family is our consumer product for whānau — $29/mo, SMS-first, helps with school notices, meals, budgets, and daily household life. The business tiers (Operator, Leader, Enterprise, Outcome) are AI operations hubs for sole traders through multi-site enterprises. Different products, different audiences." },
  { q: "What's the Outcome tier?", a: "Outcome is for engagements where Assembl takes on the result, not just the tools. Things like freight route optimisation, building maintenance scheduling, or fleet uptime. Base fee from $5,000/mo plus 10–20% of measured savings, scoped per engagement. Talk to us." },
  { q: "Can I get a custom agent built?", a: "Yes. Custom agent builds start from $7,500 one-time and are available on any business tier. For workflows where the agent needs to take on the outcome end-to-end, that's the Outcome tier." },
  { q: "What's tikanga governance?", a: "Tikanga Māori is the customary system of values and practices that has developed over time. Our governance layer ensures all AI operations respect the four pou: Rangatiratanga (self-determination), Kaitiakitanga (stewardship), Manaakitanga (care), and Whanaungatanga (connection). Your data is treated as taonga (treasure), not as a product." },
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
      </div>
    </section>
  );
};

/* ── Section G: CTA Footer ── */
const CTAFooter = () => (
  <section className="py-16 sm:py-20" style={{ borderTop: "2px solid hsl(var(--primary))" }}>
    <div className="max-w-2xl mx-auto px-5 text-center">
      <h2 className="text-xl sm:text-3xl font-display text-foreground mb-3" style={{ fontWeight: 300 }}>
        Ready to build your kete?
      </h2>
      <p className="text-sm font-body text-muted-foreground mb-8 max-w-lg mx-auto">
        Book a free 30-minute discovery call. We'll map your workflows and show you exactly which agents can run them.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Link to="/contact" className="px-7 py-3 rounded-full text-sm font-body font-medium transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          Book a discovery call
        </Link>
        <Link to="/kete" className="px-7 py-3 rounded-full text-sm font-body font-medium border transition-all" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
          View the demo
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
      title="Assembl Pricing — Every kete ends in an evidence pack"
      description="Pick a kete, get a signed evidence pack. Operator $1,490/mo · Leader $1,990/mo · Enterprise $2,990/mo. NZD ex GST. Privacy Act 2020 aligned, tikanga governance built in."
      path="/pricing"
    />
    <BrandNav />
    <PricingHero />
    <div className="max-w-6xl mx-auto w-full px-5"><div className="section-divider" /></div>
    <OfferStack />
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

import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import { Shield, Server, Lock, Globe, FileText, Eye, Key, Database, RefreshCw, CheckCircle2, Fingerprint, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

const SECURITY_BADGES = [
  { icon: Lock, label: "TLS 1.3", desc: "All data encrypted in transit", color: "#5AADA0" },
  { icon: Database, label: "AES-256", desc: "At-rest encryption", color: "#3A6A9C" },
  { icon: Eye, label: "NZ Privacy Act 2020", desc: "Full IPP compliance", color: "#3A6A9C" },
  { icon: Shield, label: "Row-Level Security", desc: "Every table protected", color: "#1A3A5C" },
  { icon: Server, label: "Encrypted Backups", desc: "Point-in-time recovery", color: "#5AADA0" },
  { icon: Globe, label: "NZISM Aligned", desc: "NZ Information Security Manual", color: "#3A6A9C" },
  { icon: Key, label: "PCI DSS", desc: "Via Stripe integration", color: "#FFB800" },
  { icon: Fingerprint, label: "MFA Available", desc: "Multi-factor authentication", color: "#3A6A9C" },
  { icon: Users, label: "RBAC", desc: "Role-based access control", color: "#1A3A5C" },
  { icon: FileText, label: "Audit Logging", desc: "Full activity trail", color: "#5AADA0" },
  { icon: Clock, label: "Session Timeout", desc: "Automatic expiry", color: "#3A6A9C" },
  { icon: MapPin, label: "AU/NZ Data", desc: "Regional data residency", color: "#FFB800" },
];

const COMPLIANCE_SECTIONS = [
  {
    title: "Data Encryption",
    icon: Lock,
    color: "#5AADA0",
    items: [
      "TLS 1.3 for all data in transit — zero plain-text communication",
      "AES-256 encryption at rest for all stored data",
      "Database backups encrypted with point-in-time recovery",
      "API keys stored as encrypted environment variables, never in client code",
    ],
  },
  {
    title: "Privacy & Compliance",
    icon: Eye,
    color: "#3A6A9C",
    items: [
      "Full alignment with NZ Privacy Act 2020 — all 13 IPPs addressed",
      "IPP 3A (May 2026) compliant — algorithmic transparency in automated processing",
      "Privacy Impact Assessment completed March 2026",
      "Data breach notification within 72 hours per Part 6A",
      "Conversation data deletable anytime — user-controlled retention",
    ],
  },
  {
    title: "Infrastructure Security",
    icon: Server,
    color: "#3A6A9C",
    items: [
      "Row-Level Security (RLS) on every database table — strict data isolation",
      "Hosted on hardened infrastructure partners (Supabase/AWS)",
      "Edge functions in isolated Deno runtime sandboxes",
      "All 29 agent system prompts executed server-side only",
      "Proprietary prompt logic never exposed to client",
    ],
  },
  {
    title: "Authentication & Access",
    icon: Key,
    color: "#1A3A5C",
    items: [
      "Session-based auth with automatic token refresh",
      "Password hashing with bcrypt + salting",
      "Multi-factor authentication available",
      "Role-based access control (free/starter/pro/business/admin)",
      "Automatic session timeout for idle users",
      "IP allowlisting available for enterprise deployments",
    ],
  },
  {
    title: "Payment Security",
    icon: Shield,
    color: "#FFB800",
    items: [
      "PCI DSS Level 1 compliance via Stripe — no card data touches our servers",
      "Stripe-managed customer portal for subscription management",
      "No financial data stored in our database",
    ],
  },
  {
    title: "NZ Government & Enterprise",
    icon: Globe,
    color: "#5AADA0",
    items: [
      "NZISM (NZ Information Security Manual) alignment documented",
      "WCAG 2.1 AA accessibility — keyboard nav, screen readers, high contrast",
      "Data residency options: AU/NZ infrastructure available for enterprise",
      "Government procurement documentation available on request",
      "OWASP Top 10 security practices implemented",
    ],
  },
];

const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.6)",
  backdropFilter: "blur(24px) saturate(1.4)",
  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
  border: "1px solid rgba(74,165,168,0.15)",
};

const SecurityPage = () => (
  <div className="min-h-screen star-field flex flex-col relative">
    <ParticleField />
    <BrandNav />
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 relative z-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ ...glassStyle, borderColor: "rgba(58,125,110,0.18)" }}>
          <Shield size={14} className="text-[#5AADA0]" />
          <span className="text-[11px] font-semibold text-[#5AADA0]">Mid-market NZ Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight mb-3">
          Security & <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #5AADA0, #3A6A9C)" }}>Compliance</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Built for NZ government procurement, enterprise risk assessment, and businesses that demand the highest standards of data protection.
        </p>
      </motion.div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-14">
        {SECURITY_BADGES.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 flex flex-col items-center text-center gap-2 group hover:-translate-y-1 transition-transform"
            style={{ ...glassStyle, boxShadow: `0 0 20px ${badge.color}08` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: badge.color + "12" }}>
              <badge.icon size={18} style={{ color: badge.color }} />
            </div>
            <span className="text-[11px] font-bold text-foreground">{badge.label}</span>
            <span className="text-[9px] text-muted-foreground leading-tight">{badge.desc}</span>
          </motion.div>
        ))}
      </div>

      {/* Compliance Sections */}
      <div className="grid gap-5 md:grid-cols-2">
        {COMPLIANCE_SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="rounded-xl p-5 relative overflow-hidden"
            style={glassStyle}
          >
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${section.color}, transparent)` }} />
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: section.color + "15" }}>
                <section.icon size={16} style={{ color: section.color }} />
              </div>
              <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: section.color }} />
                  <span className="text-[11px] text-foreground/70 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Data Flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 rounded-xl p-6 relative overflow-hidden"
        style={glassStyle}
      >
        <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-20" style={{ background: "linear-gradient(90deg, transparent, #3A6A9C, transparent)" }} />
        <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <RefreshCw size={14} className="text-[#3A6A9C]" />
          Data Flow Architecture
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
          {["User", "→ TLS 1.3 →", "Assembl Edge", "→ Encrypted →", "Intelligence Layer", "→ Response →", "Edge Function", "→ TLS 1.3 →", "User"].map((step, i) => (
            <span key={i} className={i % 2 === 0 ? "px-3 py-1.5 rounded-lg font-sans font-semibold text-foreground" : "text-[#3A6A9C]"} style={i % 2 === 0 ? { ...glassStyle, borderColor: "rgba(212,168,67,0.1)" } : undefined}>
              {step}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          AI model provider does not retain conversation data • System prompts never exposed to client • No user data sold or monetised
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 rounded-xl p-6 text-center relative overflow-hidden"
        style={{ ...glassStyle, boxShadow: "0 0 40px rgba(58,125,110,0.06)" }}
      >
        <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #5AADA0, transparent)" }} />
        <p className="text-xs text-foreground/70 mb-3">
          Need detailed security documentation for government procurement or enterprise review?
        </p>
        <a
          href="mailto:assembl@assembl.co.nz?subject=Security%20Documentation%20Request"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #5AADA0, #3A6A9C)", color: "#0A0A1A" }}
        >
          <Shield size={14} />
          Request Security Pack
        </a>
        <p className="text-[10px] text-muted-foreground mt-3">assembl@assembl.co.nz • Last updated March 2026</p>
      </motion.div>
    </main>
    <BrandFooter />
  </div>
);

export default SecurityPage;

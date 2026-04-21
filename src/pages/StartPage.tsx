import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowRight, ArrowLeft, Globe, Building2, User,
  Users, Utensils, HardHat, Palette, Car, Truck,
  Briefcase, GraduationCap, ShoppingBag, Home,
  MoreHorizontal, FileSpreadsheet, FileText, Calculator, X,
  Zap, CheckCircle2, ShieldCheck, Sparkles, Send,
  Hammer, ClipboardCheck, Package, Receipt, BookOpen,
  HardDrive, MessageSquare, Megaphone, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LightPageShell from "@/components/LightPageShell";
import LiquidPanel from "@/components/marama/LiquidPanel";
import { assemblWordmark } from "@/assets/brand";

const CONSENT_VERSION = "2026-04-21-v2";

// ── Step 1: Industries (full marketed set, 8 kete) ──
const INDUSTRIES = [
  { id: "hospitality", label: "Hospitality", icon: Utensils, kete: "MANAAKI", desc: "Cafés, restaurants, hotels" },
  { id: "construction", label: "Construction & Trades", icon: HardHat, kete: "WAIHANGA", desc: "Builders, sparkies, plumbers" },
  { id: "creative", label: "Creative & Marketing", icon: Palette, kete: "AUAHA", desc: "Studios, agencies, freelancers" },
  { id: "automotive", label: "Automotive & Fleet", icon: Car, kete: "ARATAKI", desc: "Workshops, dealers, fleets" },
  { id: "freight", label: "Freight & Logistics", icon: Truck, kete: "PIKAU", desc: "Customs, freight, logistics" },
  { id: "retail", label: "Retail & E-commerce", icon: ShoppingBag, kete: "HOKO", desc: "Shops, online sellers" },
  { id: "education", label: "Education & Training", icon: GraduationCap, kete: "AKO", desc: "Trainers, tutors, ECE" },
  { id: "household", label: "Household & Whānau", icon: Home, kete: "TORO", desc: "Family life admin" },
  { id: "professional", label: "Professional Services", icon: Briefcase, kete: "AUAHA", desc: "Consultants, advisors" },
  { id: "other", label: "Something else", icon: MoreHorizontal, kete: "not-sure", desc: "We'll help you find the fit" },
] as const;

// ── Step 2: Size ──
const SIZES = [
  { id: "1", label: "Just me", description: "Solo operator" },
  { id: "2-5", label: "2–5", description: "Small team" },
  { id: "6-20", label: "6–20", description: "Growing team" },
  { id: "21-50", label: "21–50", description: "Medium business" },
  { id: "50+", label: "50+", description: "Enterprise" },
] as const;

// ── Step 3: Pain points by industry ──
const PAIN_POINTS_BY_INDUSTRY: Record<string, string[]> = {
  construction: ["Quotes & estimates", "Safety plans & SSSP", "Building consents", "Invoicing & claims", "Subcontractor management", "Project scheduling"],
  hospitality: ["Food safety diary", "Staff rosters", "Liquor compliance", "Marketing & socials", "Menu costing", "Guest experience"],
  freight: ["Customs clearance & MPI", "Shipment tracking & ETAs", "Driver hours & RUC", "Invoicing & freight claims", "Dangerous goods compliance", "Customer comms (SMS)"],
  automotive: ["WoF/CoF tracking", "Finance compliance (CCCFA)", "Service reminders", "Stock listing", "Workshop scheduling", "Parts ordering"],
  retail: ["Stock & inventory", "Online listings & socials", "Customer comms", "GST & sales reporting", "Loyalty & repeat sales", "Returns & refunds"],
  education: ["Student records", "Compliance & NZQA", "Lesson planning", "Parent comms", "Invoicing & enrolments", "Reporting"],
  creative: ["Client briefs & proposals", "Content production", "Social posting & scheduling", "Invoicing & cashflow", "Brand consistency", "Reporting back to clients"],
  household: ["Family calendar & school", "Shared finances", "Trip & holiday planning", "Pet & vehicle admin", "Subscriptions & bills", "Documents & passwords"],
  professional: ["Client intake", "Contracts & engagement letters", "Time tracking & billing", "Compliance & CPD", "Marketing", "Pipeline & CRM"],
  default: ["GST & tax compliance", "Employment compliance", "Content & marketing", "Sales pipeline", "Admin & paperwork", "Reporting & analytics"],
};

// ── Step 4: Current tools ──
const CURRENT_TOOLS = [
  { id: "spreadsheets", label: "Spreadsheets", icon: FileSpreadsheet },
  { id: "paper", label: "Paper / notebooks", icon: FileText },
  { id: "xero", label: "Xero", icon: Calculator },
  { id: "myob", label: "MYOB", icon: Calculator },
  { id: "word", label: "Word docs", icon: FileText },
  { id: "nothing", label: "Nothing yet", icon: X },
  { id: "other", label: "Other software", icon: MoreHorizontal },
] as const;

// ── Agent recommendations by pain point — Lucide icons, no emoji ──
const AGENT_MAP: Record<string, { name: string; Icon: typeof Hammer; desc: string }> = {
  // Construction
  "Quotes & estimates": { name: "KAUPAPA", Icon: Hammer, desc: "Generate professional quotes in minutes" },
  "Safety plans & SSSP": { name: "ĀRAI", Icon: ShieldCheck, desc: "Safety plans drafted in 2 minutes, not 5 hours" },
  "Building consents": { name: "WHAKAAĒ", Icon: ClipboardCheck, desc: "Consent applications with NZ Building Code checks" },
  "Invoicing & claims": { name: "LEDGER", Icon: Receipt, desc: "Handles GST, invoicing, and CCA claims" },
  "Subcontractor management": { name: "AROHA", Icon: Users, desc: "Contracts, compliance, and scheduling" },
  "Project scheduling": { name: "KAUPAPA", Icon: Hammer, desc: "Programme tracking and variations" },
  // Hospitality
  "Food safety diary": { name: "AURA", Icon: ShieldCheck, desc: "Daily food safety checks via SMS or WhatsApp" },
  "Staff rosters": { name: "AROHA", Icon: Users, desc: "Rosters, leave, and Holidays Act compliance" },
  "Liquor compliance": { name: "AURA", Icon: ShieldCheck, desc: "Licence renewals and duty manager tracking" },
  "Menu costing": { name: "LEDGER", Icon: Receipt, desc: "Plate margin and supplier price tracking" },
  "Guest experience": { name: "AURA", Icon: Sparkles, desc: "Bookings, returning guests, dietary memory" },
  // Freight / Pikau
  "Customs clearance & MPI": { name: "PIKAU", Icon: Package, desc: "MPI BACC, customs entries, and biosecurity" },
  "Shipment tracking & ETAs": { name: "PIKAU", Icon: Truck, desc: "Live ETA tracking and customer updates" },
  "Driver hours & RUC": { name: "ARATAKI", Icon: Car, desc: "Hours of work, RUC, and fleet compliance" },
  "Dangerous goods compliance": { name: "PIKAU", Icon: AlertCircle, desc: "Dangerous goods declarations and segregation" },
  "Customer comms (SMS)": { name: "ECHO", Icon: MessageSquare, desc: "Two-way SMS with shippers and consignees" },
  // Marketing / shared
  "Marketing & socials": { name: "AUAHA", Icon: Megaphone, desc: "Brand-locked content across all platforms" },
  "GST & tax compliance": { name: "LEDGER", Icon: Receipt, desc: "GST returns, tax prep, and cashflow" },
  "Employment compliance": { name: "AROHA", Icon: Users, desc: "Employment agreements and Holidays Act" },
  "Content & marketing": { name: "AUAHA", Icon: Megaphone, desc: "Creates marketing content automatically" },
  "Sales pipeline": { name: "FLUX", Icon: Zap, desc: "Sales intelligence for NZ businesses" },
  "Admin & paperwork": { name: "ANCHOR", Icon: BookOpen, desc: "Contracts, policies, and legal documents" },
  "Reporting & analytics": { name: "PILOT", Icon: Sparkles, desc: "Business insights and dashboards" },
  // Auto
  "WoF/CoF tracking": { name: "FORGE", Icon: Car, desc: "Vehicle lifecycle and compliance tracking" },
  "Finance compliance (CCCFA)": { name: "FORGE", Icon: ShieldCheck, desc: "F&I calculations with CCCFA compliance" },
  "Service reminders": { name: "FORGE", Icon: MessageSquare, desc: "Automated service reminders via SMS" },
  // Retail
  "Stock & inventory": { name: "HOKO", Icon: Package, desc: "Stock counts, reorder points, supplier mgmt" },
  "Online listings & socials": { name: "AUAHA", Icon: Megaphone, desc: "Product listings and brand-safe socials" },
  "Customer comms": { name: "ECHO", Icon: MessageSquare, desc: "Two-way SMS, email, and follow-ups" },
  // Education
  "Student records": { name: "AKO", Icon: BookOpen, desc: "Enrolments, attendance, learning records" },
  "Compliance & NZQA": { name: "AKO", Icon: ShieldCheck, desc: "NZQA, MoE, and accreditation tracking" },
  "Parent comms": { name: "ECHO", Icon: MessageSquare, desc: "Parent updates via SMS and email" },
  // Household / Tōro
  "Family calendar & school": { name: "TŌRO", Icon: Home, desc: "School, sport, appointments in one view" },
  "Shared finances": { name: "TŌRO", Icon: Receipt, desc: "Bills, subscriptions, and shared budgets" },
  "Trip & holiday planning": { name: "VOYAGE", Icon: Sparkles, desc: "Family trip planner with day-by-day plans" },
};

const STEP_TITLES = [
  "What kind of business do you run?",
  "How many people work in your business?",
  "What takes up the most time in your week?",
  "What are you using now to manage those things?",
  "Here's what assembl can do for you right now",
];

const STEP_SUBTITLES = [
  "This helps us match you with the right kete and agents.",
  "This determines which compliance features you need.",
  "Pick your top 3 — this drives your personalised plan.",
  "Quick multi-select — helps us identify what to replace.",
  "Your personalised starting team, based on what you told us.",
];

// ── Brand-aligned styling tokens ──
const ACCENT = "#4AA5A8";
const TEXT_PRIMARY = "#1F4E54";
const TEXT_BODY = "#3D4250";
const TEXT_MUTED = "#6B7C82";
const BORDER_SOFT = "rgba(74,165,168,0.18)";
const BORDER_FAINT = "rgba(31,78,84,0.10)";

const StartPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [industry, setIndustry] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [currentTools, setCurrentTools] = useState<string[]>([]);

  // Contact (collected inline at step 5)
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [consent, setConsent] = useState(false);

  const industryPainPoints = useMemo(() => {
    if (!industry) return PAIN_POINTS_BY_INDUSTRY.default;
    return PAIN_POINTS_BY_INDUSTRY[industry] || PAIN_POINTS_BY_INDUSTRY.default;
  }, [industry]);

  const recommendedAgents = useMemo(() => {
    const seen = new Set<string>();
    return painPoints
      .map((p) => AGENT_MAP[p])
      .filter((a): a is NonNullable<typeof a> => {
        if (!a || seen.has(a.name)) return false;
        seen.add(a.name);
        return true;
      })
      .slice(0, 4);
  }, [painPoints]);

  const selectedKete = useMemo(() => {
    const ind = INDUSTRIES.find((i) => i.id === industry);
    return ind?.kete || "not-sure";
  }, [industry]);

  const canAdvance = () => {
    switch (step) {
      case 0: return !!industry;
      case 1: return !!teamSize;
      case 2: return painPoints.length >= 1;
      case 3: return currentTools.length >= 1;
      case 4: return contactName && contactEmail && websiteUrl && consent;
      default: return false;
    }
  };

  const togglePainPoint = (p: string) => {
    setPainPoints((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : prev.length < 3 ? [...prev, p] : prev
    );
  };

  const toggleTool = (t: string) => {
    setCurrentTools((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const consentTimestamp = new Date().toISOString();
      const { data: intake, error } = await supabase
        .from("tenant_intake")
        .insert({
          website_url: websiteUrl,
          contact_name: contactName,
          contact_email: contactEmail,
          team_size: teamSize,
          kete_requested: selectedKete,
          pain_points: painPoints,
          consent_version: CONSENT_VERSION,
          consent_timestamp: consentTimestamp,
          pipeline_status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      await supabase.from("tenant_consent").insert({
        contact_email: contactEmail,
        consent_version: CONSENT_VERSION,
        consent_timestamp: consentTimestamp,
        intake_id: intake.id,
      });

      supabase.functions.invoke("onboarding-pipeline", {
        body: { intake_id: intake.id },
      }).catch(console.error);

      navigate(`/start/pending/${intake.id}`);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <LightPageShell>
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header — assembl wordmark */}
        <header className="px-4 sm:px-6 py-5">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <img src={assemblWordmark} alt="assembl" className="h-7 w-auto" />
            <span className="ml-auto text-[11px] font-mono tracking-wider" style={{ color: TEXT_MUTED }}>
              {step < 5 ? `Step ${step + 1} of 5` : ""}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-4 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: i <= step ? ACCENT : "rgba(31,78,84,0.10)",
                  }}
                />
              ))}
            </div>

            {/* Kia ora greeting on first step */}
            {step === 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium mb-2"
                style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}
              >
                Kia ora! Let's get you set up.
              </motion.p>
            )}

            <h1
              className="text-2xl sm:text-3xl mb-2"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                letterSpacing: "-0.02em",
                color: TEXT_PRIMARY,
              }}
            >
              {STEP_TITLES[step]}
            </h1>
            <p
              className="text-sm mb-8"
              style={{ color: TEXT_MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {STEP_SUBTITLES[step]}
            </p>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Industry ── */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const selected = industry === ind.id;
                    return (
                      <motion.button
                        key={ind.id}
                        type="button"
                        onClick={() => setIndustry(ind.id)}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-2xl p-4 text-left transition-all"
                        style={{
                          background: selected
                            ? "rgba(74,165,168,0.10)"
                            : "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(20px) saturate(140%)",
                          WebkitBackdropFilter: "blur(20px) saturate(140%)",
                          border: selected
                            ? `1.5px solid ${ACCENT}`
                            : `1px solid ${BORDER_SOFT}`,
                          boxShadow: selected
                            ? "0 8px 32px rgba(74,165,168,0.15), 0 1px 0 rgba(255,255,255,0.8) inset"
                            : "0 4px 20px rgba(31,78,84,0.05), 0 1px 0 rgba(255,255,255,0.7) inset",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            background: selected
                              ? `${ACCENT}1F`
                              : "rgba(74,165,168,0.08)",
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                        </div>
                        <div
                          className="text-sm font-medium mb-0.5"
                          style={{ color: TEXT_PRIMARY, fontFamily: "'Lato', sans-serif" }}
                        >
                          {ind.label}
                        </div>
                        <div className="text-[11px]" style={{ color: TEXT_MUTED }}>
                          {ind.desc}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* ── STEP 2: Size ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {SIZES.map((s) => {
                    const selected = teamSize === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTeamSize(s.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                        style={{
                          background: selected
                            ? "rgba(74,165,168,0.10)"
                            : "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(20px) saturate(140%)",
                          WebkitBackdropFilter: "blur(20px) saturate(140%)",
                          border: selected
                            ? `1.5px solid ${ACCENT}`
                            : `1px solid ${BORDER_SOFT}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${ACCENT}1A` }}
                        >
                          <Users className="w-5 h-5" style={{ color: ACCENT }} />
                        </div>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: TEXT_PRIMARY, fontFamily: "'Lato', sans-serif" }}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs" style={{ color: TEXT_MUTED }}>
                            {s.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {teamSize && parseInt(teamSize) >= 6 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(74,165,168,0.06)",
                        border: `1px solid ${BORDER_SOFT}`,
                      }}
                    >
                      <p className="text-xs" style={{ color: TEXT_BODY }}>
                        With {teamSize} staff, AROHA (employment compliance) is automatically included — it's mandatory under the Employment Relations Act 2000.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 3: Pain points ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {industryPainPoints.map((p) => {
                      const selected = painPoints.includes(p);
                      const disabled = !selected && painPoints.length >= 3;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePainPoint(p)}
                          disabled={disabled}
                          className="px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                          style={{
                            background: selected
                              ? "rgba(74,165,168,0.12)"
                              : "rgba(255,255,255,0.65)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: selected
                              ? `1.5px solid ${ACCENT}`
                              : `1px solid ${BORDER_SOFT}`,
                            color: selected ? ACCENT : TEXT_BODY,
                            opacity: disabled ? 0.35 : 1,
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {selected && (
                            <CheckCircle2 className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                          )}
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs" style={{ color: TEXT_MUTED }}>
                    {painPoints.length}/3 selected
                  </p>
                </motion.div>
              )}

              {/* ── STEP 4: Current tools ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {CURRENT_TOOLS.map((t) => {
                    const Icon = t.icon;
                    const selected = currentTools.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTool(t.id)}
                        className="flex items-center gap-3 p-4 rounded-2xl transition-all text-left"
                        style={{
                          background: selected
                            ? "rgba(74,165,168,0.10)"
                            : "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(20px) saturate(140%)",
                          WebkitBackdropFilter: "blur(20px) saturate(140%)",
                          border: selected
                            ? `1.5px solid ${ACCENT}`
                            : `1px solid ${BORDER_SOFT}`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: selected ? ACCENT : TEXT_MUTED }} />
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: selected ? ACCENT : TEXT_PRIMARY,
                            fontFamily: "'Lato', sans-serif",
                          }}
                        >
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* ── STEP 5: Magic moment + contact ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Recommended agents */}
                  {recommendedAgents.length > 0 && (
                    <div className="space-y-3">
                      <p
                        className="text-sm font-medium flex items-center gap-2"
                        style={{ color: TEXT_PRIMARY, fontFamily: "'Lato', sans-serif" }}
                      >
                        <Zap className="w-4 h-4" style={{ color: ACCENT }} />
                        Your starting team, based on what you told us:
                      </p>
                      <div className="space-y-2">
                        {recommendedAgents.map((agent) => {
                          const AIcon = agent.Icon;
                          return (
                            <div
                              key={agent.name}
                              className="flex items-start gap-3 p-4 rounded-2xl"
                              style={{
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(20px) saturate(140%)",
                                WebkitBackdropFilter: "blur(20px) saturate(140%)",
                                border: `1px solid ${BORDER_SOFT}`,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${ACCENT}15` }}
                              >
                                <AIcon className="w-5 h-5" style={{ color: ACCENT }} />
                              </div>
                              <div className="flex-1">
                                <div
                                  className="text-sm font-semibold"
                                  style={{ color: TEXT_PRIMARY, fontFamily: "'Lato', sans-serif" }}
                                >
                                  {agent.name}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                                  {agent.desc}
                                </div>
                              </div>
                              <CheckCircle2 className="w-4 h-4 mt-1" style={{ color: ACCENT }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline contact capture */}
                  <LiquidPanel accent={ACCENT} intensity="medium" animate={false} className="p-5">
                    <p className="text-sm mb-4" style={{ color: TEXT_BODY }}>
                      Almost there — we'll scan your website and build your personalised plan.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs mb-1.5 block" style={{ color: TEXT_MUTED }}>
                          <User className="w-3 h-3 inline mr-1" />Your name
                        </Label>
                        <Input
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Sam Te Aroha"
                          style={{
                            background: "rgba(255,255,255,0.85)",
                            border: `1px solid ${BORDER_SOFT}`,
                            color: TEXT_PRIMARY,
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1.5 block" style={{ color: TEXT_MUTED }}>
                          Work email
                        </Label>
                        <Input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="sam@yoursite.co.nz"
                          style={{
                            background: "rgba(255,255,255,0.85)",
                            border: `1px solid ${BORDER_SOFT}`,
                            color: TEXT_PRIMARY,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label className="text-xs mb-1.5 block" style={{ color: TEXT_MUTED }}>
                        <Globe className="w-3 h-3 inline mr-1" />Business website
                      </Label>
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yoursite.co.nz"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          border: `1px solid ${BORDER_SOFT}`,
                          color: TEXT_PRIMARY,
                        }}
                      />
                    </div>

                    {/* Consent */}
                    <div
                      className="rounded-xl p-3.5 space-y-3"
                      style={{
                        background: "rgba(74,165,168,0.05)",
                        border: `1px solid ${BORDER_FAINT}`,
                      }}
                    >
                      <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>
                        We'll scan your public website and the NZ Business Number register to
                        personalise your plan. No personal information about your staff or customers
                        is collected.{" "}
                        <a
                          href="/privacy"
                          className="underline underline-offset-2"
                          style={{ color: ACCENT }}
                        >
                          Privacy Statement
                        </a>
                        .
                      </p>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked === true)}
                          className="mt-0.5"
                        />
                        <Label
                          className="text-xs leading-relaxed cursor-pointer"
                          style={{ color: TEXT_BODY }}
                        >
                          I agree to the Privacy Statement and understand what data assembl will collect.
                        </Label>
                      </div>
                    </div>
                  </LiquidPanel>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: `1px solid ${BORDER_SOFT}`,
                    color: TEXT_BODY,
                    fontFamily: "'Lato', sans-serif",
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s + 1) as any)}
                  disabled={!canAdvance()}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                  style={{
                    background: ACCENT,
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px rgba(74,165,168,0.30)",
                    fontFamily: "'Lato', sans-serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canAdvance() || isSubmitting}
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                  style={{
                    background: ACCENT,
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px rgba(74,165,168,0.30)",
                    fontFamily: "'Lato', sans-serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Building your plan…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Build my plan
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Skip link */}
            {step < 4 && step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="mt-4 text-xs transition-colors block mx-auto"
                style={{ color: TEXT_MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Skip this step →
              </button>
            )}
          </div>
        </main>
      </div>
    </LightPageShell>
  );
};

export default StartPage;

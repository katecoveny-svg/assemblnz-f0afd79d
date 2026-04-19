import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowRight, ArrowLeft, Globe, Building2, User,
  Users, Wrench, Utensils, HardHat, Palette, Car, Tractor,
  Briefcase, GraduationCap, Heart, ShoppingBag, Sparkles,
  MoreHorizontal, FileSpreadsheet, FileText, Calculator, X,
  Zap, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_VERSION = "2026-04-10-v1";

// ── Step 1: Industry ──
const INDUSTRIES = [
  { id: "construction", label: "Construction", icon: HardHat, kete: "WAIHANGA" },
  { id: "hospitality", label: "Hospitality", icon: Utensils, kete: "MANAAKI" },
  { id: "property", label: "Property", icon: Building2, kete: "WAIHANGA" },
  { id: "automotive", label: "Automotive", icon: Car, kete: "ARATAKI" },
  { id: "agriculture", label: "Agriculture", icon: Tractor, kete: "PIKAU" },
  { id: "professional", label: "Professional Services", icon: Briefcase, kete: "AUAHA" },
  { id: "education", label: "Education", icon: GraduationCap, kete: "AUAHA" },
  { id: "health", label: "Health", icon: Heart, kete: "MANAAKI" },
  { id: "retail", label: "Retail", icon: ShoppingBag, kete: "AUAHA" },
  { id: "creative", label: "Creative / Marketing", icon: Palette, kete: "AUAHA" },
  { id: "other", label: "Other", icon: MoreHorizontal, kete: "not-sure" },
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
  property: ["Healthy Homes compliance", "Tenant communications", "Rent tracking", "Maintenance scheduling", "Tenancy agreements", "Property inspections"],
  automotive: ["WoF/CoF tracking", "Finance compliance (CCCFA)", "Service reminders", "Stock listing", "Workshop scheduling", "Parts ordering"],
  agriculture: ["FEP / farm plans", "NAIT compliance", "Seasonal planning", "Water consent", "Animal health records", "Sustainability reporting"],
  default: ["GST & tax compliance", "Employment compliance", "Content & marketing", "Sales pipeline", "Admin & paperwork", "Reporting & analytics"],
};

// ── Step 4: Current tools ──
const CURRENT_TOOLS = [
  { id: "spreadsheets", label: "Spreadsheets", icon: FileSpreadsheet },
  { id: "paper", label: "Paper / notebooks", icon: FileText },
  { id: "xero", label: "Xero", icon: Calculator },
  { id: "myob", label: "MYOB", icon: Calculator },
  { id: "word", label: "Word docs", icon: FileText },
  { id: "nothing", label: "Nothing / winging it", icon: X },
  { id: "other", label: "Other software", icon: MoreHorizontal },
] as const;

// ── Agent recommendations by pain point ──
const AGENT_MAP: Record<string, { name: string; icon: string; desc: string }> = {
  "Quotes & estimates": { name: "KAUPAPA", icon: "📝", desc: "Generate professional quotes in minutes" },
  "Safety plans & SSSP": { name: "APEX", icon: "🔧", desc: "Safety plans generated in 2 minutes, not 5 hours" },
  "Building consents": { name: "WHAKAAĒ", icon: "📋", desc: "Consent applications with NZ Building Code checks" },
  "Invoicing & claims": { name: "LEDGER", icon: "📊", desc: "Handles GST, invoicing, and cashflow" },
  "Subcontractor management": { name: "AROHA", icon: "👷", desc: "Contracts, compliance, and scheduling" },
  "Food safety diary": { name: "AURA", icon: "🛡️", desc: "Daily food safety checks via WhatsApp" },
  "Staff rosters": { name: "AROHA", icon: "👷", desc: "Rosters, leave, and Holidays Act compliance" },
  "Liquor compliance": { name: "AURA", icon: "🛡️", desc: "Licence renewals and duty manager tracking" },
  "Marketing & socials": { name: "PRISM", icon: "📱", desc: "Brand-locked content across all platforms" },
  "GST & tax compliance": { name: "LEDGER", icon: "📊", desc: "GST returns, tax prep, and cashflow" },
  "Employment compliance": { name: "AROHA", icon: "👷", desc: "Employment agreements and Holidays Act AI" },
  "Content & marketing": { name: "PRISM", icon: "📱", desc: "Creates marketing content automatically" },
  "Sales pipeline": { name: "FLUX", icon: "🎯", desc: "Elite sales intelligence for NZ businesses" },
  "Admin & paperwork": { name: "ANCHOR", icon: "⚓", desc: "Contracts, policies, and legal documents" },
  "Reporting & analytics": { name: "PILOT", icon: "📈", desc: "Business intelligence and insights" },
  "WoF/CoF tracking": { name: "FORGE", icon: "🔧", desc: "Vehicle lifecycle and compliance tracking" },
  "Finance compliance (CCCFA)": { name: "FORGE", icon: "🔧", desc: "F&I calculations with CCCFA compliance" },
  "Service reminders": { name: "FORGE", icon: "🔧", desc: "Automated service reminders via WhatsApp" },
  "Healthy Homes compliance": { name: "KĀINGA", icon: "🏠", desc: "Healthy Homes compliance management" },
  "Tenant communications": { name: "ECHO", icon: "📨", desc: "Automated tenant comms and notifications" },
  "Rent tracking": { name: "LEDGER", icon: "📊", desc: "Rent receipts, arrears, and cashflow" },
  "FEP / farm plans": { name: "TŌRO", icon: "🌿", desc: "Farm environment plan builder" },
  "NAIT compliance": { name: "TŌRO", icon: "🌿", desc: "NAIT tracking and MPI compliance" },
  "Seasonal planning": { name: "TŌRO", icon: "🌿", desc: "Seasonal task calendar and alerts" },
};

const STEP_TITLES = [
  "What kind of business do you run?",
  "How many people work in your business?",
  "What takes up the most time in your week?",
  "What are you using now to manage those things?",
  "Here's what assembl can do for you right now",
];

const STEP_SUBTITLES = [
  "This helps us match you with the right tools.",
  "This determines which compliance features you need.",
  "Pick your top 3 pain points — this drives your personalised plan.",
  "Quick multi-select — helps us identify what to replace.",
  "Your personalised starting team, based on what you told us.",
];

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
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-5 border-b border-border/40">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">a</span>
          </div>
          <span className="text-foreground font-semibold">assembl</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {step < 5 ? `Step ${step + 1} of 5` : ""}
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-xl mx-auto">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Kia ora greeting on first step */}
          {step === 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-medium mb-1"
            >
              Kia ora! Let's get you set up.
            </motion.p>
          )}

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {STEP_TITLES[step]}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
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
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setIndustry(ind.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:bg-card/80"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{ind.label}</span>
                    </button>
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
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-card hover:border-primary/40"
                      }`}
                    >
                      <Users className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <div className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </button>
                  );
                })}
                {teamSize && parseInt(teamSize) >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg bg-primary/5 border border-primary/20 p-3"
                  >
                    <p className="text-xs text-primary">
                      💡 With {teamSize} staff, AROHA (employment compliance) will be automatically included — it's mandatory under the Employment Relations Act 2000.
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
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : disabled
                              ? "border-border/30 bg-card/50 text-muted-foreground/40 cursor-not-allowed"
                              : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
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
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{t.label}</span>
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
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Based on what you've told us, these agents are your starting team:
                    </p>
                    <div className="space-y-2">
                      {recommendedAgents.map((agent) => (
                        <div
                          key={agent.name}
                          className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card"
                        >
                          <span className="text-xl">{agent.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.desc}</div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-primary ml-auto mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline contact capture */}
                <div className="space-y-4 pt-2 border-t border-border/40">
                  <p className="text-sm text-muted-foreground">
                    Almost there — we'll scan your website and build your personalised plan.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        <User className="w-3 h-3 inline mr-1" />Your name
                      </Label>
                      <Input
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Sam Te Aroha"
                        className="bg-card border-border/60"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Work email</Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="sam@yoursite.co.nz"
                        className="bg-card border-border/60"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      <Globe className="w-3 h-3 inline mr-1" />Business website
                    </Label>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yoursite.co.nz"
                      className="bg-card border-border/60"
                    />
                  </div>

                  {/* Consent */}
                  <div className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We'll scan your public website and the NZ Business Number register to personalise your plan.
                      No personal information about your staff or customers is collected.{" "}
                      <a href="/privacy" className="text-primary underline underline-offset-2">Privacy Statement</a>.
                    </p>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={consent}
                        onCheckedChange={(checked) => setConsent(checked === true)}
                        className="mt-0.5"
                      />
                      <Label className="text-xs text-foreground leading-relaxed cursor-pointer">
                        I agree to the Privacy Statement and understand what data assembl will collect.
                      </Label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1 as any)}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1 as any)}
                disabled={!canAdvance()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canAdvance() || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building your plan…
                  </>
                ) : (
                  <>
                    Get my plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skip link */}
          {step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1 as any)}
              className="mt-3 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors block mx-auto"
            >
              Skip this step →
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default StartPage;

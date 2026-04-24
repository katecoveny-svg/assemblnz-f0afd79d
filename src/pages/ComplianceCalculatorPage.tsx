import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, Mail, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

type Industry =
  | "hospitality"
  | "construction"
  | "creative"
  | "automotive"
  | "freight"
  | "retail"
  | "early_childhood"
  | "professional_services"
  | "agriculture"
  | "manufacturing"
  | "other";

type EmployeeBand = "sole_trader" | "1-5" | "6-20" | "21-50" | "51+";

interface BusinessProfile {
  industry: Industry | "";
  employeeBand: EmployeeBand | "";
  hasContractors: boolean;
  handlesFood: boolean;
  sellsAlcohol: boolean;
  worksWithChildren: boolean;
}

interface Obligation {
  title: string;
  detail?: string;
}

interface ApplicableLaw {
  name: string;
  short_name?: string;
  urgency: "critical" | "high" | "medium" | "low";
  reason?: string;
  obligations: Obligation[] | string[];
  recommended_kete?: string[];
  citation?: string;
}

interface CalculatorResult {
  laws: ApplicableLaw[];
  recommended_kete?: string[];
  summary?: string;
}

const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "hospitality", label: "Hospitality, food & beverage" },
  { value: "construction", label: "Construction & trades" },
  { value: "creative", label: "Creative, marketing & media" },
  { value: "automotive", label: "Automotive & fleet" },
  { value: "freight", label: "Freight, customs & logistics" },
  { value: "retail", label: "Retail & e-commerce" },
  { value: "early_childhood", label: "Early childhood & education" },
  { value: "professional_services", label: "Professional services" },
  { value: "agriculture", label: "Agriculture & primary industries" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other / not listed" },
];

const EMPLOYEE_OPTIONS: { value: EmployeeBand; label: string }[] = [
  { value: "sole_trader", label: "Just me (sole trader)" },
  { value: "1-5", label: "1–5 employees" },
  { value: "6-20", label: "6–20 employees" },
  { value: "21-50", label: "21–50 employees" },
  { value: "51+", label: "51+ employees" },
];

const URGENCY_META: Record<ApplicableLaw["urgency"], { label: string; chip: string; ring: string }> = {
  critical: { label: "Critical", chip: "bg-[#C85A54]/10 text-[#9C3F3A] border-[#C85A54]/25", ring: "ring-[#C85A54]/30" },
  high:     { label: "High",     chip: "bg-[#D9BC7A]/15 text-[#8E6F2E] border-[#D9BC7A]/40", ring: "ring-[#D9BC7A]/30" },
  medium:   { label: "Medium",   chip: "bg-[#C9D8D0]/40 text-[#3F665C] border-[#C9D8D0]/60", ring: "ring-[#C9D8D0]/40" },
  low:      { label: "Reference",chip: "bg-[#EEE7DE] text-[#6F6158] border-[#D8C8B4]/60", ring: "ring-[#D8C8B4]/30" },
};

const URGENCY_ORDER: Record<ApplicableLaw["urgency"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function bandToCount(band: EmployeeBand): number {
  switch (band) {
    case "sole_trader": return 1;
    case "1-5": return 3;
    case "6-20": return 12;
    case "21-50": return 30;
    case "51+": return 75;
  }
}

function normaliseObligations(o: Obligation[] | string[] | undefined): Obligation[] {
  if (!o) return [];
  return o.map((item) => (typeof item === "string" ? { title: item } : item));
}

// ────────────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────────────

const STEP_TITLES = ["Industry", "Team size", "Operations", "Review", "Your report"];

export default function ComplianceCalculatorPage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BusinessProfile>({
    industry: "",
    employeeBand: "",
    hasContractors: false,
    handlesFood: false,
    sellsAlcohol: false,
    worksWithChildren: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [email, setEmail] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const groupedLaws = useMemo(() => {
    if (!result) return {} as Record<ApplicableLaw["urgency"], ApplicableLaw[]>;
    const groups: Record<ApplicableLaw["urgency"], ApplicableLaw[]> = { critical: [], high: [], medium: [], low: [] };
    for (const law of result.laws) {
      (groups[law.urgency] ?? groups.low).push(law);
    }
    return groups;
  }, [result]);

  const canAdvance =
    (step === 0 && profile.industry !== "") ||
    (step === 1 && profile.employeeBand !== "") ||
    step === 2 ||
    step === 3 ||
    step === 4;

  const submit = async () => {
    if (!profile.industry || !profile.employeeBand) {
      toast.error("Please complete the industry and team size steps first.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-calculator", {
        body: {
          industry: profile.industry,
          employee_count: bandToCount(profile.employeeBand as EmployeeBand),
          has_contractors: profile.hasContractors,
          handles_food: profile.handlesFood,
          sells_alcohol: profile.sellsAlcohol,
          works_with_children: profile.worksWithChildren,
        },
      });
      if (error) throw error;
      if (!data || !Array.isArray(data.laws)) throw new Error("Unexpected response shape from compliance-calculator.");
      setResult(data as CalculatorResult);
      setStep(4);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const sendEmailReport = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmittingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("compliance-calculator", {
        body: {
          industry: profile.industry,
          employee_count: bandToCount(profile.employeeBand as EmployeeBand),
          has_contractors: profile.hasContractors,
          handles_food: profile.handlesFood,
          sells_alcohol: profile.sellsAlcohol,
          works_with_children: profile.worksWithChildren,
          email,
        },
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success("Your full compliance report is on its way.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send report. Please try again.";
      toast.error(msg);
    } finally {
      setSubmittingEmail(false);
    }
  };

  const reset = () => {
    setStep(0);
    setProfile({ industry: "", employeeBand: "", hasContractors: false, handlesFood: false, sellsAlcohol: false, worksWithChildren: false });
    setResult(null);
    setEmail("");
    setEmailSent(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <Helmet>
        <title>NZ compliance calculator | Assembl</title>
        <meta
          name="description"
          content="Find every NZ law that applies to your business in under a minute. A free compliance calculator covering Health & Safety, Privacy, employment and industry-specific obligations."
        />
        <link rel="canonical" href="https://assembl.co.nz/tools/compliance-calculator" />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-10 sm:pt-24 sm:pb-12 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C8B4]/60 bg-white/70 backdrop-blur-xl px-4 py-1.5 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8E6F2E]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F6158]">NZ Compliance Calculator</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-[#6F6158] leading-[1.05] mb-5">
          Which laws actually apply<br className="hidden sm:block" /> to your business?
        </h1>
        <p className="font-body text-base sm:text-lg text-[#6F6158]/75 max-w-2xl mx-auto leading-relaxed">
          Answer five quick questions and we'll map every relevant New Zealand obligation — Health &amp; Safety, Privacy, employment, and your industry-specific rules — grouped by urgency.
        </p>
      </section>

      {/* Stepper indicator */}
      <section className="px-6 pb-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {STEP_TITLES.map((title, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={title} className="flex-1 flex items-center gap-2 min-w-0">
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] border transition-all ${
                    done
                      ? "bg-[#D9BC7A] text-white border-[#D9BC7A]"
                      : active
                      ? "bg-white text-[#6F6158] border-[#D9BC7A] ring-4 ring-[#D9BC7A]/15"
                      : "bg-white/50 text-[#9D8C7D] border-[#D8C8B4]/60"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.16em] truncate ${
                    active ? "text-[#6F6158]" : "text-[#9D8C7D]"
                  }`}
                >
                  {title}
                </span>
                {i < STEP_TITLES.length - 1 && <div className="flex-1 h-px bg-[#D8C8B4]/40 ml-1" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Card */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div
          className="rounded-3xl bg-white/80 backdrop-blur-xl border border-[#D8C8B4]/40 p-8 sm:p-10"
          style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl text-[#6F6158] mb-2">What industry are you in?</h2>
                <p className="font-body text-[#6F6158]/70 mb-6">
                  This anchors which industry-specific Acts (Food Act, Building Act, Sale &amp; Supply of Alcohol Act, etc.) apply.
                </p>
                <Label className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F6158]/70">Industry</Label>
                <Select
                  value={profile.industry || undefined}
                  onValueChange={(v) => setProfile({ ...profile, industry: v as Industry })}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#D8C8B4]/60 bg-white/90 text-[#6F6158]">
                    <SelectValue placeholder="Choose your primary industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl text-[#6F6158] mb-2">How big is your team?</h2>
                <p className="font-body text-[#6F6158]/70 mb-6">
                  Some thresholds (Holidays Act, KiwiSaver, ACC levies) scale with employee count.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {EMPLOYEE_OPTIONS.map((opt) => {
                    const selected = profile.employeeBand === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, employeeBand: opt.value })}
                        className={`text-left p-4 rounded-2xl border transition-all font-body ${
                          selected
                            ? "border-[#D9BC7A] bg-[#D9BC7A]/10 text-[#6F6158] ring-2 ring-[#D9BC7A]/20"
                            : "border-[#D8C8B4]/50 bg-white/70 text-[#6F6158] hover:border-[#D9BC7A]/60 hover:bg-white"
                        }`}
                      >
                        <span className="block text-base">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl text-[#6F6158] mb-2">Tell us about your operations</h2>
                <p className="font-body text-[#6F6158]/70 mb-6">
                  These four toggles unlock cross-industry obligations like the Food Act, Sale &amp; Supply of Alcohol Act and the Vulnerable Children Act.
                </p>
                <div className="space-y-3">
                  {[
                    { key: "hasContractors" as const, title: "We engage contractors", detail: "Triggers PCBU duties under HSWA 2015 and contractor disclosure rules." },
                    { key: "handlesFood" as const, title: "We prepare or handle food", detail: "Brings in Food Act 2014 — registration, food control plan or NP1 template." },
                    { key: "sellsAlcohol" as const, title: "We sell or supply alcohol", detail: "Sale & Supply of Alcohol Act 2012 — licence type, manager certification, host responsibility." },
                    { key: "worksWithChildren" as const, title: "We work with children under 17", detail: "Children's Act 2014 safety checks; police vetting; child protection policy." },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-[#D8C8B4]/50 bg-white/70"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-[#6F6158] text-base">{item.title}</p>
                        <p className="font-body text-[13px] text-[#6F6158]/65 mt-0.5">{item.detail}</p>
                      </div>
                      <Switch
                        checked={profile[item.key]}
                        onCheckedChange={(v) => setProfile({ ...profile, [item.key]: v })}
                        className="mt-1 data-[state=checked]:bg-[#D9BC7A]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl text-[#6F6158] mb-2">Review &amp; generate</h2>
                <p className="font-body text-[#6F6158]/70 mb-6">
                  Confirm what you've told us — then we'll map the laws.
                </p>
                <dl className="space-y-3">
                  {[
                    ["Industry", INDUSTRY_OPTIONS.find((i) => i.value === profile.industry)?.label ?? "—"],
                    ["Team size", EMPLOYEE_OPTIONS.find((e) => e.value === profile.employeeBand)?.label ?? "—"],
                    ["Engages contractors", profile.hasContractors ? "Yes" : "No"],
                    ["Handles food", profile.handlesFood ? "Yes" : "No"],
                    ["Sells alcohol", profile.sellsAlcohol ? "Yes" : "No"],
                    ["Works with children", profile.worksWithChildren ? "Yes" : "No"],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-4 py-3 border-b border-[#D8C8B4]/40 last:border-0">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F6158]/65">{k}</dt>
                      <dd className="font-body text-[#6F6158] text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}

            {step === 4 && result && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl text-[#6F6158] mb-2">Your applicable laws</h2>
                <p className="font-body text-[#6F6158]/70 mb-6">
                  {result.summary ??
                    `We found ${result.laws.length} New Zealand law${result.laws.length === 1 ? "" : "s"} that apply to your business — sorted by urgency.`}
                </p>

                <div className="space-y-8">
                  {(["critical", "high", "medium", "low"] as const).map((urgency) => {
                    const laws = groupedLaws[urgency];
                    if (!laws || laws.length === 0) return null;
                    const meta = URGENCY_META[urgency];
                    return (
                      <div key={urgency}>
                        <div className="flex items-center gap-2 mb-3">
                          {urgency === "critical" ? (
                            <AlertTriangle className="w-4 h-4 text-[#9C3F3A]" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#6F6158]/60" />
                          )}
                          <h3 className="font-display text-xl text-[#6F6158]">{meta.label}</h3>
                          <span className={`font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border ${meta.chip}`}>
                            {laws.length} law{laws.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <ul className="space-y-3">
                          {laws.map((law, i) => {
                            const obs = normaliseObligations(law.obligations);
                            return (
                              <li
                                key={`${law.name}-${i}`}
                                className={`p-5 rounded-2xl bg-white/85 border border-[#D8C8B4]/40 ring-1 ${meta.ring}`}
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-display text-lg text-[#6F6158] leading-snug">
                                      {law.short_name ?? law.name}
                                    </h4>
                                    {law.short_name && law.short_name !== law.name && (
                                      <p className="font-mono text-[11px] text-[#9D8C7D] mt-0.5">{law.name}</p>
                                    )}
                                  </div>
                                  <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border ${meta.chip}`}>
                                    {meta.label}
                                  </span>
                                </div>
                                {law.reason && (
                                  <p className="font-body text-sm text-[#6F6158]/75 mb-3">{law.reason}</p>
                                )}
                                {obs.length > 0 && (
                                  <ul className="space-y-1.5 pl-4 mb-3">
                                    {obs.map((o, oi) => (
                                      <li key={oi} className="font-body text-sm text-[#6F6158]/80 list-disc list-outside marker:text-[#D9BC7A]">
                                        <span className="font-medium text-[#6F6158]">{o.title}</span>
                                        {o.detail && <span className="text-[#6F6158]/70"> — {o.detail}</span>}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {law.recommended_kete && law.recommended_kete.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#D8C8B4]/40">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6F6158]/55 self-center">
                                      Helped by
                                    </span>
                                    {law.recommended_kete.map((k) => (
                                      <span
                                        key={k}
                                        className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#C9D8D0]/40 text-[#3F665C] border border-[#C9D8D0]/60"
                                      >
                                        {k}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {law.citation && (
                                  <p className="font-mono text-[10px] text-[#9D8C7D] mt-3">{law.citation}</p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Email capture */}
                <div className="mt-10 p-6 sm:p-7 rounded-2xl bg-[#EEE7DE]/70 border border-[#D8C8B4]/50">
                  {emailSent ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-7 h-7 text-[#3F665C] mx-auto mb-2" />
                      <h3 className="font-display text-xl text-[#6F6158] mb-1">Report on its way</h3>
                      <p className="font-body text-sm text-[#6F6158]/75">
                        We've sent the full compliance report to <span className="font-medium text-[#6F6158]">{email}</span>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-[#8E6F2E]" />
                        <h3 className="font-display text-xl text-[#6F6158]">Get your full compliance report</h3>
                      </div>
                      <p className="font-body text-sm text-[#6F6158]/75 mb-4">
                        Includes the full obligation breakdown, recommended templates, and which Assembl kete handle each duty for you.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="email"
                          inputMode="email"
                          placeholder="you@business.co.nz"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          maxLength={255}
                          className="flex-1 h-11 rounded-2xl border-[#D8C8B4]/60 bg-white/90 text-[#6F6158] placeholder:text-[#9D8C7D]"
                        />
                        <Button
                          onClick={sendEmailReport}
                          disabled={submittingEmail}
                          className="h-11 rounded-2xl bg-[#D9BC7A] hover:bg-[#C9AC6A] text-white font-body px-6"
                        >
                          {submittingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Get your full compliance report
                        </Button>
                      </div>
                      <p className="font-mono text-[10px] text-[#9D8C7D] mt-3">
                        We use your email only to send the report and occasional NZ compliance updates. Unsubscribe anytime.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-[#D8C8B4]/40 flex items-center justify-between">
            {step === 4 ? (
              <Button
                variant="ghost"
                onClick={reset}
                className="text-[#6F6158] hover:bg-[#EEE7DE]"
              >
                Start over
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-[#6F6158] hover:bg-[#EEE7DE] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}

            {step < 3 && (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="rounded-2xl bg-[#D9BC7A] hover:bg-[#C9AC6A] text-white font-body px-6 h-11"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={submit}
                disabled={submitting}
                className="rounded-2xl bg-[#D9BC7A] hover:bg-[#C9AC6A] text-white font-body px-6 h-11"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Show my applicable laws
              </Button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="font-mono text-[10px] text-[#9D8C7D] text-center mt-6 max-w-xl mx-auto leading-relaxed">
          This calculator is general guidance, not legal advice. Always confirm your specific obligations with a New Zealand-qualified lawyer or your industry regulator.
        </p>
      </section>
    </div>
  );
}

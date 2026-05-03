import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Check, Clock, Sparkles, MessageSquare,
  Utensils, HardHat, Palette, Car, Truck, ShoppingBag, GraduationCap, Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import LightPageShell from "@/components/LightPageShell";
import { assemblWordmark } from "@/assets/brand";

/* ── 8 marketed kete (locked 2026-04-20) ── */
const INDUSTRIES = [
  { key: "manaaki",  label: "Hospitality",            reo: "Manaaki",  Icon: Utensils,       color: "#4AA5A8" },
  { key: "waihanga", label: "Construction & Trades",  reo: "Waihanga", Icon: HardHat,        color: "#3A7D6E" },
  { key: "auaha",    label: "Creative & Marketing",   reo: "Auaha",    Icon: Palette,        color: "#4AA5A8" },
  { key: "arataki",  label: "Automotive & Fleet",     reo: "Arataki",  Icon: Car,            color: "#3A7D6E" },
  { key: "pikau",    label: "Freight & Logistics",    reo: "Pikau",    Icon: Truck,          color: "#1F4E54" },
  { key: "hoko",     label: "Retail & E-commerce",    reo: "Hoko",     Icon: ShoppingBag,    color: "#4AA5A8" },
  { key: "ako",      label: "Education & Training",   reo: "Ako",      Icon: GraduationCap,  color: "#3A7D6E" },
  { key: "toro",     label: "Household & Whānau",     reo: "Tōro",     Icon: Home,           color: "#1F4E54" },
] as const;

type PackKey = typeof INDUSTRIES[number]["key"];

const PACK_DATA: Record<PackKey, {
  agents: { name: string; desc: string }[];
  problems: string[];
}> = {
  manaaki: {
    agents: [
      { name: "AURA",   desc: "Guest Experience — bookings, returning guests, dietary memory" },
      { name: "HELM",   desc: "Kitchen Operations — Food Control Plans, HACCP, temperature logs" },
      { name: "MESA",   desc: "Table Management — covers, turn times, floor plans" },
      { name: "CELLAR", desc: "Beverage Management — alcohol licensing, stock, wine lists" },
      { name: "AROHA",  desc: "Rosters & HR — Holidays Act, leave, employment compliance" },
    ],
    problems: [
      "Maintaining Food Control Plans and HACCP compliance for MPI audits",
      "Managing alcohol licensing renewals and duty manager certifications",
      "Optimising revenue per available seat and room with real-time data",
    ],
  },
  waihanga: {
    agents: [
      { name: "ĀRAI",     desc: "Site Safety & H&S — SSSP generation, hazard registers, WorkSafe" },
      { name: "KAUPAPA",  desc: "Project Management — programmes, CCA claims, retention, variations" },
      { name: "WHAKAAĒ",  desc: "Consenting — building & resource consent tracking, RFIs" },
      { name: "RAWA",     desc: "Resources & Procurement — tenders, suppliers, workforce planning" },
      { name: "LEDGER",   desc: "Invoicing — GST, progress claims, retention release" },
    ],
    problems: [
      "Keeping up with WorkSafe requirements and site safety documentation",
      "Managing the consent pipeline from lodgement to approval without delays",
      "Tracking project costs, variations, and retention money under the CCA",
    ],
  },
  auaha: {
    agents: [
      { name: "AUAHA",  desc: "Creative Director — brand-locked content across every platform" },
      { name: "PRISM",  desc: "Visual Studio — image and video generation in your brand" },
      { name: "VERSE",  desc: "Copywriting — landing pages, emails, ad copy" },
      { name: "RHYTHM", desc: "Scheduling — multi-channel publishing and calendar" },
      { name: "MARKET", desc: "Reporting — campaign performance back to the client" },
    ],
    problems: [
      "Producing on-brand content fast without losing tone of voice",
      "Reporting back to clients with proof, not vibes",
      "Keeping every channel publishing without a full studio team",
    ],
  },
  arataki: {
    agents: [
      { name: "FORGE",   desc: "Vehicle Lifecycle — WoF/CoF, service history, recalls" },
      { name: "ARATAKI", desc: "Fleet Operations — RUC, driver hours, route planning" },
      { name: "LEDGER",  desc: "F&I — CCCFA-compliant finance and insurance calcs" },
      { name: "ECHO",    desc: "Customer Comms — service reminders via SMS and email" },
      { name: "AROHA",   desc: "Rosters & HR — workshop scheduling and compliance" },
    ],
    problems: [
      "Tracking every vehicle's WoF, service history, and recalls without spreadsheets",
      "Keeping F&I and finance docs compliant with the CCCFA",
      "Driving repeat service visits with timely, branded customer comms",
    ],
  },
  pikau: {
    agents: [
      { name: "PIKAU",   desc: "Customs & Freight — MPI BACC, customs entries, biosecurity" },
      { name: "ARATAKI", desc: "Driver & Vehicle Compliance — RUC, hours of work, fleet" },
      { name: "ECHO",    desc: "Two-way SMS — shipper, consignee, and depot updates" },
      { name: "LEDGER",  desc: "Freight Invoicing — GST, claims, fuel surcharges" },
      { name: "ANCHOR",  desc: "Documents — bills of lading, packing lists, MPI declarations" },
    ],
    problems: [
      "Clearing shipments through MPI and customs without surprise holds",
      "Keeping drivers compliant with hours of work, RUC, and dangerous goods rules",
      "Updating shippers and consignees on ETAs without a full despatch desk",
    ],
  },
  hoko: {
    agents: [
      { name: "HOKO",   desc: "Stock & Inventory — counts, reorder points, supplier mgmt" },
      { name: "AUAHA",  desc: "Listings & Socials — product copy, photos, brand-safe posts" },
      { name: "ECHO",   desc: "Customer Comms — order updates, follow-ups, loyalty" },
      { name: "LEDGER", desc: "Sales & GST — daily takings, returns, and reporting" },
      { name: "FLUX",   desc: "Repeat Sales — winback campaigns and basket lift" },
    ],
    problems: [
      "Keeping stock accurate across in-store, online, and marketplaces",
      "Producing on-brand listings and social posts without a marketing team",
      "Driving repeat purchase without overspending on ads",
    ],
  },
  ako: {
    agents: [
      { name: "AKO",    desc: "Student Records — enrolments, attendance, learning records" },
      { name: "ANCHOR", desc: "Compliance — NZQA, MoE, accreditation tracking" },
      { name: "ECHO",   desc: "Parent & Learner Comms — SMS, email, reminders" },
      { name: "LEDGER", desc: "Invoicing & Enrolments — fees, GST, payment plans" },
      { name: "AUAHA",  desc: "Marketing — open days, prospectus, social content" },
    ],
    problems: [
      "Keeping records audit-ready for NZQA and MoE",
      "Communicating with parents and learners without drowning in inboxes",
      "Filling intakes with marketing that respects your kaupapa",
    ],
  },
  toro: {
    agents: [
      { name: "TŌRO",   desc: "Family Calendar — school, sport, appointments in one view" },
      { name: "ECHO",   desc: "Whānau Comms — shared SMS, group updates" },
      { name: "LEDGER", desc: "Shared Finances — bills, subscriptions, allowances" },
      { name: "VOYAGE", desc: "Trip Planner — family holidays, day-by-day plans" },
      { name: "ANCHOR", desc: "Documents — passports, vaccination records, vehicle papers" },
    ],
    problems: [
      "Running family life out of a group chat and three apps that don't talk",
      "Forgetting bills, subscriptions, and renewals until they bite",
      "Planning trips and shared events without a 40-message thread",
    ],
  },
};

const SESSION_KEY = "assembl_onboarding_session";

// Brand tokens
const ACCENT = "#4AA5A8";
const ACCENT_DEEP = "#3A7D6E";
const TEXT_PRIMARY = "#1F4E54";
const TEXT_BODY = "#3D4250";
const TEXT_MUTED = "#6B7C82";
const BORDER_SOFT = "rgba(74,165,168,0.18)";

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.70)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: `1px solid ${BORDER_SOFT}`,
  boxShadow: "0 4px 20px rgba(31,78,84,0.05), 0 1px 0 rgba(255,255,255,0.7) inset",
};

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<PackKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackFunnelStep, trackPackEvent } = useAnalytics();

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selected && PACK_DATA[parsed.selected as PackKey]) setSelected(parsed.selected);
        if (parsed.step) setStep(parsed.step);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ selected, step, sessionId }));
  }, [selected, step, sessionId]);

  const upsertSession = useCallback(async (pack: string | null, stepNum: number) => {
    const stepField = `step_${stepNum}_at`;
    const payload: any = {
      selected_pack: pack,
      [stepField]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (sessionId) {
      await (supabase.from("onboarding_sessions") as any).update(payload).eq("id", sessionId);
    } else {
      payload.user_id = user?.id || null;
      payload.session_key = user?.id ? null : crypto.randomUUID();
      const { data } = await (supabase.from("onboarding_sessions") as any).insert(payload).select("id").single();
      if (data?.id) setSessionId(data.id);
    }
  }, [sessionId, user?.id]);

  const handleSelectIndustry = (key: PackKey) => setSelected(key);

  const goToStep2 = async () => {
    if (!selected) return;
    await upsertSession(selected, 1);
    trackFunnelStep("industry_select");
    trackPackEvent(selected, "page_view");
    setStep(2);
  };

  const goToStep3 = async () => {
    if (!selected) return;
    await upsertSession(selected, 2);
    trackFunnelStep("trial_start");
    trackPackEvent(selected, "trial_start");

    if (user?.id) {
      await (supabase.from("trial_subscriptions") as any).upsert({
        user_id: user.id,
        pack_slug: selected,
        trial_started_at: new Date().toISOString(),
        trial_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        converted_to_paid: false,
      }, { onConflict: "user_id,pack_slug" });

      if (sessionId) {
        await (supabase.from("onboarding_sessions") as any).update({
          completed: true,
          step_3_at: new Date().toISOString(),
          user_id: user.id,
        }).eq("id", sessionId);
      }
    }

    setStep(3);
  };

  const trialDaysLeft = 14;
  const ind = INDUSTRIES.find(i => i.key === selected);
  const packData = selected ? PACK_DATA[selected] : null;

  return (
    <LightPageShell>
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 sm:px-6 py-5">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <img src={assemblWordmark} alt="assembl" className="h-7 w-auto" />
            <span className="ml-auto text-[11px] font-mono tracking-wider" style={{ color: TEXT_MUTED }}>
              {step}/3
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-4 pb-24">
          <div className="w-full max-w-2xl">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(31,78,84,0.10)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s <= step ? ACCENT : "transparent" }}
                    initial={{ width: 0 }}
                    animate={{ width: s <= step ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ═══ STEP 1: Industry Selection ═══ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium mb-2"
                      style={{ color: ACCENT, fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Kia ora! Pick your kete to start.
                    </motion.p>
                    <h1
                      className="text-2xl sm:text-3xl mb-2"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        letterSpacing: "-0.02em",
                        color: TEXT_PRIMARY,
                      }}
                    >
                      What industry are you in?
                    </h1>
                    <p className="text-sm" style={{ color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>
                      We'll personalise your experience with the right agents and templates.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIES.map(({ key, label, reo, Icon, color }) => {
                      const isSel = selected === key;
                      return (
                        <motion.button
                          key={key}
                          onClick={() => handleSelectIndustry(key)}
                          className="rounded-2xl p-4 text-left transition-all"
                          style={{
                            ...cardStyle,
                            border: isSel ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER_SOFT}`,
                            boxShadow: isSel
                              ? "0 8px 32px rgba(74,165,168,0.18), 0 1px 0 rgba(255,255,255,0.8) inset"
                              : "0 4px 20px rgba(31,78,84,0.05), 0 1px 0 rgba(255,255,255,0.7) inset",
                          }}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${color}1A` }}
                            >
                              <Icon size={20} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-semibold"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: TEXT_PRIMARY }}
                              >
                                {label}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTED }}>
                                {reo} kete · {PACK_DATA[key].agents.length} agents
                              </p>
                            </div>
                            {isSel && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: ACCENT }}
                              >
                                <Check size={12} color="#FFFFFF" strokeWidth={3} />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToStep2}
                    disabled={!selected}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      background: ACCENT,
                      color: "#FFFFFF",
                      boxShadow: selected ? "0 8px 24px rgba(74,165,168,0.30)" : "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* ═══ STEP 2: Pack Preview ═══ */}
              {step === 2 && ind && packData && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-2"
                      style={{ color: ACCENT, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.12em" }}
                    >
                      {ind.reo} kete
                    </p>
                    <h1
                      className="text-2xl sm:text-3xl mb-2"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        letterSpacing: "-0.02em",
                        color: TEXT_PRIMARY,
                      }}
                    >
                      {ind.label}
                    </h1>
                    <p className="text-sm" style={{ color: TEXT_MUTED }}>
                      Here's what your kete includes.
                    </p>
                  </div>

                  {/* Agents list */}
                  <div className="rounded-2xl p-5" style={cardStyle}>
                    <h3
                      className="text-[10px] uppercase tracking-wider font-semibold mb-4"
                      style={{ color: ACCENT, letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Five key agents you'll use
                    </h3>
                    <div className="space-y-3">
                      {packData.agents.map((agent, i) => (
                        <div key={agent.name} className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
                            style={{ background: "rgba(74,165,168,0.12)", color: ACCENT }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: TEXT_PRIMARY, fontFamily: "'Cormorant Garamond', serif" }}
                            >
                              {agent.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                              {agent.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Problems */}
                  <div className="rounded-2xl p-5" style={cardStyle}>
                    <h3
                      className="text-[10px] uppercase tracking-wider font-semibold mb-4"
                      style={{ color: ACCENT_DEEP, letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Problems you'll solve
                    </h3>
                    <div className="space-y-2.5">
                      {packData.problems.map(problem => (
                        <div key={problem} className="flex items-start gap-2.5">
                          <Check size={14} className="shrink-0 mt-0.5" style={{ color: ACCENT_DEEP }} />
                          <p className="text-xs" style={{ color: TEXT_BODY, lineHeight: 1.55 }}>
                            {problem}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trial highlight */}
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background: "rgba(74,165,168,0.06)",
                      border: `1px solid ${BORDER_SOFT}`,
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock size={14} style={{ color: ACCENT }} />
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: ACCENT, letterSpacing: "0.1em" }}
                      >
                        14-day pilot
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
                      Full access to every {ind.reo} agent. No card required.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: `1px solid ${BORDER_SOFT}`,
                        color: TEXT_BODY,
                      }}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={goToStep3}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        background: ACCENT,
                        color: "#FFFFFF",
                        boxShadow: "0 8px 24px rgba(74,165,168,0.30)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Start my pilot <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Welcome ═══ */}
              {step === 3 && ind && packData && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Checkmark */}
                  <div className="flex justify-center">
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: ACCENT,
                        boxShadow: "0 12px 32px rgba(74,165,168,0.35)",
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <Check size={26} color="#FFFFFF" strokeWidth={3} />
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <h1
                      className="text-2xl sm:text-3xl"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        color: TEXT_PRIMARY,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Welcome to {ind.reo}
                    </h1>
                    <p className="text-sm mt-2" style={{ color: TEXT_MUTED }}>
                      Your pilot starts now.
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className="rounded-2xl p-5 text-center" style={cardStyle}>
                    <p
                      className="text-3xl font-bold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: ACCENT }}
                    >
                      {trialDaysLeft}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider mt-1"
                      style={{ color: TEXT_MUTED, letterSpacing: "0.12em" }}
                    >
                      Days remaining
                    </p>
                  </div>

                  {/* Quick start */}
                  <div className="rounded-2xl p-5" style={cardStyle}>
                    <h3
                      className="text-[10px] uppercase tracking-wider font-semibold mb-4"
                      style={{ color: ACCENT, letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Quick start
                    </h3>

                    <button
                      onClick={() => {
                        trackPackEvent(selected!, "agent_click", { agent: packData.agents[0].name });
                        navigate(`/packs/${selected}`);
                      }}
                      className="w-full rounded-xl p-4 mb-3 text-left transition-all hover:scale-[1.01] group"
                      style={{
                        background: "rgba(74,165,168,0.08)",
                        border: `1px solid ${BORDER_SOFT}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(74,165,168,0.15)" }}
                        >
                          <MessageSquare size={18} style={{ color: ACCENT }} />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: TEXT_PRIMARY, fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            Talk to {packData.agents[0].name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                            {packData.agents[0].desc.split("—")[0].trim()}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: ACCENT }}
                        />
                      </div>
                    </button>

                    <button
                      onClick={() => navigate(`/packs/${selected}`)}
                      className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01] group"
                      style={{
                        background: "rgba(58,125,110,0.06)",
                        border: "1px solid rgba(58,125,110,0.18)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(58,125,110,0.15)" }}
                        >
                          <Sparkles size={18} style={{ color: ACCENT_DEEP }} />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: TEXT_PRIMARY, fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            Browse every {ind.reo} agent
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                            See every specialist in your kete
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: ACCENT_DEEP }}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Email confirmation */}
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: "rgba(74,165,168,0.05)",
                      border: `1px solid ${BORDER_SOFT}`,
                    }}
                  >
                    <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
                      A confirmation has been sent to your inbox.
                    </p>
                  </div>

                  {/* Go to dashboard */}
                  <button
                    onClick={() => {
                      localStorage.removeItem(SESSION_KEY);
                      navigate("/workspace");
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      background: ACCENT,
                      color: "#FFFFFF",
                      boxShadow: "0 8px 24px rgba(74,165,168,0.30)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Go to my workspace <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </LightPageShell>
  );
};

export default OnboardingPage;

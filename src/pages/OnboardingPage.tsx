import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Briefcase, Hammer, UtensilsCrossed, Check, Clock, Sparkles, MessageSquare } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";

/* ── industry data ── */
const INDUSTRIES = [
  { key: "pakihi", label: "Business Operations", reo: "Pakihi", Icon: Briefcase, color: "#D4A843" },
  { key: "waihanga", label: "Construction & Building", reo: "Waihanga", Icon: Hammer, color: "#3A7D6E" },
  { key: "manaaki", label: "Hospitality & Food Service", reo: "Manaaki", Icon: UtensilsCrossed, color: "#1A3A5C" },
] as const;

type PackKey = typeof INDUSTRIES[number]["key"];

const PACK_DATA: Record<PackKey, {
  agents: { name: string; desc: string }[];
  problems: string[];
}> = {
  pakihi: {
    agents: [
      { name: "AROHA", desc: "HR & Employment Law — holiday act, leave, disciplinary processes" },
      { name: "PULSE", desc: "Payroll Compliance — PAYE, KiwiSaver, payday filing" },
      { name: "NEXUS", desc: "Business Intelligence — KPI dashboards and performance insights" },
      { name: "PRISM", desc: "Financial Analysis — cash flow forecasting and budgeting" },
      { name: "FORGE", desc: "Operations Management — workflow automation and efficiency" },
    ],
    problems: [
      "Staying compliant with NZ employment law changes (Holidays Act, minimum wage, 90-day trials)",
      "Managing payroll accuracy across PAYE, KiwiSaver, and ACC levies",
      "Getting real-time visibility into business performance without spreadsheets",
    ],
  },
  waihanga: {
    agents: [
      { name: "Ārai", desc: "Site Safety & H&S — SSSP generation, hazard registers, WorkSafe compliance" },
      { name: "Ata", desc: "BIM Management — model register, clash detection, LOD tracking" },
      { name: "Kaupapa", desc: "Project Management — CCA claims, retention calculator, variations" },
      { name: "Rawa", desc: "Resources & Procurement — tender tracking, workforce planning" },
      { name: "Whakaaē", desc: "Consenting — building & resource consent tracking, RFIs" },
    ],
    problems: [
      "Keeping up with WorkSafe requirements and site safety documentation",
      "Managing the consent pipeline from lodgement to approval without delays",
      "Tracking project costs, variations, and retention money under the CCA",
    ],
  },
  manaaki: {
    agents: [
      { name: "AURA", desc: "Guest Experience — front of house, reservations, guest memory" },
      { name: "HELM", desc: "Kitchen Operations — food safety plans, HACCP, temperature logs" },
      { name: "MESA", desc: "Table Management — covers, turn times, floor plans" },
      { name: "CELLAR", desc: "Beverage Management — alcohol licensing, stock, wine lists" },
      { name: "HAVEN", desc: "Accommodation — room management, housekeeping, BWOF compliance" },
    ],
    problems: [
      "Maintaining Food Control Plans and HACCP compliance for MPI audits",
      "Managing alcohol licensing renewals and duty manager certifications",
      "Optimising revenue per available seat/room with real-time data",
    ],
  },
};

const SESSION_KEY = "assembl_onboarding_session";

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(74,165,168,0.15)",
};

/* ── Component ── */
const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<PackKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackFunnelStep, trackPackEvent } = useAnalytics();

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selected) setSelected(parsed.selected);
        if (parsed.step) setStep(parsed.step);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
      } catch { /* ignore */ }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ selected, step, sessionId }));
  }, [selected, step, sessionId]);

  // Create/update DB session
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

  const handleSelectIndustry = (key: PackKey) => {
    setSelected(key);
  };

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

    // Auto-grant trial
    if (user?.id) {
      await (supabase.from("trial_subscriptions") as any).upsert({
        user_id: user.id,
        pack_slug: selected,
        trial_started_at: new Date().toISOString(),
        trial_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        converted_to_paid: false,
      }, { onConflict: "user_id,pack_slug" });

      // Mark onboarding complete
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: "#FAFBFC" }}>
      <ParticleField />

      <div className="relative z-10 w-full max-w-[680px]">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: s <= step ? "#D4A843" : "transparent" }}
                initial={{ width: 0 }}
                animate={{ width: s <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
          <span className="text-[10px] font-mono ml-2" style={{ color: "#9CA3AF" }}>
            {step}/3
          </span>
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
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "-0.025em", color: "#1A1D29" }}>
                  What industry are you in?
                </h1>
                <p className="text-sm mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                  We'll personalise your experience with the right agents and templates
                </p>
              </div>

              <div className="space-y-3">
                {INDUSTRIES.map(({ key, label, reo, Icon, color }) => (
                  <motion.button
                    key={key}
                    onClick={() => handleSelectIndustry(key)}
                    className="w-full rounded-2xl p-5 text-left transition-all"
                    style={{
                      ...cardStyle,
                      border: selected === key ? `2px solid #D4A843` : "1px solid rgba(255,255,255,0.5)",
                      boxShadow: selected === key ? "0 0 30px rgba(212,168,67,0.12)" : "none",
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ fontFamily: "'Lato', sans-serif", color: "#1A1D29" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                          {reo} Pack — {PACK_DATA[key].agents.length} specialist agents
                        </p>
                      </div>
                      {selected === key && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#D4A843" }}
                        >
                          <Check size={14} style={{ color: "#09090F" }} strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={goToStep2}
                disabled={!selected}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  background: selected ? "#D4A843" : "rgba(212,168,67,0.3)",
                  color: "#09090F",
                }}
              >
                Next <ArrowRight size={16} />
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
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                  {ind.reo} — {ind.label}
                </h1>
                <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
                  Here's what your pack includes
                </p>
              </div>

              {/* Agents list */}
              <div className="rounded-2xl p-5" style={cardStyle}>
                <h3 className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843", letterSpacing: "0.1em" }}>
                  5 Key Agents You'll Use
                </h3>
                <div className="space-y-3">
                  {packData.agents.map((agent, i) => (
                    <div key={agent.name} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5" style={{ background: "rgba(212,168,67,0.12)", color: "#D4A843" }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1A1D29" }}>{agent.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{agent.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problems */}
              <div className="rounded-2xl p-5" style={cardStyle}>
                <h3 className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#3A7D6E", letterSpacing: "0.1em" }}>
                  Problems You'll Solve
                </h3>
                <div className="space-y-2.5">
                  {packData.problems.map(problem => (
                    <div key={problem} className="flex items-start gap-2.5">
                      <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#3A7D6E" }} />
                      <p className="text-xs" style={{ color: "#9CA3AF", lineHeight: 1.5 }}>{problem}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get started highlight */}
              <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)" }}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock size={14} style={{ color: "#D4A843" }} />
                  <span className="text-xs font-bold" style={{ color: "#D4A843" }}>GET STARTED</span>
                </div>
                <p className="text-[11px]" style={{ color: "#6B7280" }}>
                  Full access to all {ind.reo} agents. Custom setup for your business.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", color: "#6B7280" }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={goToStep3}
                  className="flex-[2] py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ fontFamily: "'Lato', sans-serif", background: "#D4A843", color: "#09090F" }}
                >
                  Get Started <ArrowRight size={16} />
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
                  style={{ background: "#3A7D6E" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Check size={28} style={{ color: "#1A1D29" }} strokeWidth={3} />
                </motion.div>
              </div>

              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                  Welcome to {ind.reo}!
                </h1>
                <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
                  Your onboarding starts now
                </p>
              </div>

              {/* Countdown */}
              <div className="rounded-2xl p-5 text-center" style={cardStyle}>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>{trialDaysLeft}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#6B7280" }}>Days Remaining</p>
                  </div>
                </div>
              </div>

              {/* Quick start */}
              <div className="rounded-2xl p-5" style={cardStyle}>
                <h3 className="text-[10px] uppercase tracking-wider font-bold mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843", letterSpacing: "0.1em" }}>
                  Quick Start
                </h3>

                <button
                  onClick={() => {
                    trackPackEvent(selected!, "agent_click", { agent: packData.agents[0].name });
                    navigate(`/packs/${selected}`);
                  }}
                  className="w-full rounded-xl p-4 mb-3 text-left transition-all hover:scale-[1.01] group"
                  style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,168,67,0.15)" }}>
                      <MessageSquare size={18} style={{ color: "#D4A843" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "#1A1D29" }}>
                        Click to explore: {packData.agents[0].name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                        {packData.agents[0].desc.split("—")[0].trim()}
                      </p>
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#D4A843" }} />
                  </div>
                </button>

                <button
                  onClick={() => navigate(`/packs/${selected}`)}
                  className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01] group"
                  style={{ background: "rgba(58,125,110,0.08)", border: "1px solid rgba(58,125,110,0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(58,125,110,0.15)" }}>
                      <Sparkles size={18} style={{ color: "#3A7D6E" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "#1A1D29" }}>
                        Browse all {ind.reo} agents
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                        See every specialist in your pack
                      </p>
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#3A7D6E" }} />
                  </div>
                </button>
              </div>

              {/* Email notification */}
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(58,125,110,0.06)", border: "1px solid rgba(58,125,110,0.12)" }}>
                <p className="text-[11px]" style={{ color: "#6B7280" }}>
                  ✉ A confirmation email has been sent to your inbox
                </p>
              </div>

              {/* Go to dashboard */}
              <button
                onClick={() => {
                  localStorage.removeItem(SESSION_KEY);
                  navigate("/");
                }}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ fontFamily: "'Lato', sans-serif", background: "#D4A843", color: "#09090F" }}
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;

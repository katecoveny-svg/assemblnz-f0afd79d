import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Hammer, UtensilsCrossed, Heart, Palette, Cpu, Shield, Clock, Users, Zap } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const ICON_MAP: Record<string, any> = {
  briefcase: Briefcase, hammer: Hammer, utensils: UtensilsCrossed,
  heart: Heart, palette: Palette, cpu: Cpu,
};

type AgentDef = { name: string; desc: string; status: "Deployed" | "Beta" | "Coming Soon" };

const PACK_AGENTS: Record<string, AgentDef[]> = {
  pakihi: [
    { name: "LEDGER", desc: "Finance, GST, PAYE & legal compliance", status: "Deployed" },
    { name: "AROHA", desc: "HR & Employment Law", status: "Deployed" },
    { name: "TURF", desc: "Marketing & Brand Strategy", status: "Deployed" },
    { name: "SAGE", desc: "Business Strategy & Planning", status: "Deployed" },
    { name: "COMPASS", desc: "Risk Management & Compliance", status: "Deployed" },
    { name: "ANCHOR", desc: "Operations & Process Optimisation", status: "Deployed" },
    { name: "FLUX", desc: "Sales & Revenue Operations", status: "Deployed" },
    { name: "SHIELD", desc: "Insurance & Risk Mitigation", status: "Deployed" },
  ],
  hanga: [
    { name: "ATA", desc: "BIM & Design Coordination", status: "Deployed" },
    { name: "ĀRAI", desc: "Health & Safety Compliance", status: "Deployed" },
    { name: "KAUPAPA", desc: "Project Management & Governance", status: "Deployed" },
    { name: "RAWA", desc: "Resource Management & Consenting", status: "Deployed" },
    { name: "WHAKAAĒ", desc: "Building Consent & Compliance", status: "Deployed" },
    { name: "PAI", desc: "Quality Assurance & Defect Management", status: "Deployed" },
  ],
  manaaki: [
    { name: "AURA", desc: "Accommodation & Hospitality Orchestrator", status: "Deployed" },
    { name: "HAVEN", desc: "Hotel & Venue Management", status: "Deployed" },
    { name: "TIDE", desc: "Tourism & Experience Design", status: "Deployed" },
    { name: "BEACON", desc: "Event & Function Management", status: "Deployed" },
    { name: "COAST", desc: "Seaside & Water Venues", status: "Deployed" },
    { name: "EMBER", desc: "Bar & Beverage Operations", status: "Deployed" },
    { name: "FLORA", desc: "Garden & Outdoor Venue Management", status: "Deployed" },
    { name: "CREST", desc: "Premium Hospitality & Concierge", status: "Deployed" },
  ],
  auaha: [
    { name: "PRISM", desc: "Creative Campaign Orchestrator", status: "Deployed" },
    { name: "MUSE", desc: "Content & Copywriting", status: "Deployed" },
    { name: "PIXEL", desc: "Visual Design & Brand", status: "Deployed" },
    { name: "VERSE", desc: "Video & Motion", status: "Deployed" },
    { name: "CANVAS", desc: "Event & Experience Design", status: "Deployed" },
    { name: "REEL", desc: "Social Media & Community", status: "Deployed" },
    { name: "QUILL", desc: "Technical Writing & Documentation", status: "Deployed" },
    { name: "KŌRERO", desc: "Podcast & Audio Production", status: "Deployed" },
  ],
  hangarau: [
    { name: "SPARK", desc: "App Builder & Digital Transformation", status: "Deployed" },
    { name: "SENTINEL", desc: "System Monitoring & Alerts", status: "Deployed" },
    { name: "NEXUS", desc: "Integration & Data Pipelines", status: "Deployed" },
    { name: "CIPHER", desc: "Cryptography & Security", status: "Deployed" },
    { name: "RELAY", desc: "Messaging & Event Systems", status: "Deployed" },
    { name: "SIGNAL", desc: "IT Security & Cybersecurity", status: "Deployed" },
    { name: "FORGE", desc: "DevOps & Deployment", status: "Deployed" },
  ],
  "te-kahui-reo": [
    { name: "TIKA", desc: "Te Tiriti, Tikanga & Māori Business Advisor", status: "Deployed" },
  ],
  toroa: [
    { name: "TŌROA", desc: "SMS-first family AI navigator — school notices, meal planning, bus tracking, reminders, budgets", status: "Deployed" },
  ],
};

const TOROA_FEATURES = [
  { icon: Shield, title: "Find services", desc: "Help families locate schools, health services, social support, and educational resources" },
  { icon: Heart, title: "Track wellbeing", desc: "Monitor family member checkups, medications, education milestones" },
  { icon: Users, title: "Coordinate care", desc: "Manage appointments, share information securely with family members" },
  { icon: Zap, title: "Stay connected", desc: "Family calendar, messaging, resource sharing" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Deployed: { bg: "rgba(58,125,110,0.2)", text: "#3A7D6E" },
  Beta: { bg: "rgba(212,168,67,0.2)", text: "#D4A843" },
  "Coming Soon": { bg: "rgba(168,168,184,0.15)", text: "#A8A8B8" },
};

const PACK_ACCENT: Record<string, string> = {
  pakihi: "#5AADA0",
  hanga: "#3A7D6E",
  manaaki: "#D4A843",
  auaha: "#F0D078",
  hangarau: "#4A7AB5",
  "te-kahui-reo": "#D4A843",
  toroa: "#D4A843",
};

const PackLandingPage = () => {
  const { packSlug } = useParams<{ packSlug: string }>();
  const [pack, setPack] = useState<any>(null);
  const { trackPackEvent, trackAgentEvent, trackFunnelStep } = useAnalytics();
  const accent = PACK_ACCENT[packSlug || ""] || "#D4A843";

  useEffect(() => {
    supabase.from("pack_visibility").select("*").eq("pack_slug", packSlug || "").single()
      .then(({ data }) => { if (data) setPack(data); });
  }, [packSlug]);

  useEffect(() => {
    if (packSlug) trackPackEvent(packSlug, "page_view");
  }, [packSlug, trackPackEvent]);

  const agents = PACK_AGENTS[packSlug || ""] || [];
  const IconComp = ICON_MAP[pack?.icon || "briefcase"] || Briefcase;
  const isToroa = packSlug === "toroa";

  return (
    <div className="min-h-screen star-field flex flex-col relative" style={{ background: "#09090F" }}>
      <SEO title={pack?.pack_name || "Industry Pack"} description={pack?.description || ""} />
      <ParticleField />
      <BrandNav />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}25`, boxShadow: `0 0 24px ${accent}20` }}>
              <IconComp size={28} style={{ color: accent }} />
            </div>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "2.5rem", color: "#FFFFFF" }}>
              {pack?.pack_name || packSlug}
            </h1>
            <p className="mt-4 text-sm max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              {pack?.description}
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: accent }}>{pack?.agent_count || agents.length}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>specialist agents</span>
              </div>
              {isToroa && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: "#3A7D6E" }}>$29</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>/month</span>
                </div>
              )}
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "#D4A843", color: "#09090F" }}
              onClick={() => {
                if (packSlug) {
                  trackPackEvent(packSlug, "trial_start");
                  trackFunnelStep("trial_start");
                }
              }}
            >
              Book a discovery call <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        {/* Tōroa features */}
        {isToroa && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOROA_FEATURES.map((f, i) => (
                <motion.div key={f.title} className="rounded-2xl p-6 group overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: "rgba(58,125,110,0.12)", border: "1px solid rgba(58,125,110,0.2)" }}>
                    <f.icon size={18} style={{ color: "#3A7D6E" }} />
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{f.title}</h3>
                  <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Agent grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-center mb-10" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "1.25rem", color: "rgba(255,255,255,0.6)" }}>
            {isToroa ? "Your Navigator" : "Meet Your Agents"}
          </h2>
          <div className={`grid gap-4 ${isToroa ? "grid-cols-1 max-w-lg mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
            {agents.map((agent, i) => {
              const st = STATUS_STYLES[agent.status];
              return (
                <motion.div
                  key={agent.name}
                  className="rounded-2xl p-5 group overflow-hidden relative"
                  style={{
                    background: "rgba(15,15,26,0.82)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
                    transition: "border-color 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{
                    y: -2,
                    borderColor: `${accent}40`,
                    boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 18px ${accent}12`,
                  }}
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}40)` }} />
                  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${accent}70, transparent)` }} />
                  <div className="flex items-start justify-between mb-3 pl-3">
                    <h3 className="text-sm font-light" style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em", color: "#FFFFFF" }}>{agent.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ml-2 shrink-0" style={{ background: st.bg, color: st.text, letterSpacing: "0.05em" }}>{agent.status}</span>
                  </div>
                  <p className="text-xs pl-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{agent.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Stats bar — no free trial */}
        <section className="border-t border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(15,15,26,0.5)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: "#D4A843" }}>{agents.length}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Specialist Agents</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#3A7D6E" }}>{agents.filter(a => a.status === "Deployed").length}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Deployed</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#D4A843" }}>~5 min</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Time to Value</p>
            </div>
          </div>
        </section>
      </main>
      <BrandFooter />
    </div>
  );
};

export default PackLandingPage;

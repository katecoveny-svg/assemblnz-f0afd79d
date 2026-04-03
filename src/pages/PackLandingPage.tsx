import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Hammer, UtensilsCrossed, Heart, Palette, Cpu, Shield, Clock, Users, Zap } from "lucide-react";
import GlowIcon from "@/components/GlowIcon";
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
    { name: "AROHA", desc: "HR & Employment Law Specialist", status: "Deployed" },
    { name: "PULSE", desc: "Payroll Compliance & Calculations", status: "Deployed" },
    { name: "NEXUS", desc: "Business Intelligence & Analytics", status: "Deployed" },
    { name: "PRISM", desc: "Financial Analysis & Forecasting", status: "Deployed" },
    { name: "TURF", desc: "Resource Management & Allocation", status: "Deployed" },
    { name: "FORGE", desc: "Operations Management", status: "Deployed" },
    { name: "ECHO", desc: "Internal Communications", status: "Deployed" },
    { name: "ATLAS", desc: "Strategic Planning & Growth", status: "Beta" },
    { name: "COMPASS", desc: "Market Research & Competitive Analysis", status: "Beta" },
    { name: "CIPHER", desc: "Data Analytics & Insights", status: "Beta" },
    { name: "VANGUARD", desc: "Risk Management & Mitigation", status: "Coming Soon" },
    { name: "SENTINEL", desc: "Business Health Monitoring", status: "Coming Soon" },
  ],
  hanga: [
    { name: "ĀRAI", desc: "Site Safety & H&S Compliance", status: "Deployed" },
    { name: "ATA", desc: "BIM (Building Information Modeling)", status: "Deployed" },
    { name: "KAUPAPA", desc: "Project Management & Scheduling", status: "Deployed" },
    { name: "RAWA", desc: "Resources & Procurement", status: "Deployed" },
    { name: "WHAKAAĒ", desc: "Resource Consenting & Approvals", status: "Deployed" },
    { name: "PAI", desc: "Quality Assurance & Defect Management", status: "Deployed" },
    { name: "MANA REVIEW AI", desc: "Environmental & Cultural Impact Assessment", status: "Beta" },
  ],
  manaaki: [
    { name: "AURA", desc: "Front of House & Guest Experience", status: "Deployed" },
    { name: "HELM", desc: "Kitchen Operations & Food Safety", status: "Deployed" },
    { name: "ORA", desc: "Elderly Care & Companionship", status: "Deployed" },
    { name: "MESA", desc: "Table Management & Reservations", status: "Beta" },
    { name: "SAVOR", desc: "Menu Planning & Nutrition Analysis", status: "Beta" },
    { name: "CELLAR", desc: "Beverage Management & Licensing", status: "Coming Soon" },
    { name: "HAVEN", desc: "Accommodation & Room Management", status: "Deployed" },
    { name: "THRIVE", desc: "Staff Wellbeing & Scheduling", status: "Coming Soon" },
  ],
  toroa: [
    { name: "TŌROA", desc: "Family wellbeing guidance, navigating health/education/social services, whānau support, family coordination", status: "Deployed" },
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

const PackLandingPage = () => {
  const { packSlug } = useParams<{ packSlug: string }>();
  const [pack, setPack] = useState<any>(null);
  const { trackPackEvent, trackAgentEvent, trackFunnelStep } = useAnalytics();

  useEffect(() => {
    supabase.from("pack_visibility").select("*").eq("pack_slug", packSlug || "").single()
      .then(({ data }) => { if (data) setPack(data); });
  }, [packSlug]);

  // Track page view
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
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.2)" }}>
              <IconComp size={28} style={{ color: "#D4A843" }} />
            </div>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "2.5rem", color: "#FFFFFF" }}>
              {pack?.pack_name || packSlug}
            </h1>
            <p className="mt-4 text-sm max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              {pack?.description}
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: "#D4A843" }}>{pack?.agent_count || agents.length}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>specialist agents</span>
              </div>
              {isToroa && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: "#3A7D6E" }}>$19–39</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>/month standalone</span>
                </div>
              )}
            </div>
            <Link
              to={isToroa ? "/toroa/app" : `/chat/${agents[0]?.name.toLowerCase().replace(/\s+/g, "-") || "aroha"}`}
              className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "#D4A843", color: "#09090F" }}
              onClick={() => {
                if (packSlug) {
                  trackPackEvent(packSlug, "trial_start");
                  trackFunnelStep("trial_start");
                }
              }}
            >
              Try {pack?.pack_name?.split("(")[0]?.trim() || packSlug} <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        {/* Tōroa features */}
        {isToroa && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOROA_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="rounded-2xl p-6 group overflow-hidden"
                  style={{ background: "rgba(15,15,26,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
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
                  className="rounded-2xl p-5 group overflow-hidden relative cursor-pointer"
                  style={{ background: "rgba(15,15,26,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => {
                    if (packSlug) {
                      trackAgentEvent(packSlug, agent.name.toLowerCase().replace(/\s+/g, "-"), "click");
                      trackPackEvent(packSlug, "agent_click", { agent: agent.name });
                    }
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ background: "linear-gradient(90deg, transparent, #D4A84360, transparent)" }} />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em", color: "#FFFFFF" }}>{agent.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: st.bg, color: st.text, letterSpacing: "0.05em" }}>{agent.status}</span>
                  </div>
                  <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{agent.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-t border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(15,15,26,0.5)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: "#D4A843" }}>{agents.length}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Specialist Agents</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#3A7D6E" }}>{agents.filter(a => a.status === "Deployed").length}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Deployed</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#D4A843" }}>14</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Day Free Trial</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#3A7D6E" }}>~5 min</p>
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

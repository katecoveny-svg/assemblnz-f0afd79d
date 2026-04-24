import { useState } from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, Database, Sparkles, Shield, Rocket, ArrowRight, Check } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteIcon from "@/components/kete/KeteIcon";
import KiaOraPopup from "@/components/KiaOraPopup";
import { KETE_DATA } from "@/components/kete/keteData";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.1, duration: 0.6, ease },
});

const MIGRATION_COPY: Record<string, { subheading: string; body: string; examples: string[] }> = {
  manaaki: {
    subheading: "Moving from your current POS, booking, or rostering system?",
    body: "Assembl migrates your menu data, staff rosters, supplier records, compliance logs, and booking history from platforms like Lightspeed, Kounta, Deputy, or ResDiary.",
    examples: ["Lightspeed POS", "Kounta", "Deputy rosters", "ResDiary bookings", "Xero integration data"],
  },
  waihanga: {
    subheading: "Bringing your site data across from existing project management tools?",
    body: "Assembl pulls in your project schedules, subcontractor records, safety documentation, consent tracking, and payment claim history from tools like Procore, Buildertrend, or spreadsheet-based systems.",
    examples: ["Procore", "Buildertrend", "Aconex", "Excel project trackers", "PDF safety docs"],
  },
  auaha: {
    subheading: "Migrating from your current content and project management stack?",
    body: "Assembl imports your content calendars, brand assets, client briefs, project histories, and approval workflows from tools like Monday.com, Asana, Trello, or Google Drive.",
    examples: ["Monday.com", "Asana", "Trello", "Google Drive", "Dropbox asset libraries"],
  },
  arataki: {
    subheading: "Switching from your current dealership management system?",
    body: "Assembl migrates your vehicle inventory, customer records, service histories, finance disclosures, and warranty data from legacy DMS platforms like Pentana, Titan, or ERA.",
    examples: ["Pentana DMS", "Titan DMS", "ERA", "Custom dealer databases", "Excel stock sheets"],
  },
  pikau: {
    subheading: "Moving from your current freight and customs management platform?",
    body: "Assembl imports your shipping records, customs declarations, client profiles, carrier rate tables, and compliance documentation from platforms like CargoWise, WiseTech, or bespoke systems.",
    examples: ["CargoWise One", "WiseTech", "Customs broker databases", "Rate spreadsheets", "EDI records"],
  },
};

const PIPELINE = [
  { reo: "Tūhono", en: "Connect", icon: LinkIcon, desc: "We connect to your existing platform — whether it's a cloud API, database export, CSV dump, or even paper records we digitise." },
  { reo: "Tango", en: "Extract", icon: Database, desc: "Your data is extracted in its entirety. Customer records, transaction history, compliance documents, staff data, inventory — everything that matters." },
  { reo: "Horoia", en: "Clean", icon: Sparkles, desc: "Duplicates removed. Formats standardised. Missing fields flagged. NZ-specific validation — GST numbers, phone formats, address formatting — all handled automatically." },
  { reo: "Kahu", en: "Comply", icon: Shield, desc: "Every record passes through Assembl's compliance pipeline. Privacy Act 2020 checks, industry-specific validation, data sovereignty verification. Nothing moves without clearance." },
  { reo: "Whakarite", en: "Activate", icon: Rocket, desc: "Your kete goes live with all historical data in place. Staff accounts configured. Dashboards populated. Agents trained on your data patterns. Day one feels like day 1,000." },
];

const TRUST_POINTS = [
  { title: "Privacy Act compliant", body: "All personal data is handled under the Privacy Act 2020. We run a Privacy Impact Assessment before any migration begins, and IPP 3A obligations are met for automated decision-making." },
  { title: "Zero data loss guarantee", body: "Every migration includes a full validation report. Source record counts matched against destination. Field-level integrity checks. Reconciliation before go-live sign-off." },
  { title: "Rollback ready", body: "Your source system stays untouched until you're satisfied. If anything isn't right, we roll back to your original state. No pressure. No lock-in." },
];

const KETE_SLUGS = ["manaaki", "waihanga", "auaha", "arataki", "pikau"];

const MigrationPage = () => {
  const [kiaOraOpen, setKiaOraOpen] = useState(false);

  return (
    <>
      <SEO title="Nuku Mai — Seamless Database Migration | Assembl" description="Assembl migrates your records, compliance history, and operational data from any existing system into your new kete. Validated. Compliant. Ready to work." />
      <BrandNav />
      <div className="min-h-screen" style={{ background: "transparent" }}>

        {/* ═══ HERO ═══ */}
        <section className="relative px-4 sm:px-6 py-24 sm:py-36 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 50% 50% at 30% 40%, rgba(74,165,168,0.06), transparent 60%), radial-gradient(ellipse 40% 40% at 70% 60%, rgba(74,165,168,0.04), transparent 60%)",
          }} />
          <div className="max-w-[900px] mx-auto text-center relative z-10">
            <motion.div {...fade}>
              <p className="text-[10px] font-medium tracking-[5px] uppercase mb-6"
                style={{ color: "#4AA5A8", fontFamily: "'IBM Plex Mono', monospace" }}>
                — Migration —
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl uppercase tracking-[5px] mb-4"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                Nuku Mai
              </h1>
              <p className="text-lg sm:text-xl mb-8"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#6B7280" }}>
                Seamless Database Migration
              </p>
              <p className="text-[15px] leading-[1.8] max-w-2xl mx-auto"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#6B7280" }}>
                Your business didn't stop running when you chose Assembl — and your data shouldn't have to start over. Our migration agents move your records, compliance history, and operational data from any existing system into your new kete. Validated. Compliant. Ready to work.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ PIPELINE ═══ */}
        <section className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-[900px] mx-auto">
            <motion.div {...fade} className="text-center mb-16">
              <p className="text-[10px] font-medium tracking-[5px] uppercase mb-5"
                style={{ color: "#4AA5A8", fontFamily: "'IBM Plex Mono', monospace" }}>
                — How it works —
              </p>
              <h2 className="text-lg sm:text-[32px] uppercase tracking-[3px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                Five-Step Pipeline
              </h2>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px hidden sm:block" style={{ background: "linear-gradient(to bottom, transparent, #4AA5A840, #4AA5A840, transparent)" }} />

              <div className="space-y-8">
                {PIPELINE.map((step, i) => (
                  <motion.div key={step.reo} {...stagger(i)} className="flex gap-5 sm:gap-8 items-start">
                    <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center relative z-10"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(74,165,168,0.15)",
                        boxShadow: "4px 4px 12px rgba(166,166,180,0.25), -4px -4px 12px rgba(255,255,255,0.85)",
                      }}>
                      <step.icon size={22} style={{ color: "#4AA5A8" }} />
                    </div>
                    <div className="flex-1 rounded-2xl p-5 sm:p-6"
                      style={{
                        background: "rgba(255,255,255,0.65)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(74,165,168,0.1)",
                      }}>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-[10px] tracking-[2px] uppercase font-medium"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4AA5A8" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-[16px] font-semibold" style={{ fontFamily: "'Inter', sans-serif", color: "#1A1D29" }}>
                          {step.reo}
                        </h3>
                        <span className="text-[12px]" style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
                          {step.en}
                        </span>
                      </div>
                      <p className="text-[14px] leading-[1.7]"
                        style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ INDUSTRY CARDS ═══ */}
        <section className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto">
            <motion.div {...fade} className="text-center mb-16">
              <p className="text-[10px] font-medium tracking-[5px] uppercase mb-5"
                style={{ color: "#4AA5A8", fontFamily: "'IBM Plex Mono', monospace" }}>
                — By industry —
              </p>
              <h2 className="text-lg sm:text-[32px] uppercase tracking-[3px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                What We Migrate
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {KETE_SLUGS.map((slug, i) => {
                const kete = KETE_DATA.find(k => k.slug === slug);
                const copy = MIGRATION_COPY[slug];
                if (!kete || !copy) return null;
                return (
                  <motion.div key={slug} {...stagger(i)}
                    className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${kete.accentColor}20`,
                      boxShadow: "4px 4px 12px rgba(166,166,180,0.2), -4px -4px 12px rgba(255,255,255,0.85)",
                    }}>
                    <div className="w-16 h-[72px] mx-auto mb-4">
                      <KeteIcon name={kete.name} accentColor={kete.accentColor} accentLight={kete.accentLight} variant={kete.variant} size="small" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-center mb-1" style={{ fontFamily: "'Inter', sans-serif", color: "#1A1D29" }}>
                      {kete.name}
                    </h3>
                    <p className="text-[11px] text-center mb-3 tracking-[1px] uppercase"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: kete.accentColor }}>
                      {kete.englishName}
                    </p>
                    <p className="text-[12px] leading-[1.6] mb-4 text-center"
                      style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
                      {copy.subheading}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {copy.examples.map(ex => (
                        <span key={ex} className="text-[9px] px-2 py-1 rounded-full"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: kete.accentColor,
                            background: `${kete.accentColor}10`,
                          }}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ TRUST ═══ */}
        <section className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-[1000px] mx-auto">
            <motion.div {...fade} className="text-center mb-16">
              <h2 className="text-lg sm:text-[32px] uppercase tracking-[3px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                Migration, the Assembl way
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TRUST_POINTS.map((tp, i) => (
                <motion.div key={tp.title} {...stagger(i)}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(74,165,168,0.1)",
                    boxShadow: "4px 4px 12px rgba(166,166,180,0.2), -4px -4px 12px rgba(255,255,255,0.85)",
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "rgba(74,165,168,0.1)" }}>
                    <Check size={16} style={{ color: "#4AA5A8" }} />
                  </div>
                  <h3 className="text-[14px] font-semibold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "#1A1D29" }}>
                    {tp.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7]"
                    style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
                    {tp.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-xl mx-auto text-center">
            <motion.div {...fade}
              className="rounded-2xl p-10 sm:p-14"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(74,165,168,0.12)",
                boxShadow: "6px 6px 16px rgba(166,166,180,0.25), -6px -6px 16px rgba(255,255,255,0.85)",
              }}>
              <h2 className="text-xl sm:text-[28px] uppercase tracking-[3px] mb-4"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
                Ready to move?
              </h2>
              <p className="text-[14px] leading-[1.7] mb-8"
                style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
                Tell us what system you're coming from and we'll scope your migration — usually takes less than a week.
              </p>
              <button onClick={() => setKiaOraOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-semibold transition-all duration-300 hover:scale-[1.03] group"
                style={{
                  background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
                  color: "#FFFFFF",
                  boxShadow: "0 6px 24px rgba(74,165,168,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
                  fontFamily: "'Inter', sans-serif",
                }}>
                Kia ora — let's talk
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>
      <KiaOraPopup open={kiaOraOpen} onClose={() => setKiaOraOpen(false)} />
    </>
  );
};

export default MigrationPage;

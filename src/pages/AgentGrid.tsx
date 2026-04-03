/* cache-bust */ import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Send, ArrowRight } from "lucide-react";
import { manaIcon, maharaIcon, kanohiIcon, ihoIcon, pakihiMark } from "@/assets/brand";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PackGrid from "@/components/landing/PackGrid";
import EmbedDemoSection from "@/components/landing/EmbedDemoSection";

const AgentGrid = () => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const packsRef = useRef<HTMLDivElement>(null);

  const scrollToPacks = () => {
    packsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();
    try {
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      }).select("id").single();
      if (error) throw error;

      supabase.functions.invoke("send-contact-email", {
        body: { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
      }).catch((err) => console.error("Contact email error:", err));

      if (inserted?.id) {
        supabase.functions.invoke("qualify-lead", {
          body: { submissionId: inserted.id },
        }).catch((err) => console.error("Lead qualification error:", err));
      }

      toast.success("Message sent! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact form error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl | The Operating System for NZ Business | 42 Specialist AI Agents"
        description="42 specialist AI agents across five industry packs. Quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa. From $89/mo."
        path="/"
      />
      <ParticleField />

      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* ═══════ HERO ═══════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToPacks} />
      </div>

      {/* ═══════ OUTCOME SECTION ═══════ */}
      <section className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              What Assembl does for your business
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto" }}>
              Three outcomes that matter. Everything else follows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                mark: ihoIcon,
                title: "Win work",
                desc: "Faster quotes, sharper proposals, better follow-up. Assembl helps you win more of the work you're already chasing.",
              },
              {
                mark: pakihiMark,
                title: "Run work",
                desc: "Payroll, compliance, scheduling, client comms — the operational grind handled by specialists that know NZ law.",
              },
              {
                mark: manaIcon,
                title: "Stay sharp",
                desc: "Legislation changes, deadline alerts, industry shifts — Assembl keeps you ahead without the reading.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl p-6"
                style={{
                  background: "rgba(15,15,26,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <img src={item.mark} alt="" className="w-6 h-6 mb-3 opacity-70" />
                <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ INDUSTRY PACKS ═══════ */}
      <div ref={packsRef}>
        <PackGrid />
      </div>

      {/* ═══════ WHY ASSEMBL ═══════ */}
      <section className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Why Assembl
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                mark: manaIcon,
                title: "NZ context",
                desc: "Trained on 50+ New Zealand Acts. Employment, health & safety, building, food safety, privacy — your obligations, not American advice.",
              },
              {
                mark: maharaIcon,
                title: "Shared business memory",
                desc: "Every agent shares context about your business. Ask one, and the others already know. No re-explaining.",
              },
              {
                mark: ihoIcon,
                title: "Specialist agents",
                desc: "42 agents, each an expert in their domain. Not a chatbot pretending to know everything — dedicated specialists that go deep.",
              },
              {
                mark: kanohiIcon,
                title: "Multi-channel delivery",
                desc: "Chat, SMS, voice, email, embedded widgets. Your team gets answers wherever they already work.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl p-6"
                style={{
                  background: "rgba(15,15,26,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <img src={item.mark} alt="" className="w-5 h-5 mb-2.5 opacity-70" />
                <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "16px", color: "#FFFFFF", marginBottom: "6px" }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LIVE DEMO ═══════ */}
      <EmbedDemoSection />

      {/* ═══════ LAUNCH SPRINT ═══════ */}
      <section id="launch-sprint" className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Book a Launch Sprint — <span style={{ color: "#D4A843" }}>now open</span>
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto 2rem" }}>
              We map your workflows, design your automation, and deploy your Assembl instance. Early access pricing locked in.
            </p>
          </motion.div>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-xl p-6 text-left"
            style={{
              background: "rgba(15,15,26,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Tell us about your business</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="Industry, team size, biggest pain point..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-300"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                background: "#D4A843",
                border: "1px solid #D4A843",
                color: "#09090F",
                boxShadow: "0 0 20px rgba(212,168,67,0.2)",
              }}
            >
              <Send size={14} /> Book a Launch Sprint
            </button>
          </form>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" className="relative z-10 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.5rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
            Get in touch
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            Enterprise pricing, custom builds, or just to say kia ora.
          </p>
          <p className="mt-3">
            <a href="mailto:assembl@assembl.co.nz" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "#D4A843" }}>
              assembl@assembl.co.nz
            </a>
          </p>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AgentGrid;

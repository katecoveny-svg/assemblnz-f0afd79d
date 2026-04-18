import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import { supabase } from "@/integrations/supabase/client";

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const GOLD = "#D4A843";
const BONE = "#F5F0E8";

const INDUSTRIES = [
  "Manaaki — Hospitality",
  "Waihanga — Construction",
  "Auaha — Creative",
  "Arataki — Automotive",
  "Pikau — Freight & Customs",
  "Family — Whānau (consumer)",
  "Other",
];

const INTERESTS = [
  "Get started",
  "Operator ($590/mo)",
  "Leader ($1,290/mo)",
  "Enterprise ($2,890/mo)",
  "Outcome (bespoke)",
  "Just exploring",
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", business_name: "", email: "", phone: "", industry: "", interest: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await supabase.from("enquiries" as any).insert(form as any);
      // ECHO auto-reply (handles contact_submissions insert + visitor email + admin notification)
      supabase.functions.invoke("echo-respond", {
        body: {
          name: form.name,
          email: form.email,
          business_name: form.business_name,
          industry: form.industry,
          interest: form.interest,
          message: form.message,
          source: "contact-form",
        },
      }).catch(console.error);
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all duration-300";
  const labelClass = "block text-xs font-body text-muted-foreground mb-1.5 tracking-wide";

  return (
    <LightPageShell>
    <div className="min-h-screen flex flex-col">
      <SEO title="Get Started — Assembl" description="Tell us about your business and we'll show you exactly which kete can run your workflows. Zero phone call required." path="/contact" />
      <BrandNav />

      <section className="relative flex-1 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${POUNAMU}08 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 60%, ${GOLD}04 0%, transparent 60%)`,
        }} />

        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
            width: 3 + i, height: 3 + i, background: i % 2 === 0 ? POUNAMU : GOLD,
            left: `${20 + i * 18}%`, top: `${30 + (i % 2) * 25}%`, opacity: 0.1,
          }} animate={{ y: [0, -12, 0], opacity: [0.06, 0.15, 0.06] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }} />
        ))}

        <div className="max-w-xl mx-auto px-5 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[11px] font-display tracking-[5px] uppercase text-center mb-3" style={{ fontWeight: 700, color: POUNAMU }}>
              GET STARTED
            </p>
            <h1 className="text-2xl sm:text-4xl font-display text-center mb-3 text-foreground" style={{ fontWeight: 300 }}>
              Let's talk about your{" "}
              <span style={{ background: `linear-gradient(135deg, #3D4250, ${POUNAMU_LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>business</span>
            </h1>
            <p className="text-sm font-body text-center text-muted-foreground mb-10 max-w-md mx-auto">
              We'll show you how Assembl can automate the work that wastes your time. No phone call required.
            </p>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative p-10 text-center rounded-2xl overflow-hidden" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: `1px solid ${POUNAMU}30`,
                boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 60px ${POUNAMU}08`,
              }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}60, transparent)` }} />
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${POUNAMU}15`, boxShadow: `0 0 30px ${POUNAMU}15` }}>
                  <CheckCircle size={32} style={{ color: POUNAMU_LIGHT }} />
                </div>
                <h2 className="text-lg font-display text-foreground mb-2" style={{ fontWeight: 300 }}>Thanks! We'll contact you within 24 hours.</h2>
                <p className="text-sm font-body text-muted-foreground">We'll be in touch within 24 hours to get you set up.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative rounded-2xl p-6 sm:p-8 space-y-5 overflow-hidden" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: `1px solid rgba(255,255,255,0.06)`,
                boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 60px ${POUNAMU}05, inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}>
                <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}40, transparent)` }} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input required className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = POUNAMU + "60"; e.target.style.boxShadow = `0 0 20px ${POUNAMU}10`; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <div>
                    <label className={labelClass}>Business name *</label>
                    <input required className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      placeholder="Your business" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = POUNAMU + "60"; e.target.style.boxShadow = `0 0 20px ${POUNAMU}10`; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input required type="email" className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      placeholder="you@business.co.nz" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = POUNAMU + "60"; e.target.style.boxShadow = `0 0 20px ${POUNAMU}10`; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      placeholder="021 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = POUNAMU + "60"; e.target.style.boxShadow = `0 0 20px ${POUNAMU}10`; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industry *</label>
                    <select required className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>What are you looking for?</label>
                    <select className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                      value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}>
                      <option value="">Select</option>
                      {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>What are you looking to automate?</label>
                  <textarea rows={4} className={inputClass} style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                    placeholder="Tell us about your business and where manual work drains your team…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = POUNAMU + "60"; e.target.style.boxShadow = `0 0 20px ${POUNAMU}10`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                </div>

                <button type="submit" disabled={sending} className="group relative w-full py-4 rounded-xl text-sm font-body font-medium flex items-center justify-center gap-2 overflow-hidden transition-all">
                  <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${POUNAMU}, #2D6A5E)` }} />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
                  <Send size={16} className="relative z-10 text-foreground" />
                  <span className="relative z-10 text-foreground">{sending ? "Sending…" : "Get started"}</span>
                </button>

                <p className="text-[11px] font-body text-muted-foreground/40 text-center">
                  Or email us directly: <a href="mailto:assembl@assembl.co.nz" className="underline hover:text-muted-foreground/60 transition-colors">assembl@assembl.co.nz</a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
    </LightPageShell>
  );
};

export default ContactPage;

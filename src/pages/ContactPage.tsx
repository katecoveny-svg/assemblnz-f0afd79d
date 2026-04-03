import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { supabase } from "@/integrations/supabase/client";

const INDUSTRIES = [
  "Manaaki — Hospitality, Venues & Tourism",
  "Hanga — Construction & Trade",
  "Auaha — Creative Industries & Media",
  "Pakihi — Finance & Professional Services",
  "Hangarau — Technology & Software",
  "Te Kāhui Reo — Māori Organisations & Cultural Institutions",
  "Tōroa — Family & Whānau",
  "Other",
];

const INTERESTS = [
  "Launch Sprint",
  "Monthly Subscription",
  "Managed AI",
  "Just Exploring",
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
      // Also store in contact_submissions for lead pipeline
      await supabase.from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        message: `[${form.industry}] [${form.interest}] ${form.business_name} — ${form.message}`,
      });
      supabase.functions.invoke("send-contact-email", {
        body: { name: form.name, email: form.email, message: `Launch Sprint enquiry from ${form.business_name} (${form.industry}). Interest: ${form.interest}. ${form.message}` },
      }).catch(console.error);
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm font-body bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--primary))] transition-colors";
  const labelClass = "block text-xs font-body text-muted-foreground mb-1.5 tracking-wide";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Book a Launch Sprint — Assembl" description="Book a free discovery call. We'll map your workflows and show you how Assembl can automate the work that wastes your time." path="/contact" />
      <BrandNav />

      <section className="flex-1 py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[11px] font-display tracking-[5px] uppercase text-center mb-3" style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>
              BOOK A LAUNCH SPRINT
            </p>
            <h1 className="text-2xl sm:text-4xl font-display text-center mb-3 text-foreground" style={{ fontWeight: 300 }}>
              Let's talk about your business
            </h1>
            <p className="text-sm font-body text-center text-muted-foreground mb-10 max-w-md mx-auto">
              We'll show you how Assembl can automate the work that wastes your time. Free 30-minute discovery call.
            </p>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center rounded-2xl">
                <CheckCircle size={48} className="mx-auto mb-4 text-primary" />
                <h2 className="text-lg font-display text-foreground mb-2" style={{ fontWeight: 300 }}>Thanks! We'll contact you within 24 hours.</h2>
                <p className="text-sm font-body text-muted-foreground">We'll schedule your Launch Sprint session and map your workflows.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input required className={inputClass} placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Business name *</label>
                    <input required className={inputClass} placeholder="Your business" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input required type="email" className={inputClass} placeholder="you@business.co.nz" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" className={inputClass} placeholder="021 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industry *</label>
                    <select required className={inputClass} value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>What are you looking for?</label>
                    <select className={inputClass} value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}>
                      <option value="">Select</option>
                      {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>What are you looking to automate?</label>
                  <textarea rows={4} className={inputClass} placeholder="Tell us about your business and where manual work drains your team…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>

                <button type="submit" disabled={sending} className="w-full py-3 rounded-lg text-sm font-body font-medium flex items-center justify-center gap-2 transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  <Send size={16} />
                  {sending ? "Sending…" : "Book My Launch Sprint"}
                </button>

                <p className="text-[11px] font-body text-muted-foreground/40 text-center">
                  Or email us directly: <a href="mailto:assembl@assembl.co.nz" className="underline">assembl@assembl.co.nz</a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default ContactPage;

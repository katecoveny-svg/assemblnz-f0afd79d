import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { assemblMark } from "@/assets/brand";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FOOTER_LINKS = {
  Product: [
    { to: "/content-hub", label: "Strategy Hub" },
    { to: "/pricing", label: "Pricing" },
    { to: "/my-apps", label: "My Apps" },
    { to: "/dashboard", label: "Intelligence" },
    { to: "/embed", label: "Embed Widget" },
  ],
  Industries: [
    { to: "/content-hub", label: "Hospitality" },
    { to: "/content-hub", label: "Tourism" },
    { to: "/content-hub", label: "Construction" },
    { to: "/content-hub", label: "Agriculture" },
    { to: "/content-hub", label: "Retail" },
    { to: "/content-hub", label: "Automotive" },
    { to: "/content-hub", label: "Architecture" },
    { to: "/content-hub", label: "Sales" },
    { to: "/content-hub", label: "Health" },
    { to: "/content-hub", label: "Education" },
    { to: "/content-hub", label: "Property" },
    { to: "/content-hub", label: "Immigration" },
    { to: "/content-hub", label: "Maritime" },
    { to: "/content-hub", label: "Energy" },
    { to: "/content-hub", label: "Government" },
    { to: "/content-hub", label: "Creative" },
  ],
  Company: [
    { to: "/about", label: "About" },
    { to: "/#contact", label: "Contact" },
    { to: "/security", label: "Security" },
    { to: "/brand-guidelines", label: "Brand" },
    { to: "/developers", label: "Developers" },
  ],
  Legal: [
    { to: "/data-privacy", label: "Data Privacy & AI" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
  ],
};

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/assemblnz", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com/assemblnz", icon: "ig" },
  { label: "X", href: "https://x.com/AssemblNZ", icon: "x" },
  { label: "Facebook", href: "https://facebook.com/assemblnz", icon: "fb" },
];

const BADGES = ["NZ Privacy Act 2020", "NZISM Aligned", "SOC 2 Ready", "GDPR Aware"];

const BrandFooter = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const { error: dbError } = await supabase.from("contact_submissions").insert({
        name: "Newsletter Subscriber",
        email: email.trim(),
        message: "Newsletter signup from footer",
      });
      if (dbError) console.error("DB save error:", dbError);

      const { error: fnError } = await supabase.functions.invoke("newsletter-signup", {
        body: { email: email.trim() },
      });
      if (fnError) console.error("Newsletter function error:", fnError);

      toast.success("Subscribed! Welcome to the Assembl whānau.");
      setEmail("");
    } catch (err: any) {
      console.error("Newsletter error:", err);
      toast.error(`Subscription failed: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <footer className="relative py-20 pb-32 sm:pb-20 px-6">
      {/* Aurora top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), rgba(58,125,110,0.3), transparent)" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(212,168,67,0.06), transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top: 4-column links + newsletter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className={category === "Industries" ? "col-span-2 sm:col-span-2 lg:col-span-1" : ""}>
              <h4 className="font-display font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]">{category}</h4>
              <ul className={category === "Industries" ? "grid grid-cols-2 gap-x-4 gap-y-2" : "space-y-2.5"}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[12px] font-body text-muted-foreground hover:text-foreground transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-display font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]">Stay Updated</h4>
            <p className="text-[11px] font-body text-muted-foreground mb-3 leading-relaxed">NZ business insights, product updates, and specialist tips.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.co.nz"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(15,15,26,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.3), 0 0 15px rgba(212,168,67,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.3)";
                }}
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(58,125,110,0.2))",
                  border: "1px solid rgba(212,168,67,0.3)",
                  color: "#D4A843",
                  boxShadow: "0 0 15px rgba(212,168,67,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(212,168,67,0.2)";
                  e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(212,168,67,0.1)";
                  e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)";
                }}
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="text-[9px] font-mono-jb px-3 py-1.5 rounded-full text-muted-foreground/70 transition-all duration-300 hover:text-foreground/80"
              style={{
                background: "rgba(15,15,26,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.25)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(212,168,67,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={assemblMark} alt="Assembl" className="w-7 h-7 object-contain opacity-80 logo-glow group-hover:opacity-100 transition-opacity" />
            <span className="font-display font-bold tracking-[3px] uppercase text-xs text-foreground/80">ASSEMBL</span>
          </Link>

          {/* Social links */}
          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono-jb font-bold text-muted-foreground/60 hover:text-foreground transition-all duration-300"
                style={{
                  background: "rgba(15,15,26,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(212,168,67,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p className="text-[10px] font-body text-muted-foreground/60 text-center sm:text-right">
            © 2026 Assembl. All rights reserved. Auckland, New Zealand.
          </p>
        </div>

        <p className="text-[9px] mt-4 text-center font-body text-muted-foreground/30 leading-relaxed">
          Business intelligence for NZ, built in Aotearoa. Our tools provide guidance — always check with a qualified professional before making big decisions. assembl@assembl.co.nz · www.assembl.co.nz · From $89/mo
        </p>
        <p className="text-[9px] mt-2 text-center font-body text-muted-foreground/30 leading-relaxed">
          Assembl uses AI to provide business guidance. Our AI agents follow the MBIE Responsible AI Guidance for Businesses. AI outputs should be verified by qualified professionals before reliance.
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

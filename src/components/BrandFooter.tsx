import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import nexusLogo from "@/assets/nexus-logo.png";
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
    { to: "/agents/hospitality", label: "Hospitality" },
    { to: "/agents/construction", label: "Construction" },
    { to: "/agents/property", label: "Property" },
    { to: "/agents/automotive", label: "Automotive" },
    { to: "/agents/finance", label: "Finance" },
    { to: "/agents/maritime", label: "Maritime" },
  ],
  Company: [
    { to: "/about", label: "About" },
    { to: "/#contact", label: "Contact" },
    { to: "/security", label: "Security" },
    { to: "/mariner", label: "Mariner" },
  ],
  Legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
  ],
};

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/assemblnz", icon: "in" },
  { label: "Instagram", href: "https://instagram.com/assemblnz", icon: "ig" },
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
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--indigo) / 0.2), transparent)' }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.04), transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top: 4-column links + newsletter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-syne font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[12px] font-inter text-muted-foreground hover:text-foreground transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-syne font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]">Stay Updated</h4>
            <p className="text-[11px] font-inter text-muted-foreground mb-3 leading-relaxed">NZ business insights, product updates, and specialist tips.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.co.nz"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-inter text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                style={{
                  background: 'hsl(var(--surface-2) / 0.5)',
                  border: '1px solid hsl(var(--border) / 0.5)',
                }}
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
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
              className="text-[9px] font-mono-jb px-3 py-1.5 rounded-full text-muted-foreground/70"
              style={{
                background: 'hsl(var(--surface-1) / 0.5)',
                border: '1px solid hsl(var(--border) / 0.4)',
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--border)), transparent)' }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={nexusLogo} alt="Assembl" className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="font-syne font-bold tracking-[3px] uppercase text-xs text-foreground/80">ASSEMBL</span>
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
                  background: 'hsl(var(--surface-2) / 0.4)',
                  border: '1px solid hsl(var(--border) / 0.4)',
                }}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p className="text-[10px] font-inter text-muted-foreground/60 text-center sm:text-right">
            © 2026 Assembl. All rights reserved. Auckland, New Zealand.
          </p>
        </div>

        <p className="text-[9px] mt-4 text-center font-inter text-muted-foreground/30 leading-relaxed">
          Business intelligence platform for NZ. Built in Aotearoa. Content is guidance, not professional advice. Always consult qualified professionals. assembl@assembl.co.nz · www.assembl.co.nz · From $89/mo
        </p>
        <p className="text-[9px] mt-2 text-center font-inter text-muted-foreground/30 leading-relaxed">
          Assembl uses AI to provide business guidance. Our AI agents follow the MBIE Responsible AI Guidance for Businesses. AI outputs should be verified by qualified professionals before reliance.
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

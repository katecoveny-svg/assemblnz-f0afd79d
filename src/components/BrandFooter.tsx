import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import nexusLogo from "@/assets/nexus-logo.png";
import { toast } from "sonner";

const FOOTER_LINKS = {
  Product: [
    { to: "/content-hub", label: "Content Hub" },
    { to: "/pricing", label: "Pricing" },
    { to: "/my-apps", label: "My Apps" },
    { to: "/dashboard", label: "Dashboard" },
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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed! Welcome to the Assembl whānau.");
    setEmail("");
  };

  return (
    <footer className="relative py-16 pb-28 sm:pb-16 px-6 border-t border-border" style={{ background: "hsl(var(--background))" }}>
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Top: 4-column links + newsletter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-syne font-bold text-xs text-foreground mb-3 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[11px] font-jakarta text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-syne font-bold text-xs text-foreground mb-3 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-[10px] font-jakarta text-muted-foreground mb-3">NZ AI insights, product updates, and agent tips.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.co.nz"
                className="flex-1 px-3 py-2 rounded-lg text-xs border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="text-[9px] font-mono-jb px-2.5 py-1 rounded-full border border-border text-muted-foreground bg-card"
            >
              ✓ {badge}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        {/* Bottom: logo, social, copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={nexusLogo} alt="Assembl" className="w-7 h-7 object-contain" />
            <span className="font-syne font-bold tracking-[3px] uppercase text-xs text-foreground">ASSEMBL</span>
          </Link>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-[10px] font-mono-jb font-bold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p className="text-[10px] font-jakarta text-muted-foreground text-center sm:text-right">
            © 2026 Assembl. All rights reserved. Auckland, New Zealand 🇳🇿
          </p>
        </div>

        <p className="text-[9px] mt-3 text-center font-jakarta" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>
          AI-generated content is not professional advice. Always consult qualified NZ professionals. assembl@assembl.co.nz
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

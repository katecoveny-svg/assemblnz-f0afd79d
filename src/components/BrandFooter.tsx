import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import nexusLogo from "@/assets/nexus-logo.png";
import { ArrowRight, Shield, Lock, FileCheck } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { to: "/pricing", label: "Pricing" },
    { to: "/#agents", label: "All 42 Agents" },
    { to: "/content-hub", label: "Content Hub" },
    { to: "/embed", label: "Embed Widget" },
    { to: "/about", label: "Business Plan" },
  ],
  Industries: [
    { to: "/chat/construction", label: "Construction" },
    { to: "/chat/hospitality", label: "Hospitality" },
    { to: "/chat/property", label: "Property" },
    { to: "/chat/accounting", label: "Accounting" },
    { to: "/chat/legal", label: "Legal" },
    { to: "/mariner", label: "Maritime" },
  ],
  Company: [
    { to: "/about", label: "About Assembl" },
    { to: "/#contact", label: "Contact" },
    { to: "/security", label: "Security" },
    { to: "/content-hub", label: "Resources" },
  ],
  Legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
  ],
};

const COMPLIANCE_BADGES = [
  { icon: Shield, label: "Privacy Act 2020" },
  { icon: Lock, label: "Encrypted at Rest" },
  { icon: FileCheck, label: "GDPR Ready" },
];

const BrandFooter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: "Newsletter signup",
        email: email.trim(),
        message: "Newsletter subscription",
      });
      if (error) throw error;
      toast.success("Subscribed! Welcome to Assembl.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <footer
      className="py-14 pb-24 sm:pb-14 px-6 border-t"
      style={{
        background: "hsl(var(--background))",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top section: Logo + Newsletter */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-3 group mb-3">
              <img src={nexusLogo} alt="Assembl" className="w-8 h-8 object-contain" />
              <span className="font-syne font-bold tracking-[3px] uppercase text-sm text-foreground">
                ASSEMBL
              </span>
            </Link>
            <p className="text-xs font-jakarta text-muted-foreground max-w-xs leading-relaxed">
              The first AI operating system built for New Zealand business.
              42 agents trained on NZ legislation.
            </p>
          </div>

          {/* Newsletter signup */}
          <div className="w-full sm:w-auto">
            <p className="text-xs font-syne font-bold text-foreground mb-2">Stay in the loop</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.co.nz"
                required
                className="px-4 py-2 rounded-lg text-xs font-jakarta border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-48 sm:w-56"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-syne font-bold bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all disabled:opacity-50"
              >
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-mono-jb text-muted-foreground/60 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs font-jakarta text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {COMPLIANCE_BADGES.map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1.5 text-[10px] font-mono-jb px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#71717A",
              }}
            >
              <badge.icon size={10} />
              {badge.label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.15), rgba(0,229,255,0.15), transparent)",
          }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-jakarta text-muted-foreground">
            © 2026 Assembl. All rights reserved. Proudly built in Auckland, New Zealand.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/assemblnz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-jakarta text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/AssemblNZ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-jakarta text-muted-foreground hover:text-foreground transition-colors"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;

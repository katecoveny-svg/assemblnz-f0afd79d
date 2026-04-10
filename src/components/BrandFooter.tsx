import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CelestialLogo from "@/components/CelestialLogo";

const FOOTER_LINKS = {
  Platform: [
    { to: "/#how-it-works", label: "How it works" },
    { to: "/#industry-packs", label: "Industry kete" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ],
  "Industry Kete": [
    { to: "/packs/manaaki", label: "Manaaki — Hospitality" },
    { to: "/waihanga", label: "Waihanga — Construction" },
    { to: "/auaha", label: "Auaha — Creative" },
    { to: "/kete/arataki", label: "Arataki — Automotive" },
    { to: "/pikau", label: "Pikau — Freight & Customs" },
  ],
  Products: [
    { to: "/toroa", label: "Toro — Family Navigator" },
    { to: "/how-it-works", label: "Six-layer agent stack" },
    { to: "/developers", label: "Developers" },
    { to: "/brand-assets", label: "Brand Assets" },
  ],
  Legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/data-privacy", label: "Data Privacy & Legal" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
  ],
};

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/assemblnz", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com/assemblnz", icon: "ig" },
  { label: "X", href: "https://x.com/assemblNZ", icon: "x" },
  { label: "Facebook", href: "https://facebook.com/assemblnz", icon: "fb" },
];

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (to.startsWith("/#")) {
      e.preventDefault();
      const hash = to.slice(1);
      if (location.pathname === "/") {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/" + hash);
      }
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className="text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1 group/link"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {children}
      <ArrowUpRight size={9} className="opacity-0 group-hover/link:opacity-60 transition-opacity -translate-y-px" />
    </Link>
  );
};

const BrandFooter = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await supabase.from("contact_submissions").insert({
        name: "Newsletter Subscriber",
        email: email.trim(),
        message: "Newsletter signup from footer",
      });
      await supabase.functions.invoke("newsletter-signup", { body: { email: email.trim() } });
      toast.success("Subscribed! Welcome to the assembl whānau.");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="relative py-20 pb-32 sm:pb-20 px-6 overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Liquid glass background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, hsl(160 60% 50%) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsla(160, 50%, 50%, 0.25), hsla(42, 63%, 55%, 0.2), transparent)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Tagline in liquid glass pill */}
        <div className="flex justify-center mb-14">
          <div
            className="px-6 py-2.5 rounded-full text-sm"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "hsl(var(--muted-foreground))",
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            5 industry kete · Governed operational intelligence · Built in Aotearoa
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]"
                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink to={link.to}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter — liquid glass card */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <h4
                className="text-[11px] text-foreground/80 mb-2 uppercase tracking-[2px]"
                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
              >
                Stay Updated
              </h4>
              <p
                className="text-[11px] text-muted-foreground mb-3 leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                NZ business insights, compliance updates, and product news.
              </p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.co.nz"
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(47,203,137,0.15) 0%, rgba(47,203,137,0.08) 100%)",
                    border: "1px solid rgba(47,203,137,0.25)",
                    color: "hsl(160 60% 50%)",
                    boxShadow: "0 0 12px rgba(47,203,137,0.1)",
                  }}
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider — gradient line */}
        <div
          className="h-px mb-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), rgba(47,203,137,0.08), rgba(255,255,255,0.06), transparent)" }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <CelestialLogo size={28} />
            <span
              className="tracking-[3px] uppercase text-xs text-foreground/80"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
            >
              assembl
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p
            className="text-[10px] text-muted-foreground/60 text-center sm:text-right"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            © 2026 assembl. All rights reserved. Auckland, New Zealand.
          </p>
        </div>

        <p
          className="text-[9px] mt-6 text-center text-muted-foreground/30 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          assembl provides governed, simulation-tested operational intelligence for NZ business. Outputs should be verified by qualified professionals before reliance. assembl@assembl.co.nz · www.assembl.co.nz
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

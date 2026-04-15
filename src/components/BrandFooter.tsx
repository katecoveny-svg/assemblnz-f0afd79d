import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import WovenDivider from "@/components/whariki/WovenDivider";

const FOOTER_LINKS = {
  Platform: [
    { to: "/#industry-packs", label: "Your industry" },
    { to: "/pricing", label: "Pricing" },
    { to: "/how-it-works", label: "How it works" },
    { to: "/contact", label: "Contact" },
  ],
  Demos: [
    { to: "/demos", label: "Demo hub" },
    { to: "/demos/pipeline", label: "Five-stage pipeline" },
    { to: "/demos/evidence-pack", label: "Evidence pack" },
    { to: "/demos/confidence-scoring", label: "Confidence scoring" },
    { to: "/demos/kaitiaki-gate", label: "Kaitiaki gate" },
  ],
  "Industry Kete": [
    { to: "/manaaki", label: "Manaaki — Hospitality" },
    { to: "/waihanga/about", label: "Waihanga — Construction" },
    { to: "/auaha/about", label: "Auaha — Creative" },
    { to: "/arataki", label: "Arataki — Automotive" },
    { to: "/pikau", label: "Pikau — Freight" },
    { to: "/toro", label: "Toro — Family" },
  ],
  "Trust & Compliance": [
    { to: "/data-sovereignty", label: "Data Sovereignty" },
    { to: "/security", label: "Security" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/data-privacy", label: "Data Privacy" },
  ],
};

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
    <Link to={to} onClick={handleClick}
      className="text-[12px] hover:text-foreground transition-colors duration-300 flex items-center gap-1 group/link"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.45)" }}>
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
      toast.success("Subscribed! Welcome to the assembl whānau.");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="relative py-20 px-4 sm:px-6 overflow-hidden" style={{ background: "#0A1628" }}>
      {/* Dense whāriki weave pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(58,125,110,0.06) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(58,125,110,0.06) 1px, transparent 1px),
          linear-gradient(45deg, rgba(212,168,83,0.03) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(212,168,83,0.03) 1px, transparent 1px)`,
        backgroundSize: "24px 24px, 24px 24px, 48px 48px, 48px 48px",
      }} />

      {/* Top accent — woven divider */}
      <div className="absolute top-0 left-0 right-0">
        <WovenDivider />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Wordmark + tagline */}
        <div className="text-center mb-14">
          <h2 className="text-xl sm:text-2xl tracking-[8px] uppercase mb-4"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(245,240,232,0.8)" }}>
            ASSEMBL
          </h2>
          <p className="text-lg sm:text-xl"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(245,240,232,0.7)" }}>
            Trusted. Intelligent. Aotearoa.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[11px] mb-4 uppercase tracking-[2px]"
                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: "rgba(245,240,232,0.6)" }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}><FooterLink to={link.to}>{link.label}</FooterLink></li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] mb-4 uppercase tracking-[2px]"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: "rgba(245,240,232,0.6)" }}>
              Stay Updated
            </h4>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.co.nz" required
                className="flex-1 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(58,125,110,0.15)",
                  color: "rgba(245,240,232,0.8)",
                }} />
              <button type="submit" className="px-3 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
                style={{ background: "rgba(58,125,110,0.15)", border: "1px solid rgba(58,125,110,0.25)", color: "#3A7D6E" }}>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        <WovenDivider className="mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[10px]" style={{ color: "rgba(245,240,232,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            © 2026 Assembl · assembl.co.nz
          </p>
          <p className="text-[9px] max-w-md" style={{ color: "rgba(245,240,232,0.25)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Governed intelligence for Aotearoa — specialist kete for real NZ operations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;

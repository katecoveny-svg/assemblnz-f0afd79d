import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send, ArrowUpRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FOOTER_LINKS = {
  Platform: [
    { to: "/#industry-packs", label: "Your industry" },
    { to: "/showcase", label: "Showcase" },
    { to: "/pricing", label: "Pricing" },
    { to: "/how-it-works", label: "How it works" },
    { to: "/migration", label: "Migration" },
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
    { to: "/status", label: "Live status" },
    { to: "/evidence", label: "Evidence packs" },
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
      className="text-[12px] transition-colors duration-300 flex items-center gap-1 group/link"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
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
      // ECHO sends a personalised welcome reply
      supabase.functions.invoke("echo-respond", {
        body: {
          name: "there",
          email: email.trim(),
          message: "Newsletter signup from footer — please send a brief welcome and overview of what to expect.",
          source: "newsletter-footer",
        },
      }).catch(console.error);
      toast.success("Subscribed! Echo will send you a welcome shortly.");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="relative py-24 px-4 sm:px-6" style={{ background: "#FAFBFC" }}>
      {/* Top divider */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(74,165,168,0.15), transparent)",
      }} />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Wordmark */}
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl tracking-[8px] uppercase mb-4"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250" }}>
            ASSEMBL
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#6B7280" }}>
            One governed intelligence layer for every NZ business — from the café to the construction site to the customs house.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-16">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[11px] mb-4 uppercase tracking-[2px]"
                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 500, color: "#3D4250" }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}><FooterLink to={link.to}>{link.label}</FooterLink></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="max-w-md mx-auto mb-16">
          <h4 className="text-[11px] mb-4 uppercase tracking-[2px] text-center"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 500, color: "#3D4250" }}>
            Stay Updated
          </h4>
          <form onSubmit={handleNewsletter} className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.co.nz" required
              className="flex-1 px-4 py-3 rounded-full text-sm focus:outline-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(74,165,168,0.15)",
                color: "#3D4250",
              }} />
            <button type="submit" className="px-5 py-3 rounded-full transition-all duration-300 hover:scale-105"
              style={{ background: "#4AA5A8", color: "#FFFFFF" }}>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: "linear-gradient(90deg, transparent, rgba(74,165,168,0.12), transparent)" }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px]" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            © 2026 Assembl · assembl.co.nz
          </p>
          <p className="text-[10px] max-w-md" style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Governed intelligence for Aotearoa — specialist kete for real NZ operations.
          </p>
          <Link
            to="/admin"
            aria-label="Admin"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(74,165,168,0.2)",
              color: "#4AA5A8",
            }}
          >
            <Shield size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;

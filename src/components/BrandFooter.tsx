import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send, ArrowUpRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* ─── Pearl brand tokens (single source of truth) ─── */
/* Warm Pearl + Forest Ink — never black, never cool blue-white. */
const PEARL = {
  bg: "#FAF6EF",      // Warm Pearl canvas
  ink: "#0F2A26",     // Forest Ink
  pounamu: "#1F4D47",
  muted: "#7A8B82",
  opal: "#E8EEEC",
  bodyInk: "rgba(15,42,38,0.72)",
};

const FOOTER_LINKS = {
  Platform: [
    { to: "/#ketes", label: "Your industry" },
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
  "Ketes": [
    { to: "/manaaki", label: "Manaaki — Hospitality" },
    { to: "/waihanga/about", label: "Waihanga — Construction" },
    { to: "/auaha/about", label: "Auaha — Creative" },
    { to: "/arataki", label: "Arataki — Automotive & Fleet" },
    { to: "/pikau", label: "Pikau — Freight & Customs" },
    { to: "/hoko", label: "Hoko — Retail" },
    { to: "/ako", label: "Ako — Early Childhood Education" },
    { to: "/toro", label: "Tōro — Family" },
    { to: "/platform", label: "Platform — Business / Tech / Pro Services" },
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
    <Link
      to={to}
      onClick={handleClick}
      className="transition-colors duration-300 flex items-center gap-1 group/link"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: PEARL.bodyInk,
        fontWeight: 400,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = PEARL.pounamu)}
      onMouseLeave={(e) => (e.currentTarget.style.color = PEARL.bodyInk)}
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
    <footer className="relative py-24 px-4 sm:px-6" style={{ background: "transparent" }}>
      {/* Top hairline — sea glass tone */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${PEARL.opal}, transparent)` }}
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Wordmark */}
        <div className="text-center mb-16">
          <h2
            className="mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(36px, 4vw, 52px)",
              letterSpacing: "0.02em",
              textTransform: "lowercase",
              color: PEARL.ink,
              lineHeight: 1.1,
            }}
          >
            assembl
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(18px, 1.5vw, 22px)",
              lineHeight: 1.45,
              color: PEARL.pounamu,
            }}
          >
            Premium intelligence with a human heart.
          </p>
          <p
            className="mt-4 max-w-xl mx-auto"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              lineHeight: 1.6,
              color: PEARL.bodyInk,
              fontWeight: 400,
            }}
          >
            Intelligent tools for every New Zealand business — from the dairy owner in Timaru to the customs broker on the Auckland waterfront.
          </p>
          <p
            className="mt-4 lowercase"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: PEARL.muted,
              fontWeight: 500,
            }}
          >
            from $29 / month · grounded in nz legislation · evidence packs, not chat
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-16">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                className="mb-5 lowercase"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: PEARL.muted,
                  fontWeight: 500,
                }}
              >
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
          <h4
            className="mb-4 text-center lowercase"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: PEARL.muted,
              fontWeight: 500,
            }}
          >
            stay updated
          </h4>
          <form onSubmit={handleNewsletter} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.co.nz"
              required
              className="flex-1 px-5 py-3 rounded-full focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${PEARL.opal}`,
                color: PEARL.ink,
              }}
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-full transition-all duration-300 hover:-translate-y-px"
              style={{
                background: PEARL.pounamu,
                color: PEARL.bg,
                boxShadow: "0 10px 30px -12px rgba(31,77,71,0.45)",
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{ background: `linear-gradient(90deg, transparent, ${PEARL.opal}, transparent)` }}
        />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: PEARL.muted }}>
            © 2026 Assembl · assembl.co.nz
          </p>
          <p
            className="max-w-md"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 14,
              color: PEARL.bodyInk,
            }}
          >
            Built in Aotearoa, for Aotearoa — accessible to every NZ business.
          </p>
          <Link
            to="/admin"
            aria-label="Admin"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:-translate-y-px"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${PEARL.opal}`,
              color: PEARL.pounamu,
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

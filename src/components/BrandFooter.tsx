import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CelestialLogo from "@/components/CelestialLogo";

const FOOTER_LINKS = {
  Platform: [
    { to: "/#how-it-works", label: "How it works" },
    { to: "/#kete", label: "Explore kete" },
    { to: "/#try-assembl", label: "Try it" },
  ],
  "Industry Packs": [
    { to: "/manaaki", label: "Manaaki — Hospitality" },
    { to: "/hanga", label: "Hanga — Construction" },
    { to: "/auaha", label: "Auaha — Creative" },
    { to: "/pakihi", label: "Pakihi — Business Ops" },
    { to: "/hangarau", label: "Hangarau — Technology" },
  ],
  Company: [
    { to: "/#pricing", label: "Pricing" },
    { to: "/pricing", label: "Start free trial" },
    { to: "/about", label: "About" },
    { to: "/#contact", label: "Contact" },
  ],
  Legal: [
    { to: "/privacy", label: "Privacy" },
    { to: "/terms", label: "Terms" },
    { to: "/toroa", label: "Tōroa" },
  ],
};

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/assemblnz", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com/assemblnz", icon: "ig" },
  { label: "X", href: "https://x.com/AssemblNZ", icon: "x" },
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
    <Link to={to} onClick={handleClick} className="text-[12px] font-body text-muted-foreground hover:text-foreground transition-colors duration-300">
      {children}
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
      toast.success("Subscribed! Welcome to the Assembl whānau.");
      setEmail("");
    } catch (err: any) {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="relative py-20 pb-32 sm:pb-20 px-6" style={{ background: "#0F1623" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.3), rgba(58,125,110,0.2), transparent)" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <p className="text-center mb-14 text-sm font-body" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Built in Aotearoa. Designed for trust. Ready to work.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]" style={{ fontFamily: "'Lato', sans-serif" }}>{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink to={link.to}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-bold text-[11px] text-foreground/80 mb-4 uppercase tracking-[2px]" style={{ fontFamily: "'Lato', sans-serif" }}>Stay Updated</h4>
            <p className="text-[11px] font-body text-muted-foreground mb-3 leading-relaxed">NZ business insights and product updates.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.co.nz"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.08)" }} required />
              <button type="submit" className="px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.3)", color: "#D4A843" }}>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 font-serif">
          <Link to="/" className="flex items-center gap-2.5 group">
            <CelestialLogo size={28} />
            <span className="tracking-[3px] uppercase text-xs text-foreground/80" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>ASSEMBL</span>
          </Link>
          <div className="flex items-center gap-2.5 font-serif">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors"
                style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
                title={s.label}>{s.icon}</a>
            ))}
          </div>
          <p className="text-[10px] font-body text-muted-foreground/60 text-center sm:text-right">
            © 2026 Assembl. All rights reserved. Auckland, New Zealand.
          </p>
        </div>

        <p className="text-[9px] mt-6 text-center font-body text-muted-foreground/30 leading-relaxed max-w-2xl mx-auto">
          Assembl provides automated business guidance. Outputs should be verified by qualified professionals before reliance. assembl@assembl.co.nz · www.assembl.co.nz
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

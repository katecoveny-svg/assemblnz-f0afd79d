import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-logo.png";

const BrandFooter = () => {
  return (
    <footer
      className="border-t border-white/[0.06] py-10 px-6"
      style={{
        background: 'rgba(14, 14, 26, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-3 group mb-2">
            <img
              src={nexusLogo}
              alt="Assembl"
              className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.25)]"
            />
            <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm text-foreground group-hover:text-primary transition-colors">
              ASSEMBL
            </span>
          </Link>
          <p className="text-[11px] font-jakarta text-white/25">AI workforce for New Zealand</p>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-4">
          {[
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/terms", label: "Terms of Use" },
            { to: "/cookies", label: "Cookie Policy" },
            { to: "/disclaimer", label: "Disclaimer" },
            { to: "/security", label: "Security" },
            { to: "/pricing", label: "Pricing" },
          ].map((link, i, arr) => (
            <span key={link.to} className="flex items-center gap-4">
              <Link to={link.to} className="text-[10px] font-jakarta text-white/25 hover:text-primary/60 transition-colors duration-300">{link.label}</Link>
              {i < arr.length - 1 && <span className="text-[10px] text-white/10">·</span>}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-center font-jakarta text-white/25">
          © 2026 Assembl. All rights reserved. · Auckland, New Zealand · Built in Aotearoa 🇳🇿
        </p>
        <p className="text-[10px] mt-1.5 text-center font-jakarta text-white/15">
          Agent designs, system prompts, and automation workflows are proprietary trade secrets of Assembl.
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

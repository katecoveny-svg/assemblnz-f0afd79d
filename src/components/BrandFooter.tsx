import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-logo.png";

const BrandFooter = () => {
  return (
    <footer
      className="py-10 px-6 border-t border-border"
      style={{
        background: 'hsl(225 25% 4% / 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-3 group mb-2">
            <img src={nexusLogo} alt="Assembl" className="w-8 h-8 object-contain" />
            <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm text-foreground">
              ASSEMBL
            </span>
          </Link>
          <p className="text-[11px] font-jakarta text-muted-foreground">Built for NZ Business</p>
        </div>

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
              <Link to={link.to} className="text-[10px] font-jakarta text-muted-foreground hover:text-foreground transition-colors duration-300">{link.label}</Link>
              {i < arr.length - 1 && <span className="text-[10px] text-border">·</span>}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-center font-jakarta text-muted-foreground">
          © 2026 Assembl. All rights reserved. · Auckland, New Zealand · Built in Aotearoa
        </p>
        <p className="text-[10px] mt-1.5 text-center font-jakarta" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
          Agent designs, system prompts, and automation workflows are proprietary trade secrets of Assembl.
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;

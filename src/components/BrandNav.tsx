import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-logo.png";
import AccountDropdown from "@/components/AccountDropdown";

const NAV_LINKS = [
  { to: "/", label: "Agents" },
  { to: "/content-hub", label: "Content Hub" },
  { to: "/pricing", label: "Pricing" },
  { to: "/embed", label: "Embed" },
  { to: "/dashboard", label: "Dashboard" },
];

const BrandNav = () => {
  return (
    <header
      className="relative z-50 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border"
      style={{
        background: 'hsl(225 25% 4% / 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <img src={nexusLogo} alt="Assembl" className="w-10 h-10 object-contain" />
        <div className="flex items-baseline gap-1">
          <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm text-foreground">ASSEMBL</span>
          <span className="font-mono-jb text-[11px] hidden sm:inline text-muted-foreground">.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-5 text-xs font-jakarta">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
        <AccountDropdown />
      </nav>

      {/* Mobile: just account dropdown, nav is in bottom tab bar */}
      <div className="flex sm:hidden items-center">
        <AccountDropdown />
      </div>
    </header>
  );
};

export default BrandNav;

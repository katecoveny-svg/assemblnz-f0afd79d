import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.png";
import AccountDropdown from "@/components/AccountDropdown";

const NAV_LINKS = [
  { to: "/#expert-team", label: "Specialist Tools" },
  { to: "/content-hub", label: "Strategy Hub" },
  { to: "/pricing", label: "Pricing" },
  { to: "/embed", label: "Embed" },
  { to: "/dashboard", label: "Business Intelligence" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
        <motion.img
          src={nexusLogo}
          alt="Assembl"
          className="w-10 h-10 object-contain"
          animate={{
            filter: [
              'drop-shadow(0 0 4px hsla(160,84%,50%,0.2))',
              'drop-shadow(0 0 12px hsla(160,84%,50%,0.4)) drop-shadow(0 0 24px hsla(189,100%,50%,0.15))',
              'drop-shadow(0 0 4px hsla(160,84%,50%,0.2))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex items-baseline gap-1">
          <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm text-foreground">ASSEMBL</span>
          <span className="font-mono-jb text-[11px] hidden sm:inline text-muted-foreground">.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-5 text-xs font-jakarta">
        {NAV_LINKS.map((link) => {
          const isHash = link.to.includes("#");
          const handleClick = isHash
            ? (e: React.MouseEvent) => {
                e.preventDefault();
                const hash = link.to.split("#")[1];
                const basePath = link.to.split("#")[0] || "/";
                if (location.pathname === basePath) {
                  document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate(basePath);
                  setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
                }
              }
            : undefined;
          return (
            <Link
              key={link.to}
              to={isHash ? "#" : link.to}
              onClick={handleClick}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </Link>
          );
        })}
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

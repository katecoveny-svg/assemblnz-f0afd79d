import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AccountDropdown from "@/components/AccountDropdown";
import NotificationBell from "@/components/NotificationBell";

const NAV_LINKS = [
  { to: "/#expert-team", label: "Specialist Tools" },
  { to: "/content-hub", label: "Strategy Hub" },
  { to: "/pricing", label: "Pricing" },
  { to: "/embed", label: "Embed" },
  { to: "/dashboard", label: "Intelligence" },
  { to: "/invest", label: "Invest" },
  { to: "/brand-guidelines", label: "Brand" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-3 px-5 sm:px-8 py-3.5"
      style={{
        background: 'rgba(9,9,15,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <motion.svg
          width="36" height="36" viewBox="0 0 36 36" fill="none"
          animate={{
            filter: [
              'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
              'drop-shadow(0 0 14px rgba(212,168,67,0.9)) drop-shadow(0 0 28px rgba(58,125,110,0.2))',
              'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <radialGradient id="bn-g" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#F0D078"/><stop offset="50%" stopColor="#D4A843"/><stop offset="100%" stopColor="#8B6020"/>
            </radialGradient>
            <radialGradient id="bn-p" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#7ACFC2"/><stop offset="50%" stopColor="#3A7D6E"/><stop offset="100%" stopColor="#1E5044"/>
            </radialGradient>
            <radialGradient id="bn-pl" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#5AADA0"/><stop offset="50%" stopColor="#2E6B5E"/><stop offset="100%" stopColor="#153D35"/>
            </radialGradient>
            <radialGradient id="bn-hi" cx="35%" cy="30%" r="28%">
              <stop offset="0%" stopColor="white" stopOpacity="0.65"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="bn-l" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.6"/><stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.55"/>
            </linearGradient>
          </defs>
          <line x1="18" y1="8" x2="8" y2="26" stroke="url(#bn-l)" strokeWidth="1.2"/>
          <line x1="18" y1="8" x2="28" y2="26" stroke="url(#bn-l)" strokeWidth="1.2"/>
          <line x1="8" y1="26" x2="28" y2="26" stroke="url(#bn-l)" strokeWidth="1.2"/>
          <circle cx="18" cy="8" r="4.5" fill="url(#bn-g)"/><circle cx="18" cy="8" r="4.5" fill="url(#bn-hi)"/>
          <circle cx="8" cy="26" r="4.5" fill="url(#bn-p)"/><circle cx="8" cy="26" r="4.5" fill="url(#bn-hi)"/>
          <circle cx="28" cy="26" r="4.5" fill="url(#bn-pl)"/><circle cx="28" cy="26" r="4.5" fill="url(#bn-hi)"/>
        </motion.svg>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #D4A843 72%, #3A7D6E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ASSEMBL</span>
          <span className="font-mono text-[10px] hidden sm:inline text-white/35">.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-6 text-[13px]">
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
              className="font-body font-medium text-white/65 hover:text-foreground transition-colors duration-250 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300" />
            </Link>
          );
        })}
        <NotificationBell />
        <AccountDropdown />
      </nav>

      {/* Mobile */}
      <div className="flex sm:hidden items-center gap-1">
        <NotificationBell />
        <AccountDropdown />
      </div>
    </header>
  );
};

export default BrandNav;

import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.png";
import AccountDropdown from "@/components/AccountDropdown";

const NAV_LINKS = [
  { to: "/#expert-team", label: "Specialist Tools" },
  { to: "/content-hub", label: "Strategy Hub" },
  { to: "/pricing", label: "Pricing" },
  { to: "/embed", label: "Embed" },
  { to: "/dashboard", label: "Intelligence" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-3 px-5 sm:px-8 py-3.5"
      style={{
        background: 'hsl(228 14% 4% / 0.7)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid hsl(228 10% 13% / 0.5)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <motion.img
          src={nexusLogo}
          alt="Assembl"
          className="w-9 h-9 object-contain"
          animate={{
            filter: [
              'drop-shadow(0 0 6px hsla(160,84%,50%,0.15))',
              'drop-shadow(0 0 16px hsla(160,84%,50%,0.35)) drop-shadow(0 0 32px hsla(189,100%,50%,0.12))',
              'drop-shadow(0 0 6px hsla(160,84%,50%,0.15))',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex items-baseline gap-1.5">
          <span className="font-syne font-bold tracking-[4px] uppercase text-[13px] text-foreground">ASSEMBL</span>
          <span className="font-mono-jb text-[10px] hidden sm:inline text-muted-foreground/60">.co.nz</span>
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
              className="font-inter font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300" />
            </Link>
          );
        })}
        <AccountDropdown />
      </nav>

      {/* Mobile */}
      <div className="flex sm:hidden items-center">
        <AccountDropdown />
      </div>
    </header>
  );
};

export default BrandNav;

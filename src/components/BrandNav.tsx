import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import NotificationBell from "@/components/NotificationBell";
import { assemblMark } from "@/assets/brand";

const NAV_LINKS = [
  { to: "/content-hub", label: "Specialist Tools" },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
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
          <motion.img
            src={assemblMark}
            alt="Assembl"
            className="w-9 h-9 object-contain"
            animate={{
              filter: [
                'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
                'drop-shadow(0 0 14px rgba(212,168,67,0.9)) drop-shadow(0 0 28px rgba(58,125,110,0.2))',
                'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #D4A843 72%, #3A7D6E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ASSEMBL</span>
            <span className="font-mono text-[10px] hidden sm:inline text-white/35">.co.nz</span>
          </div>
        </Link>
        <div className="flex-1" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-[13px]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="font-body font-medium text-white/65 hover:text-foreground transition-colors duration-250 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <NotificationBell />
          <AccountDropdown />
        </nav>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-[280px] flex flex-col"
              style={{
                background: "#0D0D15",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Close */}
              <div className="flex items-center justify-between px-5 py-4">
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "3px", color: "#D4A843" }}>MENU</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.6)" }} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_LINKS.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                      style={{
                        color: active ? "#D4A843" : "rgba(255,255,255,0.7)",
                        background: active ? "rgba(212,168,67,0.08)" : "transparent",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Account at bottom */}
              <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <AccountDropdown />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandNav;

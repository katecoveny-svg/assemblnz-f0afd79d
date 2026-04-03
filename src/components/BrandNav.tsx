import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import CelestialLogo from "@/components/CelestialLogo";

interface NavItem { label: string; to: string }

const NAV_ITEMS: NavItem[] = [
  { label: "How it works", to: "/#how-it-works" },
  { label: "Industry Packs", to: "/#industry-packs" },
  { label: "Pricing", to: "/pricing" },
  { label: "Hanga", to: "/hanga" },
  { label: "Manaaki", to: "/chat/aura" },
  { label: "Pakihi", to: "/chat/aroha" },
  { label: "Contact", to: "/#contact" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    if (to.startsWith("/#")) {
      const hash = to.slice(1);
      if (location.pathname === "/") {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/" + hash);
      }
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-[9999] flex items-center gap-3 px-5 sm:px-8 h-16 overflow-visible"
        style={{ background: "#09090F", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <CelestialLogo size={36} />
          <motion.span
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}
            animate={{ textShadow: ["0 0 6px rgba(255,255,255,0.1)", "0 0 16px rgba(255,255,255,0.3)", "0 0 6px rgba(255,255,255,0.1)"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            ASSEMBL
          </motion.span>
        </Link>

        <div className="flex-1" />

        {/* Desktop nav — flat links, no dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.to)}
              className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}

          <Link to="/toroa" className="px-3 py-2 rounded-lg font-body text-xs text-white/40 hover:text-white/70 transition-colors">
            Tōroa
          </Link>

          <a
            href="#founding-pilots"
            onClick={(e) => { e.preventDefault(); handleNavClick("/#founding-pilots"); }}
            className="ml-2 px-5 py-2 rounded-full text-xs font-body font-medium transition-all duration-300"
            style={{ background: "#D4A843", color: "#09090F" }}
          >
            Book a founding pilot
          </a>

          <AccountDropdown />
        </nav>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.7)" }} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.6)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] flex flex-col overflow-y-auto"
              style={{ background: "#0D0D15", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "3px", color: "#D4A843" }}>MENU</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.6)" }} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.label} onClick={() => handleNavClick(item.to)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                  </button>
                ))}
                <button onClick={() => handleNavClick("/toroa")} className="w-full text-left px-4 py-3 rounded-xl text-sm font-body text-white/40">
                  Tōroa
                </button>
              </nav>

              <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <a
                  href="#founding-pilots"
                  onClick={(e) => { e.preventDefault(); handleNavClick("/#founding-pilots"); }}
                  className="block w-full text-center px-5 py-3 rounded-full text-sm font-body font-medium mb-3"
                  style={{ background: "#D4A843", color: "#09090F" }}
                >
                  Book a founding pilot
                </a>
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

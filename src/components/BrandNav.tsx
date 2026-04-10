import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, HardHat, UtensilsCrossed, Palette, Bird, Shield, ChevronDown } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import CelestialLogo from "@/components/CelestialLogo";
import KiaOraPopup from "@/components/KiaOraPopup";

interface NavItem { label: string; to: string }

const NAV_ITEMS: NavItem[] = [
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Research Lab", to: "/aaaip" },
];

const PACKS = [
  { label: "Manaaki", sublabel: "Hospitality", to: "/packs/manaaki", icon: UtensilsCrossed, color: "#D4A843", group: "business" },
  { label: "Waihanga", sublabel: "Construction", to: "/hanga", icon: HardHat, color: "#3A7D6E", group: "business" },
  { label: "Auaha", sublabel: "Creative", to: "/auaha", icon: Palette, color: "#F0D078", group: "business" },
  { label: "Tōroa", sublabel: "Family", to: "/toroa", icon: Bird, color: "#D4A843", group: "whanau" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [packsOpen, setPacksOpen] = useState(false);
  const [kiaOraOpen, setKiaOraOpen] = useState(false);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    setPacksOpen(false);
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
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "lowercase", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}
            animate={{ textShadow: ["0 0 6px rgba(255,255,255,0.1)", "0 0 16px rgba(255,255,255,0.3)", "0 0 6px rgba(255,255,255,0.1)"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            assembl
          </motion.span>
        </Link>

        <div className="flex-1" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-white transition-colors">
              {item.label}
            </button>
          ))}

          {/* Industry Packs dropdown */}
          <div className="relative">
            <button onClick={() => setPacksOpen(!packsOpen)}
              className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-white transition-colors flex items-center gap-1">
              Industry Packs
              <ChevronDown size={12} className={`transition-transform ${packsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {packsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPacksOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full right-0 mt-2 z-20 w-[260px] rounded-xl p-2 space-y-0.5"
                    style={{ background: "#13131F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                    {PACKS.map(pack => (
                      <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${pack.color}15` }}>
                          <pack.icon size={16} style={{ color: pack.color }} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-white/80 group-hover:text-white">{pack.label}</div>
                          <div className="text-[10px] text-white/35">{pack.sublabel}</div>
                        </div>
                      </button>
                    ))}
                    <div className="border-t pt-1 mt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <button onClick={() => handleNavClick("/toroa")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                        <Bird size={14} className="text-white/30 ml-1" />
                        <span className="text-[11px] text-white/40">Tōroa — Whānau Navigator</span>
                      </button>
                    </div>
                    <div className="border-t pt-1 mt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <button onClick={() => handleNavClick("/packs/hanga")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                        <Shield size={14} className="text-white/30 ml-1" />
                        <span className="text-[11px] text-white/40">SIGNAL Security — Shared</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setKiaOraOpen(true)}
            className="ml-2 px-5 py-2 rounded-full text-xs font-body font-medium transition-all duration-300"
            style={{ background: "#3A7D6E", color: "#FFFFFF" }}>
            Kia ora — let's talk
          </button>

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
            <motion.div className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] flex flex-col overflow-y-auto"
              style={{ background: "#0D0D15", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="flex items-center justify-between px-5 py-4">
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "3px", color: "#5AADA0" }}>MENU</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.6)" }} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.label} onClick={() => handleNavClick(item.to)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    {item.label}
                  </button>
                ))}

                <div className="pt-2 pb-1">
                  <span className="px-4 text-[10px] font-semibold tracking-widest" style={{ color: "#5AADA0" }}>INDUSTRY PACKS</span>
                </div>
                {PACKS.map(pack => (
                  <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    <pack.icon size={16} style={{ color: pack.color }} />
                    <span>{pack.label}</span>
                    <span className="text-[10px] text-white/30 ml-auto">{pack.sublabel}</span>
                  </button>
                ))}
              </nav>

              <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                  className="block w-full text-center px-5 py-3 rounded-full text-sm font-body font-medium mb-3"
                  style={{ background: "#3A7D6E", color: "#FFFFFF" }}
                  onClick={() => { setMobileOpen(false); setKiaOraOpen(true); }}>
                  Kia ora — let's talk
                </button>
                <AccountDropdown />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <KiaOraPopup open={kiaOraOpen} onClose={() => setKiaOraOpen(false)} />
    </>
  );
};

export default BrandNav;

import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, HardHat, UtensilsCrossed, Palette, Bird, Car, Package, ChevronDown, Calculator, Shield, Code, Brain } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import Nav3DKeteLogo from "@/components/Nav3DKeteLogo";
import KiaOraPopup from "@/components/KiaOraPopup";
import { usePersonalization } from "@/contexts/PersonalizationContext";

interface NavItem { label: string; to: string }

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

const KETE = [
  { label: "Manaaki", sublabel: "Hospitality", to: "/manaaki", icon: UtensilsCrossed, color: "#D4A843" },
  { label: "Waihanga", sublabel: "Construction", to: "/waihanga/about", icon: HardHat, color: "#3A7D6E" },
  { label: "Auaha", sublabel: "Creative", to: "/auaha/about", icon: Palette, color: "#F0D078" },
  { label: "Arataki", sublabel: "Automotive", to: "/arataki", icon: Car, color: "#E8E8E8" },
  { label: "Pikau", sublabel: "Customs & Freight", to: "/pikau", icon: Package, color: "#7ECFC2" },
  { label: "Tōro", sublabel: "Family", to: "/toro", icon: Bird, color: "#D4A843" },
];

const MORE_LINKS = [
  { label: "ROI Calculator", sublabel: "Sales tool", to: "/roi", icon: Calculator, color: "#5AADA0" },
  { label: "Data Sovereignty", sublabel: "Enterprise trust", to: "/data-sovereignty", icon: Shield, color: "#3A7D6E" },
  
  { label: "Developers", sublabel: "API & docs", to: "/developers", icon: Code, color: "#7ECFC2" },
  { label: "AAAIP", sublabel: "R&D showcase", to: "/aaaip", icon: Brain, color: "#F0D078" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [packsOpen, setPacksOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [kiaOraOpen, setKiaOraOpen] = useState(false);
  const { profile, isPersonalized } = usePersonalization();

  // Smart kete reordering based on detected industry
  const KETE_SLUG_MAP: Record<string, string> = {
    manaaki: 'Manaaki', waihanga: 'Waihanga', auaha: 'Auaha',
    arataki: 'Arataki', pikau: 'Pikau', toro: 'Tōroa',
  };

  const orderedKete = useMemo(() => {
    if (!isPersonalized || !profile.detectedIndustry) return KETE;
    const detectedLabel = KETE_SLUG_MAP[profile.detectedIndustry];
    if (!detectedLabel) return KETE;
    const detected = KETE.find(k => k.label === detectedLabel);
    if (!detected) return KETE;
    const rest = KETE.filter(k => k.label !== detectedLabel);
    return [detected, ...rest];
  }, [isPersonalized, profile.detectedIndustry]);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    setPacksOpen(false);
    setMoreOpen(false);
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

  const detectedLabel = isPersonalized && profile.detectedIndustry ? KETE_SLUG_MAP[profile.detectedIndustry] : null;

  const DropdownPanel = ({ items, onClose }: { items: typeof KETE; onClose: () => void }) => (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        className="absolute top-full right-0 mt-2 z-20 w-[260px] rounded-xl p-2 space-y-0.5"
        style={{ background: "#13131F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        {items.map(item => {
          const isDetected = item.label === detectedLabel;
          return (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group relative"
              style={isDetected ? { borderLeft: `2px solid ${item.color}`, background: `${item.color}08` } : {}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white/80 group-hover:text-white flex items-center gap-2">
                  {item.label}
                  {isDetected && (
                    <span className="text-[8px] font-normal tracking-[1px] uppercase" style={{ color: 'rgba(245,240,232,0.4)' }}>
                      Recommended for you
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-white/35">{item.sublabel}</div>
              </div>
            </button>
          );
        })}
      </motion.div>
    </>
  );

  return (
    <>
      <header
        className="sticky top-0 z-[9999] flex items-center gap-3 px-5 sm:px-8 h-16 overflow-visible"
        style={{ background: "#09090F", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <Nav3DKeteLogo size={36} />
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

          {/* Industry Kete dropdown */}
          <div className="relative">
            <button onClick={() => { setPacksOpen(!packsOpen); setMoreOpen(false); }}
              className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-white transition-colors flex items-center gap-1">
              Industry Kete
              <ChevronDown size={12} className={`transition-transform ${packsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {packsOpen && <DropdownPanel items={orderedKete} onClose={() => setPacksOpen(false)} />}
            </AnimatePresence>
          </div>

          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => { setMoreOpen(!moreOpen); setPacksOpen(false); }}
              className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-white transition-colors flex items-center gap-1">
              More
              <ChevronDown size={12} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && <DropdownPanel items={MORE_LINKS} onClose={() => setMoreOpen(false)} />}
            </AnimatePresence>
          </div>

          <button onClick={() => handleNavClick("/contact")}
            className="ml-2 px-5 py-2 rounded-full text-xs font-body font-medium transition-all duration-300"
            style={{ background: "#3A7D6E", color: "#FFFFFF" }}>
            Kia ora — get started
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
                  <span className="px-4 text-[10px] font-semibold tracking-widest" style={{ color: "#5AADA0" }}>INDUSTRY KETE</span>
                </div>
                {KETE.map(pack => (
                  <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    <pack.icon size={16} style={{ color: pack.color }} />
                    <span>{pack.label}</span>
                    <span className="text-[10px] text-white/30 ml-auto">{pack.sublabel}</span>
                  </button>
                ))}

                <div className="pt-2 pb-1">
                  <span className="px-4 text-[10px] font-semibold tracking-widest" style={{ color: "#5AADA0" }}>MORE</span>
                </div>
                {MORE_LINKS.map(link => (
                  <button key={link.label} onClick={() => handleNavClick(link.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    <link.icon size={16} style={{ color: link.color }} />
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                  className="block w-full text-center px-5 py-3 rounded-full text-sm font-body font-medium mb-3"
                  style={{ background: "#3A7D6E", color: "#FFFFFF" }}
                  onClick={() => { setMobileOpen(false); handleNavClick("/contact"); }}>
                  Kia ora — get started
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

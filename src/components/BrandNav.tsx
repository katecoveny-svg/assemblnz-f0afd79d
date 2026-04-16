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
  { label: "Start Here", to: "/how-it-works" },
  { label: "Client Demos", to: "/demos" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

const KETE = [
  { label: "Manaaki", sublabel: "Hospitality", to: "/manaaki", icon: UtensilsCrossed, color: "#4AA5A8" },
  { label: "Waihanga", sublabel: "Construction", to: "/waihanga/about", icon: HardHat, color: "#E8A948" },
  { label: "Auaha", sublabel: "Creative", to: "/auaha/about", icon: Palette, color: "#9B8EC4" },
  { label: "Arataki", sublabel: "Automotive", to: "/arataki", icon: Car, color: "#4AA5A8" },
  { label: "Pikau", sublabel: "Customs & Freight", to: "/pikau", icon: Package, color: "#6CBFC1" },
  { label: "Toro", sublabel: "Family", to: "/toro", icon: Bird, color: "#E8A948" },
];

const MORE_LINKS = [
  { label: "ROI Calculator", sublabel: "Sales tool", to: "/roi", icon: Calculator, color: "#4AA5A8" },
  { label: "Scenario Simulator", sublabel: "Try a live demo", to: "/simulator", icon: Brain, color: "#E8A948" },
  { label: "Data Sovereignty", sublabel: "Enterprise trust", to: "/data-sovereignty", icon: Shield, color: "#4AA5A8" },
  { label: "Developers", sublabel: "API & docs", to: "/developers", icon: Code, color: "#6CBFC1" },
  { label: "AAAIP", sublabel: "R&D showcase", to: "/aaaip", icon: Brain, color: "#E8A948" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [packsOpen, setPacksOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [kiaOraOpen, setKiaOraOpen] = useState(false);
  const { profile, isPersonalized } = usePersonalization();

  const KETE_SLUG_MAP: Record<string, string> = {
    manaaki: 'Manaaki', waihanga: 'Waihanga', auaha: 'Auaha',
    arataki: 'Arataki', pikau: 'Pikau', toro: 'Toro',
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
        className="absolute top-full right-0 mt-2 z-20 w-[260px] rounded-2xl p-2 space-y-0.5"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 14px 48px -10px rgba(74,165,168,0.15), 0 6px 16px rgba(0,0,0,0.06)",
        }}>
        {items.map(item => {
          const isDetected = item.label === detectedLabel;
          return (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] transition-colors group relative"
              style={isDetected ? { borderLeft: `2px solid ${item.color}`, background: `${item.color}08` } : {}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}10` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-foreground/80 group-hover:text-foreground flex items-center gap-2">
                  {item.label}
                  {isDetected && (
                    <span className="text-[8px] font-normal tracking-[1px] uppercase" style={{ color: '#6B7280' }}>
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-foreground/40">{item.sublabel}</div>
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
        style={{
          background: "rgba(250,251,252,0.75)",
          backdropFilter: "blur(20px) saturate(140%)",
          borderBottom: "1px solid rgba(74,165,168,0.08)",
        }}
      >
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <Nav3DKeteLogo size={36} />
          <span
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "lowercase", fontSize: "13px", color: "#1A1D29" }}
          >
            assembl
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="px-3 py-2 rounded-xl font-body font-medium transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1A1D29")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
            >
              {item.label}
            </button>
          ))}

          <div className="relative">
            <button onClick={() => { setPacksOpen(!packsOpen); setMoreOpen(false); }}
              className="px-3 py-2 rounded-xl font-body font-medium transition-colors flex items-center gap-1"
              style={{ color: "#6B7280" }}>
              Industry Kete
              <ChevronDown size={12} className={`transition-transform ${packsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {packsOpen && <DropdownPanel items={orderedKete} onClose={() => setPacksOpen(false)} />}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => { setMoreOpen(!moreOpen); setPacksOpen(false); }}
              className="px-3 py-2 rounded-xl font-body font-medium transition-colors flex items-center gap-1"
              style={{ color: "#6B7280" }}>
              More
              <ChevronDown size={12} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && <DropdownPanel items={MORE_LINKS} onClose={() => setMoreOpen(false)} />}
            </AnimatePresence>
          </div>

          <button onClick={() => handleNavClick("/contact")}
            className="ml-2 px-8 py-2.5 rounded-full text-xs font-body font-medium transition-all duration-300"
            style={{ background: "#4AA5A8", color: "#FFFFFF" }}>
            Kia ora — get started
          </button>

          <AccountDropdown />
        </nav>

        <div className="flex lg:hidden items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl" style={{ color: "#1A1D29" }} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.1)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] flex flex-col overflow-y-auto"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(24px)",
                borderLeft: "1px solid rgba(74,165,168,0.1)",
              }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="flex items-center justify-between px-5 py-4">
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 500, fontSize: "12px", letterSpacing: "3px", color: "#4AA5A8" }}>MENU</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl" style={{ color: "#6B7280" }} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.label} onClick={() => handleNavClick(item.to)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "#1A1D29" }}>
                    {item.label}
                  </button>
                ))}

                <div className="pt-2 pb-1">
                  <span className="px-4 text-[10px] font-medium tracking-widest" style={{ color: "#4AA5A8" }}>INDUSTRY KETE</span>
                </div>
                {KETE.map(pack => (
                  <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "#1A1D29" }}>
                    <pack.icon size={16} style={{ color: pack.color }} />
                    <span>{pack.label}</span>
                    <span className="text-[10px] ml-auto" style={{ color: "#6B7280" }}>{pack.sublabel}</span>
                  </button>
                ))}

                <div className="pt-2 pb-1">
                  <span className="px-4 text-[10px] font-medium tracking-widest" style={{ color: "#4AA5A8" }}>MORE</span>
                </div>
                {MORE_LINKS.map(link => (
                  <button key={link.label} onClick={() => handleNavClick(link.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "#1A1D29" }}>
                    <link.icon size={16} style={{ color: link.color }} />
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(74,165,168,0.1)" }}>
                <button
                  className="block w-full text-center px-5 py-3 rounded-full text-sm font-body font-medium mb-3"
                  style={{ background: "#4AA5A8", color: "#FFFFFF" }}
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

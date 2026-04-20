import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import GlowIcon from "@/components/GlowIcon";
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
  { label: "Manaaki", sublabel: "Hospitality", to: "/manaaki", glowIcon: "UtensilsCrossed", color: "#4AA5A8" },
  { label: "Waihanga", sublabel: "Construction", to: "/waihanga/about", glowIcon: "HardHat", color: "#4AA5A8" },
  { label: "Auaha", sublabel: "Creative", to: "/auaha/about", glowIcon: "Palette", color: "#9B8EC4" },
  { label: "Arataki", sublabel: "Automotive", to: "/arataki", glowIcon: "Cpu", color: "#4AA5A8" },
  { label: "Pikau", sublabel: "Customs & Freight", to: "/pikau", glowIcon: "Globe", color: "#6CBFC1" },
  { label: "Hoko", sublabel: "Retail", to: "/hoko", glowIcon: "ShoppingBag", color: "#C66B5C" },
  { label: "Ako", sublabel: "Early Childhood", to: "/ako", glowIcon: "Baby", color: "#7BA7C7" },
  { label: "Toro", sublabel: "Family", to: "/toro", glowIcon: "Bird", color: "#4AA5A8" },
];

const MORE_LINKS = [
  { label: "ROI Calculator", sublabel: "Sales tool", to: "/roi", glowIcon: "BarChart3", color: "#4AA5A8" },
  { label: "Scenario Simulator", sublabel: "Try a live demo", to: "/simulator", glowIcon: "Brain", color: "#4AA5A8" },
  { label: "Data Sovereignty", sublabel: "Enterprise trust", to: "/data-sovereignty", glowIcon: "Shield", color: "#4AA5A8" },
  { label: "Developers", sublabel: "API & docs", to: "/developers", glowIcon: "Cpu", color: "#6CBFC1" },
  { label: "AAAIP", sublabel: "R&D showcase", to: "/aaaip", glowIcon: "Sparkles", color: "#4AA5A8" },
  { label: "Agent Marketplace", sublabel: "Browse the specialist library", to: "/agents", glowIcon: "Users", color: "#9B8EC4" },
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
    arataki: 'Arataki', pikau: 'Pikau', hoko: 'Hoko', ako: 'Ako', toro: 'Toro',
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
        className="absolute top-full right-0 mt-2 z-20 w-[280px] rounded-2xl p-2 space-y-0.5"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(238,238,242,0.7))",
          backdropFilter: "blur(24px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "6px 6px 20px rgba(166,166,180,0.3), -6px -6px 20px rgba(255,255,255,0.85), 0 14px 48px -10px rgba(74,165,168,0.15)",
        }}>
        {items.map(item => {
          const isDetected = item.label === detectedLabel;
          return (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] transition-colors group relative"
              style={isDetected ? { borderLeft: `2px solid ${item.color}`, background: `${item.color}08` } : {}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{
                background: `${item.color}12`,
                boxShadow: `2px 2px 6px rgba(166,166,180,0.25), -2px -2px 6px rgba(255,255,255,0.8)`,
              }}>
                <GlowIcon name={item.glowIcon} size={16} color={item.color} glow />
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
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "lowercase", fontSize: "13px", color: "#3D4250" }}
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
              onMouseEnter={e => (e.currentTarget.style.color = "#3D4250")}
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
            className="ml-2 px-8 py-2.5 rounded-full text-xs font-body font-semibold transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
              color: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(74,165,168,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
              textShadow: "0 1px 2px rgba(0,0,0,0.12)",
            }}>
            Kia ora — get started
          </button>

          <AccountDropdown />
        </nav>

        <div className="flex lg:hidden items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl" style={{ color: "#3D4250" }} aria-label="Open menu">
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
                    style={{ color: "#3D4250" }}>
                    {item.label}
                  </button>
                ))}

                <div className="pt-2 pb-1">
                  <span className="px-4 text-[10px] font-medium tracking-widest" style={{ color: "#4AA5A8" }}>INDUSTRY KETE</span>
                </div>
                {KETE.map(pack => (
                  <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200"
                    style={{ color: "#3D4250" }}>
                    <GlowIcon name={pack.glowIcon} size={16} color={pack.color} glow />
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
                    style={{ color: "#3D4250" }}>
                    <GlowIcon name={link.glowIcon} size={16} color={link.color} glow />
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-5 py-5 border-t space-y-3" style={{ borderColor: "rgba(74,165,168,0.1)" }}>
                <button
                  className="block w-full text-center px-5 py-3 rounded-full text-sm font-body font-medium"
                  style={{ background: "#4AA5A8", color: "#FFFFFF" }}
                  onClick={() => { setMobileOpen(false); handleNavClick("/contact"); }}>
                  Kia ora — get started
                </button>
                <AccountDropdown />
                <button
                  onClick={() => { setMobileOpen(false); handleNavClick("/admin"); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(74,165,168,0.2)",
                    color: "#4AA5A8",
                  }}
                  aria-label="Admin sign in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Admin sign in
                </button>
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

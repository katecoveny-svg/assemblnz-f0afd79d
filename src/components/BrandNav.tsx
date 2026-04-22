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
  { label: "Arataki", sublabel: "Automotive", to: "/arataki", glowIcon: "Car", color: "#4A6FA5" },
  { label: "Pikau", sublabel: "Customs & Freight", to: "/pikau", glowIcon: "Package", color: "#5AADA0" },
  { label: "Hoko", sublabel: "Retail", to: "/hoko", glowIcon: "ShoppingBag", color: "#C66B5C" },
  { label: "Ako", sublabel: "Early Childhood", to: "/ako", glowIcon: "Baby", color: "#7BA7C7" },
  { label: "Toro", sublabel: "Family", to: "/toro", glowIcon: "Bird", color: "#4AA5A8" },
];

const MORE_LINKS = [
  { label: "Capabilities", sublabel: "What Assembl can do", to: "/capabilities", glowIcon: "Sparkles", color: "#4AA5A8" },
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

  // Pearl brand tokens (single source of truth — matches PearlIndex)
  // Warm Pearl + Forest Ink — never black, never cool blue-white.
  const PEARL = {
    bg: "#FAF6EF",      // Warm Pearl canvas
    ink: "#0F2A26",     // Forest Ink (deep pounamu, never black)
    pounamu: "#1F4D47",
    muted: "#7A8B82",   // warm sea-glass muted (was cool #8B8479)
    opal: "#E8EEEC",
  };

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
          background: "rgba(250,246,239,0.96)",
          backdropFilter: "blur(24px) saturate(140%)",
          border: `1px solid ${PEARL.opal}`,
          boxShadow: "0 18px 48px -12px rgba(31,77,71,0.18), 0 4px 12px -4px rgba(15,42,38,0.08)",
        }}>
        {items.map(item => {
          const isDetected = item.label === detectedLabel;
          return (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group relative"
              style={isDetected ? { borderLeft: `2px solid ${PEARL.pounamu}`, background: `${PEARL.pounamu}08` } : {}}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${PEARL.pounamu}06`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDetected ? `${PEARL.pounamu}08` : "transparent"; }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{
                background: `${PEARL.pounamu}10`,
                border: `1px solid ${PEARL.pounamu}18`,
              }}>
                <GlowIcon name={item.glowIcon} size={16} color={PEARL.pounamu} glow />
              </div>
              <div className="text-left">
                <div
                  className="flex items-center gap-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: 16,
                    color: PEARL.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.label}
                  {isDetected && (
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        textTransform: "lowercase",
                        color: PEARL.pounamu,
                        fontWeight: 500,
                      }}
                    >
                      recommended
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    color: PEARL.muted,
                    letterSpacing: "0.04em",
                    marginTop: 2,
                  }}
                >
                  {item.sublabel}
                </div>
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
          background: "rgba(250,246,239,0.82)",
          backdropFilter: "blur(20px) saturate(140%)",
          borderBottom: `1px solid ${PEARL.opal}`,
        }}
      >
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <Nav3DKeteLogo size={36} />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "lowercase",
              fontSize: "20px",
              color: PEARL.ink,
            }}
          >
            assembl
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => handleNavClick(item.to)}
              className="px-3 py-2 rounded-xl transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: PEARL.muted,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = PEARL.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = PEARL.muted)}
            >
              {item.label}
            </button>
          ))}

          <div className="relative">
            <button onClick={() => { setPacksOpen(!packsOpen); setMoreOpen(false); }}
              className="px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: PEARL.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = PEARL.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = PEARL.muted)}>
              Ketes
              <ChevronDown size={12} className={`transition-transform ${packsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {packsOpen && <DropdownPanel items={orderedKete} onClose={() => setPacksOpen(false)} />}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => { setMoreOpen(!moreOpen); setPacksOpen(false); }}
              className="px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: PEARL.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = PEARL.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = PEARL.muted)}>
              More
              <ChevronDown size={12} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && <DropdownPanel items={MORE_LINKS} onClose={() => setMoreOpen(false)} />}
            </AnimatePresence>
          </div>

          <button onClick={() => handleNavClick("/contact")}
            data-magnetic
            className="ml-2 transition-all duration-300 hover:-translate-y-px"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.01em",
              padding: "12px 24px",
              borderRadius: 999,
              background: PEARL.pounamu,
              color: PEARL.bg,
              boxShadow: "0 10px 30px -12px rgba(31,77,71,0.45)",
            }}>
            Start with one kete
          </button>

          <AccountDropdown />
        </nav>

        <div className="flex lg:hidden items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl" style={{ color: PEARL.ink }} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60]" style={{ background: "rgba(15,42,38,0.18)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] flex flex-col overflow-y-auto"
              style={{
                background: "rgba(250,246,239,0.96)",
                backdropFilter: "blur(24px)",
                borderLeft: `1px solid ${PEARL.opal}`,
              }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="flex items-center justify-between px-5 py-4">
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "11px", letterSpacing: "0.18em", textTransform: "lowercase", color: PEARL.muted }}>menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl" style={{ color: PEARL.muted }} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.label} onClick={() => handleNavClick(item.to)}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, color: PEARL.ink }}>
                    {item.label}
                  </button>
                ))}

                <div className="pt-3 pb-1">
                  <span className="px-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "lowercase", color: PEARL.muted }}>ketes</span>
                </div>
                {KETE.map(pack => (
                  <button key={pack.label} onClick={() => handleNavClick(pack.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: PEARL.ink }}>
                    <GlowIcon name={pack.glowIcon} size={16} color={PEARL.pounamu} glow />
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400 }}>{pack.label}</span>
                    <span className="ml-auto" style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: PEARL.muted }}>{pack.sublabel}</span>
                  </button>
                ))}

                <div className="pt-3 pb-1">
                  <span className="px-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "lowercase", color: PEARL.muted }}>more</span>
                </div>
                {MORE_LINKS.map(link => (
                  <button key={link.label} onClick={() => handleNavClick(link.to)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: PEARL.ink }}>
                    <GlowIcon name={link.glowIcon} size={16} color={PEARL.pounamu} glow />
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400 }}>{link.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-5 py-5 border-t space-y-3" style={{ borderColor: PEARL.opal }}>
                <button
                  className="block w-full text-center transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "14px 20px",
                    borderRadius: 999,
                    background: PEARL.pounamu,
                    color: PEARL.bg,
                    boxShadow: "0 10px 30px -12px rgba(31,77,71,0.45)",
                  }}
                  onClick={() => { setMobileOpen(false); handleNavClick("/contact"); }}>
                  Start with one kete
                </button>
                <AccountDropdown />
                <button
                  onClick={() => { setMobileOpen(false); handleNavClick("/admin"); }}
                  className="w-full flex items-center justify-center gap-2 transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${PEARL.opal}`,
                    color: PEARL.pounamu,
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

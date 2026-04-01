import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import CelestialLogo from "@/components/CelestialLogo";

interface NavChild { label: string; to: string; desc: string }
interface NavItem {
  label: string;
  to?: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Platform",
    children: [
      { label: "How it works", to: "/#how-it-works", desc: "One request, the right intelligence" },
      { label: "Why Assembl", to: "/#why-assembl", desc: "Built for Aotearoa, not adapted" },
      { label: "Te Kāhui Reo", to: "/#te-kahui-reo", desc: "Cultural and language intelligence" },
    ],
  },
  {
    label: "Industry Packs",
    children: [
      { label: "Manaaki — Hospitality", to: "/packs/manaaki", desc: "Guest experience, food safety, operations" },
      { label: "Hanga — Construction", to: "/packs/hanga", desc: "BIM, safety, consenting, quoting" },
      { label: "Auaha — Creative", to: "/packs/auaha", desc: "Strategy, content, campaigns, brand" },
      { label: "Pakihi — Business Ops", to: "/packs/pakihi", desc: "Finance, HR, legal, reporting" },
      { label: "Hangarau — Technology", to: "/packs/hangarau", desc: "Systems, monitoring, architecture" },
    ],
  },
  { label: "Pricing", to: "/pricing" },
  { label: "Founding Pilots", to: "/#founding-pilots" },
  { label: "Contact", to: "/#contact" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    setOpenDropdown(null);
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
        className="sticky top-0 z-[9999] flex items-center gap-3 px-5 sm:px-8 py-3.5 overflow-visible"
        style={{
          background: "#09090F",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <CelestialLogo size={36} />
          <div className="flex items-baseline gap-1.5">
            <motion.span
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}
              animate={{ textShadow: ["0 0 6px rgba(255,255,255,0.1)", "0 0 16px rgba(255,255,255,0.3)", "0 0 6px rgba(255,255,255,0.1)"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ASSEMBL
            </motion.span>
          </div>
        </Link>
        <div className="flex-1" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] overflow-visible">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="relative" onMouseEnter={() => item.children && setOpenDropdown(item.label)} onMouseLeave={() => setOpenDropdown(null)}>
              {item.children ? (
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-foreground transition-colors duration-250"
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown size={12} className="transition-transform" style={{ transform: openDropdown === item.label ? "rotate(180deg)" : "none" }} />
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick(item.to!)}
                  className="px-3 py-2 rounded-lg font-body font-medium text-white/65 hover:text-foreground transition-colors duration-250"
                >
                  {item.label}
                </button>
              )}

              <AnimatePresence>
                {item.children && openDropdown === item.label && (
                  <motion.div
                    className="absolute top-full left-0 mt-1 w-[260px] rounded-xl overflow-hidden z-[10000]"
                    style={{ background: "#0D0D15", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.children.map((child, ci) => (
                      <button
                        key={child.label}
                        onClick={() => handleNavClick(child.to)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors block"
                        style={{ borderBottom: ci === (item.children!.length - 1) ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <p className="text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#FFFFFF" }}>{child.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>{child.desc}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Tōroa utility link */}
          <Link to="/toroa" className="px-3 py-2 rounded-lg font-body text-xs text-white/40 hover:text-white/70 transition-colors">
            Tōroa
          </Link>

          {/* CTA */}
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
                {NAV_ITEMS.map((item) => {
                  if (item.children) {
                    const isExpanded = mobileExpanded === item.label;
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                          style={{ color: isExpanded ? "#D4A843" : "rgba(255,255,255,0.7)", background: isExpanded ? "rgba(212,168,67,0.08)" : "transparent" }}
                        >
                          {item.label}
                          <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pl-4 py-1 space-y-0.5">
                                {item.children.map((child) => (
                                  <button key={child.label} onClick={() => handleNavClick(child.to)}
                                    className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-body text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <button key={item.label} onClick={() => handleNavClick(item.to!)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {item.label}
                    </button>
                  );
                })}

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

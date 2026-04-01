import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import NotificationBell from "@/components/NotificationBell";
import { assemblMark } from "@/assets/brand";

interface NavChild { label: string; to: string; desc: string; badge?: "LIVE" | "ADMIN" }
interface NavItem {
  label: string;
  to?: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Industry Packs",
    children: [
      { label: "Manaaki — Hospitality", to: "/packs/manaaki", desc: "Food safety, licensing, guest comms", badge: "LIVE" },
      { label: "Hanga — Construction", to: "/packs/hanga", desc: "Safety, BIM, consenting, quality", badge: "LIVE" },
      { label: "Pakihi — Business Operations", to: "/packs/pakihi", desc: "HR, payroll, finance, operations", badge: "LIVE" },
      { label: "Auaha — Creative", to: "/packs/auaha", desc: "Brand, social, imagery, campaigns" },
      { label: "Hangarau — Technology", to: "/packs/hangarau", desc: "Cyber, apps, APIs, monitoring" },
    ],
  },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Dashboard", to: "/dashboard" },
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
        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
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
                    className="absolute top-full left-0 mt-1 w-[260px] rounded-xl overflow-hidden z-50"
                    style={{
                      background: "#0D0D15",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.children.map((child, ci) => {
                      const isLast = item.children && ci === item.children.length - 1;
                      return (
                        <button
                          key={child.label}
                          onClick={() => handleNavClick(child.to)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors block"
                          style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#FFFFFF" }}>{child.label}</p>
                            {child.badge === "LIVE" && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "#3A7D6E", color: "#FFFFFF", letterSpacing: "0.06em" }}>LIVE</span>
                            )}
                          </div>
                          <p className="text-[10px] mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>{child.desc}</p>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <NotificationBell />
          <AccountDropdown />
        </nav>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
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
                  const active = item.to && location.pathname === item.to;
                  return (
                    <button key={item.label} onClick={() => handleNavClick(item.to!)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                      style={{ color: active ? "#D4A843" : "rgba(255,255,255,0.7)", background: active ? "rgba(212,168,67,0.08)" : "transparent", fontWeight: active ? 600 : 400 }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

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

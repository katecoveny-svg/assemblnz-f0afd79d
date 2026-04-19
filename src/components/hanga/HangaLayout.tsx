import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import HangaChatPanel from "./HangaChatPanel";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, LayoutDashboard, ShieldAlert, FolderKanban, MapPin,
  Camera, FileText, MessageSquare, Mic, ChevronLeft, ChevronRight,
  Layers, Brain, Globe, Menu, X, Users
} from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";

const NAV_ITEMS = [
  { label: "Dashboard", labelMi: "Papa Matua", to: "/waihanga", icon: LayoutDashboard, end: true },
  { label: "ĀRAI Safety", labelMi: "Haumarutanga", to: "/waihanga/arai", icon: ShieldAlert },
  { label: "KAUPAPA Projects", labelMi: "Kaupapa", to: "/waihanga/kaupapa", icon: FolderKanban },
  { label: "Site Check-in", labelMi: "Tae Mai", to: "/waihanga/site-checkin", icon: MapPin },
  { label: "Photo Docs", labelMi: "Whakaahua", to: "/waihanga/photos", icon: Camera },
  { label: "Tender Writer", labelMi: "Tono", to: "/waihanga/tender", icon: FileText },
  { label: "Document Intel", labelMi: "Tuhinga", to: "/waihanga/docs", icon: Layers },
  { label: "Comms Hub", labelMi: "Kōrero", to: "/waihanga/comms", icon: MessageSquare },
  { label: "Voice Agent", labelMi: "Reo", to: "/waihanga/voice", icon: Mic },
  { label: "ATA BIM", labelMi: "Ata", to: "/waihanga/ata", icon: Layers },
  { label: "RAWA Resources", labelMi: "Rawa", to: "/waihanga/rawa", icon: HardHat },
  { label: "WHAKAAĒ Consent", labelMi: "Whakaaē", to: "/waihanga/whakaae", icon: FileText },
  { label: "PAI Quality", labelMi: "Pai", to: "/waihanga/pai", icon: ShieldAlert },
  { label: "Subbie Watchdog", labelMi: "Kaitiaki Subbie", to: "/waihanga/subbies", icon: Users },
];

export default function HangaLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "mi">("en");

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${KOWHAI})` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Kete (woven basket) */}
              <path d="M4 8 C4 8 5 4 12 4 C19 4 20 8 20 8" />
              <path d="M3 8 L5 20 C5 21 6 22 12 22 C18 22 19 21 19 20 L21 8" />
              <path d="M3 8 H21" />
              {/* Weave lines */}
              <path d="M8 8 L7 22" opacity="0.5" />
              <path d="M12 8 L12 22" opacity="0.5" />
              <path d="M16 8 L17 22" opacity="0.5" />
              <path d="M4 13 H20" opacity="0.5" />
              <path d="M5 17.5 H19" opacity="0.5" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-wider">WAIHANGA</h2>
              <p className="text-[10px] text-[#9CA3AF]">Construction Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* IHO Brain indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)" }}>
          <Brain size={14} style={{ color: KOWHAI }} />
          <span className="text-[10px] text-gray-500">Orchestrated by IHO</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: POUNAMU }} />
        </div>
      )}

      {/* Lang toggle */}
      {!collapsed && (
        <button onClick={() => setLang(l => l === "en" ? "mi" : "en")} className="mx-3 mt-2 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors" style={{ background: "rgba(255,255,255,0.5)" }}>
          <Globe size={12} />
          {lang === "en" ? "Te Reo Māori" : "English"}
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to, item.end);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                active ? "text-foreground" : "text-gray-500 hover:text-[#1A1D29] hover:bg-white/[0.03]"
              }`}
              style={active ? {
                background: "linear-gradient(135deg, rgba(212,168,67,0.12), rgba(58,125,110,0.08))",
                border: "1px solid rgba(212,168,67,0.2)",
                boxShadow: "0 0 20px rgba(212,168,67,0.06)",
              } : {}}
            >
              <item.icon size={collapsed ? 20 : 16} style={{ color: active ? KOWHAI : undefined }} />
              {!collapsed && (
                <span className="truncate text-xs font-medium">
                  {lang === "mi" ? item.labelMi : item.label}
                </span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: KOWHAI }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-[#6B7280] transition-colors text-[11px]">
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFBFC" }}>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 border-r`}
        style={{
          width: collapsed ? 64 : 240,
          background: "linear-gradient(180deg, #0D0D18 0%, #09090F 100%)",
          borderColor: "rgba(255,255,255,0.5)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}
      >
        <Menu size={20} className="text-[#3D4250]" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.6)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[70] w-[260px] flex flex-col overflow-y-auto"
              style={{ background: "#0D0D18", borderRight: "1px solid rgba(255,255,255,0.5)" }}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 text-[#9CA3AF]">
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* AI Chat Panel */}
      <HangaChatPanel />
    </div>
  );
}

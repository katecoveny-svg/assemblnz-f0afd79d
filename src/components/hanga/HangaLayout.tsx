import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import HangaChatPanel from "./HangaChatPanel";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, LayoutDashboard, ShieldAlert, FolderKanban, MapPin,
  Camera, FileText, MessageSquare, Mic, ChevronLeft, ChevronRight,
  Layers, Brain, Globe, Menu, X, Users
} from "lucide-react";
import { MARAMA_WAIHANGA as M } from "./marama";

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
    <div className="flex flex-col h-full" style={{ color: M.textPrimary }}>
      {/* Header */}
      <div
        className="p-4"
        style={{ borderBottom: `1px solid ${M.borderSoft}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${M.accent}, ${M.cta})`,
              boxShadow: M.shadowSoft,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F3221" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8 C4 8 5 4 12 4 C19 4 20 8 20 8" />
              <path d="M3 8 L5 20 C5 21 6 22 12 22 C18 22 19 21 19 20 L21 8" />
              <path d="M3 8 H21" />
              <path d="M8 8 L7 22" opacity="0.55" />
              <path d="M12 8 L12 22" opacity="0.55" />
              <path d="M16 8 L17 22" opacity="0.55" />
              <path d="M4 13 H20" opacity="0.55" />
              <path d="M5 17.5 H19" opacity="0.55" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h2
                className="font-display text-base tracking-[0.18em]"
                style={{ color: M.textPrimary }}
              >
                WAIHANGA
              </h2>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: M.textSecondary }}
              >
                Construction
              </p>
            </div>
          )}
        </div>
      </div>

      {/* IHO indicator */}
      {!collapsed && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded-2xl flex items-center gap-2"
          style={{
            background: M.accentSoft,
            border: `1px solid ${M.borderSoft}`,
          }}
        >
          <Brain size={14} style={{ color: M.accentDeep }} />
          <span className="text-[10px]" style={{ color: M.textSecondary }}>
            Orchestrated by IHO
          </span>
          <div
            className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: M.accentDeep }}
          />
        </div>
      )}

      {/* Lang toggle */}
      {!collapsed && (
        <button
          onClick={() => setLang(l => l === "en" ? "mi" : "en")}
          className="mx-3 mt-2 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] transition-colors"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${M.borderSoft}`,
            color: M.textSecondary,
          }}
        >
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${M.ctaSoft}, ${M.accentSoft})`
                  : "transparent",
                border: `1px solid ${active ? M.accentRing : "transparent"}`,
                color: active ? M.textPrimary : M.textSecondary,
                boxShadow: active ? "0 4px 16px rgba(217,188,122,0.10)" : "none",
              }}
            >
              <item.icon
                size={collapsed ? 20 : 16}
                style={{ color: active ? M.accentDeep : M.textSecondary }}
              />
              {!collapsed && (
                <span className="truncate text-xs font-medium">
                  {lang === "mi" ? item.labelMi : item.label}
                </span>
              )}
              {active && !collapsed && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: M.cta }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div
        className="hidden lg:block p-3"
        style={{ borderTop: `1px solid ${M.borderSoft}` }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors text-[11px]"
          style={{ color: M.textSecondary }}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: M.surface }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(24px)",
          borderRight: `1px solid ${M.borderSoft}`,
          boxShadow: M.shadowCard,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: `1px solid ${M.borderSoft}`,
          boxShadow: M.shadowCard,
          color: M.textPrimary,
        }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(111,97,88,0.35)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[70] w-[260px] flex flex-col overflow-y-auto"
              style={{
                background: "rgba(247,243,238,0.96)",
                backdropFilter: "blur(24px)",
                borderRight: `1px solid ${M.borderSoft}`,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5"
                style={{ color: M.textSecondary }}
              >
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

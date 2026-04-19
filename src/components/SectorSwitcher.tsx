/**
 * Sector Switcher — Persistent sidebar for workspace-level kete navigation.
 * "God-mode" sector switching with live status indicators.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap, LayoutDashboard } from "lucide-react";
import { KETE_CONFIG, type KeteDefinition } from "@/components/kete/KeteConfig";

const BUSINESS_KETE = KETE_CONFIG.filter(k => k.group === "business");

interface Props {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function SectorSwitcher({ collapsed = false, onToggle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isActive = (kete: KeteDefinition) => location.pathname.startsWith(kete.route);

  return (
    <motion.div
      className="h-full flex flex-col"
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{
        background: "linear-gradient(180deg, #09090F 0%, #0D0D18 100%)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div className="px-3 py-4 flex items-center justify-between">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] font-display uppercase tracking-[4px] text-gray-400"
          >
            Sectors
          </motion.span>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Command Centre link */}
      <button
        onClick={() => navigate("/command")}
        onMouseEnter={() => setHoveredId("command")}
        onMouseLeave={() => setHoveredId(null)}
        className="mx-2 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all relative overflow-hidden"
        style={{
          background: location.pathname === "/command"
            ? "rgba(212, 168, 67, 0.1)"
            : hoveredId === "command" ? "rgba(255,255,255,0.03)" : "transparent",
          border: location.pathname === "/command"
            ? "1px solid rgba(212, 168, 67, 0.2)"
            : "1px solid transparent",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "rgba(212, 168, 67, 0.1)",
            border: "1px solid rgba(212, 168, 67, 0.15)",
          }}
        >
          <LayoutDashboard size={14} style={{ color: "#D4A843" }} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <span className="text-xs font-body font-medium text-white/80 block truncate">Command Centre</span>
            <span className="text-[9px] font-body text-gray-400 block">All sectors overview</span>
          </motion.div>
        )}
      </button>

      <div className="mx-3 h-px bg-white/[0.04] mb-2" />

      {/* Kete list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {BUSINESS_KETE.map((kete) => {
          const active = isActive(kete);
          const hovered = hoveredId === kete.id;
          const Icon = kete.icon;

          return (
            <button
              key={kete.id}
              onClick={() => navigate(kete.route)}
              onMouseEnter={() => setHoveredId(kete.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="w-full px-2 py-2.5 rounded-xl flex items-center gap-2.5 transition-all relative overflow-hidden group"
              style={{
                background: active
                  ? `${kete.color}12`
                  : hovered ? "rgba(255,255,255,0.03)" : "transparent",
                border: active ? `1px solid ${kete.color}25` : "1px solid transparent",
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="sector-indicator"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                  style={{ background: kete.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: active ? `${kete.color}15` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? `${kete.color}25` : "rgba(255,255,255,0.05)"}`,
                  boxShadow: active ? `0 0 12px ${kete.color}15` : "none",
                }}
              >
                <Icon size={14} style={{ color: active ? kete.color : "rgba(255,255,255,0.4)" }} />
              </div>

              {/* Label */}
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 text-left">
                  <span
                    className="text-xs font-body font-medium block truncate transition-colors"
                    style={{ color: active ? kete.color : "rgba(255,255,255,0.6)" }}
                  >
                    {kete.name}
                  </span>
                  <span className="text-[9px] font-mono-jb uppercase tracking-wider text-white/25 block truncate">
                    / {kete.nameEn}
                  </span>
                </motion.div>
              )}

              {/* Chevron */}
              {!collapsed && (
                <ChevronRight
                  size={12}
                  className="ml-auto shrink-0 transition-all"
                  style={{
                    color: active ? kete.color : "rgba(255,255,255,0.15)",
                    opacity: active || hovered ? 1 : 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Symbiotic status */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 text-[9px] font-body text-white/25">
            <Zap size={10} className="text-pounamu" />
            <span>Symbiotic Bridge active</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

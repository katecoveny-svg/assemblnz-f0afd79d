import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { KETE_CONFIG } from "./KeteConfig";

/* Industry-specific mini SVG icons for the selector */
function KeteSelectorIcon({ id, color, size = 12 }: { id: string; color: string; size?: number }) {
  if (id === "toro") {
    // Bird silhouette for Toro
    return (
      <svg width={size + 4} height={size} viewBox="0 0 20 12" fill="none">
        <path
          d="M10 6 C8 4.5, 4 3, 1 4.5 C3.5 4, 6 5, 8.5 5.8 L10 6 L11.5 5.8 C14 5, 16.5 4, 19 4.5 C16 3, 12 4.5, 10 6Z"
          fill={color}
          opacity="0.85"
        />
        <ellipse cx="10" cy="6.3" rx="1.5" ry="0.8" fill={color} />
      </svg>
    );
  }
  if (id === "manaaki") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path d="M8 2C6 2 4.5 3.5 4.5 5.5c0 1.5 1.2 2.8 2.8 3.2V11H6v1h4v-1H8.7V8.7C10.3 8.3 11.5 7 11.5 5.5 11.5 3.5 10 2 8 2z" fill={color} />
      </svg>
    );
  }
  if (id === "waihanga") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="3" y="11" width="10" height="2" rx="0.5" fill={color} />
        <path d="M4 11v-1a4 4 0 018 0v1" stroke={color} strokeWidth="1.2" fill="none" />
        <line x1="7" y1="11" x2="7" y2="8" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <line x1="9" y1="11" x2="9" y2="7" stroke={color} strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }
  if (id === "auaha") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="6" cy="6.5" r="1.3" fill={color} opacity="0.8" />
        <circle cx="10.5" cy="6.5" r="1" fill={color} opacity="0.6" />
        <circle cx="6.5" cy="10" r="0.9" fill={color} opacity="0.5" />
        <circle cx="10" cy="10" r="1.1" fill={color} opacity="0.7" />
      </svg>
    );
  }
  if (id === "arataki") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path d="M3 10h10v1.5a0.5 0.5 0 01-0.5 0.5h-9a0.5 0.5 0 01-0.5-0.5V10z" fill={color} />
        <path d="M4 10l1-3h6l1 3" stroke={color} strokeWidth="0.8" fill="none" />
        <circle cx="5" cy="11" r="1" fill={color} opacity="0.5" />
        <circle cx="11" cy="11" r="1" fill={color} opacity="0.5" />
      </svg>
    );
  }
  if (id === "pikau") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="4" width="11" height="8" rx="1" stroke={color} strokeWidth="1" fill="none" />
        <line x1="6" y1="4" x2="6" y2="12" stroke={color} strokeWidth="0.6" opacity="0.4" />
        <line x1="10" y1="4" x2="10" y2="12" stroke={color} strokeWidth="0.6" opacity="0.4" />
      </svg>
    );
  }
  // Fallback
  const Icon = KETE_CONFIG.find(k => k.id === id)?.icon;
  return Icon ? <Icon size={size} /> : null;
}

export default function KeteSelector() {
  const location = useLocation();

  const isActive = (id: string) => {
    if (id === "waihanga") return location.pathname.startsWith("/waihanga");
    if (id === "toroa" || id === "toro") return location.pathname.startsWith("/toroa") || location.pathname.startsWith("/toro");
    return location.pathname.includes(id);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {KETE_CONFIG.map(k => {
        const active = isActive(k.id);
        return (
          <Link key={k.id} to={k.route}>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all cursor-pointer"
              style={{
                background: active ? `${k.color}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? `${k.color}40` : "rgba(255,255,255,0.06)"}`,
                color: active ? k.color : "rgba(255,255,255,0.4)",
              }}
              whileHover={{ scale: 1.02, borderColor: `${k.color}30` }}
            >
              <KeteSelectorIcon id={k.id} color={active ? k.color : "rgba(255,255,255,0.4)"} size={12} />
              <span>{k.name}</span>
              <span className="text-[8px] opacity-50">{k.agentCount}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

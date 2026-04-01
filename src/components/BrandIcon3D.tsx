import { type ReactNode } from "react";

/**
 * BrandIcon3D — Branded 3D icon container with glass, glow, and depth effects.
 *
 * Wraps any SVG/icon child in a 3D-styled container using the Celestial / Whenua palette.
 * Sizes: sm (32), md (44), lg (56), xl (72)
 * Variants: glass (default), solid, floating
 */

type IconSize = "sm" | "md" | "lg" | "xl";
type IconVariant = "glass" | "solid" | "floating";
type PaletteKey = "kowhai" | "pounamu" | "tangaroa" | "celestial" | "rust";

const SIZE_MAP: Record<IconSize, number> = { sm: 32, md: 44, lg: 56, xl: 72 };

const PALETTE: Record<PaletteKey, { h: string; base: string; glow: string }> = {
  kowhai:    { h: "42, 63%, 55%",  base: "#D4A843", glow: "rgba(212,168,67,0.55)" },
  pounamu:   { h: "164, 37%, 35%", base: "#3A7D6E", glow: "rgba(58,125,110,0.5)" },
  tangaroa:  { h: "213, 53%, 23%", base: "#1A3A5C", glow: "rgba(26,58,92,0.5)" },
  celestial: { h: "0, 0%, 100%",   base: "#FFFFFF", glow: "rgba(255,255,255,0.35)" },
  rust:      { h: "3, 45%, 56%",   base: "#C45A4A", glow: "rgba(196,90,74,0.45)" },
};

interface BrandIcon3DProps {
  children: ReactNode;
  size?: IconSize;
  variant?: IconVariant;
  color?: PaletteKey;
  className?: string;
  /** Optional pulse animation */
  pulse?: boolean;
}

const BrandIcon3D = ({
  children,
  size = "md",
  variant = "glass",
  color = "kowhai",
  className = "",
  pulse = false,
}: BrandIcon3DProps) => {
  const px = SIZE_MAP[size];
  const p = PALETTE[color];

  const baseStyles: React.CSSProperties = {
    width: px,
    height: px,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: px > 48 ? 20 : 14,
    position: "relative",
    flexShrink: 0,
    transition: "transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms ease",
  };

  if (variant === "glass") {
    Object.assign(baseStyles, {
      background: `linear-gradient(145deg, hsla(${p.h}, 0.12) 0%, hsla(${p.h}, 0.04) 100%)`,
      border: `1.5px solid hsla(${p.h}, 0.2)`,
      boxShadow: `
        0 0 18px ${p.glow},
        inset 0 1px 1px rgba(255,255,255,0.08),
        0 4px 12px rgba(0,0,0,0.3)
      `,
      backdropFilter: "blur(12px)",
    });
  } else if (variant === "solid") {
    Object.assign(baseStyles, {
      background: `linear-gradient(145deg, hsla(${p.h}, 0.25) 0%, hsla(${p.h}, 0.10) 100%)`,
      border: `1.5px solid hsla(${p.h}, 0.35)`,
      boxShadow: `
        0 0 24px ${p.glow},
        0 6px 20px rgba(0,0,0,0.4),
        inset 0 1px 2px rgba(255,255,255,0.12)
      `,
    });
  } else {
    // floating
    Object.assign(baseStyles, {
      background: `radial-gradient(circle at 35% 30%, hsla(${p.h}, 0.18), hsla(${p.h}, 0.05) 70%)`,
      border: `1px solid hsla(${p.h}, 0.15)`,
      boxShadow: `
        0 8px 32px ${p.glow},
        0 2px 8px rgba(0,0,0,0.2),
        inset 0 1px 1px rgba(255,255,255,0.06)
      `,
    });
  }

  return (
    <div
      className={`brand-icon-3d ${pulse ? "brand-icon-pulse" : ""} ${className}`}
      style={baseStyles}
    >
      {/* Top highlight reflection */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, hsla(${p.h}, 0.4), transparent)`,
          borderRadius: "1px",
        }}
      />
      {/* Inner glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: px > 48 ? 26 : 20,
          background: `radial-gradient(circle, ${p.glow}, transparent 70%)`,
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default BrandIcon3D;

/**
 * Convenience: A set of pre-composed branded 3D icons for each industry pack.
 * These use inline SVGs with gradient fills and glow filters for a premium 3D look.
 */

interface Pack3DIconProps {
  size?: IconSize;
  variant?: IconVariant;
}

const SZ: Record<IconSize, number> = { sm: 16, md: 22, lg: 28, xl: 36 };

// ── Manaaki (Hospitality) — Kōwhai Gold
export const ManaakiIcon3D = ({ size = "md", variant = "glass" }: Pack3DIconProps) => {
  const s = SZ[size];
  return (
    <BrandIcon3D size={size} variant={variant} color="kowhai">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="m3d-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D078" />
            <stop offset="100%" stopColor="#D4A843" />
          </linearGradient>
          <filter id="m3d-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" fill="url(#m3d-g)" fillOpacity="0.85" filter="url(#m3d-glow)" />
        <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" stroke="#D4A843" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      </svg>
    </BrandIcon3D>
  );
};

// ── Hanga (Construction) — Pounamu Teal
export const HangaIcon3D = ({ size = "md", variant = "glass" }: Pack3DIconProps) => {
  const s = SZ[size];
  return (
    <BrandIcon3D size={size} variant={variant} color="pounamu">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="h3d-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5AADA0" />
            <stop offset="100%" stopColor="#3A7D6E" />
          </linearGradient>
          <filter id="h3d-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M2 20h20M4 20v-6l4-4V6h8v4l4 4v6" fill="url(#h3d-g)" fillOpacity="0.75" filter="url(#h3d-glow)" />
        <path d="M2 20h20M4 20v-6l4-4V6h8v4l4 4v6" stroke="#3A7D6E" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <rect x="10" y="14" width="4" height="6" rx="0.5" fill="#5AADA0" fillOpacity="0.5" />
      </svg>
    </BrandIcon3D>
  );
};

// ── Auaha (Creative) — Pounamu Light
export const AuahaIcon3D = ({ size = "md", variant = "glass" }: Pack3DIconProps) => {
  const s = SZ[size];
  return (
    <BrandIcon3D size={size} variant={variant} color="pounamu">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="a3d-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7EC8BC" />
            <stop offset="100%" stopColor="#5AADA0" />
          </linearGradient>
          <filter id="a3d-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="url(#a3d-g)" fillOpacity="0.8" filter="url(#a3d-glow)" />
        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" stroke="#5AADA0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      </svg>
    </BrandIcon3D>
  );
};

// ── Pakihi (Business) — Kōwhai
export const PakihiIcon3D = ({ size = "md", variant = "glass" }: Pack3DIconProps) => {
  const s = SZ[size];
  return (
    <BrandIcon3D size={size} variant={variant} color="kowhai">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="p3d-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D078" />
            <stop offset="100%" stopColor="#D4A843" />
          </linearGradient>
          <filter id="p3d-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="3" y="7" width="18" height="13" rx="2" fill="url(#p3d-g)" fillOpacity="0.75" filter="url(#p3d-glow)" />
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#D4A843" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <path d="M8 7V5a4 4 0 018 0v2" stroke="#D4A843" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
      </svg>
    </BrandIcon3D>
  );
};

// ── Hangarau (Technology) — Tāngaroa
export const HangarauIcon3D = ({ size = "md", variant = "glass" }: Pack3DIconProps) => {
  const s = SZ[size];
  return (
    <BrandIcon3D size={size} variant={variant} color="tangaroa">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="t3d-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A8AC2" />
            <stop offset="100%" stopColor="#1A3A5C" />
          </linearGradient>
          <filter id="t3d-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="4" y="4" width="16" height="12" rx="2" fill="url(#t3d-g)" fillOpacity="0.75" filter="url(#t3d-glow)" />
        <rect x="4" y="4" width="16" height="12" rx="2" stroke="#1A3A5C" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <line x1="12" y1="16" x2="12" y2="20" stroke="#4A8AC2" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="8" y1="20" x2="16" y2="20" stroke="#4A8AC2" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="12" cy="10" r="2.5" stroke="#4A8AC2" strokeWidth="1" strokeOpacity="0.6" fill="none" />
      </svg>
    </BrandIcon3D>
  );
};

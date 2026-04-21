import { useEffect, useRef } from "react";
import ResponsiveKeteImage from "@/components/kete/ResponsiveKeteImage";
// Single source of truth — every kete across the site is the same white feathered kete.
// Per-industry variants are accepted for backwards compatibility but always resolve
// to the master image (delivered responsively via WebP/PNG srcset).

/**
 * FeatherKete — photoreal woven feather kete used as a decorative
 * orb / cloud replacement. Mirrors the MiniCloud API: same sizing,
 * drift speeds, and gentle bobbing animation, but rendered with a
 * kete-image variant per industry pack.
 */
export type KeteVariant =
  | "base"
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "pikau"
  | "hoko"
  | "ako"
  | "toro";

// All variants resolve to the same responsive master kete — the API stays
// stable for every existing caller while collapsing the visual to a single template.

// Per-variant subtle hue tint (CSS hue-rotate + tinted drop-shadow). Same kete
// image, slightly different "wash" so each industry feels its own without
// changing the underlying woven feather kete. Greens are explicitly avoided.
type Tint = { hueDeg: number; saturate: number; shadow: string };
const VARIANT_TINT: Record<KeteVariant, Tint> = {
  base:    { hueDeg:   0, saturate: 1.00, shadow: "drop-shadow(0 14px 30px rgba(120,150,180,0.18))" },
  manaaki: { hueDeg: -10, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(214,142,120,0.22))" }, // warm peach
  waihanga:{ hueDeg: -25, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(196,150,110,0.22))" }, // warm sand
  auaha:   { hueDeg:  35, saturate: 1.06, shadow: "drop-shadow(0 14px 30px rgba(155,142,196,0.22))" }, // soft lavender
  arataki: { hueDeg: -50, saturate: 1.04, shadow: "drop-shadow(0 14px 30px rgba(170,128,108,0.22))" }, // burnt clay
  pikau:   { hueDeg:  20, saturate: 1.04, shadow: "drop-shadow(0 14px 30px rgba(122,154,188,0.22))" }, // dusk blue
  hoko:    { hueDeg: -35, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(206,160,128,0.22))" }, // warm copper
  ako:     { hueDeg:  50, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(196,176,140,0.22))" }, // soft honey
  toro:    { hueDeg:  10, saturate: 1.03, shadow: "drop-shadow(0 14px 30px rgba(180,196,210,0.22))" }, // pale sky
};

interface FeatherKeteProps {
  variant?: KeteVariant;
  size?: number;
  opacity?: number;
  drift?: "slow" | "med" | "fast";
  className?: string;
  alt?: string;
}

export default function FeatherKete({
  variant = "base",
  size = 200,
  opacity = 1,
  drift = "med",
  className = "",
  alt = "",
}: FeatherKeteProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const speed = drift === "slow" ? 22000 : drift === "fast" ? 9000 : 14000;
    const phase = Math.random() * 2000;
    let raf = 0;
    const tick = () => {
      const t = performance.now() + phase;
      const y = Math.sin((t / speed) * Math.PI * 2) * 5;
      const x = Math.sin((t / (speed * 1.3)) * Math.PI * 2 + 0.7) * 3;
      const r = Math.sin((t / (speed * 1.6)) * Math.PI * 2) * 1.2; // gentle sway
      const s = 1 + Math.sin((t / (speed * 0.9)) * Math.PI * 2) * 0.012;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  const src = VARIANT_SRC[variant] ?? keteMaster;
  const tint = VARIANT_TINT[variant] ?? VARIANT_TINT.base;
  // More transparency overall, hue-rotate for industry tint, no green.
  const filter = `hue-rotate(${tint.hueDeg}deg) saturate(${tint.saturate}) ${tint.shadow}`;

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity: opacity * 0.42 }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      >
        <img
          src={src}
          alt={alt}
          aria-hidden={alt ? undefined : true}
          draggable={false}
          loading="lazy"
          width={1024}
          height={1024}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter,
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}

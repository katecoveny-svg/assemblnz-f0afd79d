import { useEffect, useRef } from "react";
// Single source of truth — every kete across the site is the same white feathered kete.
// Per-industry variants are accepted for backwards compatibility but always resolve
// to the master image, so branding stays cohesive everywhere.
import keteMaster from "@/assets/kete-white-master.png";

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
  | "toro";

// All variants resolve to the master white kete — this keeps the API stable
// for every existing caller while collapsing the visual to a single template.
const VARIANT_SRC: Record<KeteVariant, string> = {
  base: keteMaster,
  manaaki: keteMaster,
  waihanga: keteMaster,
  auaha: keteMaster,
  arataki: keteMaster,
  pikau: keteMaster,
  toro: keteMaster,
};

// Single soft pounamu drop-shadow for every kete, regardless of variant.
const MASTER_SHADOW = "drop-shadow(0 14px 30px rgba(74,165,168,0.18)) drop-shadow(0 4px 10px rgba(31,77,71,0.10))";

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
  const shadow = MASTER_SHADOW;

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity }}
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
            filter: shadow,
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}

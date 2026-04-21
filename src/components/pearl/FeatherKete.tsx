import { useEffect, useRef } from "react";
import keteBase from "@/assets/kete-feather-base.png";
import keteManaaki from "@/assets/kete-feather-manaaki.png";
import keteWaihanga from "@/assets/kete-feather-waihanga.png";
import keteAuaha from "@/assets/kete-feather-auaha.png";
import keteArataki from "@/assets/kete-feather-arataki.png";
import ketePikau from "@/assets/kete-feather-pikau.png";
import keteToro from "@/assets/kete-feather-toro.png";

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

const VARIANT_SRC: Record<KeteVariant, string> = {
  base: keteBase,
  manaaki: keteManaaki,
  waihanga: keteWaihanga,
  auaha: keteAuaha,
  arataki: keteArataki,
  pikau: ketePikau,
  toro: keteToro,
};

// Soft drop-shadow tint per variant — translucent pounamu by default,
// warmer / cooler accents per kete to harmonise with the feather palette.
const VARIANT_SHADOW: Record<KeteVariant, string> = {
  base: "drop-shadow(0 14px 28px rgba(31,77,71,0.10))",
  manaaki: "drop-shadow(0 14px 28px rgba(214,121,99,0.12))",
  waihanga: "drop-shadow(0 14px 28px rgba(140,82,40,0.14))",
  auaha: "drop-shadow(0 14px 28px rgba(80,120,160,0.14))",
  arataki: "drop-shadow(0 14px 28px rgba(70,80,95,0.14))",
  pikau: "drop-shadow(0 14px 28px rgba(40,70,110,0.16))",
  toro: "drop-shadow(0 14px 28px rgba(214,170,120,0.12))",
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

  const src = VARIANT_SRC[variant];
  const shadow = VARIANT_SHADOW[variant];

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

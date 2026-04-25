import { useEffect, useRef } from "react";
import ResponsiveKeteImage from "@/components/kete/ResponsiveKeteImage";
// Industry-specific kete artwork (uploaded by Kate). When a variant has its own
// image we use it directly — far richer than tinting the master. Otherwise we
// fall through to the responsive master kete with a subtle hue wash.
import keteManaaki from "@/assets/kete-feather-manaaki.png";
import keteWaihanga from "@/assets/kete-feather-waihanga.png";
import keteAuaha from "@/assets/kete-feather-auaha.png";
import keteArataki from "@/assets/kete-feather-arataki.png";
import ketePikau from "@/assets/kete-feather-pikau.png";
import keteToro from "@/assets/kete-feather-toro.png";
import keteHoko from "@/assets/kete-feather-hoko.png";
import keteAko from "@/assets/kete-feather-ako.png";

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

// Per-industry artwork. `null` means fall through to the master.
const VARIANT_IMAGE: Record<KeteVariant, string | null> = {
  base: null,
  manaaki: keteManaaki,
  waihanga: keteWaihanga,
  auaha: keteAuaha,
  arataki: keteArataki,
  pikau: ketePikau,
  hoko: keteHoko,
  ako: keteAko,
  toro: keteToro,
};

// Per-variant tint pushes the warm-pink kete photo toward each kete's
// LOCKED accent (Brand Guidelines v3 + project-knowledge). Applied to BOTH
// the master fallback AND industry artwork so the eight kete read as eight
// distinct objects, not the same photograph eight times.
type Tint = { hueDeg: number; saturate: number; shadow: string };
const VARIANT_TINT: Record<KeteVariant, Tint> = {
  base:    { hueDeg:   0, saturate: 1.00, shadow: "drop-shadow(0 14px 30px rgba(120,150,180,0.18))" },
  // MANAAKI · Warm Linen #E6D8C6 — neutral warm
  manaaki: { hueDeg:  -8, saturate: 0.95, shadow: "drop-shadow(0 14px 30px rgba(214,182,140,0.22))" },
  // WAIHANGA · Clay Sand #CBB8A4 — desaturated earth
  waihanga:{ hueDeg: -18, saturate: 0.85, shadow: "drop-shadow(0 14px 30px rgba(196,168,130,0.22))" },
  // AUAHA · Pale Seafoam #C8DDD8 — cool green-teal
  auaha:   { hueDeg:  85, saturate: 0.90, shadow: "drop-shadow(0 14px 30px rgba(155,196,184,0.22))" },
  // ARATAKI · Dusky Rose #D5C0C8 — keep warm pink (the artwork is already this hue)
  arataki: { hueDeg:   0, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(213,176,184,0.22))" },
  // PIKAU · Soft Moss #B8C7B1 — quiet sage green
  pikau:   { hueDeg:  60, saturate: 0.85, shadow: "drop-shadow(0 14px 30px rgba(166,188,158,0.22))" },
  // HOKO · Blush Stone #D8C3C2 — soft rose-stone
  hoko:    { hueDeg: -10, saturate: 0.85, shadow: "drop-shadow(0 14px 30px rgba(216,184,176,0.22))" },
  // AKO · Soft Sage #C7D6C7 — gentle green
  ako:     { hueDeg:  70, saturate: 0.85, shadow: "drop-shadow(0 14px 30px rgba(176,196,168,0.22))" },
  // TŌRO · Moonstone Blue #C7D9E8 — calm cool blue
  toro:    { hueDeg: 140, saturate: 0.80, shadow: "drop-shadow(0 14px 30px rgba(170,196,222,0.24))" },
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
      const r = Math.sin((t / (speed * 1.6)) * Math.PI * 2) * 1.2;
      const s = 1 + Math.sin((t / (speed * 0.9)) * Math.PI * 2) * 0.012;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  const tint = VARIANT_TINT[variant] ?? VARIANT_TINT.base;
  const industryImage = VARIANT_IMAGE[variant];

  // Apply hue-rotate + saturate to BOTH industry artwork and master fallback so
  // each kete carries its locked accent colour (otherwise all eight cards read
  // as the same warm-pink photograph).
  const filter = `hue-rotate(${tint.hueDeg}deg) saturate(${tint.saturate}) ${tint.shadow}`;

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
        {industryImage ? (
          <img
            src={industryImage}
            alt={alt}
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter,
              userSelect: "none",
              // Soft radial mask dissolves the photo's cream square edge into
              // whatever sits behind the kete (no boxed border).
              maskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, rgba(0,0,0,0.6) 72%, transparent 92%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, rgba(0,0,0,0.6) 72%, transparent 92%)",
            }}
          />
        ) : (
          <ResponsiveKeteImage
            displayWidth={size}
            alt={alt}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter,
              userSelect: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

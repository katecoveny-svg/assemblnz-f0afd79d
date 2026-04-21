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
  hoko: null,
  ako: null,
  toro: keteToro,
};

// Per-variant subtle drop-shadow + hue tint. Hue/saturate is only applied when
// we fall through to the master image — industry-specific artwork uses its own
// natural colour, with just the shadow added for depth.
type Tint = { hueDeg: number; saturate: number; shadow: string };
const VARIANT_TINT: Record<KeteVariant, Tint> = {
  base:    { hueDeg:   0, saturate: 1.00, shadow: "drop-shadow(0 14px 30px rgba(120,150,180,0.18))" },
  manaaki: { hueDeg: -10, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(214,142,120,0.22))" },
  waihanga:{ hueDeg: -25, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(196,150,110,0.22))" },
  auaha:   { hueDeg:  35, saturate: 1.06, shadow: "drop-shadow(0 14px 30px rgba(155,142,196,0.22))" },
  arataki: { hueDeg: -50, saturate: 1.04, shadow: "drop-shadow(0 14px 30px rgba(170,128,108,0.22))" },
  pikau:   { hueDeg:  20, saturate: 1.04, shadow: "drop-shadow(0 14px 30px rgba(122,154,188,0.22))" },
  hoko:    { hueDeg: -35, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(206,160,128,0.22))" },
  ako:     { hueDeg:  50, saturate: 1.05, shadow: "drop-shadow(0 14px 30px rgba(196,176,140,0.22))" },
  toro:    { hueDeg:  10, saturate: 1.03, shadow: "drop-shadow(0 14px 30px rgba(180,196,210,0.22))" },
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

  // For industry artwork: just the drop-shadow. For master fallback: hue-rotate too.
  const filter = industryImage
    ? tint.shadow
    : `hue-rotate(${tint.hueDeg}deg) saturate(${tint.saturate}) ${tint.shadow}`;

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
              // Soft radial mask so the photo's cream square background
              // dissolves into whatever sits behind the kete (no boxed edge).
              maskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, rgba(0,0,0,0.6) 72%, transparent 92%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, black 50%, rgba(0,0,0,0.6) 72%, transparent 92%)",
              mixBlendMode: "multiply",
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

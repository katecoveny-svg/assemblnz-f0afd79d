import { Suspense, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

const InteractiveKeteHero = lazy(() => import("@/components/kete/InteractiveKeteHero"));

// Kept for backwards compatibility — every kete now uses the photoreal feather-kete visual,
// tinted per industry. The `model` prop is accepted but ignored.
export type IndustryModel = "wine-glass" | "hard-hat" | "palette" | "car" | "container";

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight?: string;
  model?: IndustryModel;
  size?: number;
  variant?: KeteVariant;
  /** "cinematic" — full-bleed dramatic hero. "centerpiece" — floating dashboard hero. */
  display?: "cinematic" | "centerpiece";
}

// Map accent hex → tint hue/saturation for the master white kete.
function tintFromAccent(accent: string): { hueDeg: number; saturate: number } {
  const a = accent.toUpperCase();
  // Pounamu / forest greens
  if (a.includes("3A7D6E") || a.includes("7ECFC2") || a.includes("1F4D47") || a.includes("4AA5A8")) {
    return { hueDeg: 0, saturate: 1.0 };
  }
  // Auaha lavender
  if (a.includes("9B8EC4") || a.includes("A8DDDB")) return { hueDeg: 35, saturate: 1.06 };
  // Auaha orange / Hoko clay
  if (a.includes("E8702A") || a.includes("C66B5C")) return { hueDeg: -35, saturate: 1.05 };
  // Arataki blue
  if (a.includes("7A9ABC") || a.includes("4A6FA5") || a.includes("7BA7C7")) return { hueDeg: 20, saturate: 1.04 };
  // Pikau teal-leaning
  if (a.includes("5AADA0")) return { hueDeg: 0, saturate: 1.0 };
  return { hueDeg: 0, saturate: 1.0 };
}

export default function LandingKeteHero({
  accentColor,
  size = 360,
  display = "centerpiece",
}: LandingKeteHeroProps) {
  const tint = tintFromAccent(accentColor);

  return (
    <Suspense
      fallback={
        <div
          className="rounded-full animate-pulse mb-10"
          style={{ width: size, height: size, background: `${accentColor}10` }}
        />
      }
    >
      <div className="relative mb-10 flex items-center justify-center">
        <InteractiveKeteHero
          size={size}
          accent={accentColor}
          tintHue={tint.hueDeg}
          tintSaturate={tint.saturate}
          variant={display}
          sparkles
          sparkleCount={display === "cinematic" ? 42 : 24}
        />
      </div>
    </Suspense>
  );
}

import { Suspense, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

const InteractiveKeteHero = lazy(() => import("@/components/kete/InteractiveKeteHero"));

// Kept for backwards compatibility — every kete now uses the photoreal feather-kete visual,
// industry-specific where Kate has provided artwork. The `model` prop is accepted but ignored.
export type IndustryModel = "wine-glass" | "hard-hat" | "palette" | "car" | "container";
export type IndustrySlug = "manaaki" | "waihanga" | "auaha" | "arataki" | "pikau" | "toro";

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight?: string;
  model?: IndustryModel;
  size?: number;
  variant?: KeteVariant;
  /** "cinematic" — full-bleed dramatic hero. "centerpiece" — floating dashboard hero. */
  display?: "cinematic" | "centerpiece";
  /** Industry slug — when set, swaps the master kete for Kate's industry artwork. */
  industry?: IndustrySlug;
}

// Map accent hex → industry slug fallback so legacy callers automatically pick
// up the right artwork without needing every page edited.
function industryFromAccent(accent: string): IndustrySlug | undefined {
  const a = accent.toUpperCase();
  // Pikau — pounamu / freight / customs
  if (a.includes("1F4D47") || a.includes("3A7D6E") || a.includes("5AADA0") || a.includes("7ECFC2")) {
    return "pikau";
  }
  // Manaaki — hospitality teal/gold
  if (a.includes("4AA5A8") || a.includes("E07A5F") || a.includes("E8C76A")) return "manaaki";
  // Auaha — creative lavender
  if (a.includes("9B8EC4") || a.includes("A8DDDB") || a.includes("7B2FF7")) return "auaha";
  // Waihanga — construction sand/sage
  if (a.includes("C66B5C") || a.includes("D89B6E") || a.includes("8FA68C")) return "waihanga";
  // Arataki — automotive blue
  if (a.includes("7A9ABC") || a.includes("4A6FA5") || a.includes("7BA7C7") || a.includes("E63946")) {
    return "arataki";
  }
  return undefined;
}

// Map accent hex → tint hue/saturation (used as a soft secondary wash on top
// of the industry artwork — not a replacement).
function tintFromAccent(accent: string): { hueDeg: number; saturate: number } {
  const a = accent.toUpperCase();
  if (a.includes("3A7D6E") || a.includes("7ECFC2") || a.includes("1F4D47") || a.includes("4AA5A8")) {
    return { hueDeg: 0, saturate: 1.0 };
  }
  if (a.includes("9B8EC4") || a.includes("A8DDDB")) return { hueDeg: 35, saturate: 1.06 };
  if (a.includes("E8702A") || a.includes("C66B5C")) return { hueDeg: -35, saturate: 1.05 };
  if (a.includes("7A9ABC") || a.includes("4A6FA5") || a.includes("7BA7C7")) return { hueDeg: 20, saturate: 1.04 };
  if (a.includes("5AADA0")) return { hueDeg: 0, saturate: 1.0 };
  return { hueDeg: 0, saturate: 1.0 };
}

export default function LandingKeteHero({
  accentColor,
  size = 360,
  display = "centerpiece",
  industry,
}: LandingKeteHeroProps) {
  const tint = tintFromAccent(accentColor);
  const resolvedIndustry = industry ?? industryFromAccent(accentColor);

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
          tintHue={resolvedIndustry ? 0 : tint.hueDeg}
          tintSaturate={resolvedIndustry ? 1 : tint.saturate}
          variant={display}
          industry={resolvedIndustry}
          sparkles
          sparkleCount={display === "cinematic" ? 42 : 24}
        />
      </div>
    </Suspense>
  );
}

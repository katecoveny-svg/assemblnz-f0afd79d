import React, { Suspense, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

/**
 * KeteSigil — canonical kete marker.
 *
 * LOCKED 2026-04-21: every kete on the site renders the same fluffy white
 * feathered kete (FeatherKete master image) with only a subtle per-industry
 * rim wash. No bespoke woven baskets, no per-kete emblems — one kete, one
 * aesthetic, at every scale.
 *
 * The original `kete` / `accent` / `accentLight` / `animated` props are kept
 * for backwards compatibility so existing callers (KeteDashboardShell,
 * LiveDataRibbon, etc.) keep working without edits.
 */

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

type LegacyKete =
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "toro"
  | "pikau"
  | "hoko"
  | "ako"
  | "te-kahui-reo"
  | "auraki"
  | "base";

interface Props {
  kete: LegacyKete;
  size?: number;
  /** Kept for API compatibility — visual tint comes from FeatherKete variant. */
  accent?: string;
  /** Kept for API compatibility — visual tint comes from FeatherKete variant. */
  accentLight?: string;
  className?: string;
  /** Kept for API compatibility — FeatherKete handles its own gentle drift. */
  animated?: boolean;
}

// Map every legacy kete key onto a canonical FeatherKete variant.
// Retired / generic keys fall back to `base` (untinted master kete).
const KETE_TO_VARIANT: Record<LegacyKete, KeteVariant> = {
  manaaki: "manaaki",
  waihanga: "waihanga",
  auaha: "auaha",
  arataki: "arataki",
  toro: "toro",
  pikau: "pikau",
  hoko: "hoko",
  ako: "ako",
  "te-kahui-reo": "base",
  auraki: "base",
  base: "base",
};

const KeteSigil: React.FC<Props> = ({ kete, size = 56, className }) => {
  const variant = KETE_TO_VARIANT[kete] ?? "base";

  return (
    <div
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-label={`${kete} kete`}
      role="img"
    >
      <Suspense fallback={null}>
        <FeatherKete variant={variant} size={size} drift="slow" />
      </Suspense>
    </div>
  );
};

export default KeteSigil;

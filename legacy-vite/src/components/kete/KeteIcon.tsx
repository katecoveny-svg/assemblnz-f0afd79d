import React, { Suspense, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

/**
 * KeteIcon — LOCKED 2026-04-22
 *
 * Brand Bible v2.0 mandates ONE kete vocabulary at every scale: the canonical
 * fluffy feather kete (woven harakeke base, feathery crown rising up, Mist
 * cloud nest, Soft Gold sparkles). The legacy SVG/woven illustration is
 * retired — every call site now renders the canonical FeatherKete via a
 * thin compatibility shim that preserves the old prop API.
 */

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

interface KeteIconProps {
  name: string;
  /** Kept for API compatibility — visual tint comes from FeatherKete variant. */
  accentColor: string;
  /** Kept for API compatibility — visual tint comes from FeatherKete variant. */
  accentLight: string;
  /** Kept for API compatibility — no longer used; one variant per industry. */
  variant?: "standard" | "dense" | "organic" | "tricolor" | "warm";
  size?: "small" | "medium" | "large";
  /** Kept for API compatibility — FeatherKete handles its own gentle drift. */
  animated?: boolean;
}

// Map an industry name (case-insensitive, with or without diacritics) onto
// the canonical FeatherKete variant. Anything unknown falls through to base.
const NAME_TO_VARIANT: Record<string, KeteVariant> = {
  manaaki: "manaaki",
  waihanga: "waihanga",
  hanga: "waihanga",
  auaha: "auaha",
  arataki: "arataki",
  pikau: "pikau",
  hoko: "hoko",
  ako: "ako",
  toro: "toro",
  toroa: "toro",
  toora: "toro",
};

const SIZE_PX: Record<NonNullable<KeteIconProps["size"]>, number> = {
  small: 80,
  medium: 160,
  large: 224,
};

const KeteIcon: React.FC<KeteIconProps> = ({ name, size = "medium" }) => {
  const key = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const variant = NAME_TO_VARIANT[key] ?? "base";
  const px = SIZE_PX[size];

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: px, height: px }}
      role="img"
      aria-label={`${name || "Assembl"} kete`}
    >
      <Suspense fallback={null}>
        <FeatherKete variant={variant} size={px} drift="slow" />
      </Suspense>
    </div>
  );
};

export default KeteIcon;

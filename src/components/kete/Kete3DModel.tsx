import React, { Suspense, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

/**
 * Kete3DModel — LOCKED 2026-04-22
 *
 * Retired: the previous three.js woven basket model. Brand Bible v2.0 locks
 * ONE kete vocabulary site-wide. This component now renders the canonical
 * FeatherKete with the same footprint, preserving the prop API so existing
 * call sites continue to work without edits.
 */

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

interface Kete3DModelProps {
  accentColor: string;
  accentLight: string;
  size?: number;
  className?: string;
  variant?: KeteVariant;
}

const ACCENT_TO_VARIANT: Record<string, KeteVariant> = {
  "#B8C7B1": "pikau",
  "#D8C3C2": "hoko",
  "#C7D6C7": "ako",
  "#C7D9E8": "toro",
  "#E6D8C6": "manaaki",
  "#CBB8A4": "waihanga",
  "#D5C0C8": "arataki",
  "#C8DDD8": "auaha",
};

const Kete3DModel: React.FC<Kete3DModelProps> = ({
  accentColor,
  size = 200,
  className = "",
  variant,
}) => {
  const resolved =
    variant ?? ACCENT_TO_VARIANT[accentColor?.toUpperCase?.() ?? ""] ?? "base";

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Suspense fallback={null}>
        <FeatherKete variant={resolved} size={size} drift="slow" />
      </Suspense>
    </div>
  );
};

export default Kete3DModel;

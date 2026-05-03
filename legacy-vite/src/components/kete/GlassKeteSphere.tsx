import React, { Suspense, forwardRef, lazy } from "react";
import type { KeteVariant } from "@/components/pearl/FeatherKete";

/**
 * GlassKeteSphere — LOCKED 2026-04-22
 *
 * Retired: the previous luminescent glass orb (three.js + MeshTransmissionMaterial).
 * Brand Bible v2.0 locks ONE kete vocabulary site-wide: the canonical fluffy
 * feather kete. This component now renders FeatherKete at the same footprint,
 * preserving the GlassKeteSphere prop API so existing call sites continue to
 * work without edits.
 */

const FeatherKete = lazy(() => import("@/components/pearl/FeatherKete"));

interface GlassKeteSphereProps {
  /** Kept for API compatibility — visual tint comes from variant lookup. */
  accentColor: string;
  /** Kept for API compatibility. */
  accentLight: string;
  /** Render size in CSS pixels */
  size?: number;
  className?: string;
  /** Kept for API compatibility (no longer used). */
  swirlCount?: number;
  /** Optional explicit kete variant. If omitted we infer from accentColor. */
  variant?: KeteVariant;
}

// Best-effort mapping from accent hex → canonical kete variant. This lets old
// call sites that only pass a colour still get the right industry kete.
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

const GlassKeteSphere = forwardRef<HTMLDivElement, GlassKeteSphereProps>(
  ({ accentColor, size = 200, className = "", variant }, ref) => {
    const resolved =
      variant ?? ACCENT_TO_VARIANT[accentColor?.toUpperCase?.() ?? ""] ?? "base";

    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        <Suspense fallback={null}>
          <FeatherKete variant={resolved} size={size} drift="slow" />
        </Suspense>
      </div>
    );
  }
);

GlassKeteSphere.displayName = "GlassKeteSphere";

export default GlassKeteSphere;

// Shared cosmic 3D glass styles and brand constants
export const BRAND = {
  cyan: "#00E5FF",
  purple: "#B388FF",
  deepBlue: "#6366F1",
  emerald: "#00E5A0",
  black: "#09090B",
  white: "#FFFFFF",
};

export const TURF_ACCENT = "#00FF88";
export const AURA_ACCENT = "#00E5A0";
export const PRISM_ACCENT = "#E040FB";
export const HAVEN_ACCENT = "#FF80AB";
export const HELM_ACCENT = "#B388FF";

export const cosmicGradient = `radial-gradient(ellipse at 30% 20%, ${BRAND.deepBlue}40 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${BRAND.purple}30 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${BRAND.cyan}15 0%, transparent 70%), linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #050510 100%)`;

export const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: undefined, // no backdropFilter in sandbox
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
};

export const glassCardStyle: React.CSSProperties = {
  ...glassStyle,
  padding: "24px 28px",
};

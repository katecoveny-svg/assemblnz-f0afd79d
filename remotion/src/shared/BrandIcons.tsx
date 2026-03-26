import React from "react";

// Branded SVG icons for Remotion videos — no CSS animations (use frame-based only)
// All icons use brand accent colors passed as props

type IP = { size?: number; color: string; glow?: number };

// ── TURF Icons ──

export const IconConstitution: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="32" height="40" rx="4" stroke={color} strokeWidth="2" fill={`${color}15`}
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }} />
    <rect x="14" y="2" width="20" height="6" rx="2" stroke={color} strokeWidth="1.5" fill="#0a0a1a" />
    <circle cx="24" cy="5" r="1.5" fill={color} />
    <path d="M15 16h18M15 22h14M15 28h16M15 34h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M34 30l-4 4-2-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconFacility: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="6" y="14" width="36" height="30" rx="3" stroke={color} strokeWidth="2" fill={`${color}10`}
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }} />
    <path d="M6 20h36" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
    <rect x="12" y="24" width="8" height="8" rx="1" fill={`${color}30`} stroke={color} strokeWidth="1" />
    <rect x="28" y="24" width="8" height="8" rx="1" fill={`${color}30`} stroke={color} strokeWidth="1" />
    <rect x="18" y="36" width="12" height="8" rx="1" fill={`${color}20`} stroke={color} strokeWidth="1" />
    <path d="M24 4v10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M20 8h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconGrant: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2" fill={`${color}08`}
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }} />
    <path d="M24 12v24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 20c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3-2 4-6 5-4-1-6-2-6-5z" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
    <path d="M30 28c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3 2-4 6-5 4 1 6 2 6 5z" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconMembership: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <circle cx="24" cy="14" r="8" stroke={color} strokeWidth="2" fill={`${color}15`} />
    <path d="M10 40c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke={color} strokeWidth="2" strokeLinecap="round" fill={`${color}08`} />
    <circle cx="36" cy="14" r="5" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill={`${color}0a`} />
    <circle cx="12" cy="14" r="5" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill={`${color}0a`} />
  </svg>
);

export const IconAGM: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <rect x="4" y="8" width="40" height="32" rx="4" stroke={color} strokeWidth="2" fill={`${color}08`} />
    <path d="M4 16h40" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
    <circle cx="16" cy="28" r="4" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
    <circle cx="32" cy="28" r="4" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
    <path d="M20 28h8" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="2 2" />
    <rect x="10" y="10" width="6" height="4" rx="1" fill={`${color}40`} />
  </svg>
);

export const IconCompliance: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <path d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z" stroke={color} strokeWidth="2" fill={`${color}10`} />
    <path d="M18 24l4 4 8-8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── AURA Icons ──

export const IconMenuPOS: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <rect x="6" y="6" width="36" height="36" rx="4" stroke={color} strokeWidth="2" fill={`${color}08`} />
    <path d="M6 18h36" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
    <rect x="12" y="22" width="10" height="6" rx="1" fill={`${color}25`} stroke={color} strokeWidth="1" />
    <rect x="26" y="22" width="10" height="6" rx="1" fill={`${color}20`} stroke={color} strokeWidth="1" />
    <rect x="12" y="32" width="10" height="6" rx="1" fill={`${color}15`} stroke={color} strokeWidth="1" />
    <path d="M14 10h8M14 14h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <circle cx="36" cy="12" r="3" fill={`${color}40`} />
  </svg>
);

export const IconFoodSafety: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <rect x="8" y="4" width="32" height="40" rx="3" stroke={color} strokeWidth="2" fill={`${color}08`} />
    <circle cx="24" cy="20" r="10" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
    <path d="M24 14v6l4 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 36h20M14 40h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M18 8h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

export const IconGuestMemory: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <circle cx="24" cy="16" r="10" stroke={color} strokeWidth="2" fill={`${color}10`} />
    <path d="M24 10v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="24" cy="16" r="2" fill={`${color}50`} />
    <path d="M12 38c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M30 30l4 2M18 30l-4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
    <circle cx="20" cy="14" r="1" fill={color} />
    <circle cx="28" cy="14" r="1" fill={color} />
  </svg>
);

export const IconReservation: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <rect x="6" y="8" width="36" height="34" rx="4" stroke={color} strokeWidth="2" fill={`${color}08`} />
    <path d="M6 18h36" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M14 4v8M34 4v8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <rect x="12" y="22" width="8" height="8" rx="2" fill={`${color}30`} />
    <rect x="24" y="22" width="8" height="8" rx="2" fill={`${color}20`} />
    <rect x="12" y="32" width="8" height="6" rx="2" fill={`${color}15`} />
    <circle cx="28" cy="35" r="3" stroke={color} strokeWidth="1.5" fill={`${color}25`} />
  </svg>
);

export const IconStaffRoster: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <circle cx="16" cy="14" r="6" stroke={color} strokeWidth="2" fill={`${color}15`} />
    <circle cx="34" cy="14" r="5" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" fill={`${color}0a`} />
    <path d="M6 38c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" fill={`${color}08`} />
    <path d="M28 36c0-4 3-7 6-7s6 3 6 7" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
    <rect x="20" y="30" width="8" height="4" rx="1" fill={`${color}30`} stroke={color} strokeWidth="1" />
  </svg>
);

export const IconRevenue: React.FC<IP> = ({ size = 48, color, glow = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${color})` : undefined }}>
    <rect x="4" y="8" width="40" height="32" rx="4" stroke={color} strokeWidth="2" fill={`${color}06`} />
    <path d="M10 34L18 24L26 28L38 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="24" r="2" fill={`${color}50`} />
    <circle cx="26" cy="28" r="2" fill={`${color}50`} />
    <circle cx="38" cy="14" r="2.5" fill={color} />
    <path d="M38 14v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

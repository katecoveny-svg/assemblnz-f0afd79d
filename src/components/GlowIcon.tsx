/**
 * GlowIcon — Drop-in replacement for Lucide icons.
 * Renders custom inline SVGs with gradient fills, glow filters, and depth effects.
 * Uses the Whenua palette: Kōwhai, Pounamu, Tāngaroa, Celestial.
 *
 * Usage:  <GlowIcon name="HardHat" size={24} color="#3A7D6E" />
 */

interface GlowIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}

const uid = (n: string) => `gi-${n}-${Math.random().toString(36).slice(2,6)}`;

const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const lighten = (hex: string) => {
  const h = hex.replace("#", "");
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + 50);
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + 50);
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + 50);
  return `rgb(${r},${g},${b})`;
};

// Each icon is a function that returns the SVG innards
const ICONS: Record<string, (s: number, c: string, c2: string, gid: string, fid: string) => JSX.Element> = {
  // Navigation & General
  LayoutDashboard: (s, c, c2, gid, fid) => (
    <>
      <rect x="3" y="3" width="8" height="9" rx="1.5" fill={`url(#${gid})`} filter={`url(#${fid})`} />
      <rect x="13" y="3" width="8" height="5" rx="1.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.6" />
    </>
  ),
  HardHat: (s, c, c2, gid, fid) => (
    <>
      <path d="M2 18a1 1 0 001 1h18a1 1 0 001-1v-2a1 1 0 00-1-1H3a1 1 0 00-1 1v2z" fill={`url(#${gid})`} filter={`url(#${fid})`} />
      <path d="M10 15V6a2 2 0 114 0v9" stroke={c} strokeWidth="1.5" fill="none" opacity="0.8" />
      <path d="M6 15V9a6 6 0 0112 0v6" stroke={c} strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  ),
  Palette: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="12" r="9" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <circle cx="9" cy="9" r="1.5" fill={c2} opacity="0.9" />
      <circle cx="15" cy="9" r="1.5" fill={c} opacity="0.8" />
      <circle cx="9" cy="15" r="1.5" fill={c} opacity="0.7" />
      <circle cx="15" cy="15" r="1.5" fill={c2} opacity="0.6" />
      <path d="M19 12a7 7 0 01-14 0 7 7 0 0114 0z" stroke={c} strokeWidth="0.8" fill="none" opacity="0.4" />
    </>
  ),
  UtensilsCrossed: (s, c, c2, gid, fid) => (
    <>
      <path d="M16 2l-4 4-1.5-1.5M2 16l4-4 1.5 1.5" stroke={c} strokeWidth="1.5" fill="none" filter={`url(#${fid})`} />
      <line x1="6" y1="6" x2="18" y2="18" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
      <line x1="18" y1="6" x2="6" y2="18" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} opacity="0.7" />
      <circle cx="12" cy="12" r="2" fill={c2} opacity="0.5" />
    </>
  ),
  Briefcase: (s, c, c2, gid, fid) => (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={c} strokeWidth="1.2" fill="none" opacity="0.6" />
      <line x1="2" y1="13" x2="22" y2="13" stroke={c2} strokeWidth="0.8" opacity="0.3" />
    </>
  ),
  Cpu: (s, c, c2, gid, fid) => (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <rect x="8" y="8" width="8" height="8" rx="1" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.6" />
      <line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="12" y1="20" x2="12" y2="22" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="2" y1="12" x2="4" y2="12" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.5" opacity="0.5" />
    </>
  ),
  Globe: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="12" r="9" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.4" />
      <line x1="3" y1="12" x2="21" y2="12" stroke={c2} strokeWidth="0.8" opacity="0.3" />
      <path d="M4.5 7.5h15M4.5 16.5h15" stroke={c2} strokeWidth="0.6" opacity="0.25" />
    </>
  ),
  Bird: (s, c, c2, gid, fid) => (
    <>
      <path d="M16 4c-2 0-4 2-4 4s1 3 2 4l-4 6-2-1 4-8c-1-1-2-3-2-5s2-4 4-4c1 0 2.5.5 3.5 2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M18 6c1 0 3 1 3 3s-1 3-3 4l-2-1" stroke={c} strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="16.5" cy="6.5" r="1" fill={c2} opacity="0.9" />
    </>
  ),
  Shield: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 2l8 4v5c0 5.5-3.8 10-8 11-4.2-1-8-5.5-8-11V6l8-4z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <path d="M9 12l2 2 4-4" stroke={c2} strokeWidth="1.5" fill="none" opacity="0.8" />
    </>
  ),
  // Creative & Media
  PenTool: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 19l7-7 3 3-7 7H12v-3z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18" stroke={c} strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="11" cy="11" r="2" fill={c2} opacity="0.5" />
    </>
  ),
  Image: (s, c, c2, gid, fid) => (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <circle cx="8.5" cy="8.5" r="1.5" fill={c2} opacity="0.8" />
      <path d="M21 15l-5-5L5 21" stroke={c2} strokeWidth="1.2" fill="none" opacity="0.5" />
    </>
  ),
  Video: (s, c, c2, gid, fid) => (
    <>
      <rect x="2" y="5" width="14" height="14" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <path d="M16 10l6-3v10l-6-3v-4z" fill={c} opacity="0.6" filter={`url(#${fid})`} />
    </>
  ),
  Mic: (s, c, c2, gid, fid) => (
    <>
      <rect x="9" y="2" width="6" height="11" rx="3" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M5 10a7 7 0 0014 0" stroke={c} strokeWidth="1.2" fill="none" opacity="0.5" />
      <line x1="12" y1="17" x2="12" y2="21" stroke={c} strokeWidth="1.5" opacity="0.4" />
      <line x1="8" y1="21" x2="16" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </>
  ),
  Megaphone: (s, c, c2, gid, fid) => (
    <>
      <path d="M18 3v18l-6-4H6a2 2 0 01-2-2V9a2 2 0 012-2h6l6-4z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M20 9a4 4 0 010 6" stroke={c2} strokeWidth="1.2" fill="none" opacity="0.5" />
    </>
  ),
  Calendar: (s, c, c2, gid, fid) => (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={c2} strokeWidth="0.8" opacity="0.4" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  BarChart3: (s, c, c2, gid, fid) => (
    <>
      <rect x="4" y="12" width="4" height="8" rx="1" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.6" />
      <rect x="10" y="6" width="4" height="14" rx="1" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <rect x="16" y="2" width="4" height="18" rx="1" fill={`url(#${gid})`} filter={`url(#${fid})`} />
    </>
  ),
  Fingerprint: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 10a2 2 0 00-2 2c0 1.5 1 3 2 4" stroke={`url(#${gid})`} strokeWidth="1.5" fill="none" filter={`url(#${fid})`} />
      <path d="M7.5 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 2-1 4-2 5.5" stroke={c} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M5 12c0-3.9 3.1-7 7-7s7 3.1 7 7c0 3-1.5 5.5-3 7.5" stroke={c} strokeWidth="1" fill="none" opacity="0.4" />
    </>
  ),
  // Business & Operations
  Eye: (s, c, c2, gid, fid) => (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.6" />
      <circle cx="12" cy="12" r="3" fill={c2} opacity="0.8" />
    </>
  ),
  Heart: (s, c, c2, gid, fid) => (
    <>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
    </>
  ),
  DollarSign: (s, c, c2, gid, fid) => (
    <>
      <line x1="12" y1="1" x2="12" y2="23" stroke={`url(#${gid})`} strokeWidth="2" filter={`url(#${fid})`} />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={c} strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  ),
  FileText: (s, c, c2, gid, fid) => (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <path d="M14 2v6h6" stroke={c2} strokeWidth="1" fill="none" opacity="0.5" />
      <line x1="8" y1="13" x2="16" y2="13" stroke={c2} strokeWidth="0.8" opacity="0.3" />
      <line x1="8" y1="17" x2="14" y2="17" stroke={c2} strokeWidth="0.8" opacity="0.25" />
    </>
  ),
  TrendingUp: (s, c, c2, gid, fid) => (
    <>
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <path d="M17 6h6v6" stroke={c} strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  ),
  // Chat & Communication
  MessageSquare: (s, c, c2, gid, fid) => (
    <>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <line x1="8" y1="9" x2="16" y2="9" stroke={c2} strokeWidth="0.8" opacity="0.4" />
      <line x1="8" y1="13" x2="13" y2="13" stroke={c2} strokeWidth="0.8" opacity="0.3" />
    </>
  ),
  Phone: (s, c, c2, gid, fid) => (
    <>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
    </>
  ),
  // Technology & Settings
  Settings: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="12" r="3" fill={c2} opacity="0.7" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={`url(#${gid})`} strokeWidth="1.2" fill="none" filter={`url(#${fid})`} />
    </>
  ),
  Sparkles: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.9" />
      <path d="M19 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill={c2} opacity="0.5" />
    </>
  ),
  Brain: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 2a5 5 0 00-5 5c0 1.5.5 2.5 1 3.5L6 14a4 4 0 002 7h8a4 4 0 002-7l-2-3.5c.5-1 1-2 1-3.5a5 5 0 00-5-5z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      <line x1="12" y1="2" x2="12" y2="21" stroke={c2} strokeWidth="0.6" opacity="0.3" />
      <path d="M8 8c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.4" />
    </>
  ),
  Zap: (s, c, c2, gid, fid) => (
    <>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.85" />
    </>
  ),
  ArrowRight: (s, c, c2, gid, fid) => (
    <>
      <line x1="5" y1="12" x2="19" y2="12" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
      <path d="M12 5l7 7-7 7" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    </>
  ),
  Plus: (s, c, c2, gid, fid) => (
    <>
      <line x1="12" y1="5" x2="12" y2="19" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
      <line x1="5" y1="12" x2="19" y2="12" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
    </>
  ),
  Check: (s, c, c2, gid, fid) => (
    <>
      <path d="M20 6L9 17l-5-5" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter={`url(#${fid})`} />
    </>
  ),
  X: (s, c, c2, gid, fid) => (
    <>
      <line x1="18" y1="6" x2="6" y2="18" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
      <line x1="6" y1="6" x2="18" y2="18" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} opacity="0.7" />
    </>
  ),
  Users: (s, c, c2, gid, fid) => (
    <>
      <circle cx="9" cy="7" r="4" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.6" />
      <circle cx="17" cy="7" r="3" stroke={c} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M21 21v-2a3 3 0 00-2-2.8" stroke={c} strokeWidth="1" fill="none" opacity="0.3" />
    </>
  ),
  Target: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="12" r="9" stroke={`url(#${gid})`} strokeWidth="1.5" fill="none" filter={`url(#${fid})`} />
      <circle cx="12" cy="12" r="5" stroke={c} strokeWidth="1.2" fill="none" opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill={c2} opacity="0.9" />
    </>
  ),
  Rocket: (s, c, c2, gid, fid) => (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" fill={c} opacity="0.4" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <circle cx="16" cy="8" r="1.5" fill={c2} opacity="0.7" />
    </>
  ),
  Lightbulb: (s, c, c2, gid, fid) => (
    <>
      <path d="M9 18h6M10 22h4" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M15 14c1-1.5 2-3 2-5a5 5 0 00-10 0c0 2 1 3.5 2 5h6z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
    </>
  ),
  Pipette: (s, c, c2, gid, fid) => (
    <>
      <path d="M2 22l1-1h3l9-9" stroke={`url(#${gid})`} strokeWidth="1.5" fill="none" filter={`url(#${fid})`} />
      <path d="M14 6l3-3a2 2 0 013 0l1 1a2 2 0 010 3l-3 3" stroke={c} strokeWidth="1.5" fill="none" opacity="0.6" />
      <rect x="12" y="8" width="6" height="6" rx="1" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.5" transform="rotate(45 15 11)" />
    </>
  ),
  Timer: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="13" r="8" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <line x1="12" y1="9" x2="12" y2="13" stroke={c2} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="12" y1="13" x2="15" y2="13" stroke={c2} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="10" y1="2" x2="14" y2="2" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="12" y1="2" x2="12" y2="5" stroke={c} strokeWidth="1.2" opacity="0.4" />
    </>
  ),
  Activity: (s, c, c2, gid, fid) => (
    <>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" filter={`url(#${fid})`} />
    </>
  ),
  Send: (s, c, c2, gid, fid) => (
    <>
      <path d="M22 2L11 13" stroke={c2} strokeWidth="1.2" opacity="0.5" />
      <path d="M22 2L15 22l-4-9-9-4z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
    </>
  ),
  ChevronLeft: (s, c, c2, gid, fid) => (
    <path d="M15 18l-6-6 6-6" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
  ),
  ChevronRight: (s, c, c2, gid, fid) => (
    <path d="M9 18l6-6-6-6" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
  ),
  Copy: (s, c, c2, gid, fid) => (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" />
    </>
  ),
  Download: (s, c, c2, gid, fid) => (
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M7 10l5 5 5-5" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <line x1="12" y1="3" x2="12" y2="15" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
    </>
  ),
  Upload: (s, c, c2, gid, fid) => (
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M17 8l-5-5-5 5" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <line x1="12" y1="3" x2="12" y2="15" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
    </>
  ),
  Trash2: (s, c, c2, gid, fid) => (
    <>
      <path d="M3 6h18" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.6" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" />
    </>
  ),
  RefreshCw: (s, c, c2, gid, fid) => (
    <>
      <path d="M23 4v6h-6" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <path d="M1 20v-6h6" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" />
    </>
  ),
  Wand2: (s, c, c2, gid, fid) => (
    <>
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M10.8 4.8l1.4 1.4M17.8 6.2l1.4-1.4M10.8 13.2l1.4-1.4" stroke={c2} strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="22" x2="15" y2="9" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" filter={`url(#${fid})`} />
    </>
  ),
  Code: (s, c, c2, gid, fid) => (
    <>
      <path d="M16 18l6-6-6-6" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${fid})`} />
      <path d="M8 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </>
  ),
  Lock: (s, c, c2, gid, fid) => (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="1.5" fill="none" opacity="0.5" />
    </>
  ),
  Radio: (s, c, c2, gid, fid) => (
    <>
      <circle cx="12" cy="12" r="2" fill={c2} opacity="0.9" />
      <path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49" stroke={`url(#${gid})`} strokeWidth="1.5" fill="none" filter={`url(#${fid})`} />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" stroke={c} strokeWidth="1" fill="none" opacity="0.4" />
    </>
  ),
  Database: (s, c, c2, gid, fid) => (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
      <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" stroke={c} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" />
    </>
  ),
  Wrench: (s, c, c2, gid, fid) => (
    <>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.8" />
    </>
  ),
  Bot: (s, c, c2, gid, fid) => (
    <>
      {/* head */}
      <rect x="4" y="7" width="16" height="13" rx="3.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.85" />
      {/* antenna */}
      <line x1="12" y1="2" x2="12" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="2.2" r="1.1" fill={c2} opacity="0.95" />
      {/* eyes */}
      <circle cx="9" cy="13" r="1.4" fill="#FFFFFF" opacity="0.95" />
      <circle cx="15" cy="13" r="1.4" fill="#FFFFFF" opacity="0.95" />
      <circle cx="9" cy="13" r="0.6" fill={c} opacity="0.9" />
      <circle cx="15" cy="13" r="0.6" fill={c} opacity="0.9" />
      {/* mouth slot */}
      <rect x="9.5" y="16.2" width="5" height="0.9" rx="0.45" fill={c2} opacity="0.6" />
      {/* side lights */}
      <circle cx="3.5" cy="13.5" r="0.8" fill={c} opacity="0.6" />
      <circle cx="20.5" cy="13.5" r="0.8" fill={c} opacity="0.6" />
    </>
  ),
  User: (s, c, c2, gid, fid) => (
    <>
      {/* halo glow */}
      <circle cx="12" cy="8" r="5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.3" />
      {/* head */}
      <circle cx="12" cy="8" r="3.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.9" />
      {/* shoulders */}
      <path d="M3.5 21c0-4.5 3.8-7.5 8.5-7.5s8.5 3 8.5 7.5" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.75" />
      {/* sparkle accent */}
      <circle cx="16.5" cy="5.5" r="0.8" fill={c2} opacity="0.7" />
    </>
  ),
  Plug: (s, c, c2, gid, fid) => (
    <>
      <path d="M12 22v-5" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <path d="M9 8V4M15 8V4" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#${fid})`} />
      <path d="M5 8h14a2 2 0 010 4H5a2 2 0 010-4z" fill={`url(#${gid})`} filter={`url(#${fid})`} opacity="0.7" />
      <path d="M7 12v3a5 5 0 0010 0v-3" stroke={c} strokeWidth="1.2" fill="none" opacity="0.4" />
    </>
  ),
};

const GlowIcon = ({ name, size = 24, color = "#D4A843", className = "", glow = true }: GlowIconProps) => {
  const c2 = lighten(color);
  const gid = uid(name);
  const fid = `f-${gid}`;

  const renderIcon = ICONS[name];

  // Fallback: render a generic diamond if icon name not found
  const fallback = (s: number, c: string, cc2: string, g: string, f: string) => (
    <>
      <path d="M12 2l8 10-8 10-8-10z" fill={`url(#${g})`} filter={`url(#${f})`} opacity="0.7" />
      <path d="M12 2l8 10-8 10-8-10z" stroke={c} strokeWidth="0.8" fill="none" opacity="0.4" />
    </>
  );

  const iconFn = renderIcon || fallback;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        {glow && (
          <filter id={fid}>
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {iconFn(size, color, c2, gid, glow ? fid : "")}
    </svg>
  );
};

export default GlowIcon;

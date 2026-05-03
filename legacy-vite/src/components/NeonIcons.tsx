// Custom SVG icons — Whenua brand palette
// Kōwhai Gold, Pounamu Teal, Tāngaroa Navy, White

const C = {
  gold: "#4AA5A8",
  pounamu: "#3A7D6E",
  tangaroa: "#1A3A5C",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.6)",
};

type P = {size?: number;color?: string;};

// ── Generic / Shared ──

export const NeonBuilding = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="16" rx="2" stroke={C.pounamu} strokeWidth="1.5" strokeOpacity="0.8" fill={`${C.pounamu}14`} />
    <rect x="7" y="10" width="3" height="3" rx="0.5" fill={C.pounamu} fillOpacity="0.5" />
    <rect x="14" y="10" width="3" height="3" rx="0.5" fill={C.pounamu} fillOpacity="0.5" />
    <rect x="7" y="16" width="3" height="3" rx="0.5" fill={C.pounamu} fillOpacity="0.5" />
    <rect x="14" y="16" width="3" height="3" rx="0.5" fill={C.pounamu} fillOpacity="0.5" />
    <line x1="12" y1="2" x2="12" y2="6" stroke={C.pounamu} strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="12" cy="2" r="1" fill={C.pounamu} opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>;


export const NeonFamily = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="6" r="3" stroke={C.white} strokeWidth="1.5" fill={`${C.white}1a`} />
    <circle cx="16" cy="6" r="3" stroke={C.white} strokeWidth="1.5" fill={`${C.white}1a`} />
    <circle cx="12" cy="14" r="2.5" stroke={C.gold} strokeWidth="1.5" fill={`${C.gold}1a`} />
    <path d="M4 20c0-2.2 1.8-4 4-4M20 20c0-2.2-1.8-4-4-4" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M8.5 20c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" stroke={C.gold} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
  </svg>;


export const NeonHammer = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 18L14 10" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
    <rect x="12" y="4" width="8" height="6" rx="1.5" transform="rotate(15 16 7)" stroke={C.gold} strokeWidth="1.5" fill={`${C.gold}26`} />
    <circle cx="6" cy="18" r="1.5" fill={C.gold} opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>;


export const NeonSeedling = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12" stroke={C.pounamu} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12C12 8 16 6 18 4C18 8 16 10 12 12Z" fill={`${C.pounamu}26`} stroke={C.pounamu} strokeWidth="1.5" />
    <path d="M12 15C12 11 8 9 6 7C6 11 8 13 12 15Z" fill={`${C.pounamu}1a`} stroke={C.pounamu} strokeWidth="1.5" strokeOpacity="0.6" />
    <circle cx="12" cy="22" r="1" fill={C.pounamu} opacity="0.5" />
  </svg>;


export const NeonClipboard = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="4" width="14" height="18" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}0f`} />
    <rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5" fill="hsl(var(--background))" />
    <line x1="8" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="8" y1="13" x2="14" y2="13" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonDocument = ({ size = 24, color = C.tangaroa }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} />
    <path d="M14 4v4h4" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
    <line x1="8" y1="12" x2="14" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
  </svg>;


export const NeonMegaphone = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 4L8 8H4v6h4l10 4V4z" stroke={C.gold} strokeWidth="1.5" fill={`${C.gold}1a`} />
    <path d="M20 9v4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <circle cx="20" cy="7" r="1" fill={C.gold} opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>;


export const NeonTeam = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3" stroke={C.pounamu} strokeWidth="1.5" fill={`${C.pounamu}14`} />
    <circle cx="17" cy="9" r="2.5" stroke={C.pounamu} strokeWidth="1.5" fill={`${C.pounamu}14`} />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={C.pounamu} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M15 20c0-2.2 1.8-4 4-4" stroke={C.pounamu} strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
  </svg>;


export const NeonCoin = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <text x="12" y="16" textAnchor="middle" fill={color} fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="700" opacity="0.8">$</text>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 3">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="20s" repeatCount="indefinite" />
    </circle>
  </svg>;


export const NeonFactory = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="12" width="20" height="10" rx="1" stroke={C.gold} strokeWidth="1.5" fill={`${C.gold}0f`} />
    <path d="M6 12V6l4 3V6l4 3V6l4 3v3" stroke={C.gold} strokeWidth="1.5" strokeOpacity="0.7" />
    <rect x="5" y="16" width="3" height="3" rx="0.5" fill={C.gold} fillOpacity="0.3" />
    <rect x="10" y="16" width="3" height="3" rx="0.5" fill={C.gold} fillOpacity="0.3" />
    <circle cx="18" cy="4" r="1" fill={C.gold} opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
    </circle>
    <line x1="18" y1="5" x2="18" y2="9" stroke={C.gold} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonWave = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke={C.pounamu} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={C.pounamu} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
    <circle cx="12" cy="6" r="2" fill={`${C.pounamu}33`} stroke={C.pounamu} strokeWidth="1" />
  </svg>;


export const NeonLock = ({ size = 16, color = "hsl(var(--muted-foreground))" }: {size?: number;color?: string;}) =>
<svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <circle cx="8" cy="11" r="1" fill={color} />
  </svg>;


// ── TORO-specific icons (lavender) ──

export const NeonFork = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    
    <line x1="7" y1="2" x2="7" y2="7" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.5" />
    <line x1="9" y1="2" x2="9" y2="7" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.5" />
    <line x1="11" y1="2" x2="11" y2="7" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.5" />
    <path d="M17 2v4a3 3 0 01-3 3v0" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <line x1="17" y1="9" x2="17" y2="21" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.4" />
  </svg>;


export const NeonGift = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="10" width="18" height="12" rx="2" stroke={C.white} strokeWidth="1.5" fill={`${C.white}0f`} />
    <rect x="3" y="7" width="18" height="4" rx="1" stroke={C.white} strokeWidth="1.5" fill={`${C.white}1a`} />
    <line x1="12" y1="7" x2="12" y2="22" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.4" />
    <path d="M12 7C12 7 9 4 7 4c-1.1 0-2 .9-2 2s.9 2 2 2" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M12 7c0 0 3-3 5-3 1.1 0 2 .9 2 2s-.9 2-2 2" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
  </svg>;


export const NeonShirt = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 2l-5 5 3 2 1-2v13a1 1 0 001 1h8a1 1 0 001-1V7l1 2 3-2-5-5" stroke={C.white} strokeWidth="1.5" fill={`${C.white}0a`} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2a3 3 0 006 0" stroke={C.white} strokeWidth="1.5" strokeOpacity="0.5" />
  </svg>;


export const NeonPaw = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="16" rx="4" ry="3" fill={`${C.white}1a`} stroke={C.white} strokeWidth="1.5" />
    <circle cx="7" cy="10" r="2" fill={`${C.white}26`} stroke={C.white} strokeWidth="1.2" />
    <circle cx="17" cy="10" r="2" fill={`${C.white}26`} stroke={C.white} strokeWidth="1.2" />
    <circle cx="10" cy="7" r="1.5" fill={`${C.white}26`} stroke={C.white} strokeWidth="1.2" />
    <circle cx="14" cy="7" r="1.5" fill={`${C.white}26`} stroke={C.white} strokeWidth="1.2" />
  </svg>;


export const NeonCalendar = ({ size = 24, color = C.white }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <line x1="16" y1="3" x2="16" y2="7" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <rect x="7" y="13" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.4" />
  </svg>;


export const NeonHome = ({ size = 24, color = C.white }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12l9-8 9 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <rect x="9" y="15" width="6" height="6" rx="1" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
  </svg>;


export const NeonCar = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 15h14l1.5-5H3.5L5 15z" stroke={C.white} strokeWidth="1.5" fill={`${C.white}0a`} />
    <rect x="3" y="15" width="18" height="4" rx="1" stroke={C.white} strokeWidth="1.5" fill={`${C.white}0f`} />
    <circle cx="7" cy="19" r="2" stroke={C.white} strokeWidth="1.5" fill="hsl(var(--background))" />
    <circle cx="17" cy="19" r="2" stroke={C.white} strokeWidth="1.5" fill="hsl(var(--background))" />
  </svg>;


export const NeonBell = ({ size = 24, color = C.white }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3a6 6 0 016 6c0 3 1 5 2 6H4c1-1 2-3 2-6a6 6 0 016-6z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <path d="M10 21a2 2 0 004 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="3" r="1" fill={color} opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>;


// ── Template / Tool icons ──

export const NeonCheckmark = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill={`${color}0f`} />
    <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export const NeonSearch = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="16" y1="16" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;


export const NeonShield = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3l8 4v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V7l8-4z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
  </svg>;


export const NeonRefresh = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12a8 8 0 0114-5.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 12a8 8 0 01-14 5.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 3v4h-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 21v-4h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export const NeonFilm = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="3" y1="8" x2="21" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="7" y1="4" x2="7" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
    <line x1="17" y1="4" x2="17" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
    <polygon points="10,10 10,14 15,12" fill={color} fillOpacity="0.5" />
  </svg>;


export const NeonChart = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="14" width="4" height="7" rx="1" stroke={color} strokeWidth="1.2" fill={`${color}1a`} />
    <rect x="10" y="9" width="4" height="12" rx="1" stroke={color} strokeWidth="1.2" fill={`${color}26`} />
    <rect x="17" y="4" width="4" height="17" rx="1" stroke={color} strokeWidth="1.2" fill={`${color}33`} />
  </svg>;


export const NeonMail = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <path d="M3 7l9 5 9-5" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
  </svg>;


export const NeonBox = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <path d="M3 8l9 5 9-5" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="12" y1="13" x2="12" y2="21" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonGlobe = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonPen = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 3l5 5-12 12H4v-5L16 3z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
    <line x1="14" y1="5" x2="19" y2="10" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
  </svg>;


export const NeonHeart = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 20S4 14 4 9a4 4 0 018 0 4 4 0 018 0c0 5-8 11-8 11z" stroke={color} strokeWidth="1.5" fill={`${color}1a`} />
  </svg>;


export const NeonHandshake = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 11l4-4 4 2 4-2 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 11v6l4-2 4 2 4-2 4 2v-6" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
  </svg>;


export const NeonWarning = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L2 21h20L12 3z" stroke={color} strokeWidth="1.5" fill={`${color}14`} strokeLinejoin="round" />
    <line x1="12" y1="10" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>;


export const NeonTimer = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="13" r="8" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="13" x2="15" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <line x1="10" y1="2" x2="14" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;


export const NeonWrench = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3A5 5 0 0115 12a5 5 0 01-3-1L5 18l-2 2 2 2 2-2 7-7a5 5 0 01-1-3 5 5 0 015.7-5.7l-3 3z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
  </svg>;


export const NeonAnchor = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <line x1="12" y1="8" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
    <path d="M5 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
    <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
  </svg>;


export const NeonFish = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 12c3-5 9-5 14 0-5 5-11 5-14 0z" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <circle cx="16" cy="12" r="1" fill={color} opacity="0.8" />
    <path d="M2 9l4 3-4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
  </svg>;


export const NeonSailboat = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3v14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 3L4 17h8" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinejoin="round" />
    <path d="M12 7l6 10h-6" stroke={color} strokeWidth="1.5" fill={`${color}1a`} strokeLinejoin="round" />
    <path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
  </svg>;


export const NeonSun = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill={`${color}1a`} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
  <line key={a} x1="12" y1="3" x2="12" y2="1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"
  transform={`rotate(${a} 12 12)`} />
  )}
  </svg>;


export const NeonBulb = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21h6M12 3a7 7 0 00-4 12.7V18h8v-2.3A7 7 0 0012 3z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
  </svg>;


export const NeonGrad = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 10L12 3l8 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="10" width="16" height="3" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <line x1="12" y1="13" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
    <path d="M18 5l3-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
  </svg>;


export const NeonFitness = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 12h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <rect x="3" y="9" width="4" height="6" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <rect x="17" y="9" width="4" height="6" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <rect x="1" y="10.5" width="2" height="3" rx="0.5" fill={color} fillOpacity="0.4" />
    <rect x="21" y="10.5" width="2" height="3" rx="0.5" fill={color} fillOpacity="0.4" />
  </svg>;


export const NeonRunning = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M8 21l3-7-3-3 3-4 5 3v5l3 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>;


export const NeonYoga = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="2.5" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M12 8v6M8 21l4-7 4 7M4 14l8-2 8 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export const NeonSleep = ({ size = 24, color = C.tangaroa }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 4h4l-4 4h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 8h3l-3 3h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
    <path d="M20 14a8 8 0 11-16 0 8 8 0 008-8 8 8 0 008 8z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
  </svg>;


export const NeonSalad = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} />
    <path d="M4 14h16" stroke={color} strokeWidth="1.5" />
    <path d="M8 10c0-2 1-4 4-4s4 2 4 4" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
  </svg>;


export const NeonCart = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 7h15l-2 8H7L5 7z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
    <line x1="5" y1="7" x2="3" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="19" r="2" stroke={color} strokeWidth="1.5" />
    <circle cx="17" cy="19" r="2" stroke={color} strokeWidth="1.5" />
  </svg>;


export const NeonSparkle = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" stroke={color} strokeWidth="1.5" fill={`${color}14`} strokeLinejoin="round" />
  </svg>;


export const NeonBottle = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8" y="8" width="8" height="13" rx="3" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <rect x="10" y="4" width="4" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <circle cx="12" cy="15" r="2" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
  </svg>;


export const NeonParty = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 21L8 3l10 14H4z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinejoin="round" />
    <circle cx="17" cy="5" r="1" fill={color} opacity="0.6" />
    <circle cx="20" cy="8" r="1" fill={C.gold} opacity="0.5" />
    <circle cx="19" cy="3" r="0.8" fill={C.pounamu} opacity="0.5" />
  </svg>;


export const NeonCouple = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="7" r="3" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <circle cx="16" cy="7" r="3" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M4 20c0-2.2 1.8-4 4-4M20 20c0-2.2-1.8-4-4-4" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M12 14v-3" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonMap = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
    <line x1="9" y1="3" x2="9" y2="18" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
    <line x1="15" y1="6" x2="15" y2="21" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonPlane = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 3L10 14M21 3l-7 18-3-8-8-3 18-7z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
  </svg>;


export const NeonDress = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 2h8l-2 7h3l-5 13-5-13h3L8 2z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinejoin="round" />
  </svg>;


export const NeonTie = ({ size = 24, color = C.tangaroa }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 3h6l-1 5 1 3-3 10-3-10 1-3-1-5z" stroke={color} strokeWidth="1.5" fill={`${color}14`} strokeLinejoin="round" />
    <line x1="9" y1="3" x2="15" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>;


export const NeonReturn = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12h12a4 4 0 000-8H8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8l-4 4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export const NeonReceipt = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1 2-1V3l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="8" y1="11" x2="14" y2="11" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="8" y1="14" x2="12" y2="14" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;


export const NeonBuilding2 = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="8" height="18" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <rect x="14" y="10" width="6" height="12" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <rect x="6" y="7" width="2" height="2" rx="0.5" fill={color} fillOpacity="0.4" />
    <rect x="6" y="12" width="2" height="2" rx="0.5" fill={color} fillOpacity="0.4" />
    <rect x="16" y="13" width="2" height="2" rx="0.5" fill={color} fillOpacity="0.4" />
  </svg>;


export const NeonSiren = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 15h12a2 2 0 012 2v2H4v-2a2 2 0 012-2z" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M8 15V9a4 4 0 018 0v6" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="5" r="1.5" fill={color} opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1s" repeatCount="indefinite" />
    </circle>
  </svg>;


export const NeonSafetyVest = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 2l-5 5 3 2 1-2v13a1 1 0 001 1h8a1 1 0 001-1V7l1 2 3-2-5-5" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
    <line x1="6" y1="15" x2="18" y2="15" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
  </svg>;


export const NeonChild = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;


export const NeonUpload = ({ size = 24, color = C.tangaroa }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 16V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8l4-4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;


export const NeonIncrease = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 20l6-6 4 4 6-10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 4h4v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export const NeonTarget = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.8" />
  </svg>;

export const NeonBrain = ({ size = 24, color = C.white }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C9 2 7 4 7 6c-2 0-4 2-4 4s2 4 4 4v4c0 2 2 4 5 4s5-2 5-4v-4c2 0 4-2 4-4s-2-4-4-4c0-2-2-4-5-4z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <path d="M12 2v20" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;

export const NeonMuscle = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 16c0-4 2-6 4-8l2-4c1-1 2 0 2 1v5c0 0 2-1 3-1s3 1 3 1V4c0-1 1-2 2-1l2 4c2 2 4 4 4 8v2H4v-2z" stroke={color} strokeWidth="1.5" fill={`${color}0f`} strokeLinecap="round" strokeLinejoin="round" />
  </svg>;

export const NeonStar = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" stroke={color} strokeWidth="1.5" fill={`${color}14`} strokeLinejoin="round" />
  </svg>;

export const NeonFire = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z" stroke={color} strokeWidth="1.5" fill={`${color}1a`} />
    <path d="M12 12c0 2-1.5 3-1.5 4.5a1.5 1.5 0 003 0c0-1.5-1.5-2.5-1.5-4.5z" fill={color} fillOpacity="0.4" />
  </svg>;

export const NeonTag = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3h8l10 10-8 8L3 11V3z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} strokeLinejoin="round" />
    <circle cx="7.5" cy="7.5" r="1.5" fill={color} fillOpacity="0.6" />
  </svg>;

export const NeonChat = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="8" y1="12" x2="13" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
  </svg>;

export const NeonTrophy = ({ size = 24, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 2h8v8a4 4 0 01-8 0V2z" stroke={color} strokeWidth="1.5" fill={`${color}14`} />
    <path d="M8 4H5a2 2 0 00-2 2v1a3 3 0 003 3h2" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
    <path d="M16 4h3a2 2 0 012 2v1a3 3 0 01-3 3h-2" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
    <line x1="12" y1="14" x2="12" y2="18" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
    <rect x="8" y="18" width="8" height="3" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
  </svg>;


// ── NZ Flag icon (replaces 🇳🇿 emoji) ──

export const NeonNZFlag = ({ size = 24 }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={C.pounamu} strokeWidth="1.5" fill={`${C.pounamu}0a`} />
    <circle cx="15" cy="9" r="1" fill={C.gold} opacity="0.8" />
    <circle cx="17" cy="11" r="0.8" fill={C.gold} opacity="0.7" />
    <circle cx="16" cy="14" r="0.9" fill={C.gold} opacity="0.75" />
    <circle cx="18" cy="8" r="0.7" fill={C.gold} opacity="0.65" />
    <rect x="2" y="4" width="8" height="7" stroke={C.tangaroa} strokeWidth="1" fill={`${C.tangaroa}14`} />
  </svg>;


// ── Paperclip icon (replaces ) ──

export const NeonPaperclip = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 7v9a5 5 0 01-10 0V6a3 3 0 016 0v9a1 1 0 01-2 0V7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;


// ── Camera icon (replaces ) ──

export const NeonCamera = ({ size = 24, color = C.pounamu }: P) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="13" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}0a`} />
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" />
    <path d="M8 7l1-3h6l1 3" stroke={color} strokeWidth="1.5" />
  </svg>;


// ── Diamond icon (replaces ) ──

export const NeonDiamond = ({ size = 14, color = C.gold }: P) =>
<svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M7 1l6 6-6 6-6-6z" stroke={color} strokeWidth="1.2" fill={`${color}14`} />
  </svg>;


// ── Mapping from emoji string to component for templates ──

export const ICON_MAP: Record<string, React.FC<P>> = {
  clipboard: NeonClipboard,
  team: NeonTeam,
  checkmark: NeonCheckmark,
  coin: NeonCoin,
  safetyVest: NeonSafetyVest,
  pen: NeonPen,
  megaphone: NeonMegaphone,
  search: NeonSearch,
  seedling: NeonSeedling,
  document: NeonDocument,
  lock: NeonShield,
  box: NeonBox,
  mail: NeonMail,
  chart: NeonChart,
  building: NeonBuilding2,
  warning: NeonWarning,
  globe: NeonGlobe,
  wrench: NeonWrench,
  heart: NeonHeart,
  handshake: NeonHandshake,
  child: NeonChild,
  home: NeonHome,
  increase: NeonIncrease,
  receipt: NeonReceipt,
  calendar: NeonCalendar,
  fish: NeonFish,
  sailboat: NeonSailboat,
  anchor: NeonAnchor,
  wave: NeonWave,
  sun: NeonSun,
  bulb: NeonBulb,
  dress: NeonDress,
  tie: NeonTie,
  map: NeonMap,
  plane: NeonPlane,
  yoga: NeonYoga,
  sleep: NeonSleep,
  fitness: NeonFitness,
  running: NeonRunning,
  salad: NeonSalad,
  cart: NeonCart,
  sparkle: NeonSparkle,
  bottle: NeonBottle,
  party: NeonParty,
  couple: NeonCouple,
  return: NeonReturn,
  siren: NeonSiren,
  grad: NeonGrad,
  fork: NeonFork,
  gift: NeonGift,
  shirt: NeonShirt,
  paw: NeonPaw,
  car: NeonCar,
  bell: NeonBell,
  upload: NeonUpload,
  refresh: NeonRefresh,
  film: NeonFilm,
  timer: NeonTimer,
  diamond: NeonDiamond,
  paperclip: NeonPaperclip,
  camera: NeonCamera,
  flag: NeonNZFlag,
  target: NeonTarget,
  brain: NeonBrain,
  muscle: NeonMuscle,
  star: NeonStar,
  fire: NeonFire,
  tag: NeonTag,
  chat: NeonChat,
  trophy: NeonTrophy,
  shield: NeonShield,
  factory: NeonFactory,
  family: NeonFamily,
  hammer: NeonHammer,
};
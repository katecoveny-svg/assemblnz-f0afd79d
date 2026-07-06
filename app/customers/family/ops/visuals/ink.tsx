import type { CSSProperties } from 'react';

/**
 * Ink — the hand-drawn line-art icon set for Family OS (visual direction B:
 * illustrated + ambient motion). Slightly wobbly ink weight, warm imperfection —
 * Quentin Blake meets Oliver Jeffers, calmer. Everything a family knows, drawn
 * like a Sunday-paper cartoonist.
 *
 * Champagne canon: ink strokes, occasional gold fills. No canary, no 3D, no
 * photos. These are placeholders for a future commissioned NZ illustrator or a
 * Vessel Studio line-art pass — swap the paths, keep the API.
 */

const INK = '#1A1918';
const GOLD = '#BFA37A';

type IconProps = { size?: number; stroke?: string; fill?: string; style?: CSSProperties; title?: string };

function svg(size: number, title: string | undefined, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true} aria-label={title}
      style={{ overflow: 'visible' }}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** School / kura — a little building with a flag. */
export function InkSchool({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M4 27h24" />
    <path d="M6 27V14l10-6 10 6v13" />
    <path d="M13 27v-6h6v6" />
    <path d="M16 8V4l4 1-4 1.4" fill={GOLD} stroke={GOLD} />
    <circle cx="16" cy="14.5" r="1.4" />
  </>);
}

/** Netball hoop — sport. */
export function InkNetball({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M8 5v22" />
    <path d="M8 7h11" />
    <ellipse cx="20" cy="10.5" rx="4" ry="1.7" />
    <path d="M16.5 11.5l1.5 5M23.5 11.5l-1.5 5M18 16.5h4" />
    <circle cx="20" cy="21" r="3.2" stroke={GOLD} />
  </>);
}

/** A cartoony car — rides + logistics. */
export function InkCar({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M4 20l2-6a3 3 0 0 1 2.8-2h10.4A3 3 0 0 1 22 14l2 6" />
    <path d="M3 20h26v4a1 1 0 0 1-1 1h-2M6 25H4a1 1 0 0 1-1-1v-4" />
    <circle cx="9" cy="22" r="2.3" fill={GOLD} stroke={INK} />
    <circle cx="23" cy="22" r="2.3" fill={GOLD} stroke={INK} />
    <path d="M8 14.5h16" />
  </>);
}

/** Grocery bag — kitchen. */
export function InkGroceries({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M8 11h16l-1.5 15a2 2 0 0 1-2 1.8H11.5a2 2 0 0 1-2-1.8L8 11Z" />
    <path d="M12 11V8a4 4 0 0 1 8 0v3" />
    <path d="M13 16c1.2 1.4 4.8 1.4 6 0" stroke={GOLD} />
  </>);
}

/** Calendar — the week. */
export function InkCalendar({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <rect x="5" y="7" width="22" height="20" rx="2.5" />
    <path d="M5 13h22M11 4v5M21 4v5" />
    <path d="M10 18h3M15 18h3M20 18h2M10 22h3M15 22h3" stroke={GOLD} />
  </>);
}

/** House — home / whānau. */
export function InkHouse({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M5 15 16 6l11 9" />
    <path d="M8 13v13h16V13" />
    <path d="M13 26v-7h6v7" />
    <path d="M20 9V6h3v5" stroke={GOLD} />
  </>);
}

/** Water jug — memory / hydration / the little things. */
export function InkJug({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M11 9h10l-1 3a7 7 0 0 1 3 6v6a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-6a7 7 0 0 1 3-6l-1-3Z" />
    <path d="M23 14h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
    <path d="M11 20h11" stroke={GOLD} />
  </>);
}

/** Letter / envelope — inbox. */
export function InkLetter({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <rect x="4" y="8" width="24" height="17" rx="2" />
    <path d="M5 10l11 8 11-8" />
    <path d="M4 24l8-7M28 24l-8-7" stroke={GOLD} />
  </>);
}

/** Savings jar — kids' money. Level 0..1 draws a gold wash. */
export function InkJar({ size = 24, title, level: levelProp = 0.5 }: IconProps & { level?: number }) {
  const level = Math.max(0, Math.min(1, levelProp));
  const top = 24 - level * 12; // jar body roughly y 12..24
  return svg(size, title, <>
    <path d="M10 9h12l-1 3v0M11 9l1 3" />
    <path d="M9 12h14v13a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V12Z" />
    {level > 0 ? <path d={`M9.4 ${top}h13.2V25a3 3 0 0 1-3 3H12.4a3 3 0 0 1-3-3Z`} fill={GOLD} stroke="none" opacity={0.45} /> : null}
    <path d="M12 6h8" stroke={GOLD} />
  </>);
}

/** Microphone — voice drop. */
export function InkMic({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <rect x="12" y="4" width="8" height="14" rx="4" />
    <path d="M9 15a7 7 0 0 0 14 0M16 22v4M12 26h8" />
  </>);
}

/** Upload / camera-drop — receipts, fridge, newsletters. */
export function InkUpload({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <path d="M6 20v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5" />
    <path d="M16 22V7M16 7l-5 5M16 7l5 5" stroke={GOLD} />
  </>);
}

/** Plates — a shared meal / whānau lunch. */
export function InkPlates({ size = 24, title }: IconProps) {
  return svg(size, title, <>
    <circle cx="16" cy="16" r="10" />
    <circle cx="16" cy="16" r="5.5" stroke={GOLD} />
  </>);
}

const MAP: Record<string, (p: IconProps) => React.ReactNode> = {
  school: InkSchool, netball: InkNetball, sport: InkNetball, car: InkCar, ride: InkCar,
  groceries: InkGroceries, kitchen: InkGroceries, calendar: InkCalendar, week: InkCalendar,
  house: InkHouse, home: InkHouse, jug: InkJug, letter: InkLetter, inbox: InkLetter,
  jar: InkJar, money: InkJar, mic: InkMic, upload: InkUpload, plates: InkPlates, lunch: InkPlates,
};

/** Pick an ink icon by a free-text event title (a warm heuristic). */
export function iconForEvent(title: string): (p: IconProps) => React.ReactNode {
  const t = title.toLowerCase();
  if (/netball|rugby|football|soccer|sport|training|photo|team|cross country|swim/.test(t)) return InkNetball;
  if (/pickup|uber|ride|drive|drop|bus|car/.test(t)) return InkCar;
  if (/lunch|dinner|shared plate|kai|bbq|potluck/.test(t)) return InkPlates;
  if (/shop|grocer|woolworth|countdown|list|basket/.test(t)) return InkGroceries;
  if (/disco|school|class|room|camp|mufti|assembly|kura|college/.test(t)) return InkSchool;
  if (/bill|payment|deposit|money|allowance|pay/.test(t)) return InkJar;
  if (/newsletter|email|notice|form|letter|pānui|panui/.test(t)) return InkLetter;
  return InkCalendar;
}

export const inkTokens = { INK, GOLD };

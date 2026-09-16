/**
 * DO personalisation knobs — display name, accent colour, avatar/mark.
 * Plum brand defaults; user-tweakable without inventing a second theme system.
 */

export const DO_BRAND_ACCENTS = [
  '#240B21', // deep plum (default)
  '#654A4E', // muted plum
  '#916A70', // dusty rose
  '#3D2A32', // ink plum
  '#5C3A4A', // berry
  '#2F1A28', // night plum
] as const;

export const DO_AVATAR_MARKS = ['✦', '◎', '⌂', '◉', '◇', '✶', '⬡', '✧'] as const;

export type DoAvatarMark = (typeof DO_AVATAR_MARKS)[number];

export type DoPersonalisation = {
  displayName: string;
  accentColor: string;
  avatarMark: DoAvatarMark;
};

export const DEFAULT_DO_PERSONALISATION: DoPersonalisation = {
  displayName: 'Household Floor',
  accentColor: '#240B21',
  avatarMark: '⌂',
};

const HEX = /^#([0-9A-Fa-f]{6})$/;

export function normaliseAccentColor(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim();
  if (HEX.test(trimmed)) return trimmed.toUpperCase();
  return DEFAULT_DO_PERSONALISATION.accentColor;
}

export function normaliseAvatarMark(value: string | undefined | null): DoAvatarMark {
  const trimmed = (value ?? '').trim();
  if ((DO_AVATAR_MARKS as readonly string[]).includes(trimmed)) {
    return trimmed as DoAvatarMark;
  }
  return DEFAULT_DO_PERSONALISATION.avatarMark;
}

export function normaliseDisplayName(value: string | undefined | null, fallback = DEFAULT_DO_PERSONALISATION.displayName): string {
  const trimmed = (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 48);
  return trimmed || fallback;
}

export function applyDoPersonalisation(
  input: Partial<DoPersonalisation> | null | undefined,
  fallback: DoPersonalisation = DEFAULT_DO_PERSONALISATION,
): DoPersonalisation {
  return {
    displayName: normaliseDisplayName(input?.displayName, fallback.displayName),
    accentColor: normaliseAccentColor(input?.accentColor ?? fallback.accentColor),
    avatarMark: normaliseAvatarMark(input?.avatarMark ?? fallback.avatarMark),
  };
}

/** Contrast-friendly chalk text on dark plum accents; deep plum text on light accents. */
export function personalisationInk(accent: string): string {
  const hex = normaliseAccentColor(accent).slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#240B21' : '#FFFDFB';
}

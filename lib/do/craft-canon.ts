/**
 * DO Spatial C craft canon — Experience Designer audit (16 Sep 2026).
 *
 * Stage  = plum `#240B21` (portable shell / orb stage)
 * Cards  = paper `#FFFDFB` on chalk `#F5F1F2`
 * Accent = dusty rose `#916A70` only — never purple-leak glow
 * Mark   = volumetric D-mark / ✦ (DoMark), sizes 66–68 / 36 / 64
 * Type   = Instrument Sans + IBM Plex Mono (evidence / wait labels)
 * CTAs   = `.do-cta*` from `app/do/do-craft.css`
 *
 * Source of truth for portable DO surfaces (Glow, extension, Meeting, /do).
 * Vitest hard-fail: `lib/do/craft-canon.test.ts`
 */

export const DO_CRAFT = {
  stage: '#240B21',
  plum: '#240B21',
  muted: '#654A4E',
  rose: '#916A70',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
  /** Soft rose glow only — never purple neon. */
  roseGlow: '#D6A5BD',
  markInk: '#F3CEEB',
  fonts: {
    sans: 'Instrument Sans',
    mono: 'IBM Plex Mono',
  },
  /** Orb / mark sizes: Glow launcher · extension chrome · Meeting hero */
  orb: {
    glow: 66,
    glowMax: 68,
    extension: 36,
    meeting: 64,
  },
  rootClass: 'do-craft',
  craftAttr: 'spatial-c',
  /** Purple-leak tokens banned on DO portable surfaces. */
  bannedPurpleHex: [
    '#9e44e6',
    '#dbacff',
    '#bb8de1',
    '#eac4ff',
    '#9d52ed',
    '#411270',
    '#b374f5',
    '#792cc6',
    '#2c0d52',
    '#b05af7',
    '#963be5',
    '#381653',
    '#f6dfff',
    '#e8b9ff',
  ] as const,
  /** Chatbot-home copy — ban on DO craft surfaces. */
  bannedCopy: [
    /Chat\s*\/\s*Help with this page/i,
    /\bLinda\b/,
    /\bchatbot\b/i,
  ] as const,
  cta: {
    primary: 'do-cta',
    secondary: 'do-cta do-cta--secondary',
    ghost: 'do-cta do-cta--ghost',
    danger: 'do-cta do-cta--stop',
  },
} as const;

/** Files scanned by the purple-leak / craft guard. */
export const DO_CRAFT_GUARD_PATHS = [
  'app/do',
  'components/do',
  'components/site/assembl-the-work/GlowDoWidget.tsx',
  'components/site/assembl-the-work/glow-do-widget.module.css',
  'apps/do/extension',
  'apps/do/shared/distribution.ts',
  'lib/do',
] as const;

export type DoWorkColumnKey = 'needsYou' | 'working' | 'done';

export const DO_WORK_COLUMN_LABEL: Record<DoWorkColumnKey, string> = {
  needsYou: 'Needs you',
  working: 'Working',
  done: 'Done',
};

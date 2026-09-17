/**
 * DO Spatial C craft canon — Experience Designer audit (16 Sep 2026)
 * + public DO craft hotfix (17 Sep 2026).
 *
 * Stage  = plum `#240B21` (portable shell / orb stage)
 * Cards  = paper `#FFFDFB` on chalk `#F5F1F2`
 * Accent = dusty rose `#916A70` only — never purple-leak glow, never green
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
  /** Warm rose highlight inside volumetric orb (not grape mid). */
  roseHighlight: '#C995A8',
  /** Soft magenta-rose bloom around D-mark. */
  roseBloom: '#E8B6C4',
  /** Inset specular — warm rose, not lavender. */
  roseInset: '#F8E4EA',
  markInk: '#F3D4DE',
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
    /** Grape mid / lavender bloom — read as purple, not rose. */
    '#9b6f94',
    '#ecbddd',
    '#f8dff8',
    '#b479c3',
    '#b37aca',
    '#b168d3',
    '#edbedd',
    '#b679d3',
    '#b478f5',
    '#b480d8',
  ] as const,
  /**
   * Green / teal / pounamu accents banned on public DO craft surfaces.
   * Muted plum on deep plum reads olive — never use muted as display type on stage.
   */
  bannedGreenHex: [
    '#3f7373',
    '#2e7d32',
    '#2a7a3e',
    '#3a3832',
    '#228b22',
    '#556b2f',
    '#4a5d23',
    '#3c6e6e',
    '#0d9488',
    '#14b8a6',
    '#2dd4a8',
    '#3e8a88',
    '#2e6146',
  ] as const,
  /** Chatbot-home + AI-slop / vendor theatre — ban on DO craft UI chrome. */
  bannedCopy: [
    /Chat\s*\/\s*Help with this page/i,
    /\bLinda\b/,
    /\bchatbot\b/i,
    /Whisper-class/i,
    /Deepgram\s+nova-2/i,
    /Granola-class/i,
    /Smart notes/i,
    /not configured on this environment/i,
    /Transcribe when Deepgram is configured/i,
    /Two tools\.\s*Useful work/i,
    /model unavailable/i,
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
  'components/site/assembl-the-work/AssemblTheWorkHome.tsx',
  'components/site/assembl-the-work/assembl-spatial.css',
  'apps/do/extension',
  'apps/do/shared/distribution.ts',
  'lib/do',
] as const;

/** Public-facing surfaces that must not dump vendor/env theatre. */
export const DO_PUBLIC_COPY_GUARD_PATHS = [
  'app/do/DoHome.tsx',
  'app/do/page.tsx',
  'app/do/meetings/MeetingDo.tsx',
  'app/do/household/HouseholdFloorClient.tsx',
  'components/site/assembl-the-work/AssemblTheWorkHome.tsx',
  'components/site/assembl-the-work/copy.ts',
  'components/site/assembl-the-work/ProductLanding.tsx',
  'components/do/DoPortableStarters.tsx',
  'components/do/DoSpatialScene.tsx',
  'lib/do/public-do-specialists.ts',
] as const;

export type DoWorkColumnKey = 'needsYou' | 'working' | 'done';

export const DO_WORK_COLUMN_LABEL: Record<DoWorkColumnKey, string> = {
  needsYou: 'Needs you',
  working: 'Working',
  done: 'Done',
};

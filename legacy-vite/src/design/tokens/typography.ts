/**
 * Assembl Canonical Typography Scale
 * ────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for type sizes, weights and line-heights.
 *
 * Mirrors `typography.css` (CSS variables) — keep both in sync.
 *
 * Three named roles drive most agent UI surfaces:
 *   • agentCode  — monospaced identifier (e.g. "ASM-008")
 *   • roleText   — short noun phrase under the name (e.g. "Privacy Copilot")
 *   • tagline    — one-line promise under the role (e.g. "Drafts your IPP 3A notice")
 *
 * Each role ships THREE responsive steps (sm / md / lg) so a single
 * component can adapt across screen sizes via clamp() in tokens.css,
 * or you can pick a fixed step from TS.
 *
 * Locked 2026-04-24. Light theme only.
 */

/* ══════════════════════════════════════════════════════════════
   1. RAW SCALE — t-shirt sizes, tracking, weights, leading.
   ══════════════════════════════════════════════════════════════ */
export const fontFamily = {
  display: 'Cormorant Garamond, Georgia, serif',
  body:    'Inter, system-ui, sans-serif',
  mono:    '"IBM Plex Mono", ui-monospace, monospace',
} as const;

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
} as const;

export const lineHeight = {
  tight:   1.1,
  snug:    1.25,
  normal:  1.45,
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  tightest: '-0.02em',
  tight:    '-0.01em',
  normal:   '0',
  wide:     '0.04em',
  widest:   '0.12em',
} as const;

/**
 * Modular type ramp — px values used across the platform.
 * Steps are tuned for readability at 16px root size.
 */
export const fontSize = {
  '3xs':  '10px',
  '2xs':  '11px',
  xs:     '12px',
  sm:     '13px',
  base:   '15px',
  md:     '16px',
  lg:     '18px',
  xl:     '20px',
  '2xl':  '24px',
  '3xl':  '30px',
  '4xl':  '38px',
  '5xl':  '48px',
} as const;

/* ══════════════════════════════════════════════════════════════
   2. SEMANTIC ROLES — meaning-first. Components import these,
      never the raw scale above.
   ══════════════════════════════════════════════════════════════ */
export interface TypeRole {
  family:  string;
  weight:  number;
  /** Fluid clamp() expression — auto-scales sm → lg. */
  size:    string;
  leading: number;
  tracking: string;
  /** Optional uppercase transform. */
  uppercase?: boolean;
}

export const typography = {
  /** Mono identifier, e.g. "ASM-008" — constant across breakpoints. */
  agentCode: {
    family:    fontFamily.mono,
    weight:    fontWeight.medium,
    // 11px on mobile → 13px on desktop
    size:      'clamp(11px, 0.45vw + 10px, 13px)',
    leading:   lineHeight.tight,
    tracking:  letterSpacing.widest,
    uppercase: true,
  } as TypeRole,

  /** Role descriptor, e.g. "Privacy Copilot". Sits under the agent name. */
  roleText: {
    family:   fontFamily.body,
    weight:   fontWeight.medium,
    // 13px → 15px
    size:     'clamp(13px, 0.5vw + 12px, 15px)',
    leading:  lineHeight.snug,
    tracking: letterSpacing.tight,
  } as TypeRole,

  /** One-line promise under the role, e.g. "Drafts your IPP 3A notice". */
  tagline: {
    family:   fontFamily.body,
    weight:   fontWeight.regular,
    // 14px → 18px — most flexible step, reads as a sentence
    size:     'clamp(14px, 0.8vw + 12px, 18px)',
    leading:  lineHeight.normal,
    tracking: letterSpacing.normal,
  } as TypeRole,

  /** Auxiliary roles — used by the same agent surfaces. */
  agentName: {
    family:   fontFamily.display,
    weight:   fontWeight.regular,
    size:     'clamp(22px, 1.6vw + 16px, 32px)',
    leading:  lineHeight.tight,
    tracking: letterSpacing.tight,
  } as TypeRole,

  metaLabel: {
    family:    fontFamily.body,
    weight:    fontWeight.medium,
    size:      fontSize.xs,
    leading:   lineHeight.snug,
    tracking:  letterSpacing.wide,
    uppercase: true,
  } as TypeRole,
} as const;

export type TypeRoleName = keyof typeof typography;

/* ══════════════════════════════════════════════════════════════
   3. STYLE HELPER — turn a role into a React.CSSProperties object.
      Example:
        <span style={typeStyle('agentCode')}>ASM-008</span>
   ══════════════════════════════════════════════════════════════ */
export function typeStyle(role: TypeRoleName): React.CSSProperties {
  const t = typography[role];
  return {
    fontFamily:    t.family,
    fontWeight:    t.weight,
    fontSize:      t.size,
    lineHeight:    t.leading,
    letterSpacing: t.tracking,
    ...(t.uppercase ? { textTransform: 'uppercase' as const } : {}),
  };
}

import type React from 'react';

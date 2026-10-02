import type { CSSProperties } from 'react';

/** DO Liquid light proposal. Canon: docs/assembl-brand-system.md; scoped to personal DO. */
export const DO_IDENTITY = {
  ice: '#D8EAF8', cobalt: '#244FCA', ink: '#172D55', peach: '#F4C1A0',
  mint: '#CBEEE2', paper: '#FFFDFB', hover: '#1D42B0', active: '#17378F',
} as const;
export const doIdentityStyle = Object.fromEntries(
  Object.entries(DO_IDENTITY).map(([name, value]) => [`--do-${name}`, value]),
) as CSSProperties;

/** Optical tints derived from cobalt/ice; materials only, never extra UI roles. */
export const DO_GLASS = { tint: '#AFC9FF', highlight: '#B8DCFF', reflection: '#A9D5F9' } as const;

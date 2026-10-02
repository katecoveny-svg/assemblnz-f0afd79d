import type { CSSProperties } from 'react';

/** Approved DO07 assembled glass: original assembl roles, scoped to personal DO. */
export const DO_IDENTITY = {
  chalk: '#F5F1F2', plum: '#240B21', ink: '#240B21', petal: '#EAC8DF',
  lilac: '#DAD2F4', paper: '#FFFDFB', rose: '#916A70', muted: '#654A4E',
  hover: '#654A4E', active: '#240B21',
} as const;
export const doIdentityStyle = Object.fromEntries(
  Object.entries(DO_IDENTITY).map(([name, value]) => [`--do-${name}`, value]),
) as CSSProperties;

/** Small static-material highlights reuse the canonical pale roles. */
export const DO_GLASS = { tint: DO_IDENTITY.lilac, highlight: DO_IDENTITY.paper, reflection: DO_IDENTITY.petal } as const;

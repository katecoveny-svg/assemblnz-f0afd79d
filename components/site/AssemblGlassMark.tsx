import { ASSEMBL_A_PATH, ASSEMBL_A_TRANSFORM } from '@/lib/brand/assembl-mark';

/** Canonical vector fallback for small company controls; glass art is for larger surfaces. */
export function AssemblGlassMark({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
    <path d={ASSEMBL_A_PATH} transform={ASSEMBL_A_TRANSFORM} fill="currentColor" />
  </svg>;
}

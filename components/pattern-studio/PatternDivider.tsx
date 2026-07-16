import { PatternBackdrop } from './PatternBackdrop';

/**
 * A slim decorative band that carries a Pattern Studio generator as a section
 * transition — the handoff's #2 placement (texture between homepage blocks).
 * Kept subtle on purpose: low intensity, unhurried, gold on pearl, so it reads
 * as texture rather than spectacle (the calm canon still holds). Interactive —
 * hovering lifts the nearby dots.
 */
export function PatternDivider() {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        height: 'clamp(72px, 11vh, 118px)',
        background: 'var(--a-paper)',
        overflow: 'hidden',
      }}
    >
      <PatternBackdrop
        mode="halftone"
        density={46}
        size={12}
        intensity={30}
        dotShape="circle"
        animationEffect="noise"
        speed={0.4}
        colorRole="gold"
        interactive
        opacity={0.32}
      />
    </div>
  );
}

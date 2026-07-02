import Link from 'next/link';
import { PALETTE } from '@/lib/marketplace/agents';

type Variant = 'primary' | 'reversed' | 'on-accentGold';

/**
 * The assembl marketplace wordmark: lowercase Cormorant Garamond 600 (-0.01em,
 * CANON-LOCKED-2026-06-23) closing with a accentGold pill-dash (≈0.6× cap height).
 * Defaults to the marketplace word "assembl". NOTE: this is the *assembl*
 * wordmark — the sibling *dash* wordmark (Lato 900, -0.045em) is its own local
 * component in app/dash/layout.tsx; do not unify them.
 */
export function Wordmark({
  word = 'assembl',
  size = 26,
  variant = 'primary',
  href = '/agents',
  className,
}: {
  word?: string;
  size?: number;
  variant?: Variant;
  href?: string | null;
  className?: string;
}) {
  const wordColor = variant === 'reversed' ? '#FFFFFF' : PALETTE.ink;
  const dashColor =
    variant === 'on-accentGold' ? PALETTE.ink : variant === 'reversed' ? PALETTE.accentGold : PALETTE.accentGold;

  const dashW = Math.round(size * 0.92);
  const dashH = Math.max(6, Math.round(size * 0.28));
  const gap = Math.round(size * 0.3);
  const dashMb = Math.round(size * 0.16);

  const mark = (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'flex-end', gap }}
      aria-label={word}
      role="img"
    >
      <span
        style={{
          fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
          fontWeight: 600,
          fontSize: size,
          letterSpacing: '-0.01em',
          lineHeight: 0.8,
          color: wordColor,
        }}
      >
        {word}
      </span>
      <span
        style={{
          width: dashW,
          height: dashH,
          borderRadius: 99,
          background: dashColor,
          marginBottom: dashMb,
        }}
      />
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label={`${word} agent marketplace`} className="inline-flex items-baseline">
      {mark}
    </Link>
  );
}

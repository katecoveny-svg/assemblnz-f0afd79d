import Link from 'next/link';
import { PALETTE } from '@/lib/marketplace/agents';

type Variant = 'primary' | 'reversed' | 'on-canary';

/**
 * The Dash brand wordmark: lowercase Lato 900 (-0.045em) that always closes
 * with a canary pill-dash (≈0.6× cap height). The dash doubles as the loading
 * bar. Spec: HANDOFF.md §4. Defaults to the marketplace word "assembl".
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
    variant === 'on-canary' ? PALETTE.ink : variant === 'reversed' ? PALETTE.canary : PALETTE.canary;

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
          fontFamily: 'var(--mk-display), system-ui, sans-serif',
          fontWeight: 900,
          fontSize: size,
          letterSpacing: '-0.045em',
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

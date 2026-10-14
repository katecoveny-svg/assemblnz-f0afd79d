import type { CSSProperties } from 'react';

/**
 * The assembl wordmark — lowercase Instrument Sans, upright, medium weight.
 *
 * Centralised so the letterform is identical on every surface (header, footer,
 * anywhere the brand name is set as a wordmark) and trivial to swap for a
 * hand-tuned SVG later.
 *
 * Size, colour and tracking are inherited from the parent. The fallback stays
 * sans-serif so a delayed webfont never revives the retired serif identity.
 */
export function AssemblWordmark({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`font-display font-medium lowercase ${className}`}
      style={{
        fontFamily: 'var(--font-display), "Instrument Sans", system-ui, sans-serif',
        fontStyle: 'normal',
        fontWeight: 500,
        ...style,
      }}
    >
      assembl
    </span>
  );
}

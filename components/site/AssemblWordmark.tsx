import type { CSSProperties } from 'react';

/**
 * The assembl wordmark — always lowercase, non-italic, weight 600.
 *
 * Centralised so the letterform is identical on every surface (header, footer,
 * anywhere the brand name is set as a wordmark) and trivial to swap for a
 * hand-tuned SVG later.
 *
 * We deliberately do NOT use the italic display cut. The display face's italic
 * lowercase "f" has an exaggerated swoopy descender that reads badly at
 * wordmark scale — SemiBold roman keeps the editorial feel without it. Size,
 * colour and tracking are inherited from the parent (set them on the wrapping
 * Link/element); this component only fixes the family, weight and style.
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
      className={`font-display font-semibold lowercase ${className}`}
      style={{
        fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontVariationSettings: '"opsz" 40, "wght" 600',
        ...style,
      }}
    >
      assembl
    </span>
  );
}

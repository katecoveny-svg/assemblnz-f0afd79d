import { Fragment } from 'react';
import type { HeroToken } from '@/lib/copy/editorial-home';
import { InlineVignette } from './InlineVignette';

/**
 * The poster face, shared by the hero and the manifesto.
 *
 * Renders a token stream into one massive Archivo Black headline broken
 * poetically across lines, with:
 *   text  → the words, verbatim
 *   emph  → the same face in champagne, underlined — the phrase the poster
 *           leans on ("AI", "VISIBLE AGENTS", "AGENTIC ERA")
 *   vig   → a live inline 3D object sitting on the type baseline, the
 *           designbyshiv "photo between words" trick answered in r3f
 *   break → a hard line break
 *
 * One renderer, so the two poster moments can never drift apart.
 */
export function PosterHeadline({
  tokens,
  className,
  style,
}: {
  tokens: HeroToken[];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h1
      className={`text-left uppercase text-[#1A1918] ${className ?? ''}`}
      style={{
        fontFamily: 'var(--font-editorial)',
        // Massive, but sized so a 6–7 line poster clears a 100svh screen
        // without clipping. vw-driven with a hard cap; leading just under 1.
        fontSize: 'clamp(1.85rem, 6.1vw, 5.4rem)',
        lineHeight: 0.96,
        letterSpacing: '-0.025em',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        hyphens: 'manual',
        ...style,
      }}
    >
      {tokens.map((token, idx) => {
        const key = `tok-${idx}`;
        if (token.kind === 'break') return <br key={key} />;
        if (token.kind === 'vig') {
          return (
            <Fragment key={key}>
              <InlineVignette id={token.id} />{' '}
            </Fragment>
          );
        }
        if (token.kind === 'emph') {
          return (
            <Fragment key={key}>
              <span
                className="text-[#BFA37A]"
                style={{
                  WebkitBoxDecorationBreak: 'clone',
                  boxDecorationBreak: 'clone',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(191, 163, 122, 0.45)',
                  textUnderlineOffset: '0.12em',
                  textDecorationThickness: '0.04em',
                }}
              >
                {token.value}
              </span>{' '}
            </Fragment>
          );
        }
        return <Fragment key={key}>{token.value} </Fragment>;
      })}
    </h1>
  );
}

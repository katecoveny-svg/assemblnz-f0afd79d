'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Hero word-by-word reveal — Cormorant Garamond, single line per array entry.
 * Honours prefers-reduced-motion (renders static).
 */
export function HeroWordReveal({
  lines,
  className = '',
}: {
  lines: readonly string[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <h1
        className={`font-display leading-[0.95] tracking-tight ${className}`}
        style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 8vw, 7rem)' }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {i === lines.length - 1 ? (
              <em className="not-italic text-gradient-hero">{line}</em>
            ) : (
              line
            )}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1
      className={`font-display leading-[0.95] tracking-tight ${className}`}
      style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 8vw, 7rem)' }}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(' ');
        const isLast = lineIdx === lines.length - 1;
        return (
          <span key={lineIdx} className="block">
            {words.map((word, wordIdx) => {
              const totalIdx =
                lines.slice(0, lineIdx).join(' ').split(' ').filter(Boolean).length + wordIdx;
              return (
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: '0.4em' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + totalIdx * 0.08,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  {isLast ? (
                    <em className="not-italic text-gradient-hero">{word}</em>
                  ) : (
                    word
                  )}
                  {wordIdx < words.length - 1 && ' '}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

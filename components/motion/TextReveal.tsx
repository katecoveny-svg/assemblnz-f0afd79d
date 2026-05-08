'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface TextRevealProps {
  /** Array of line strings. Each line's words are staggered independently. */
  lines: readonly string[];
  className?: string;
  /** Additional delay before the animation starts (seconds) */
  delay?: number;
}

/**
 * Word-by-word opacity 0→1 + translateY(8px)→0 reveal.
 * Per Interactive Web Canon §8.3: 60ms stagger, 500ms duration per word.
 * Respects prefers-reduced-motion — falls back to instant display.
 */
export function TextReveal({ lines, className = '', delay = 0 }: TextRevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <span className={className} aria-label={lines.join(' ')}>
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line}
          </span>
        ))}
      </span>
    );
  }

  let wordIndex = 0;

  return (
    <span className={className} aria-label={lines.join(' ')} aria-hidden={false}>
      {lines.map((line, li) => {
        const words = line.split(' ');
        return (
          <span key={li} className="block">
            {words.map((word, wi) => {
              const currentIndex = wordIndex++;
              return (
                <motion.span
                  key={wi}
                  className="inline-block"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: delay + currentIndex * 0.06,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                  {wi < words.length - 1 ? ' ' : ''}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

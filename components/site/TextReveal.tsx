'use client';

import { motion } from 'framer-motion';
import { CANON_TRANSITION, wordRevealContainer, wordRevealItem, useCanonMotion } from '@/components/motion';

export function TextReveal({
  text,
  as: Tag = 'span',
  className = '',
  once = true,
}: {
  text: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
  once?: boolean;
}) {
  const { prefersReducedMotion } = useCanonMotion();
  const words = text.split(/(\s+)/);
  const MotionTag = motion[Tag];

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={wordRevealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      transition={CANON_TRANSITION}
    >
      {words.map((word, index) =>
        word.trim() === '' ? (
          word
        ) : (
          <motion.span
            key={`${word}-${index}`}
            className="inline-block"
            variants={wordRevealItem}
          >
            {word}
          </motion.span>
        ),
      )}
    </MotionTag>
  );
}

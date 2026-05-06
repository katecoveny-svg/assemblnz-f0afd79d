'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const NARRATIVE_STEPS = [
  {
    eyebrow: 'The Problem',
    title: 'Compliance is drowning Kiwi businesses',
    body: '79% of New Zealand businesses don&apos;t know how to use AI safely. 97% of the workforce isn&apos;t trained for it. The paperwork piles up while your team falls behind.',
  },
  {
    eyebrow: 'The Gap',
    title: 'The trust gap is widening',
    body: 'Generic AI tools don&apos;t understand NZ legislation. They hallucinate citations. They miss context. They create risk instead of reducing it.',
  },
  {
    eyebrow: 'The Solution',
    title: 'assembl drafts. You approve.',
    body: 'Specialist agents grounded in current NZ Acts. Every output reviewed in Draft Mode. Every citation verified. Nothing ships until you say so.',
  },
  {
    eyebrow: 'The Result',
    title: 'Time back. Risk down.',
    body: 'Two-week pilot. One workflow. One Evidence Pack. If your team hasn&apos;t saved time, you get your money back.',
  },
];

export function StickyScrollNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Image scale based on scroll
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  return (
    <section ref={containerRef} className="relative bg-[#FAF7F2]">
      <div className="flex min-h-[400vh]">
        {/* Left side — sticky text content */}
        <div className="relative w-full md:w-1/2">
          {NARRATIVE_STEPS.map((step, index) => (
            <div
              key={index}
              className="sticky top-0 flex min-h-screen flex-col justify-center px-6 md:px-12 lg:px-20"
              style={{
                // Stack items with slight offset for each step
                top: `${index * 2}rem`,
              }}
            >
              <NarrativeStep
                step={step}
                index={index}
                total={NARRATIVE_STEPS.length}
                scrollYProgress={scrollYProgress}
              />
            </div>
          ))}
        </div>

        {/* Right side — sticky image */}
        <div className="sticky top-0 hidden h-screen w-1/2 md:block">
          <motion.div
            style={{ scale: imageScale, y: imageY }}
            className="relative h-full w-full overflow-hidden"
          >
            <Image
              src="/images/atmosphere-nz.jpg"
              alt="New Zealand atmosphere"
              fill
              className="object-cover"
              sizes="50vw"
            />
            {/* Overlay gradient */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(250,247,242,1) 0%, rgba(250,247,242,0) 30%)',
              }}
            />
            {/* Progress indicator */}
            <div className="absolute bottom-12 right-12 flex flex-col gap-2">
              {NARRATIVE_STEPS.map((_, i) => (
                <ProgressDot
                  key={i}
                  index={i}
                  total={NARRATIVE_STEPS.length}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function NarrativeStep({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: (typeof NARRATIVE_STEPS)[number];
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const stepStart = index / total;
  const stepEnd = (index + 1) / total;

  const opacity = useTransform(
    scrollYProgress,
    [stepStart, stepStart + 0.05, stepEnd - 0.05, stepEnd],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    scrollYProgress,
    [stepStart, stepStart + 0.1, stepEnd - 0.1, stepEnd],
    [40, 0, 0, -40]
  );

  // Accent color cycles through brand colors
  const accentColors = ['#2B6B57', '#D4A853', '#23211F', '#2B6B57'];

  return (
    <motion.div style={{ opacity, y }} className="max-w-lg">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.4em]"
        style={{ color: accentColors[index] }}
      >
        {step.eyebrow}
      </p>
      <h3
        className="mt-6 font-display leading-[0.95] tracking-tight text-[#23211F]"
        style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
      >
        {step.title.split(' ').map((word, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <em className="italic" style={{ color: accentColors[index] }}>
                {word}
              </em>
            ) : (
              word
            )}{' '}
          </span>
        ))}
      </h3>
      <p
        className="mt-6 text-base leading-relaxed text-[#23211F]/70 md:text-lg"
        dangerouslySetInnerHTML={{ __html: step.body }}
      />
      
      {/* Step indicator */}
      <div className="mt-10 flex items-center gap-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm"
          style={{
            background: `${accentColors[index]}15`,
            color: accentColors[index],
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#23211F]/40">
          of {String(total).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  );
}

function ProgressDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const stepStart = index / total;
  const stepEnd = (index + 1) / total;

  const isActive = useTransform(
    scrollYProgress,
    [stepStart, stepEnd],
    [0, 1]
  );

  const accentColors = ['#2B6B57', '#D4A853', '#23211F', '#2B6B57'];

  return (
    <motion.div
      className="relative h-2 w-2 overflow-hidden rounded-full bg-white/30"
    >
      <motion.div
        className="absolute inset-0 origin-bottom rounded-full"
        style={{
          background: accentColors[index],
          scaleY: isActive,
        }}
      />
    </motion.div>
  );
}

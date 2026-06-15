'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, Workflow, FileCheck2 } from 'lucide-react';

const STAGES = [
  {
    icon: CheckCircle,
    title: 'Agents draft',
    body: 'Specialist agents — each built on NZ legislation for your industry — produce compliance documentation, consent applications, and audit reports. They draft. You do not start from a blank page.',
  },
  {
    icon: Workflow,
    title: 'The pipeline checks',
    body: 'Every draft passes through a five-stage compliance pipeline: policy detection, intelligent routing, citation verification, source checking, and human approval. Nothing skips a stage.',
  },
  {
    icon: FileCheck2,
    title: 'You decide',
    body: 'Nothing ships without your sign-off. Every output comes with an Evidence Pack — a tamper-evident audit trail showing every Act and Section that was checked, and when. The agent drafted. You approved. That is the record.',
  },
];

const PIPELINE_GLYPHS = [
  { glyph: '◇', name: 'Kahu', sub: 'Detect' },
  { glyph: '→', name: 'Iho', sub: 'Route' },
  { glyph: '✦', name: 'Tā', sub: 'Verify' },
  { glyph: '§', name: 'Mahara', sub: 'Recall' },
  { glyph: '◆', name: 'Mana', sub: 'Approve' },
];

export function PipelineStickyScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Active stage index (0 .. 2) tracked by scroll progress
  const activeIndex = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, 1, 2]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[color:var(--assembl-paper)]"
      style={{ minHeight: '300vh' }}
    >
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
        <div className="container">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left: pinned section heading + pipeline glyph visual */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                How it works
              </p>
              <h2
                className="mt-5 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
              >
                Three steps.
                <br />
                <em className="not-italic text-gradient-hero">Time returned.</em>
              </h2>

              {/* Five-stage pipeline glyph row — always visible */}
              <div className="mt-12 hidden lg:block">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  Five-stage pipeline
                </p>
                <div className="flex items-center gap-4">
                  {PIPELINE_GLYPHS.map((stage, i) => (
                    <div key={stage.name} className="flex items-center gap-4">
                      <div className="flex flex-col items-start">
                        <span className="font-display text-2xl text-[color:var(--assembl-soft-gold)]">
                          {stage.glyph}
                        </span>
                        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                          {stage.name}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                          {stage.sub}
                        </span>
                      </div>
                      {i < PIPELINE_GLYPHS.length - 1 && (
                        <span className="h-px w-6 bg-[color:var(--text-secondary)] opacity-40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: 3 stage cards stacked, current one highlighted via scroll */}
            <div className="relative h-[60vh]">
              {STAGES.map((stage, i) => (
                <StageCard key={stage.title} stage={stage} index={i} activeIndex={activeIndex} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageCard({
  stage,
  index,
  activeIndex,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  activeIndex: ReturnType<typeof useTransform<number, number>>;
}) {
  // Each card slides in / fades based on scroll progress
  const opacity = useTransform(activeIndex, [index - 0.7, index, index + 0.7], [0.15, 1, 0.15]);
  const y = useTransform(activeIndex, [index - 0.5, index, index + 0.5], [40, 0, -40]);
  const scale = useTransform(activeIndex, [index - 0.5, index, index + 0.5], [0.96, 1, 0.96]);

  const Icon = stage.icon;

  return (
    <motion.div
      className="absolute inset-0 flex items-center"
      style={{ opacity, y, scale }}
    >
      <div className="w-full">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            Step {String(index + 1).padStart(2, '0')}
          </span>
          <Icon className="h-5 w-5 text-[color:var(--assembl-sage-mist)]" aria-hidden />
        </div>
        <h3
          className="mt-5 font-display leading-tight tracking-tight"
          style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {stage.title}
        </h3>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
          {stage.body}
        </p>
      </div>
    </motion.div>
  );
}

'use client';

/**
 * ScrollEvidenceStory — five-scene scroll narrative for the Waihanga PM
 * through-line. Ported from the scroll-story prototype.
 *
 * Scenes:
 *   01 — council comes back on the cantilever (12 floating paper fragments)
 *   02 — assembl pulls the right pieces in (fragments collapse into 5 strata)
 *   03 — the workflow runs in front of you (six translucent panels stacked)
 *   04 — everything holds together as one evidence pack (locked vessel)
 *   05 — file it, forward it, footnote it (vessel + decision brief)
 *
 * Stack: Next.js + Tailwind tokens (no inline hex) + Framer Motion.
 * Honours `prefers-reduced-motion` via useReducedMotion.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const SCENES = [
  { id: 's1', step: 'scene 01 · scattered' },
  { id: 's2', step: 'scene 02 · pulling together' },
  { id: 's3', step: 'scene 03 · in the open' },
  { id: 's4', step: 'scene 04 · the pack' },
  { id: 's5', step: 'scene 05 · the handoff' },
] as const;

export function ScrollEvidenceStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const idx = Number((entry.target as HTMLElement).dataset.sceneIndex);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { threshold: [0.4, 0.6] },
    );
    document.querySelectorAll('[data-scene-index]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Scroll evidence story"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--assembl-paper)' }}
    >
      {/* Soft atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(212,168,83,0.04), transparent 60%), radial-gradient(ellipse 80% 60% at 90% 80%, rgba(43,107,87,0.04), transparent 60%)',
        }}
      />

      {/* Pinned story rail — gold ticks, active scene lit */}
      <aside
        aria-hidden
        className="pointer-events-none fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-[18px] md:flex"
      >
        {SCENES.map((scene, i) => (
          <a
            key={scene.id}
            href={`#${scene.id}`}
            aria-label={scene.step}
            className="pointer-events-auto h-1.5 w-1.5 rounded-full transition-all duration-500"
            style={{
              backgroundColor:
                activeIndex === i
                  ? 'var(--assembl-gold-thread)'
                  : 'rgba(35,33,31,0.18)',
              boxShadow:
                activeIndex === i
                  ? '0 0 10px rgba(212,168,83,0.5)'
                  : 'none',
              transform: activeIndex === i ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </aside>

      {/* Active-scene caption — top-right, small, like nav-step in the prototype */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute right-12 top-8 z-30 hidden font-mono text-[11px] uppercase tracking-[0.18em] md:block"
        style={{ color: 'var(--text-body)', opacity: 0.6 }}
      >
        <span
          className="mr-3 inline-block h-px w-6 align-middle"
          style={{ backgroundColor: 'var(--assembl-gold-thread)' }}
        />
        {SCENES[activeIndex].step}
      </div>

      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <Scene5 />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared scene shell
// ─────────────────────────────────────────────────────────────────────────────

function SceneShell({
  index,
  id,
  eyebrow,
  heading,
  body,
  children,
  variant = 'default',
}: {
  index: number;
  id: string;
  eyebrow: string;
  heading: React.ReactNode;
  body: string;
  children: React.ReactNode;
  variant?: 'default' | 'wide';
}) {
  return (
    <section
      id={id}
      data-scene-index={index}
      className={`relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-24 md:px-12 md:py-32 lg:gap-20 ${
        variant === 'wide'
          ? 'lg:grid-cols-[0.7fr_1.3fr]'
          : 'lg:grid-cols-[0.85fr_1.15fr]'
      }`}
    >
      <div className="lg:sticky lg:top-[28vh] lg:self-start lg:max-w-md">
        <p
          className="mb-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--assembl-pounamu)' }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ backgroundColor: 'var(--assembl-gold-thread)' }}
          />
          {eyebrow}
        </p>
        <h2
          className="font-display leading-[1.05] tracking-tight"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 300,
            fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
          }}
        >
          {heading}
        </h2>
        <p
          className="mt-6 text-[17px] leading-[1.7]"
          style={{ color: 'var(--text-body)', opacity: 0.7 }}
        >
          {body}
        </p>
      </div>

      <div
        aria-hidden
        className="relative w-full"
        style={{ aspectRatio: variant === 'wide' ? 'auto' : '1 / 1.05' }}
      >
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — twelve scattered paper fragments (gentle drift)
// ─────────────────────────────────────────────────────────────────────────────

const SCENE_1_NOTES = [
  { tag: 'email · inbox', name: 'Quote follow-up', top: '4%', left: '4%', rot: -5 },
  { tag: 'drive · 2024', name: 'Q3 financials.xlsx', top: '2%', left: '42%', rot: 3 },
  { tag: 'chat · #ops', name: "Yesterday's standup", top: '6%', left: '74%', rot: -2 },
  { tag: 'pdf · tender', name: 'Wellington · stage 2', top: '24%', left: '18%', rot: 4 },
  { tag: 'doc · meeting', name: 'Board notes 12 May', top: '22%', left: '56%', rot: -3 },
  { tag: 'task · overdue', name: '4 items, 2 owners', top: '38%', left: '2%', rot: 2 },
  { tag: 'invoice · #4421', name: 'Awaiting approval', top: '42%', left: '38%', rot: -4 },
  { tag: 'call · missed', name: '3 from supplier', top: '40%', left: '72%', rot: 5 },
  { tag: 'brief · client', name: 'Auaha campaign', top: '60%', left: '14%', rot: -2 },
  { tag: 'sheet · budget', name: 'v3 (final)', top: '62%', left: '48%', rot: 3 },
  { tag: 'slack · dm', name: 'Risk flag, 2 days', top: '78%', left: '8%', rot: 4 },
  { tag: 'inbox · unread', name: '47 since Friday', top: '80%', left: '52%', rot: -3 },
];

function Scene1() {
  const reduce = useReducedMotion();
  return (
    <SceneShell
      index={0}
      id="s1"
      eyebrow="scene one"
      heading={
        <>
          your evidence is{' '}
          <em
            className="not-italic"
            style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
          >
            scattered.
          </em>
        </>
      }
      body="The email, the drive, the chat, the spreadsheet no one named. When something needs answering, you go hunting."
    >
      <div className="relative h-full w-full">
        {SCENE_1_NOTES.map((note, i) => (
          <motion.div
            key={i}
            className="absolute min-w-[140px] rounded-[2px] px-4 pb-3 pt-3.5"
            style={{
              top: note.top,
              left: note.left,
              backgroundColor: 'var(--assembl-paper)',
              border: '0.5px solid rgba(212,168,83,0.32)',
              boxShadow:
                '0 12px 24px -12px rgba(35,33,31,0.18), 0 2px 4px rgba(35,33,31,0.04)',
              transform: `rotate(${note.rot}deg)`,
            }}
            animate={
              reduce
                ? undefined
                : {
                    y: [0, -3, 0],
                    x: [0, 2, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: i % 2 === 0 ? 18 : 14,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: (i % 5) * 0.3,
                  }
            }
          >
            {/* Gold thread top hairline */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-50"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--assembl-gold-thread), transparent)',
              }}
            />
            <div
              className="mb-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <PulseDot size={5} />
              {note.tag}
            </div>
            <div
              className="font-display text-sm italic leading-[1.2]"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              {note.name}
            </div>
            <div
              className="mt-1 h-px w-3/5"
              style={{ backgroundColor: 'rgba(35,33,31,0.18)' }}
            />
            <div
              className="mt-[5px] h-px w-2/5"
              style={{ backgroundColor: 'rgba(35,33,31,0.18)' }}
            />
          </motion.div>
        ))}
      </div>
    </SceneShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — fragments collapse into five strata
// ─────────────────────────────────────────────────────────────────────────────

const SCENE_2_ROWS: Array<{ tag: string; top: string; notes: Array<{ k: string; v: string }> }> = [
  {
    tag: 'regulatory',
    top: '6%',
    notes: [
      { k: 'tender · ', v: 'welly · stage 2' },
      { k: 'consent · ', v: '#4421 awaiting' },
      { k: 'mbie · ', v: 'bulletin q2' },
    ],
  },
  {
    tag: 'operational',
    top: '24%',
    notes: [
      { k: 'manifest · ', v: 'TUI-3142' },
      { k: 'dwell · ', v: 'TGA +1.4d' },
      { k: 'induction · ', v: 'site-c expired' },
    ],
  },
  {
    tag: 'market',
    top: '42%',
    notes: [
      { k: 'cover · ', v: 'wgn 87.4%' },
      { k: 'POS · ', v: 'repeat-visit ↘' },
      { k: 'SOC · ', v: 'port q2' },
    ],
  },
  {
    tag: 'workforce',
    top: '60%',
    notes: [
      { k: 'claim · ', v: 'acc-2046' },
      { k: 'wage · ', v: 'trades +4.2%' },
      { k: 'slate · ', v: 'nzfc r19' },
    ],
  },
  {
    tag: 'cultural · context',
    top: '78%',
    notes: [
      { k: 'iwi register · ', v: 'live' },
      { k: 'tikanga · ', v: 'applied' },
      { k: 'privacy · ', v: 'IPP-3A' },
    ],
  },
];

function Scene2() {
  return (
    <SceneShell
      index={1}
      id="s2"
      eyebrow="scene two"
      heading={
        <>
          assembl pulls it{' '}
          <em
            className="not-italic"
            style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
          >
            together.
          </em>
        </>
      }
      body="Point the agent at the question. It finds each piece in the right place, shows you what it has, and waits for you to say go."
    >
      <div className="relative h-full w-full">
        {/* dashed connectors between strata */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {[
            [20, 14, 20, 32],
            [48, 14, 48, 32],
            [78, 14, 78, 32],
            [14, 32, 14, 50],
            [42, 32, 42, 50],
            [70, 32, 70, 50],
            [22, 50, 22, 68],
            [50, 50, 50, 68],
            [78, 50, 78, 68],
            [18, 68, 18, 86],
            [46, 68, 46, 86],
            [72, 68, 72, 86],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--assembl-gold-thread)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
              opacity="0.5"
            />
          ))}
        </svg>

        {SCENE_2_ROWS.map((row, ri) => (
          <motion.div
            key={row.tag}
            className="absolute left-[4%] right-[4%] flex h-12 items-center gap-2.5"
            style={{ top: row.top }}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.55, delay: ri * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="absolute left-0 top-[-16px] font-mono text-[9px] uppercase tracking-[0.16em]"
              style={{ color: 'var(--assembl-pounamu)' }}
            >
              <span
                aria-hidden
                className="mr-2 inline-block h-px w-3.5 align-middle"
                style={{ backgroundColor: 'var(--assembl-gold-thread)' }}
              />
              {row.tag}
            </span>
            {row.notes.map((n, ni) => (
              <div
                key={ni}
                className="flex items-center gap-2 whitespace-nowrap rounded-[2px] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{
                  backgroundColor: 'var(--assembl-paper)',
                  border: '0.5px solid rgba(212,168,83,0.32)',
                  boxShadow: '0 8px 16px -10px rgba(35,33,31,0.16)',
                  color: 'var(--text-secondary)',
                  transform: `rotate(${ni % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                <PulseDot size={5} />
                {n.k}
                <span
                  className="font-display text-[13px] italic"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 400,
                    letterSpacing: 0,
                  }}
                >
                  {n.v}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </SceneShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — six layered translucent panels + armature
// ─────────────────────────────────────────────────────────────────────────────

function Scene3() {
  return (
    <SceneShell
      index={2}
      id="s3"
      eyebrow="scene three"
      heading={
        <>
          the workflow runs{' '}
          <em
            className="not-italic"
            style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
          >
            in the open.
          </em>
        </>
      }
      body="Every action cited. Every step reversible. Nothing happens behind your back."
    >
      <div className="relative h-full w-full" style={{ perspective: '1200px' }}>
        <div
          className="absolute"
          style={{
            top: '8%',
            right: '10%',
            bottom: '8%',
            left: '10%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(2deg) rotateY(-4deg)',
          }}
        >
          {/* l1 deepest pounamu */}
          <Panel
            inset="6% 14% 14% 4%"
            background="linear-gradient(160deg,rgba(43,107,87,0.42),rgba(43,107,87,0.22) 55%,rgba(110,149,127,0.30))"
            mixBlendMultiply
            shadow="0 30px 60px -30px rgba(43,107,87,0.4)"
          />
          {/* l2 pounamu mid */}
          <Panel
            inset="14% 8% 18% 12%"
            background="linear-gradient(180deg,rgba(43,107,87,0.28),rgba(110,149,127,0.18))"
            mixBlendMultiply
          />
          {/* l3 silk */}
          <Panel
            inset="18% 4% 8% 18%"
            background="linear-gradient(200deg,rgba(232,199,122,0.18),rgba(250,247,242,0.55) 50%,rgba(232,228,222,0.40))"
            border="0.5px solid rgba(212,168,83,0.22)"
            shadow="inset 0 0 30px rgba(250,247,242,0.4)"
          />
          {/* l4 glass */}
          <Panel
            inset="26% 18% 24% 10%"
            background="linear-gradient(165deg,rgba(232,228,222,0.60),rgba(250,247,242,0.35) 55%,rgba(43,107,87,0.10))"
            border="0.5px solid rgba(35,33,31,0.08)"
            shadow="0 20px 40px -20px rgba(35,33,31,0.18), inset 0 1px 0 rgba(255,255,255,0.5)"
          />
          {/* l5 mist top */}
          <Panel
            inset="32% 28% 34% 22%"
            background="linear-gradient(180deg,rgba(250,247,242,0.70),rgba(232,228,222,0.40))"
            border="0.5px solid rgba(35,33,31,0.06)"
          />
          {/* l6 gold spine */}
          <Panel
            inset="8% 48% 8% 48%"
            background="linear-gradient(180deg,rgba(212,168,83,0.16),rgba(212,168,83,0.06) 50%,rgba(212,168,83,0.16))"
            border="0"
            extra={{
              borderLeft: '0.5px solid rgba(212,168,83,0.4)',
              borderRight: '0.5px solid rgba(212,168,83,0.4)',
              borderRadius: 0,
            }}
          />

          {/* drifting gold pulses */}
          <PulseDot
            absolute
            size={6}
            style={{ top: '32%', left: '36%', animationDelay: '.2s' }}
          />
          <PulseDot
            absolute
            size={4}
            style={{ top: '48%', left: '54%', animationDelay: '1.6s' }}
          />
          <PulseDot
            absolute
            size={6}
            style={{ top: '62%', left: '42%', animationDelay: '3s' }}
          />
          <PulseDot
            absolute
            size={4}
            style={{ top: '38%', left: '62%', animationDelay: '.8s' }}
          />
        </div>

        {/* armature — gold hairlines forming a frame around the panels */}
        <svg
          className="pointer-events-none absolute"
          style={{ top: '8%', right: '10%', bottom: '8%', left: '10%', opacity: 0.6 }}
          viewBox="0 0 100 105"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            x="6"
            y="3"
            width="88"
            height="99"
            rx="3"
            fill="none"
            stroke="var(--assembl-gold-thread)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            opacity="0.7"
          />
          <line
            x1="6"
            y1="18"
            x2="94"
            y2="18"
            stroke="var(--assembl-gold-thread)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            opacity="0.7"
          />
          <line
            x1="6"
            y1="87"
            x2="94"
            y2="87"
            stroke="var(--assembl-gold-thread)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            opacity="0.7"
          />
          <line
            x1="50"
            y1="3"
            x2="50"
            y2="18"
            stroke="var(--assembl-gold-thread)"
            strokeWidth="0.4"
            strokeDasharray="1.5,2"
            vectorEffect="non-scaling-stroke"
            opacity="0.4"
          />
          <line
            x1="50"
            y1="87"
            x2="50"
            y2="102"
            stroke="var(--assembl-gold-thread)"
            strokeWidth="0.4"
            strokeDasharray="1.5,2"
            vectorEffect="non-scaling-stroke"
            opacity="0.4"
          />
          <circle cx="50" cy="10.5" r="0.9" fill="var(--assembl-gold-thread)" opacity="0.8" />
          <circle cx="50" cy="94.5" r="0.9" fill="var(--assembl-gold-thread)" opacity="0.8" />
        </svg>
      </div>
    </SceneShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — locked vessel + four mono labels (pounamu underlines)
// ─────────────────────────────────────────────────────────────────────────────

function Scene4() {
  return (
    <SceneShell
      index={3}
      id="s4"
      eyebrow="scene four"
      heading={
        <>
          it lands as{' '}
          <em
            className="not-italic"
            style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
          >
            one evidence pack.
          </em>
        </>
      }
      body="The response, the supporting documents, the changes, the timestamps. One artefact, ready for sign-off, with the trail behind every line."
    >
      <div className="relative h-full w-full">
        <WaihangaVessel breathe />

        {/* mono labels overlay — pounamu underlines, NOT brass */}
        <VesselLabel position="tl">signal in</VesselLabel>
        <VesselLabel position="tr">evidence held</VesselLabel>
        <VesselLabel position="bl">decision out</VesselLabel>
        <VesselLabel position="br">trail kept</VesselLabel>
      </div>
    </SceneShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — vessel slides left, decision brief slides in
// ─────────────────────────────────────────────────────────────────────────────

function Scene5() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const vesselX = useTransform(scrollYProgress, [0.2, 0.55], ['8%', '0%']);
  const briefX = useTransform(scrollYProgress, [0.2, 0.55], ['12%', '0%']);
  const briefOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  return (
    <SceneShell
      index={4}
      id="s5"
      variant="wide"
      eyebrow="scene five"
      heading={
        <>
          file it, forward it,{' '}
          <em
            className="not-italic"
            style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
          >
            footnote it.
          </em>
        </>
      }
      body="Into your system of record, your client's inbox, or a regulator's footnote. Defensible because it's traceable."
    >
      <div
        ref={ref}
        className="relative grid h-[74vh] min-h-[560px] w-full grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1fr]"
      >
        <motion.div
          className="relative h-full"
          style={{
            x: reduce ? '0%' : vesselX,
          }}
        >
          <div className="absolute" style={{ top: '4%', right: '8%', bottom: '4%', left: '8%' }}>
            <WaihangaVessel breathe compact />
          </div>
        </motion.div>

        <motion.div
          className="relative self-center rounded-[2px] px-7 pb-7 pt-8 md:px-8 md:pb-7 md:pt-8"
          style={{
            backgroundColor: 'var(--assembl-paper)',
            border: '0.5px solid rgba(35,33,31,0.10)',
            boxShadow: '0 40px 80px -40px rgba(35,33,31,0.22)',
            x: reduce ? '0%' : briefX,
            opacity: reduce ? 1 : briefOpacity,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--assembl-gold-thread), transparent)',
            }}
          />

          {/* head */}
          <div
            className="flex items-center justify-between border-b pb-[18px] font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{
              color: 'var(--text-secondary)',
              borderColor: 'rgba(35,33,31,0.08)',
            }}
          >
            <span
              className="flex items-center gap-2.5"
              style={{ color: 'var(--assembl-pounamu)' }}
            >
              <PulseDot size={6} pounamu />
              evidence pack · ready
            </span>
            <span>07 may 2026 · 09:14 nzst</span>
          </div>

          {/* eyebrow */}
          <p
            className="mt-[22px] mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--assembl-pounamu)' }}
          >
            <span
              aria-hidden
              className="inline-block h-px w-6"
              style={{ backgroundColor: 'var(--assembl-gold-thread)' }}
            />
            evidence pack · ready to file
          </p>

          {/* title */}
          <h3
            className="mb-[18px] font-display italic leading-[1.15]"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 300,
              fontSize: '30px',
              letterSpacing: '-0.005em',
            }}
          >
            Tender response · stage 2 ·{' '}
            <em
              className="not-italic"
              style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
            >
              Wellington.
            </em>
          </h3>

          {/* body */}
          <p
            className="border-b pb-[22px] font-display italic text-[15px] leading-[1.6]"
            style={{
              color: 'var(--text-body)',
              opacity: 0.78,
              borderColor: 'rgba(35,33,31,0.08)',
            }}
          >
            The response is drafted, the supporting documents are linked, the timestamps are clean.
            Ready for your sign-off, then it ships.
          </p>

          {/* timeline */}
          <div
            className="border-b py-[22px]"
            style={{ borderColor: 'rgba(35,33,31,0.08)' }}
          >
            <div
              className="mb-3.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span>workflow trail</span>
              <span>14 steps · each cited</span>
            </div>
            <div className="relative h-[18px]">
              <div
                className="absolute left-0 right-0 top-1/2 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(35,33,31,0.04), rgba(35,33,31,0.18) 20%, rgba(35,33,31,0.18) 80%, rgba(35,33,31,0.04))',
                }}
              />
              {[6, 18, 32, 44, 58, 72].map((left) => (
                <span
                  key={left}
                  className="absolute top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${left}%`,
                    background:
                      'radial-gradient(circle, rgba(232,199,122,1), var(--assembl-gold-thread) 70%, transparent)',
                    boxShadow: '0 0 8px 1px rgba(212,168,83,0.5)',
                  }}
                />
              ))}
              <span
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: '75%',
                  background:
                    'radial-gradient(circle, rgba(232,199,122,1), var(--assembl-gold-thread) 70%, transparent)',
                  boxShadow: '0 0 14px 2px rgba(212,168,83,0.6)',
                }}
                aria-label="now"
              />
            </div>
            <div
              className="mt-2.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span>intake</span>
              <span>check</span>
              <span>draft</span>
              <span>review</span>
              <span>file</span>
            </div>
          </div>

          {/* meta grid */}
          <dl className="grid grid-cols-2 gap-x-8 gap-y-[18px] pt-[22px]">
            {[
              { dt: 'sector', dd: <>Business operations</> },
              {
                dt: 'confidence',
                dd: (
                  <em
                    className="not-italic"
                    style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
                  >
                    High
                  </em>
                ),
              },
              { dt: 'source', dd: <>5 documents · 2 conversations</> },
              {
                dt: 'suggested action',
                dd: (
                  <em
                    className="not-italic"
                    style={{ color: 'var(--assembl-pounamu)', fontWeight: 400 }}
                  >
                    Approve and forward
                  </em>
                ),
              },
            ].map((cell, i) => (
              <div key={i}>
                <dt
                  className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-px w-3.5"
                    style={{ backgroundColor: 'var(--assembl-gold-thread)' }}
                  />
                  {cell.dt}
                </dt>
                <dd
                  className="font-display text-lg leading-[1.2]"
                  style={{ color: 'var(--text-primary)', fontWeight: 300 }}
                >
                  {cell.dd}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </SceneShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WaihangaVessel — locked Waihanga render (cream backdrop, silk-organza bloom).
// Used in scene 4 (full inset) and scene 5 (compact). Replaces the prior
// CSS Vessel composition. Honours prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

function WaihangaVessel({
  breathe = false,
  compact = false,
}: {
  breathe?: boolean;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const inset = compact ? '0' : '4% 12%';
  return (
    <motion.div
      className="absolute overflow-hidden rounded-sm bg-[color:var(--assembl-paper)]"
      style={{ inset, border: '1px solid rgba(43,107,87,0.18)' }}
      animate={breathe && !reduce ? { scale: [1, 1.012, 1] } : undefined}
      transition={
        breathe && !reduce
          ? { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <Image
        src="/img/hero/waihanga-vessel-cream.jpg"
        alt="Waihanga evidence vessel — silk-organza pounamu bloom on cream backdrop."
        fill
        sizes="(min-width: 1024px) 50vw, 90vw"
        loading="lazy"
        className="object-cover"
      />
    </motion.div>
  );
}

const thinGold = {
  stroke: 'var(--assembl-gold-thread)',
  strokeWidth: 0.6,
  vectorEffect: 'non-scaling-stroke' as const,
  opacity: 0.85,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function Panel({
  inset,
  background,
  border,
  shadow,
  rounded = '6px',
  mixBlendMultiply = false,
  translateZ,
  extra,
}: {
  inset: string;
  background: string;
  border?: string;
  shadow?: string;
  rounded?: string;
  mixBlendMultiply?: boolean;
  translateZ?: number;
  extra?: React.CSSProperties;
}) {
  const [top, right, bottom, left] = inset.split(' ');
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top,
        right,
        bottom,
        left,
        background,
        border: border ?? '0.5px solid rgba(35,33,31,0.06)',
        borderRadius: rounded,
        boxShadow: shadow,
        mixBlendMode: mixBlendMultiply ? 'multiply' : undefined,
        transform: translateZ ? `translateZ(${translateZ}px)` : undefined,
        transition: 'all 1.2s cubic-bezier(.2,.8,.2,1)',
        ...extra,
      }}
    />
  );
}

function PulseDot({
  size = 5,
  absolute = false,
  pounamu = false,
  bright = false,
  style,
}: {
  size?: number;
  absolute?: boolean;
  pounamu?: boolean;
  bright?: boolean;
  style?: React.CSSProperties;
}) {
  const background = pounamu
    ? 'var(--assembl-pounamu)'
    : bright
      ? 'radial-gradient(circle, rgba(232,199,122,1), var(--assembl-gold-thread) 50%, transparent)'
      : 'radial-gradient(circle, rgba(232,199,122,1), var(--assembl-gold-thread) 70%, transparent)';
  const shadow = pounamu
    ? '0 0 8px rgba(43,107,87,0.5)'
    : bright
      ? '0 0 14px 3px rgba(212,168,83,0.45), 0 0 4px rgba(232,199,122,0.8)'
      : '0 0 8px 1px rgba(212,168,83,0.55)';
  return (
    <span
      aria-hidden
      className="rounded-full motion-safe:animate-pulse"
      style={{
        position: absolute ? 'absolute' : 'static',
        display: absolute ? 'block' : 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        background,
        boxShadow: shadow,
        ...style,
      }}
    />
  );
}

function VesselLabel({
  position,
  children,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  children: React.ReactNode;
}) {
  const isRight = position === 'tr' || position === 'br';
  const corner: React.CSSProperties = {
    tl: { top: '2%', left: 0 },
    tr: { top: '14%', right: 0 },
    bl: { bottom: '18%', left: 0 },
    br: { bottom: '6%', right: 0 },
  }[position];

  return (
    <span
      className="absolute z-10 flex items-center gap-2.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em]"
      style={{ ...corner, color: 'var(--text-body)', opacity: 0.75 }}
    >
      {!isRight && (
        <span
          aria-hidden
          className="inline-block h-px w-5"
          style={{ backgroundColor: 'var(--assembl-pounamu)' }}
        />
      )}
      {children}
      {isRight && (
        <span
          aria-hidden
          className="inline-block h-px w-5"
          style={{ backgroundColor: 'var(--assembl-pounamu)' }}
        />
      )}
    </span>
  );
}

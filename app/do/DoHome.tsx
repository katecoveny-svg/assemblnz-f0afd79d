"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DoHoverCards, type DoHoverCardItem } from "@/components/do/DoHoverCards";
import {
  useAtelierMotionGate,
  useAtelierVisibility,
} from "@/components/site/assembl-the-work/WorldAtelierStage";
import { DoAtelierHeroStage } from "./DoAtelierHeroStage";
import styles from "./do-home.module.css";

/** Public path for the daylight atelier still — also used as CSS fallback. */
const ATELIER_POSTER = "/do/world/atelier-poster.png";

const BEATS: DoHoverCardItem[] = [
  {
    id: "click",
    index: "01",
    title: "Click DO where you are",
    body: "Browser, desktop, or share surface — same agent, same context.",
    diagram: <DiagramClick />,
  },
  {
    id: "template",
    index: "02",
    title: "Pick or tweak a template",
    body: "Start from a useful shape for the job in front of you.",
    diagram: <DiagramTemplate />,
  },
  {
    id: "connect",
    index: "03",
    title: "Connect only if you need to",
    body: "Optional connectors. You review before anything consequential.",
    diagram: <DiagramConnect />,
  },
];

function DiagramClick() {
  return (
    <svg viewBox="0 0 160 72" width="150" height="68" fill="none" aria-hidden="true">
      <rect x="18" y="10" width="124" height="52" rx="4" stroke="#240B21" strokeOpacity="0.35" />
      <rect x="18" y="10" width="124" height="12" fill="#240B21" fillOpacity="0.08" />
      <circle cx="28" cy="16" r="2" fill="#916A70" />
      <circle cx="36" cy="16" r="2" fill="#916A70" fillOpacity="0.55" />
      <rect x="30" y="32" width="58" height="6" rx="2" fill="#240B21" fillOpacity="0.12" />
      <rect x="30" y="42" width="40" height="6" rx="2" fill="#240B21" fillOpacity="0.08" />
      <g transform="translate(108 34)">
        <circle cx="10" cy="10" r="12" fill="#D6A5BD" fillOpacity="0.45" />
        <circle cx="10" cy="10" r="7" fill="#240B21" />
        <circle cx="10" cy="10" r="2.2" fill="#F5F1F2" />
      </g>
    </svg>
  );
}

function DiagramTemplate() {
  return (
    <svg viewBox="0 0 160 72" width="150" height="68" fill="none" aria-hidden="true">
      <rect x="28" y="8" width="70" height="56" rx="3" fill="#FFFDFB" stroke="#240B21" strokeOpacity="0.3" />
      <rect x="36" y="18" width="42" height="4" rx="1.5" fill="#240B21" fillOpacity="0.2" />
      <rect x="36" y="28" width="54" height="3" rx="1.5" fill="#240B21" fillOpacity="0.12" />
      <rect x="36" y="36" width="48" height="3" rx="1.5" fill="#240B21" fillOpacity="0.12" />
      <rect x="36" y="44" width="36" height="3" rx="1.5" fill="#916A70" fillOpacity="0.55" />
      <rect x="88" y="18" width="48" height="40" rx="3" fill="#F5F1F2" stroke="#916A70" strokeOpacity="0.55" />
      <path d="M100 32h24M100 40h18" stroke="#654A4E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DiagramConnect() {
  return (
    <svg viewBox="0 0 160 72" width="150" height="68" fill="none" aria-hidden="true">
      <circle cx="40" cy="36" r="14" stroke="#240B21" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="40" cy="36" r="5" fill="#240B21" />
      <circle cx="120" cy="24" r="10" stroke="#916A70" strokeWidth="2" />
      <circle cx="120" cy="52" r="10" stroke="#916A70" strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M54 32C78 18 96 18 110 22"
        stroke="#D6A5BD"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M54 40C78 54 96 54 110 50"
        stroke="#916A70"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.7"
      />
    </svg>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Public /do — Kate craft 2026-09-17 evening.
 * Locked meaning + interactive craft (scroll, hover, glow).
 * No Meeting/Household shelf, no Identity D theatre, no vendor names,
 * no technique captions ("experiment", "lab", "preview theatre").
 */
export function DoHome() {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const reduced = useAtelierMotionGate();
  const visible = useAtelierVisibility(rail);
  const onFailure = useCallback(() => {
    setSceneReady(false);
    setFailed(true);
  }, []);

  useEffect(() => {
    if (!visible) setSceneReady(false);
  }, [visible]);

  const showStill = reduced || failed || !sceneReady;

  useEffect(() => {
    const scroll = () => {
      const el = rail.current;
      if (!el) return;
      if (reduced || failed) {
        progress.current = 0.35;
        return;
      }
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      progress.current = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
    };
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    return () => {
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
    };
  }, [reduced, failed]);

  return (
    <div className={`do-craft ${styles.page}`}>
      <a className={styles.skip} href="#do-explain">
        Skip to content
      </a>

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          assembl
        </Link>
        <span className={styles.product}>/ DO</span>
        <nav aria-label="assembl products">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
        </nav>
      </header>

      <section
        ref={rail}
        className={styles.hero}
        aria-labelledby="do-hero-title"
        data-static={reduced || failed || undefined}
      >
        <div className={styles.heroFrame}>
          <div className={styles.heroStage}>
            <div className={styles.heroWorld}>
              <DoAtelierHeroStage
                progress={progress}
                reduced={reduced}
                visible={visible}
                failed={failed}
                onReady={setSceneReady}
                onFailure={onFailure}
                priority
              />
            </div>
            {/* Always-on still: CSS/path-safe; dims when the live stage is ready. */}
            <Image
              src={ATELIER_POSTER}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className={`${styles.heroPosterImage}${showStill ? "" : ` ${styles.heroPosterDimmed}`}`}
            />
          </div>
          <div className={styles.heroScrim} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>DO</p>
            <h1 id="do-hero-title" className={styles.title}>
              Work from the place
              <br />
              you’re already in.
            </h1>
            <p className={styles.lede}>
              DO is a small agent that sits where you already work. Click it when
              you need help with that context. Pick or tweak a template. Connect a
              tool only when you want to. The surface is not the agent — you stay
              in your own work.
            </p>
          </div>
        </div>
      </section>

      <main className={styles.main} id="do-explain">
        <Reveal>
          <p className={styles.sectionEyebrow}>How DO works</p>
          <h2 className={styles.sectionTitle}>Choose the task. Connect what it needs.</h2>
        </Reveal>

        <Reveal delay={0.08} className={styles.cardsReveal}>
          <DoHoverCards items={BEATS} />
        </Reveal>

        <Reveal delay={0.12} className={styles.promiseBlock}>
          <p className={styles.promise}>
            You can DO the work from the place you’re already in.
          </p>
          <div className={styles.actions}>
            <Link href="/contact?product=do" className={styles.primary}>
              Talk to us about DO
            </Link>
            <Link href="/" className={styles.ghost}>
              Back to assembl
            </Link>
            <Link href="/pursuit" className={styles.ghost}>
              Open Pursuit
            </Link>
            <Link href="/creative-studio" className={styles.ghost}>
              Open Studio
            </Link>
          </div>
        </Reveal>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          assembl
        </Link>
        <p>Find it. DO it. Show it.</p>
        <nav aria-label="Footer">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}

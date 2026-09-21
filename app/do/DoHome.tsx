"use client";

import Image from "next/image";
import { ArrowUpRight, AudioLines, CalendarDays, ReceiptText } from "lucide-react";
import { DoPresence } from "@/components/do/DoPresence";
import { DoGlowCard } from "@/components/do/DoGlowCard";
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
    body: "Open the workspace or use the companion to bring selected context.",
    diagram: <DiagramClick />,
  },
  {
    id: "template",
    index: "02",
    title: "Pick or tweak a template",
    body: "Choose a task and edit the instructions for your job.",
    diagram: <DiagramTemplate />,
  },
  {
    id: "connect",
    index: "03",
    title: "Connect only if you need to",
    body: "Connect the tools the task needs. Review before external actions.",
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
 * Public /do entry: open an existing task first; product story follows.
 * User direction 2026-09-20 supersedes the earlier explanation-only lock.
 * Keep the established atelier and consent boundaries.
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
    if (visible) return;
    const frame = requestAnimationFrame(() => setSceneReady(false));
    return () => cancelAnimationFrame(frame);
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
      <a className={styles.skip} href="#do-start">
        Skip to DO tasks
      </a>

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          assembl
        </Link>
        <span className={styles.product}>/ DO</span>
        <nav aria-label="assembl products">
          <Link href="/do/widget">Open workspace</Link>
          <Link href="/login?redirect=%2Fdo">Sign in</Link>
        </nav>
      </header>

      <section id="do-start" className={styles.launcher} aria-labelledby="do-start-title">
        <div className={styles.launcherHeading}>
          <div><p className={styles.sectionEyebrow}>ONE DO. A FEW WAYS TO START.</p>
            <h1 id="do-start-title">What needs<br /><span>doing?</span></h1></div>
          <p className={styles.startIntro}>Choose the work in front of you. Bring the context, then review what DO prepares.</p>
        </div>
        <div className={styles.startGrid}>
          <DoGlowCard as="div" variant="bare" className={styles.featuredTask}>
            <Link className={`${styles.startCard} ${styles.everydayTask}`} href="/do/widget">
              <span className={styles.startStatus}>01 / PASTE TEXT · TRY A DRAFT</span>
              <div className={styles.taskSculpture}><DoPresence size="large" /></div>
              <div className={styles.featuredCopy}><h2>Less admin.<br /><span>More mahi.</span></h2><p>Write a reply, make a plan, compare options or find the details.</p></div>
              <strong>Open Everyday DO <ArrowUpRight size={24} aria-hidden="true" /></strong>
            </Link>
          </DoGlowCard>
          <Link className={`${styles.startCard} ${styles.meetingTask}`} href="/do/meetings">
            <div className={styles.taskTop}><span className={styles.startStatus}>02 / PREVIEW · SIGN IN FOR NOTES</span><AudioLines size={28} strokeWidth={1.3} aria-hidden="true" /></div>
            <h2>Meet. Then move.</h2><p>Record or paste a transcript. Review notes and prepare the follow-up.</p>
            <strong>Open Meeting DO <ArrowUpRight size={22} aria-hidden="true" /></strong>
          </Link>
          <Link className={`${styles.startCard} ${styles.familyTask}`} href="/do/widget?task=plan">
            <div className={styles.taskTop}><span className={styles.startStatus}>03 / PASTE A NOTICE · REVIEW A PLAN</span><CalendarDays size={28} strokeWidth={1.3} aria-hidden="true" /></div>
            <h2>Life, a little lighter.</h2><p>Turn a school notice or family to-do list into a plan you can check and keep.</p>
            <strong>Organise a notice <ArrowUpRight size={22} aria-hidden="true" /></strong>
          </Link>
          <Link className={`${styles.startCard} ${styles.billsTask}`} href="/do/bills">
            <div className={styles.taskTop}><span className={styles.startStatus}>04 / FICTIONAL EXAMPLE · YOUR CSV</span><ReceiptText size={28} strokeWidth={1.3} aria-hidden="true" /></div>
            <h2>Stay ahead of bills.</h2><p>Spot recurring payments, check due dates and prepare an enquiry you can review.</p>
            <strong>Open DO Bills <ArrowUpRight size={22} aria-hidden="true" /></strong>
          </Link>
        </div>
        <div className={styles.startLinks}>
          <Link href="/do/install#chrome">Browser companion · setup guide ↗</Link>
          <Link href="#do-explain">How DO works ↓</Link>
        </div>
        <p className={styles.startNote}>Drafts stay under your control. Sending, sharing and calendar changes need a separate step.</p>
      </section>

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
            <h2 id="do-hero-title" className={styles.title}>
              Work from the place
              <br />
              you’re already in.
            </h2>
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
            Choose the task. Add the context. Review the result.
          </p>
          <div className={styles.actions}>
            <Link href="/do/widget" className={styles.primary}>
              Open DO workspace
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

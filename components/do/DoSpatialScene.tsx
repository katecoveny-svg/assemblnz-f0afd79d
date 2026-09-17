"use client";

import { DoMark } from "./DoMark";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import styles from "./do-spatial-scene.module.css";

const COMPANY = [
  {
    label: "Pursuit",
    title: "Find the opening.",
    href: "https://assembl-pursuit.katecoveny.chatgpt.site",
    glyph: "↗",
  },
  { label: "DO", title: "Move the work forward.", href: "/do", glyph: "✦" },
  {
    label: "Studio",
    title: "Make it tangible.",
    href: "/creative-studio",
    glyph: "◈",
  },
];
const COMPANIONS = [
  {
    label: "Meeting DO",
    title: "Record → notes you can use.",
    href: "/do/meetings",
    glyph: "◎",
  },
  {
    label: "Household DO",
    title: "Simple chores board (demo).",
    href: "/do/household",
    glyph: "⌂",
  },
];

/** A visual identity, not a claim that a background job is running. */
export function DoSpatialScene({ company = false }: { company?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, (innerHeight * 0.45 - rect.top) / innerHeight),
      );
      element.style.setProperty(
        "--drift",
        paused || reduced.matches ? "0px" : `${progress * 65}px`,
      );
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(element);
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [paused]);

  return (
    <div
      ref={root}
      className={styles.scene}
      data-paused={paused}
      aria-label={company ? "Pursuit, DO and Studio" : "Meet your DOs"}
    >
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.identity} aria-hidden="true">
        <span className={styles.mark}>
          <DoMark />
        </span>
      </div>
      {(company ? COMPANY : COMPANIONS).map((item, index) => (
        <Link
          className={styles.card}
          data-depth={index}
          href={item.href}
          key={item.label}
        >
          <span className={styles.glyph} aria-hidden="true">
            {item.label === "DO" || item.label === "Meeting DO" ? (
              <DoMark />
            ) : (
              item.glyph
            )}
          </span>
          <span>
            <small>{item.label}</small>
            <strong>{item.title}</strong>
          </span>
          <ArrowUpRight size={15} />
        </Link>
      ))}
      <div className={styles.caption}>
        <span>
          {company ? "ONE CONNECTED SYSTEM" : "YOUR WORK. YOUR LITTLE DO."}
        </span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Resume spatial motion" : "Pause spatial motion"}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  );
}

"use client";

/**
 * Pointer-tracking border glow for DO craft surfaces.
 * Patterns adapted from Aceternity glowing-effect + Magic UI magic-card,
 * recolored to Assembl plum/rose (never purple/violet demos).
 */
import {
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import styles from "./do-glow-card.module.css";

export function DoGlowCard({
  children,
  className = "",
  as: Tag = "article",
  variant = "paper",
}: {
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "li";
  variant?: "paper" | "bare";
}) {
  const root = useRef<HTMLElement>(null);

  const onMove = useCallback((event: MouseEvent<HTMLElement>) => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glow-x", `${x}%`);
    el.style.setProperty("--glow-y", `${y}%`);
  }, []);

  const onLeave = useCallback(() => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--glow-x", "50%");
    el.style.setProperty("--glow-y", "50%");
    el.removeAttribute("data-active");
  }, []);

  const onEnter = useCallback(() => {
    root.current?.setAttribute("data-active", "true");
  }, []);

  return (
    <Tag
      ref={root as never}
      data-variant={variant}
      className={`${styles.card} ${className}`.trim()}
      style={{ "--glow-x": "50%", "--glow-y": "50%" } as CSSProperties}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span className={styles.glow} aria-hidden="true" />
      <span className={styles.spotlight} aria-hidden="true" />
      <div className={styles.inner}>{children}</div>
    </Tag>
  );
}

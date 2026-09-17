"use client";

/**
 * Shared hover-slide highlight across a card grid.
 * Pattern adapted from Aceternity card-hover-effect; Assembl plum/rose only.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { DoGlowCard } from "./DoGlowCard";
import styles from "./do-hover-cards.module.css";

export type DoHoverCardItem = {
  id: string;
  index: string;
  title: string;
  body: string;
  diagram: ReactNode;
};

export function DoHoverCards({ items }: { items: DoHoverCardItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <ul className={styles.grid} onMouseLeave={() => setHovered(null)}>
      {items.map((item) => (
        <li
          key={item.id}
          className={styles.cell}
          onMouseEnter={() => setHovered(item.id)}
        >
          <AnimatePresence>
            {!reduce && hovered === item.id ? (
              <motion.span
                className={styles.slide}
                layoutId="do-hover-slide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                aria-hidden="true"
              />
            ) : null}
          </AnimatePresence>
          <DoGlowCard className={styles.glowWrap}>
            <div className={styles.content}>
              <div className={styles.diagram} aria-hidden="true">
                {item.diagram}
              </div>
              <span className={styles.index}>{item.index}</span>
              <strong className={styles.title}>{item.title}</strong>
              <p className={styles.body}>{item.body}</p>
            </div>
          </DoGlowCard>
        </li>
      ))}
    </ul>
  );
}

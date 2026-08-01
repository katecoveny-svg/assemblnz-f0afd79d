'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './assemble-type.module.css';

/**
 * AssembleType — a headline that assembles word by word.
 *
 * Kate, 1 August 2026: the one piece of the motion system that earns a place on
 * the live homepage. The wordmark above already flies in from scatter and docks;
 * this makes the line beneath it arrive the same way, so the hero reads as one
 * idea building rather than two unrelated entrances.
 *
 * WHY IT WRAPS ON THE CLIENT, NOT IN THE MARKUP
 * The copy stays a single readable string in the JSX — and therefore in COPY.md
 * — with no per-word spans for anyone to maintain. This walks text nodes after
 * mount and wraps each word in its own mask. With JavaScript off, or when the
 * reader asks for reduced motion, the headline renders exactly as authored.
 *
 * It changes no words. It adds no elements a reader can see.
 */
export function AssembleType({
  children,
  as: Tag = 'h1',
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.atDone) return;
    el.dataset.atDone = '1';

    const reduced = window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
    let n = 0;

    /* walk text nodes only, so <em>, <br> and links survive untouched */
    (function walk(node: Node) {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          String(c.nodeValue).split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const span = document.createElement('span');
            span.className = 'at-w';
            const i = document.createElement('i');
            i.textContent = t;
            i.style.transitionDelay = `${(delay / 1000 + n++ * 0.05).toFixed(3)}s`;
            span.appendChild(i);
            frag.appendChild(span);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && (c as Element).tagName !== 'BR') {
          walk(c);
        }
      });
    })(el);

    if (reduced) { setLive(true); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setLive(true); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const cls = [styles.host, live ? styles.in : '', className].filter(Boolean).join(' ');

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cls}>
      {children}
    </Tag>
  );
}

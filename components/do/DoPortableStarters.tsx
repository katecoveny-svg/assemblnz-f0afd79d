'use client';

import Link from 'next/link';
import styles from './do-portable.module.css';
import { DoDownloadsStrip } from './DoDownloadsStrip';
import '@/app/do/do-craft.css';

export type DoPortableStarterId = 'about' | 'contact' | 'downloads';

export type DoPortableStarter = {
  id: DoPortableStarterId;
  label: string;
  hint: string;
  href?: string;
  primary?: boolean;
};

/** Portable starters while the public try-it shelf is paused. */
export const DO_PORTABLE_STARTERS: DoPortableStarter[] = [
  {
    id: 'about',
    label: 'About DO',
    hint: 'Public try-it tools are paused. Read the holding page.',
    href: '/do',
    primary: true,
  },
  {
    id: 'contact',
    label: 'Talk about DO',
    hint: 'Open a real engagement when you need the execution layer.',
    href: '/contact?product=do',
  },
];

type Props = {
  title?: string;
  lede?: string;
  onStarter?: (starter: DoPortableStarter) => void;
  showDownloads?: boolean;
  className?: string;
};

/**
 * Portable empty-state for Glow / widget surfaces.
 * No Meeting/Household public shelf. No Personal/Inbox/Builder promos.
 */
export function DoPortableStarters({
  title = 'DO is paused on the public site',
  lede = 'The portable execution layer remains part of assembl. Public try-it tools are off for now.',
  onStarter,
  showDownloads = true,
  className,
}: Props) {
  function activate(starter: DoPortableStarter) {
    if (onStarter) {
      onStarter(starter);
      return;
    }
    if (starter.href) window.location.assign(starter.href);
  }

  return (
    <div className={[styles.shell, className].filter(Boolean).join(' ')}>
      <p className={styles.eyebrow}>assembl · DO</p>
      <h2 className={styles.prompt}>{title}</h2>
      <p className={styles.lede}>{lede}</p>
      <div className={styles.starters} role="list">
        {DO_PORTABLE_STARTERS.map((starter) => {
          const className = starter.primary ? styles.starterPrimary : styles.starter;
          if (starter.href && !onStarter) {
            return (
              <Link
                key={starter.id}
                href={starter.href}
                className={className}
                role="listitem"
              >
                <strong>{starter.label}</strong>
                <span>{starter.hint}</span>
              </Link>
            );
          }
          return (
            <button
              key={starter.id}
              type="button"
              className={className}
              role="listitem"
              onClick={() => activate(starter)}
            >
              <strong>{starter.label}</strong>
              <span>{starter.hint}</span>
            </button>
          );
        })}
      </div>
      {showDownloads ? <DoDownloadsStrip anchorId="get-do" /> : null}
    </div>
  );
}

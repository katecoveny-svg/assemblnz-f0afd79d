'use client';

import Link from 'next/link';
import styles from './do-portable.module.css';
import { DoDownloadsStrip } from './DoDownloadsStrip';
import { DoLivingBlob } from './DoLivingBlob';
import { PUBLIC_DO_SPECIALISTS } from '@/lib/do/public-do-specialists';
import '@/app/do/do-craft.css';

export type DoPortableStarterId = 'meeting' | 'household' | 'downloads';

export type DoPortableStarter = {
  id: DoPortableStarterId;
  label: string;
  hint: string;
  href?: string;
  primary?: boolean;
};

/** Public portable starters — Meeting + Household only (Kate lock). */
export const DO_PORTABLE_STARTERS: DoPortableStarter[] = PUBLIC_DO_SPECIALISTS.map(
  (item, index) => ({
    id: item.id,
    label: item.name,
    hint: item.description,
    href: item.href,
    primary: index === 0,
  }),
);

type Props = {
  title?: string;
  lede?: string;
  onStarter?: (starter: DoPortableStarter) => void;
  showDownloads?: boolean;
  className?: string;
};

/**
 * Portable empty-state for Glow and public DO surfaces.
 * Only Meeting DO and Household DO — no Writing/Personal/Inbox/Builder promos.
 */
export function DoPortableStarters({
  title = 'What do you want to DO?',
  lede = 'Meeting notes or a generic household chores board. DO never sends, books or pays for you.',
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
      <DoLivingBlob size="sm" className={styles.blob} label="DO" />
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
      <div className={styles.install}>
        <Link href="/do/meetings?phone=1" className={styles.phoneEasy}>
          Phone-easy Meeting →
        </Link>
      </div>
    </div>
  );
}

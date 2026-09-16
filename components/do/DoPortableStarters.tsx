'use client';

import Link from 'next/link';
import styles from './do-portable.module.css';
import { DoDownloadsStrip } from './DoDownloadsStrip';
import { DoLivingBlob } from './DoLivingBlob';
import '@/app/do/do-craft.css';

export type DoPortableStarterId = 'page' | 'reply' | 'meeting' | 'downloads';

export type DoPortableStarter = {
  id: DoPortableStarterId;
  label: string;
  hint: string;
  brief?: string;
  href?: string;
  primary?: boolean;
};

/** Shared starter language across Glow, /do, and companion widget. */
export const DO_PORTABLE_STARTERS: DoPortableStarter[] = [
  {
    id: 'page',
    label: 'Help with this page',
    hint: 'Paste or describe what you need from this page.',
    brief: 'Help me with this page. Ask what I want before preparing a draft.',
  },
  {
    id: 'reply',
    label: 'Draft a reply',
    hint: 'Paste the message you need to answer.',
    brief: 'Draft a clear reply I can edit. Do not send anything.',
  },
  {
    id: 'meeting',
    label: 'Meeting notes',
    hint: 'Record first — then review, download, or transcribe.',
    href: '/do/meetings',
    primary: true,
  },
];

type Props = {
  /** Empty-state headline. Default matches Kate’s voice. */
  title?: string;
  lede?: string;
  onStarter?: (starter: DoPortableStarter) => void;
  /** When true, Meeting opens via onStarter instead of navigating. */
  interceptMeeting?: boolean;
  showDownloads?: boolean;
  className?: string;
};

/**
 * Portable empty-state: same DOs ask, same starters, optional Chrome + Mac downloads.
 * Meeting always points at recording-first `/do/meetings` (transcription gated there).
 */
export function DoPortableStarters({
  title = 'What do you want to DO?',
  lede = 'Prepare drafts where you already are. DO never sends, books or pays for you.',
  onStarter,
  interceptMeeting = false,
  showDownloads = true,
  className,
}: Props) {
  function activate(starter: DoPortableStarter) {
    if (onStarter) {
      if (starter.id === 'meeting' && !interceptMeeting) {
        window.location.assign(starter.href || '/do/meetings');
        return;
      }
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
          if (starter.href && !onStarter && !interceptMeeting) {
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
      {showDownloads ? <DoDownloadsStrip /> : null}
      <div className={styles.install}>
        <Link href="/do/meetings?phone=1" className={styles.phoneEasy}>
          Phone-easy Meeting →
        </Link>
      </div>
    </div>
  );
}

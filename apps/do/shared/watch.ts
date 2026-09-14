/**
 * Watch engine (DEMO) — patterns adapted from changedetection.io (Apache-2.0).
 * See apps/do/NOTICE for attribution. Not a fork; a small hash/diff primitive.
 */

import { createHash } from 'node:crypto';
import { FIXTURES } from './fixtures';

export interface WatchSnapshot {
  key: string;
  contentHash: string;
  excerpt: string;
  capturedAt: string;
  label: string;
  url?: string;
}

export function hashContent(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

export function snapshotFromText(
  key: string,
  text: string,
  meta: { label: string; url?: string },
): WatchSnapshot {
  const normalised = text.replace(/\s+/g, ' ').trim();
  return {
    key,
    contentHash: hashContent(normalised),
    excerpt: normalised.slice(0, 280),
    capturedAt: new Date().toISOString(),
    label: meta.label,
    url: meta.url,
  };
}

export function diffSnapshots(
  previous: WatchSnapshot | undefined,
  next: WatchSnapshot,
): { changed: boolean; note: string } {
  if (!previous) {
    return { changed: false, note: 'Baseline snapshot stored · watching for the next change.' };
  }
  if (previous.contentHash === next.contentHash) {
    return { changed: false, note: 'No material change since last snapshot.' };
  }
  return {
    changed: true,
    note: `Change detected · hash ${previous.contentHash} → ${next.contentHash}.`,
  };
}

/** DEMO power-price fixture pages used by the Watch DEMO. */
export function getWatchFixture(version: 'v1' | 'v2' = 'v1'): {
  key: string;
  label: string;
  url: string;
  body: string;
} {
  const fixture = FIXTURES['power-price-watch'];
  const page = version === 'v2' ? fixture.v2 : fixture.v1;
  return {
    key: 'fixture:power-price-watch',
    label: fixture.title,
    url: page.url,
    body: page.body,
  };
}

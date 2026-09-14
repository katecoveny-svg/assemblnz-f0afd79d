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

type WatchFixturePair = {
  title: string;
  v1: { url: string; body: string };
  v2: { url: string; body: string };
};

const WATCH_FIXTURE_KEYS = [
  'power-price-watch',
  'mitre10-sap-competitor',
  'physio-slots',
  'competitor-page',
  'stock-page',
  'xero-recurring',
] as const;

function asWatchPair(key: (typeof WATCH_FIXTURE_KEYS)[number]): WatchFixturePair {
  return FIXTURES[key] as WatchFixturePair;
}

/** Resolve which DEMO watch fixture an agent is bound to. */
export function resolveWatchFixtureKey(watches: string[]): (typeof WATCH_FIXTURE_KEYS)[number] | null {
  for (const key of WATCH_FIXTURE_KEYS) {
    if (watches.some((w) => w.includes(key))) return key;
  }
  return null;
}

/** DEMO fixture pages used by Watch DEMO (power-price, Mitre competitor, etc.). */
export function getWatchFixture(
  version: 'v1' | 'v2' = 'v1',
  fixtureKey: (typeof WATCH_FIXTURE_KEYS)[number] = 'power-price-watch',
): {
  key: string;
  label: string;
  url: string;
  body: string;
} {
  const fixture = asWatchPair(fixtureKey);
  const page = version === 'v2' ? fixture.v2 : fixture.v1;
  return {
    key: `fixture:${fixtureKey}`,
    label: fixture.title,
    url: page.url,
    body: page.body,
  };
}

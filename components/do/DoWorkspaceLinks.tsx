'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
const subscribe = () => () => {};
const isEmbedded = () => window.self !== window.top;
const links = [
  ['Meeting notes', '/do/meetings'],
  ['TypeSafe + DO', '/do/typesafe'],
  ['Sign in', '/login?redirect=%2Fdo%2Fwidget'],
  ['Connections', '/do/connections'],
  ['Office', '/do/office'],
  ['Sponsored', '/do/sponsored'],
  ['Browser', '/do/browser'],
  ['Builder DO', '/do/builder'],
  ['Tasks', '/do/tasks?board=portable-widget'],
] as const;
/** Keep PWA/native top-level navigation inside the app; embedded captures use a full browser page. */
export function DoWorkspaceLinks() {
  const embedded = useSyncExternalStore(subscribe, isEmbedded, () => true);
  return <>
    <nav aria-label="DO workspace tools">
      {links.map(([label, href]) => <Link key={href} href={href} target={embedded ? '_blank' : undefined} rel={embedded ? 'noopener noreferrer' : undefined}>{label}{embedded ? ' ↗' : ''}</Link>)}
    </nav>
    <p>{embedded ? 'Voice, recording and sign-in work best in a full window. Use Meeting notes or open the full workspace.' : 'Talk, record and prepare in this workspace. Start recording only with permission, then review before sharing.'} Downloads remain on this device; they are not a save to client records.</p>
  </>;
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LindaClient } from './LindaClient';

export const metadata: Metadata = {
  title: { absolute: 'Linda · DO task boards · assembl' },
  description:
    'Linda is Assembl DO’s Linear-style task board — one list per DO workstream, saved on your device or signed-in owner. Not synced to Linear.app.',
  alternates: { canonical: '/do/linda' },
  robots: { index: false, follow: false },
};

export default function LindaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '40svh', display: 'grid', placeItems: 'center', color: '#916a70', fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>Loading Linda…</div>}>
      <LindaClient />
    </Suspense>
  );
}

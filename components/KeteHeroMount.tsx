'use client';

import dynamic from 'next/dynamic';

// Three.js needs window — disable SSR. Wrapped in a client component because
// Next.js 16 doesn't permit ssr:false on dynamic() inside a server component.
const KeteHero = dynamic(() => import('@/components/KeteHero'), { ssr: false });

export function KeteHeroMount() {
  return <KeteHero />;
}

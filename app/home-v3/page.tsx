import type { Metadata } from 'next';
import { HomeV3 } from '@/components/home-v3/HomeV3';

export const metadata: Metadata = {
  title: 'assembl — see what your AI is made of',
  description:
    'assembl runs specialist operational workflows for real NZ businesses. We reduce admin, surface risk earlier, and keep people in control. Every workflow ends in an evidence pack you can file, forward, or footnote.',
  // Preview route for the next homepage. Keep out of the index until this
  // replaces app/page.tsx — then move the component there and drop this route.
  robots: { index: false, follow: false },
};

export default function HomeV3Page() {
  return <HomeV3 />;
}

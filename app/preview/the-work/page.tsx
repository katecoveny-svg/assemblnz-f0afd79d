import type { Metadata } from 'next';
import { TheWorkHome } from '@/components/site/the-work/TheWorkHome';

export const metadata: Metadata = {
  title: { absolute: 'assembl the work · Homepage exploration' },
  description: 'Exploration of the "assembl the work." homepage direction: find it, DO it, show it.',
  robots: { index: false, follow: false },
};

// Non-indexed exploration. The live homepage at / is unchanged.
export default function TheWorkPreviewPage() {
  return <TheWorkHome />;
}

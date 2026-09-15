import type { Metadata } from 'next';
import { AssemblTheWorkHome } from '@/components/site/assembl-the-work/AssemblTheWorkHome';
import { PREVIEW_META } from '@/components/site/assembl-the-work/copy';

export const metadata: Metadata = {
  title: {
    absolute: PREVIEW_META.title,
  },
  description: PREVIEW_META.description,
  robots: { index: false, follow: false },
};

/**
 * PREVIEW route — commercial architecture homepage draft.
 * LIVE `/` is unchanged (CinematicJourneyHome) until Kate merges.
 */
export default function PreviewHomePage() {
  return <AssemblTheWorkHome />;
}

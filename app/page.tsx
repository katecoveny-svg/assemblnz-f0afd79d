import type { Metadata } from 'next';
import { CinematicJourneyHome } from '@/components/site/cinematic-journey/CinematicJourneyHome';
import { HOME_META } from '@/components/site/cinematic-journey/copy';

/**
 * LIVE homepage — cinematic journey baseline.
 *
 * Commercial architecture PREVIEW ("assembl the work") lives at /preview/home
 * and must NOT replace this until Kate approves and merges.
 *
 * To promote after approval, swap the import to:
 *   AssemblTheWorkHome from '@/components/site/assembl-the-work/AssemblTheWorkHome'
 * Keep CinematicJourneyHome in-tree for easy revert.
 */

export const metadata: Metadata = {
  title: HOME_META.title,
  description: HOME_META.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_META.title,
    description: HOME_META.description,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_META.title,
    description: HOME_META.description,
  },
};

export default function HomePage() {
  return <CinematicJourneyHome />;
}

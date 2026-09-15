import type { Metadata } from 'next';
import { AssemblTheWorkHome } from '@/components/site/assembl-the-work/AssemblTheWorkHome';
import { HOME_META } from '@/components/site/assembl-the-work/copy';

// Approved public homepage. CinematicJourneyHome remains in-tree for rollback.

export const metadata: Metadata = {
  title: { absolute: HOME_META.title },
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
  return <AssemblTheWorkHome />;
}

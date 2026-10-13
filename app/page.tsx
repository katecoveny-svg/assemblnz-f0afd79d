import type { Metadata } from 'next';
import { Direction4cHome } from '@/components/site/direction-4c/Direction4cHome';
import { HOME_META } from '@/components/site/assembl-the-work/copy';

// Direction 4c review implementation. AssemblTheWorkHome remains in-tree for rollback.

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
  return <Direction4cHome />;
}

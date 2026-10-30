import type { Metadata } from 'next';
import { HomeScrollStory } from '@/components/site/home-scroll-story/HomeScrollStory';
import { HOME_META } from '@/components/site/assembl-the-work/copy';

// Home scroll story (30 Oct 2026): the lab's worlds assemble as the page scrolls.
// Direction4cHome and AssemblTheWorkHome remain in-tree for rollback.

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
  return <HomeScrollStory />;
}

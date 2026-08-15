import type { Metadata } from 'next';
import { CreativeStudioShell } from '@/components/creative-studio/CreativeStudioShell';

export const metadata: Metadata = {
  title: 'creative studio',
  description: 'Create and export on-brand assembl imagery, motion studies and client demonstrator assets in your browser.',
  alternates: { canonical: '/creative-studio' },
  openGraph: {
    title: 'assembl | creative studio',
    description: 'A browser-based studio for assembl imagery, motion studies and client demonstrator assets.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/creative-studio',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl | creative studio',
    description: 'A browser-based studio for assembl imagery, motion studies and client demonstrator assets.',
  },
};

export default function CreativeStudioPage() {
  return <CreativeStudioShell />;
}

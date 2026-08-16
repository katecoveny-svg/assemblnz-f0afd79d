import type { Metadata } from 'next';
import { CreativeStudioShell } from '@/components/creative-studio/CreativeStudioShell';

export const metadata: Metadata = {
  title: 'make something worth sharing',
  description: 'Create an on-brand image, adapt it for each social format and prepare the caption in the assembl Creative Studio.',
  alternates: { canonical: '/creative-studio' },
  openGraph: {
    title: 'Make something worth sharing | assembl Creative Studio',
    description: 'Create the image, adapt the social format and prepare the caption. Every result stays a draft until you download it.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/creative-studio',
    siteName: 'assembl',
    images: [
      {
        url: '/images/site/assembl-shader-8471.png',
        width: 1200,
        height: 627,
        alt: 'assembl plum material field for the Creative Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Make something worth sharing | assembl Creative Studio',
    description: 'Create the image, adapt the social format and prepare the caption. Every result stays a draft until you download it.',
    images: ['/images/site/assembl-shader-8471.png'],
  },
};

export default function CreativeStudioPage() {
  return <CreativeStudioShell />;
}

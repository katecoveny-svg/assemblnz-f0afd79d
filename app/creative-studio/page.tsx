import type { Metadata } from 'next';
import { CreativeStudioShell } from '@/components/creative-studio/CreativeStudioShell';

export const metadata: Metadata = {
  title: 'make something worth sharing',
  description: 'Add your brand, create a correctly sized social image, explore the full generator library and prepare the caption in the assembl Creative Studio.',
  alternates: { canonical: '/creative-studio' },
  openGraph: {
    title: 'Make something worth sharing | assembl Creative Studio',
    description: 'Add your colours, logo and message. Create a social image at the correct size, then download or share it when you are ready.',
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
    description: 'Add your colours, logo and message. Create a social image at the correct size, then download or share it when you are ready.',
    images: ['/images/site/assembl-shader-8471.png'],
  },
};

export default async function CreativeStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return <CreativeStudioShell initialTool={tool} />;
}

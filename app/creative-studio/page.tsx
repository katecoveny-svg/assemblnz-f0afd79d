import type { Metadata } from 'next';
import { CreativeDirectorPipeline } from '@/components/creative-director/CreativeDirectorPipeline';

export const metadata: Metadata = {
  title: 'assembl studio · creative director (PREVIEW)',
  description:
    'PREVIEW — idea → direction → world → experience. Three art directions before code, then construct and Creative Critic. DEMO fixtures only.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/creative-studio' },
};

/**
 * Creative door elevation — Creative Director v0 PREVIEW.
 * Formerly redirected to /generative-studio; that craft tool remains linked.
 * Does not touch live homepage `/` or One NZ private journeys.
 */
export default function CreativeStudioPage() {
  return <CreativeDirectorPipeline />;
}

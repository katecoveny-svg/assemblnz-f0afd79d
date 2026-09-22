import type { Metadata } from 'next';
import { CreativeStudioShell } from '@/components/creative-studio/CreativeStudioShell';

export const metadata: Metadata = {
  title: 'Make with assembl · Studio',
  description: 'Create Assembl images and social posts using the same visual direction as the homepage. Review and download your work.',
  alternates: { canonical: '/creative-studio/assembl' },
};

export default async function AssemblMakerPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  return <CreativeStudioShell initialTool={tool} />;
}

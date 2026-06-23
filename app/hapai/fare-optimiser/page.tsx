import type { Metadata } from 'next';
import { DashTool } from '@/components/hapai/dash/DashTool';
import { getDashTool } from '@/lib/hapai/dash/tools';

const tool = getDashTool('fare-optimiser')!;

export const metadata: Metadata = {
  title: `${tool.name} — assembl`,
  description: tool.description,
  openGraph: {
    title: `${tool.name} (${tool.teReo}) — assembl`,
    description: tool.description,
    type: 'website',
    url: `https://www.assembl.co.nz/hapai/${tool.slug}`,
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${tool.name} — assembl`,
    description: tool.description,
  },
};

export default function Page() {
  return <DashTool config={tool} />;
}

import type { Metadata } from 'next';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import { BuilderRoot } from './BuilderRoot';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Shared links carry ?c=<config>. When present, point the OG image at the
 * personalised /og card so a pasted link previews the sender's actual agent —
 * that preview IS the viral loop. Without ?c=, the opengraph-image file
 * convention supplies the default card.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const base: Metadata = {
    title: BUILD_AN_AGENT.meta.title,
    description: BUILD_AN_AGENT.meta.description,
    alternates: { canonical: '/build-an-agent' },
  };
  const { c } = await searchParams;
  const encoded = Array.isArray(c) ? c[0] : c;
  if (!encoded) return base;
  return {
    ...base,
    openGraph: {
      title: BUILD_AN_AGENT.meta.title,
      description: BUILD_AN_AGENT.meta.description,
      images: [{ url: `/build-an-agent/og?c=${encodeURIComponent(encoded)}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/build-an-agent/og?c=${encodeURIComponent(encoded)}`],
    },
  };
}

export default function BuildAnAgentPage() {
  return <BuilderRoot />;
}

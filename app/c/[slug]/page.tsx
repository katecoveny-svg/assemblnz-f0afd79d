import type { Metadata } from 'next';
import { getPublicChatTenant } from '@/lib/public-chat/tenant';
import { keteHeadline } from '@/lib/public-chat/headlines';
import { PublicChatClient } from './PublicChatClient';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getPublicChatTenant(slug);
  const headline = keteHeadline(tenant.kete);

  return {
    title: `${tenant.name} chat`,
    description: headline || `Chat with ${tenant.name}'s ${tenant.keteName} pack.`,
    manifest: `/c/${tenant.slug}/manifest.json`,
    themeColor: tenant.brandColor,
    robots: { index: false, follow: false },
    openGraph: {
      images: [
        {
          url: `/og/og-${tenant.kete}.png`,
          width: 1200,
          height: 630,
          alt: `assembl — Mahi that earns its proof, for ${tenant.keteName}.`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og/og-${tenant.kete}.png`],
    },
  };
}

export default async function PublicChatPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const tenant = await getPublicChatTenant(slug);

  return <PublicChatClient tenant={tenant} embed={embed === '1'} />;
}

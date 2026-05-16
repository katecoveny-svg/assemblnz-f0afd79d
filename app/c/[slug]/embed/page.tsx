import type { Metadata } from 'next';
import { getPublicChatTenant } from '@/lib/public-chat/tenant';
import { PublicChatClient } from '../PublicChatClient';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getPublicChatTenant(slug);

  return {
    title: `${tenant.name} embedded chat`,
    manifest: `/c/${tenant.slug}/manifest.json`,
    themeColor: tenant.brandColor,
    robots: { index: false, follow: false },
  };
}

export default async function PublicChatEmbedPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tenant = await getPublicChatTenant(slug);

  return <PublicChatClient tenant={tenant} embed />;
}

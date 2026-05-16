import { getPublicChatTenant } from '@/lib/public-chat/tenant';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const tenant = await getPublicChatTenant(slug);
  const icon = tenant.logoUrl || '/icon.png';

  return Response.json(
    {
      name: `${tenant.name} · assembl`,
      short_name: tenant.name.slice(0, 24),
      description: `Public chat for ${tenant.name}`,
      start_url: `/c/${tenant.slug}`,
      scope: `/c/${tenant.slug}`,
      display: 'standalone',
      background_color: '#FAF7F2',
      theme_color: tenant.brandColor,
      icons: [
        { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    },
  );
}

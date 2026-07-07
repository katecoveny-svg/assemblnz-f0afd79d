import { marketplaceAgentBySlug, TILE_BG } from '@/lib/marketplace/agents';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

/**
 * Per-agent web app manifest. Lets every marketplace agent install to a phone
 * home screen as its own app, opening straight into its chat. Mirrors the
 * SPARK tool manifest pattern (app/hapai/[slug]/manifest.json), themed per
 * agent via its canon tile colour. The matching `<link rel="manifest">` is set
 * by components/site/PwaRegister for the /agents/[slug]/chat path.
 */
export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) {
    return Response.json({ error: 'Unknown agent' }, { status: 404 });
  }

  const start = `/agents/${slug}/chat`;

  return Response.json(
    {
      name: `${agent.name} · assembl`,
      short_name: agent.name.slice(0, 28).trim(),
      description: agent.description,
      id: start,
      start_url: start,
      scope: start,
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      background_color: '#FFF7EC',
      theme_color: TILE_BG[agent.tile],
      categories: ['productivity', 'business'],
      icons: [
        { src: `/agents/${slug}/icon?size=192`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: `/agents/${slug}/icon?size=512`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}

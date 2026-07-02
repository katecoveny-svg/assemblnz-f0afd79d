import { ImageResponse } from 'next/og';
import { marketplaceAgentBySlug, TILE_BG } from '@/lib/marketplace/agents';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

/**
 * Per-agent home-screen icon, generated on the fly so each installed agent app
 * looks like its own app: the agent's initial on its canon tile colour.
 * `?size=` controls the square dimension (192 / 512 for the manifest, 180 for
 * the iOS apple-touch-icon).
 */
export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  const url = new URL(request.url);
  const size = Math.min(512, Math.max(48, Number(url.searchParams.get('size')) || 512));

  const tile = agent?.tile ?? 'ink';
  const bg = TILE_BG[tile];
  const fg = tile === 'ink' ? '#BFA37A' : '#3A3832';
  const letter = (agent?.name ?? 'A').trim().charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          color: fg,
          fontSize: Math.round(size * 0.5),
          fontWeight: 900,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.04em',
        }}
      >
        {letter}
      </div>
    ),
    { width: size, height: size },
  );
}

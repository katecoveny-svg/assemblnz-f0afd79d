import { NextRequest } from 'next/server';

import { decodeConfig } from '@/lib/build-an-agent/share';
import { renderAgentCard } from '@/lib/build-an-agent/og-card';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /build-an-agent/og?c=<base64url> — the personalised share card.
 *
 * This exists as a route handler because Next's `opengraph-image` file
 * convention never receives query params — personalised cards silently
 * rendered the default through that path. Route handlers get the full URL.
 */
export async function GET(req: NextRequest) {
  const config = decodeConfig(req.nextUrl.searchParams.get('c'));
  return renderAgentCard(config);
}

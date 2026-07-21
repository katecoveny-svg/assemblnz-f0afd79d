import { OG_SIZE, renderAgentCard } from '@/lib/build-an-agent/og-card';

export const runtime = 'nodejs';
export const alt = 'see what your AI is made of · assembl';
export const size = OG_SIZE;
export const contentType = 'image/png';

/**
 * Default card for /build-an-agent itself. Personalised share cards come from
 * /build-an-agent/og?c=… (a route handler — this file convention never sees
 * query params, so it can only render the default).
 */
export default async function OG() {
  return renderAgentCard(null);
}

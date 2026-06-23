/**
 * GET /api/agents/[slug]/entitlement
 *
 * Returns the caller's entitlement + free-tier usage for an agent so the chat UI
 * can show "N free messages left" and render the paywall when they run out. This
 * also mints + sets the anonymous device cookie (when needed) so the subsequent
 * streamed chat POST can read it. The chat POST re-checks server-side — this is
 * a UX hint, not the enforcement point.
 */
import { NextResponse } from 'next/server';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { getEntitlementStatus } from '@/lib/billing/agent-entitlement';
import { resolveChatIdentity, ANON_COOKIE, anonCookieOptions } from '@/lib/billing/chat-identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!marketplaceAgentBySlug(slug)) {
    return NextResponse.json({ error: 'Unknown agent.' }, { status: 404 });
  }

  const { identity, setAnonId } = await resolveChatIdentity();
  const status = await getEntitlementStatus(identity, slug);

  const res = NextResponse.json(status);
  if (setAnonId) res.cookies.set(ANON_COOKIE, setAnonId, anonCookieOptions());
  return res;
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ECHO_PUBLIC } from '@/lib/echo/persona';
import { canAccessHiddenAgent } from '@/lib/marketplace/private-access';
import { AgentChat } from '@/app/agents/[slug]/chat/AgentChat';

export const dynamic = 'force-dynamic';

// Private founder tool — keep it off search engines, and make it installable
// to the home screen (PWA) for the owner.
export const metadata: Metadata = {
  title: 'Echo — founder co-pilot · assembl',
  description: ECHO_PUBLIC.description,
  robots: { index: false, follow: false },
  manifest: '/echo-manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Echo', statusBarStyle: 'default' },
  icons: { apple: '/echo-icon-180.png' },
};

/**
 * Echo — Kate's private founder co-pilot chat. Reuses the marketplace AgentChat
 * UI unchanged, pointed at the dedicated /api/echo/chat endpoint (no paywall).
 * Owner-only: anyone who is not the signed-in owner is sent to sign in. The
 * back link returns to the rebranded launcher (public/echo.html).
 */
export default async function EchoPage() {
  if (!(await canAccessHiddenAgent())) redirect('/login?next=/echo');
  return <AgentChat agent={ECHO_PUBLIC} apiPath="/api/echo/chat" backHref="/echo.html" />;
}

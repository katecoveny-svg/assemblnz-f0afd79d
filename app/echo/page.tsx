import type { Metadata } from 'next';
import { ECHO_PUBLIC } from '@/lib/echo/persona';
import { AgentChat } from '@/app/agents/[slug]/chat/AgentChat';

export const dynamic = 'force-dynamic';

// Private founder tool — keep it off search engines.
export const metadata: Metadata = {
  title: 'Echo — founder co-pilot · assembl',
  description: ECHO_PUBLIC.description,
  robots: { index: false, follow: false },
};

/**
 * Echo — Kate's private founder co-pilot chat. Reuses the marketplace AgentChat
 * UI unchanged, pointed at the dedicated /api/echo/chat endpoint (no paywall).
 * The back link returns to the rebranded launcher (public/echo.html).
 */
export default function EchoPage() {
  return <AgentChat agent={ECHO_PUBLIC} apiPath="/api/echo/chat" backHref="/echo.html" />;
}

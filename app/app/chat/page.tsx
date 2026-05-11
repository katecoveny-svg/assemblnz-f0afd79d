import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CHAT_KETES, findAgent, DEFAULT_AGENT_REF } from '@/lib/chat/registry';
import { ChatClient } from './ChatClient';

export const metadata: Metadata = {
  title: 'Talk to an agent · assembl',
  description:
    'Pick a kete, pick a specialist, ask a question. Every reply is a draft — you approve before anything leaves the room.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
export const dynamic = 'force-dynamic';

type SearchParams = { kete?: string; agent?: string };

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/chat');
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect('/login?redirect=/app/chat');
  }

  const sp = await searchParams;
  const initial =
    (sp.kete && sp.agent && findAgent(sp.kete, sp.agent)) || DEFAULT_AGENT_REF;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Ata mārie';
    if (hour < 18) return 'Kia ora';
    return 'Pō mārie';
  })();

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)]">
      <ChatClient
        ketes={CHAT_KETES}
        initialKete={initial.kete.slug}
        initialAgentId={initial.agent.agentId}
        userEmail={data.user.email ?? 'kaitiaki'}
        greeting={greeting}
      />
    </main>
  );
}

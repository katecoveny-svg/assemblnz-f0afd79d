import { redirect } from 'next/navigation';
import { findAgentBySlug } from '@/lib/chat/registry';

type Params = { agent: string };
type SearchParams = { kete?: string };

export const dynamic = 'force-dynamic';

export default async function AgentChatRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ agent }, sp] = await Promise.all([params, searchParams]);
  const found = findAgentBySlug(agent, sp.kete);

  if (!found) {
    redirect('/app/chat');
  }

  redirect(
    `/app/chat?kete=${encodeURIComponent(found.kete.slug)}&agent=${encodeURIComponent(
      found.agent.agentId,
    )}`,
  );
}

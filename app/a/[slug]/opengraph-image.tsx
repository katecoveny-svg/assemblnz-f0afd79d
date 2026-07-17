import { getSharedAgent } from '@/lib/agents/community';
import {
  ogAlt,
  ogContentType,
  ogSize,
  renderAgentOgImage,
} from '@/lib/agents/og-agent';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default async function SharedAgentOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Shared rows only; unknown slugs get the generic card rather than a 500.
  const agent = await getSharedAgent(slug);
  return renderAgentOgImage(
    agent
      ? {
          name: agent.name,
          description: agent.description,
          shareSlug: agent.shareSlug,
          accent: agent.accent,
        }
      : {
          name: 'Community agent',
          description: 'Built by a visitor. Everything it writes is a draft.',
          shareSlug: slug,
          accent: '#3f7373',
        },
  );
}

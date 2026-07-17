import { resolveCommunityAgent } from '@/lib/agents/community';
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
  // DB rows (shared only) and stateless `l~…` links both render; unknown
  // slugs get the generic card rather than a 500. Stateless slugs are long
  // opaque payloads, so the card shows the builder route instead.
  const agent = await resolveCommunityAgent(slug);
  const isStateless = agent?.stateless ?? false;
  return renderAgentOgImage(
    agent
      ? {
          name: agent.name,
          description: agent.description,
          shareSlug: isStateless ? '' : agent.shareSlug,
          accent: agent.accent,
        }
      : {
          name: 'Community agent',
          description: 'Built by a visitor. Everything it writes is a draft.',
          shareSlug: '',
          accent: '#3f7373',
        },
  );
}

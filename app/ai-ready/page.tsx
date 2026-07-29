import type { Metadata } from 'next';
import { AiReadyClient } from './AiReadyClient';

export const metadata: Metadata = {
  title: 'Free context brief for your AI + your agentic customer journey — assembl',
  description:
    'Free: an agent reads your site and writes your context brief for ChatGPT, Claude or Copilot — plus your agentic customer journey and eight AI-search readiness checks. By assembl.',
  keywords: [
    'AI search readiness', 'AI SEO check', 'llms.txt', 'agentic customer journeys',
    'agentic CX', 'AI optimised website', 'New Zealand',
  ],
  alternates: { canonical: '/ai-ready' },
  openGraph: {
    title: 'Assemble your agentic customer journey — and check you are AI-ready',
    description: 'A personalised journey drafted from your own website by a live agent, plus a free AI-search readiness score — by assembl.',
  },
};

export default function AiReadyPage() {
  return <AiReadyClient />;
}

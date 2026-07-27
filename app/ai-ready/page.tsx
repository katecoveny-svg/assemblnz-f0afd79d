import type { Metadata } from 'next';
import { AiReadyClient } from './AiReadyClient';

export const metadata: Metadata = {
  title: 'Assemble your agentic customer journey + check your AI-search readiness — free, by assembl',
  description:
    'Two tools in one address: a live agent drafts a personalised agentic customer journey from your own website, and eight honest checks score whether assistants like ChatGPT, Claude and Perplexity can find, read and cite you. Free, by assembl — intuitive agentic customer journeys, Aotearoa New Zealand.',
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

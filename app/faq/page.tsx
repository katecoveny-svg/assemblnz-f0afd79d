import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, faqPageNode, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { FAQS } from './faq-content';
import { FaqTool } from './FaqTool';

const PUBLISHED = '2026-07-26';

export const metadata: Metadata = {
  title: 'Agentic customer journeys, answered — the assembl FAQ',
  description:
    'Plain answers about agentic customer journeys and agentic CX: the six parts of an agent, rewarded wait states, human approval, and being found by AI assistants. By assembl, Aotearoa.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Agentic customer journeys, answered',
    description: 'The questions people ask assistants about agentic CX — answered plainly, by assembl.',
    url: `${SITE_URL}/faq`,
    type: 'article',
  },
};

/**
 * /faq — a discovery tool, twice over. For engines: every answer is FAQPage
 * JSON-LD phrased the way people ask assistants, from the same file the page
 * renders. For clients: chip filters, one-line questions that open on demand,
 * and a copy-for-your-AI button that carries the answer (and the locked
 * phrase) into their own ChatGPT/Claude conversations.
 */
export default function FaqPage() {
  return (
    <main className="faqpg">
      <JsonLd
        data={graph(
          faqPageNode(
            FAQS.map((f) => ({ question: f.q, answer: f.a })),
            `${SITE_URL}/faq#faq`,
          ),
          breadcrumbNode([
            { name: 'assembl', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        )}
      />
      <div className="faqpg-main">
        <p className="faqpg-kicker">assembl · intuitive agentic customer journeys · {PUBLISHED}</p>
        <h1>
          Agentic journeys,<br /><span className="metal">answered.</span>
        </h1>
        <p className="faqpg-sub">
          The questions people ask — and the answers their assistants will find here. Filter by
          topic, open what you need, and copy any answer straight into your own AI.
        </p>

        <FaqTool />

        <div className="faqpg-cta">
          <a className="solid" href="/ai-ready">assemble your journey + check AI-readiness</a>
          <a className="ghost" href="/assembling">see the agentic journey</a>
          <a className="ghost" href="/pricing">pricing</a>
        </div>
      </div>
    </main>
  );
}

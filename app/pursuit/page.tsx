import type { Metadata } from 'next';
import { PursuitLanding } from '@/components/site/pursuit/PursuitLanding';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PURSUIT_AGENT_BRIEF } from '@/lib/pursuit/agent-brief';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit · find it. · assembl' },
  description:
    'Find businesses that could use what you do. Pursuit researches the public evidence and drafts an introduction for you to review.',
  alternates: { canonical: '/pursuit' },
  openGraph: {
    title: 'Pursuit · find it. · assembl',
    description:
      'Add your website, review relevant businesses and edit a first message with its sources.',
    url: `${SITE_URL}/pursuit`,
  },
};

const pursuitNode = {
  '@type': 'WebPage',
  '@id': `${SITE_URL}/pursuit#page`,
  url: `${SITE_URL}/pursuit`,
  name: 'Pursuit — assembl',
  description: PURSUIT_AGENT_BRIEF.summary,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'SoftwareApplication',
    name: 'assembl Pursuit',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: PRODUCT_DESTINATIONS.pursuit.workspace,
    description: PURSUIT_AGENT_BRIEF.summary,
    featureList: [...PURSUIT_AGENT_BRIEF.publicSees],
  },
  significantLink: PRODUCT_DESTINATIONS.pursuit.workspace,
};

export default function PursuitPage() {
  return (
    <>
      <JsonLd
        data={graph(
          pursuitNode,
          breadcrumbNode([
            { name: 'assembl', path: '/' },
            { name: 'Pursuit', path: '/pursuit' },
          ]),
        )}
      />
      <script
        type="application/json"
        id="pursuit-agent-brief"
        // Static brief only — no secrets.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PURSUIT_AGENT_BRIEF) }}
      />
      <PursuitLanding />
    </>
  );
}

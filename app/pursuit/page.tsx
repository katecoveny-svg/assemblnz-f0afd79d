import type { Metadata } from 'next';
import { PursuitLanding } from '@/components/site/pursuit/PursuitLanding';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';
import { PURSUIT_AGENT_BRIEF } from '@/lib/pursuit/agent-brief';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit · find it. · assembl' },
  description:
    'Assembl brings New Zealand live intelligence and signals into a demonstrator / client Pursuit. Radar stays behind the scenes. The canvas shows rearrange → brand.',
  alternates: { canonical: '/pursuit' },
  openGraph: {
    title: 'Pursuit · find it. · assembl',
    description:
      'NZ signals become a client Pursuit demonstrator. Open the working hub when you are ready.',
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
    url: PURSUIT_SITE_ORIGIN,
    description: PURSUIT_AGENT_BRIEF.summary,
    featureList: [...PURSUIT_AGENT_BRIEF.publicSees],
  },
  significantLink: PURSUIT_SITE_ORIGIN,
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

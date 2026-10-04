import type { Metadata } from 'next';
import { PursuitLanding } from '@/components/site/pursuit/PursuitLanding';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PURSUIT_AGENT_BRIEF } from '@/lib/pursuit/agent-brief';

export const metadata: Metadata = {
  title: { absolute: "Pursuit by assembl | Research the opportunity" },
  description: "Research companies, business signals and opportunities with Pursuit. Review the sources and prepare a brief or proposal for your next move.",
  alternates: { canonical: "/pursuit" },
  openGraph: { title: "Pursuit by assembl | Research the opportunity", description: "Research companies, business signals and opportunities with Pursuit. Review the sources and prepare a brief or proposal for your next move.", url: "https://www.assembl.co.nz/pursuit", type: 'website', locale: 'en_NZ', siteName: 'assembl' },
  twitter: { card: 'summary_large_image', title: "Pursuit by assembl | Research the opportunity", description: "Research companies, business signals and opportunities with Pursuit. Review the sources and prepare a brief or proposal for your next move." },
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

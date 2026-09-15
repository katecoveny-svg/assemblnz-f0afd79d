/** Canonical schema.org / JSON-LD for the current assembl product system. */

export const SITE_URL = 'https://www.assembl.co.nz';
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#kate-hudson`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#do`;

const LOGO = `${SITE_URL}/icons/assembl-icon-512x512.png`;
const OG_IMAGE = `${SITE_URL}/og/og-assembl.png`;
const KATE_SAME_AS: string[] = [];

type Json = Record<string, unknown>;

export function organizationNode(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'assembl',
    legalName: 'assembl',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
    image: OG_IMAGE,
    description:
      'assembl is a New Zealand software company building one connected system for finding, doing and showing valuable work. Pursuit turns signals into evidence-backed opportunities, DO is the portable multi-model agent execution layer, and Studio turns work into demonstrations, creative and commercial proof. The shared Factory carries context, connectors, permissions, evidence and learning across the system.',
    slogan: 'Find it. DO it. Show it.',
    knowsAbout: [
      'AI agents for work',
      'agentic workflows',
      'multi-model agent orchestration',
      'AI developer tools',
      'agent connectors and permissions',
      'human-approved AI workflows',
      'agent evaluations and evidence',
      'agentic customer journeys',
      'AI adoption for New Zealand businesses',
    ],
    foundingLocation: { '@type': 'Place', name: 'New Zealand' },
    areaServed: [
      { '@type': 'Country', name: 'New Zealand' },
      { '@type': 'City', name: 'Auckland' },
    ],
    knowsLanguage: ['en-NZ'],
    founder: { '@id': PERSON_ID },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/contact`,
      areaServed: 'NZ',
      availableLanguage: ['English'],
    },
  };
}

export function personNode(): Json {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Kate Hudson',
    jobTitle: 'Founder',
    url: `${SITE_URL}/about`,
    worksFor: { '@id': ORG_ID },
    nationality: { '@type': 'Country', name: 'New Zealand' },
    ...(KATE_SAME_AS.length ? { sameAs: KATE_SAME_AS } : {}),
  };
}

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'assembl',
    inLanguage: 'en-NZ',
    publisher: { '@id': ORG_ID },
  };
}

export function softwareApplicationNode(): Json {
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: 'DO by assembl',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, macOS, browser',
    url: `${SITE_URL}/do`,
    description:
      'DO is assembl’s portable agent execution layer. It keeps agent identity, context, tools, permissions and evidence stable while the underlying model can change for coding, research, voice, vision or creative work.',
    publisher: { '@id': ORG_ID },
    featureList: [
      'portable specialist agents',
      'multi-model routing',
      'capability-based connectors',
      'human approval boundaries',
      'evidence and receipts',
      'Builderdoo software-building agent',
      'DO Office coordination surface',
    ],
  };
}

export function agentProductNode(agent: {
  slug: string;
  name: string;
  description: string;
  priceNzd: number;
  category: string;
}): Json {
  const url = `${SITE_URL}/agents/${agent.slug}`;
  const offer = agent.priceNzd > 0
    ? {
        '@type': 'Offer',
        price: String(agent.priceNzd),
        priceCurrency: 'NZD',
        url,
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(agent.priceNzd),
          priceCurrency: 'NZD',
          unitText: 'MONTH',
          billingIncrement: 1,
        },
      }
    : {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NZD',
        url,
        availability: 'https://schema.org/InStock',
      };
  return {
    '@type': ['Product', 'SoftwareApplication'],
    '@id': `${url}#product`,
    name: `${agent.name} — assembl agent`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: agent.description,
    category: agent.category,
    url,
    brand: { '@id': ORG_ID },
    isPartOf: { '@id': SOFTWARE_ID },
    offers: offer,
  };
}

export type FaqItem = { question: string; answer: string };

export function faqPageNode(items: FaqItem[], id?: string): Json {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

export function breadcrumbNode(crumbs: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function articleNode(a: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}): Json {
  return {
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url: `${SITE_URL}${a.path}`,
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    inLanguage: 'en-NZ',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: OG_IMAGE,
  };
}

export function graph(...nodes: Json[]): Json {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

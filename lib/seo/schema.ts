/**
 * lib/seo/schema.ts — schema.org / JSON-LD builders for AI-search discovery.
 *
 * This module is a machine-readable product surface. Keep it aligned with the
 * current repository canon rather than historical homepage eras.
 *
 * RULE: everything here must reflect real, verifiable facts. No invented
 * customers, addresses, profiles, prices or capabilities.
 */

export const SITE_URL = 'https://www.assembl.co.nz';

export const ORG_ID = `${SITE_URL}/#organization`;
/** Kept as a compatibility export for older imports. The node now describes DO, not the retired Dash brand. */
export const DASH_ORG_ID = `${SITE_URL}/#do`;
export const PERSON_ID = `${SITE_URL}/#kate-hudson`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#do`;

const LOGO = `${SITE_URL}/icons/assembl-icon-512x512.png`;
const OG_IMAGE = `${SITE_URL}/og/og-assembl.png`;
const KATE_SAME_AS: string[] = [];

/** Historical public pilot prices retained for route compatibility. Do not use these as the company-level offer. */
export const PRICE_TIERS = [
  { name: 'Living Site demos', price: 0, note: 'Fictional sample businesses, no card required' },
  { name: 'Founding Pilot Sprint', price: 1500, note: 'One agreed workflow over ten working days, plus GST' },
] as const;

type Json = Record<string, unknown>;

export function organizationNode(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'assembl',
    legalName: 'assembl',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO,
      width: 512,
      height: 512,
    },
    image: OG_IMAGE,
    description:
      'assembl is a New Zealand software and agent platform for finding, doing and showing valuable work. Pursuit turns live signals into evidence-backed opportunities. DO is a portable, model-agnostic agent workforce that can research, prepare, build and coordinate with explicit permissions and evidence. Studio turns the result into demonstrations, creative and commercial proof. A shared software Factory carries context, connectors, model routing, approvals, evaluations and learning underneath the system.',
    slogan: 'Find it. DO it. Show it.',
    knowsAbout: [
      'AI agents for business',
      'portable AI agents',
      'model-agnostic AI agents',
      'agent tool connections',
      'human-approved AI workflows',
      'AI software development agents',
      'business opportunity intelligence',
      'interactive product demonstrations',
      'agentic customer journeys',
      'AI adoption for New Zealand businesses',
    ],
    foundingLocation: {
      '@type': 'Place',
      name: 'New Zealand',
    },
    areaServed: [
      { '@type': 'Country', name: 'New Zealand' },
      { '@type': 'City', name: 'Auckland' },
      { '@type': 'City', name: 'Wellington' },
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

/**
 * Compatibility function retained for old imports. The retired Dash sibling
 * brand is no longer emitted into the global entity graph; this node now
 * represents DO, the current portable execution product.
 */
export function dashOrganizationNode(): Json {
  return {
    '@type': 'SoftwareApplication',
    '@id': DASH_ORG_ID,
    name: 'DO by assembl',
    url: `${SITE_URL}/do`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, macOS, browser',
    description:
      'DO is assembl’s portable agent workforce. A DO keeps its role, context, permissions and evidence while the underlying model or execution harness can change.',
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
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
    name: 'DO by assembl — portable agent workforce',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, macOS, browser',
    url: `${SITE_URL}/do`,
    description:
      'A portable, model-agnostic agent workforce for research, preparation, building and coordinated work. Users connect the tools they choose; consequential actions remain permissioned and completed work can carry evidence and receipts.',
    publisher: { '@id': ORG_ID },
  };
}

/** A single agent as a Product with a real Offer. */
export function agentProductNode(agent: {
  slug: string;
  name: string;
  description: string;
  priceNzd: number;
  category: string;
}): Json {
  const url = `${SITE_URL}/agents/${agent.slug}`;
  const offer =
    agent.priceNzd > 0
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
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
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
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

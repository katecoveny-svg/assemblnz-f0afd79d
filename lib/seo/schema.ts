/** Canonical schema.org / JSON-LD for the current assembl product system. */
import { POSITIONING } from '@/components/site/assembl-the-work/copy';

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
    description: POSITIONING.company,
    knowsAbout: [
      'business intelligence and strategy',
      'service design and customer experiences',
      'customer journey mapping',
      'CX, UX and UI design',
      'process and workflow improvement',
      'software development and integrations',
      'agents and human-reviewed AI workflows',
      'interactive demonstrations and creative work',
      'proposals, pitches and campaigns',
    ],
    foundingLocation: { '@type': 'Place', name: 'New Zealand' },
    areaServed: [
      { '@type': 'Country', name: 'New Zealand' },
      { '@type': 'City', name: 'Auckland' },
    ],
    knowsLanguage: ['en-NZ'],
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
      'DO is a portable personal agent that helps assemble useful work. Ask questions, prepare replies, organise tasks and review drafts. Use DO on its own or as part of assembl. Available context and actions depend on the surface and connections you choose.',
    publisher: { '@id': ORG_ID },
    featureList: [
      'questions and draft replies',
      'plans and task lists',
      'reviewed source context',
      'explicit provider consent',
      'review before consequential action',
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

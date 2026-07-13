/**
 * lib/seo/schema.ts — schema.org / JSON-LD builders for AI-search discovery.
 *
 * Answer engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews)
 * lean on structured data to identify entities, prices and relationships. This
 * module is the single source of truth for that markup so every surface emits
 * the SAME organisation, person and pricing facts — consistent entity signals
 * let a crawler disambiguate "assembl" (lowercase, the NZ Living Site product)
 * from the English word.
 *
 * RULE: everything here must reflect REAL, verifiable facts — real prices, real
 * agents, real people. No invented street addresses, no fabricated social
 * profiles. Where a fact is not yet public (e.g. Kate Hudson's LinkedIn URL for
 * `sameAs`), the field is omitted rather than guessed. Add it via SAME_AS below
 * once the canonical URL is confirmed.
 *
 * Builders are pure — they take plain params (or nothing) and return plain
 * objects, so this file pulls in no server-only agent prompts and is safe to
 * import from any server component.
 */

export const SITE_URL = 'https://www.assembl.co.nz';

// Stable @id anchors so the emitted nodes form one connected graph across
// pages (crawlers merge nodes that share an @id).
export const ORG_ID = `${SITE_URL}/#organization`;
export const DASH_ORG_ID = `${SITE_URL}/#dash`;
export const PERSON_ID = `${SITE_URL}/#kate-hudson`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#living-site`;

const LOGO = `${SITE_URL}/icons/assembl-icon-512x512.png`;
const OG_IMAGE = `${SITE_URL}/og/og-assembl.png`;

/**
 * Verified external profiles for the founder. LEFT EMPTY on purpose — do not
 * add a URL here unless it is the real, confirmed profile. Fabricated `sameAs`
 * links poison the entity graph they are meant to strengthen.
 */
const KATE_SAME_AS: string[] = [];

/** Canonical public Living Site offers (NZD). */
export const PRICE_TIERS = [
  { name: 'Living Site demos', price: 0, note: 'Fictional sample businesses, no card required' },
  { name: 'Founding Pilot Sprint', price: 1500, note: 'One agreed workflow over ten working days, plus GST' },
] as const;

type Json = Record<string, unknown>;

/** assembl — the Living Site company. */
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
      'assembl builds Living Sites for New Zealand businesses: one connected website, customer desk, Business Genome and set of approval-led workflows. Drafts remain reviewable and people retain control of bookings, sends, publishing and commercial commitments.',
    slogan: 'Mahi that earns its proof.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Aotearoa New Zealand',
    },
    areaServed: [
      { '@type': 'Country', name: 'New Zealand' },
      { '@type': 'City', name: 'Auckland' },
      { '@type': 'City', name: 'Wellington' },
    ],
    knowsLanguage: ['en-NZ', 'mi'],
    founder: { '@id': PERSON_ID },
    ...(KATE_SAME_AS.length ? {} : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/contact`,
      areaServed: 'NZ',
      availableLanguage: ['English', 'te reo Māori'],
    },
  };
}

/** dash — the sibling reward-layer / ad-network brand ("Get paid for the wait"). */
export function dashOrganizationNode(): Json {
  return {
    '@type': 'Organization',
    '@id': DASH_ORG_ID,
    name: 'dash',
    url: `${SITE_URL}/dash`,
    slogan: 'Get paid for the wait.',
    description:
      'dash is the sibling brand to assembl — a rewards and attention layer that pays people for the time they spend waiting, and funds charity through ethical, NZ-first ad fill.',
    parentOrganization: { '@id': ORG_ID },
  };
}

/** Kate Hudson — founder. `sameAs` intentionally omitted until URLs are verified. */
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

/**
 * The Living Site product, with only the public offers assembl currently makes.
 */
export function softwareApplicationNode(): Json {
  const paid = PRICE_TIERS.filter((t) => t.price > 0).map((t) => t.price);
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: 'assembl Living Site',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/living-site`,
    description: 'A connected business workspace that brings a public website, booking requests, customer records, Business Genome, voice and chat desk, proposals, invoices and draft marketing tools into one approval-led system.',
    publisher: { '@id': ORG_ID },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'NZD',
      lowPrice: '0',
      highPrice: String(Math.max(...paid)),
      offerCount: String(PRICE_TIERS.length),
    },
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

export function breadcrumbNode(
  crumbs: { name: string; path: string }[],
): Json {
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

/** Wrap any set of nodes in a single @graph document. */
export function graph(...nodes: Json[]): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

import type { KeteSlug } from '@/lib/kete';

export type HapaiToolVisual =
  | 'vessel'
  | 'caption'
  | 'brief'
  | 'morning-brief'
  | 'electrify'
  | 'og-card'
  | 'tagline'
  | 'project-picker'
  | 'meeting'
  | 'voyage'
  | 'study'
  | 'privacy'
  | 'fridge'
  | 'food-temp'
  | 'customs'
  | 'admin-tax'
  | 'wishlist';

export type HapaiTool = {
  slug: string;
  name: string;
  status: 'live' | 'pilot' | 'soon';
  description: string;
  href: string;
  visual: HapaiToolVisual;
  shareable: boolean;
  category: 'adoption' | 'operations' | 'marketing' | 'record' | 'lifestyle' | 'education';
  posture: string;
  /** The kete this tool belongs to, when it maps to one. Drives the "open the
   *  matching kete chat" link and library grouping. */
  kete?: KeteSlug;
};

export const HAPAI_TOOLS: readonly HapaiTool[] = [
  {
    slug: 'wishlist',
    name: 'The wishlist',
    status: 'live',
    description:
      'Name one job you wish you could hand off. We draft the spec for the specialist assembl would build you — tailored to your business and built on the right NZ law.',
    href: '/hapai/wishlist',
    visual: 'wishlist',
    shareable: true,
    category: 'adoption',
    posture: 'Draft only. A named person reviews the spec; nothing auto-lodges. Not legal, financial, or medical advice.',
  },
  {
    slug: 'customs-entry',
    name: 'Customs entry drafter',
    status: 'live',
    description:
      'Paste a commercial invoice and walk away with a broker-ready customs entry draft — structured, evidence-listed, and never lodged.',
    href: '/hapai/customs-entry',
    visual: 'customs',
    shareable: true,
    category: 'operations',
    kete: 'pikau',
    posture:
      'Draft only. It structures your invoice into entry fields, never invents an HS code, and never lodges to TSW. Your broker confirms classification and files.',
  },
  {
    slug: 'admin-tax',
    name: 'Admin tax calculator',
    status: 'live',
    description:
      'Add up the unbilled admin hours your team loses each week and see the annual cost — then where a kete pack would claw it back.',
    href: '/hapai/admin-tax',
    visual: 'admin-tax',
    shareable: true,
    category: 'operations',
    posture: 'Indicative calculator only. Confirm your own rates and hours before acting on the numbers.',
  },
  {
    slug: 'vessel-studio',
    name: 'Vessel studio',
    status: 'live',
    description: 'Hero imagery generator',
    href: '/hapai/vessel-studio',
    visual: 'vessel',
    shareable: true,
    category: 'marketing',
    posture: 'Draft imagery only. A named person picks and publishes the final asset.',
  },
  {
    slug: 'caption-composer',
    name: 'Caption composer',
    status: 'live',
    description: 'LinkedIn / IG / X / FB captions',
    href: '/hapai/caption-composer',
    visual: 'caption',
    shareable: true,
    category: 'marketing',
    posture: 'Draft captions only. Check claims, permissions, and platform fit before posting.',
  },
  {
    slug: 'brief-generator',
    name: 'Brief generator',
    status: 'live',
    description: 'Creative / pitch / project briefs',
    href: '/hapai/brief-generator',
    visual: 'brief',
    shareable: true,
    category: 'record',
    posture: 'Draft brief only. The owner signs off scope, budget, and deadlines.',
  },
  {
    slug: '9am-brief',
    name: 'The 9am Brief',
    status: 'live',
    description: 'Paste the day’s loose signals and leave with priorities, follow-ups, and review-ready actions.',
    href: '/hapai/9am-brief',
    visual: 'morning-brief',
    shareable: true,
    category: 'operations',
    posture: 'Draft operating brief only. It does not send messages, change calendars, or make commitments.',
  },
  {
    slug: 'electrify',
    name: 'Energy calculator',
    status: 'live',
    description: 'NZ electrification savings and payback',
    href: '/hapai/electrify',
    visual: 'electrify',
    shareable: true,
    category: 'operations',
    posture: 'Indicative calculator only. Confirm inputs before investment decisions.',
  },
  {
    slug: 'og-card-generator',
    name: 'OG card generator',
    status: 'live',
    description: 'Branded 1200x630 share cards',
    href: '/hapai/og-card-generator',
    visual: 'og-card',
    shareable: true,
    category: 'marketing',
    posture: 'Draft share cards only. Check copy and brand fit before publishing.',
  },
  {
    slug: 'tagline-workshop',
    name: 'Tagline workshop',
    status: 'live',
    description: 'Tagline candidates in five styles',
    href: '/hapai/tagline-workshop',
    visual: 'tagline',
    shareable: true,
    category: 'marketing',
    posture: 'Draft language only. A human chooses and clears the final line.',
  },
  {
    slug: 'projects',
    name: 'Project picker',
    status: 'live',
    description: 'Three ranked candidate projects to build first',
    href: '/hapai/projects',
    visual: 'project-picker',
    shareable: true,
    category: 'adoption',
    posture: 'Recommendation aid only. Final project choice sits with the operator.',
  },
  {
    slug: 'study-helper',
    name: 'Study Helper',
    status: 'live',
    description:
      'Upload notes or a teacher prompt. Get an essay plan, quote checklist, recall quiz, or study sprint mapped to NZ Curriculum skills.',
    href: '/hapai/study-helper',
    visual: 'study',
    shareable: true,
    category: 'education',
    posture:
      'Study support only. It coaches planning, recall, and essay structure; students write their own answer and verify quotes from the text.',
  },
  {
    slug: 'meeting-recorder',
    name: 'Meeting recorder',
    status: 'live',
    description: 'Record or paste. Walk away with proper notes: decisions, action items, next steps.',
    href: '/hapai/meeting-recorder',
    visual: 'meeting',
    shareable: true,
    category: 'record',
    posture: 'Draft meeting record only. Get consent and review before sharing or filing.',
  },
  {
    slug: 'privacy-act',
    name: 'Privacy Act one-pager',
    status: 'live',
    description:
      'Generate a tailored Privacy Act 2020 summary for your organisation. Maps your data flows to the 13 IPPs including IPP 3A.',
    href: '/hapai/privacy-act',
    visual: 'privacy',
    shareable: true,
    category: 'record',
    posture: 'Plain-English draft only. It is not legal advice.',
  },
  {
    slug: 'fridge-to-list',
    name: 'Fridge to shopping list',
    status: 'live',
    description: 'Photo of the fridge in. Meal plan and supermarket-aisle shopping list out. Tuned for NZ kai conventions.',
    href: '/hapai/fridge-to-list',
    visual: 'fridge',
    shareable: true,
    category: 'lifestyle',
    posture: 'Household planning aid only. Check allergies, budget, and preferences.',
  },
  {
    slug: 'food-temp-log',
    name: 'Food temperature log',
    status: 'live',
    description: 'Daily fridge, freezer, hot-hold, cooking, and cleaning checks. Walk away with a Food Act 2014 record.',
    href: '/hapai/food-temp-log',
    visual: 'food-temp',
    shareable: true,
    category: 'record',
    posture: 'Draft operational record only. The food business operator remains responsible for verification.',
  },
] as const;

export function getHapaiTool(slug: string): HapaiTool | undefined {
  return HAPAI_TOOLS.find((tool) => tool.slug === slug);
}

/**
 * The share-card path is always derived from the tool's own path, so a tool's
 * page and its `og:image` are guaranteed to live on the same slug. Tools under
 * `/hapai/<slug>` are served by the dynamic `/hapai/[slug]/opengraph-image`
 * route; tools with their own path (e.g. `/electrify`) ship a co-located
 * `opengraph-image` route at that same path.
 */
export function getHapaiToolShareImagePath(tool: HapaiTool): string {
  return `${tool.href.replace(/\/$/, '')}/opengraph-image`;
}

export function getHapaiToolShareImageUrl(tool: HapaiTool): string {
  return `https://www.assembl.co.nz${getHapaiToolShareImagePath(tool)}`;
}

export function getHapaiToolUrl(tool: HapaiTool): string {
  return `https://www.assembl.co.nz${tool.href}`;
}

export function getHapaiToolEmailHref(tool: HapaiTool): string {
  const subject = `${tool.name} — a shareable assembl HAPAI tool`;
  const body = [
    'Kia ora,',
    '',
    `I thought this assembl HAPAI tool might be useful: ${tool.name}.`,
    tool.description,
    '',
    `Open it here: ${getHapaiToolUrl(tool)}`,
    `Share image: ${getHapaiToolShareImageUrl(tool)}`,
    '',
    tool.posture,
  ].join('\n');

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

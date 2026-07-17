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
  | 'turf'
  | 'kiwisaver'
  | 'wishlist'
  | 'rates'
  | 'school-notice'
  | 'healthy-homes'
  | 'fare'
  | 'holidays';

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
  /** 'dash' tools ship the locked Dash canary/charcoal brand + their own
   *  co-located opengraph-image route, so they are excluded from the green
   *  dynamic [slug] OG route. Defaults to the original green SPARK brand. */
  brand?: 'dash';
  /** The kete this tool belongs to, when it maps to one. Drives the "open the
   *  matching kete chat" link and library grouping. */
  kete?: KeteSlug;
};

export const HAPAI_TOOLS: readonly HapaiTool[] = [
  {
    slug: 'rates-reader',
    name: 'Rates Reader',
    status: 'live',
    description:
      'Snap or paste your rates notice and get a plain-English breakdown — what you pay for, how your area compares, where the council actually spends it.',
    href: '/hapai/rates-reader',
    visual: 'rates',
    shareable: true,
    category: 'lifestyle',
    brand: 'dash',
    kete: 'matauranga',
    posture:
      'Indicative breakdown only. It reads what you give it and explains the categories; confirm exact figures against your council’s long-term plan.',
  },
  {
    slug: 'school-notice',
    name: 'School Notice Translator',
    status: 'live',
    description:
      'Paste or photograph the newsletter, the Hero post, or that PDF the teacher sent. Get back the dates, what’s needed, and a drafted RSVP.',
    href: '/hapai/school-notice',
    visual: 'school-notice',
    shareable: true,
    category: 'education',
    brand: 'dash',
    kete: 'ako',
    posture:
      'Draft summary only. It reads the notice you supply and never invents dates; check anything important against the original before you act.',
  },
  {
    slug: 'healthy-homes',
    name: 'Healthy Homes Checker',
    status: 'live',
    description:
      'Answer a few questions room by room. Get a pass/fail on each Healthy Homes Standard, and a plain-English letter you can send your landlord.',
    href: '/hapai/healthy-homes',
    visual: 'healthy-homes',
    shareable: true,
    category: 'lifestyle',
    brand: 'dash',
    posture:
      'Plain-English guide only. It is not legal advice or a compliance certificate; Tenancy Services and a healthy homes assessor are the formal authorities.',
  },
  {
    slug: 'fare-optimiser',
    name: 'Fare Optimiser',
    status: 'live',
    description:
      'Type your usual trips and get the cheapest fare combo — HOP cap, Bee Card weekly, daily deals — and a dollar figure you can hand your parents.',
    href: '/hapai/fare-optimiser',
    visual: 'fare',
    shareable: true,
    category: 'lifestyle',
    brand: 'dash',
    kete: 'arataki',
    posture:
      'Indicative estimate only. Fares and caps change; confirm the current price on AT, Metlink, ORC, or Metro before you rely on it.',
  },
  {
    slug: 'holidays-act',
    name: 'Holidays Act Sense-Check',
    status: 'live',
    description:
      'Paste your pay details and recent leave. Get a yes / no / can’t-tell on whether the holiday pay maths looks right — with the part of the Act it should match.',
    href: '/hapai/holidays-act',
    visual: 'holidays',
    shareable: true,
    category: 'record',
    brand: 'dash',
    posture:
      'Plain-English sense-check only — not legal or payroll advice, and not a calculation of what you are owed. If something looks off, talk to your employer, a union, or Employment NZ.',
  },
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
      'Paste a commercial invoice and get back a structured customs entry draft your broker can check and file. Nothing is ever lodged.',
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
    description: 'Make a hero image for a post, page, or deck.',
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
    description: 'Draft a caption for LinkedIn, Instagram, X, or Facebook.',
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
    description: 'Turn a few notes into a creative, pitch, or project brief.',
    href: '/hapai/brief-generator',
    visual: 'brief',
    shareable: true,
    category: 'record',
    posture: 'Draft brief only. The owner signs off scope, budget, and deadlines.',
  },
  {
    slug: '9am-brief',
    name: 'The Dawn',
    status: 'live',
    description:
      'Turns the school notice, the sports draw, and tomorrow’s weather into a five-line morning brief. So you stop forgetting the rugby boots.',
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
    description:
      'See what going electric saves you, appliance by appliance — and how many years until each switch pays for itself.',
    href: '/hapai/electrify',
    visual: 'electrify',
    shareable: true,
    category: 'operations',
    posture: 'Indicative calculator only. Confirm inputs before investment decisions.',
  },
  {
    slug: 'og-card-generator',
    name: 'Share card maker',
    status: 'live',
    description: 'Make a branded share card for any link you post.',
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
    description: 'See tagline options in five different styles.',
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
    description: 'Get three ranked projects to build first.',
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
    name: 'Hui — the meeting agent',
    status: 'live',
    description: 'Record, upload, or paste. Walk away with the minutes, the actions, and an evidence pack you can file.',
    href: '/hui',
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
  {
    slug: 'turf-maintenance',
    name: 'Turf maintenance log',
    status: 'live',
    description:
      'Log the week’s mowing, spraying, and hazards. Walk away with a grounds record that holds up under HSWA 2015.',
    href: '/hapai/turf-maintenance',
    visual: 'turf',
    shareable: true,
    category: 'record',
    posture:
      'Draft operational record only. The club or school stays responsible for verification and safe chemical handling.',
  },
  {
    slug: 'kiwisaver-kids',
    name: 'KiwiSaver for kids calculator',
    status: 'live',
    description:
      'See what $1,000 at birth could grow into by the time they’re 65 — and what a few years of teenage contributions add on top.',
    href: '/hapai/kiwisaver-kids',
    visual: 'kiwisaver',
    shareable: true,
    category: 'lifestyle',
    posture:
      'Indicative calculator only. Returns are assumptions, not advice — confirm with a licensed financial adviser.',
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
  const subject = `${tool.name} — a shareable assembl SPARK tool`;
  const body = [
    'Kia ora,',
    '',
    `I thought this assembl SPARK tool might be useful: ${tool.name}.`,
    tool.description,
    '',
    `Open it here: ${getHapaiToolUrl(tool)}`,
    `Share image: ${getHapaiToolShareImageUrl(tool)}`,
    '',
    tool.posture,
  ].join('\n');

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

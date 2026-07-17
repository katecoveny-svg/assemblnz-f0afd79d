import type { KeteSlug } from '@/lib/kete';

/**
 * Client-safe config for the five Dash-branded SPARK tools (viral shortlist,
 * 2026-06-23). Drives the shared <DashTool> client component, the grid entry,
 * and the per-tool Dash OG card. System prompts and fallbacks live server-side
 * in lib/hapai/dash/server.ts so the locked prompts never reach the bundle.
 */

export type DashFieldType = 'text' | 'textarea' | 'select';

export type DashField = {
  name: string;
  label: string;
  type: DashFieldType;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
  /** Span both columns of the input grid. Textareas default to full. */
  full?: boolean;
};

export type DashToolConfig = {
  slug: string;
  name: string;
  /** Mono eyebrow, e.g. "SPARK tool · live". */
  eyebrow: string;
  /** Hero headline. */
  title: string;
  /** One-line share/grid description. */
  description: string;
  /** Longer hero paragraph. */
  intro: string;
  ctaLabel: string;
  loadingLabel: string;
  fields: readonly DashField[];
  allowImage?: boolean;
  imageLabel?: string;
  highlights: readonly { title: string; body: string }[];
  posture: string;
  shareText: string;
  /** API route this tool posts to. */
  endpoint: string;
  evidenceTitle: string;
  evidenceNote: string;
  /** Numbers tools lead the share card with one giant figure (brand note). */
  numbersLed?: boolean;
  ogFigure?: string;
  ogFigureLabel?: string;
  kete?: KeteSlug;
  /** Optional te reo eyebrow label for the home-page tool card. */
  teReo?: string;
  /** Pre-fill values for the "load an example" button. */
  sample?: Record<string, string>;
};

const REGIONS = [
  { value: 'auckland', label: 'Auckland — AT HOP' },
  { value: 'wellington', label: 'Wellington — Metlink Snapper' },
  { value: 'otago', label: 'Otago / Queenstown — Bee Card' },
  { value: 'canterbury', label: 'Canterbury — Metrocard' },
  { value: 'other', label: 'Other region' },
] as const;

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
] as const;

export const DASH_TOOLS: readonly DashToolConfig[] = [
  {
    slug: 'rates-reader',
    name: 'Rates Reader',
    eyebrow: 'SPARK tool · live',
    title: 'Your rates notice, in plain English.',
    description:
      'Snap or paste your rates notice and get a plain-English breakdown — what you pay for, how your area compares, where the council actually spends it.',
    intro:
      'Every homeowner gets a rates notice. Most stare at it, swear, and file it. Paste yours — or just your council and the total — and get back a clear breakdown you can read in thirty seconds.',
    ctaLabel: 'Read my rates',
    loadingLabel: 'Reading your rates notice…',
    fields: [
      {
        name: 'council',
        label: 'Council or district',
        type: 'text',
        placeholder: 'e.g. Auckland Council, Wellington City, Tauranga…',
      },
      {
        name: 'total',
        label: 'Annual rates total (if you know it)',
        type: 'text',
        placeholder: 'e.g. $4,800',
      },
      {
        name: 'notice',
        label: 'Paste anything from the notice',
        type: 'textarea',
        placeholder:
          'Paste the line items, the targeted rates, the property value — whatever is on the notice. Or just leave a note about your suburb.',
        full: true,
      },
    ],
    allowImage: true,
    imageLabel: 'Photograph the rates notice',
    highlights: [
      { title: 'where it goes', body: 'roads, water, libraries, parks — as a share-ready split' },
      { title: 'plain english', body: 'targeted rates and UAGC, decoded without the jargon' },
      { title: 'the comparison', body: 'how your bill sits against the typical local bill' },
    ],
    posture:
      'Indicative breakdown only. It reads what you give it and explains the categories; confirm exact figures against your council’s long-term plan.',
    shareText:
      'Paste your rates notice and get a plain-English breakdown — what you pay for and where the council actually spends it.',
    endpoint: '/api/hapai/rates-reader',
    evidenceTitle: 'Rates breakdown',
    evidenceNote:
      'Plain-English summary only. Category splits are indicative and based on the figures you supplied; confirm against your council’s rates resolution and long-term plan.',
    numbersLed: true,
    ogFigure: '$4,800',
    ogFigureLabel: 'a year — decoded line by line',
    kete: 'matauranga',
    sample: {
      council: 'Auckland Council',
      total: '$4,800',
      notice:
        'General rate $2,140. Uniform Annual General Charge $530. Water & wastewater targeted rate $980. Waste management $230. Natural Environment & Water Quality targeted rates $310. Capital value $1,250,000.',
    },
  },
  {
    slug: 'school-notice',
    name: 'School Notice Translator',
    eyebrow: 'SPARK tool · live',
    title: 'The school notice, sorted.',
    description:
      'Paste or photograph the newsletter, the Hero post, or that PDF the teacher sent. Get back the actual dates, what’s needed, and a drafted RSVP.',
    intro:
      'Parents drown in school notices. Paste the newsletter — or the Hero, Seesaw, or Skool post — and get back the three things that actually matter this week, with dates, what to bring, and a reply you can send.',
    ctaLabel: 'Sort the notice',
    loadingLabel: 'Reading the school notice…',
    fields: [
      {
        name: 'child',
        label: 'Child’s name or year (optional)',
        type: 'text',
        placeholder: 'e.g. Year 4 student',
      },
      {
        name: 'notice',
        label: 'Paste the newsletter or notice',
        type: 'textarea',
        placeholder:
          'Paste the whole thing — newsletter, Hero post, Seesaw message, the lot. It pulls out the dates and actions.',
        full: true,
      },
    ],
    allowImage: true,
    imageLabel: 'Photograph the notice or newsletter',
    highlights: [
      { title: 'the dates', body: 'mufti days, trips, assemblies — pulled out with the day' },
      { title: 'what to bring', body: 'gold coin, togs, permission slip, costume' },
      { title: 'the reply', body: 'a drafted RSVP you read once and send' },
    ],
    posture:
      'Draft summary only. It reads the notice you supply and never invents dates; check anything important against the original before you act.',
    shareText:
      'Paste the school newsletter and get back the 3 things that matter this week — dates, what to bring, and a drafted RSVP.',
    endpoint: '/api/hapai/school-notice',
    evidenceTitle: 'This week’s notice',
    evidenceNote:
      'Draft summary only. Dates and actions are read from the notice you supplied; confirm against the original before relying on them.',
    kete: 'ako',
    sample: {
      child: 'Year 4 student',
      notice:
        'Hi everyone! A few reminders. Mufti Day is next Friday 4 July — gold coin donation, sports theme. Year 4 trip to MOTAT is Tuesday 8 July, permission slips and $12 due by Monday. Cross-country is Thursday 10 July, wear house colours. Book Fair runs all of week 9. Please return library books. Thanks, Room 12.',
    },
  },
  {
    slug: 'healthy-homes',
    name: 'Healthy Homes Checker',
    eyebrow: 'SPARK tool · live',
    title: 'Does your rental meet the standards?',
    description:
      'Answer a few questions room by room. Get a pass/fail on each Healthy Homes Standard, and a plain-English letter you can send your landlord.',
    intro:
      'Half of New Zealand rents, and the Healthy Homes Standards are law — but most tenants don’t know the detail. Answer a few quick questions and get a checklist of what you meet, what you don’t, and exactly what to ask for.',
    ctaLabel: 'Check my rental',
    loadingLabel: 'Checking against the five standards…',
    fields: [
      {
        name: 'heating',
        label: 'A fixed heater in the main living room?',
        type: 'select',
        options: YES_NO,
      },
      {
        name: 'insulation',
        label: 'Ceiling and underfloor insulation?',
        type: 'select',
        options: YES_NO,
      },
      {
        name: 'ventilation',
        label: 'Extractor fans in kitchen and bathroom?',
        type: 'select',
        options: YES_NO,
      },
      {
        name: 'moisture',
        label: 'Ground moisture barrier / no damp or mould?',
        type: 'select',
        options: YES_NO,
      },
      {
        name: 'draughts',
        label: 'Gaps and draughts blocked (doors, windows)?',
        type: 'select',
        options: YES_NO,
      },
      {
        name: 'notes',
        label: 'Anything else about the place',
        type: 'textarea',
        placeholder:
          'e.g. single-pane windows, no heat pump, mould in the back bedroom, open fireplace blocked off…',
        full: true,
      },
    ],
    allowImage: true,
    imageLabel: 'Add a photo of a room or problem area',
    highlights: [
      { title: 'five standards', body: 'heating, insulation, ventilation, moisture, draughts' },
      { title: 'pass or fail', body: 'a clear verdict on each, not legal fog' },
      { title: 'the letter', body: 'a polite, specific request to send your landlord' },
    ],
    posture:
      'Plain-English guide only. It is not legal advice or a compliance certificate; Tenancy Services and a healthy homes assessor are the formal authorities.',
    shareText:
      'Answer a few questions and see which Healthy Homes Standards your rental meets — and get a letter to send the landlord.',
    endpoint: '/api/hapai/healthy-homes',
    evidenceTitle: 'Healthy Homes check',
    evidenceNote:
      'Plain-English guide only, based on your answers. Not a compliance certificate or legal advice. The Residential Tenancies (Healthy Homes Standards) Regulations 2019 are the authority.',
    sample: {
      heating: 'no',
      insulation: 'yes',
      ventilation: 'no',
      moisture: 'unsure',
      draughts: 'no',
      notes: 'Single-pane wooden windows, no heat pump, small heater we bought ourselves. Some mould on the back bedroom ceiling in winter.',
    },
  },
  {
    slug: 'fare-optimiser',
    name: 'Fare Optimiser',
    eyebrow: 'SPARK tool · live',
    title: 'Stop overpaying for the bus.',
    description:
      'Type your usual trips and get the cheapest fare combo — HOP cap, Bee Card weekly, daily deals — and a dollar figure you can hand your parents.',
    intro:
      'Every commuter has had the “am I overpaying?” thought. Tell it where you go and how often, and it works out the cheapest way to pay — the HOP weekly cap, the Bee Card, the daily fare deals — and the monthly cost.',
    ctaLabel: 'Find the cheapest fare',
    loadingLabel: 'Working out your cheapest fare…',
    fields: [
      {
        name: 'region',
        label: 'Where do you travel?',
        type: 'select',
        options: REGIONS,
        full: true,
      },
      { name: 'from', label: 'From', type: 'text', placeholder: 'e.g. Henderson' },
      { name: 'to', label: 'To', type: 'text', placeholder: 'e.g. Britomart / city' },
      {
        name: 'frequency',
        label: 'Return trips per week',
        type: 'text',
        placeholder: 'e.g. 5 (one each weekday)',
      },
      {
        name: 'mode',
        label: 'Bus, train, ferry, or a mix?',
        type: 'text',
        placeholder: 'e.g. bus then train',
      },
      {
        name: 'notes',
        label: 'Anything else',
        type: 'textarea',
        placeholder:
          'e.g. under 25, tertiary student, Community Services Card, also travel weekends, kid travels with me…',
        full: true,
      },
    ],
    highlights: [
      { title: 'the cap', body: 'whether the weekly fare cap beats pay-as-you-go' },
      { title: 'concessions', body: 'student, child, and community discounts you may miss' },
      { title: 'the number', body: 'one monthly figure — and what you’d save' },
    ],
    posture:
      'Indicative estimate only. Fares and caps change; confirm the current price on AT, Metlink, ORC, or Metro before you rely on it.',
    shareText:
      'Type your usual trips and find the cheapest way to pay — HOP cap, Bee Card weekly, daily deals — plus what you’d save a month.',
    endpoint: '/api/hapai/fare-optimiser',
    evidenceTitle: 'Cheapest fare plan',
    evidenceNote:
      'Indicative estimate only, based on the trips you described. Fares, caps, and concessions change — confirm with your regional transport operator before relying on the figures.',
    numbersLed: true,
    ogFigure: '$34',
    ogFigureLabel: 'a month — the cap most people miss',
    kete: 'arataki',
    sample: {
      region: 'auckland',
      from: 'Henderson',
      to: 'Britomart',
      frequency: '5',
      mode: 'train',
      notes: 'Full adult fare, travel every weekday, sometimes one weekend trip into town.',
    },
  },
  {
    slug: 'holidays-act',
    name: 'Holidays Act Sense-Check',
    eyebrow: 'SPARK tool · live',
    title: 'Does your holiday pay look right?',
    description:
      'Paste your pay details and recent leave. Get a yes / no / can’t-tell on whether the holiday pay maths looks right — with the part of the Act it should match.',
    intro:
      'The Holidays Act 2003 is famously hard to get right, and arrears have been recovered in the hundreds of millions since 2016. Paste what you know and get a plain-English read on whether your annual or public holiday pay looks about right.',
    ctaLabel: 'Sense-check my pay',
    loadingLabel: 'Sense-checking against the Holidays Act…',
    fields: [
      {
        name: 'pattern',
        label: 'Your hours pattern',
        type: 'text',
        placeholder: 'e.g. 40 hrs over 5 fixed days / variable shifts',
      },
      {
        name: 'pay',
        label: 'Ordinary pay (rate or weekly)',
        type: 'text',
        placeholder: 'e.g. $28/hr, or $1,120 a week',
      },
      {
        name: 'leaveType',
        label: 'Which leave are you checking?',
        type: 'select',
        options: [
          { value: 'annual', label: 'Annual holidays' },
          { value: 'public', label: 'Public holiday (worked or not)' },
          { value: 'bapsl', label: 'Bereavement / alternative / sick leave' },
        ],
        full: true,
      },
      {
        name: 'leaveTaken',
        label: 'The leave and what you were paid',
        type: 'textarea',
        placeholder:
          'e.g. Took 5 days annual leave in March, paid $1,000 total. I usually earn more than that in a normal week because of regular overtime and a shift allowance.',
        full: true,
      },
    ],
    allowImage: true,
    imageLabel: 'Add a payslip photo (optional)',
    highlights: [
      { title: 'the maths', body: 'greater-of ordinary weekly pay vs average weekly earnings' },
      { title: 'the section', body: 'the part of the Act your pay should match' },
      { title: 'honest verdict', body: 'looks right, looks off, or can’t tell from this' },
    ],
    posture:
      'Plain-English sense-check only — not legal or payroll advice, and not a calculation of what you are owed. If something looks off, talk to your employer, a union, or Employment NZ.',
    shareText:
      'Paste your pay and recent leave for a plain-English read on whether your Holidays Act 2003 holiday pay looks right.',
    endpoint: '/api/hapai/holidays-act',
    evidenceTitle: 'Holidays Act sense-check',
    evidenceNote:
      'Plain-English sense-check only — not legal, payroll, or financial advice, and not a calculation of arrears. The Holidays Act 2003 and Employment New Zealand are the authorities.',
    sample: {
      pattern: '40 hrs over 5 fixed days, plus regular overtime',
      pay: '$28/hr base',
      leaveType: 'annual',
      leaveTaken:
        'Took 5 days annual leave in March, paid $1,000 total ($200/day). In a normal week I take home noticeably more because I do about 6 hours of overtime a week and get a $40 shift allowance.',
    },
  },
] as const;

export function getDashTool(slug: string): DashToolConfig | undefined {
  return DASH_TOOLS.find((tool) => tool.slug === slug);
}

export const DASH_TOOL_SLUGS = DASH_TOOLS.map((tool) => tool.slug);

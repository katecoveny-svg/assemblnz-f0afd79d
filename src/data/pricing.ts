/** Single source of truth for all pricing across the site — confirmed 2026 model */

export const SETUP_FEE = {
  amount: 749,
  currency: 'NZD',
  label: 'NZ$749 + GST',
  description: 'One-time setup fee. Workflow mapping, tool integration, agent configuration, and launch.',
} as const;

export const PRICING = {
  essentials: {
    name: 'Essentials',
    price: 199,
    annualPrice: 159,
    period: '/mo',
    currency: 'NZD',
    descriptor: 'Perfect for solo operators and small teams getting started with AI',
    features: [
      '2 users',
      '500 queries/month',
      'All 44+ specialist agents',
      'All 9 kete',
      'Intelligence dashboard',
      'SMS & WhatsApp access',
      'Email support',
    ],
    cta: 'Start free trial',
    trial: '14-day free trial — no credit card required',
    popular: false,
  },
  business: {
    name: 'Business',
    price: 399,
    annualPrice: 319,
    period: '/mo',
    currency: 'NZD',
    descriptor: 'For growing teams that need more capacity and priority support',
    features: [
      '10 users',
      '2,000 queries/month',
      'All 44+ specialist agents',
      'All 9 kete',
      'Full intelligence dashboards',
      'SMS, WhatsApp & voice access',
      'End-to-end workflow automation',
      'Priority email & chat support',
    ],
    cta: 'Start free trial',
    trial: null,
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 799,
    annualPrice: 639,
    period: '/mo',
    currency: 'NZD',
    descriptor: 'For organisations that need unlimited capacity and dedicated support',
    features: [
      'Unlimited users',
      'Unlimited queries',
      'All 44+ specialist agents',
      'All 9 kete',
      'Custom integrations (Xero, MYOB, Procore)',
      'Dedicated success manager',
      'Monthly strategy sessions',
      'Custom workflow builds',
      'Advanced compliance & audit',
      'Tikanga-aware governance layer',
      'Multi-tenant / multi-site support',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
    trial: null,
    popular: false,
  },
  toroa: {
    name: 'Tōroa',
    sub: 'Family Navigator',
    price: 29,
    period: '/mo',
    currency: 'NZD',
    descriptor: 'SMS-first AI for NZ whānau',
    features: [
      'SMS-first family navigator',
      'School notices & calendar',
      'Meal planning & grocery lists',
      'Budget tracking',
      'Transport & bus times',
      'Learning support',
    ],
    cta: 'Start with Tōroa',
    link: 'https://buy.stripe.com/fZuaEZa1CdkA6573Wu3oA0b',
    popular: false,
  },
} as const;

export const ANNUAL_DISCOUNT = 20; // percent

export const CORE_PLATFORM = {
  name: 'Assembl Core',
  description: 'Included in every subscription',
  features: [
    'Iho routing brain',
    'SIGNAL security agent',
    'Compliance pipeline (Kahu → Tā → Mana)',
    'SMS & WhatsApp access',
    'Dashboard & analytics',
    'NZ data sovereignty',
  ],
} as const;

/** Feature comparison table data */
export const COMPARISON_FEATURES = [
  { feature: 'Users', essentials: '2', business: '10', enterprise: 'Unlimited' },
  { feature: 'Queries / month', essentials: '500', business: '2,000', enterprise: 'Unlimited' },
  { feature: 'Specialist Agents', essentials: 'All 44+', business: 'All 44+', enterprise: 'All 44+' },
  { feature: 'Industry Kete', essentials: 'All 9', business: 'All 9', enterprise: 'All 9' },
  { feature: 'Intelligence Dashboards', essentials: true, business: true, enterprise: true },
  { feature: 'SMS & WhatsApp', essentials: true, business: true, enterprise: true },
  { feature: 'Voice Access', essentials: false, business: true, enterprise: true },
  { feature: 'Workflow Automation', essentials: false, business: true, enterprise: true },
  { feature: 'Custom Integrations', essentials: false, business: false, enterprise: true },
  { feature: 'Dedicated Success Manager', essentials: false, business: false, enterprise: true },
  { feature: 'Strategy Sessions', essentials: false, business: false, enterprise: 'Monthly' },
  { feature: 'Multi-Site Support', essentials: false, business: false, enterprise: true },
  { feature: 'SLA Guarantee', essentials: false, business: false, enterprise: true },
  { feature: 'Support', essentials: 'Email', business: 'Priority email & chat', enterprise: 'Dedicated manager' },
] as const;

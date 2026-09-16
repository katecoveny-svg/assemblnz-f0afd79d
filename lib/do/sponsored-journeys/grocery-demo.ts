import type { SponsoredJourneyDemo } from './types';

/**
 * Grocery / loyalty sponsored journey — DEMO STUB data only.
 * Everyday Rewards–style framing without claiming a live Woolworths/partner integration.
 */
export const GROCERY_LOYALTY_SPONSORED_DEMO: SponsoredJourneyDemo = {
  id: 'sponsored-grocery-loyalty-demo',
  vertical: 'grocery_loyalty_demo',
  title: 'Dinner tonight · loyalty offer',
  demoLabel: 'DEMO · synthetic grocery / loyalty stub',
  disclaimer:
    'Assembl Sponsored Journeys prototype — provider-neutral. This is not OpenAI Sponsored Agents or ChatGPT Ads. No OpenAI Ads API. Offer, basket and CRM handoff are demo stubs, not a live retailer or loyalty programme.',
  agent: {
    name: 'Kitchen DO',
    brand: 'assembl',
    tagline: 'Understand dinner intent · assemble a useful next step · optional genuine reward',
  },
  seedIntent: 'Need dinner tonight for four — something quick after sport.',
  unpaidPathLabel: 'Continue without offer',
  steps: [
    {
      id: 'branded_agent',
      label: 'Branded agent',
      owner: 'assembl',
      sponsored: false,
      summary: 'Kitchen DO greets with clear Assembl + DO branding.',
    },
    {
      id: 'understand_intent',
      label: 'Understand intent',
      owner: 'assembl',
      sponsored: false,
      summary: 'Parse dinner intent — no side effects.',
    },
    {
      id: 'assemble_next',
      label: 'Assemble next step',
      owner: 'assembl',
      sponsored: false,
      summary: 'Propose a useful basket / meal path from synthetic catalogue.',
    },
    {
      id: 'reward_offer',
      label: 'Genuine reward / offer',
      owner: 'loyalty',
      sponsored: true,
      summary: 'Optional labelled loyalty offer — unpaid path stays available.',
    },
    {
      id: 'permit',
      label: 'DO Permit',
      owner: 'do',
      sponsored: false,
      summary: 'Human approval card before any consequential action.',
    },
    {
      id: 'action_stub',
      label: 'Action stub',
      owner: 'do',
      sponsored: false,
      summary: 'Simulated redeem / add-to-order under permit.',
    },
    {
      id: 'crm_handoff',
      label: 'CRM / commerce handoff',
      owner: 'crm',
      sponsored: false,
      summary: 'Stub webhook to commerce/CRM adapter — not a live send.',
    },
    {
      id: 'receipt',
      label: 'Receipt',
      owner: 'do',
      sponsored: false,
      summary: 'DO receipt for audit + sponsor reporting (not chat impressions).',
    },
  ],
  offer: {
    id: 'off_demo_weeknight_pasta',
    label: '+40 demo points if you add the sponsored pasta sauce (labelled)',
    points: 40,
    genuine: true,
    disclosure: 'Sponsored loyalty step · demo points only · skip anytime',
  },
  basket: [
    { sku: 'demo-chicken', name: 'Free-range chicken thighs 800g', qty: 1, priceNzd: 12.5 },
    { sku: 'demo-pasta', name: 'Spaghetti 500g', qty: 1, priceNzd: 2.4 },
    {
      sku: 'demo-sauce-sponsored',
      name: 'Tomato basil sauce 500g',
      qty: 1,
      priceNzd: 3.8,
      sponsored: true,
    },
    { sku: 'demo-salad', name: 'Mixed leaf salad', qty: 1, priceNzd: 4.2 },
  ],
  handoff: {
    system: 'demo.commerce.webhook',
    note: 'Would POST order stub + receipt id to tenant CRM/commerce adapter. Not sent in this prototype.',
  },
};

export const SPONSORED_JOURNEY_DEMOS = [GROCERY_LOYALTY_SPONSORED_DEMO] as const;

export function getSponsoredDemo(id: string) {
  return SPONSORED_JOURNEY_DEMOS.find((d) => d.id === id) ?? null;
}

/**
 * Assembl Sponsored Journeys — provider-neutral schema.
 * Not OpenAI Sponsored Agents / Ads. No OpenAI Ads API dependency.
 */

export type SponsoredJourneyStepId =
  | 'branded_agent'
  | 'understand_intent'
  | 'assemble_next'
  | 'reward_offer'
  | 'permit'
  | 'action_stub'
  | 'crm_handoff'
  | 'receipt';

export type SponsoredJourneyStep = {
  id: SponsoredJourneyStepId;
  label: string;
  owner: 'assembl' | 'do' | 'loyalty' | 'crm';
  /** Always disclose sponsored steps in UI. */
  sponsored: boolean;
  summary: string;
};

export type SponsoredOffer = {
  id: string;
  /** Demo label only — not a live partner claim. */
  label: string;
  points: number;
  genuine: boolean;
  disclosure: string;
};

export type SponsoredBasketLine = {
  sku: string;
  name: string;
  qty: number;
  priceNzd: number;
  sponsored?: boolean;
};

export type SponsoredJourneyDemo = {
  id: string;
  vertical: 'grocery_loyalty_demo';
  title: string;
  /** Honest: synthetic demo data, not a live retailer integration. */
  demoLabel: string;
  disclaimer: string;
  agent: {
    name: string;
    brand: string;
    tagline: string;
  };
  seedIntent: string;
  unpaidPathLabel: string;
  steps: SponsoredJourneyStep[];
  offer: SponsoredOffer;
  basket: SponsoredBasketLine[];
  handoff: {
    system: string;
    note: string;
  };
};

export type SponsoredJourneyRunStatus =
  | 'idle'
  | 'intent'
  | 'assembled'
  | 'offer_shown'
  | 'permit_pending'
  | 'permitted'
  | 'action_simulated'
  | 'handoff_stubbed'
  | 'receipted';

export type SponsoredJourneyRun = {
  run_id: string;
  demo_id: string;
  status: SponsoredJourneyRunStatus;
  intent: string;
  use_sponsored_path: boolean;
  current_step: SponsoredJourneyStepId;
  prep_id?: string;
  permit_id?: string;
  action_id?: string;
  receipt_id?: string;
  handoff_id?: string;
  created_at: string;
  updated_at: string;
  mode: 'demo_stub';
};

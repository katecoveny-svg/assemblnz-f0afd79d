/**
 * Shared types for assembl agent-app PREVIEW craft surfaces
 * (Arc architecture, Forge automotive, Ensemble creative, future verticals).
 */

export type TitleBlockField = {
  label: string;
  value: string;
};

export type PlanPin = {
  id: string;
  code: string;
  title: string;
  summary: string;
  /** Percent of plan sheet width / height */
  position: { x: number; y: number };
  /** DEMO label always shown in UI */
  demo: true;
};

export type PricingTier = {
  name: string;
  price: string;
  detail: string;
  credits: string;
  /** Directional hours back each week — drives the credit meter */
  hoursBack?: number;
};

export type ObserveAdviseActStep = {
  id: 'observe' | 'advise' | 'act';
  label: string;
  title: string;
  body: string;
};

export type ChatOpener = {
  q: string;
  a: string;
};

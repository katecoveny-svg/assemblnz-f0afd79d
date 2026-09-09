/**
 * DEMO-only customs / tariff / border pins for the Gateway agent-app preview.
 * Fictional vessel clearance pack. Not advice. Not a real clearance check.
 * Positions are percentages on the entry-pack canvas (0–100).
 * Not architecture pins — HS / entry / border / valuation only.
 */

import type { PlanPin } from '@/lib/agent-app/types';

export type GatewayPin = PlanPin;

export const GATEWAY_DEMO_PINS: GatewayPin[] = [
  {
    id: 'hs-pending',
    code: 'Working Tariff',
    title: 'HS classification pending',
    summary:
      'Line 2 has no confirmed heading against the NZ Working Tariff (DEMO shows 8544.42 · confirm). Cite GRI before any entry change; a licensed broker confirms the code.',
    position: { x: 74, y: 40 },
    demo: true,
  },
  {
    id: 'coo-missing',
    code: 'Customs Act',
    title: 'Origin proof missing',
    summary:
      'Preference claim lacks a certificate of origin on this DEMO entry. Gateway drafts the gap note; nothing lodges until a person approves.',
    position: { x: 40, y: 50 },
    demo: true,
  },
  {
    id: 'bio-hold',
    code: 'Biosecurity Act',
    title: 'Biosecurity hold — packing',
    summary:
      'Wooden packing on this DEMO vessel pack lacks an ISPM 15 mark for the scheduled release. Draft waits for broker clearance — not a real MPI hold.',
    position: { x: 80, y: 74 },
    demo: true,
  },
  {
    id: 'valuation',
    code: 'Customs Act',
    title: 'Valuation evidence thin',
    summary:
      'CIF build on this DEMO invoice is short of freight and insurance evidence for B/L DEMO-8841. Valuation note stays staged until a licensed person signs.',
    position: { x: 20, y: 72 },
    demo: true,
  },
];

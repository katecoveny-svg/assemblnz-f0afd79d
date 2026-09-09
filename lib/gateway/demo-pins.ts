/**
 * DEMO-only customs / tariff / border pins for the Gateway agent-app preview.
 * Fictional clearance pack. Not advice. Not a real clearance check.
 * Positions are percentages on the entry-pack canvas (0–100).
 */

import type { PlanPin } from '@/lib/agent-app/types';

export type GatewayPin = PlanPin;

export const GATEWAY_DEMO_PINS: GatewayPin[] = [
  {
    id: 'hs-pending',
    code: 'Working Tariff',
    title: 'HS classification pending',
    summary:
      'Line 2 has no confirmed heading against the NZ Working Tariff. DEMO pack — cite GRI before any entry change; a licensed broker confirms the code.',
    position: { x: 72, y: 36 },
    demo: true,
  },
  {
    id: 'coo-missing',
    code: 'Customs Act',
    title: 'Origin proof missing',
    summary:
      'Preference claim lacks a certificate of origin on this DEMO entry. Gateway drafts the gap note; nothing lodges until a person approves.',
    position: { x: 42, y: 48 },
    demo: true,
  },
  {
    id: 'bio-hold',
    code: 'Biosecurity Act',
    title: 'Biosecurity hold — packing',
    summary:
      'Wooden packing scheduled for release lacks an ISPM 15 mark on this DEMO pack. Draft waits for broker clearance — not a real MPI hold.',
    position: { x: 78, y: 72 },
    demo: true,
  },
  {
    id: 'valuation',
    code: 'Customs Act',
    title: 'Valuation evidence thin',
    summary:
      'CIF build on this DEMO invoice is short of freight and insurance evidence. Valuation note stays staged until a licensed person signs.',
    position: { x: 22, y: 70 },
    demo: true,
  },
];

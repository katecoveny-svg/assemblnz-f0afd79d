/**
 * DEMO-only NZTA / CCCFA flags for the Forge agent-app preview.
 * Fictional dealership floor plate. Not advice. Not a real compliance check.
 * Positions are percentages on the plan sheet (0–100).
 */

import type { PlanPin } from '@/lib/agent-app/types';

export type ForgeFlag = PlanPin;

export const FORGE_DEMO_FLAGS: ForgeFlag[] = [
  {
    id: 'wof-due',
    code: 'NZTA WoF',
    title: 'WoF due — bay 2',
    summary:
      'Light vehicle in bay 2 is past its WoF due stamp with no staged inspection. DEMO floor plate — cite NZTA WoF rules before any booking change.',
    position: { x: 28, y: 42 },
    demo: true,
  },
  {
    id: 'cof-hold',
    code: 'NZTA CoF',
    title: 'CoF hold — bay 4',
    summary:
      'Heavy vehicle scheduled for a road test lacks a current CoF on this DEMO plate. Forge drafts the hold note; a licensed person clears the bay.',
    position: { x: 72, y: 38 },
    demo: true,
  },
  {
    id: 'cccfa-disclosure',
    code: 'CCCFA',
    title: 'Finance disclosure incomplete',
    summary:
      'Responsible lending disclosure fields are incomplete on this DEMO finance lead. Draft waits for human approval — nothing sends to the customer.',
    position: { x: 58, y: 72 },
    demo: true,
  },
  {
    id: 'service-parts',
    code: 'NZTA WoF',
    title: 'Brake wear flag',
    summary:
      'Pad thickness on the DEMO inspection sheet sits below the workshop threshold. Parts pick stays staged until a person approves the quote.',
    position: { x: 38, y: 62 },
    demo: true,
  },
];

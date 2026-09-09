/**
 * DEMO-only ASA / Fair Trading pins for the Ensemble agent-app preview.
 * Fictional studio floor plate + brand board. Not advice. Not a real clearance.
 * Positions are percentages on the plan sheet (0–100).
 */

import type { PlanPin } from '@/lib/agent-app/types';

export type EnsemblePin = PlanPin;

export const ENSEMBLE_DEMO_PINS: EnsemblePin[] = [
  {
    id: 'asa-claim',
    code: 'ASA',
    title: 'Unsubstantiated superiority claim',
    summary:
      'Brand board headline claims “NZ’s #1” without substantiation on this DEMO plate. Cite ASA Principle 2 before any publish draft leaves the desk.',
    position: { x: 32, y: 28 },
    demo: true,
  },
  {
    id: 'fta-price',
    code: 'FTA 1986',
    title: 'Price claim missing conditions',
    summary:
      'Offer lock-up omits material conditions on this DEMO campaign sheet. Fair Trading Act 1986 — draft waits for human approval; nothing publishes.',
    position: { x: 68, y: 36 },
    demo: true,
  },
  {
    id: 'asa-disclaimer',
    code: 'ASA',
    title: 'Disclaimer too small on forme',
    summary:
      'Required disclaimer sits below readable size on Forme B of this DEMO imposition. Ensemble drafts the resize note; a person clears the set.',
    position: { x: 54, y: 62 },
    demo: true,
  },
  {
    id: 'copyright-asset',
    code: 'Copyright',
    title: 'Asset rights unconfirmed',
    summary:
      'Hero still on the DEMO asset shelf lacks a confirmed licence path. Asset pick stays staged until a person approves the rights note.',
    position: { x: 22, y: 70 },
    demo: true,
  },
];

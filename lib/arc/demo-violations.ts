/**
 * DEMO-only NZ code pins for the Arc agent-app preview.
 * Fictional layout. Not advice. Not a real consent check.
 * Positions are percentages on the GA plan sheet (0–100).
 */

export type ArcViolation = {
  id: string;
  code: string;
  title: string;
  summary: string;
  /** Percent of plan sheet width / height */
  position: { x: number; y: number };
  /** DEMO label always shown in UI */
  demo: true;
};

export const ARC_DEMO_VIOLATIONS: ArcViolation[] = [
  {
    id: 'stair-handrail',
    code: 'NZBC D1/AS1',
    title: 'Handrail required',
    summary:
      'Stair flight rises more than 1 m without a continuous handrail on the open side. DEMO layout — cite D1/AS1 before any drawing change.',
    position: { x: 72, y: 58 },
    demo: true,
  },
  {
    id: 'guardrail',
    code: 'NZBC F4/AS1',
    title: 'Guardrail height',
    summary:
      'Deck edge sits below the 1000 mm barrier height for a fall greater than 1 m. DEMO pin — fix waits for human approval.',
    position: { x: 28, y: 78 },
    demo: true,
  },
  {
    id: 'exit-travel',
    code: 'AUP H4 · NZBC C',
    title: 'Exit travel distance',
    summary:
      'Furthest habitable room exceeds the demonstrated travel path for this occupancy sketch. DEMO data — not a fire-engineering report.',
    position: { x: 38, y: 28 },
    demo: true,
  },
  {
    id: 'accessible-wc',
    code: 'NZBC G1 / NZS 4121',
    title: 'Accessible WC clearance',
    summary:
      'Turning circle reads short of 1500 mm in this DEMO plan. Arc drafts the note; a licensed person signs the fix.',
    position: { x: 78, y: 42 },
    demo: true,
  },
];

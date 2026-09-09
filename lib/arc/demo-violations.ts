/**
 * DEMO-only NZ code pins for the Arc agent-app preview.
 * Fictional layout. Not advice. Not a real consent check.
 */

export type ArcViolation = {
  id: string;
  code: string;
  title: string;
  summary: string;
  position: [number, number, number];
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
    position: [1.35, 1.15, 0.55],
    demo: true,
  },
  {
    id: 'guardrail',
    code: 'NZBC F4/AS1',
    title: 'Guardrail height',
    summary:
      'Deck edge sits below the 1000 mm barrier height for a fall greater than 1 m. DEMO pin — fix waits for human approval.',
    position: [-1.1, 1.55, 1.4],
    demo: true,
  },
  {
    id: 'exit-travel',
    code: 'AUP H4 · NZBC C',
    title: 'Exit travel distance',
    summary:
      'Furthest habitable room exceeds the demonstrated travel path for this occupancy sketch. DEMO data — not a fire-engineering report.',
    position: [0.2, 0.85, -1.35],
    demo: true,
  },
  {
    id: 'accessible-wc',
    code: 'NZBC G1 / NZS 4121',
    title: 'Accessible WC clearance',
    summary:
      'Turning circle reads short of 1500 mm in this DEMO plan. Arc drafts the note; a licensed person signs the fix.',
    position: [-1.25, 0.55, -0.2],
    demo: true,
  },
];

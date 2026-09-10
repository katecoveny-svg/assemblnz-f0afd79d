/**
 * DEMO-only NZTA / CCCFA flags for the Forge automotive craft preview.
 * Service bay board — not an architecture floor plate. Not advice.
 */

export type ForgeBayFlag = {
  id: string;
  code: string;
  title: string;
  summary: string;
  bay: string;
  demo: true;
};

export const FORGE_DEMO_FLAGS: ForgeBayFlag[] = [
  {
    id: 'wof-due',
    code: 'NZTA WoF',
    title: 'WoF due — bay 2',
    summary:
      'Light vehicle in bay 2 is past its WoF due stamp with no staged inspection. DEMO bay board — cite NZTA WoF rules before any booking change.',
    bay: 'Bay 2 · light vehicle',
    demo: true,
  },
  {
    id: 'cof-hold',
    code: 'NZTA CoF',
    title: 'CoF hold — bay 4',
    summary:
      'Heavy vehicle scheduled for a road test lacks a current CoF on this DEMO board. Forge drafts the hold note; a licensed person clears the bay.',
    bay: 'Bay 4 · heavy vehicle',
    demo: true,
  },
  {
    id: 'cccfa-disclosure',
    code: 'CCCFA',
    title: 'Finance disclosure incomplete',
    summary:
      'Responsible lending disclosure fields are incomplete on this DEMO finance lead. Draft waits for human approval — nothing sends to the customer.',
    bay: 'Sales desk · finance lead',
    demo: true,
  },
  {
    id: 'service-parts',
    code: 'NZTA WoF',
    title: 'Brake wear flag',
    summary:
      'Pad thickness on the DEMO inspection sheet sits below the workshop threshold. Parts pick stays staged until a person approves the quote.',
    bay: 'Bay 2 · parts pick',
    demo: true,
  },
];

/**
 * DEMO connected-journey stages for Forge automotive OS preview.
 * Research → sale → service → loyalty. Not a live dealership feed.
 */

export type ForgeLifecycleStage = {
  id: string;
  step: string;
  title: string;
  short: string;
  summary: string;
  pinCode: string;
  pinTitle: string;
  pinBody: string;
  desk: string;
  demo: true;
};

export const FORGE_LIFECYCLE: ForgeLifecycleStage[] = [
  {
    id: 'research',
    step: '01',
    title: 'Research / lead',
    short: 'Lead',
    summary:
      'First enquiry lands on the desk. Forge drafts a reply from DEMO stock notes and holds it for approval.',
    pinCode: 'Lead desk',
    pinTitle: 'SUV enquiry — reply staged',
    pinBody:
      'DEMO lead asks about a mid-size SUV and a trade-in. Draft reply confirms next steps and waits for a human yes before anything sends.',
    desk: 'Sales desk · inbound enquiry',
    demo: true,
  },
  {
    id: 'sale',
    step: '02',
    title: 'Sale',
    short: 'Sale',
    summary:
      'Finance and disclosure gaps surface before the handshake. CCCFA fields stay incomplete until a person clears them.',
    pinCode: 'CCCFA',
    pinTitle: 'Finance disclosure incomplete',
    pinBody:
      'Responsible lending disclosure is incomplete on this DEMO finance lead. Forge marks missing fields and stages the note — nothing lodges.',
    desk: 'Sales desk · finance lead',
    demo: true,
  },
  {
    id: 'service',
    step: '03',
    title: 'Service bay',
    short: 'Service',
    summary:
      'Workshop day stays honest. WoF and CoF flags cite NZTA rules on DEMO bay data before the schedule slips.',
    pinCode: 'NZTA WoF',
    pinTitle: 'WoF due — bay 2',
    pinBody:
      'Light vehicle in bay 2 is past its WoF due stamp with no staged inspection. Open the bay board below for the full DEMO flag set.',
    desk: 'Bay 2 · light vehicle',
    demo: true,
  },
  {
    id: 'loyalty',
    step: '04',
    title: 'Loyalty / repurchase',
    short: 'Loyalty',
    summary:
      'Service proof feeds the next sale. A repurchase note references the last bay visit and waits for approval.',
    pinCode: 'Loyalty',
    pinTitle: 'Repurchase note from last service',
    pinBody:
      'DEMO service history shows a recent visit and an upcoming WoF window. Proposed repurchase note cites that proof and holds for sign-off.',
    desk: 'Owner desk · next sale',
    demo: true,
  },
];

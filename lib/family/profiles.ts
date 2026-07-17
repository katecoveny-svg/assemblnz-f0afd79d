/**
 * The whānau — Kate's real family roster for Family OS. This is the default
 * profile set; the add/edit form writes extra 'person' rows into family_items
 * which merge on top. A demo-mode flag swaps to placeholder names for prospect
 * showings (nothing real leaves the workspace then).
 *
 * Homes & custody: Kate + Adrian have the kids week-on/week-off with Aaron. On
 * their week the family is in Kohimarama; on the off week Kate + Adrian are in
 * Wynyard Quarter. Custody parity is computed from a known reference Monday.
 */

export const DEMO_MODE_COOKIE = 'family_demo_mode';

export type Person = {
  id: string;
  name: string;
  mark: string;            // lowercase Cormorant letter used as the avatar
  role: string;
  kind: 'parent' | 'child' | 'co-parent' | 'pet';
  school?: string;
  year?: number;
  level?: string;          // NZ Curriculum level (homework grounding)
  home?: string;
  details: string[];       // the "file" — important things to remember
  medical?: string[];
  accent: string;
};

const CORAL = '#E08A6B';
const GOLD = '#b8964f';
const SAGE = '#7A8B6F';
const BLUE = '#6E93A6';
const PLUM = '#8E7BA6';

export const WHANAU: Person[] = [
  { id: 'kate', name: 'Kate', mark: 'k', role: 'Mum · founder, assembl', kind: 'parent', home: 'Kohimarama / Wynyard Quarter', accent: CORAL,
    details: ['Primary organiser of the whānau week', 'Works at assembl', 'Approves everything the agents draft'] },
  { id: 'adrian', name: 'Adrian', mark: 'a', role: 'Kate’s partner', kind: 'parent', home: 'Kohimarama / Wynyard Quarter', accent: GOLD,
    details: ['Lives with Kate and the kids on their week', 'Second pair of hands for pickups & logistics'] },
  { id: 'jack', name: 'Jack', mark: 'j', role: 'Year 9 · Sacred Heart College', kind: 'child', school: 'Sacred Heart College', year: 9, level: 'NZ Curriculum L5', home: 'Kohimarama (Kate’s week)', accent: BLUE,
    details: ['Sacred Heart College, Glendowie', 'Year 9 — junior secondary (NCEA/NZQA starts Year 11)', 'Homework help grounded to his year level'] },
  { id: 'mila', name: 'Mila', mark: 'm', role: 'Year 7 · Baradene College', kind: 'child', school: 'Baradene College', year: 7, level: 'NZ Curriculum L4', home: 'Kohimarama (Kate’s week)', accent: SAGE,
    details: ['Baradene College, Remuera', 'Year 7 — junior secondary', 'Nut allergy — always check labels (from the old memory; confirm)'] },
  { id: 'aaron', name: 'Aaron', mark: 'a', role: 'Kids’ dad · co-parent', kind: 'co-parent', accent: PLUM,
    details: ['Week-on/week-off care with Kate', 'Has the kids this week (from Tue 7 Jul)', 'Shares the calendar so both weeks line up'] },
  { id: 'franklin', name: 'Franklin', mark: 'f', role: 'The family dachshund 🐶', kind: 'pet', accent: GOLD,
    details: ['Dachshund', 'Comes to Kohi on the family’s week'],
    medical: ['Monthly Cytopoint injection (allergy/itch relief)', 'Last dose: Sat 4 Jul 2026', 'Next due: ~1 Aug 2026'] },
];

/** Placeholder roster for demo-mode (prospect showings). */
export const WHANAU_DEMO: Person[] = [
  { id: 'p1', name: 'Mum', mark: 'm', role: 'Parent · organiser', kind: 'parent', accent: CORAL, details: ['Runs the family week'] },
  { id: 'p2', name: 'Partner', mark: 'p', role: 'Second parent', kind: 'parent', accent: GOLD, details: ['Pickups & logistics'] },
  { id: 'p3', name: 'Tama', mark: 't', role: 'Year 9', kind: 'child', school: 'A local college', year: 9, level: 'NZ Curriculum L5', accent: BLUE, details: ['Junior secondary'] },
  { id: 'p4', name: 'Aria', mark: 'a', role: 'Year 7', kind: 'child', school: 'A local college', year: 7, level: 'NZ Curriculum L4', accent: SAGE, details: ['Junior secondary'] },
  { id: 'p5', name: 'Co-parent', mark: 'c', role: 'Shared care', kind: 'co-parent', accent: PLUM, details: ['Week-on/week-off'] },
  { id: 'p6', name: 'Dog', mark: 'd', role: 'The family dog', kind: 'pet', accent: GOLD, details: ['Monthly vet reminder'] },
];

/** Custody reference: the week of Mon 6 Jul 2026 is AARON's week (kids away
 *  from Kate). Even week-offset = Aaron, odd = Kate & Adrian. */
const REF_MONDAY = Date.UTC(2026, 6, 6); // 2026-07-06
const WEEK = 7 * 24 * 60 * 60 * 1000;

export type Custody = {
  withAaron: boolean;
  label: string;
  homeThisWeek: string;
  range: string;
};

function mondayOf(ts: number): number {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7; // Mon=0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

export function custodyThisWeek(now = Date.now()): Custody {
  const wk = mondayOf(now);
  const offset = Math.round((wk - REF_MONDAY) / WEEK);
  const withAaron = ((offset % 2) + 2) % 2 === 0;
  const start = new Date(wk);
  const end = new Date(wk + 6 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => `${d.getUTCDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]}`;
  return {
    withAaron,
    label: withAaron ? 'Kids with Aaron this week' : 'Kids home with Kate & Adrian',
    homeThisWeek: withAaron ? 'Kate & Adrian: Wynyard Quarter' : 'Home base: Kohimarama',
    range: `${fmt(start)}–${fmt(end)}`,
  };
}

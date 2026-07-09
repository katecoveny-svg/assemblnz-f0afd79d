/**
 * Morning brief — the daily improvement panel.
 *
 * Every morning the Living Site reads yesterday, notices one thing worth
 * fixing, does the work, and asks for Fred's yes. SAMPLE data only.
 */

import type { SurfaceId } from './genome';

export type BriefStat = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export type ImprovementKind =
  | 'page'
  | 'faq'
  | 'booking'
  | 'follow-up'
  | 'course'
  | 'revenue';

export type Improvement = {
  id: string;
  kind: ImprovementKind;
  title: string;
  noticed: string;
  done: string;
  surfaces: SurfaceId[];
  saves: string;
};

export const IMPROVEMENT_KIND_LABELS: Record<ImprovementKind, string> = {
  page: 'page rebuild',
  faq: 'faq gap',
  booking: 'booking gap',
  'follow-up': 'follow-up',
  course: 'course content',
  revenue: 'revenue',
};

export const MORNING_BRIEF = {
  greeting: 'Mōrena, Fred.',
  dateLine: 'Thursday · your Living Site worked overnight',
  yesterday: [
    { id: 'enquiries', label: 'enquiries', value: '5', note: 'all triaged, replies drafted' },
    { id: 'bookings', label: 'bookings', value: '2', note: 'deposits confirmed' },
    { id: 'revenue', label: 'revenue', value: '+$680', note: 'vs same day last week' },
    { id: 'review', label: 'review', value: '★ 5.0', note: 'Tank’s owner, Google' },
    { id: 'reach', label: 'reach', value: '+18%', note: 'thresholds reel, Instagram' },
    { id: 'admin', label: 'admin saved', value: '96m', note: 'notes, replies, follow-ups' },
  ] satisfies BriefStat[],
  noticed: {
    eyebrow: 'i noticed one thing',
    headline: 'Your Reactivity Rewired page converts 17% worse than your other programmes.',
    evidence:
      'Visitors read the price, then leave before the method section. The pages that convert lead with the outcome and a real dog’s story.',
    rebuild: {
      before: [
        'Price block first, method buried below the fold',
        'No dog story — generic programme copy',
        'FAQ link instead of answers on the page',
      ],
      after: [
        'Bruno’s week-2 win leads the page: “looked back at 12 m from a scooter”',
        'Threshold explainer video inline (0:48)',
        'Price framed after the outcome, next to the fit quiz',
      ],
    },
    surfaces: ['website', 'faq', 'voice', 'email'] satisfies SurfaceId[],
    approvedNote: 'Live on your site. FAQ, agent answers, and enquiry drafts updated to match.',
  },
  queue: [
    {
      id: 'imp-nova',
      kind: 'follow-up',
      title: 'Nova’s reply is ready to send',
      noticed: 'Quiz lead from Mt Eden, 14 hours old — hot leads go cold after 24.',
      done: 'Reply drafted (Reactivity Rewired + thresholds video), assessment slot held.',
      surfaces: ['email', 'crm', 'booking'],
      saves: '20m',
    },
    {
      id: 'imp-saturday',
      kind: 'booking',
      title: 'Saturday 9–11am keeps sitting empty',
      noticed: 'Third week running with no field bookings before the bootcamp trial.',
      done: 'Waitlist email drafted offering the slot to 4 recall-fit owners.',
      surfaces: ['booking', 'email', 'crm'],
      saves: '~$598 recovered',
    },
    {
      id: 'imp-muzzle',
      kind: 'faq',
      title: 'Same muzzle question, four times this month',
      noticed: 'Support inbox keeps asking “is a muzzle a punishment?”',
      done: 'Answer drafted for the genome — website, agent, and support all learn it.',
      surfaces: ['faq', 'website', 'voice', 'support'],
      saves: '55m/mo',
    },
    {
      id: 'imp-course',
      kind: 'course',
      title: 'Reactivity module gap matches your busiest questions',
      noticed: '“Distance, timing, recovery” has 0 lessons but the most support traffic.',
      done: 'Lesson outline + Google Vids script drafted from Bruno’s session notes.',
      surfaces: ['course', 'support', 'website'],
      saves: '70m/wk',
    },
    {
      id: 'imp-diesel',
      kind: 'revenue',
      title: 'Diesel graduates Friday — top-up moment',
      noticed: 'Nirtika already asked about the advanced recall top-up.',
      done: 'Congrats + top-up offer drafted, timed for after the handover pack.',
      surfaces: ['email', 'crm', 'proposals'],
      saves: 'warm upsell',
    },
  ] satisfies Improvement[],
  promise: 'One improvement a day, done before you wake up. Nothing ships without your yes.',
};

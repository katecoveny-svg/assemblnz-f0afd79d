/**
 * The guided builder's pick-and-mix catalogue. Every option maps to one
 * visible part in the 3D scene, one plain-language line, and one URL
 * token — so a finished build is a shareable link.
 */

export type BuilderStepId = 'job' | 'knowledge' | 'abilities' | 'apps' | 'safety' | 'done';

export interface BuilderOption {
  id: string;
  label: string;
  /** One plain line — what this actually means for the owner. */
  means: string;
}

export interface BuilderStep {
  id: BuilderStepId;
  title: string;
  lead: string;
  /** 'one' = radio, 'many' = checkboxes. */
  pick: 'one' | 'many';
  options: BuilderOption[];
}

export const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 'job',
    title: 'What job does your agent do?',
    lead: 'One agent, one job. Pick the job and everything else follows.',
    pick: 'one',
    options: [
      { id: 'comms',    label: 'Answer customers',   means: 'Reads enquiries and drafts replies in your voice.' },
      { id: 'bookings', label: 'Handle bookings',    means: 'Takes booking requests and offers times that work.' },
      { id: 'invoices', label: 'Chase invoices',     means: 'Follows up unpaid invoices politely and on schedule.' },
      { id: 'research', label: 'Research + summarise', means: 'Reads sources and gives you the short version.' },
      { id: 'social',   label: 'Draft social posts', means: 'Turns your week into posts you approve before they go out.' },
      { id: 'quotes',   label: 'Prepare quotes',     means: 'Turns a job brief into a priced draft from your rates.' },
      { id: 'triage',   label: 'Triage + route',     means: 'Sorts what comes in by urgency and sends it the right way.' },
      { id: 'onboard',  label: 'Onboard new clients', means: 'Collects what you need from a new client, in order.' },
      { id: 'reports',  label: 'Write the weekly update', means: 'Pulls the week together into a draft you sign off.' },
    ],
  },
  {
    id: 'knowledge',
    title: 'What should it know?',
    lead: 'Each source is a glass cube — the agent answers from these, not from thin air.',
    pick: 'many',
    options: [
      { id: 'website',  label: 'Your website',      means: 'Everything already public about your business.' },
      { id: 'faq',      label: 'Customer FAQ',      means: 'The questions you answer every week.' },
      { id: 'policies', label: 'Policies + terms',  means: 'Refunds, cancellations, the fine print.' },
      { id: 'prices',   label: 'Price list',        means: 'So it never invents a price.' },
      { id: 'drive',    label: 'A Google Drive folder', means: 'Documents you drop in stay current.' },
      { id: 'past-jobs', label: 'Past jobs + notes', means: 'How you handled the work before.' },
      { id: 'inbox',    label: 'Your inbox history', means: 'How you actually reply, in your own words.' },
      { id: 'brand',    label: 'Brand + tone guide', means: 'So it sounds like you, not a robot.' },
      { id: 'calendar', label: 'Your calendar',     means: 'What you’re booked for and when you’re free.' },
    ],
  },
  {
    id: 'abilities',
    title: 'What can it do?',
    lead: 'Each ability is a chrome capsule. Doing is different from knowing.',
    pick: 'many',
    options: [
      { id: 'draft',    label: 'Draft replies',       means: 'Writes the reply — never sends on its own.' },
      { id: 'send',     label: 'Send email',          means: 'Delivers a reply after you approve it.' },
      { id: 'calendar', label: 'Book calendar events', means: 'Puts confirmed bookings on your calendar.' },
      { id: 'research', label: 'Research',            means: 'Looks things up and cites where answers came from.' },
      { id: 'document', label: 'Create documents',    means: 'Drafts quotes and summaries from a brief.' },
      { id: 'summarise', label: 'Summarise',          means: 'Turns a long thread or file into the short version.' },
      { id: 'schedule', label: 'Offer times',         means: 'Suggests slots that fit your real availability.' },
      { id: 'follow',   label: 'Follow up',           means: 'Chases the reply you’re still waiting on.' },
      { id: 'flag',     label: 'Flag risks',          means: 'Marks anything unusual for you to look at.' },
    ],
  },
  {
    id: 'apps',
    title: 'Which apps does it work in?',
    lead: 'Connected apps are where the work actually happens.',
    pick: 'many',
    options: [
      { id: 'gmail',    label: 'Gmail',           means: 'Reads and sends from your business inbox.' },
      { id: 'calendar', label: 'Google Calendar', means: 'Sees availability, adds events.' },
      { id: 'drive',    label: 'Google Drive',    means: 'Reads and files documents.' },
      { id: 'xero',     label: 'Xero',            means: 'Sees invoices and payment status.' },
      { id: 'hubspot',  label: 'HubSpot',         means: 'Keeps customer records current.' },
      { id: 'outlook',  label: 'Outlook',         means: 'Reads and sends from a Microsoft inbox.' },
      { id: 'myob',     label: 'MYOB',            means: 'Sees invoices and payments the NZ way.' },
      { id: 'whatsapp', label: 'WhatsApp',        means: 'Drafts replies to customer messages.' },
      { id: 'sheets',   label: 'Google Sheets',   means: 'Reads and updates a working spreadsheet.' },
    ],
  },
  {
    id: 'safety',
    title: 'Where do you stay in charge?',
    lead: 'The part that matters most. Nothing leaves without you.',
    pick: 'many',
    options: [
      { id: 'approve-send', label: 'Approve every send',    means: 'You see every message before it goes.' },
      { id: 'privacy',      label: 'Privacy boundary',      means: 'Never mentions one customer to another.' },
      { id: 'money',        label: 'Money boundary',        means: 'Never quotes a price outside your list.' },
      { id: 'escalate',     label: 'Escalate the hard ones', means: 'Upset customer or unclear answer → straight to you.' },
      { id: 'cite',         label: 'Always show its working', means: 'Every answer points to where it came from.' },
      { id: 'log',          label: 'Log every action',      means: 'A record of what it did, so you can check.' },
      { id: 'quiet-hours',  label: 'Respect quiet hours',   means: 'Nothing goes out overnight or on weekends.' },
    ],
  },
];

export const JOB_LABEL: Record<string, string> = Object.fromEntries(
  BUILDER_STEPS[0].options.map((o) => [o.id, o.label]),
);

export interface BuilderPicks {
  job: string | null;
  knowledge: string[];
  abilities: string[];
  apps: string[];
  safety: string[];
  name: string;
}

export const EMPTY_PICKS: BuilderPicks = {
  job: null,
  knowledge: [],
  abilities: [],
  apps: [],
  safety: [],
  name: '',
};

/** Encode picks into URL params — the share link IS the build. */
export function picksToSearch(picks: BuilderPicks): URLSearchParams {
  const s = new URLSearchParams();
  if (picks.job) s.set('job', picks.job);
  if (picks.knowledge.length) s.set('kn', picks.knowledge.join('.'));
  if (picks.abilities.length) s.set('ab', picks.abilities.join('.'));
  if (picks.apps.length) s.set('apps', picks.apps.join('.'));
  if (picks.safety.length) s.set('safe', picks.safety.join('.'));
  if (picks.name.trim()) s.set('name', picks.name.trim());
  return s;
}

export function picksFromSearch(sp: URLSearchParams | null): BuilderPicks {
  if (!sp) return { ...EMPTY_PICKS };
  const list = (k: string) => (sp.get(k)?.split('.').filter(Boolean) ?? []);
  return {
    job: sp.get('job'),
    knowledge: list('kn'),
    abilities: list('ab'),
    apps: list('apps'),
    safety: list('safe'),
    name: sp.get('name') ?? '',
  };
}

/** Plain-language summary — the demystifying payoff at the end. */
export function summarise(picks: BuilderPicks): { knows: string[]; does: string[]; asks: string[] } {
  const find = (stepId: BuilderStepId, ids: string[]) => {
    const step = BUILDER_STEPS.find((s) => s.id === stepId);
    return ids
      .map((id) => step?.options.find((o) => o.id === id))
      .filter((o): o is BuilderOption => Boolean(o));
  };
  return {
    knows: find('knowledge', picks.knowledge).map((o) => o.means),
    does: find('abilities', picks.abilities).map((o) => o.means),
    asks: find('safety', picks.safety).map((o) => o.means),
  };
}

import type { MeetingEnhanceResult } from './types';

/**
 * Deterministic Granola-class sandbox notes for agent dry-runs.
 * Owners/dates only when clearly present in the fixture transcript patterns.
 */
export function sandboxMeetingEnhance(input: {
  transcript: string;
  title?: string;
}): MeetingEnhanceResult {
  const text = input.transcript.trim();
  const lower = text.toLowerCase();

  // Lightweight cue extraction for sandbox realism (not a live model).
  const hasBudget = /budget|invoice|quote|\$\d/.test(lower);
  const hasLaunch = /launch|ship|release|go-live|golive/.test(lower);
  const ownerMatch = text.match(/\b([A-Z][a-z]+)\s+will\b/);
  const owner = ownerMatch?.[1] ?? null;
  const dueMatch = text.match(/\b(by|before)\s+([A-Za-z]+\s+\d{1,2}|\d{1,2}\s+[A-Za-z]+|\d{4}-\d{2}-\d{2})\b/i);
  const due = dueMatch ? dueMatch[2] : null;

  const decisions = [
    ...(hasLaunch
      ? [{ text: 'Proceed toward the stated launch / ship window (as discussed).' }]
      : [{ text: 'Continue with the plan outlined in the transcript.' }]),
    ...(hasBudget
      ? [{ text: 'Budget / commercial numbers mentioned are to be confirmed by a human before commit.' }]
      : []),
  ];

  const actions = [
    {
      text: 'Circulate structured notes to attendees for correction.',
      owner: owner,
      due: null,
    },
    {
      text: hasLaunch
        ? 'Confirm launch checklist owners and blockers.'
        : 'Capture open questions and assign owners in the follow-up.',
      owner: owner,
      due,
    },
  ];

  const followUps = [
    {
      text: 'Send a short follow-up email with decisions and actions for review (do not send automatically).',
      owner: null,
    },
  ];

  const openQuestions = [
    ...(owner ? [] : ['Action owners were not clearly named for every item.']),
    ...(due ? [] : ['Several items lack explicit due dates in the source.']),
    'Anything marked draft must be human-reviewed before external send.',
  ];

  const summary =
    text.length < 280
      ? text
      : `${text.slice(0, 277).trim()}…`;

  const sections = [
    { heading: 'Meeting notes', body: summary },
    {
      heading: 'Decisions / outcomes',
      body: decisions.map((d) => `• ${d.text}`).join('\n'),
    },
    {
      heading: 'Action items',
      body: actions
        .map(
          (a) =>
            `• ${a.text} · Owner: ${a.owner ?? 'not stated'} · Due: ${a.due ?? 'not stated'}`,
        )
        .join('\n'),
    },
    {
      heading: 'Open questions',
      body: openQuestions.map((q) => `• ${q}`).join('\n'),
    },
    {
      heading: 'Suggested specialist DO',
      body: '• Draft only — Meeting DO review handoff (not assigned).',
    },
    {
      heading: 'Follow-up email draft',
      body: [
        'Subject: Notes for review — please correct owners and dates',
        '',
        'Kia ora,',
        '',
        'Draft notes from our discussion are ready for your review. Please correct owners and dates before anything is sent externally.',
        '',
        'Ngā mihi',
      ].join('\n'),
    },
  ];

  return {
    status: 'ok',
    title: input.title?.trim() || 'Sandbox meeting notes',
    summary,
    decisions,
    actions,
    followUps,
    openQuestions,
    sections,
    adapters: { smartNotes: 'sandbox' },
    sandbox: true,
    draftsOnly: true,
    gaps: [
      'Sandbox enhancer — heuristic structure only, not a live model pass.',
      'Drafts only: nothing was emailed, assigned, or filed externally.',
    ],
  };
}

/**
 * Meeting DO — Granola-inspired smart notes helpers.
 * Pipeline: Capture → Whisper-class STT → agent notes → review (drafts only).
 */

export const MEETING_SMART_NOTES_HEADINGS = [
  'Meeting notes',
  'Decisions / outcomes',
  'Action items',
  'Open questions',
  'Suggested specialist DO',
  'Follow-up email draft',
] as const;

export type MeetingSmartNotesHeading = (typeof MEETING_SMART_NOTES_HEADINGS)[number];

export type MeetingSmartNotesSection = {
  heading: string;
  body: string;
};

const HEADING_PATTERN = new RegExp(
  `^(${MEETING_SMART_NOTES_HEADINGS.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
  'i',
);

/** Split a smart-notes draft into labelled sections for the review surface. */
export function parseMeetingSmartNotes(text: string): MeetingSmartNotesSection[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const sections: MeetingSmartNotesSection[] = [];
  let current: MeetingSmartNotesSection | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (HEADING_PATTERN.test(trimmed)) {
      if (current) sections.push({ ...current, body: current.body.trim() });
      const canonical =
        MEETING_SMART_NOTES_HEADINGS.find((h) => h.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
      current = { heading: canonical, body: '' };
      continue;
    }
    if (!current) {
      current = { heading: 'Meeting notes', body: line };
      continue;
    }
    current.body = current.body ? `${current.body}\n${line}` : line;
  }

  if (current) sections.push({ ...current, body: current.body.trim() });
  return sections.filter((s) => s.heading || s.body);
}

export const MEETING_SMART_NOTES_BRIEF =
  'Produce Granola-style smart meeting notes from this transcript. Keep owners and dates only when stated. Drafts only — never send.';

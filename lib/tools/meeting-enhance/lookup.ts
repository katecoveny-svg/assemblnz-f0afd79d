import {
  MEETING_SMART_NOTES_BRIEF,
  parseMeetingSmartNotes,
} from '@/apps/do/shared/meeting-smart-notes';

import { ToolHttpError } from '../errors';
import { sandboxMeetingEnhance } from './fixtures';
import type { MeetingEnhanceInput, MeetingEnhanceResult } from './types';

const MAX_TRANSCRIPT = 100_000;
const MIN_TRANSCRIPT = 40;

export function parseMeetingEnhanceInput(body: unknown): MeetingEnhanceInput {
  if (!body || typeof body !== 'object') {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: 'Body must be a JSON object with `transcript`.',
      fix: 'POST { "transcript": "<meeting text>", "title": "optional" }.',
    });
  }
  const record = body as Record<string, unknown>;
  const transcript = record.transcript;
  if (typeof transcript !== 'string' || !transcript.trim()) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`transcript` must be a non-empty string.',
      fix: 'Paste the meeting transcript or notes into `transcript`.',
    });
  }
  if (transcript.trim().length < MIN_TRANSCRIPT) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: `\`transcript\` is too short (min ${MIN_TRANSCRIPT} characters).`,
      fix: 'Provide more of the meeting source text so structured notes are meaningful.',
    });
  }
  if (transcript.length > MAX_TRANSCRIPT) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: `\`transcript\` is too long (max ${MAX_TRANSCRIPT} characters).`,
      fix: 'Trim the transcript or split across multiple calls.',
    });
  }
  const title =
    typeof record.title === 'string' && record.title.trim()
      ? record.title.trim().slice(0, 160)
      : undefined;
  return { transcript: transcript.trim(), title };
}

function structureFromModelText(
  text: string,
  title: string | undefined,
): MeetingEnhanceResult {
  const sections = parseMeetingSmartNotes(text).map((s) => ({
    heading: s.heading,
    body: s.body,
  }));

  const decisionsBody =
    sections.find((s) => /decision/i.test(s.heading))?.body ?? '';
  const actionsBody =
    sections.find((s) => /action/i.test(s.heading))?.body ?? '';
  const questionsBody =
    sections.find((s) => /open question/i.test(s.heading))?.body ?? '';
  const notesBody =
    sections.find((s) => /meeting notes/i.test(s.heading))?.body ?? text;

  const bulletLines = (body: string) =>
    body
      .split('\n')
      .map((l) => l.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);

  const decisions = bulletLines(decisionsBody)
    .filter((l) => !/^none stated/i.test(l))
    .map((t) => ({ text: t }));

  const actions = bulletLines(actionsBody)
    .filter((l) => !/^none stated/i.test(l))
    .map((line) => {
      const ownerMatch = line.match(/Owner:\s*([^·•|-]+)/i);
      const dueMatch = line.match(/Due:\s*([^·•|-]+)/i);
      const textOnly = line
        .replace(/\s*[·|•-]\s*Owner:.*$/i, '')
        .replace(/\s*[·|•-]\s*Due:.*$/i, '')
        .trim();
      const ownerRaw = ownerMatch?.[1]?.trim() ?? null;
      const dueRaw = dueMatch?.[1]?.trim() ?? null;
      const owner =
        ownerRaw && !/not stated/i.test(ownerRaw) ? ownerRaw : null;
      const due = dueRaw && !/not stated/i.test(dueRaw) ? dueRaw : null;
      return { text: textOnly, owner, due };
    });

  const openQuestions = bulletLines(questionsBody).filter(
    (l) => !/^none stated/i.test(l),
  );

  return {
    status: decisions.length || actions.length ? 'ok' : 'partial',
    title: title ?? 'Meeting notes',
    summary: notesBody.slice(0, 1200),
    decisions,
    actions,
    followUps: [
      {
        text: 'Human review required before any send or assignment.',
        owner: null,
      },
    ],
    openQuestions,
    sections:
      sections.length > 0
        ? sections
        : [{ heading: 'Meeting notes', body: text }],
    adapters: { smartNotes: 'live' },
    sandbox: false,
    draftsOnly: true,
    gaps: [
      'Live model pass via DO meeting-notes preparation. Drafts only — nothing was sent.',
      MEETING_SMART_NOTES_BRIEF,
    ],
  };
}

/**
 * Sandbox: deterministic fixtures.
 * Live: reuse DO meeting-notes preparation when a model ladder is configured.
 */
export async function runMeetingEnhance(
  input: MeetingEnhanceInput,
  opts: { sandbox: boolean },
): Promise<MeetingEnhanceResult> {
  if (opts.sandbox) {
    return sandboxMeetingEnhance(input);
  }

  try {
    const { getDoAvailability, prepareDoDraft } = await import(
      '@/apps/do/shared/preparation-server'
    );

    const availability = getDoAvailability();
    if (availability.preparation !== 'configured') {
      throw new ToolHttpError({
        status: 503,
        code: 'upstream_unconfigured',
        message:
          'Live meeting-enhance needs a configured DO preparation model ladder.',
        fix: 'Use a test_ sandbox key for deterministic notes, or configure assembl model credentials used by DO preparation. Meeting DO UI remains at /do/meetings.',
        details: { adapters: { smartNotes: 'unavailable' } },
      });
    }

    const draft = await prepareDoDraft({
      task: 'meeting-notes',
      brief: MEETING_SMART_NOTES_BRIEF,
      source: input.transcript,
      sourceTitle: input.title ?? 'Agent transcript',
      sourceUrl: '',
      consent: true,
    });

    return structureFromModelText(draft.text, input.title);
  } catch (err) {
    if (err instanceof ToolHttpError) throw err;
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'runtime_unavailable'
    ) {
      throw new ToolHttpError({
        status: 503,
        code: 'upstream_unconfigured',
        message: 'DO preparation runtime unavailable for live meeting-enhance.',
        fix: 'Use a test_ key for sandbox notes, or configure model credentials. Complements Meeting DO — does not replace it.',
      });
    }
    throw new ToolHttpError({
      status: 502,
      code: 'upstream_failure',
      message:
        err instanceof Error
          ? err.message
          : 'Live meeting-enhance preparation failed.',
      fix: 'Retry once with a test_ sandbox key, or try again when the preparation ladder is healthy.',
    });
  }
}

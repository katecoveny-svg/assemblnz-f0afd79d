/**
 * capture_consent — classify and log the caller's reply to the recording
 * notice. Ambiguous replies are NEVER treated as consent: the agent re-asks
 * (a clarification turn) and only records once it hears a clear yes.
 *
 * `classifyConsent` is pure and is the single source of truth the unit tests
 * and the live tool share. `captureConsent` persists the verbatim exchange to
 * consent_log (IPP 3).
 */
import type { ConsentVerdict, ConsentMethod } from '@/lib/voice/types';
import { insertConsent } from '@/lib/voice/clients/supabase';

// Affirmative idioms that happen to contain "no" (NZ/colloquial). Checked
// first so they aren't mistaken for a negation.
const YES_IDIOMS = ['no worries', 'no probs', 'no problem', 'no worries at all'];

const YES = [
  'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'all good', 'thats fine',
  'go ahead', 'fine', 'of course', 'sweet', 'ae', 'āe', 'kei te pai',
  'go for it', 'thats okay', 'absolutely', 'thats all good',
];
const NO = [
  'no', 'nah', 'nope', 'dont', 'do not', 'rather not', 'no thanks',
  'no thank you', 'kao', 'kāo', 'please dont', 'not okay', 'not ok',
  'i object', 'stop recording', 'id rather not', 'wouldnt',
];

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’']/g, '') // fold apostrophes so "don't" == "dont"
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classify a free-text consent reply. A reply that contains BOTH a yes and a
 * no signal (e.g. "yeah but no recording") is treated as ambiguous, not yes.
 */
export function classifyConsent(reply: string): ConsentVerdict {
  const n = ` ${normalise(reply)} `;
  if (YES_IDIOMS.some((y) => n.includes(` ${y} `))) return 'granted';
  const hasYes = YES.some((y) => n.includes(` ${y} `));
  const hasNo = NO.some((x) => n.includes(` ${x} `));
  if (hasYes && !hasNo) return 'granted';
  if (hasNo && !hasYes) return 'declined';
  return 'ambiguous';
}

export interface CaptureConsentInput {
  call_sid: string;
  prompt_text: string;
  verbatim_response: string;
  captured_method?: ConsentMethod;
}

export interface CaptureConsentResult {
  verdict: ConsentVerdict;
  /** Only true when verdict === 'granted'. Drives whether recording proceeds. */
  consent_granted: boolean;
  /** True when the agent should re-ask rather than proceed. */
  needs_clarification: boolean;
}

export async function captureConsent(
  input: CaptureConsentInput,
): Promise<CaptureConsentResult> {
  const verdict = classifyConsent(input.verbatim_response);

  // Ambiguous → do NOT write a consent record; signal a clarification turn.
  if (verdict === 'ambiguous') {
    return { verdict, consent_granted: false, needs_clarification: true };
  }

  const consent_granted = verdict === 'granted';
  await insertConsent({
    call_sid: input.call_sid,
    prompt_text: input.prompt_text,
    response_text: input.verbatim_response,
    consent_granted,
    captured_method: input.captured_method ?? 'speech',
  });
  return { verdict, consent_granted, needs_clarification: false };
}

/**
 * DO Clear — local grammar + anti-AI-slop heuristics (v0).
 * DEMO honesty: not Grammarly parity. Optional stub rewrite only.
 * Patterns align with assembl no-ai-slop / copy standard.
 */

export type ClearIssueKind = 'grammar' | 'slop';

export interface ClearIssue {
  id: string;
  kind: ClearIssueKind;
  /** Matched surface text. */
  match: string;
  /** Start index in the scanned string. */
  start: number;
  end: number;
  /** Why it was flagged (plain English). */
  reason: string;
  /** Suggested plain rewrite. */
  suggestion: string;
}

/** Assembl no-ai-slop gate — customer-facing banned / AI-filler phrases. */
export const AI_SLOP_PATTERNS: Array<{ pattern: RegExp; reason: string; suggestion: string }> = [
  { pattern: /\bunlock(s|ed|ing)?\b/gi, reason: 'Hype verb — say what actually opens.', suggestion: 'open / make available' },
  { pattern: /\bunleash(es|ed|ing)?\b/gi, reason: 'Hype verb — cut it.', suggestion: 'release / start' },
  { pattern: /\brevolutionis[ee](s|d|ing)?\b/gi, reason: 'Hype verb — banned in assembl copy.', suggestion: 'change / rebuild' },
  { pattern: /\bseamless(ly)?\b/gi, reason: 'Empty marketing adjective.', suggestion: 'without extra steps' },
  { pattern: /\beffortless(ly)?\b/gi, reason: 'Empty marketing adjective.', suggestion: 'with less admin' },
  { pattern: /\bfrictionless\b/gi, reason: 'Empty marketing adjective.', suggestion: 'with fewer handoffs' },
  { pattern: /\bempower(s|ed|ing)?\b/gi, reason: 'Hype verb — banned.', suggestion: 'help / let' },
  { pattern: /\belevate(s|d|ing)?\b/gi, reason: 'Hype verb — banned.', suggestion: 'raise / improve' },
  { pattern: /\bsupercharge(s|d|ing)?\b/gi, reason: 'Hype verb — banned.', suggestion: 'speed up / strengthen' },
  { pattern: /\bleverage(s|d|ing)?\b/gi, reason: 'Corporate filler — use a concrete verb.', suggestion: 'use / apply' },
  { pattern: /\bdelve(s|d|ing)?\b/gi, reason: 'AI-slop filler.', suggestion: 'look into / examine' },
  { pattern: /\brobust\b/gi, reason: 'Vague adjective — say what holds.', suggestion: 'reliable / durable' },
  { pattern: /\bAI[- ]powered\b/gi, reason: 'Bare “AI” hype — name the function.', suggestion: 'automated / agent-assisted' },
  { pattern: /\bnext[- ]generation\b/gi, reason: 'Empty future-hype.', suggestion: 'current / updated' },
  { pattern: /\bcutting[- ]edge\b/gi, reason: 'Empty future-hype.', suggestion: 'current' },
  { pattern: /\bgame[- ]chang(er|ing)\b/gi, reason: 'Empty hype.', suggestion: 'useful change' },
  { pattern: /\blandscape\b/gi, reason: 'Vague abstract noun — name the thing.', suggestion: 'market / setup / system' },
  { pattern: /\bin today'?s fast[- ]paced (world|environment)\b/gi, reason: 'Classic AI opener — delete.', suggestion: '' },
  { pattern: /\bharness the power\b/gi, reason: 'Classic AI filler — delete.', suggestion: 'use' },
  { pattern: /\btake (your|the) .+ to the next level\b/gi, reason: 'Classic AI filler — delete.', suggestion: 'improve' },
  { pattern: /\bquietly\b/gi, reason: 'Banned assembl marketing word.', suggestion: '' },
  { pattern: /\breimagine(s|d|ing)?\b/gi, reason: 'Hype verb — banned.', suggestion: 'redesign / rethink' },
  { pattern: /\btransform(s|ed|ing|ative)?\b/gi, reason: 'Hype verb unless a precise fact needs it.', suggestion: 'change / rebuild' },
  { pattern: /\btapestry\b/gi, reason: 'AI-slop metaphor.', suggestion: 'mix / set' },
  { pattern: /\bnestled\b/gi, reason: 'AI-slop travel-brochure filler.', suggestion: 'set / located' },
  { pattern: /\bit'?s important to note that\b/gi, reason: 'Padding — state the fact.', suggestion: '' },
  { pattern: /\bin conclusion,?\b/gi, reason: 'Padding — just conclude.', suggestion: '' },
  { pattern: /\bleverage synerg(?:y|ies)\b/gi, reason: 'Corporate nonsense.', suggestion: 'work together' },
];

/** Light local grammar heuristics (v0 — not a full grammar engine). */
export const GRAMMAR_PATTERNS: Array<{ pattern: RegExp; reason: string; suggestion: (m: string) => string }> = [
  {
    pattern: /\b(teh)\b/gi,
    reason: 'Likely typo.',
    suggestion: () => 'the',
  },
  {
    pattern: /\brecieve(d|s|ing)?\b/gi,
    reason: 'Spelling — “receive”.',
    suggestion: (m) => m.replace(/recieve/i, 'receive').replace(/Recieve/, 'Receive'),
  },
  {
    pattern: /\bseperate(d|ly|s)?\b/gi,
    reason: 'Spelling — “separate”.',
    suggestion: (m) => m.replace(/seperate/i, 'separate').replace(/Seperate/, 'Separate'),
  },
  {
    pattern: /\boccured\b/gi,
    reason: 'Spelling — “occurred”.',
    suggestion: () => 'occurred',
  },
  {
    pattern: /\boccurence\b/gi,
    reason: 'Spelling — “occurrence”.',
    suggestion: () => 'occurrence',
  },
  {
    pattern: /\bdefinately\b/gi,
    reason: 'Spelling — “definitely”.',
    suggestion: () => 'definitely',
  },
  {
    pattern: /\balot\b/gi,
    reason: 'Should be two words.',
    suggestion: () => 'a lot',
  },
  {
    pattern: /\b(could of|would of|should of)\b/gi,
    reason: 'Grammar — use “have”, not “of”.',
    suggestion: (m) => m.replace(/\sof$/i, ' have'),
  },
  {
    pattern: /\bits (important|clear|time|worth)\b/gi,
    reason: 'Possible missing apostrophe — “it’s”.',
    suggestion: (m) => m.replace(/^its/i, 'it’s'),
  },
  {
    pattern: /\s{2,}/g,
    reason: 'Extra spaces.',
    suggestion: () => ' ',
  },
  {
    pattern: /\butilis(e|es|ed|ing)\b/gi,
    reason: 'NZ plain English prefers “use”.',
    suggestion: (m) => m.replace(/utilise/i, 'use').replace(/Utilise/, 'Use'),
  },
];

function pushIssue(
  issues: ClearIssue[],
  kind: ClearIssueKind,
  match: string,
  start: number,
  reason: string,
  suggestion: string,
) {
  issues.push({
    id: `${kind}-${start}-${match.slice(0, 12)}`,
    kind,
    match,
    start,
    end: start + match.length,
    reason,
    suggestion,
  });
}

export function scanClearWriting(text: string): ClearIssue[] {
  if (!text || !text.trim()) return [];
  const issues: ClearIssue[] = [];

  for (const rule of AI_SLOP_PATTERNS) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      pushIssue(issues, 'slop', m[0], m.index, rule.reason, rule.suggestion);
    }
  }

  for (const rule of GRAMMAR_PATTERNS) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      pushIssue(issues, 'grammar', m[0], m.index, rule.reason, rule.suggestion(m[0]));
    }
  }

  // Prefer earlier issues; de-dupe overlapping starts.
  issues.sort((a, b) => a.start - b.start || b.end - a.end);
  const deduped: ClearIssue[] = [];
  let lastEnd = -1;
  for (const issue of issues) {
    if (issue.start < lastEnd) continue;
    deduped.push(issue);
    lastEnd = issue.end;
  }
  return deduped;
}

/** Apply first-pass suggestions left-to-right (DEMO rewrite stub). */
export function applyClearSuggestions(text: string, issues: ClearIssue[] = scanClearWriting(text)): {
  rewritten: string;
  applied: number;
  honesty: string;
} {
  if (!issues.length) {
    return {
      rewritten: text,
      applied: 0,
      honesty: 'DEMO · no issues found by local heuristics. Not Grammarly parity.',
    };
  }
  let out = text;
  // Apply from end so indices stay valid.
  const ordered = [...issues].sort((a, b) => b.start - a.start);
  let applied = 0;
  for (const issue of ordered) {
    const before = out.slice(0, issue.start);
    const after = out.slice(issue.end);
    out = `${before}${issue.suggestion}${after}`;
    applied += 1;
  }
  return {
    rewritten: out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').trim(),
    applied,
    honesty:
      'DEMO · local heuristics + stub rewrite only. Not a full grammar engine; no model call made.',
  };
}

export const CLEAR_HONESTY =
  'DEMO · DO Clear uses local heuristics (grammar basics + assembl no-ai-slop). Optional stub rewrite — not Grammarly parity.';

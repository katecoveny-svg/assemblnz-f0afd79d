/**
 * DO Clear — deterministic rewrite heuristics (client + server safe).
 * No model keys required; Assembl-hosted runtime may refine further.
 */

export type ClearMark = {
  id: string;
  start: number;
  end: number;
  kind: 'clarity' | 'tighten' | 'passive';
  suggestion: string;
};

export type ClearHeuristicResult = {
  original: string;
  rewritten: string;
  marks: ClearMark[];
};

/** Deterministic Clear marks — always available in DEMO. */
export function clearHeuristics(text: string): ClearHeuristicResult {
  const marks: ClearMark[] = [];
  let rewritten = text;

  const patterns: Array<{
    re: RegExp;
    kind: ClearMark['kind'];
    suggestion: string;
    replace?: string;
  }> = [
    {
      re: /\bin order to\b/gi,
      kind: 'tighten',
      suggestion: 'to',
      replace: 'to',
    },
    {
      re: /\bat this point in time\b/gi,
      kind: 'tighten',
      suggestion: 'now',
      replace: 'now',
    },
    {
      re: /\bdue to the fact that\b/gi,
      kind: 'tighten',
      suggestion: 'because',
      replace: 'because',
    },
    {
      re: /\bit is (important|critical|essential) (to|that)\b/gi,
      kind: 'clarity',
      suggestion: 'Lead with the action',
    },
    {
      re: /\b(was|were|is|are|been) (being )?(made|done|sent|submitted|prepared)\b/gi,
      kind: 'passive',
      suggestion: 'Prefer active voice',
    },
  ];

  for (const p of patterns) {
    let match: RegExpExecArray | null;
    const re = new RegExp(p.re.source, p.re.flags.includes('g') ? p.re.flags : `${p.re.flags}g`);
    while ((match = re.exec(text)) !== null) {
      marks.push({
        id: `m-${marks.length}-${match.index}`,
        start: match.index,
        end: match.index + match[0].length,
        kind: p.kind,
        suggestion: p.suggestion,
      });
    }
    if (p.replace) {
      rewritten = rewritten.replace(p.re, p.replace);
    }
  }

  const sentenceRe = /[^.!?]+[.!?]+/g;
  let sm: RegExpExecArray | null;
  while ((sm = sentenceRe.exec(text)) !== null) {
    const sentence = sm[0].trim();
    if (sentence.split(/\s+/).length > 28) {
      marks.push({
        id: `m-long-${sm.index}`,
        start: sm.index,
        end: sm.index + sm[0].length,
        kind: 'clarity',
        suggestion: 'Split this sentence',
      });
    }
  }

  if (rewritten === text && marks.length > 0) {
    rewritten = text.replace(/\s{2,}/g, ' ').trim();
  }

  if (marks.length === 0 && text.trim()) {
    const words = text.trim().split(/\s+/);
    if (words.length >= 4) {
      const target = words.slice(0, 3).join(' ');
      const start = text.indexOf(target);
      if (start >= 0) {
        marks.push({
          id: 'm-seed',
          start,
          end: start + target.length,
          kind: 'clarity',
          suggestion: 'Lead with the verb',
        });
      }
    }
  }

  return { original: text, rewritten, marks };
}

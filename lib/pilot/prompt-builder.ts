/**
 * Pilot step-5 system-prompt generation.
 *
 * Builds the meta-prompt that asks a model to write a DRAFT system prompt for
 * the user's new agent, strictly inside the locked assembl voice canon
 * (English-first, sentence case, slop blacklist, draft-only, NZ English, Kate
 * Hudson always Hudson) and with the right NZ compliance citations baked in.
 *
 * Generation runs through generateWithFallback so it works on whatever provider
 * is configured. A final guard sweep strips any slop the model slips in.
 *
 * Server-only (imports the locked SHARED_BRAND_PREFIX).
 */
import 'server-only';
import { SHARED_BRAND_PREFIX } from '@/lib/marketplace/agent-prompts';
import { resolveCompliance } from './compliance';
import { pilotToolById } from './tool-registry';
import type { PilotDraft } from './types';

const SLOP = [
  'leverage', 'seamless', 'robust', 'unleash', 'empower', 'revolutionise',
  'revolutionize', 'synergy', 'cutting-edge', 'disrupt', 'game-changer',
  'game changer', 'enterprise-grade', 'best-in-class', 'world-class',
];

/** The instruction that drives prompt generation. */
export function buildPromptMetaPrompt(draft: PilotDraft): string {
  const compliance = resolveCompliance(draft.category, draftFreeText(draft));
  const toolNames = draft.tools
    .map((id) => pilotToolById(id)?.name)
    .filter(Boolean)
    .join(', ');

  return [
    'You are writing the system prompt for a new assembl agent that a non-technical New Zealander has just specified.',
    'Write it in the locked assembl voice. These rules are absolute:',
    '- Sentence case. Short sentences. Plain NZ English (colour, organisation, licence, programme).',
    '- English-first. Te reo only where it is functional (an agent name, an Act name, "Aotearoa"). Never decorative.',
    '- Write "assembl" in lowercase, always. If the founder is named, it is Kate Hudson — never Harland.',
    `- Forbidden words (never use): ${SLOP.join(', ')}.`,
    '- The agent always produces a DRAFT for a human to check. Never auto-send, auto-file or auto-lodge.',
    '- No exclamation marks. No emoji. No preamble — lead with the substance.',
    '',
    'Here is what the person wants:',
    `- Name: ${draft.name || '(unnamed)'}${draft.teReo ? ` (${draft.teReo})` : ''}`,
    `- What it does: ${draft.description || '(not given)'}`,
    `- Result it produces: ${draft.goal.output || '(not given)'}`,
    `- Who reads it: ${draft.goal.audience || '(not given)'}`,
    `- How often it runs: ${draft.goal.frequency || '(not given)'}`,
    `- What it needs to start: ${draft.inputs.needs.join(', ') || '(not given)'}`,
    `- What it can access: ${draft.inputs.access.join(', ') || 'nothing'}`,
    `- Tools available: ${toolNames || '(none selected)'}`,
    '',
    compliance.length
      ? `Compliance this agent MUST follow (cite each by its correct name in a "## Compliance" section): ${compliance
          .map((c) => c.label)
          .join('; ')}.`
      : 'No specific NZ Act is implied; still respect the Privacy Act 2020 if any personal information appears.',
    '',
    'Write the full system prompt now. Structure it with markdown headings:',
    '## Role — one paragraph, who the agent is and what it does.',
    '## What it does — 3–5 tight bullets.',
    '## Hard constraints — what it must never do (include the draft-only rule).',
    '## Compliance — the Acts above, each cited correctly, with what they require.',
    '## Output format — how it lays out its answer.',
    '## Tone — two lines.',
    'Return only the system prompt itself, no commentary before or after.',
  ].join('\n');
}

/** The system instruction for the generator (keeps it inside the brand prefix). */
export function generatorSystem(): string {
  return `${SHARED_BRAND_PREFIX}\n\nYou are PILOT's prompt-writer. You produce system prompts for new agents, always inside the rules above.`;
}

function draftFreeText(draft: PilotDraft): string {
  return [
    draft.name,
    draft.description,
    draft.goal.output,
    draft.goal.audience,
    draft.inputs.needs.join(' '),
    draft.inputs.access.join(' '),
  ].join(' ');
}

/**
 * Guard sweep — strip/flag slop the model slipped in. Replaces forbidden words
 * with plain alternatives where obvious, and returns whether any were found.
 */
export function guardVoice(prompt: string): { prompt: string; slopFound: string[] } {
  let out = prompt;
  const found: string[] = [];
  for (const word of SLOP) {
    const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    if (re.test(out)) {
      found.push(word);
      out = out.replace(re, '');
    }
  }
  // Tidy any double spaces left by removals.
  out = out.replace(/[ \t]{2,}/g, ' ').replace(/ +([.,;])/g, '$1');
  return { prompt: out, slopFound: found };
}

/**
 * A safe, deterministic fallback prompt used when no model is configured, so
 * the flow never dead-ends. It is plain, draft-only, and inside the voice.
 */
export function fallbackPrompt(draft: PilotDraft): string {
  const compliance = resolveCompliance(draft.category, draftFreeText(draft));
  const lines = [
    `# Agent: ${draft.name || 'Untitled agent'}`,
    '# Built with Pilot · DRAFT',
    '',
    '## Role',
    draft.description ||
      'This agent helps with a specific task its owner defined. Keep it useful and plain.',
    '',
    '## What it does',
    `- Produces ${draft.goal.output || 'a clear, checkable output'} for ${draft.goal.audience || 'its owner'}.`,
    `- Runs ${draft.goal.frequency || 'when asked'}.`,
    `- Works from ${draft.inputs.needs.join(', ') || 'the information given'}.`,
    '',
    '## Hard constraints',
    '- Every output is a draft for a human to check. Never send, file or lodge anything automatically.',
    '- Plain NZ English. Sentence case. No slop. Write "assembl" in lowercase.',
    '- Cite the source of any factual claim.',
    '',
    '## Compliance',
    ...(compliance.length
      ? compliance.map((c) => `- ${c.label} — ${c.reason}`)
      : ['- Respect the Privacy Act 2020 if any personal information appears.']),
    '',
    '## Output format',
    '- Lead with the answer. Use short headings and tight lists. End with sources and next actions.',
    '',
    '## Tone',
    'Warm, plain, brisk. Give time back; never oversell.',
  ];
  return lines.join('\n');
}

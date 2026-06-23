/**
 * Pilot step-5 — generate the draft agent's system prompt.
 *
 * POST { draft } → { systemPrompt, compliance, slopFound, model }. Runs the
 * prompt-generation meta-prompt through the model router (fail-open across
 * providers), then a voice guard sweep. If no provider is configured, returns a
 * safe deterministic fallback prompt so the flow never dead-ends.
 */
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import { resolveModel } from '@/lib/pilot/models';
import {
  buildPromptMetaPrompt,
  generatorSystem,
  guardVoice,
  fallbackPrompt,
} from '@/lib/pilot/prompt-builder';
import { complianceLabels } from '@/lib/pilot/compliance';
import type { PilotDraft } from '@/lib/pilot/types';

export const maxDuration = 45;

export async function POST(req: Request): Promise<Response> {
  let body: { draft?: PilotDraft };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const draft = body.draft;
  if (!draft || typeof draft !== 'object') {
    return Response.json({ error: 'No draft supplied.' }, { status: 400 });
  }

  const freeText = [draft.name, draft.description, draft.goal?.output, draft.goal?.audience]
    .filter(Boolean)
    .join(' ');
  const compliance = complianceLabels(draft.category ?? 'build', freeText);

  // Build the ladder anchored on the user's chosen model, with the standard
  // free fallbacks behind it.
  const resolved = resolveModel(draft.modelPreference ?? 'claude');
  if (!resolved) {
    // No provider at all — hand back a safe deterministic prompt.
    return Response.json({
      systemPrompt: fallbackPrompt({ ...draft, compliance }),
      compliance,
      slopFound: [],
      model: null,
      fallback: true,
    });
  }

  const ladder = resolveModelLadder('claude-sonnet-4-6', [
    'gemini-2.5-flash',
    'groq:llama-3.3-70b-versatile',
  ]);

  const result = await generateWithFallback({
    ladder,
    system: generatorSystem(),
    messages: [{ role: 'user', content: buildPromptMetaPrompt({ ...draft, compliance }) }],
    agentSlug: 'pilot',
  });

  if (!result.ok) {
    return Response.json({
      systemPrompt: fallbackPrompt({ ...draft, compliance }),
      compliance,
      slopFound: [],
      model: null,
      fallback: true,
    });
  }

  const guarded = guardVoice(result.text.trim());

  return Response.json({
    systemPrompt: guarded.prompt,
    compliance,
    slopFound: guarded.slopFound,
    model: result.rung.label,
    fallback: !result.rung.isPrimary,
  });
}

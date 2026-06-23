/**
 * Pilot multi-model resolution.
 *
 * The brief requires the user to pick a model per agent they build —
 * Claude / GPT / Gemini / Llama. This maps that plain choice to a concrete
 * Vercel AI SDK LanguageModel, reusing the same provider clients as the
 * marketplace router (lib/ai/router.ts) and adding OpenAI for the GPT option
 * (already-installed @ai-sdk/openai, OPENAI_API_KEY).
 *
 * FAIL-OPEN: if the chosen provider has no key configured, resolve() falls back
 * to the first provider that does, so the sandbox keeps working. The label
 * tells the user which model actually answered.
 *
 * Server-only.
 */
import 'server-only';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI, openai } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import type { ModelPreference } from './types';

export interface ResolvedModel {
  model: LanguageModel;
  /** which model actually answered, for disclosure */
  label: string;
  /** true when it matched the user's stated preference */
  asRequested: boolean;
}

export const MODEL_CHOICES: { id: ModelPreference; label: string; trade: string }[] = [
  { id: 'claude', label: 'Claude Sonnet', trade: 'Best for reasoning and careful drafting.' },
  { id: 'gpt', label: 'GPT-4o', trade: 'Fast, broad general knowledge.' },
  { id: 'gemini', label: 'Gemini Flash', trade: 'Lowest cost, quick replies.' },
  { id: 'llama', label: 'Llama 3.3', trade: 'Runs on open weights — better for privacy.' },
];

function anthropicModel(): LanguageModel | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return anthropic('claude-sonnet-4-6');
}

function openaiModel(): LanguageModel | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return openai('gpt-4o');
}

function geminiModel(): LanguageModel | null {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  const p = createOpenAI({ apiKey, baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' });
  return p('gemini-2.5-flash');
}

function groqModel(): LanguageModel | null {
  if (!process.env.GROQ_API_KEY) return null;
  const p = createOpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' });
  return p('llama-3.3-70b-versatile');
}

const BUILDERS: Record<ModelPreference, { label: string; build: () => LanguageModel | null }> = {
  claude: { label: 'Claude Sonnet', build: anthropicModel },
  gpt: { label: 'GPT-4o', build: openaiModel },
  gemini: { label: 'Gemini Flash', build: geminiModel },
  llama: { label: 'Llama 3.3', build: groqModel },
};

// The order we fall back through when the requested provider has no key.
const FALLBACK_ORDER: ModelPreference[] = ['claude', 'gemini', 'gpt', 'llama'];

/**
 * Resolve a model from the user's preference, falling open to any configured
 * provider. Returns null only if NO provider is configured at all.
 */
export function resolveModel(pref: ModelPreference): ResolvedModel | null {
  const wanted = BUILDERS[pref].build();
  if (wanted) return { model: wanted, label: BUILDERS[pref].label, asRequested: true };

  for (const id of FALLBACK_ORDER) {
    const m = BUILDERS[id].build();
    if (m) return { model: m, label: BUILDERS[id].label, asRequested: false };
  }
  return null;
}

export function modelLabel(pref: ModelPreference): string {
  return BUILDERS[pref]?.label ?? 'Claude Sonnet';
}

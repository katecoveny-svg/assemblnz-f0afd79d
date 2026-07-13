/**
 * Run the Assembl evaluation set against every AVAILABLE model candidate
 * and write model_workflow_stats — the measurements the Model & Capability
 * Router routes on ("never published benchmarks alone").
 *
 * Usage:  npx tsx scripts/run-os-evals.ts [--dry]
 *
 * Requires provider keys in the environment for each candidate you want
 * measured, plus SUPABASE_SERVICE_ROLE_KEY to persist results. Candidates
 * without keys are skipped and reported — no fabricated numbers, ever.
 * --dry runs the checks pipeline against a stub output without calling any
 * provider or writing rows (CI smoke).
 */
import { createClient } from '@supabase/supabase-js';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type LanguageModel } from 'ai';
import { EVAL_CASES, runChecks } from '../lib/os/evals/cases';
import { MODEL_CANDIDATES } from '../lib/os/routing';

// Local rung resolution: lib/ai/router.ts is server-only (Next), so the
// script mirrors its provider mapping with the same env gating.
function modelForId(id: string): LanguageModel | null {
  const openaiCompat = (apiKey: string | undefined, baseURL?: string) =>
    apiKey ? createOpenAI(baseURL ? { apiKey, baseURL } : { apiKey }) : null;
  if (id.startsWith('claude')) {
    return process.env.ANTHROPIC_API_KEY ? anthropic(id) : null;
  }
  if (id.startsWith('gemini')) {
    const p = openaiCompat(
      process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      'https://generativelanguage.googleapis.com/v1beta/openai/',
    );
    return p ? p(id) : null;
  }
  if (id.startsWith('groq:')) {
    const p = openaiCompat(process.env.GROQ_API_KEY, 'https://api.groq.com/openai/v1');
    return p ? p(id.slice('groq:'.length)) : null;
  }
  if (id.startsWith('ollama:')) {
    const p = openaiCompat(process.env.OLLAMA_API_KEY ?? 'ollama', process.env.OLLAMA_BASE_URL);
    return process.env.OLLAMA_BASE_URL && p ? p(id.slice('ollama:'.length)) : null;
  }
  if (id.startsWith('grok')) {
    const p = openaiCompat(process.env.XAI_API_KEY, 'https://api.x.ai/v1');
    return p ? p(id) : null;
  }
  if (id.startsWith('gpt') || id.startsWith('o')) {
    const p = openaiCompat(process.env.OPENAI_API_KEY);
    return p ? p(id) : null;
  }
  return null;
}

const DRY = process.argv.includes('--dry');

async function main() {
  if (DRY) {
    // Checks pipeline smoke: a stub that should fail honest checks.
    const sample = runChecks('nothing useful', EVAL_CASES[0].checks);
    console.log(`[dry] cases=${EVAL_CASES.length} checks pipeline ok, sample pass ${sample.passed}/${sample.total}`);
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  if (!supabase) console.warn('No service credentials — results will print but not persist.');

  for (const candidate of MODEL_CANDIDATES) {
    const model = modelForId(candidate.id);
    if (!model) {
      console.log(`skip ${candidate.id} — provider not configured`);
      continue;
    }

    const byWorkflow = new Map<
      string,
      { cases: number; passed: number; total: number; hallucinations: number; toolCases: number; toolCorrect: number; latency: number[] }
    >();

    for (const evalCase of EVAL_CASES) {
      const agg = byWorkflow.get(evalCase.workflow) ?? {
        cases: 0, passed: 0, total: 0, hallucinations: 0, toolCases: 0, toolCorrect: 0, latency: [],
      };
      const started = Date.now();
      try {
        const { text } = await generateText({
          model,
          system: evalCase.system,
          messages: [{ role: 'user', content: evalCase.input }],
        });
        const result = runChecks(text, evalCase.checks);
        agg.cases += 1;
        agg.passed += result.passed;
        agg.total += result.total;
        if (result.hallucinated) agg.hallucinations += 1;
        if (result.toolCorrect !== null) {
          agg.toolCases += 1;
          if (result.toolCorrect) agg.toolCorrect += 1;
        }
        agg.latency.push(Date.now() - started);
        console.log(`${candidate.id} · ${evalCase.id}: ${result.passed}/${result.total}${result.hallucinated ? ' · HALLUCINATED' : ''}`);
      } catch (err) {
        agg.cases += 1;
        agg.total += evalCase.checks.length;
        console.log(`${candidate.id} · ${evalCase.id}: ERROR ${err instanceof Error ? err.message : err}`);
      }
      byWorkflow.set(evalCase.workflow, agg);
    }

    for (const [workflow, agg] of byWorkflow) {
      const row = {
        model: candidate.id,
        provider: candidate.provider,
        workflow,
        cases: agg.cases,
        accuracy: agg.total > 0 ? +(agg.passed / agg.total).toFixed(3) : 0,
        tool_success: agg.toolCases > 0 ? +(agg.toolCorrect / agg.toolCases).toFixed(3) : null,
        hallucination_rate: agg.cases > 0 ? +(agg.hallucinations / agg.cases).toFixed(3) : null,
        avg_latency_ms: agg.latency.length
          ? Math.round(agg.latency.reduce((a, b) => a + b, 0) / agg.latency.length)
          : null,
        avg_cost_nzd: null,
      };
      console.log(`→ ${candidate.id} · ${workflow}: accuracy ${row.accuracy}`);
      if (supabase) await supabase.from('model_workflow_stats').insert(row);
    }
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});

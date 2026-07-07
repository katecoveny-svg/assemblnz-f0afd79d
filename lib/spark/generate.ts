/**
 * SPARK real generation — plain-English description → one working, self-contained
 * HTML tool (calculator, intake form, or checklist).
 *
 * Runs on the same free-fallback model ladder as the rest of the fleet
 * (Claude primary → Gemini → Groq), so a missing ANTHROPIC_API_KEY transparently
 * drops to a configured fallback. If NO rung is configured, generation returns
 * { ok: false } and the caller shows the honest "SPARK is drafting…" state and
 * files a request instead of faking a tool.
 *
 * Empower-not-replace and NZ-accuracy are baked into the system prompt: the tool
 * always carries a "you set the terms, you check it, you run it" line, uses 15% GST
 * where money is involved, and only builds what the description asks for.
 *
 * Server-only.
 */
import 'server-only';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import { FALLBACK_MODELS, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';

const PRIMARY_MODEL = MODEL_TIER_TO_ANTHROPIC.mid; // claude-sonnet-4-6

const SYSTEM = `You are SPARK (ASM-042), assembl's app builder for New Zealand small businesses.
A person describes, in plain English, a tool their business needs. You return ONE working,
self-contained tool as a single HTML document.

HARD RULES
- Output EXACTLY this shape and nothing else — no markdown, no code fences, no commentary:
TITLE: <a short, plain tool name, max 8 words>
SUMMARY: <one sentence, max 24 words, describing what the tool does>
---HTML---
<!doctype html> … the complete tool …
- The HTML must be fully self-contained: all CSS in a <style> tag, all JS in a <script> tag,
  NO external requests (no CDNs, fonts, images, or network calls). It must work offline in a sandbox.
- Accessibility to WCAG 2.1 AA: every input has a <label>, visible focus states, sufficient
  colour contrast, sensible heading order, and the page works by keyboard.
- Brand: calm and minimal. Accent colour Hangarau teal #5AADA0 on a warm off-white #F7F3EE
  background with dark charcoal text (#23211F). No neon. Generous spacing. System font stack.
- New Zealand context: NZ English, NZD "$", 15% GST where money is involved, NZ formats.
- If the tool collects personal information (a form), include a short, plain Privacy Act 2020
  collection notice ("Why we ask: …") near the fields — do not overclaim; keep it honest.
- EMPOWER, NOT REPLACE: include one calm line the owner controls, e.g. inside a footer:
  "You set the rates and terms. Check the numbers before you send. This tool is yours to run."
- Do NOT invent live integrations you cannot deliver in a static file. If the description asks for
  Xero/IRD/Stripe, build the fields and the maths and clearly label those bits as a placeholder to
  connect later (e.g. a disabled "Connect Stripe" button with helper text) — never pretend a payment
  or a live sync happened.
- Build ONLY what was described. Keep it to one focused tool.`;

export type SparkGeneration = { ok: true; title: string; summary: string; html: string } | { ok: false };

function parse(raw: string): { title: string; summary: string; html: string } | null {
  const marker = raw.indexOf('---HTML---');
  if (marker === -1) return null;
  const head = raw.slice(0, marker);
  const html = raw.slice(marker + '---HTML---'.length).trim();
  if (!/<!doctype html>|<html/i.test(html)) return null;
  const title = (head.match(/TITLE:\s*(.+)/i)?.[1] ?? '').trim().slice(0, 90) || 'Your SPARK tool';
  const summary =
    (head.match(/SUMMARY:\s*(.+)/i)?.[1] ?? '').trim().slice(0, 180) ||
    'A working tool built with SPARK from a plain-English description.';
  return { title, summary, html };
}

export function sparkConfigured(): boolean {
  return resolveModelLadder(PRIMARY_MODEL, FALLBACK_MODELS).length > 0;
}

export async function generateSparkTool(description: string): Promise<SparkGeneration> {
  const ladder = resolveModelLadder(PRIMARY_MODEL, FALLBACK_MODELS);
  if (ladder.length === 0) return { ok: false };

  const result = await generateWithFallback({
    ladder,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Build this tool: ${description}` }],
    agentSlug: 'spark',
  });
  if (!result.ok) return { ok: false };

  const parsed = parse(result.text);
  if (!parsed) return { ok: false };
  return { ok: true, ...parsed };
}

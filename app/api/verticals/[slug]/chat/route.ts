import { createHash } from 'node:crypto';
import { tool } from 'ai';
import { z } from 'zod';
import { getVertical } from '@/lib/verticals/config';
import { verticalChatSchema, verticalSystem } from '@/lib/verticals/prompt';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { searchNZKnowledge, type NZKnowledgeResult } from '@/lib/agents/nz-knowledge';
import { consume } from '@/lib/creative/ratelimit';
import { clientIpFromHeaders } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const v = getVertical((await params).slug);
  if (!v) return Response.json({ error: 'Unknown app.' }, { status: 404, headers });
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) return Response.json({ error: 'Open this app to chat.' }, { status: 403, headers });
  const raw = await req.text().catch(() => '');
  if (raw.length > 48000) return Response.json({ error: 'Please shorten the conversation.' }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = verticalChatSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Send a message of up to 1,000 characters.' }, { status: 400, headers });
  const ladder = resolveModelLadder('claude-sonnet-4-6', ['claude-haiku-4-5-20251001']);
  if (!ladder.length) return Response.json({ error: `${v.agentName} is unavailable here. Please try again later.`, mode: 'unavailable' }, { status: 503, headers });
  // The shared limiter records usage only, not chat text. Ignore client-chosen IDs/cookies.
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown';
  const key = createHash('sha256').update(`vertical-app:${ip}`).digest('hex');
  const rate = await consume(`vertical:${key}`, 'copy');
  if (!rate.ok) return Response.json({ error: 'The demo message limit has been reached. Please try again later.' }, { status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil(rate.resetMs / 1000)) } });
  const checks: NZKnowledgeResult[] = [];
  const result = await generateWithFallback({
    ladder, system: verticalSystem(v), agentSlug: v.agent, tenant: 'assembl-public-vertical',
    messages: [...parsed.data.history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: parsed.data.message }],
    maxOutputTokens: 1000, abortSignal: AbortSignal.any([req.signal, AbortSignal.timeout(45000)]),
    tools: { searchNZKnowledge: tool({
      description: 'Read-only search of NZ official knowledge. Call before claims about laws, building codes, tariff or government guidance. Never invent a citation.',
      inputSchema: z.object({ query: z.string().min(1).max(1000) }),
      execute: async ({ query }) => { const check = await searchNZKnowledge(query); checks.push(check); return check; },
    }) }, maxToolSteps: 3,
  });
  if (!result.ok || !result.text.trim()) return Response.json({ error: `${v.agentName} could not finish that reply. Please try again.`, mode: 'unavailable' }, { status: 503, headers });
  const successful = checks.filter((c): c is Extract<NZKnowledgeResult, { status: 'ok' }> => c.status === 'ok');
  return Response.json({
    reply: result.text, mode: 'live', agent: v.agent, agentName: v.agentName,
    sourceStatus: successful.length ? 'retrieved' : checks.length ? 'unavailable' : 'not-requested',
    sources: successful.flatMap(c => c.sources.map(s => ({ title: s.title, url: s.url, retrievedAt: c.retrievedAt }))),
    createdAt: new Date().toISOString(), status: 'draft',
  }, { headers });
}

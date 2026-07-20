/**
 * POST /api/build-agent/save — the visitor is saving/sharing the agent they
 * just built. We email Kate the full config so she has the follow-up context,
 * enrich with the visitor's email when they left one.
 *
 * Rate-limit: 3 saves per IP per hour (in-memory, best-effort).
 * Fail-soft: if the mailer is down the client still shows a "saved" state.
 */

import { NextRequest } from 'next/server';

import type { BuildConfig } from '@/lib/build-an-agent/config';
import { configSummary } from '@/lib/build-an-agent/config';
import { shareUrlFor } from '@/lib/build-an-agent/share';
import { clientIpFromHeaders, notifyLead } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 3;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_HITS;
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function POST(req: NextRequest) {
  let body: { config?: Partial<BuildConfig>; email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'anon';
  if (rateLimited(ip)) {
    return json({ error: 'Already caught yours — check back in an hour.' }, 429);
  }

  const email = String(body.email ?? '').trim();
  const validEmail = EMAIL_RE.test(email);

  const config: BuildConfig = {
    name: String(body.config?.name ?? '').slice(0, 80),
    business: String(body.config?.business ?? '').slice(0, 900),
    modelTier: (body.config?.modelTier as BuildConfig['modelTier']) ?? 'mid',
    memoryScope: (body.config?.memoryScope as BuildConfig['memoryScope']) ?? 'session',
    tools: Array.isArray(body.config?.tools) ? body.config!.tools.slice(0, 12) : [],
    knowledge: Array.isArray(body.config?.knowledge) ? body.config!.knowledge.slice(0, 12) : [],
    voice: String(body.config?.voice ?? '').slice(0, 500),
    guardrails: Array.isArray(body.config?.guardrails) ? body.config!.guardrails.slice(0, 12) : [],
  };

  const origin = req.headers.get('origin') || 'https://www.assembl.co.nz';
  const shareUrl = shareUrlFor(config, origin);

  void notifyLead({
    formName: 'Build-an-agent · saved a build',
    email: validEmail ? email : null,
    fields: {
      agentName: config.name || '(unnamed)',
      business: config.business || '(not provided)',
      summary: configSummary(config),
      shareUrl,
    },
    sourceUrl: req.headers.get('referer'),
    ip,
  });

  return json({ ok: true, shareUrl });
}

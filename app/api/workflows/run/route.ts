import { createHash, randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { getWorkflow, workflowMessage } from '@/lib/workflows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WorkflowRunRequest = {
  slug?: string;
  tenant?: string;
  inputs?: Record<string, unknown>;
};

function htmlDraft(title: string, body: string) {
  return [
    `<h2>${escapeHtml(title)} draft</h2>`,
    '<h3>Review-ready output</h3>',
    `<p>${escapeHtml(body)}</p>`,
    '<h3>Reviewer sign-off</h3>',
    '<p>Reviewed by: [named person] · Date: [today]</p>',
    '<h3>Filed record</h3>',
    '<p>Sources, assumptions, edits, timestamp, and hash-chain entry are captured when your team signs off.</p>',
  ].join('');
}

// Append a visible assembl watermark to every workflow output so the result
// can't be claimed as someone else's work. Lives inline so it survives copy/
// paste, embed-into-other-sites, and PDF export. Visible on both the LLM-
// generated path and the local-fallback draft.
function appendAssemblWatermark(html: string, slug: string, title: string) {
  const watermark = `
<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">
  <span><span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#2B6B57;">assembl</span> · ${escapeHtml(title)}</span>
  <a href="https://assembl.co.nz/workflows/${encodeURIComponent(slug)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz/workflows/${escapeHtml(slug)} →</a>
</footer>`;
  return html + watermark;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function estimateTokens(text: string) {
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.35);
}

async function logRun(args: {
  slug: string;
  tenantId?: string | null;
  origin?: string | null;
  inputs: Record<string, unknown>;
  inputTokens: number;
  outputTokens: number;
  ipHash: string;
}) {
  try {
    const service = getServiceClient();
    await service.from('workflow_runs').insert({
      workflow_slug: args.slug,
      tenant_id: args.tenantId ?? null,
      installer_origin: args.origin ?? null,
      inputs: args.inputs,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      ip_hash: args.ipHash,
    });
  } catch {
    // Local/dev and pre-migration environments should still return a draft.
  }
}

async function checkRateLimit(args: {
  slug: string;
  tenantId?: string | null;
  ipHash: string;
}) {
  try {
    const service = getServiceClient();
    if (args.tenantId) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await service
        .from('workflow_runs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', args.tenantId)
        .gte('created_at', dayAgo);
      if (error) return true;
      return (count ?? 0) < 100;
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await service
      .from('workflow_runs')
      .select('id', { count: 'exact', head: true })
      .eq('workflow_slug', args.slug)
      .eq('ip_hash', args.ipHash)
      .gte('created_at', hourAgo);
    if (error) return true;
    return (count ?? 0) < 3;
  } catch {
    return true;
  }
}

async function resolveTenantId(tenant?: string) {
  if (!tenant) return null;
  try {
    const service = getServiceClient();
    const { data } = await service
      .from('tenants')
      .select('id')
      .eq('slug', tenant)
      .maybeSingle();
    return typeof data?.id === 'string' ? data.id : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as WorkflowRunRequest;
  const slug = body.slug?.trim();
  if (!slug) return json({ error: 'Missing workflow slug' }, 400);

  const workflow = getWorkflow(slug);
  if (!workflow) return json({ error: 'Unknown workflow' }, 404);

  const inputs = body.inputs && typeof body.inputs === 'object' ? body.inputs : {};
  const prompt = `${workflow.systemPrompt}\n\n${workflowMessage(workflow, inputs)}`;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');
  const origin = req.headers.get('origin') ?? req.headers.get('referer');
  const tenantId = await resolveTenantId(body.tenant);
  const rateOk = await checkRateLimit({ slug: workflow.slug, tenantId, ipHash });
  if (!rateOk) return json({ error: 'Rate limit exceeded' }, 429);

  let output = '';
  try {
    const service = getServiceClient();
    const { data, error } = await service.functions.invoke('public-chat-llm', {
      body: {
        kete: workflow.kete,
        message: prompt,
        tenantId: tenantId ?? undefined,
        sessionId: randomUUID(),
      },
    });
    if (!error && data && typeof data.response === 'string') {
      output = data.response;
    }
  } catch {
    // Fall through to local deterministic draft.
  }

  if (!output.trim()) {
    const supplied = workflow.inputs
      .map((input) => `${input.label}: ${Array.isArray(inputs[input.id]) ? (inputs[input.id] as unknown[]).join(', ') : inputs[input.id] ?? 'not supplied'}`)
      .join('; ');
    output = htmlDraft(workflow.title, supplied || workflow.description);
  }

  // Every output carries a visible assembl watermark — copy-paste, embed, or
  // download, the brand stays attached. Skip only for json shape (handled by caller).
  if (workflow.outputShape !== 'json') {
    output = appendAssemblWatermark(output, workflow.slug, workflow.title);
  }

  await logRun({
    slug: workflow.slug,
    tenantId,
    origin,
    inputs,
    inputTokens: estimateTokens(prompt),
    outputTokens: estimateTokens(output),
    ipHash,
  });

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': workflow.outputShape === 'json' ? 'application/json' : 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Workflow-Run-Id': randomUUID(),
    },
  });
}

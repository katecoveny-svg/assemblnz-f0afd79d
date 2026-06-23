import { createHash, randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { parseSchoolNewsletter, type SchoolSurvivalItem } from '@/lib/toro/newsletter-parser';
import { getWorkflow, workflowMessage } from '@/lib/workflows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WorkflowRunRequest = {
  slug?: string;
  tenant?: string;
  inputs?: Record<string, unknown>;
  imageDataUrl?: string;
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

function dataUrlToFile(dataUrl?: string, filename = 'school-notice.jpg') {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mediaType, base64] = match;
  const extension = mediaType.split('/')[1]?.split('+')[0] ?? 'jpg';
  const buffer = Buffer.from(base64, 'base64');
  return new File([buffer], filename.includes('.') ? filename : `${filename}.${extension}`, { type: mediaType });
}

function dataUrlMediaType(dataUrl?: string) {
  return dataUrl?.match(/^data:([^;]+);base64,/)?.[1] ?? '';
}

function formatSchoolDate(value: string) {
  const date = new Date(`${value}T12:00:00+12:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function compactUnique(values: Array<string | undefined | null>) {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
}

function renderList(items: string[], fallback: string) {
  if (!items.length) return `<p>${escapeHtml(fallback)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function parseModelJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '');
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]) as unknown;
    } catch {
      return null;
    }
  }
}

async function invokePublicChatLlm(body: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const response = await fetch(`${supabaseUrl}/functions/v1/public-chat-llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as { response?: unknown } | null;
}

function normaliseSchoolItems(value: unknown): SchoolSurvivalItem[] {
  const rows =
    value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)
      ? ((value as { items: unknown[] }).items)
      : Array.isArray(value)
        ? value
        : [];

  return rows
    .map((row): SchoolSurvivalItem | null => {
      if (!row || typeof row !== 'object') return null;
      const item = row as Record<string, unknown>;
      const sourceParagraph = String(item.source_paragraph ?? item.source ?? item.notes ?? item.title ?? '').trim();
      const title = String(item.title ?? sourceParagraph ?? 'School notice item').trim();
      const kind = String(item.kind ?? 'notice') as SchoolSurvivalItem['kind'];
      const date = String(item.date ?? '').trim();
      if (!title && !sourceParagraph) return null;
      const normalised: SchoolSurvivalItem = {
        kind: ['event', 'deadline', 'payment', 'gear', 'permission', 'sport', 'music', 'notice'].includes(kind) ? kind : 'notice',
        title: title || 'School notice item',
        date,
        source_paragraph: sourceParagraph || title,
      };
      if (typeof item.time === 'string' && item.time.trim()) normalised.time = item.time.trim();
      if (typeof item.amount === 'number') normalised.amount = item.amount;
      if (typeof item.item === 'string' && item.item.trim()) normalised.item = item.item.trim();
      if (typeof item.child_year_level === 'string' && item.child_year_level.trim()) {
        normalised.child_year_level = item.child_year_level.trim();
      }
      return normalised;
    })
    .filter((item): item is SchoolSurvivalItem => Boolean(item));
}

function normaliseVisionLines(text: string): SchoolSurvivalItem[] {
  const allowedKinds: SchoolSurvivalItem['kind'][] = ['event', 'deadline', 'payment', 'gear', 'permission', 'sport', 'music', 'notice'];
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, ''))
    .split(/\r?\n/)
    .map((line): SchoolSurvivalItem | null => {
      const parts = line
        .replace(/^[-*]\s*/, '')
        .split('|')
        .map((part) => part.trim());
      if (parts.length < 3) return null;
      const kind = allowedKinds.includes(parts[0] as SchoolSurvivalItem['kind'])
        ? (parts[0] as SchoolSurvivalItem['kind'])
        : 'notice';
      const title = parts[1] || parts[3] || 'School notice item';
      const rawDate = parts[2]?.toLowerCase() === 'blank' ? '' : parts[2] || '';
      const detail = parts.slice(3).join(' - ').trim();
      const item: SchoolSurvivalItem = {
        kind,
        title,
        date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : '',
        source_paragraph: detail || title,
      };
      if (kind === 'gear') item.item = detail || title;
      const amount = (detail || title).match(/\$\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
      if (amount) item.amount = Number(amount[1].replace(/,/g, ''));
      const time = (detail || title).match(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b/i);
      if (time) {
        let hour = Number(time[1]);
        const minute = Number(time[2] ?? 0);
        const meridiem = time[3]?.toLowerCase();
        if (meridiem === 'pm' && hour < 12) hour += 12;
        if (meridiem === 'am' && hour === 12) hour = 0;
        item.time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      return item;
    })
    .filter((item): item is SchoolSurvivalItem => Boolean(item));
}

async function extractSchoolNoticeViaVision({
  imageDataUrl,
  childName,
  noticeText,
}: {
  imageDataUrl?: string;
  childName: string;
  noticeText: string;
}) {
  if (!imageDataUrl) return null;
  try {
    const data = await invokePublicChatLlm({
      kete: 'toro',
      message: [
        `Read the attached school notice, timetable, sports draw, form, or screenshot for ${childName || 'the child'}.`,
        noticeText ? `Extra typed context:\n${noticeText}` : '',
        'Return only up to 12 lines in this exact pipe format: kind|title|yyyy-mm-dd or blank|detail.',
        'Prioritise money, permission/forms, dated events, then gear. Extract sport, exams, timetable subjects, and actions. No prose.',
      ]
        .filter(Boolean)
        .join('\n\n'),
      imageDataUrl,
      sessionId: randomUUID(),
      maxTokens: 2500,
      systemPromptOverride: `School logistics extractor for NZ parents.
Output terse pipe lines only. No JSON. No markdown.
Format: kind|title|yyyy-mm-dd or blank|detail.
kind must be event, deadline, payment, gear, permission, sport, music, or notice.
Convert visible NZ dates to 2026 ISO when year is omitted and the date is current/future.
If a date is not visible, write blank.
Never invent a school requirement that is not visible or supplied in typed context.`,
    });
    const response = typeof data?.response === 'string' ? data.response : '';
    if (!response.trim()) return null;
    const items = normaliseSchoolItems(parseModelJson(response));
    if (items.length) return items;
    const lineItems = normaliseVisionLines(response);
    if (lineItems.length) return lineItems;
    const fallback = await parseSchoolNewsletter({ newsletterText: response });
    return fallback.items.length ? fallback.items : null;
  } catch (error) {
    console.error('[workflow school notice] vision fallback failed', error);
    return null;
  }
}

function visibleTime(item: SchoolSurvivalItem) {
  if (!item.time) return '';
  if (item.time === '12:00' && !/\b(?:[01]?\d|2[0-3])(?::[0-5]\d)?\s*(?:am|pm)\b|[01]?\d:[0-5]\d/i.test(item.source_paragraph)) {
    return '';
  }
  return `, ${item.time}`;
}

function extractBringItems(text: string) {
  const matches = [...text.matchAll(/\b(?:bring|pack|wear)\b\s+([^.!?;]+)/gi)];
  return compactUnique(
    matches.flatMap((match) =>
      match[1]
        .split(/,|\band\b/gi)
        .map((part) => part.replace(/\b(by|on|for|to)\b.*$/i, '').trim())
        .filter((part) => part.length > 2 && !/^\$/.test(part)),
    ),
  );
}

function schoolNoticeOutput({
  childName,
  items,
  sourceType,
  sourceText: rawSourceText,
}: {
  childName: string;
  items: SchoolSurvivalItem[];
  sourceType: string;
  sourceText?: string;
}) {
  const safeName = childName || 'your tamariki';
  const sorted = [...items].sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
  const sourceText = rawSourceText || sorted.map((item) => item.source_paragraph).join('\n');
  const dateLines = compactUnique(
    sorted.filter((item) => item.kind !== 'gear').map((item) => {
      if (!item.date) return null;
      const time = visibleTime(item);
      return `${formatSchoolDate(item.date)}${time} - ${item.title}`;
    }),
  );
  const gear = compactUnique(
    [
      ...sorted
        .filter((item) => item.kind === 'gear' || /\b(bring|wear|pack|gear|lunch|water|uniform|togs|shoes|device)\b/i.test(item.source_paragraph))
        .flatMap((item) => [item.item, item.title]),
      ...extractBringItems(sourceText),
    ],
  );
  const paymentMatches = [...sourceText.matchAll(/\$\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g)].map((match) => `$${match[1]}`);
  const payments = compactUnique(
    [
      ...sorted
        .filter((item) => item.kind === 'payment' || typeof item.amount === 'number')
        .map((item) => {
          const amount = typeof item.amount === 'number' ? `$${item.amount.toFixed(item.amount % 1 ? 2 : 0)}` : 'Payment';
          return `${amount} - ${item.title}${item.date ? ` (${formatSchoolDate(item.date)})` : ''}`;
        }),
      ...paymentMatches.map((amount) => `${amount} mentioned in the notice${/\bby Friday\b/i.test(sourceText) ? ' - due Friday' : ''}`),
      /\b(permission|consent|slip|form|signed)\b/i.test(sourceText) ? 'Permission or consent form mentioned - check the original notice' : undefined,
    ],
  );
  const actions = compactUnique(
    sorted.map((item) => {
      if (item.kind === 'permission') return `Sign or return permission for ${item.title}${item.date ? ` by ${formatSchoolDate(item.date)}` : ''}`;
      if (item.kind === 'payment') return `Pay for ${item.title}${item.date ? ` by ${formatSchoolDate(item.date)}` : ''}`;
      if (item.kind === 'gear') return `Pack or check: ${item.item || item.title}`;
      if (!item.date && item.title) return `Check or action: ${item.title}`;
      return item.date ? `Add to family calendar: ${formatSchoolDate(item.date)} - ${item.title}` : item.title;
    }),
  ).slice(0, 12);

  const tomorrowCheck = compactUnique([
    gear.length ? `Pack ${safeName}'s gear bag the night before.` : undefined,
    payments.length ? 'Check the school app or notice for the exact payment method before paying.' : undefined,
    'If a date looks wrong, check the original notice before relying on this draft.',
  ]);

  return [
    `<h2>School notice parsed - ${escapeHtml(safeName)}</h2>`,
    `<p><strong>Source:</strong> ${escapeHtml(sourceType === 'image' ? 'photo upload' : sourceType === 'pdf' ? 'PDF upload' : 'typed or spoken note')}</p>`,
    '<h3>Key dates</h3>',
    renderList(dateLines, 'No dates found. Photograph the full notice, or paste the dates in the box and run it again.'),
    '<h3>Pack / wear / bring</h3>',
    renderList(gear, 'No gear list found. If this was a timetable, add the activity names or photograph the full page.'),
    '<h3>Payments and forms</h3>',
    renderList(payments, 'No payment or permission form found.'),
    '<h3>Actions for whānau</h3>',
    renderList(actions, 'Nothing actionable found yet.'),
    '<h3>Tonight / tomorrow check</h3>',
    renderList(tomorrowCheck, 'Check the school notice before relying on this draft.'),
  ].join('');
}

// Append a visible assembl watermark to every workflow output so the result
// can't be claimed as someone else's work. Lives inline so it survives copy/
// paste, embed-into-other-sites, and PDF export. Visible on both the LLM-
// generated path and the local-fallback draft.
function appendAssemblWatermark(html: string, slug: string, title: string) {
  const watermark = `
<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">
  <span><span style="font-family:'Fraunces',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#3A3832;">assembl</span> · ${escapeHtml(title)}</span>
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

  if (workflow.slug === 'school-notice-parser') {
    const childName = typeof inputs.child_name === 'string' ? inputs.child_name.trim() : '';
    const noticeText = [inputs.notice_text, inputs.spoken_notice]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join('\n\n');
    const uploadedName = typeof inputs.uploaded_notice_name === 'string' ? inputs.uploaded_notice_name : 'school-notice.jpg';
    const file = dataUrlToFile(body.imageDataUrl, uploadedName);
    const imageResult = file ? await parseSchoolNewsletter({ file }) : null;
    const visionItems = !imageResult?.items.length
      ? await extractSchoolNoticeViaVision({ imageDataUrl: body.imageDataUrl, childName, noticeText })
      : null;
    const textResult = !imageResult?.items.length && !visionItems?.length && noticeText ? await parseSchoolNewsletter({ newsletterText: noticeText }) : null;
    const result = imageResult?.items.length
      ? imageResult
      : visionItems?.length
        ? {
            items: visionItems,
            sourceType: dataUrlMediaType(body.imageDataUrl).includes('pdf') ? 'pdf' : 'image',
            sourceText: noticeText || uploadedName,
          }
        : textResult;

    let output = result?.items.length
      ? schoolNoticeOutput({
          childName,
          items: result.items,
          sourceType: result.sourceType,
          sourceText: result.sourceText || noticeText,
        })
      : htmlDraft(
          workflow.title,
          noticeText ||
            (file
              ? 'The photo was received, but no dates or gear could be read. Try a clearer photo of the full notice.'
              : 'Add a notice photo, timetable, or spoken note, then run the parser.'),
        );
    output = appendAssemblWatermark(output, workflow.slug, workflow.title);
    await logRun({
      slug: workflow.slug,
      tenantId,
      origin,
      inputs: { ...inputs, has_image_upload: Boolean(file) },
      inputTokens: estimateTokens(noticeText || uploadedName),
      outputTokens: estimateTokens(output),
      ipHash,
    });
    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Workflow-Run-Id': randomUUID(),
      },
    });
  }

  let output = '';
  try {
    const service = getServiceClient();
    const { data, error } = await service.functions.invoke('public-chat-llm', {
      body: {
        kete: workflow.kete,
        message: prompt,
        tenantId: tenantId ?? undefined,
        sessionId: randomUUID(),
        // Workflows ask for 300+ words of structured HTML output (H2 + 3-5
        // H3 sections + lists + reviewer note). That easily exceeds the
        // default 600-token cap public-chat-llm uses for "3-5 sentence"
        // visitor chat. Pass 2500 so workflows aren't truncated mid-sentence.
        // The edge function caps this server-side at MAX_TOKENS_CEILING (4000).
        maxTokens: 2500,
      },
    });
    if (!error && data && typeof data.response === 'string') {
      output = data.response;
      // Defensive fence stripping. Some models (especially when the system
      // prompt is thin) wrap HTML output in ```html ... ``` markdown fences.
      // dangerouslySetInnerHTML then renders the triple-backticks as literal
      // text and the user sees "```html\nKia ora!\n```" instead of the page.
      // Strip leading and trailing fences. Inline ``` inside body content
      // is preserved (intentional — a workflow output may legitimately
      // contain a code block).
      output = output
        .replace(/^\s*```(?:html|HTML)?\s*\r?\n/, '')   // opening fence
        .replace(/\r?\n?\s*```\s*$/, '')                // closing fence
        .trim();
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

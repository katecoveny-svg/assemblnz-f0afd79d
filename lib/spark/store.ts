/**
 * SPARK tool storage — draft-only. Generated tools land 'draft' in spark_tools
 * (migration 20260717090000) and are only ever shown with a draft ribbon until an
 * operator approves them in /admin/approvals. Nothing here auto-publishes.
 *
 * Fail-soft: a storage miss never throws to the caller — the API reports it
 * honestly rather than pretending the tool was saved.
 *
 * Server-only.
 */
import 'server-only';
import { randomUUID } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

export type SparkToolRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: string;
  prompt: string;
  html: string;
  status: 'draft' | 'approved' | 'rejected';
  requested_by: string | null;
  reviewer: string | null;
  review_note: string | null;
  created_at: string;
};

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = randomUUID().slice(0, 6);
  return `${base || 'tool'}-${suffix}`;
}

export async function createSparkTool(input: {
  title: string;
  summary: string;
  prompt: string;
  html: string;
  requestedBy?: string | null;
}): Promise<{ slug: string } | null> {
  try {
    const sb = getServiceClient();
    const slug = slugify(input.title);
    const { error } = await sb.from('spark_tools').insert({
      slug,
      title: input.title,
      summary: input.summary,
      prompt: input.prompt,
      html: input.html,
      status: 'draft',
      requested_by: input.requestedBy ?? null,
    });
    if (error) return null;
    return { slug };
  } catch {
    return null;
  }
}

export async function getSparkToolBySlug(slug: string): Promise<SparkToolRow | null> {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from('spark_tools').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    return data as SparkToolRow;
  } catch {
    return null;
  }
}

export async function listPendingSparkTools(): Promise<SparkToolRow[]> {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('spark_tools')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return [];
    return (data ?? []) as SparkToolRow[];
  } catch {
    return [];
  }
}

export async function decideSparkTool(
  slug: string,
  status: 'approved' | 'rejected',
  reviewer: string,
  note?: string,
): Promise<void> {
  try {
    const sb = getServiceClient();
    await sb
      .from('spark_tools')
      .update({
        status,
        reviewer,
        review_note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);
  } catch {
    // Fail soft — the row simply stays draft.
  }
}

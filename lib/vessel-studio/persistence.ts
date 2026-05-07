// Server-side persistence for vessel_generations.
// Only imported by server components and server actions — uses
// SUPABASE_SERVICE_ROLE_KEY which must never reach the browser.
//
// The apex Next.js site has no Supabase JS client and no end-user auth, so we
// can't satisfy the table's RLS policy (auth.uid() = user_id) from the browser.
// Instead, the server action uses the service-role key bound to a known
// FOUNDER_USER_ID. Both env vars must be set; otherwise persistence is skipped
// and the studio falls back to localStorage-only (the standalone behaviour).
//
// When the customer-facing Auaha studio lands in a follow-up PR, it will use a
// real authenticated Supabase JS client and `auth.uid()`.

import { isFounderAuthed } from './founderAuth';
import type {
  AspectRatio,
  Model,
  SizeExportRecord,
  Studio,
  VesselGeneration,
} from './types';

interface InsertGenerationInput {
  studio: Studio;
  preset_key: string;
  preset_label: string;
  prompt_full: string;
  prompt_to_provider: string;
  aspect_ratio: AspectRatio;
  variants: number;
  model: Model;
  reference_image_url: string | null;
  anchor_strength: number | null;
  image_urls: string[];
  cost_usd: number;
  generated_at: string;
}

export interface PersistenceResult {
  ok: boolean;
  reason?: string;
  generation?: VesselGeneration;
}

function getServerConfig(): {
  supabaseUrl: string;
  serviceRoleKey: string;
  founderUserId: string;
} | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const founderUserId = process.env.FOUNDER_USER_ID;
  if (!supabaseUrl || !serviceRoleKey || !founderUserId) return null;
  return { supabaseUrl, serviceRoleKey, founderUserId };
}

export async function isPersistenceConfigured(): Promise<boolean> {
  return getServerConfig() !== null;
}

async function authedRestRequest(
  path: string,
  init: RequestInit
): Promise<Response> {
  const cfg = getServerConfig();
  if (!cfg) throw new Error('Supabase server config missing');
  const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`;
  const headers = new Headers(init.headers);
  headers.set('apikey', cfg.serviceRoleKey);
  headers.set('Authorization', `Bearer ${cfg.serviceRoleKey}`);
  headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers });
}

export async function insertGeneration(
  input: InsertGenerationInput
): Promise<PersistenceResult> {
  if (!(await isFounderAuthed())) return { ok: false, reason: 'not authed' };
  const cfg = getServerConfig();
  if (!cfg) return { ok: false, reason: 'persistence not configured' };

  const row = {
    user_id: cfg.founderUserId,
    studio: input.studio,
    preset_key: input.preset_key,
    preset_label: input.preset_label,
    prompt_full: input.prompt_full,
    prompt_to_provider: input.prompt_to_provider,
    aspect_ratio: input.aspect_ratio,
    variants: input.variants,
    model: input.model,
    reference_image_url: input.reference_image_url,
    anchor_strength: input.anchor_strength,
    image_urls: input.image_urls,
    size_exports: [],
    cost_usd: input.cost_usd,
    generated_at: input.generated_at,
  };

  const resp = await authedRestRequest('vessel_generations', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { ok: false, reason: `${resp.status}: ${text.slice(0, 200)}` };
  }
  const data = (await resp.json()) as VesselGeneration[];
  return { ok: true, generation: data[0] };
}

export async function listGenerations(
  limit = 12
): Promise<VesselGeneration[]> {
  if (!(await isFounderAuthed())) return [];
  const cfg = getServerConfig();
  if (!cfg) return [];
  const params = new URLSearchParams({
    user_id: `eq.${cfg.founderUserId}`,
    order: 'generated_at.desc',
    limit: String(limit),
    select: '*',
  });
  const resp = await authedRestRequest(`vessel_generations?${params}`, {
    method: 'GET',
  });
  if (!resp.ok) return [];
  return (await resp.json()) as VesselGeneration[];
}

export async function recordSizeExport(
  generationId: string,
  exportRecord: SizeExportRecord
): Promise<PersistenceResult> {
  if (!(await isFounderAuthed())) return { ok: false, reason: 'not authed' };
  const cfg = getServerConfig();
  if (!cfg) return { ok: false, reason: 'persistence not configured' };

  // Read current size_exports, append, then PATCH back.
  const params = new URLSearchParams({
    id: `eq.${generationId}`,
    user_id: `eq.${cfg.founderUserId}`,
    select: 'size_exports',
  });
  const readResp = await authedRestRequest(`vessel_generations?${params}`, {
    method: 'GET',
  });
  if (!readResp.ok) {
    return { ok: false, reason: `read failed (${readResp.status})` };
  }
  const rows = (await readResp.json()) as Array<{
    size_exports: SizeExportRecord[];
  }>;
  if (rows.length === 0) return { ok: false, reason: 'generation not found' };
  const current = Array.isArray(rows[0].size_exports)
    ? rows[0].size_exports
    : [];
  const next = [...current, exportRecord];

  const patchResp = await authedRestRequest(
    `vessel_generations?id=eq.${generationId}&user_id=eq.${cfg.founderUserId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ size_exports: next }),
    }
  );
  if (!patchResp.ok) {
    const text = await patchResp.text().catch(() => '');
    return { ok: false, reason: `patch failed: ${text.slice(0, 200)}` };
  }
  return { ok: true };
}

export async function deleteGeneration(
  generationId: string
): Promise<PersistenceResult> {
  if (!(await isFounderAuthed())) return { ok: false, reason: 'not authed' };
  const cfg = getServerConfig();
  if (!cfg) return { ok: false, reason: 'persistence not configured' };

  const resp = await authedRestRequest(
    `vessel_generations?id=eq.${generationId}&user_id=eq.${cfg.founderUserId}`,
    { method: 'DELETE' }
  );
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { ok: false, reason: `${resp.status}: ${text.slice(0, 200)}` };
  }
  return { ok: true };
}

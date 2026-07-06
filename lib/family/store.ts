import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import type { FamilyItem, FamilyKind, FamilyStatus, ParsedWeek } from '@/lib/family/types';

/**
 * Family OS store — service-role reads/writes on public.family_items (RLS,
 * no policies). The parse endpoint proposes; the approve/dismiss actions
 * decide. Nothing here calls an external connector — that stays a handoff.
 */

export async function listFamily(hub = 'demo'): Promise<FamilyItem[]> {
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('family_items')
      .select('*')
      .eq('hub', hub)
      .order('created_at', { ascending: false })
      .limit(400);
    return (data ?? []) as FamilyItem[];
  } catch {
    return [];
  }
}

export function group(items: FamilyItem[]) {
  const by = (k: FamilyKind) => items.filter((i) => i.kind === k && i.status !== 'dismissed');
  return {
    events: by('event'),
    tasks: by('task'),
    pickups: by('pickup'),
    shopping: by('shopping'),
    approvals: by('approval'),
    memory: by('memory'),
    people: by('person'),
    // the trust centre: everything still waiting on the family
    proposed: items.filter((i) => i.status === 'proposed'),
  };
}

/** Write a parsed week as PROPOSED items (the agent's suggestions). */
export async function saveProposed(hub: string, source: string, week: ParsedWeek): Promise<number> {
  const rows: Array<Partial<FamilyItem>> = [];
  for (const e of week.events) rows.push({ hub, kind: 'event', title: e.title, when_label: e.when_label, person: e.person ?? null, location: e.location ?? null, detail: {}, source });
  for (const t of week.tasks) rows.push({ hub, kind: 'task', title: t.title, person: t.person ?? null, when_label: t.due_label ?? null, detail: {}, source });
  for (const p of week.pickups) rows.push({ hub, kind: 'pickup', title: `${p.child} — ${p.from}`, person: p.child, location: p.from, when_label: p.when_label, detail: { note: p.note ?? null, assigned: null, backup: null }, source });
  for (const s of week.shopping) rows.push({ hub, kind: 'shopping', title: s.list, detail: { items: s.items, reason: s.reason ?? null }, source });
  for (const a of week.approvals) rows.push({ hub, kind: 'approval', title: a.title, detail: { reason: a.reason, kind: a.kind }, source });
  for (const m of week.memory) rows.push({ hub, kind: 'memory', title: m.fact, person: m.person ?? null, detail: {}, source });

  if (rows.length === 0) return 0;
  try {
    const sb = getServiceClient();
    const { error, count } = await sb.from('family_items').insert(rows, { count: 'exact' });
    if (error) return 0;
    return count ?? rows.length;
  } catch {
    return 0;
  }
}

export async function decide(id: string, status: FamilyStatus): Promise<void> {
  try {
    const sb = getServiceClient();
    await sb.from('family_items').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  } catch {
    // fail soft
  }
}

/** Assign a pickup owner (or backup) — stored on the item detail. */
export async function assignPickup(id: string, field: 'assigned' | 'backup', who: string): Promise<void> {
  try {
    const sb = getServiceClient();
    const { data } = await sb.from('family_items').select('detail').eq('id', id).maybeSingle();
    const detail = { ...(data?.detail ?? {}), [field]: who };
    await sb.from('family_items').update({ detail, status: field === 'assigned' ? 'approved' : undefined, updated_at: new Date().toISOString() }).eq('id', id);
  } catch {
    // fail soft
  }
}

/** Clear a previous parse's proposed items (so a re-parse is clean). */
export async function clearProposed(hub = 'demo', source?: string): Promise<void> {
  try {
    const sb = getServiceClient();
    let q = sb.from('family_items').delete().eq('hub', hub).eq('status', 'proposed');
    if (source) q = q.eq('source', source);
    await q;
  } catch {
    // fail soft
  }
}

export async function familyContext(hub = 'demo'): Promise<{ children: string[]; memory: string[] }> {
  const items = await listFamily(hub);
  return {
    children: items.filter((i) => i.kind === 'person' && (i.detail as { role?: string })?.role === 'child').map((i) => i.title),
    memory: items.filter((i) => i.kind === 'memory' && i.status === 'approved').map((i) => i.title),
  };
}

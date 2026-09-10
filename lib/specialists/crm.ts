import { z } from 'zod';

export const STAGES = ['new', 'contacted', 'qualified', 'closed'] as const;
export const leadInput = z.object({
  name: z.string().trim().min(1).max(160), company: z.string().trim().max(160).default(''),
  email: z.union([z.email(), z.literal('')]).default(''), phone: z.string().max(60).default(''),
  value: z.number().min(0).max(99999999.99).nullable().default(null),
  stage: z.enum(STAGES).default('new'), source: z.string().max(1500).default(''),
  notes: z.string().max(12000).default(''), owner: z.string().max(120).default(''),
  nextAction: z.string().max(500).default(''), due: z.union([z.iso.date(), z.literal('')]).default(''),
  permission: z.enum(['not-confirmed', 'requested-contact', 'existing-relationship', 'do-not-contact']).default('not-confirmed'),
}).strict();
export type LeadInput = z.infer<typeof leadInput>;
export type Lead = LeadInput & { id: string; created_at?: string; updated_at?: string };
export const blankLead: LeadInput = { name: '', company: '', email: '', phone: '', value: null, stage: 'new', source: '', notes: '', owner: '', nextAction: '', due: '', permission: 'not-confirmed' };

export function encodeLead(input: LeadInput) {
  const { owner, nextAction, due, permission, notes, ...record } = input;
  return { ...record, notes: JSON.stringify({ format: 'assembl-flux-v1', notes, owner, nextAction, due, permission }) };
}

export function decodeLead(record: Record<string, unknown>): Lead {
  let detail: Record<string, unknown> = {};
  try { const parsed = JSON.parse(String(record.notes ?? '')); if (parsed.format === 'assembl-flux-v1') detail = parsed; } catch { /* Preserve legacy free text. */ }
  return { ...blankLead, id: String(record.id), name: String(record.name ?? ''), company: String(record.company ?? ''), email: String(record.email ?? ''), phone: String(record.phone ?? ''), source: String(record.source ?? ''), stage: STAGES.includes(record.stage as LeadInput['stage']) ? record.stage as LeadInput['stage'] : 'new', value: record.value == null ? null : Number(record.value), notes: typeof detail.notes === 'string' ? detail.notes : String(record.notes ?? ''), owner: String(detail.owner ?? ''), nextAction: String(detail.nextAction ?? ''), due: String(detail.due ?? ''), permission: (detail.permission ?? 'not-confirmed') as LeadInput['permission'], created_at: String(record.created_at ?? ''), updated_at: String(record.updated_at ?? '') };
}

export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function leadsCsv(leads: Lead[]): string {
  const fields: (keyof LeadInput)[] = ['name', 'company', 'email', 'phone', 'value', 'stage', 'source', 'owner', 'nextAction', 'due', 'permission', 'notes'];
  return [fields.join(','), ...leads.map(l => fields.map(f => csvCell(l[f])).join(','))].join('\r\n');
}

export function normalisedCompany(value: string): string { return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\s+/g, ' '); }

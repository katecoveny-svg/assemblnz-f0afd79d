import 'server-only';
import { randomUUID } from 'node:crypto';
import { commercialDocumentNumber, documentTotals } from '@/lib/living-site/documents';
import { getServiceClient } from '@/lib/supabase/service';

export type LivingSiteDocumentKind = 'proposal' | 'invoice';
export type LivingSiteDocumentStatus = 'draft' | 'approved' | 'sent' | 'paid' | 'void';

export type LivingSiteDocument = {
  id: string;
  tenant: string;
  kind: LivingSiteDocumentKind;
  documentNumber: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPriceNzd: number;
  subtotalNzd: number;
  gstNzd: number;
  totalNzd: number;
  notes: string | null;
  status: LivingSiteDocumentStatus;
  createdAt: string;
  updatedAt: string;
};

type DocumentRow = {
  id: string;
  tenant: string;
  kind: LivingSiteDocumentKind;
  document_number: string;
  client_name: string;
  client_email: string;
  service_id: string;
  description: string;
  quantity: number | string;
  unit_price_nzd: number | string;
  subtotal_nzd: number | string;
  gst_nzd: number | string;
  total_nzd: number | string;
  notes: string | null;
  status: LivingSiteDocumentStatus;
  created_at: string;
  updated_at: string;
};

function fromRow(row: DocumentRow): LivingSiteDocument {
  return {
    id: row.id,
    tenant: row.tenant,
    kind: row.kind,
    documentNumber: row.document_number,
    clientName: row.client_name,
    clientEmail: row.client_email,
    serviceId: row.service_id,
    description: row.description,
    quantity: Number(row.quantity),
    unitPriceNzd: Number(row.unit_price_nzd),
    subtotalNzd: Number(row.subtotal_nzd),
    gstNzd: Number(row.gst_nzd),
    totalNzd: Number(row.total_nzd),
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createDocumentIdentity(kind: LivingSiteDocumentKind, now = new Date()): {
  id: string;
  documentNumber: string;
} {
  const id = randomUUID();
  return { id, documentNumber: commercialDocumentNumber(kind, id, now) };
}

export async function storeDocument(input: {
  tenant: string;
  kind: LivingSiteDocumentKind;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPriceNzd: number;
  notes?: string;
}): Promise<LivingSiteDocument | null> {
  const identity = createDocumentIdentity(input.kind);
  const totals = documentTotals(input.quantity, input.unitPriceNzd);
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_documents')
      .insert({
        id: identity.id,
        tenant: input.tenant,
        kind: input.kind,
        document_number: identity.documentNumber,
        client_name: input.clientName,
        client_email: input.clientEmail,
        service_id: input.serviceId,
        description: input.description,
        quantity: input.quantity,
        unit_price_nzd: input.unitPriceNzd,
        subtotal_nzd: totals.subtotal,
        gst_nzd: totals.gst,
        total_nzd: totals.total,
        notes: input.notes ?? null,
        status: 'draft',
        source: 'owner-studio',
      })
      .select('id, tenant, kind, document_number, client_name, client_email, service_id, description, quantity, unit_price_nzd, subtotal_nzd, gst_nzd, total_nzd, notes, status, created_at, updated_at')
      .single();
    if (error || !data) return null;
    return fromRow(data as DocumentRow);
  } catch {
    return null;
  }
}

export async function getRecentDocuments(tenant: string, limit = 12): Promise<LivingSiteDocument[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_documents')
      .select('id, tenant, kind, document_number, client_name, client_email, service_id, description, quantity, unit_price_nzd, subtotal_nzd, gst_nzd, total_nzd, notes, status, created_at, updated_at')
      .eq('tenant', tenant)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as DocumentRow[]).map(fromRow);
  } catch {
    return [];
  }
}

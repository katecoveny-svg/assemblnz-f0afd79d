import { z } from 'zod';
import { NzServiceError } from './auth';
export const entryDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
    const d = new Date(`${v}T00:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
});
const yes = z.enum(['yes', 'no', 'unknown']);
const presence = z.enum(['present', 'absent', 'unknown']);
const decimal = z.string().regex(/^\d{1,12}(?:\.\d{1,6})?$/);
const count = z.number().int().min(0).max(1e9).nullable();
const packageUnit = z.enum(['cartons', 'pallets', 'pieces', 'other', 'unknown']);
export const shipmentReviewInput = z.object({
    destination_country: z.literal('NZ'), transport_mode: z.literal('sea_container'), shipment_date: entryDate.nullable(), intended_lodgement_date: entryDate.nullable(),
    goods_condition: z.enum(['new', 'used', 'unknown']), goods_category: z.enum(['manufactured_nonfood', 'food', 'plant_animal_material', 'vehicle_machinery_parts', 'chemicals_dangerous', 'medical', 'firearms_controlled', 'mixed', 'unknown']),
    country_of_manufacture: z.string().regex(/^[A-Z]{2}$/).nullable(), country_of_export: z.string().regex(/^[A-Z]{2}$/).nullable(), wood_packaging: yes, origin_preference_claimed: yes,
    documents: z.object({ commercial_invoice: presence, packing_list: presence, transport_document: presence, quarantine_declaration: presence, origin_evidence: presence, treatment_evidence: presence }).strict(),
    quarantine_signed: yes, transitional_facility_arranged: yes,
    comparisons: z.object({ consignee_consistency: z.enum(['matched', 'mismatch', 'unknown']), cargo_description_consistency: z.enum(['matched', 'mismatch', 'unknown']), reference_consistency: z.enum(['matched', 'mismatch', 'unknown']) }).strict(),
    quantities: z.object({ invoice_units: count, packing_units: count, invoice_packages: count, packing_packages: count, transport_packages: count,
        invoice_package_unit: packageUnit, packing_package_unit: packageUnit, transport_package_unit: packageUnit }).strict().optional(),
    weights: z.object({ net_kg: decimal.nullable(), gross_kg: decimal.nullable(), same_goods_basis: yes }).strict().optional(),
    invoice_math: z.object({ line_subtotal: decimal, stated_goods_subtotal: decimal, stated_invoice_total: decimal.nullable(), explicit_adjustments: decimal.nullable(), currency: z.string().regex(/^[A-Z]{3}$/) }).strict().optional(),
}).strict();
export const FREIGHT_SOURCES = {
    import: 'https://www.customs.govt.nz/business/import',
    sea_container: 'https://www.mpi.govt.nz/import/border-clearance/containers-and-cargo/',
    tariffs: 'https://www.customs.govt.nz/business/tariffs/tariff-classifications-and-rates',
    fx: 'https://www.customs.govt.nz/business/import/customs-rates-of-exchange',
} as const;
export const FREIGHT_NOTICE = 'Preparation for broker review only. Document presence and consistency do not establish admissibility, classification, valuation, origin entitlement, authenticity, sanctions compliance or Customs/MPI release.';
const decimalUnits = (v: string) => { const [a, b = ''] = v.split('.'); return BigInt(a) * 1000000n + BigInt(b.padEnd(6, '0')); };
export function reviewShipmentDocuments(raw: unknown, now = Date.now()) {
    const parsed = shipmentReviewInput.safeParse(raw);
    if (!parsed.success)
        throw new NzServiceError('invalid_input');
    const p = parsed.data;
    const checks: {
        id: string;
        status: 'supplied' | 'missing' | 'conflicting' | 'not_assessed' | 'not_applicable';
        priority: 'blocking' | 'review' | 'information';
        message: string;
        action: string;
        basis: 'broker_preparation_practice' | 'arithmetic';
        source_ids: string[];
        evidence_fields: string[];
    }[] = [];
    const add = (id: string, status: typeof checks[number]['status'], message: string, fields: string[], basis: typeof checks[number]['basis'] = 'broker_preparation_practice') => checks.push({ id, status, priority: status === 'conflicting' || status === 'missing' ? 'blocking' : 'review', message, action: 'Confirm the supplied evidence and resolve this item with the broker before relying on the packet.', basis, source_ids: [id.startsWith('container') || id === 'wood_packaging' ? 'sea_container' : 'import'], evidence_fields: fields });
    for (const name of ['commercial_invoice', 'packing_list', 'transport_document', 'quarantine_declaration'] as const)
        add(name, p.documents[name] === 'present' ? 'supplied' : p.documents[name] === 'absent' ? 'missing' : 'not_assessed', `User-reported ${name.replace(/_/g, ' ')}: ${p.documents[name]}.`, [`documents.${name}`]);
    for (const name of ['quarantine_signed', 'transitional_facility_arranged'] as const)
        add(`container_${name}`, p[name] === 'yes' ? 'supplied' : p[name] === 'no' ? 'missing' : 'not_assessed', `Sea-container preparation: ${name.replace(/_/g, ' ')} is ${p[name]}.`, [name]);
    add('wood_packaging', p.wood_packaging === 'no' ? 'not_applicable' : 'not_assessed', 'Wood packaging requires broker/MPI review of applicable requirements and treatment evidence; a mark or document-presence flag does not prove compliance.', ['wood_packaging', 'documents.treatment_evidence']);
    if (p.origin_preference_claimed === 'yes')
        add('origin_evidence', p.documents.origin_evidence === 'present' ? 'supplied' : p.documents.origin_evidence === 'absent' ? 'missing' : 'not_assessed', 'Origin preference requires supporting evidence and broker review; country of export is not proof of origin entitlement.', ['origin_preference_claimed', 'documents.origin_evidence']);
    if (p.origin_preference_claimed === 'unknown')
        add('origin_claim', 'not_assessed', 'Confirm whether origin preference is being claimed.', ['origin_preference_claimed']);
    for (const [name, value] of Object.entries(p.comparisons))
        add(name, value === 'matched' ? 'supplied' : value === 'mismatch' ? 'conflicting' : 'not_assessed', `User-reported ${name}: ${value}; identity/reference values were not transferred.`, [`comparisons.${name}`]);
    const q = p.quantities;
    if (q) {
        add('unit_counts', q.invoice_units === null || q.packing_units === null ? 'not_assessed' : q.invoice_units === q.packing_units ? 'supplied' : 'conflicting', 'Compare invoice/packing goods units only on the supplied common measurement basis.', ['quantities.invoice_units', 'quantities.packing_units'], 'arithmetic');
        for (const [left, right] of [['invoice', 'packing'], ['packing', 'transport']] as const) {
            const a = q[`${left}_packages`], b = q[`${right}_packages`], u = q[`${left}_package_unit`], v = q[`${right}_package_unit`];
            add(`${left}_${right}_packages`, a === null || b === null || u !== v || ['other', 'unknown'].includes(u) ? 'not_assessed' : a === b ? 'supplied' : 'conflicting', 'Package counts compare only matching explicit carton/pallet/piece units; no conversion was inferred.', [`quantities.${left}_packages`, `quantities.${right}_packages`], 'arithmetic');
        }
    }
    if (p.weights)
        add('weights', p.weights.same_goods_basis !== 'yes' || p.weights.gross_kg === null || p.weights.net_kg === null ? 'not_assessed' : decimalUnits(p.weights.gross_kg) < decimalUnits(p.weights.net_kg) ? 'conflicting' : 'supplied', 'Compare goods gross/net only on the same basis, excluding container tare.', ['weights'], 'arithmetic');
    if (p.invoice_math) {
        const m = p.invoice_math;
        add('goods_subtotal', decimalUnits(m.line_subtotal) === decimalUnits(m.stated_goods_subtotal) ? 'supplied' : 'conflicting', 'Compare the explicitly supplied goods subtotals, using decimal arithmetic.', ['invoice_math.line_subtotal', 'invoice_math.stated_goods_subtotal'], 'arithmetic');
        add('invoice_total', m.explicit_adjustments === null || m.stated_invoice_total === null ? 'not_assessed' : decimalUnits(m.stated_goods_subtotal) + decimalUnits(m.explicit_adjustments) === decimalUnits(m.stated_invoice_total) ? 'supplied' : 'conflicting', 'Total comparison uses only explicitly supplied adjustments; unknown freight/tax/discounts are not assumed zero.', ['invoice_math'], 'arithmetic');
    }
    const specialist = p.goods_condition === 'used' || !['manufactured_nonfood', 'unknown'].includes(p.goods_category);
    const unknownScope = p.goods_condition === 'unknown' || p.goods_category === 'unknown';
    const unresolved = checks.filter(c => c.status === 'missing' || c.status === 'conflicting' || c.status === 'not_assessed');
    return { assessment_type: 'evidence_preparation', review_required: true, regulatory_clearance: 'not_assessed',
        scope_status: specialist ? 'specialist_review' : unknownScope ? 'insufficient_scope_information' : 'in_scope',
        packet_status: checks.some(c => ['missing', 'conflicting'].includes(c.status)) ? 'needs_evidence' : unresolved.length || specialist || unknownScope ? 'unable_to_assess' : 'ready_for_broker_review',
        checks, broker_questions: unresolved.map(c => ({ check_id: c.id, question: c.message, action: c.action })), unknowns: checks.filter(c => c.status === 'not_assessed').map(c => c.id),
        explicitly_not_assessed: ['commodity IHS applicability', 'classification', 'admissibility', 'valuation', 'origin entitlement', 'authenticity', 'sanctions', 'release', 'declaration submission'],
        source_versions: Object.entries(FREIGHT_SOURCES).map(([source_id, url]) => ({ source_id, url, freshness: 'unknown', retrieved_at: null, role: 'curated reference; not fetched or reviewed at runtime; source-dependent legal checks are not assessed' })),
        ruleset_version: '0.1.0', generated_at: new Date(now).toISOString(), expires_at: new Date(now + 86400000).toISOString(), disclaimer: FREIGHT_NOTICE };
}
export const officialSourcesInput = z.object({ topic: z.enum(['sea_container', 'tariff', 'exchange_rates']), as_of_date: entryDate.nullable() }).strict();
export function getFreightSources(raw: unknown) {
    const p = officialSourcesInput.safeParse(raw);
    if (!p.success)
        throw new NzServiceError('invalid_input');
    const topic = p.data.topic === 'tariff' ? 'tariffs' : p.data.topic === 'exchange_rates' ? 'fx' : 'sea_container';
    return { sources: [{ url: FREIGHT_SOURCES[topic], authority: topic === 'sea_container' ? 'MPI' : 'New Zealand Customs Service', freshness: 'unknown', retrieved_at: null }], as_of_date: p.data.as_of_date, notice: 'Curated public primary reference. No runtime content or historical guidance verification; verify the applicable version with the broker.' };
}

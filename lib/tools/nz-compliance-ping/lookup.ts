import { ToolHttpError } from '../errors';
import { isNzbnConfigured, NzbnClient } from '../nz-who-runs-it/nzbn-client';
import { sandboxCompliancePing } from './fixtures';
import {
  COMPLIANCE_DISCLAIMER,
  type ComplianceFlag,
  type CompliancePingInput,
  type CompliancePingResult,
} from './types';

const NZBN_RE = /^\d{13}$/;

export function parseCompliancePingInput(body: unknown): CompliancePingInput {
  if (!body || typeof body !== 'object') {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: 'Body must be a JSON object with `company`.',
      fix: 'POST { "company": "<name or 13-digit NZBN>" }.',
    });
  }
  const company = (body as { company?: unknown }).company;
  if (typeof company !== 'string' || !company.trim()) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`company` must be a non-empty string (name or NZBN).',
      fix: 'Provide a trading/legal name or a 13-digit NZBN.',
    });
  }
  if (company.trim().length > 200) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`company` is too long (max 200 characters).',
      fix: 'Shorten the company name or pass the NZBN only.',
    });
  }
  return { company: company.trim() };
}

function flagsFromEntity(entity: {
  entityStatusDescription?: string;
  entityTypeDescription?: string;
  entityStatusCode?: string;
}): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const status =
    entity.entityStatusDescription ?? entity.entityStatusCode ?? '';
  const type = entity.entityTypeDescription ?? '';

  if (status) {
    const lowered = status.toLowerCase();
    const removed =
      lowered.includes('removed') ||
      lowered.includes('struck') ||
      lowered.includes('liquidation') ||
      lowered.includes('dissolved');
    flags.push({
      code: removed ? 'entity_inactive' : 'entity_status',
      severity: removed ? 'alert' : 'info',
      message: `NZBN entity status: ${status}.`,
      source: 'nzbn',
    });
  }
  if (type) {
    flags.push({
      code: 'entity_type',
      severity: 'info',
      message: `NZBN entity type: ${type}.`,
      source: 'nzbn',
    });
  }
  flags.push({
    code: 'gst_not_asserted',
    severity: 'watch',
    message:
      'GST / tax registration is not asserted by this endpoint — confirm via IRD / NZBN GST indicators if required.',
    source: 'assembl',
  });
  return flags;
}

export async function runCompliancePing(
  input: CompliancePingInput,
  opts: { sandbox: boolean; nzbnClient?: NzbnClient },
): Promise<CompliancePingResult> {
  if (opts.sandbox) {
    return sandboxCompliancePing(input.company);
  }

  const client = opts.nzbnClient ?? new NzbnClient();
  if (!client.isConfigured() || !isNzbnConfigured()) {
    throw new ToolHttpError({
      status: 503,
      code: 'upstream_unconfigured',
      message: 'Live nz-compliance-ping requires NZBN_API_KEY.',
      fix: 'Set NZBN_API_KEY (free at api.business.govt.nz) or use a test_ sandbox key. This tool does not invent compliance status.',
    });
  }

  try {
    let entity = NZBN_RE.test(input.company)
      ? await client.getEntity(input.company)
      : null;
    if (!entity) {
      const hits = await client.searchEntities(input.company);
      const first = hits[0];
      if (first?.nzbn) {
        entity = (await client.getEntity(first.nzbn)) ?? first;
      } else {
        entity = first ?? null;
      }
    }

    if (!entity) {
      return {
        status: 'not_found',
        query: input.company,
        legalName: null,
        nzbn: null,
        entityStatus: null,
        entityType: null,
        flags: [],
        sourceLinks: [
          { label: 'NZBN register', url: 'https://www.nzbn.govt.nz/' },
        ],
        adapters: { nzbn: 'live' },
        sandbox: false,
        disclaimer: COMPLIANCE_DISCLAIMER,
        gaps: ['No NZBN register match for this query.'],
      };
    }

    const nzbn = typeof entity.nzbn === 'string' ? entity.nzbn : null;
    const legalName =
      typeof entity.entityName === 'string' ? entity.entityName : null;
    const entityStatus =
      (typeof entity.entityStatusDescription === 'string'
        ? entity.entityStatusDescription
        : null) ??
      (typeof entity.entityStatusCode === 'string'
        ? entity.entityStatusCode
        : null);
    const entityType =
      (typeof entity.entityTypeDescription === 'string'
        ? entity.entityTypeDescription
        : null) ??
      (typeof entity.entityTypeCode === 'string'
        ? entity.entityTypeCode
        : null);

    const flags = flagsFromEntity(entity);

    return {
      status: flags.some((f) => f.severity === 'alert') ? 'partial' : 'ok',
      query: input.company,
      legalName,
      nzbn,
      entityStatus,
      entityType,
      flags,
      sourceLinks: [
        {
          label: 'NZBN public register',
          url: nzbn
            ? `https://www.nzbn.govt.nz/mynzbn/nzbndetails/${encodeURIComponent(nzbn)}`
            : 'https://www.nzbn.govt.nz/',
        },
        {
          label: 'Companies Office search',
          url: `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=${encodeURIComponent(legalName ?? input.company)}`,
        },
      ],
      adapters: { nzbn: 'live' },
      sandbox: false,
      disclaimer: COMPLIANCE_DISCLAIMER,
      gaps: [
        'Live path reads NZBN entity status/type only — not a full compliance audit.',
        'Director PII is intentionally omitted here; use nz-who-runs-it for directors.',
      ],
    };
  } catch (err) {
    if (err instanceof ToolHttpError) throw err;
    throw new ToolHttpError({
      status: 502,
      code: 'upstream_failure',
      message:
        err instanceof Error ? err.message : 'NZBN compliance ping failed.',
      fix: 'Retry once. Confirm NZBN_API_KEY is valid, or use a test_ sandbox key.',
    });
  }
}

import { ToolHttpError } from '../errors';
import { sandboxWhoRunsIt } from './fixtures';
import {
  NzbnClient,
  NzbnNotConfiguredError,
  NzbnUpstreamError,
  type NzbnEntity,
} from './nzbn-client';
import type {
  WhoRunsItContactHints,
  WhoRunsItDirector,
  WhoRunsItInput,
  WhoRunsItResult,
} from './types';

const NZBN_REGEX = /^\d{13}$/;

export function parseWhoRunsItInput(body: unknown): WhoRunsItInput {
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
      fix: 'Provide company as a trading/legal name or a 13-digit NZBN.',
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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function extractDirectors(entity: NzbnEntity): WhoRunsItDirector[] {
  const roles = asArray(entity.roles);
  const out: WhoRunsItDirector[] = [];
  for (const role of roles) {
    if (!role || typeof role !== 'object') continue;
    const r = role as Record<string, unknown>;
    const roleType = String(
      r.roleType ?? r.roleTypeDescription ?? r.type ?? '',
    ).toLowerCase();
    if (roleType && !roleType.includes('director')) continue;
    const person = (r.rolePerson ?? r.person ?? r) as Record<string, unknown>;
    const name =
      (typeof person.fullName === 'string' && person.fullName) ||
      [person.firstName, person.lastName].filter((x) => typeof x === 'string').join(' ') ||
      (typeof r.roleName === 'string' ? r.roleName : '') ||
      (typeof r.name === 'string' ? r.name : '');
    if (!name.trim()) continue;
    out.push({
      name: name.trim(),
      role: String(r.roleTypeDescription ?? r.roleType ?? 'Director'),
      appointedOn:
        typeof r.roleStatusDate === 'string'
          ? r.roleStatusDate
          : typeof r.startDate === 'string'
            ? r.startDate
            : null,
    });
  }
  return out;
}

function extractRegisteredOffice(entity: NzbnEntity): string | null {
  const addresses = asArray(entity.addresses);
  for (const addr of addresses) {
    if (!addr || typeof addr !== 'object') continue;
    const a = addr as Record<string, unknown>;
    const type = String(a.addressType ?? a.type ?? '').toLowerCase();
    if (type && !type.includes('registered') && !type.includes('office')) {
      continue;
    }
    const parts = [
      a.address1 ?? a.addressLine1,
      a.address2 ?? a.addressLine2,
      a.address3,
      a.suburb,
      a.city ?? a.town,
      a.postCode ?? a.postcode,
      a.countryCode ?? a.country,
    ]
      .filter((p) => typeof p === 'string' && p.trim())
      .map((p) => String(p).trim());
    if (parts.length) return parts.join(', ');
  }
  // Fallback: any address if typed ones missing
  for (const addr of addresses) {
    if (!addr || typeof addr !== 'object') continue;
    const a = addr as Record<string, unknown>;
    const parts = [a.address1, a.suburb, a.city, a.postCode]
      .filter((p) => typeof p === 'string' && p.trim())
      .map((p) => String(p).trim());
    if (parts.length) return parts.join(', ');
  }
  return null;
}

function extractContactHints(entity: NzbnEntity): WhoRunsItContactHints {
  const emails: string[] = [];
  const phones: string[] = [];
  const websites: string[] = [];

  for (const e of asArray(entity.emailAddresses)) {
    if (typeof e === 'string' && e.includes('@')) emails.push(e);
    else if (e && typeof e === 'object') {
      const v = (e as { emailAddress?: string }).emailAddress;
      if (typeof v === 'string' && v.includes('@')) emails.push(v);
    }
  }
  for (const p of asArray(entity.phoneNumbers)) {
    if (typeof p === 'string') phones.push(p);
    else if (p && typeof p === 'object') {
      const v = (p as { phoneNumber?: string }).phoneNumber;
      if (typeof v === 'string') phones.push(v);
    }
  }
  for (const w of asArray(entity.websites)) {
    if (typeof w === 'string') websites.push(w);
    else if (w && typeof w === 'object') {
      const v = (w as { url?: string; website?: string }).url ??
        (w as { website?: string }).website;
      if (typeof v === 'string') websites.push(v);
    }
  }

  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    websites: [...new Set(websites)],
    notes: [
      'Contact fields only include values published on the NZBN register record.',
    ],
  };
}

function mapEntity(query: string, entity: NzbnEntity): WhoRunsItResult {
  const directors = extractDirectors(entity);
  const registeredOffice = extractRegisteredOffice(entity);
  const nzbn = entity.nzbn ?? null;
  const legalName = entity.entityName ?? null;
  const gaps: string[] = [];
  if (!directors.length) {
    gaps.push(
      'No public directors on the NZBN record returned. Companies Office may list more.',
    );
  }
  if (!registeredOffice) {
    gaps.push('Registered office not present on this NZBN payload.');
  }

  const status =
    legalName || nzbn
      ? gaps.length
        ? 'partial'
        : 'ok'
      : 'not_found';

  return {
    status,
    query,
    legalName,
    nzbn,
    entityStatus:
      entity.entityStatusDescription ?? entity.entityStatusCode ?? null,
    entityType:
      entity.entityTypeDescription ?? entity.entityTypeCode ?? null,
    directors,
    registeredOffice,
    contactHints: extractContactHints(entity),
    sourceLinks: [
      {
        label: 'NZBN public register',
        url: nzbn
          ? `https://www.nzbn.govt.nz/mynzbn/nzbndetails/${encodeURIComponent(nzbn)}`
          : 'https://www.nzbn.govt.nz/',
      },
      {
        label: 'Companies Office search',
        url: `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=${encodeURIComponent(legalName ?? query)}`,
      },
    ],
    sandbox: false,
    gaps,
  };
}

export async function runWhoRunsIt(
  input: WhoRunsItInput,
  opts: { sandbox: boolean; client?: NzbnClient },
): Promise<WhoRunsItResult> {
  if (opts.sandbox) {
    return sandboxWhoRunsIt(input.company);
  }

  const client = opts.client ?? new NzbnClient();
  if (!client.isConfigured()) {
    throw new ToolHttpError({
      status: 503,
      code: 'upstream_unconfigured',
      message: 'Live NZBN upstream is not configured on this deployment.',
      fix: 'Set NZBN_API_KEY (api.business.govt.nz subscription key). For dry-runs, use a key starting with test_ to hit sandbox fixtures.',
    });
  }

  try {
    let entity: NzbnEntity | null = null;
    if (NZBN_REGEX.test(input.company)) {
      entity = await client.getEntity(input.company);
    } else {
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
        directors: [],
        registeredOffice: null,
        contactHints: {
          emails: [],
          phones: [],
          websites: [],
          notes: ['No NZBN register match for this query.'],
        },
        sourceLinks: [
          {
            label: 'Companies Office search',
            url: `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=${encodeURIComponent(input.company)}`,
          },
          {
            label: 'NZBN register',
            url: 'https://www.nzbn.govt.nz/',
          },
        ],
        sandbox: false,
        gaps: ['Entity not found on NZBN register for this query.'],
      };
    }

    return mapEntity(input.company, entity);
  } catch (err) {
    if (err instanceof ToolHttpError) throw err;
    if (err instanceof NzbnNotConfiguredError) {
      throw new ToolHttpError({
        status: 503,
        code: 'upstream_unconfigured',
        message: err.message,
        fix: 'Set NZBN_API_KEY or use a test_ sandbox key.',
      });
    }
    if (err instanceof NzbnUpstreamError) {
      throw new ToolHttpError({
        status: 502,
        code: 'upstream_failure',
        message: err.message,
        fix: 'Retry once. Confirm NZBN_API_KEY is valid at api.business.govt.nz. Use test_ keys while debugging.',
        details: { upstreamStatus: err.status },
      });
    }
    throw err;
  }
}

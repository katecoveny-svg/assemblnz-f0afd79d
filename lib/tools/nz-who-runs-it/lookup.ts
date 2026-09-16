import { ToolHttpError } from '../errors';
import {
  CompaniesOfficeClient,
  COMPANIES_OFFICE_SOURCE,
  type CompaniesOfficeCompany,
} from './companies-office-client';
import { sandboxWhoRunsIt } from './fixtures';
import {
  NzbnClient,
  NzbnNotConfiguredError,
  NzbnUpstreamError,
  type NzbnEntity,
} from './nzbn-client';
import {
  WHO_RUNS_IT_PRIVACY,
  type WhoRunsItAdapters,
  type WhoRunsItContactHints,
  type WhoRunsItDirector,
  type WhoRunsItInput,
  type WhoRunsItResult,
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

/** Keep only public name/role/appointment — never addresses or DOB. */
function publicDirector(partial: {
  name: string;
  role?: string;
  appointedOn?: string | null;
}): WhoRunsItDirector {
  return {
    name: partial.name.trim(),
    role: partial.role,
    appointedOn: partial.appointedOn ?? null,
  };
}

function extractDirectorsFromNzbn(entity: NzbnEntity): WhoRunsItDirector[] {
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
    // Explicitly ignore address / dateOfBirth fields even if present.
    const name =
      (typeof person.fullName === 'string' && person.fullName) ||
      [person.firstName, person.middleName, person.lastName]
        .filter((x) => typeof x === 'string')
        .join(' ') ||
      (typeof r.roleName === 'string' ? r.roleName : '') ||
      (typeof r.name === 'string' ? r.name : '');
    if (!name.trim()) continue;
    out.push(
      publicDirector({
        name,
        role: String(r.roleTypeDescription ?? r.roleType ?? 'Director'),
        appointedOn:
          typeof r.roleStatusDate === 'string'
            ? r.roleStatusDate
            : typeof r.startDate === 'string'
              ? r.startDate
              : null,
      }),
    );
  }
  return dedupeDirectors(out);
}

function extractDirectorsFromCompaniesOffice(
  company: CompaniesOfficeCompany,
): WhoRunsItDirector[] {
  const out: WhoRunsItDirector[] = [];
  for (const d of asArray(company.directors)) {
    if (!d || typeof d !== 'object') continue;
    const row = d as Record<string, unknown>;
    const name =
      (typeof row.fullName === 'string' && row.fullName) ||
      [row.firstName, row.middleName, row.lastName]
        .filter((x) => typeof x === 'string')
        .join(' ') ||
      (typeof row.name === 'string' ? row.name : '');
    if (!name.trim()) continue;
    out.push(
      publicDirector({
        name,
        role: typeof row.role === 'string' ? row.role : 'Director',
        appointedOn:
          typeof row.appointmentDate === 'string'
            ? row.appointmentDate
            : typeof row.appointedOn === 'string'
              ? row.appointedOn
              : null,
      }),
    );
  }
  return dedupeDirectors(out);
}

function dedupeDirectors(list: WhoRunsItDirector[]): WhoRunsItDirector[] {
  const seen = new Set<string>();
  const out: WhoRunsItDirector[] = [];
  for (const d of list) {
    const key = d.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

function extractRegisteredOffice(
  entity: NzbnEntity | CompaniesOfficeCompany,
): string | null {
  const addresses = asArray(entity.addresses);
  for (const addr of addresses) {
    if (!addr || typeof addr !== 'object') continue;
    const a = addr as Record<string, unknown>;
    const type = String(a.addressType ?? a.type ?? '').toLowerCase();
    // Prefer registered office; never treat "residential" as office output.
    if (type.includes('residential') || type.includes('director')) continue;
    if (type && !type.includes('registered') && !type.includes('office') && !type.includes('service')) {
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
  for (const addr of addresses) {
    if (!addr || typeof addr !== 'object') continue;
    const a = addr as Record<string, unknown>;
    const type = String(a.addressType ?? a.type ?? '').toLowerCase();
    if (type.includes('residential') || type.includes('director')) continue;
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
      const v =
        (w as { url?: string; website?: string }).url ??
        (w as { website?: string }).website;
      if (typeof v === 'string') websites.push(v);
    }
  }

  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    websites: [...new Set(websites)],
    notes: [
      'Contact fields only include values published on the NZBN register record — never invented or scraped.',
    ],
  };
}

function companyNumberFromNzbn(entity: NzbnEntity): string | null {
  const id = entity.sourceRegisterUniqueIdentifier;
  if (typeof id === 'string' && /^\d+$/.test(id)) return id;
  return null;
}

function mergeLiveResult(opts: {
  query: string;
  entity: NzbnEntity;
  company: CompaniesOfficeCompany | null;
  adapters: WhoRunsItAdapters;
}): WhoRunsItResult {
  const { query, entity, company, adapters } = opts;
  let directors = extractDirectorsFromNzbn(entity);
  if (company) {
    directors = dedupeDirectors([
      ...directors,
      ...extractDirectorsFromCompaniesOffice(company),
    ]);
  }
  const registeredOffice =
    extractRegisteredOffice(entity) ??
    (company ? extractRegisteredOffice(company) : null);
  const nzbn = entity.nzbn ?? company?.nzbn ?? null;
  const legalName = entity.entityName ?? company?.companyName ?? null;
  const companyNumber =
    company?.companyNumber ?? companyNumberFromNzbn(entity);
  const gaps: string[] = [];

  if (!directors.length) {
    gaps.push(
      adapters.companiesOffice === 'unavailable'
        ? 'No public directors on NZBN; set COMPANIES_OFFICE_API_KEY to enrich from Companies Office.'
        : 'No public directors returned by NZBN or Companies Office for this entity.',
    );
  }
  if (!registeredOffice) {
    gaps.push('Registered office not present on returned public payloads.');
  }
  if (adapters.companiesOffice === 'unavailable') {
    gaps.push(
      'Companies Office adapter skipped — COMPANIES_OFFICE_API_KEY not configured.',
    );
  }

  const status: WhoRunsItResult['status'] =
    legalName || nzbn ? (gaps.length ? 'partial' : 'ok') : 'not_found';

  return {
    status,
    query,
    legalName,
    nzbn,
    companyNumber,
    entityStatus:
      entity.entityStatusDescription ??
      entity.entityStatusCode ??
      company?.status ??
      null,
    entityType:
      entity.entityTypeDescription ??
      entity.entityTypeCode ??
      company?.entityType ??
      null,
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
      {
        label: COMPANIES_OFFICE_SOURCE,
        url: 'https://www.business.govt.nz/services/business-data',
      },
    ],
    adapters,
    privacy: WHO_RUNS_IT_PRIVACY,
    sandbox: false,
    gaps,
  };
}

export async function runWhoRunsIt(
  input: WhoRunsItInput,
  opts: {
    sandbox: boolean;
    nzbnClient?: NzbnClient;
    companiesOfficeClient?: CompaniesOfficeClient;
  },
): Promise<WhoRunsItResult> {
  if (opts.sandbox) {
    return sandboxWhoRunsIt(input.company);
  }

  const nzbnClient = opts.nzbnClient ?? new NzbnClient();
  if (!nzbnClient.isConfigured()) {
    throw new ToolHttpError({
      status: 503,
      code: 'upstream_unconfigured',
      message: 'Live NZBN upstream is not configured on this deployment.',
      fix: 'Set NZBN_API_KEY (free at api.business.govt.nz). Optionally also set COMPANIES_OFFICE_API_KEY for director enrichment. For dry-runs, use a key starting with test_.',
    });
  }

  const coClient = opts.companiesOfficeClient ?? new CompaniesOfficeClient();
  const adapters: WhoRunsItAdapters = {
    nzbn: 'live',
    companiesOffice: coClient.isConfigured() ? 'live' : 'unavailable',
  };

  try {
    let entity: NzbnEntity | null = null;
    if (NZBN_REGEX.test(input.company)) {
      entity = await nzbnClient.getEntity(input.company);
    } else {
      const hits = await nzbnClient.searchEntities(input.company);
      const first = hits[0];
      if (first?.nzbn) {
        entity = (await nzbnClient.getEntity(first.nzbn)) ?? first;
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
        companyNumber: null,
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
        adapters,
        privacy: WHO_RUNS_IT_PRIVACY,
        sandbox: false,
        gaps: ['Entity not found on NZBN register for this query.'],
      };
    }

    let company: CompaniesOfficeCompany | null = null;
    if (coClient.isConfigured()) {
      try {
        const identifier =
          companyNumberFromNzbn(entity) ??
          entity.entityName ??
          input.company;
        company = await coClient.lookupCompany(identifier);
        adapters.companiesOffice = 'live';
      } catch {
        adapters.companiesOffice = 'skipped';
        // Soft-fail CO enrichment — still return NZBN payload with a gap.
      }
    }

    const result = mergeLiveResult({
      query: input.company,
      entity,
      company,
      adapters,
    });
    if (adapters.companiesOffice === 'skipped') {
      result.gaps.push(
        'Companies Office enrichment failed or was skipped; NZBN fields only.',
      );
      if (result.status === 'ok') result.status = 'partial';
    }
    return result;
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

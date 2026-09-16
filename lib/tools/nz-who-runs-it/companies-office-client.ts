/**
 * Companies Office gateway client for the Next.js tools runtime.
 * Mirrors plugins/mcp-servers/mcp-companies-office (Ocp-Apim-Subscription-Key).
 *
 * Env: COMPANIES_OFFICE_API_KEY — free subscription at api.business.govt.nz
 * Optional: COMPANIES_OFFICE_API_BASE_URL
 *
 * Privacy: callers must strip residential addresses / DOB before redistributing
 * director fields. This client returns raw public-register payloads only.
 */

const DEFAULT_BASE_URL = 'https://api.business.govt.nz/services/v1/companies';

export class CompaniesOfficeNotConfiguredError extends Error {
  constructor() {
    super(
      'COMPANIES_OFFICE_API_KEY is not configured. Register at https://api.business.govt.nz/ and set COMPANIES_OFFICE_API_KEY.',
    );
    this.name = 'CompaniesOfficeNotConfiguredError';
  }
}

export class CompaniesOfficeUpstreamError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'CompaniesOfficeUpstreamError';
  }
}

export type CompaniesOfficeCompany = {
  companyNumber?: string;
  companyName?: string;
  nzbn?: string;
  status?: string;
  entityType?: string;
  addresses?: unknown;
  directors?: unknown;
  [k: string]: unknown;
};

export function isCompaniesOfficeConfigured(): boolean {
  return Boolean(process.env.COMPANIES_OFFICE_API_KEY?.trim());
}

export class CompaniesOfficeClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts?: {
    apiKey?: string;
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  }) {
    this.apiKey = opts?.apiKey ?? process.env.COMPANIES_OFFICE_API_KEY?.trim();
    this.baseUrl =
      opts?.baseUrl ??
      process.env.COMPANIES_OFFICE_API_BASE_URL ??
      DEFAULT_BASE_URL;
    this.fetchImpl = opts?.fetchImpl ?? fetch;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private headers(): Record<string, string> {
    if (!this.apiKey) throw new CompaniesOfficeNotConfiguredError();
    return {
      'Ocp-Apim-Subscription-Key': this.apiKey,
      Accept: 'application/json',
      'User-Agent': 'assembl-tools-nz-who-runs-it/0.1 (+https://assembl.co.nz)',
    };
  }

  async lookupCompany(identifier: string): Promise<CompaniesOfficeCompany | null> {
    const trimmed = identifier.trim();
    const path = /^\d+$/.test(trimmed)
      ? `/${encodeURIComponent(trimmed)}`
      : `?search-term=${encodeURIComponent(trimmed)}`;
    const url = `${this.baseUrl}${path}`;
    const res = await this.fetchImpl(url, { method: 'GET', headers: this.headers() });
    if (res.status === 404) return null;
    if (res.status === 401 || res.status === 403) {
      throw new CompaniesOfficeUpstreamError(
        'Companies Office rejected the subscription key (401/403). Check COMPANIES_OFFICE_API_KEY scope.',
        res.status,
        await safeBody(res),
      );
    }
    if (!res.ok) {
      throw new CompaniesOfficeUpstreamError(
        `Companies Office lookup failed with ${res.status}`,
        res.status,
        await safeBody(res),
      );
    }
    const json = (await res.json()) as unknown;
    if (Array.isArray(json)) return (json[0] ?? null) as CompaniesOfficeCompany | null;
    if (
      json &&
      typeof json === 'object' &&
      Array.isArray((json as { items?: unknown }).items)
    ) {
      return ((json as { items: CompaniesOfficeCompany[] }).items[0] ?? null);
    }
    return json as CompaniesOfficeCompany;
  }
}

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return undefined;
    }
  }
}

export const COMPANIES_OFFICE_SOURCE =
  'Companies Office public register, https://www.business.govt.nz/services/business-data';

import type { CompanyRecord, DirectorshipRecord } from "./types.js";

const DEFAULT_BASE_URL = "https://api.business.govt.nz/services/v1/companies";

export class CompaniesOfficeApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "CompaniesOfficeApiError";
  }
}

export class CompaniesOfficeApiNotConfiguredError extends Error {
  constructor() {
    super(
      "COMPANIES_OFFICE_API_KEY is not configured. The Companies Office gateway requires a free subscription key — register at https://api.business.govt.nz/ and set COMPANIES_OFFICE_API_KEY in the environment.",
    );
    this.name = "CompaniesOfficeApiNotConfiguredError";
  }
}

export class CompaniesOfficeApiKeyRequiredError extends Error {
  constructor(endpointDescription: string) {
    super(
      `This endpoint (${endpointDescription}) requires a Companies Office API key with elevated scope. The basic registry-search subscription key only covers public company-by-identifier lookups; deeper endpoints (full director histories, document downloads) need an additional registration with the Companies Office.`,
    );
    this.name = "CompaniesOfficeApiKeyRequiredError";
  }
}

const NUMERIC_ID_REGEX = /^\d+$/;

export interface CompaniesOfficeClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class CompaniesOfficeClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: CompaniesOfficeClientOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.COMPANIES_OFFICE_API_KEY;
    this.baseUrl =
      options.baseUrl ??
      process.env.COMPANIES_OFFICE_API_BASE_URL ??
      DEFAULT_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  private headers(): Record<string, string> {
    if (!this.apiKey) {
      throw new CompaniesOfficeApiNotConfiguredError();
    }
    return {
      "Ocp-Apim-Subscription-Key": this.apiKey,
      Accept: "application/json",
      "User-Agent": "assembl-mcp-companies-office/0.0.1",
    };
  }

  async lookupCompany(identifier: string): Promise<CompanyRecord | null> {
    const trimmed = identifier.trim();
    const path = NUMERIC_ID_REGEX.test(trimmed)
      ? `/${encodeURIComponent(trimmed)}`
      : `?search-term=${encodeURIComponent(trimmed)}`;
    const url = `${this.baseUrl}${path}`;

    const res = await this.fetchImpl(url, {
      method: "GET",
      headers: this.headers(),
    });

    if (res.status === 404) {
      return null;
    }

    if (res.status === 401 || res.status === 403) {
      throw new CompaniesOfficeApiKeyRequiredError(
        `lookup_company(${identifier})`,
      );
    }

    if (!res.ok) {
      const body = await safeReadBody(res);
      throw new CompaniesOfficeApiError(
        `Companies Office API responded with ${res.status} ${res.statusText}`,
        res.status,
        body,
      );
    }

    const json = (await res.json()) as unknown;

    if (Array.isArray(json)) {
      return (json[0] ?? null) as CompanyRecord | null;
    }
    if (
      typeof json === "object" &&
      json !== null &&
      "items" in (json as Record<string, unknown>) &&
      Array.isArray((json as { items: unknown[] }).items)
    ) {
      const items = (json as { items: CompanyRecord[] }).items;
      return items[0] ?? null;
    }
    return json as CompanyRecord;
  }

  async lookupDirector(name: string): Promise<DirectorshipRecord[]> {
    const trimmed = name.trim();
    const url = `${this.baseUrl}/directors?search-term=${encodeURIComponent(trimmed)}`;

    const res = await this.fetchImpl(url, {
      method: "GET",
      headers: this.headers(),
    });

    if (res.status === 404) {
      return [];
    }

    if (res.status === 401 || res.status === 403) {
      throw new CompaniesOfficeApiKeyRequiredError(
        `lookup_director(${name})`,
      );
    }

    if (!res.ok) {
      const body = await safeReadBody(res);
      throw new CompaniesOfficeApiError(
        `Companies Office API responded with ${res.status} ${res.statusText}`,
        res.status,
        body,
      );
    }

    const json = (await res.json()) as unknown;
    if (Array.isArray(json)) {
      return json as DirectorshipRecord[];
    }
    if (
      typeof json === "object" &&
      json !== null &&
      "items" in (json as Record<string, unknown>) &&
      Array.isArray((json as { items: unknown[] }).items)
    ) {
      return (json as { items: DirectorshipRecord[] }).items;
    }
    return [json as DirectorshipRecord];
  }
}

async function safeReadBody(res: Response): Promise<unknown> {
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

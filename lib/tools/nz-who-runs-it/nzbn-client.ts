/**
 * NZBN gateway client for the Next.js runtime.
 * Mirrors plugins/mcp-servers/mcp-nzbn (Ocp-Apim-Subscription-Key).
 *
 * Env: NZBN_API_KEY (canonical). NZBN_API_TOKEN accepted as legacy alias.
 * Optional: NZBN_API_BASE_URL (default services/v5/nzbn).
 */

const DEFAULT_BASE_URL = 'https://api.business.govt.nz/services/v5/nzbn';

export class NzbnNotConfiguredError extends Error {
  constructor() {
    super(
      'NZBN_API_KEY is not configured. Register at https://api.business.govt.nz/ and set NZBN_API_KEY (or legacy NZBN_API_TOKEN).',
    );
    this.name = 'NzbnNotConfiguredError';
  }
}

export class NzbnUpstreamError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'NzbnUpstreamError';
  }
}

export type NzbnEntity = {
  nzbn?: string;
  entityName?: string;
  entityTypeCode?: string;
  entityTypeDescription?: string;
  entityStatusCode?: string;
  entityStatusDescription?: string;
  addresses?: unknown;
  roles?: unknown;
  emailAddresses?: unknown;
  phoneNumbers?: unknown;
  websites?: unknown;
  [k: string]: unknown;
};

function resolveApiKey(): string | undefined {
  return (
    process.env.NZBN_API_KEY?.trim() ||
    process.env.NZBN_API_TOKEN?.trim() ||
    undefined
  );
}

export function isNzbnConfigured(): boolean {
  return Boolean(resolveApiKey());
}

export class NzbnClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts?: { apiKey?: string; baseUrl?: string; fetchImpl?: typeof fetch }) {
    this.apiKey = opts?.apiKey ?? resolveApiKey();
    this.baseUrl = opts?.baseUrl ?? process.env.NZBN_API_BASE_URL ?? DEFAULT_BASE_URL;
    this.fetchImpl = opts?.fetchImpl ?? fetch;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private headers(): Record<string, string> {
    if (!this.apiKey) throw new NzbnNotConfiguredError();
    return {
      'Ocp-Apim-Subscription-Key': this.apiKey,
      Accept: 'application/json',
      'User-Agent': 'assembl-tools-nz-who-runs-it/0.1 (+https://assembl.co.nz)',
    };
  }

  async searchEntities(term: string): Promise<NzbnEntity[]> {
    const url = `${this.baseUrl}/entities?search-term=${encodeURIComponent(term)}&entity-status=Registered`;
    const res = await this.fetchImpl(url, { method: 'GET', headers: this.headers() });
    if (!res.ok) {
      throw new NzbnUpstreamError(
        `NZBN search failed with ${res.status}`,
        res.status,
        await safeBody(res),
      );
    }
    const json = (await res.json()) as unknown;
    if (Array.isArray(json)) return json as NzbnEntity[];
    if (
      json &&
      typeof json === 'object' &&
      Array.isArray((json as { items?: unknown }).items)
    ) {
      return (json as { items: NzbnEntity[] }).items;
    }
    return [];
  }

  async getEntity(nzbn: string): Promise<NzbnEntity | null> {
    const url = `${this.baseUrl}/entities/${encodeURIComponent(nzbn)}`;
    const res = await this.fetchImpl(url, { method: 'GET', headers: this.headers() });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new NzbnUpstreamError(
        `NZBN getEntity failed with ${res.status}`,
        res.status,
        await safeBody(res),
      );
    }
    return (await res.json()) as NzbnEntity;
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

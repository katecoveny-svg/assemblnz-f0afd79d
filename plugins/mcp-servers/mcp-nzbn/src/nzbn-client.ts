import type { NzbnEntity } from "./types.js";

const DEFAULT_BASE_URL = "https://api.business.govt.nz/services/v5/nzbn";

export class NzbnApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "NzbnApiError";
  }
}

export class NzbnApiNotConfiguredError extends Error {
  constructor() {
    super(
      "NZBN_API_KEY is not configured. The NZBN gateway requires a free subscription key — register at https://api.business.govt.nz/ and set NZBN_API_KEY in the environment.",
    );
    this.name = "NzbnApiNotConfiguredError";
  }
}

export interface NzbnClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class NzbnClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: NzbnClientOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.NZBN_API_KEY;
    this.baseUrl =
      options.baseUrl ?? process.env.NZBN_API_BASE_URL ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  private headers(): Record<string, string> {
    if (!this.apiKey) {
      throw new NzbnApiNotConfiguredError();
    }
    return {
      "Ocp-Apim-Subscription-Key": this.apiKey,
      Accept: "application/json",
      "User-Agent": "assembl-mcp-nzbn/0.0.1",
    };
  }

  async getEntity(nzbn: string): Promise<NzbnEntity | null> {
    const url = `${this.baseUrl}/entities/${encodeURIComponent(nzbn)}`;
    const res = await this.fetchImpl(url, {
      method: "GET",
      headers: this.headers(),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      let body: unknown = undefined;
      try {
        body = await res.json();
      } catch {
        try {
          body = await res.text();
        } catch {
          /* ignore */
        }
      }
      throw new NzbnApiError(
        `NZBN API responded with ${res.status} ${res.statusText}`,
        res.status,
        body,
      );
    }

    return (await res.json()) as NzbnEntity;
  }
}

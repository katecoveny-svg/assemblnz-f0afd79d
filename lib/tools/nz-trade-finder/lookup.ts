import { ToolHttpError } from '../errors';
import { sandboxTradeFinder } from './fixtures';
import type { TradeFinderInput, TradeFinderResult } from './types';

const MAX_LIMIT = 25;
const DEFAULT_LIMIT = 10;

export function parseTradeFinderInput(body: unknown): TradeFinderInput {
  if (!body || typeof body !== 'object') {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: 'Body must be a JSON object with `city` and `trade`.',
      fix: 'POST { "city": "Wellington", "trade": "plumber", "limit": 10 }.',
    });
  }
  const record = body as Record<string, unknown>;
  const city = record.city;
  const trade = record.trade;
  if (typeof city !== 'string' || !city.trim()) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`city` must be a non-empty string.',
      fix: 'Provide a New Zealand city or town, e.g. "Wellington".',
    });
  }
  if (typeof trade !== 'string' || !trade.trim()) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`trade` must be a non-empty string.',
      fix: 'Provide a trade label, e.g. "plumber" or "electrician".',
    });
  }
  if (city.trim().length > 80 || trade.trim().length > 80) {
    throw new ToolHttpError({
      status: 400,
      code: 'validation_error',
      message: '`city` and `trade` must each be ≤ 80 characters.',
      fix: 'Shorten city/trade labels.',
    });
  }
  let limit = DEFAULT_LIMIT;
  if (record.limit !== undefined) {
    const n = Number(record.limit);
    if (!Number.isFinite(n) || n < 1 || n > MAX_LIMIT) {
      throw new ToolHttpError({
        status: 400,
        code: 'validation_error',
        message: '`limit` must be an integer from 1 to 25.',
        fix: 'Omit limit (defaults to 10) or pass 1–25.',
      });
    }
    limit = Math.floor(n);
  }
  return { city: city.trim(), trade: trade.trim(), limit };
}

/**
 * Live adapter is intentionally stubbed until NZBN / Companies Office
 * city+trade search is wired. Never invent live register rows.
 */
export async function runTradeFinder(
  input: TradeFinderInput,
  opts: { sandbox: boolean },
): Promise<TradeFinderResult> {
  if (opts.sandbox) {
    return sandboxTradeFinder(input);
  }

  throw new ToolHttpError({
    status: 503,
    code: 'upstream_unconfigured',
    message:
      'Live nz-trade-finder is not wired yet. NZBN / Companies Office city+trade search is stubbed.',
    fix: 'Use a test_ sandbox key for fixtures, or wait for the live register adapter. Do not invent business rows. Future live source: NZBN + Companies Office (register-only; no email scrape).',
    details: {
      adapters: { nzbn: 'stubbed', companiesOffice: 'stubbed' },
      planned_sources: [
        'https://api.business.govt.nz/ (NZBN)',
        'Companies Office public register',
      ],
    },
  });
}

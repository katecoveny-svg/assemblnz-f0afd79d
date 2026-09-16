import { invokePaidTool } from '@/lib/tools/invoke';
import {
  parseTradeFinderInput,
  runTradeFinder,
} from '@/lib/tools/nz-trade-finder';
import type { TradeFinderResult } from '@/lib/tools/nz-trade-finder';
import { ensureDemoSandboxKey } from '@/lib/tools/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_SLUG = 'nz-trade-finder';
const DOCS_PATH = '/tools/nz-trade-finder';

/**
 * GET — health + docs pointer (no API key required).
 * POST — paid city+trade shortlist (API key required).
 */
export async function GET() {
  const demo = await ensureDemoSandboxKey();
  return Response.json(
    {
      ok: true,
      tool: TOOL_SLUG,
      one_job:
        'Find owner-led New Zealand businesses in a city for a given trade, with register-only contact hints.',
      docs: DOCS_PATH,
      wraps: ['mcp-nzbn (planned)', 'mcp-companies-office (planned)'],
      auth: {
        headers: ['Authorization: Bearer <key>', 'X-Assembl-Tool-Key: <key>'],
        sandbox_prefix: 'test_',
        demo_test_key: demo.rawKey,
        demo_key_id: demo.record.id,
      },
      upstream: {
        live_status: 'stubbed',
        env: [
          'NZBN_API_KEY (planned for live city+trade search)',
          'COMPANIES_OFFICE_API_KEY (planned enrichment)',
        ],
        register: 'https://api.business.govt.nz/',
        note:
          'Sandbox (test_ keys) returns fixtures now. Live NZBN/Companies Office city+trade search is not wired — live keys get 503 with an honest fix. Register-only; no email scrape.',
      },
      pricing: {
        unit_cost_cents: demo.record.unitCostCents,
        default_daily_cap_cents_sandbox: demo.record.dailyCapCents,
      },
      receipts: `/api/tools/keys/${demo.record.id}/receipts`,
      related: ['nz-who-runs-it', 'nz-compliance-ping'],
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return invokePaidTool({
    request,
    toolSlug: TOOL_SLUG,
    parseInput: parseTradeFinderInput,
    run: async (input, ctx) =>
      runTradeFinder(input, { sandbox: ctx.environment === 'sandbox' }),
    summarizeRequest: (input) => ({
      city: input.city,
      trade: input.trade,
      limit: input.limit,
    }),
    summarizeResponse: (result: TradeFinderResult) => ({
      status: result.status,
      resultCount: result.results.length,
      adapters: result.adapters,
      sandbox: result.sandbox,
    }),
  });
}

import { invokePaidTool } from '@/lib/tools/invoke';
import { isCompaniesOfficeConfigured } from '@/lib/tools/nz-who-runs-it/companies-office-client';
import {
  parseWhoRunsItInput,
  runWhoRunsIt,
} from '@/lib/tools/nz-who-runs-it/lookup';
import { isNzbnConfigured } from '@/lib/tools/nz-who-runs-it/nzbn-client';
import type { WhoRunsItResult } from '@/lib/tools/nz-who-runs-it/types';
import { ensureDemoSandboxKey } from '@/lib/tools/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_SLUG = 'nz-who-runs-it';
const DOCS_PATH = '/tools/nz-who-runs-it';

/**
 * GET — health + docs pointer (no API key required).
 * POST — paid lookup (API key required).
 */
export async function GET() {
  const demo = await ensureDemoSandboxKey();
  return Response.json(
    {
      ok: true,
      tool: TOOL_SLUG,
      one_job:
        'Resolve who publicly runs a New Zealand company from a name or NZBN.',
      docs: DOCS_PATH,
      wraps: ['mcp-nzbn', 'mcp-companies-office'],
      auth: {
        headers: ['Authorization: Bearer <key>', 'X-Assembl-Tool-Key: <key>'],
        sandbox_prefix: 'test_',
        demo_test_key: demo.rawKey,
        demo_key_id: demo.record.id,
      },
      upstream: {
        nzbn_configured: isNzbnConfigured(),
        companies_office_configured: isCompaniesOfficeConfigured(),
        env: [
          'NZBN_API_KEY (required for live; NZBN_API_TOKEN legacy alias)',
          'COMPANIES_OFFICE_API_KEY (optional enrichment for directors)',
        ],
        register: 'https://api.business.govt.nz/',
        note:
          'Live calls return 503 when NZBN_API_KEY is missing. test_ keys always use sandbox fixtures and never hit live registers.',
      },
      privacy: {
        directors_are_personal_information: true,
        docs: `${DOCS_PATH}#privacy`,
      },
      pricing: {
        unit_cost_cents: demo.record.unitCostCents,
        default_daily_cap_cents_sandbox: demo.record.dailyCapCents,
      },
      receipts: `/api/tools/keys/${demo.record.id}/receipts`,
      next_tool: 'nz-trade-finder (register-only v0; see docs/tools/nz-trade-finder.md)',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return invokePaidTool({
    request,
    toolSlug: TOOL_SLUG,
    parseInput: parseWhoRunsItInput,
    run: async (input, ctx) =>
      runWhoRunsIt(input, { sandbox: ctx.environment === 'sandbox' }),
    summarizeRequest: (input) => ({ company: input.company }),
    summarizeResponse: (result: WhoRunsItResult) => ({
      status: result.status,
      legalName: result.legalName,
      nzbn: result.nzbn,
      directorCount: result.directors.length,
      adapters: result.adapters,
      sandbox: result.sandbox,
    }),
  });
}

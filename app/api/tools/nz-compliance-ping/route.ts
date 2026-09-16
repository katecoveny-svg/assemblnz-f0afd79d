import { invokePaidTool } from '@/lib/tools/invoke';
import {
  parseCompliancePingInput,
  runCompliancePing,
} from '@/lib/tools/nz-compliance-ping';
import type { CompliancePingResult } from '@/lib/tools/nz-compliance-ping';
import { isNzbnConfigured } from '@/lib/tools/nz-who-runs-it/nzbn-client';
import { ensureDemoSandboxKey } from '@/lib/tools/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_SLUG = 'nz-compliance-ping';
const DOCS_PATH = '/tools/nz-compliance-ping';

/**
 * GET — health + docs pointer (no API key required).
 * POST — paid public-register compliance ping (API key required).
 */
export async function GET() {
  const demo = await ensureDemoSandboxKey();
  return Response.json(
    {
      ok: true,
      tool: TOOL_SLUG,
      one_job:
        'Ping public NZ register compliance signals for a company or NZBN (status, entity type, GST/register hints).',
      docs: DOCS_PATH,
      wraps: ['mcp-nzbn'],
      auth: {
        headers: ['Authorization: Bearer <key>', 'X-Assembl-Tool-Key: <key>'],
        sandbox_prefix: 'test_',
        demo_test_key: demo.rawKey,
        demo_key_id: demo.record.id,
      },
      upstream: {
        nzbn_configured: isNzbnConfigured(),
        env: ['NZBN_API_KEY (required for live; NZBN_API_TOKEN legacy alias)'],
        register: 'https://api.business.govt.nz/',
        note:
          'Live calls return 503 when NZBN_API_KEY is missing. test_ keys always use sandbox fixtures. Not legal advice.',
      },
      pricing: {
        unit_cost_cents: demo.record.unitCostCents,
        default_daily_cap_cents_sandbox: demo.record.dailyCapCents,
      },
      receipts: `/api/tools/keys/${demo.record.id}/receipts`,
      related: ['nz-who-runs-it', 'nz-trade-finder'],
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return invokePaidTool({
    request,
    toolSlug: TOOL_SLUG,
    parseInput: parseCompliancePingInput,
    run: async (input, ctx) =>
      runCompliancePing(input, { sandbox: ctx.environment === 'sandbox' }),
    summarizeRequest: (input) => ({ company: input.company }),
    summarizeResponse: (result: CompliancePingResult) => ({
      status: result.status,
      nzbn: result.nzbn,
      entityStatus: result.entityStatus,
      flagCount: result.flags.length,
      adapters: result.adapters,
      sandbox: result.sandbox,
    }),
  });
}

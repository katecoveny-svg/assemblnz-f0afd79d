import { invokePaidTool } from '@/lib/tools/invoke';
import {
  parseMeetingEnhanceInput,
  runMeetingEnhance,
} from '@/lib/tools/meeting-enhance';
import type { MeetingEnhanceResult } from '@/lib/tools/meeting-enhance';
import { ensureDemoSandboxKey } from '@/lib/tools/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_SLUG = 'meeting-enhance';
const DOCS_PATH = '/tools/meeting-enhance';

/**
 * GET — health + docs pointer (no API key required).
 * POST — paid transcript → structured notes (API key required).
 */
export async function GET() {
  const demo = await ensureDemoSandboxKey();
  return Response.json(
    {
      ok: true,
      tool: TOOL_SLUG,
      one_job:
        'Turn a meeting transcript into Granola-class structured notes: decisions, actions, follow-ups.',
      docs: DOCS_PATH,
      wraps: ['do-meeting-notes-preparation'],
      auth: {
        headers: ['Authorization: Bearer <key>', 'X-Assembl-Tool-Key: <key>'],
        sandbox_prefix: 'test_',
        demo_test_key: demo.rawKey,
        demo_key_id: demo.record.id,
      },
      upstream: {
        live_status:
          'Uses DO meeting-notes preparation when a model ladder is configured; otherwise 503.',
        note:
          'test_ keys return deterministic sandbox notes and never call a model. Drafts only — nothing is emailed or assigned. Complements Meeting DO at /do/meetings.',
      },
      pricing: {
        unit_cost_cents: demo.record.unitCostCents,
        default_daily_cap_cents_sandbox: demo.record.dailyCapCents,
      },
      receipts: `/api/tools/keys/${demo.record.id}/receipts`,
      related: ['nz-who-runs-it'],
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return invokePaidTool({
    request,
    toolSlug: TOOL_SLUG,
    parseInput: parseMeetingEnhanceInput,
    run: async (input, ctx) =>
      runMeetingEnhance(input, { sandbox: ctx.environment === 'sandbox' }),
    summarizeRequest: (input) => ({
      title: input.title ?? null,
      transcriptChars: input.transcript.length,
    }),
    summarizeResponse: (result: MeetingEnhanceResult) => ({
      status: result.status,
      decisionCount: result.decisions.length,
      actionCount: result.actions.length,
      adapters: result.adapters,
      sandbox: result.sandbox,
      draftsOnly: result.draftsOnly,
    }),
  });
}

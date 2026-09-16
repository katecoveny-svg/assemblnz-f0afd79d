/**
 * GET /api/do/action — Action Cloud catalogue + OpenAPI pointer (Phase 1).
 *
 * Lifecycle stages:
 *   discover → inspect → quote → prepare → permit → execute → wait → verify → receipt → undo
 *
 * Universal response schema on every stage. Not live production Action Cloud.
 */
import { CONTRACT_VERSION, actionContractJsonSchema, universalResponseJsonSchema } from '@/lib/do/action-contract';
import { demoEchoContract } from '@/lib/do/adapters/demo-echo';
import { stubStage } from '@/lib/do/action-cloud/service';
import { jsonUniversal } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    {
      ok: true,
      product: 'DO Action Cloud',
      phase: 1,
      live_production: false,
      contract_version: CONTRACT_VERSION,
      lifecycle: [
        'discover',
        'inspect',
        'quote',
        'prepare',
        'permit',
        'execute',
        'wait',
        'verify',
        'receipt',
        'undo',
      ],
      stages: {
        discover: { method: 'GET|POST', path: '/api/do/action/discover' },
        inspect: { method: 'GET|POST', path: '/api/do/action/inspect' },
        quote: { method: 'POST', path: '/api/do/action/quote', status: 'stub' },
        prepare: { method: 'POST', path: '/api/do/action/prepare' },
        permit: { method: 'POST', path: '/api/do/action/permit' },
        execute: { method: 'POST', path: '/api/do/action/execute' },
        wait: {
          method: 'POST|GET',
          path: '/api/do/action/wait',
          poll: '/api/do/action/wait/{wait_id}',
        },
        verify: { method: 'POST', path: '/api/do/action/verify' },
        receipt: { method: 'POST|GET', path: '/api/do/action/receipt' },
        undo: { method: 'POST', path: '/api/do/action/undo', status: 'stub' },
      },
      actions: [demoEchoContract],
      openapi: '/docs/do-action-cloud/openapi-action-cloud-v0.yaml',
      docs: '/docs/do-action-cloud/',
      schemas: {
        action_contract: actionContractJsonSchema,
        universal_response: universalResponseJsonSchema,
      },
      happy_path: {
        adapter: 'demo.echo',
        steps: [
          'POST /api/do/action/prepare { action_name, namespace:"demo", args:{message}, idempotency_key }',
          'POST /api/do/action/permit { prep_id }',
          'POST /api/do/action/execute { permit_id, prep_id, idempotency_key }',
          'POST /api/do/action/verify { action_id }',
          'POST /api/do/action/receipt { action_id }',
        ],
      },
      note:
        'Phase 1 contract core only. Assembl = orchestration; DO = safe action layer; Pursuit = first vertical.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

/** POST without a stage defaults to discover. */
export async function POST() {
  return jsonUniversal(await stubStage('discover'));
}

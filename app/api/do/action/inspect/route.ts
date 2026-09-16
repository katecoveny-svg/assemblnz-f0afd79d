/**
 * GET|POST /api/do/action/inspect — read-only action metadata (Phase 1: demo.echo).
 * Stage: inspect
 */
import { stubStage } from '@/lib/do/action-cloud/service';
import { jsonUniversal } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return jsonUniversal(await stubStage('inspect'));
}

export async function POST() {
  return jsonUniversal(await stubStage('inspect'));
}

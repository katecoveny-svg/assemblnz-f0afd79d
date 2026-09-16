/**
 * GET|POST /api/do/action/discover — list available actions (Phase 1: demo.echo).
 * Stage: discover
 */
import { stubStage } from '@/lib/do/action-cloud/service';
import { jsonUniversal } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return jsonUniversal(await stubStage('discover'));
}

export async function POST() {
  return jsonUniversal(await stubStage('discover'));
}

/**
 * POST /api/do/action/quote — dry-run / quote (Phase 1 stub).
 * Stage: quote
 */
import { stubStage } from '@/lib/do/action-cloud/service';
import { jsonUniversal } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return jsonUniversal(await stubStage('quote'));
}

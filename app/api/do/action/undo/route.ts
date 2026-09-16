/**
 * POST /api/do/action/undo — compensating undo (Phase 1 stub).
 * Stage: undo
 */
import { stubStage } from '@/lib/do/action-cloud/service';
import { jsonUniversal } from '@/lib/do/action-cloud/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return jsonUniversal(await stubStage('undo'));
}

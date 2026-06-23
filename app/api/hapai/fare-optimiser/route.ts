import { handleDashTool } from '@/lib/hapai/dash/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(req: Request) {
  return handleDashTool('fare-optimiser', req);
}

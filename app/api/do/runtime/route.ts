import { getDoAvailability } from '@/apps/do/shared/preparation-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ availability: getDoAvailability() }, { headers: { 'Cache-Control': 'no-store' } });
}

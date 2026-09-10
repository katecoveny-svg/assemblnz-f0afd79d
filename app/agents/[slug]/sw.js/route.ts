import { getVertical } from '@/lib/verticals/config';
import { verticalWorker } from '@/lib/verticals/service-worker';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const v = getVertical((await params).slug);
  if (!v) return new Response('Not found', { status: 404 });
  return new Response(verticalWorker(v), { headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
}

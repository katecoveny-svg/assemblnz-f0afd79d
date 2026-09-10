import { getVertical, verticalManifest } from '@/lib/verticals/config';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const v = getVertical((await params).slug);
  if (!v) return new Response('Not found', { status: 404 });
  return Response.json(verticalManifest(v), { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' } });
}

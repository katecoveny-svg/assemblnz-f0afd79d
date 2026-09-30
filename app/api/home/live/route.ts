import { retrievePublicNzKnowledge } from '@/lib/public-nz/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  const publicNz = await retrievePublicNzKnowledge({ limit: 4 });
  return Response.json({ figures: [], lastFetch: null, lastFetchSource: null, checkedAt: publicNz.checkedAt, publicNz }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

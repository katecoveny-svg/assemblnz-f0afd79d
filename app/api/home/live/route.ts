import { retrieveVerifiedPublicNzKnowledge } from '@/lib/public-nz/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  const { discovery: publicNz, verification } = await retrieveVerifiedPublicNzKnowledge({ limit: 4 });
  return Response.json({ figures: [], lastFetch: null, lastFetchSource: null, checkedAt: publicNz.checkedAt, publicNz, verification }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

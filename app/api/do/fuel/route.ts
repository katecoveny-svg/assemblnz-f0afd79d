import { readFuelPrices } from '@/lib/do/fuel/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public weekly national fuel prices with their source and date. Nothing about the person is read or kept. */
export async function GET() {
  const headers = { 'Cache-Control': 'public, max-age=1800', 'X-Content-Type-Options': 'nosniff' };
  const prices = await readFuelPrices();
  if (!prices) return Response.json({ message: 'The weekly fuel price is unavailable right now. You can still record a pump price you saw.' }, { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } });
  return Response.json(prices, { headers });
}

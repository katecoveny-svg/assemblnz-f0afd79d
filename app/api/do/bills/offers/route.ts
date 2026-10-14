import { offerBook, publicOffer, type OfferBook } from '@/apps/do/finance/offers';
import { COMPARABLE_CATEGORIES, type ServiceCategory } from '@/apps/do/finance/services';
import { getPriceBook } from '@/lib/bills/provider-prices';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public, dated offers for one service category from assembl's price book. The book is
 * public advertised pricing with a source and verification date per row; it holds nothing
 * about the person asking. No account, trial, provider call or write is involved.
 */
export async function GET(req: Request) {
  const headers = { 'Cache-Control': 'public, max-age=900', 'X-Content-Type-Options': 'nosniff' };
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  const category = new URL(req.url).searchParams.get('category') as ServiceCategory | null;
  if (!category || !COMPARABLE_CATEGORIES.includes(category)) return json({ message: 'Choose a comparable service category.' }, 400);
  const book = await getPriceBook();
  const offers = book.plans.filter(plan => plan.category === category).flatMap(plan => {
    const parsed = publicOffer.safeParse({
      id: plan.id, category, provider: plan.provider, planName: plan.planName, monthlyCost: plan.monthlyCost,
      features: plan.features.slice(0, 12), eligibilityNotes: plan.eligibilityNotes, sourceUrl: plan.sourceUrl,
      sourceHost: plan.sourceHost, lastVerified: plan.lastVerified, trustTier: plan.trustTier,
    });
    return parsed.success ? [parsed.data] : [];
  });
  const lastVerified = offers.map(offer => offer.lastVerified).sort().at(-1) ?? null;
  const result: OfferBook = offerBook.parse({ category, live: book.live && offers.length > 0, offers, lastVerified });
  return json(result);
}

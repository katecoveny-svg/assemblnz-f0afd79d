import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase/service';
import {
  VoyageItalyTrip,
  type VoyagePayload,
} from '@/components/voyage/VoyageItalyTrip';

// Private, slug-gated share for /hapai/voyage-italy/v/[slug].
//
// PRIVACY MODEL
// -------------
// 1. `voyage_shared_trips` has RLS enabled with no policies — anon + auth'd
//    clients cannot read it. Only the service role can. This page uses the
//    service client behind the slug check, then renders.
// 2. The 32-char base64url slug (~192 bits of entropy) IS the auth. Generated
//    fresh per share by scripts/seed-kate-italy-2026.ts and printed to a
//    .gitignored file. Anyone with the slug can see the trip; nobody else can.
// 3. `noindex, nofollow` on the response so search engines can't surface the
//    page even if the URL leaks into a referer header.
// 4. No list endpoint exists. The slug is never enumerated.
// 5. The matching public template at /hapai/voyage-italy NEVER reads this
//    table — it serves a hard-coded GENERIC_VOYAGE_TEMPLATE.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'voyage · assembl',
  // Don't leak the trip title or travellers into search results / link
  // previews. Generic metadata only.
  description: 'Private voyage trip board.',
  robots: { index: false, follow: false, nocache: true },
  // Belt + braces: no OG tags by default — Next.js inherits site-wide. We
  // could clear them here if a future audit shows leakage.
};

type SharedTripRow = {
  share_slug: string;
  title: string;
  travellers: string[] | null;
  payload: unknown;
};

function isPayload(value: unknown): value is VoyagePayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === 'string' &&
    Array.isArray(v.stops) &&
    Array.isArray(v.travellers)
  );
}

export default async function PrivateVoyagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Defensive: reject malformed slugs without ever hitting the DB.
  // Our generated slugs are 32 base64url chars; allow 16–80 to be lenient
  // for any future re-issuance.
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(slug)) {
    notFound();
  }

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    // Supabase env missing — fall through to 404 rather than leak.
    notFound();
  }

  const { data, error } = await service
    .from('voyage_shared_trips')
    .select('share_slug,title,travellers,payload')
    .eq('share_slug', slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const row = data as SharedTripRow;
  if (!isPayload(row.payload)) {
    notFound();
  }

  // Trust the payload's own title/travellers; the table's title/travellers
  // columns are convenience denormalisations, not the source of truth.
  return (
    <VoyageItalyTrip
      payload={row.payload}
      storageScope={`share-${slug.slice(0, 8)}`}
    />
  );
}

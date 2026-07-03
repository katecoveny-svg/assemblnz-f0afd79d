import { redirect } from 'next/navigation';

/**
 * Pitch decks and outreach reference /demo/contact-energy — canonical home is
 * the gated pilot workspace at /customers/contact-energy (same middleware
 * basic-auth + magic-link protection as every hosted pilot).
 */
export default async function DemoContactEnergyRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const suffix = rest?.length ? `/${rest.join('/')}` : '';
  redirect(`/customers/contact-energy${suffix}`);
}

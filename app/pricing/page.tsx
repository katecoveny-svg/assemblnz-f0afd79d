import type { Metadata } from 'next';
import { CinematicPricing } from '@/components/site/cinematic/CinematicPricing';
import '../cine.css';

/**
 * /pricing — current public install-and-run offer.
 * Amounts remain sourced from lib/registry/pricing.ts.
 */

export const metadata: Metadata = {
  title: 'assembl · pricing',
  description: 'Current assembl install-and-run pricing. Start with one useful job, keep the work permissioned, and add more only when it earns its place.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return <CinematicPricing checkoutConfigured={checkoutConfigured} />;
}

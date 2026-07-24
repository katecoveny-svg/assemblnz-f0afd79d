import type { Metadata } from 'next';
import { CinematicPricing } from '@/components/site/cinematic/CinematicPricing';
import '../cine.css';

/**
 * /pricing — Kate's pricing.html prototype (2026-07-24), ported 1:1 to the
 * cinematic design system. REPLACES the previous pilot-sprint Stripe checkout
 * page — flagged for Kate's sign-off before merge.
 */

export const metadata: Metadata = {
  title: 'assembl · pricing',
  description: 'Agents prepare. People decide. assembl pricing.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <CinematicPricing />;
}

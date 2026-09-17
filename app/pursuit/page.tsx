import type { Metadata } from 'next';
import { ProductLanding } from '@/components/site/assembl-the-work/ProductLanding';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit · find it. · assembl' },
  description:
    'Find the opening. Build the possibility. Assembl Pursuit landing on the shared atelier — private client work lives in the ChatGPT Pursuit hub.',
  alternates: { canonical: '/pursuit' },
};

/**
 * www Pursuit door — same atelier ProductLanding craft as Studio / home fly-through.
 * No bird hero. Working hub is external ChatGPT only.
 */
export default function PursuitPage() {
  return <ProductLanding product="pursuit" />;
}

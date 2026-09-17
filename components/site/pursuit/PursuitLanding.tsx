import { ProductLanding } from '@/components/site/assembl-the-work/ProductLanding';

/**
 * Compatibility wrapper — www Pursuit uses ProductLanding atelier craft
 * (same door language as Studio / homepage fly-through). No bird landing.
 */
export function PursuitLanding() {
  return <ProductLanding product="pursuit" />;
}

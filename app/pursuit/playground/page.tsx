import { redirect } from 'next/navigation';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';

/**
 * Public Pursuit playground retired (Kate lock 2026-09-17).
 * Do not polish the in-repo maker — link out to the ChatGPT hub only.
 */
export default function PursuitPlaygroundPage() {
  redirect(PRODUCT_DESTINATIONS.pursuit.overview);
}

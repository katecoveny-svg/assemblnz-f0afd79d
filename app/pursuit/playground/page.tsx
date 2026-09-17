import { redirect } from 'next/navigation';
import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';

/**
 * Public Pursuit playground retired (Kate lock 2026-09-17).
 * Do not polish the in-repo maker — link out to the ChatGPT hub only.
 */
export default function PursuitPlaygroundPage() {
  redirect(PURSUIT_SITE_ORIGIN);
}

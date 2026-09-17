import { redirect } from 'next/navigation';
import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';

/**
 * In-repo Pursuit landing is retired from the public face (Kate lock 2026-09-17).
 * Canonical Pursuit is the external ChatGPT hub only.
 * Middleware also 308-redirects /pursuit* — this page is a belt-and-braces fallback.
 */
export default function PursuitPage() {
  redirect(PURSUIT_SITE_ORIGIN);
}

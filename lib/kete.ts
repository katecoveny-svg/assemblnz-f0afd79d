/**
 * lib/kete.ts — compatibility barrel
 * Existing components (site-footer.tsx) import KETES from '@/lib/kete'.
 * This file routes them to the canonical source in site-config.ts.
 */
export { KETES } from './site-config';

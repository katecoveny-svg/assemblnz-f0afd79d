/**
 * Aironaut scoped service worker — thin wrapper over the shared [slug]
 * handler (static segment shadows the dynamic sibling; see manifest route).
 */
import { GET as sharedGET } from '../../[slug]/sw.js/route';

export async function GET(req: Request) {
  return sharedGET(req, { params: Promise.resolve({ slug: 'aironaut' }) });
}

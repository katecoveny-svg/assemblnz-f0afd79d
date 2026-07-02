/**
 * Aironaut manifest — thin wrapper over the shared [slug] handler.
 *
 * Needed because the static `app/customers/aironaut/` segment shadows the
 * dynamic `app/customers/[slug]/` sibling, so the generic route never fires
 * for this tenant. Same for sw.js. Never behind a pilot gate.
 */
import { GET as sharedGET } from '../../[slug]/manifest.webmanifest/route';

export async function GET(req: Request) {
  return sharedGET(req, { params: Promise.resolve({ slug: 'aironaut' }) });
}

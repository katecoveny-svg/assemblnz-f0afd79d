/**
 * Happy Tails manifest — thin wrapper over the shared [slug] handler.
 * (Static segment shadows the dynamic sibling; see aironaut manifest route.)
 */
import { GET as sharedGET } from '../../[slug]/manifest.webmanifest/route';

export async function GET(req: Request) {
  return sharedGET(req, { params: Promise.resolve({ slug: 'happy-tails' }) });
}

import { hubSchema, type HubRecord } from '@/components/client-hub-migration/original/lib/pursuit-hub';
import { starterCompanyHub } from '@/components/client-hub-migration/original/lib/company-hub';

// Deliberately has no native fetch/provider client. Unknown requests fail closed.
// This is an ephemeral fixture transport, never production storage.
export function createReviewTransport() {
  const hubs = new Map<string, HubRecord>();
  const brands = new Map<string, unknown>();
  const reply = (body: unknown, status = 200) => Response.json(body, { status });
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, 'http://localhost');
    if (url.origin !== 'http://localhost' && url.origin !== 'http://127.0.0.1:3187')
      return reply({ error: 'External connections are disabled in migration review.' }, 403);
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let body: Record<string, unknown> = {};
    if (typeof init?.body === 'string') {
      try { body = JSON.parse(init.body); } catch { return reply({ error: 'Invalid JSON.' }, 400); }
    }
    if (url.pathname === '/api/hub' && method === 'GET') {
      const id = url.searchParams.get('id');
      if (id) return hubs.has(id) ? reply({ item: hubs.get(id) }) : reply({ error: 'Review draft not found. Drafts last only for this browser session.' }, 404);
      return reply({ items: [...hubs.values()].filter(h => !url.searchParams.get('seller') || h.payload.seller === url.searchParams.get('seller')).map(h => ({ id: h.id, revision: h.revision, name: h.payload.name, seller: h.payload.seller, buyer: h.payload.buyer })) });
    }
    if (url.pathname === '/api/hub' && method === 'POST') {
      const parsed = hubSchema.safeParse(body.payload);
      if (!parsed.success) return reply({ error: 'Review draft does not match the original hub schema.' }, 400);
      const id = typeof body.id === 'string' ? body.id : crypto.randomUUID();
      const previous = hubs.get(id);
      if (previous && previous.revision !== body.revision) return reply({ error: 'Revision changed. Reopen this review draft.' }, 409);
      const item = { id, revision: (previous?.revision || 0) + 1, updatedAt: Date.now(), payload: parsed.data };
      hubs.set(id, item);
      return reply({ item });
    }
    if (url.pathname === '/api/brand/company') {
      if (method === 'GET') return reply({ brand: brands.get(url.searchParams.get('seller') || '') || null });
      if (typeof body.seller === 'string' && body.brand) { brands.set(body.seller, body.brand); return reply({ reviewOnly: true }); }
    }
    if (url.pathname === '/api/concept-agent' && method === 'POST') {
      const hub = hubSchema.safeParse(body.hub);
      if (!hub.success) return reply({ error: 'Invalid review brief.' }, 400);
      if (body.action === 'ideas') {
        const concepts = starterCompanyHub(hub.data.engine?.sector || 'custom', hub.data.seller).engine!.concepts;
        return reply({ concepts: concepts.map(c => ({ ...c, title: `Fixture: ${c.title}`.slice(0, 140) })), reviewOnly: true });
      }
      if (body.action === 'build') {
        const concept = hub.data.engine?.concepts.find(c => c.id === body.conceptId);
        if (concept) return reply({ concept, reviewOnly: true });
      }
      return reply({ error: 'This review action has no synthetic fixture. No agent or paid call was made.' }, 503);
    }
    if (url.pathname === '/api/radar/workspace' && method === 'GET') return reply({ profiles: [], runs: [], pending: [], ready: false, serviceNote: 'Migration review: production research and saved intelligence are not connected.' });
    if (['/api/inbox', '/api/knowledge', '/api/media', '/api/campaigns'].includes(url.pathname) && method === 'GET' && !url.searchParams.has('id')) return reply({ items: [], reviewOnly: true });
    if (url.pathname === '/api/sales-agent' && method === 'GET') return reply({ messages: [], connection: { ready: false }, reviewOnly: true });
    return reply({ error: 'Unavailable in migration review. No sharing, recipient grant, upload, production access or paid provider call occurred.' }, 503);
  };
}

const reviewFetch = createReviewTransport();
export async function migrationFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response> {
  if(typeof window === 'undefined' || window.location.pathname !== '/studio/workspace') return reviewFetch(input,init);
  const url=new URL(input instanceof Request?input.url:String(input),window.location.origin);
  const method=(init?.method || (input instanceof Request?input.method:'GET')).toUpperCase();
  if(url.origin===window.location.origin && url.pathname==='/api/hub' && ['GET','POST'].includes(method)) {
    const target=new URL('/api/client-hub-migration/owner',window.location.origin);
    if(url.searchParams.has('id'))target.searchParams.set('id',url.searchParams.get('id')!);
    return window.fetch(target,{...init,method,credentials:'same-origin',redirect:'error',cache:'no-store'});
  }
  return Response.json({error:'This connection is not available in the new owner workspace. No provider, upload or sharing action occurred.'},{status:503});
}

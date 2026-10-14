import { readDoJson } from '@/apps/do/shared/http';
import { enquiryEvent } from '@/apps/do/enquiries/contract';
import { EnquiryError, enquiryEventOwner, receiveEnquiry, transitionEnquiry } from '@/apps/do/enquiries/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const owner = await enquiryEventOwner(request);
    let raw: unknown;
    try { raw = await readDoJson(request, 20_000); } catch { return Response.json({ error: 'invalid_request' }, { status: 400 }); }
    const parsed = enquiryEvent.safeParse(raw);
    if (!parsed.success) return Response.json({ error: 'invalid_event' }, { status: 400 });
    const p = parsed.data;
    const job = p.event === 'new_enquiry'
      ? await receiveEnquiry(owner, { requestId: p.requestId, name: p.name, email: p.email, message: p.message }, 'webhook')
      : await transitionEnquiry(owner, p.id, p.event, { evidence: p.evidence, source: 'connected_system' });
    return Response.json({ id: job.id, status: job.status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof EnquiryError ? error.message : 'event_unavailable' }, { status: error instanceof EnquiryError ? error.status : 503 });
  }
}

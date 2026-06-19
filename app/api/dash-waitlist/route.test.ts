import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the lead-capture legs and the service client so the route is unit-tested
// without a live Supabase / Brevo / edge function.
const notifyLead = vi.fn();
const subscribeToBrevoList = vi.fn();
const insert = vi.fn();

vi.mock('@/lib/lead-capture', () => ({
  notifyLead: (...a: unknown[]) => notifyLead(...a),
  subscribeToBrevoList: (...a: unknown[]) => subscribeToBrevoList(...a),
  clientIpFromHeaders: () => '203.0.113.7',
}));

vi.mock('@/lib/supabase/service', () => ({
  getServiceClient: () => ({ from: () => ({ insert: (...a: unknown[]) => insert(...a) }) }),
}));

import { POST } from './route';

function post(body: unknown) {
  return new Request('https://assembl.co.nz/api/dash-waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json', referer: 'https://assembl.co.nz/dash' },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/dash-waitlist', () => {
  it('400s on invalid body', async () => {
    const res = await POST(post({ role: 'nope', email: 'x' }));
    expect(res.status).toBe(400);
  });

  it('writes dash_waitlist + emails, returns 200', async () => {
    notifyLead.mockResolvedValue(true);
    insert.mockResolvedValue({ error: null });
    subscribeToBrevoList.mockResolvedValue(true);

    const res = await POST(post({ role: 'publisher', email: 'a@b.co.nz', organisation: 'Acme', message: 'our spinner' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, notified: true, persisted: true });

    // persona + company + surface mapping, and notified flag threaded through.
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ persona: 'publisher', email: 'a@b.co.nz', company: 'Acme', surface: 'our spinner', notified: true }),
    );
  });

  it('still 200s when the email leg fails but the row persists', async () => {
    notifyLead.mockResolvedValue(false);
    insert.mockResolvedValue({ error: null });
    const res = await POST(post({ role: 'advertiser', email: 'a@b.co.nz' }));
    expect(res.status).toBe(200);
    expect((await res.json()).persisted).toBe(true);
  });

  it('503s only when BOTH legs fail', async () => {
    notifyLead.mockResolvedValue(false);
    insert.mockResolvedValue({ error: { message: 'db down' } });
    const res = await POST(post({ role: 'advertiser', email: 'a@b.co.nz' }));
    expect(res.status).toBe(503);
  });
});

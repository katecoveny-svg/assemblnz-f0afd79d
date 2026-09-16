import { beforeEach, describe, expect, it, vi } from 'vitest';

const { repo } = vi.hoisted(() => ({
  repo: {
    clear: () => undefined as void,
  } as {
    clear: () => void;
    savePlaybook?: (playbook: unknown) => Promise<unknown>;
    getForOwner?: (ownerId: string, floorId: string) => Promise<unknown>;
    save?: (ownerId: string | null, floor: unknown) => Promise<unknown>;
  },
}));

vi.mock('@/apps/do/services/owner', () => ({
  doOwner: vi.fn(),
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' },
}));

vi.mock('@/apps/do/shared/http', () => ({
  allowedDoOrigin: (req: Request) => {
    const origin = req.headers.get('origin');
    if (!origin) return null;
    try {
      return origin === new URL(req.url).origin ? origin : null;
    } catch {
      return null;
    }
  },
  admitDoRequest: () => true,
  readDoJson: async (req: Request) => req.json(),
}));

vi.mock('@/lib/agents/chat-rate-limit', () => ({
  chatClientIp: () => '127.0.0.1',
}));

vi.mock('@/apps/do/shared/household-floor-store', async () => {
  const actual = await vi.importActual<typeof import('@/apps/do/shared/household-floor-store')>(
    '@/apps/do/shared/household-floor-store',
  );
  const impl = new actual.MemoryHouseholdFloorRepo();
  repo.clear = () => impl.clear();
  repo.savePlaybook = (playbook) => impl.savePlaybook(playbook as never);
  repo.getForOwner = (ownerId: string, floorId: string) => impl.getForOwner(ownerId, floorId);
  repo.save = (ownerId, floor) => impl.save(ownerId, floor as never);
  return {
    ...actual,
    householdFloorMemory: impl,
  };
});

import { doOwner } from '@/apps/do/services/owner';
import { POST } from './route';

function postRequest(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/browser-seat', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Browser seat API', () => {
  beforeEach(() => {
    repo.clear();
    vi.mocked(doOwner).mockReset();
    vi.mocked(doOwner).mockResolvedValue(null);
  });

  it('requires consent and matching session key', async () => {
    const missingConsent = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: false,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Hello',
    }));
    expect(missingConsent.status).toBe(400);

    const badKey = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:other',
      consent: true,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Hello notices',
    }));
    expect(badKey.status).toBe(400);
  });

  it('accepts a consented school capture and returns a receipt', async () => {
    const response = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: true,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Athletics Friday. Bring water bottle.',
      learnMode: true,
      playbookLabel: 'open college notices',
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.receipt.url).toContain('demo-college.bridge.school.nz');
    expect(body.honesty).toMatch(/No form was submitted/i);
    expect(body.playbook.label).toBe('open college notices');
  });

  it('requires session consent for non-catalog hosts', async () => {
    const response = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: true,
      consentScope: 'domain',
      url: 'https://example.com/page',
      title: 'Example',
      pageText: 'Hello world page text',
    }));
    expect(response.status).toBe(400);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { repo, ownerA } = vi.hoisted(() => ({
  ownerA: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', externalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
  repo: {
    clear: () => undefined as void,
    // Reassigned in the mock factory to the real MemoryHouseholdFloorRepo methods.
  } as {
    clear: () => void;
    save?: (ownerId: string | null, floor: unknown) => Promise<unknown>;
    listForOwner?: (ownerId: string) => Promise<unknown[]>;
    getForOwner?: (ownerId: string, floorId: string) => Promise<unknown>;
    savePlaybook?: (playbook: unknown) => Promise<unknown>;
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
}));

vi.mock('@/apps/do/shared/household-floor-store', async () => {
  const actual = await vi.importActual<typeof import('@/apps/do/shared/household-floor-store')>(
    '@/apps/do/shared/household-floor-store',
  );
  const impl = new actual.MemoryHouseholdFloorRepo();
  repo.clear = () => impl.clear();
  repo.save = (ownerId, floor) => impl.save(ownerId, floor as never);
  repo.listForOwner = (ownerId) => impl.listForOwner(ownerId);
  repo.getForOwner = (ownerId, floorId) => impl.getForOwner(ownerId, floorId);
  repo.savePlaybook = (playbook) => impl.savePlaybook(playbook as never);
  return {
    ...actual,
    householdFloorMemory: impl,
  };
});

import { doOwner } from '@/apps/do/services/owner';
import { installHouseholdFloor } from '@/apps/do/shared/household-floor';
import { PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE } from '@/apps/do/shared/household-floor-templates';
import { GET, POST } from './route';

function postRequest(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/household', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getRequest(path = 'https://www.assembl.co.nz/api/do/household') {
  return new Request(path, {
    method: 'GET',
    headers: { origin: 'https://www.assembl.co.nz' },
  });
}

describe('Household Floor API', () => {
  beforeEach(() => {
    repo.clear();
    vi.mocked(doOwner).mockReset();
  });

  it('lists the public shareable template', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    const response = await GET(getRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.publicTemplate.id).toBe('public_household_floor');
    expect(body.honesty.path).toMatch(/evening board/i);
  });

  it('installs the public template without auth', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    const response = await POST(postRequest({
      action: 'install',
      templateId: 'public_household_floor',
      personalisation: { displayName: 'Demo Floor', accentColor: '#240B21', avatarMark: '⌂' },
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.floor.templateId).toBe('public_household_floor');
    expect(body.floor.personalisation.displayName).toBe('Demo Floor');
    expect(body.shareWarning).toBeNull();
  });

  it('requires auth for owner-private install on the API', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    const response = await POST(postRequest({
      action: 'install',
      templateId: 'owner_private_household_floor',
    }));
    expect(response.status).toBe(401);
  });

  it('ticks a posted floor into Needs you', async () => {
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const floor = installHouseholdFloor({
      template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
      id: '44444444-4444-4444-8444-444444444444',
    });
    const response = await POST(postRequest({
      action: 'tick',
      forceScheduleId: 'evening-board',
      floor,
      persist: true,
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.boards.needs_you.length).toBeGreaterThan(0);
    expect(body.receipt.kind).toBe('board_tick');
  });

  it('rejects cross-origin installs', async () => {
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const response = await POST(postRequest({
      action: 'install',
      templateId: 'public_household_floor',
    }, 'https://evil.example'));
    expect(response.status).toBe(403);
  });
});

import { createHash } from 'node:crypto';

import { doOwner, privateDoHeaders } from '@/apps/do/services/owner';
import { allowedDoOrigin, admitDoRequest, readDoJson } from '@/apps/do/shared/http';
import {
  browserSeatCaptureInput,
  mintBrowserSeatReceipt,
  playbookFromLearnCapture,
  BROWSER_SEAT_BOUNDARY,
  isAllowedHouseholdBrowserHost,
} from '@/apps/do/shared/browser-seat';
import { attachBrowserSeatReceipt } from '@/apps/do/shared/household-floor';
import { HouseholdFloorOwnershipError, householdFloorMemory } from '@/apps/do/shared/household-floor-store';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function headers(request: Request) {
  const base = new Headers(privateDoHeaders);
  const origin = allowedDoOrigin(request);
  if (origin) {
    base.set('Access-Control-Allow-Origin', origin);
    base.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    base.set('Access-Control-Allow-Headers', 'Content-Type');
    base.set('Vary', 'Origin, Cookie');
  }
  return base;
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers(request) });
}

export async function OPTIONS(request: Request) {
  if (!allowedDoOrigin(request)) return new Response(null, { status: 403, headers: headers(request) });
  return new Response(null, { status: 204, headers: headers(request) });
}

export async function POST(request: Request) {
  if (!allowedDoOrigin(request)) {
    return json(request, { error: 'origin_not_allowed', message: 'Open the DO browser seat from Assembl or the installed extension.' }, 403);
  }

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    return json(request, { message: 'Please wait a minute before another browser-seat capture.' }, 429);
  }

  let raw: unknown;
  try {
    raw = await readDoJson(request, 2_800_000);
  } catch {
    return json(request, { error: 'invalid_request', message: 'JSON body required.' }, 400);
  }

  const parsed = browserSeatCaptureInput.safeParse(raw);
  if (!parsed.success) {
    return json(request, {
      error: 'invalid_input',
      message: parsed.error.issues[0]?.message || 'Consent, URL, title and page text are required.',
    }, 400);
  }

  const input = parsed.data;
  const expectedKey = `do-browser-seat:${input.doId}`;
  if (input.sessionKey !== expectedKey) {
    return json(request, {
      error: 'session_mismatch',
      message: 'Browser seat session key must match this DO. Each DO has its own seat key.',
    }, 400);
  }

  // Household school/council/AT hosts preferred; other https hosts allowed with session consent only.
  const hostOk = isAllowedHouseholdBrowserHost(input.url);
  if (!hostOk && input.consentScope !== 'session') {
    return json(request, {
      error: 'host_requires_session_consent',
      message: 'Non-catalog hosts need consentScope=session. Catalog hosts (SchoolBridge demos, AT, Council) may use domain consent.',
    }, 400);
  }

  const receipt = mintBrowserSeatReceipt(input, { source: 'chrome_extension' });

  const pageTextHash = createHash('sha256').update(input.pageText).digest('hex').slice(0, 16);
  const screenshotHash = input.screenshotBase64
    ? createHash('sha256').update(input.screenshotBase64).digest('hex').slice(0, 16)
    : null;

  // The seat key is a correlation key, not authentication. Require an owner-bound floor.
  const owner = await doOwner();
  const existing = owner ? await householdFloorMemory.getForOwner(owner.id, input.doId) : null;
  if (!owner || !existing) {
    const nextAction = owner
      ? 'Open Household Floor in the signed-in Assembl workspace, install your preview there, then capture again.'
      : 'Sign in to the Assembl workspace and open Household Floor before capturing again. The extension seat key does not sign you in.';
    return json(request, {
      receipt: { ...receipt, pageTextHash, screenshotHash },
      playbook: null,
      floor: null,
      stored: false,
      playbookStored: false,
      durable: false,
      storage: 'none',
      preview: true,
      attachment: { status: 'detached', reason: owner ? 'floor_not_found' : 'auth_required' },
      nextAction,
      boundary: BROWSER_SEAT_BOUNDARY,
      honesty: `Capture returned for review only; not stored or attached to a Household Floor. ${nextAction} No form was submitted and no payment was made.`,
    });
  }
  const playbook = playbookFromLearnCapture(input, receipt.id);
  let floor = null;
  if (owner) {
    if (existing) {
      floor = attachBrowserSeatReceipt(existing, {
        boardItemId: input.boardItemId,
        receipt: {
          id: receipt.id,
          kind: 'browser_seat',
          title: `Browser seat · ${receipt.title}`,
          summary: `${receipt.url} captured with ${receipt.consentScope} consent. ${BROWSER_SEAT_BOUNDARY}`,
          createdAt: receipt.capturedAt,
          evidence: {
            ...receipt,
            storage: 'process-memory',
            durable: false,
            pageTextHash,
            screenshotHash,
            pageTextPreview: input.pageText.slice(0, 400),
            executionClaimed: false,
            never: ['send', 'pay', 'book', 'submit'],
          },
        },
      });
      try {
        await householdFloorMemory.save(owner.id, floor);
        if (playbook) await householdFloorMemory.savePlaybook(playbook, owner.id);
      } catch (error) {
        if (error instanceof HouseholdFloorOwnershipError) {
          return json(request, { error: 'floor_id_unavailable', message: 'Install with a new Household Floor id.' }, 409);
        }
        throw error;
      }
    }
  }

  return json(request, {
    receipt: {
      ...receipt,
      pageTextHash,
      screenshotHash,
    },
    playbook,
    floor,
    stored: true,
    playbookStored: Boolean(playbook),
    durable: false,
    storage: 'process-memory',
    preview: true,
    attachment: { status: 'attached', floorId: input.doId },
    nextAction: 'Review the receipt in this Household Floor preview. Keep a local copy; this process-memory preview does not survive restarts or move between servers.',
    boundary: BROWSER_SEAT_BOUNDARY,
    honesty: 'Capture attached for review in a process-memory preview only, not durable Office storage. No form was submitted and no payment was made.',
  });
}

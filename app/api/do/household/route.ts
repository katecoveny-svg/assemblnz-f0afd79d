import { z } from 'zod';

import { doOwner, privateDoHeaders } from '@/apps/do/services/owner';
import { allowedDoOrigin } from '@/apps/do/shared/http';
import {
  installHouseholdFloor,
  tickHouseholdFloor,
  type HouseholdFloorInstance,
} from '@/apps/do/shared/household-floor';
import {
  getHouseholdFloorTemplate,
  listShareableHouseholdFloorTemplates,
  PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
} from '@/apps/do/shared/household-floor-templates';
import { householdFloorMemory } from '@/apps/do/shared/household-floor-store';
import { applyDoPersonalisation, DO_AVATAR_MARKS } from '@/apps/do/shared/do-personalisation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const installSchema = z.object({
  templateId: z.enum(['public_household_floor', 'owner_private_household_floor']),
  personalisation: z
    .object({
      displayName: z.string().trim().min(1).max(48).optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      avatarMark: z.enum(DO_AVATAR_MARKS).optional(),
    })
    .optional(),
  /** Client may supply a demo floor id for device continuity. */
  id: z.string().uuid().optional(),
});

const tickSchema = z.object({
  floor: z.custom<HouseholdFloorInstance>((value) => Boolean(value && typeof value === 'object')),
  forceScheduleId: z.string().trim().min(3).max(80).optional(),
  persist: z.boolean().optional(),
});

function headers() {
  return new Headers(privateDoHeaders);
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: headers() });
}

export async function OPTIONS(request: Request) {
  if (!allowedDoOrigin(request)) return new Response(null, { status: 403, headers: headers() });
  const responseHeaders = headers();
  responseHeaders.set('Allow', 'GET, POST, OPTIONS');
  return new Response(null, { status: 204, headers: responseHeaders });
}

export async function GET(request: Request) {
  if (request.headers.get('origin') && !allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed' }, 403);
  }

  const url = new URL(request.url);
  const templateId = url.searchParams.get('template');

  if (templateId) {
    const template = getHouseholdFloorTemplate(templateId);
    if (!template) return json({ error: 'not_found' }, 404);
    if (!template.shareable && template.visibility === 'owner_private') {
      // Private template metadata is visible to signed-in owners only.
      const owner = await doOwner();
      if (!owner) {
        return json({
          error: 'auth_required',
          message: 'Owner-private Household Floor seed requires sign-in. Use the public template to share.',
        }, 401);
      }
    }
    return json({
      template: {
        id: template.id,
        name: template.name,
        summary: template.summary,
        visibility: template.visibility,
        shareable: template.shareable,
        seatIds: template.seats.map((seat) => seat.id),
        schedules: template.schedules.map((schedule) => ({
          id: schedule.id,
          title: schedule.title,
          when: schedule.when,
        })),
        hardGates: template.context.hardGates,
        // Scrub private people/addresses from GET unless shareable.
        contextPreview: template.shareable
          ? {
              timezone: template.context.timezone,
              people: template.context.people,
              homes: template.context.homes,
              custodyNote: template.context.custodyNote,
              schoolPortals: template.context.schoolPortals,
            }
          : {
              timezone: template.context.timezone,
              note: 'Owner-private context omitted from list payloads. Install explicitly to load.',
            },
      },
    });
  }

  const owner = await doOwner();
  const floors = owner ? await householdFloorMemory.listForOwner(owner.id) : [];

  return json({
    publicTemplate: {
      id: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.id,
      name: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.name,
      summary: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.summary,
      shareable: true,
      seatCount: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.seats.length,
      scheduleCount: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.schedules.length,
    },
    shareableTemplates: listShareableHouseholdFloorTemplates().map((template) => ({
      id: template.id,
      name: template.name,
      summary: template.summary,
    })),
    floors: floors.map((floor) => ({
      id: floor.id,
      templateId: floor.templateId,
      visibility: floor.visibility,
      personalisation: floor.personalisation,
      boardCounts: {
        needs_you: floor.board.filter((item) => item.status === 'needs_you').length,
        working: floor.board.filter((item) => item.status === 'working').length,
        done: floor.board.filter((item) => item.status === 'done').length,
      },
      updatedAt: floor.updatedAt,
    })),
    honesty: {
      saveToOffice: 'Saving a Builder plan to Office is not a running Household Floor.',
      path: 'Install Household Floor → customise → install browser extension → place DO → run evening board.',
    },
  });
}

export async function POST(request: Request) {
  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open Household Floor from the Assembl DO workspace.' }, 403);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const action = (raw as { action?: string }).action ?? 'install';

  if (action === 'tick') {
    const parsed = tickSchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Bad tick payload.' }, 400);
    }
    const result = tickHouseholdFloor({
      floor: parsed.data.floor,
      forceScheduleId: parsed.data.forceScheduleId,
    });

    if (parsed.data.persist) {
      const owner = await doOwner();
      if (owner) await householdFloorMemory.save(owner.id, result.floor);
    }

    return json({
      floor: result.floor,
      created: result.created,
      receipt: result.receipt,
      boards: {
        needs_you: result.floor.board.filter((item) => item.status === 'needs_you'),
        working: result.floor.board.filter((item) => item.status === 'working'),
        done: result.floor.board.filter((item) => item.status === 'done'),
      },
    });
  }

  const parsed = installSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Check install payload.' }, 400);
  }

  const template = getHouseholdFloorTemplate(parsed.data.templateId);
  if (!template) return json({ error: 'not_found' }, 404);

  if (!template.shareable) {
    const owner = await doOwner();
    if (!owner) {
      return json({
        error: 'auth_required',
        message: 'Owner-private seed requires sign-in. Share the public Household Floor template instead.',
      }, 401);
    }
  }

  const floor = installHouseholdFloor({
    template,
    personalisation: parsed.data.personalisation
      ? applyDoPersonalisation(parsed.data.personalisation)
      : undefined,
    id: parsed.data.id,
  });

  const owner = await doOwner();
  if (owner) await householdFloorMemory.save(owner.id, floor);

  return json({
    floor,
    durable: Boolean(owner),
    shareWarning: floor.visibility === 'owner_private'
      ? 'Owner-private seed — do not share this instance or screenshot with real household details.'
      : null,
    nextSteps: [
      'Customise display name, accent colour and avatar mark',
      'Install the DO Chrome extension (browser seat)',
      'Place the floating DO on a tab when needed',
      'Run evening board — review Needs you before anything leaves the DO',
    ],
  });
}

import { doOwner, privateDoHeaders } from '@/apps/do/services/owner';
import { getOwnerBuilderJob, recordOwnerJobEvent } from '@/apps/do/services/office-jobs';
import { allowedDoOrigin } from '@/apps/do/shared/http';
import { OFFICE_STORAGE_UNAVAILABLE, OfficeStorageUnavailableError } from '@/apps/do/shared/office-jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: new Headers(privateDoHeaders) });
}

export async function GET(request: Request, { params }: Params) {
  if (request.headers.get('origin') && !allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed' }, 403);
  }

  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', message: 'Sign in to reopen durable Builder jobs.' }, 401);

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return json({ error: 'invalid_id' }, 400);
  }

  try {
    const detail = await getOwnerBuilderJob(owner.id, id);
    if (!detail) return json({ error: 'not_found', message: 'No Builder job with that id in your Office workspace.' }, 404);

    await recordOwnerJobEvent({
      ownerId: owner.id,
      workspaceId: detail.record.workspaceId,
      jobId: detail.record.id,
      eventId: `job-reopened:${detail.record.id}:${new Date().toISOString().slice(0, 13)}`,
      kind: 'job_reopened',
      detail: { via: 'builder_api' },
    }).catch(() => { /* reopen telemetry is best-effort */ });

    return json({
      job: detail.record.job,
      models: detail.record.models,
      executionBoundary: detail.record.executionBoundary,
      officeStatus: detail.record.officeStatus,
      savedAt: detail.record.updatedAt,
      durable: detail.record.storage === 'database',
      storage: detail.record.storage,
      receipts: detail.receipts.map((receipt) => ({
        id: receipt.id,
        kind: receipt.kind,
        title: receipt.title,
        summary: receipt.summary,
        evidence: receipt.evidence,
        createdAt: receipt.createdAt,
      })),
      events: detail.events.map((event) => ({
        eventId: event.eventId,
        kind: event.kind,
        detail: event.detail,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof OfficeStorageUnavailableError) return json(OFFICE_STORAGE_UNAVAILABLE, 503);
    return json({ error: 'load_failed', message: 'Could not reopen Builder job.' }, 500);
  }
}

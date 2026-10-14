import { timingSafeEqual } from "node:crypto";
import { maintainPersonalResponsibilityStorage, personalHeartbeat, personalWorkerConfigured, personalWorkerMode, runPersonal } from "@/apps/do/personal/service";
import { maintainPersonalMemory } from "@/apps/do/personal/memory-maintenance-server";
import { prepareEnquiryFollowups } from '@/apps/do/enquiries/service';
// Retention cleanup is bounded and flag-gated; storage-only enrolment stays ready only while
// a completed cleanup is recorded within 90 minutes, so it runs on every hourly tick.
async function settle<T>(run: () => Promise<T>) {
  try { return await run(); } catch { return { configured: true as const, failed: true as const }; }
}
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (
    !secret ||
    got.length !== expected.length ||
    !timingSafeEqual(got, expected)
  ) {
    // Deliberately log only a diagnostic code, never the credential/header.
    console.warn('[do-worker]', secret ? 'cron_bearer_mismatch' : 'cron_secret_missing');
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  // Run independently gated retention work before optional enquiries or Personal work.
  // Their failure must not prevent the existing cleanup/readiness checks.
  const maintenance = { responsibilities: await settle(maintainPersonalResponsibilityStorage), memory: await settle(maintainPersonalMemory) };
  try {
    const followupsPrepared = await prepareEnquiryFollowups();
    let claimed = 0,
      published = 0;
    const personalEnabled = personalWorkerConfigured();
    for (let i = 0; personalEnabled && i < 3; i++) {
      const result = await runPersonal();
      if (!result.claimed) break;
      claimed++;
      if (result.published) published++;
    }
    await personalHeartbeat();
    return Response.json(
      { claimed, published, followupsPrepared, maintenance, personal: personalEnabled ? { status: 'enabled', mode: personalWorkerMode() } : { status: 'disabled', reason: 'provider_permission_renewal_required' } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Personal worker unavailable" },
      { status: 503 },
    );
  }
}

import { timingSafeEqual } from "node:crypto";
import { personalHeartbeat, personalWorkerConfigured, runPersonal } from "@/apps/do/personal/service";
import { prepareEnquiryFollowups } from '@/apps/do/enquiries/service';
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
      { claimed, published, followupsPrepared, personal: personalEnabled ? { status: 'enabled' } : { status: 'disabled', reason: 'provider_permission_renewal_required' } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Personal worker unavailable" },
      { status: 503 },
    );
  }
}

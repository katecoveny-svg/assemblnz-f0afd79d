/**
 * GET /api/ping — liveness probe for the Next.js app on Vercel.
 *
 * Dependency-free on purpose: it touches no database, no env, no external
 * service, so a 200 here means "the app is up and serving routes" and nothing
 * else. The health-check-cron edge function hits this every 5 minutes as the
 * Vercel leg of the pipeline check.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "assembl-web",
      region: process.env.VERCEL_REGION ?? "local",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

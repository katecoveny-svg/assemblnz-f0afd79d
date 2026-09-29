import { timingSafeEqual } from "node:crypto";
import { personalHeartbeat, runPersonal } from "@/apps/do/personal/service";
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
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await personalHeartbeat();
    let claimed = 0,
      published = 0;
    for (let i = 0; i < 3; i++) {
      const result = await runPersonal();
      if (!result.claimed) break;
      claimed++;
      if (result.published) published++;
    }
    return Response.json(
      { claimed, published },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Personal worker unavailable" },
      { status: 503 },
    );
  }
}

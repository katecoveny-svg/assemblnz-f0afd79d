import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOURLY_LIMIT = 3;
const DAILY_LIMIT = 50;

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.VESSEL_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "assembl-vessel";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function since(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function countRuns(ipHash: string, iso: string) {
  const service = getServiceClient();
  const { count, error } = await service
    .from("vessel_generations")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", iso);
  if (error) throw error;
  return count ?? 0;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));
  const service = getServiceClient();

  let hourlyCount = 0;
  let dailyCount = 0;
  try {
    [hourlyCount, dailyCount] = await Promise.all([
      countRuns(ipHash, since(1)),
      countRuns(ipHash, since(24)),
    ]);
  } catch (error) {
    console.error("[api/hapai/vessel-generate] rate-limit lookup failed", error);
    return NextResponse.json({ error: "Vessel Studio is warming up. Try again shortly." }, { status: 503 });
  }

  if (hourlyCount >= HOURLY_LIMIT) {
    return NextResponse.json(
      {
        error: "Hourly limit reached — bring your own fal.ai key (free) or try again in an hour.",
        remaining: 0,
        hourLimit: HOURLY_LIMIT,
      },
      { status: 429 },
    );
  }
  if (dailyCount >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "Daily shared balance limit reached — bring your own fal.ai key (free) or try again tomorrow.",
        remaining: 0,
        hourLimit: HOURLY_LIMIT,
      },
      { status: 429 },
    );
  }

  const { data, error } = await service.functions.invoke("vessel-generate", {
    body: { ...body, ipHash },
  });

  if (error) {
    console.error("[api/hapai/vessel-generate] edge function failed", error);
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 502 });
  }

  return NextResponse.json({
    ...data,
    remaining: Math.max(0, HOURLY_LIMIT - hourlyCount - 1),
    hourLimit: HOURLY_LIMIT,
  });
}

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
  const input = body as Record<string, unknown>;
  const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
  if (prompt.length < 10) {
    return NextResponse.json({ error: "Prompt is too short" }, { status: 400 });
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

  const aspectRatio = typeof input.aspectRatio === "string" ? input.aspectRatio : "1:1";
  const reference = typeof input.sref === "string" && input.sref.startsWith("data:image/")
    ? input.sref
    : undefined;
  const edgeBody = {
    model: "flux",
    prompt,
    aspect_ratio: aspectRatio,
    variants: Math.min(4, Math.max(1, Number(input.variants ?? 1) || 1)),
    image_url: reference,
    image_prompt_strength: Math.min(
      1,
      Math.max(0, Number(input.imagePromptStrength ?? 0.35) || 0.35),
    ),
    ip_hash: ipHash,
  };

  const { data, error } = await service.functions.invoke("vessel-generate", {
    body: edgeBody,
  });

  if (error) {
    console.error("[api/hapai/vessel-generate] edge function failed", error);
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 502 });
  }

  const payload = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const firstImage = Array.isArray(payload.images) ? payload.images[0] : null;
  const firstImageUrl = firstImage && typeof firstImage === "object" && "url" in firstImage
    ? String((firstImage as { url?: unknown }).url ?? "")
    : "";
  const url = payload.url ?? (firstImageUrl || undefined);
  return NextResponse.json({
    ...payload,
    url,
    remaining: Math.max(0, HOURLY_LIMIT - hourlyCount - 1),
    hourLimit: HOURLY_LIMIT,
  });
}

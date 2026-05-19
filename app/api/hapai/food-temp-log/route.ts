import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { assessFoodAudit, type CleaningChecks, type CookingReading, type FoodAuditLog, type TempReading } from "@/lib/food-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_PREFIX = "assembl_food_audit_";

type FoodAuditRequest = {
  venueName?: string;
  recordedBy?: string;
  recordedDate?: string;
  fridgeTemps?: TempReading[];
  freezerTemps?: TempReading[];
  hotHoldTemps?: TempReading[];
  cookingTemps?: CookingReading[];
  cleaningChecks?: CleaningChecks;
  notes?: string;
  photos?: string[];
};

function cleanReadings(value: unknown): TempReading[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row && typeof row === "object" ? row as Record<string, unknown> : {};
      return { label: String(item.label ?? "").trim(), tempC: Number(item.tempC) };
    })
    .filter((row) => row.label && Number.isFinite(row.tempC))
    .slice(0, 20);
}

function cleanCooking(value: unknown): CookingReading[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row && typeof row === "object" ? row as Record<string, unknown> : {};
      return {
        dish: String(item.dish ?? "").trim(),
        tempC: Number(item.tempC),
        cookedToTime: String(item.cookedToTime ?? "").trim(),
      };
    })
    .filter((row) => row.dish && Number.isFinite(row.tempC))
    .slice(0, 20);
}

function cleanChecks(value: unknown): CleaningChecks {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    surfacesSanitised: Boolean(data.surfacesSanitised),
    floorsMopped: Boolean(data.floorsMopped),
    chillersWiped: Boolean(data.chillersWiped),
    handwashStationsStocked: Boolean(data.handwashStationsStocked),
  };
}

async function anonymousRateOk(venueName: string, ipHash: string, recordedDate: string) {
  try {
    const service = getServiceClient();
    const { count, error } = await service
      .from("food_audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("venue_name", venueName)
      .eq("recorded_date", recordedDate)
      .eq("ip_hash", ipHash);
    if (error) return true;
    return (count ?? 0) < 1;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as FoodAuditRequest | null;
  const venueName = String(body?.venueName ?? "").trim().slice(0, 140);
  const recordedBy = String(body?.recordedBy ?? "").trim().slice(0, 140);
  const recordedDate = String(body?.recordedDate ?? "").trim();

  if (!venueName || !recordedBy || !recordedDate) {
    return NextResponse.json({ error: "Venue, date, and recorded-by fields are required." }, { status: 400 });
  }

  const fridgeTemps = cleanReadings(body?.fridgeTemps);
  const freezerTemps = cleanReadings(body?.freezerTemps);
  const hotHoldTemps = cleanReadings(body?.hotHoldTemps);
  const cookingTemps = cleanCooking(body?.cookingTemps);
  if (fridgeTemps.length === 0 && freezerTemps.length === 0 && hotHoldTemps.length === 0 && cookingTemps.length === 0) {
    return NextResponse.json({ error: "Add at least one temperature reading." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const failedReadings = assessFoodAudit({ fridgeTemps, freezerTemps, hotHoldTemps, cookingTemps });
  const photos = Array.isArray(body?.photos) ? body.photos.filter((photo) => typeof photo === "string" && photo.startsWith("data:image/")).slice(0, 4) : [];
  const photoUrls: string[] = [];
  const id = crypto.randomUUID();

  if (!(await anonymousRateOk(venueName, ipHash, recordedDate))) {
    return NextResponse.json({ error: "This venue already has a free log from this connection for that date." }, { status: 429 });
  }

  const snapshot: FoodAuditLog = {
    id,
    venue_name: venueName,
    recorded_by: recordedBy,
    recorded_date: recordedDate,
    fridge_temps: fridgeTemps,
    freezer_temps: freezerTemps,
    hot_hold_temps: hotHoldTemps,
    cooking_temps: cookingTemps,
    cleaning_checks: cleanChecks(body?.cleaningChecks),
    notes: String(body?.notes ?? "").trim().slice(0, 2000) || null,
    failed_readings: failedReadings,
    photo_urls: photoUrls,
    created_at: new Date().toISOString(),
  };

  let savedId = id;
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from("food_audit_logs")
      .insert({
        venue_name: snapshot.venue_name,
        recorded_by: snapshot.recorded_by,
        recorded_date: snapshot.recorded_date,
        fridge_temps: snapshot.fridge_temps,
        freezer_temps: snapshot.freezer_temps,
        hot_hold_temps: snapshot.hot_hold_temps,
        cooking_temps: snapshot.cooking_temps,
        cleaning_checks: snapshot.cleaning_checks,
        notes: snapshot.notes,
        failed_readings: snapshot.failed_readings,
        photo_urls: snapshot.photo_urls,
        ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (!error && data?.id) savedId = data.id;
  } catch {
    // Dev/local fallback stores the record snapshot in a short-lived cookie.
  }

  const response = NextResponse.json({ id: savedId });
  response.cookies.set(`${COOKIE_PREFIX}${savedId}`, encodeURIComponent(JSON.stringify({ ...snapshot, id: savedId })), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
  return response;
}

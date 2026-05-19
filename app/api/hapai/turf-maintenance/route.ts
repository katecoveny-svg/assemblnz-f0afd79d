import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import {
  assessTurfMaintenance,
  type ChemicalApplication,
  type HazardInspection,
  type SurfaceType,
  type TurfMaintenanceChecks,
  type TurfMaintenanceLog,
} from "@/lib/turf-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_PREFIX = "assembl_turf_audit_";
const ALLOWED_SURFACES: SurfaceType[] = [
  "natural_turf",
  "artificial_turf",
  "hybrid",
  "asphalt",
  "grass_field",
];

type TurfRequest = {
  clubName?: string;
  groundName?: string;
  surfaceType?: string;
  recordedDate?: string;
  recordedBy?: string;
  weeklyChecks?: Partial<TurfMaintenanceChecks>;
  chemicalApplications?: ChemicalApplication[];
  hazardInspection?: HazardInspection | null;
  notes?: string;
};

function cleanChecks(value: unknown): TurfMaintenanceChecks {
  const data =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    mowedThisWeek: Boolean(data.mowedThisWeek),
    mowingHeightMm:
      typeof data.mowingHeightMm === "number"
        ? data.mowingHeightMm
        : undefined,
    irrigationRunning: Boolean(data.irrigationRunning),
    lineMarkingFresh: Boolean(data.lineMarkingFresh),
    lineMarkingDate:
      typeof data.lineMarkingDate === "string" ? data.lineMarkingDate : "",
    changingRoomsClean: Boolean(data.changingRoomsClean),
    firstAidStocked: Boolean(data.firstAidStocked),
    volunteerInductionLog: Boolean(data.volunteerInductionLog),
    ppeStocked: Boolean(data.ppeStocked),
  };
}

function cleanChemicals(value: unknown): ChemicalApplication[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item =
        row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      return {
        product: String(item.product ?? "").trim().slice(0, 140),
        appliedOn: String(item.appliedOn ?? "").trim(),
        appliedBy: String(item.appliedBy ?? "").trim().slice(0, 140),
        appliedTo: String(item.appliedTo ?? "").trim().slice(0, 140),
        notes:
          typeof item.notes === "string"
            ? item.notes.trim().slice(0, 600) || undefined
            : undefined,
      } satisfies ChemicalApplication;
    })
    .filter((row) => row.product && row.appliedOn)
    .slice(0, 12);
}

function cleanHazard(value: unknown): HazardInspection | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const inspectedOn = String(data.inspectedOn ?? "").trim();
  const inspectedBy = String(data.inspectedBy ?? "").trim().slice(0, 140);
  if (!inspectedOn || !inspectedBy) return null;
  const hazards = Array.isArray(data.hazards)
    ? (data.hazards as unknown[])
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
        .slice(0, 20)
    : [];
  return { inspectedOn, inspectedBy, hazards };
}

async function anonymousRateOk(
  clubName: string,
  groundName: string,
  ipHash: string,
  recordedDate: string,
) {
  try {
    const service = getServiceClient();
    const { count, error } = await service
      .from("turf_maintenance_logs")
      .select("id", { count: "exact", head: true })
      .eq("club_name", clubName)
      .eq("ground_name", groundName)
      .eq("recorded_date", recordedDate)
      .eq("ip_hash", ipHash);
    if (error) return true;
    return (count ?? 0) < 1;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as TurfRequest | null;
  const clubName = String(body?.clubName ?? "").trim().slice(0, 140);
  const groundName = String(body?.groundName ?? "").trim().slice(0, 140);
  const surfaceType = String(body?.surfaceType ?? "").trim() as SurfaceType;
  const recordedBy = String(body?.recordedBy ?? "").trim().slice(0, 140);
  const recordedDate = String(body?.recordedDate ?? "").trim();

  if (!clubName || !groundName || !recordedBy || !recordedDate) {
    return NextResponse.json(
      { error: "Club name, ground name, recorded-by, and date are required." },
      { status: 400 },
    );
  }
  if (!ALLOWED_SURFACES.includes(surfaceType)) {
    return NextResponse.json(
      { error: "Pick a valid surface type." },
      { status: 400 },
    );
  }

  const weeklyChecks = cleanChecks(body?.weeklyChecks);
  const chemicalApplications = cleanChemicals(body?.chemicalApplications);
  const hazardInspection = cleanHazard(body?.hazardInspection);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const failedChecks = assessTurfMaintenance({
    weekly_checks: weeklyChecks,
    chemical_applications: chemicalApplications,
    hazard_inspection: hazardInspection,
    recorded_date: recordedDate,
  });
  const id = crypto.randomUUID();

  if (!(await anonymousRateOk(clubName, groundName, ipHash, recordedDate))) {
    return NextResponse.json(
      {
        error:
          "This ground already has a free log from this connection for that date.",
      },
      { status: 429 },
    );
  }

  const snapshot: TurfMaintenanceLog = {
    id,
    club_name: clubName,
    ground_name: groundName,
    surface_type: surfaceType,
    recorded_by: recordedBy,
    recorded_date: recordedDate,
    weekly_checks: weeklyChecks,
    chemical_applications: chemicalApplications,
    hazard_inspection: hazardInspection,
    notes: String(body?.notes ?? "").trim().slice(0, 2000) || null,
    failed_checks: failedChecks,
    created_at: new Date().toISOString(),
  };

  let savedId = id;
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from("turf_maintenance_logs")
      .insert({
        club_name: snapshot.club_name,
        ground_name: snapshot.ground_name,
        surface_type: snapshot.surface_type,
        recorded_by: snapshot.recorded_by,
        recorded_date: snapshot.recorded_date,
        weekly_checks: snapshot.weekly_checks,
        chemical_applications: snapshot.chemical_applications,
        hazard_inspection: snapshot.hazard_inspection,
        notes: snapshot.notes,
        failed_checks: snapshot.failed_checks,
        ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (!error && data?.id) savedId = data.id;
  } catch {
    // Dev / DB-down fallback: cookie-only persistence.
  }

  const response = NextResponse.json({ id: savedId });
  response.cookies.set(
    `${COOKIE_PREFIX}${savedId}`,
    encodeURIComponent(JSON.stringify({ ...snapshot, id: savedId })),
    {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    },
  );
  return response;
}

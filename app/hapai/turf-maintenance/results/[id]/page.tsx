import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServiceClient } from "@/lib/supabase/service";
import type { TurfMaintenanceLog } from "@/lib/turf-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const COOKIE_PREFIX = "assembl_turf_audit_";

async function loadFromCookie(id: string): Promise<TurfMaintenanceLog | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(`${COOKIE_PREFIX}${id}`)?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as TurfMaintenanceLog;
  } catch {
    return null;
  }
}

async function loadFromSupabase(id: string): Promise<TurfMaintenanceLog | null> {
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from("turf_maintenance_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as TurfMaintenanceLog;
  } catch {
    return null;
  }
}

export default async function TurfResultPage({ params }: Params) {
  const { id } = await params;
  const record = (await loadFromCookie(id)) ?? (await loadFromSupabase(id));
  if (!record) {
    return (
      <main className="min-h-screen bg-[var(--assembl-paper)] px-6 py-16 text-[#23211F]">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/hapai/turf-maintenance"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#3A3832]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Create another record
          </Link>
          <h1 className="mt-8 font-display text-4xl font-light">
            Record not found.
          </h1>
          <p className="mt-4 text-sm text-[#5A5550]">
            Cookie records expire after one hour and DB lookups failed.
          </p>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(record.recorded_date).toLocaleDateString(
    "en-NZ",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <main className="min-h-screen bg-[var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/hapai/turf-maintenance"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#3A3832]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Create another record
          </Link>
        </div>

        <section className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-6 shadow-[0_18px_60px_rgba(35,33,31,0.08)] md:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#3A3832]">
            HSWA 2015 · daily ground record
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-light leading-[1.05]">
            Turf maintenance record — {record.club_name} · {record.ground_name} ·{" "}
            {formattedDate}
          </h1>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            <Meta label="Recorded by" value={record.recorded_by} />
            <Meta label="Surface" value={surfaceLabel(record.surface_type)} />
            <Meta label="Record ID" value={record.id.slice(0, 8)} />
          </div>

          {record.failed_checks.length > 0 && (
            <div className="mt-7 rounded-[12px] border border-[#B36A2A]/35 bg-[#FCEEDD] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7A3F1F]">
                ⚠️ Action required ({record.failed_checks.length})
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#3F2A1B]">
                {record.failed_checks.map((f, i) => (
                  <li key={i}>
                    <p className="font-medium">{f.detail}</p>
                    <p className="mt-1">{f.correctiveAction}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7A3F1F]">
                      {f.regulation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {record.chemical_applications.length > 0 && (
            <section className="mt-7">
              <h2 className="font-display text-2xl font-normal">
                Chemical applications
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
                HSNO 1996 record
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {record.chemical_applications.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] p-3"
                  >
                    <p className="font-medium">{c.product}</p>
                    <p className="text-[#5A5550]">
                      Applied on {c.appliedOn} by {c.appliedBy || "—"} to{" "}
                      {c.appliedTo || "—"}
                    </p>
                    {c.notes && (
                      <p className="mt-1 text-xs text-[#5A5550]">{c.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {record.hazard_inspection && (
            <section className="mt-7">
              <h2 className="font-display text-2xl font-normal">
                Hazard inspection
              </h2>
              <p className="text-sm text-[#5A5550]">
                Inspected on {record.hazard_inspection.inspectedOn} by{" "}
                {record.hazard_inspection.inspectedBy}
              </p>
              {record.hazard_inspection.hazards.length > 0 ? (
                <ul className="mt-3 list-disc pl-5 text-sm">
                  {record.hazard_inspection.hazards.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5A5550]">
                  No hazards reported.
                </p>
              )}
            </section>
          )}

          {record.notes && (
            <section className="mt-7">
              <h2 className="font-display text-2xl font-normal">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#3F3B36]">
                {record.notes}
              </p>
            </section>
          )}

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
            Built in Aotearoa · built on HSWA 2015 + HSNO 1996 · Privacy Act
            2020 compliant. assembl.co.nz
          </p>
        </section>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function surfaceLabel(surface: string) {
  switch (surface) {
    case "natural_turf":
      return "Natural turf";
    case "artificial_turf":
      return "Artificial turf";
    case "hybrid":
      return "Hybrid surface";
    case "grass_field":
      return "Grass field";
    case "asphalt":
      return "Asphalt court";
    default:
      return surface;
  }
}

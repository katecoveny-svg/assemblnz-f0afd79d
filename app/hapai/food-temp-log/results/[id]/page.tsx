import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";
import { FoodAuditResultActions } from "./FoodAuditResultActions";
import { getServiceClient } from "@/lib/supabase/service";
import type { CleaningChecks, FailedReading, FoodAuditLog, TempReading } from "@/lib/food-audit";

export const dynamic = "force-dynamic";

const COOKIE_PREFIX = "assembl_food_audit_";

export default async function FoodAuditResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  let record: FoodAuditLog | null = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data } = await service
        .from("food_audit_logs")
        .select("*")
        .eq("id", id)
        .single();
      if (data) record = data as FoodAuditLog;
    }
  } catch {
    record = null;
  }

  if (!record) {
    const snapshot = cookieStore.get(`${COOKIE_PREFIX}${id}`)?.value;
    if (snapshot) {
      try {
        record = JSON.parse(decodeURIComponent(snapshot)) as FoodAuditLog;
      } catch {
        record = null;
      }
    }
  }

  if (!record) notFound();

  const resultUrl = `https://www.assembl.co.nz/hapai/food-temp-log/results/${record.id}`;
  const failed = record.failed_readings ?? [];

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-10 text-[#313c42] print:bg-white md:px-12 md:py-14">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link href="/hapai/food-temp-log" className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#3f7373]">
            Create another record
          </Link>
          <FoodAuditResultActions venueName={record.venue_name} resultUrl={resultUrl} />
        </div>

        <article className="rounded-[16px] border border-[rgba(35,33,31,0.10)] bg-white p-6 shadow-[0_24px_80px_rgba(35,33,31,0.08)] print:border-0 print:shadow-none md:p-9">
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#3f7373]">Food Act 2014 · daily record</p>
          <h1 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] font-light leading-none">
            Food safety record — {record.venue_name} · {formatDate(record.recorded_date)}
          </h1>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <Meta label="Recorded by" value={record.recorded_by} />
            <Meta label="Sign-off date" value={formatDate(record.recorded_date)} />
            <Meta label="Record ID" value={record.id.slice(0, 8)} />
          </div>

          <section className="mt-8 rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff] p-5">
            <div className="flex items-center gap-3">
              {failed.length ? (
                <AlertTriangle className="h-5 w-5 text-[#9A3412]" aria-hidden />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-[#313c42]" aria-hidden />
              )}
              <h2 className="font-display text-3xl font-light leading-none">
                {failed.length ? "Action required" : "All recorded readings passed"}
              </h2>
            </div>
            {failed.length ? (
              <div className="mt-4 grid gap-3">
                {failed.map((item) => (
                  <div key={`${item.area}-${item.label}-${item.tempC}`} className="rounded-[10px] border border-[#9A3412]/18 bg-white p-4">
                    <p className="font-medium text-[#9A3412]">{item.area}: {item.label} · {item.tempC}°C · target {item.target}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#2A2825]">{item.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-[#2A2825]">No corrective action is needed from the readings entered. File this with the venue Food Control Plan daily records.</p>
            )}
          </section>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ReadingTable title="Fridge temps" target="≤4°C" pass={(temp) => temp <= 4} readings={record.fridge_temps ?? []} />
            <ReadingTable title="Freezer temps" target="≤-18°C" pass={(temp) => temp <= -18} readings={record.freezer_temps ?? []} />
            <ReadingTable title="Hot-hold temps" target="≥60°C" pass={(temp) => temp >= 60} readings={record.hot_hold_temps ?? []} />
            <CookingTable readings={record.cooking_temps ?? []} />
          </div>

          <section className="mt-8">
            <h2 className="font-display text-3xl font-light leading-none">Cleaning checks</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <CheckRow label="Surfaces sanitised" value={record.cleaning_checks?.surfacesSanitised} />
              <CheckRow label="Floors mopped" value={record.cleaning_checks?.floorsMopped} />
              <CheckRow label="Chillers wiped" value={record.cleaning_checks?.chillersWiped} />
              <CheckRow label="Handwash stations stocked" value={record.cleaning_checks?.handwashStationsStocked} />
            </div>
          </section>

          {record.notes && (
            <section className="mt-8 rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff] p-5">
              <h2 className="font-display text-3xl font-light leading-none">Notes</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#2A2825]">{record.notes}</p>
            </section>
          )}

          <section className="mt-8 border-t border-[rgba(35,33,31,0.10)] pt-6">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-1 h-5 w-5 text-[#3f7373]" aria-hidden />
              <div>
                <h2 className="font-display text-3xl font-light leading-none">Sign-off</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#2A2825]">
                  Verified by: {record.recorded_by} · Date: {formatDate(record.recorded_date)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#6B6661]">
                  Filed against: {record.venue_name} Food Control Plan, daily temperature and cleaning records.
                </p>
              </div>
            </div>
          </section>

          {/* Brand line — carries onto the printed/PDF record too. */}
          <footer className="mt-8 flex items-center justify-between border-t border-[rgba(35,33,31,0.10)] pt-4">
            <span className="font-display text-lg font-semibold text-[#3f7373]">assembl</span>
            <span className="text-xs text-[#68766f]">assembl.co.nz</span>
          </footer>
        </article>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00+12:00`);
  return new Intl.DateTimeFormat("en-NZ", { dateStyle: "long" }).format(date);
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#ffffff] p-3">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function ReadingTable({ title, target, readings, pass }: { title: string; target: string; readings: TempReading[]; pass: (temp: number) => boolean }) {
  return (
    <section>
      <h2 className="font-display text-3xl font-light leading-none">{title}</h2>
      <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[#6B6661]">Target {target}</p>
      <div className="mt-3 divide-y divide-[rgba(35,33,31,0.08)] overflow-hidden rounded-[10px] border border-[rgba(35,33,31,0.10)]">
        {readings.length ? readings.map((reading) => (
          <div key={`${reading.label}-${reading.tempC}`} className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-sm">
            <span>{reading.label}</span>
            <span className={pass(reading.tempC) ? "font-medium text-[#313c42]" : "font-medium text-[#9A3412]"}>
              {reading.tempC}°C · {pass(reading.tempC) ? "PASS" : "FAIL"}
            </span>
          </div>
        )) : <p className="bg-white px-4 py-3 text-sm text-[#6B6661]">No readings entered.</p>}
      </div>
    </section>
  );
}

function CookingTable({ readings }: { readings: Array<{ dish: string; tempC: number; cookedToTime: string }> }) {
  return (
    <section>
      <h2 className="font-display text-3xl font-light leading-none">Cooking final temps</h2>
      <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[#6B6661]">Target ≥75°C for 30 sec</p>
      <div className="mt-3 divide-y divide-[rgba(35,33,31,0.08)] overflow-hidden rounded-[10px] border border-[rgba(35,33,31,0.10)]">
        {readings.length ? readings.map((reading) => {
          const pass = reading.tempC >= 75;
          return (
            <div key={`${reading.dish}-${reading.tempC}`} className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-sm">
              <span>{reading.dish}{reading.cookedToTime ? ` · ${reading.cookedToTime}` : ""}</span>
              <span className={pass ? "font-medium text-[#313c42]" : "font-medium text-[#9A3412]"}>
                {reading.tempC}°C · {pass ? "PASS" : "FAIL"}
              </span>
            </div>
          );
        }) : <p className="bg-white px-4 py-3 text-sm text-[#6B6661]">No cooking readings entered.</p>}
      </div>
    </section>
  );
}

function CheckRow({ label, value }: { label: string; value?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-white px-4 py-3 text-sm">
      <span>{label}</span>
      <span className={value ? "font-medium text-[#313c42]" : "font-medium text-[#9A3412]"}>
        {value ? "DONE" : "NOT RECORDED"}
      </span>
    </div>
  );
}

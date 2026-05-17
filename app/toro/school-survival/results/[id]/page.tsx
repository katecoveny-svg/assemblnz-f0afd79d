import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, DollarSign, Shirt, TriangleAlert } from "lucide-react";
import { getServiceClient } from "@/lib/supabase/service";
import { generateSchoolSurvivalIcs } from "@/lib/toro/ics-generator";
import type { SchoolSurvivalItem, SchoolSurvivalResult } from "@/lib/toro/newsletter-parser";

export const dynamic = "force-dynamic";

const RESULT_COOKIE_PREFIX = "assembl_toro_school_survival_";

function groupFor(date: string): "this week" | "next week" | "this month" | "save for later" {
  const today = new Date();
  const target = new Date(`${date}T12:00:00+12:00`);
  const days = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return "this week";
  if (days <= 14) return "next week";
  if (days <= 31) return "this month";
  return "save for later";
}

function formatDate(date: string, time?: string): string {
  const target = new Date(`${date}T${time ?? "12:00"}:00+12:00`);
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(time ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(target);
}

function iconFor(kind: SchoolSurvivalItem["kind"]) {
  if (kind === "payment") return DollarSign;
  if (kind === "gear" || kind === "permission") return Shirt;
  if (kind === "deadline") return TriangleAlert;
  return Clock;
}

export default async function ToroSchoolSurvivalResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  let result: SchoolSurvivalResult | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = getServiceClient();
    const { data } = await supabase.from("toro_school_survival_results").select("*").eq("id", id).single();
    if (data) {
      result = {
        id: data.id,
        schoolName: data.school_name ?? undefined,
        sourceType: data.source_type,
        items: data.parsed_items ?? [],
        createdAt: data.created_at,
      };
    }
  } else if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } },
    );
    const { data } = await supabase.from("toro_school_survival_results").select("*").eq("id", id).single();
    if (data) {
      result = {
        id: data.id,
        schoolName: data.school_name ?? undefined,
        sourceType: data.source_type,
        items: data.parsed_items ?? [],
        createdAt: data.created_at,
      };
    }
  }

  if (!result) {
    const snapshot = cookieStore.get(`${RESULT_COOKIE_PREFIX}${id}`)?.value;
    if (snapshot) {
      try {
        result = JSON.parse(decodeURIComponent(snapshot)) as SchoolSurvivalResult;
      } catch {
        result = null;
      }
    }
  }

  if (!result) notFound();

  const sorted = [...result.items].sort((a, b) => `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`));
  const groups = {
    "this week": sorted.filter((item) => groupFor(item.date) === "this week"),
    "next week": sorted.filter((item) => groupFor(item.date) === "next week"),
    "this month": sorted.filter((item) => groupFor(item.date) === "this month"),
    "save for later": sorted.filter((item) => groupFor(item.date) === "save for later"),
  };
  const ics = generateSchoolSurvivalIcs({ id: result.id, items: sorted });
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            tōro · school survival result
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <div>
              <h1
                className="font-display leading-[0.94] text-[color:var(--assembl-pounamu)]"
                style={{ fontWeight: 300, fontSize: "clamp(3rem, 7vw, 6rem)" }}
              >
                {sorted.length ? `${sorted.length} things not to forget.` : "Nothing dated found yet."}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                {result.schoolName ? `${result.schoolName}: ` : null}
                Sorted into the week ahead, the next fortnight, this month, and the
                things to park safely for later.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href={icsHref}
                download={`toro-school-survival-${result.id}.ics`}
                className="cta-primary inline-flex h-12 items-center px-6"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden />
                Download calendar
              </a>
              <Link href="/toro/school-survival" className="btn-ghost inline-flex h-12 items-center px-6">
                Parse another
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.36fr]">
          <div className="space-y-8">
            {Object.entries(groups).map(([group, items]) => (
              <section key={group}>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
                  {group}
                </h2>
                {items.length ? (
                  <ol className="mt-4 grid gap-3">
                    {items.map((item, index) => {
                      const Icon = iconFor(item.kind);
                      return (
                        <li key={`${item.date}-${item.title}-${index}`} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
                          <div className="flex gap-4">
                            <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h3 className="font-display text-2xl leading-tight text-[color:var(--text-primary)]">
                                  {item.title}
                                </h3>
                                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                                  {formatDate(item.date, item.time)}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-pounamu-100 px-2.5 py-1 font-mono uppercase tracking-[0.12em] text-pounamu-900">
                                  {item.kind}
                                </span>
                                {item.amount ? <span className="rounded-full bg-karaka-100 px-2.5 py-1">NZ${item.amount}</span> : null}
                                {item.child_year_level ? <span className="rounded-full bg-taupe-100 px-2.5 py-1">{item.child_year_level}</span> : null}
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                                {item.source_paragraph}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mt-4 rounded-[8px] border border-dashed border-[rgba(35,33,31,0.14)] bg-white/35 p-5 text-sm text-[color:var(--text-secondary)]">
                    Nothing in this bucket.
                  </p>
                )}
              </section>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <h2 className="font-display text-3xl text-[color:var(--assembl-pounamu)]">Reminder rules.</h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                <li>Events: one week before.</li>
                <li>Deadlines and payments: one day before.</li>
                <li>Morning gear: two hours before.</li>
              </ul>
            </div>

            <form className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <h2 className="font-display text-3xl text-[color:var(--assembl-pounamu)]">Friday autopilot.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                Optional follow-up: send the list to yourself and talk to assembl
                about auto-processing the Friday newsletter.
              </p>
              <input
                type="email"
                placeholder="you@example.co.nz"
                className="mt-4 min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base"
              />
              <button type="button" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md bg-pounamu-900 px-5 text-sm font-medium text-mist-50">
                Save for later
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}

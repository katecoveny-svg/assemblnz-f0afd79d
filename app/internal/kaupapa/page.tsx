/**
 * Kaupapa Board — internal automation request marketplace
 *
 * The John Kim playbook adapted for assembl (per docs/runbooks/john-kim-playbook-for-assembl.md).
 *
 * Auth-gated to assembl team members. Lists every open kaupapa, lets the
 * authenticated user mark one as shipped, and surfaces the running XP total.
 *
 * Visit: /internal/kaupapa
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Kaupapa = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  requested_by: string;
  beneficiary: string | null;
  estimated_hours_saved_per_week: number | null;
  risk_level: "low" | "medium" | "high";
  status: "open" | "in_progress" | "shipped" | "archived";
  built_by: string | null;
  xp_value: number;
  shipped_at: string | null;
  proof_url: string | null;
};

const RISK_BADGE: Record<Kaupapa["risk_level"], string> = {
  low: "bg-pounamu-100 text-pounamu-900 border-pounamu-300",
  medium: "bg-karaka-100 text-karaka-900 border-karaka-300",
  high: "bg-kokowai-100 text-kokowai-900 border-kokowai-300",
};

const STATUS_BADGE: Record<Kaupapa["status"], string> = {
  open: "bg-mist-100 text-taupe-900 border-taupe-300",
  in_progress: "bg-kahurangi-100 text-kahurangi-900 border-kahurangi-300",
  shipped: "bg-pounamu-100 text-pounamu-900 border-pounamu-300",
  archived: "bg-mist-50 text-taupe-500 border-taupe-200",
};

async function fetchKaupapa(): Promise<{ rows: Kaupapa[]; totalXp: number }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("kaupapa")
    .select("*")
    .neq("status", "archived")
    .order("status", { ascending: false }) // open first, shipped at bottom
    .order("created_at", { ascending: false })
    .returns<Kaupapa[]>();

  if (error) throw new Error(`kaupapa fetch failed: ${error.message}`);

  const rows = data ?? [];
  const totalXp = rows
    .filter((r) => r.status === "shipped")
    .reduce((acc, r) => acc + (r.xp_value ?? 0), 0);

  return { rows, totalXp };
}

export default async function KaupapaPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?from=/internal/kaupapa");

  const { rows, totalXp } = await fetchKaupapa();

  const open = rows.filter((r) => r.status === "open");
  const inProgress = rows.filter((r) => r.status === "in_progress");
  const shipped = rows.filter((r) => r.status === "shipped");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16 font-inter text-taupe-900">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
          Internal · Kaupapa Board
        </p>
        <h1 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight">
          Every automation request, one board.
        </h1>
        <p className="mt-4 text-taupe-700 max-w-2xl">
          The John Kim playbook adapted for assembl. Submit a kaupapa for any
          task that should be automated. Track who's building it, when it
          ships, and how much time it saves. XP awarded on ship, not on submit.
        </p>
        <div className="mt-6 flex items-center gap-6 text-sm">
          <span className="text-taupe-600">
            <span className="font-semibold text-pounamu-900">{open.length}</span> open
          </span>
          <span className="text-taupe-600">
            <span className="font-semibold text-pounamu-900">{inProgress.length}</span> in progress
          </span>
          <span className="text-taupe-600">
            <span className="font-semibold text-pounamu-900">{shipped.length}</span> shipped
          </span>
          <span className="text-taupe-600">
            <span className="font-semibold text-pounamu-900">{totalXp.toLocaleString()}</span> XP earned
          </span>
        </div>
        <Link
          href="/internal/kaupapa/new"
          className="mt-6 inline-flex items-center px-5 py-2.5 rounded-md bg-pounamu-900 text-mist-50 text-sm font-medium hover:bg-pounamu-800 transition-colors"
        >
          + New kaupapa
        </Link>
      </header>

      {open.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-taupe-600 mb-4">
            Open · waiting for a builder
          </h2>
          <div className="grid gap-4">
            {open.map((k) => (
              <KaupapaCard key={k.id} kaupapa={k} userEmail={user.email!} />
            ))}
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-taupe-600 mb-4">
            In progress
          </h2>
          <div className="grid gap-4">
            {inProgress.map((k) => (
              <KaupapaCard key={k.id} kaupapa={k} userEmail={user.email!} />
            ))}
          </div>
        </section>
      )}

      {shipped.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-taupe-600 mb-4">
            Shipped · XP banked
          </h2>
          <div className="grid gap-4">
            {shipped.map((k) => (
              <KaupapaCard key={k.id} kaupapa={k} userEmail={user.email!} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 pt-8 border-t border-taupe-200 text-xs text-taupe-500">
        <p>
          The kaupapa board exists to celebrate progress, not punish stragglers.
          Track smoothness, not totals. Lead by using.
        </p>
      </footer>
    </main>
  );
}

function KaupapaCard({ kaupapa, userEmail }: { kaupapa: Kaupapa; userEmail: string }) {
  const canShip =
    kaupapa.status !== "shipped" &&
    (kaupapa.requested_by === userEmail || kaupapa.built_by === userEmail);

  return (
    <article className="border border-taupe-200 rounded-lg p-5 bg-mist-50 hover:bg-mist-100 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-cormorant text-xl text-pounamu-900 leading-snug">
          {kaupapa.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded border ${RISK_BADGE[kaupapa.risk_level]}`}
          >
            {kaupapa.risk_level}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${STATUS_BADGE[kaupapa.status]}`}
          >
            {kaupapa.status.replace("_", " ")}
          </span>
        </div>
      </div>
      <p className="text-sm text-taupe-700 mb-3">{kaupapa.description}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-taupe-600">
        <span>
          Requested by <span className="font-medium">{kaupapa.requested_by}</span>
        </span>
        {kaupapa.beneficiary && <span>For {kaupapa.beneficiary}</span>}
        {kaupapa.estimated_hours_saved_per_week !== null && kaupapa.estimated_hours_saved_per_week > 0 && (
          <span>~{kaupapa.estimated_hours_saved_per_week}h/wk saved</span>
        )}
        {kaupapa.built_by && (
          <span>
            Built by <span className="font-medium">{kaupapa.built_by}</span>
          </span>
        )}
        <span className="ml-auto font-medium text-pounamu-900">
          {kaupapa.xp_value} XP
        </span>
      </div>
      {canShip && (
        <form
          action="/api/kaupapa/ship"
          method="POST"
          className="mt-4 pt-3 border-t border-taupe-200"
        >
          <input type="hidden" name="kaupapa_id" value={kaupapa.id} />
          <button
            type="submit"
            className="text-xs px-3 py-1.5 rounded bg-pounamu-100 text-pounamu-900 border border-pounamu-300 hover:bg-pounamu-200 transition-colors"
          >
            I shipped this
          </button>
        </form>
      )}
    </article>
  );
}

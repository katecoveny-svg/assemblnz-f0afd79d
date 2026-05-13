/**
 * /internal/kaupapa/new — submit a new kaupapa to the board
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewKaupapaPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?from=/internal/kaupapa/new");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 font-inter text-taupe-900">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
          Internal · New kaupapa
        </p>
        <h1 className="font-cormorant text-3xl text-pounamu-900">
          What thing should be automated?
        </h1>
        <p className="mt-2 text-sm text-taupe-700">
          Be specific. Two sentences. Imagine the next person who reads this is
          an agent.
        </p>
      </header>

      <form action="/api/kaupapa" method="POST" className="space-y-5">
        <Field label="Title" hint="Imperative voice. 'Build a thing that…'">
          <input
            type="text"
            name="title"
            required
            maxLength={140}
            className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
            placeholder="Build a thing that auto-generates the weekly board email"
          />
        </Field>

        <Field label="Description" hint="Two sentences. What does it do and who is it for?">
          <textarea
            name="description"
            required
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
            placeholder="Pulls the week's kaupapa shipped count, top XP earner, and one quote from a shipped proof. Sends to me Sunday 7pm so I can post Monday morning."
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Who benefits" hint="Person, kete, customer">
            <input
              type="text"
              name="beneficiary"
              maxLength={80}
              className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
              placeholder="me / waihanga / a pilot customer"
            />
          </Field>

          <Field label="Hours saved per week" hint="Honest estimate. 0 if pure quality.">
            <input
              type="number"
              name="estimated_hours_saved_per_week"
              min={0}
              step={0.5}
              defaultValue={0}
              className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
            />
          </Field>
        </div>

        <Field
          label="Risk level"
          hint="High = touches customer data, money, or production. Medium = touches prod schema or 3rd-party APIs. Low = everything else."
        >
          <select
            name="risk_level"
            required
            defaultValue="low"
            className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>

        <Field label="Built by (optional)" hint="Self-assign if you're picking it up now. Otherwise leave blank.">
          <input
            type="text"
            name="built_by"
            maxLength={80}
            className="w-full px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
            placeholder="ECHO / SPARK / Cowork / me"
          />
        </Field>

        <input type="hidden" name="requested_by" value={user.email!} />

        <div className="flex items-center justify-between pt-4">
          <a
            href="/internal/kaupapa"
            className="text-sm text-taupe-600 hover:text-taupe-900"
          >
            ← Cancel
          </a>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-pounamu-900 text-mist-50 text-sm font-medium hover:bg-pounamu-800 transition-colors"
          >
            Submit kaupapa
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-taupe-900 mb-1">{label}</span>
      {hint && <span className="block text-xs text-taupe-600 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}

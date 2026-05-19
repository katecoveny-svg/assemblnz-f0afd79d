import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "tōro school survival",
  description:
    "Paste a school newsletter and tōro turns dates, payments, gear, and permission slips into a prioritised list with a calendar file.",
};

const EXAMPLE_NEWSLETTER = `Year 5 camp forms are due Friday 24 May. Payment of $85 is due by Monday 27 May.

Cross country is on Wednesday 29 May at 10am. Students need running shoes, water bottle, and a warm jacket.

School photos are Tuesday 4 June. Please return sibling photo forms by Friday 31 May.

Choir rehearsal is Thursday 6 June at 7:30am in the music room.`;

export default function ToroSchoolSurvivalPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.10)] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              tōro · school survival
            </p>
            <h1
              className="mt-6 font-display leading-[0.92] tracking-tight text-[color:var(--assembl-pounamu)]"
              style={{ fontWeight: 300, fontSize: "clamp(3.2rem, 7vw, 6.4rem)" }}
            >
              The school newsletter,
              <br />
              without the panic.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Paste the weekly newsletter. tōro pulls out dates, payments, gear,
              permission slips, sport, music, and the small things that otherwise
              get remembered at 8:14am.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#newsletter" className="cta-primary inline-flex h-12 items-center px-6">
                Parse newsletter <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </a>
              <Link href="/toro/route" className="btn-ghost inline-flex h-12 items-center px-6">
                See route + fuel
              </Link>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Feature icon={ClipboardList} title="Sorted by urgency" body="This week, next week, this month, and save for later." />
            <Feature icon={CalendarDays} title="Calendar-ready" body="Download an .ics file with reminders already set." />
            <Feature icon={Mail} title="No gate" body="Full result first. Email capture is optional at the end." />
          </div>
        </div>
      </section>

      <section id="newsletter" className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr]">
          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/45 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
              What tōro looks for
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[color:var(--text-body)]">
              {[
                "events and dates",
                "payment requests and due dates",
                "permission slips and consent forms",
                "gear, uniform, lunch, and transport notes",
                "sport, music, and extracurricular notices",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-[color:var(--text-secondary)]">
              Paste text for the most reliable result. PDF extraction uses a simple
              no-paid-library pass. Images are parsed when the server has an
              Anthropic key configured.
            </p>
          </aside>

          <form
            action="/api/toro/parse-newsletter"
            method="POST"
            encType="multipart/form-data"
            className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_20px_70px_rgba(35,33,31,0.06)] md:p-8"
          >
            <label className="block">
              <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                School name optional
              </span>
              <input
                name="schoolName"
                type="text"
                placeholder="e.g. Sacred Heart, Baradene, local primary"
                className="mt-2 min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500"
              />
            </label>

            <label className="mt-6 block">
              <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                Paste newsletter
              </span>
              <textarea
                name="newsletterText"
                rows={14}
                defaultValue={EXAMPLE_NEWSLETTER}
                className="mt-2 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-pounamu-500"
              />
            </label>

            <label className="mt-6 block">
              <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                Or upload PDF / image
              </span>
              <input
                name="newsletterFile"
                type="file"
                accept="application/pdf,image/*,.txt"
                className="mt-2 min-h-11 w-full rounded-md border border-dashed border-taupe-300 bg-mist-50 px-3 py-2.5 text-base"
              />
            </label>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="submit" className="cta-primary inline-flex h-12 items-center px-7">
                Build my survival list <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </button>
              <p className="text-xs leading-relaxed text-[color:var(--text-secondary)]">
                No signup gate. Your result appears first.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ClipboardList;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <h2 className="mt-4 font-display text-3xl leading-none text-[color:var(--assembl-pounamu)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
    </article>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'nz-trade-finder · assembl tools',
  description:
    'Agent tool: city + trade → owner-led NZ businesses with register-only contact hints. Key-gated. Sandbox via test_ keys.',
};

export const dynamic = 'force-dynamic';

const DEMO_KEY = 'test_assembl_demo_nz_who_runs_it';

export default function NzTradeFinderDocsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)] text-[color:var(--assembl-deep-plum,#240B21)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(145,106,112,0.14),_transparent_55%),linear-gradient(180deg,_#F5F1F2_0%,_#FFFDFB_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-14 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[color:var(--assembl-muted-plum,#654A4E)]">
          assembl · agent tool
        </p>
        <h1 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">nz-trade-finder</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
          One job: given a New Zealand <strong>city</strong> and <strong>trade</strong>, return an
          owner-led shortlist with legal/trading names, NZBN when known, register-only contact
          hints, and source links. Enrich candidates with{' '}
          <Link href="/tools/nz-who-runs-it" className="underline-offset-2 hover:underline">
            nz-who-runs-it
          </Link>
          .
        </p>

        <section className="mt-12 space-y-3">
          <h2 className="text-xl font-medium">Use when</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>You need local owner-operated trades for outreach (e.g. Wellington plumbers).</li>
            <li>You want register-shaped rows, not scraped emails.</li>
          </ul>
          <p className="text-[15px] text-[color:var(--assembl-muted-plum,#654A4E)]">
            Do not use for supermarket inventory, SERP harvest, or invented phones/emails.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Endpoint</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`POST /api/tools/nz-trade-finder
GET  /api/tools/nz-trade-finder
Auth: Authorization: Bearer <key>
   or X-Assembl-Tool-Key: <key>`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">OpenAPI-ish I/O</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`// request
{ "city": "Wellington", "trade": "plumber", "limit": 10 }

// response.data
{
  "status": "ok" | "partial" | "not_found",
  "query": { "city", "trade", "limit" },
  "results": [{
    "tradingName", "legalName", "nzbn",
    "ownerHints": string[],
    "contactHints": { "emails", "phones", "websites", "notes" },
    "sourceLinks": [{ "label", "url" }],
    "confidence": "high" | "medium" | "low"
  }],
  "adapters": { "nzbn", "companiesOffice" },
  "sandbox": boolean,
  "gaps": string[]
}`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Sandbox (test_ keys)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Keys starting with <code className="font-mono text-[13px]">test_</code> never hit live
            registers. Demo: <code className="font-mono text-[13px]">{DEMO_KEY}</code>. Try
            Wellington/plumber or Auckland/electrician.
          </p>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`curl -sS -X POST "$ORIGIN/api/tools/nz-trade-finder" \\
  -H "Authorization: Bearer ${DEMO_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"city":"Wellington","trade":"plumber","limit":5}'`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Live adapters (honest)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Live city+trade search against NZBN / Companies Office is <strong>stubbed</strong>.
            Live keys receive <strong>503</strong> with a fix hint — we do not invent register
            rows. Planned sources: NZBN + Companies Office (register-only; no email scrape).
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Errors / cap / receipts</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>401 missing/invalid key — send Bearer or X-Assembl-Tool-Key.</li>
            <li>400 validation — need non-empty city + trade; limit 1–25.</li>
            <li>429 daily cap — default sandbox 100¢/day UTC; unit cost 1¢.</li>
            <li>503 live stub / upstream — use test_ until live search ships.</li>
            <li>
              Receipts:{' '}
              <code className="font-mono text-[13px]">GET /api/tools/keys/&#123;keyId&#125;/receipts</code>
            </li>
          </ul>
        </section>

        <footer className="mt-14 border-t border-[rgba(36,11,33,0.12)] pt-6 text-sm text-[color:var(--assembl-muted-plum,#654A4E)]">
          <Link href="/tools" className="underline-offset-2 hover:underline">
            tool registry
          </Link>
          {' · '}
          <Link href="/api/tools/nz-trade-finder" className="underline-offset-2 hover:underline">
            health JSON
          </Link>
        </footer>
      </div>
    </main>
  );
}

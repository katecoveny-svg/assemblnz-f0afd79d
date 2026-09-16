import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'nz-who-runs-it · assembl tools',
  description:
    'Agent-facing tool: resolve who publicly runs a New Zealand company from a name or NZBN. Key-gated. Sandbox via test_ keys. Public-register sourcing only.',
};

export const dynamic = 'force-dynamic';

const DEMO_KEY = 'test_assembl_demo_nz_who_runs_it';

export default function NzWhoRunsItDocsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)] text-[color:var(--assembl-deep-plum,#240B21)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(145,106,112,0.14),_transparent_55%),linear-gradient(180deg,_#F5F1F2_0%,_#FFFDFB_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-14 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[color:var(--assembl-muted-plum,#654A4E)]">
          assembl · agent tool
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-instrument-sans,sans-serif)] text-4xl leading-tight tracking-tight md:text-5xl">
          nz-who-runs-it
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
          One job: given a New Zealand company name or NZBN, return structured public
          ownership/control hints — legal name, NZBN, directors when published,
          registered office when published, contact hints, and source links. Wraps
          NZBN + Companies Office gateways (same adapters as mcp-nzbn /
          mcp-companies-office).
        </p>

        <section className="mt-12 space-y-3">
          <h2 className="text-xl font-medium">Use when</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>You need to know who publicly runs an NZ company before outreach or diligence.</li>
            <li>You have a trading name and need the NZBN + legal name.</li>
            <li>You have an NZBN and need directors / registered office if published.</li>
          </ul>
          <p className="text-[15px] text-[color:var(--assembl-muted-plum,#654A4E)]">
            Do not use for credit checks, AML conclusions, or non-public filings. Do not invent
            contacts. Foodstuffs / supermarket APIs are out of scope.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Endpoint</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`POST /api/tools/nz-who-runs-it
GET  /api/tools/nz-who-runs-it   # health + docs pointer
Auth: Authorization: Bearer <key>
   or X-Assembl-Tool-Key: <key>`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Input / output</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`// request
{ "company": "assembl" | "9429053514950" }

// response.data
{
  "status": "ok" | "partial" | "not_found",
  "legalName": string | null,
  "nzbn": string | null,
  "companyNumber": string | null,
  "directors": [{ "name", "role?", "appointedOn?" }],
  "registeredOffice": string | null,
  "contactHints": { "emails", "phones", "websites", "notes" },
  "adapters": { "nzbn", "companiesOffice" },
  "privacy": { "directorsArePersonalInformation", "notice", "doNot", "sources" },
  "sourceLinks": [{ "label", "url" }],
  "sandbox": boolean,
  "gaps": string[]
}`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Sandbox (test_ keys)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Any key starting with <code className="font-mono text-[13px]">test_</code> stays in
            sandbox — realistic fixtures only, never live registers. Demo key:{' '}
            <code className="font-mono text-[13px]">{DEMO_KEY}</code>. Try{' '}
            <code className="font-mono text-[13px]">assembl</code>,{' '}
            <code className="font-mono text-[13px]">9429053514950</code>,{' '}
            <code className="font-mono text-[13px]">trade me</code>.
          </p>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`curl -sS -X POST "$ORIGIN/api/tools/nz-who-runs-it" \\
  -H "Authorization: Bearer ${DEMO_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"company":"assembl"}'`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Live data + env</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Free subscription keys at{' '}
            <a
              className="underline underline-offset-2"
              href="https://api.business.govt.nz/"
              rel="noreferrer"
            >
              api.business.govt.nz
            </a>
            . Live requires <code className="font-mono text-[13px]">NZBN_API_KEY</code> (legacy{' '}
            <code className="font-mono text-[13px]">NZBN_API_TOKEN</code>). Optional{' '}
            <code className="font-mono text-[13px]">COMPANIES_OFFICE_API_KEY</code> enriches
            directors. Missing NZBN key → <strong>503</strong> with a fix hint — never fake live
            data. Use <code className="font-mono text-[13px]">test_</code> keys when either key
            is unset.
          </p>
        </section>

        <section id="privacy" className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Privacy Act (directors)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Director names are personal information even when published. This tool redistributes
            only public-register <em>name / role / appointment</em> fields, cites NZBN + Companies
            Office on every response, and never returns residential addresses or dates of birth.
            Callers must not build secondary director dossiers (IPP 1, 9, 11). Receipts store
            director counts, not names.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Errors / cap / receipts</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>401 missing/invalid key — send Bearer or X-Assembl-Tool-Key.</li>
            <li>400 validation — body needs non-empty <code className="font-mono text-[13px]">company</code>.</li>
            <li>429 daily cap — default sandbox 100¢/day UTC; unit cost 1¢.</li>
            <li>503 upstream unconfigured — set NZBN_API_KEY or use test_.</li>
            <li>
              Receipts: <code className="font-mono text-[13px]">GET /api/tools/keys/&#123;keyId&#125;/receipts</code>{' '}
              or <code className="font-mono text-[13px]">?format=json</code>.
            </li>
          </ul>
        </section>

        <footer className="mt-14 border-t border-[rgba(36,11,33,0.12)] pt-6 text-sm text-[color:var(--assembl-muted-plum,#654A4E)]">
          <Link href="/" className="underline-offset-2 hover:underline">
            assembl
          </Link>
          {' · '}
          <Link href="/api/tools/nz-who-runs-it" className="underline-offset-2 hover:underline">
            health JSON
          </Link>
          {' · '}
          next: <code className="font-mono text-[12px]">nz-trade-finder · meeting-enhance · nz-compliance-ping</code> (register-only)
        </footer>
      </div>
    </main>
  );
}

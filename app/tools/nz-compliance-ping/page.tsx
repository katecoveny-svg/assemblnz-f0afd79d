import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'nz-compliance-ping · assembl tools',
  description:
    'Agent tool: ping public NZ register compliance signals for a company or NZBN. Key-gated. Sandbox via test_ keys. Not legal advice.',
};

export const dynamic = 'force-dynamic';

const DEMO_KEY = 'test_assembl_demo_nz_who_runs_it';

export default function NzCompliancePingDocsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)] text-[color:var(--assembl-deep-plum,#240B21)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(145,106,112,0.14),_transparent_55%),linear-gradient(180deg,_#F5F1F2_0%,_#FFFDFB_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-14 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[color:var(--assembl-muted-plum,#654A4E)]">
          assembl · agent tool
        </p>
        <h1 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">
          nz-compliance-ping
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
          One job: given a company name or NZBN, return public-register compliance signals —
          entity status, type, and watch/alert flags. Not legal, tax, or AML advice. Pair with{' '}
          <Link href="/tools/nz-who-runs-it" className="underline-offset-2 hover:underline">
            nz-who-runs-it
          </Link>{' '}
          for directors.
        </p>

        <section className="mt-12 space-y-3">
          <h2 className="text-xl font-medium">Use when</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>You need a fast public-register health check before treating an NZ entity as active.</li>
            <li>You want structured flags agents can branch on — not a prose summary.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Endpoint</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`POST /api/tools/nz-compliance-ping
GET  /api/tools/nz-compliance-ping
Auth: Authorization: Bearer <key>
   or X-Assembl-Tool-Key: <key>`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">OpenAPI-ish I/O</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`// request
{ "company": "assembl" | "9429053514950" }

// response.data
{
  "status": "ok" | "partial" | "not_found",
  "query": string,
  "legalName": string | null,
  "nzbn": string | null,
  "entityStatus": string | null,
  "entityType": string | null,
  "flags": [{ "code", "severity": "info"|"watch"|"alert", "message", "source" }],
  "sourceLinks": [{ "label", "url" }],
  "adapters": { "nzbn" },
  "sandbox": boolean,
  "disclaimer": string,
  "gaps": string[]
}`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Sandbox (test_ keys)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Demo key: <code className="font-mono text-[13px]">{DEMO_KEY}</code>. Try{' '}
            <code className="font-mono text-[13px]">assembl</code>, NZBN{' '}
            <code className="font-mono text-[13px]">9429053514950</code>, or{' '}
            <code className="font-mono text-[13px]">struck off demo</code>.
          </p>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`curl -sS -X POST "$ORIGIN/api/tools/nz-compliance-ping" \\
  -H "Authorization: Bearer ${DEMO_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"company":"assembl"}'`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Live adapters (honest)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Live reuses the NZBN client (status/type only). Missing{' '}
            <code className="font-mono text-[13px]">NZBN_API_KEY</code> → <strong>503</strong>.
            Directors are not returned here — use nz-who-runs-it. GST is never asserted without a
            register field.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Errors / cap / receipts</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>401 missing key — Bearer or X-Assembl-Tool-Key.</li>
            <li>400 validation — non-empty company.</li>
            <li>429 daily cap — sandbox default 100¢/day UTC.</li>
            <li>503 NZBN unconfigured — set NZBN_API_KEY or use test_.</li>
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
          <Link
            href="/api/tools/nz-compliance-ping"
            className="underline-offset-2 hover:underline"
          >
            health JSON
          </Link>
        </footer>
      </div>
    </main>
  );
}

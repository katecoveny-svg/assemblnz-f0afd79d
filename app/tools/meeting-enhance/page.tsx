import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'meeting-enhance · assembl tools',
  description:
    'Agent tool: transcript → Granola-class structured notes (decisions, actions, follow-ups). Key-gated. Sandbox via test_ keys. Drafts only.',
};

export const dynamic = 'force-dynamic';

const DEMO_KEY = 'test_assembl_demo_nz_who_runs_it';

export default function MeetingEnhanceDocsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)] text-[color:var(--assembl-deep-plum,#240B21)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(145,106,112,0.14),_transparent_55%),linear-gradient(180deg,_#F5F1F2_0%,_#FFFDFB_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-14 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[color:var(--assembl-muted-plum,#654A4E)]">
          assembl · agent tool
        </p>
        <h1 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">meeting-enhance</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
          One job: turn a meeting transcript into Granola-class structured notes — decisions,
          actions (owner/due when stated), follow-ups, and open questions. Drafts only. Complements{' '}
          <Link href="/do/meetings" className="underline-offset-2 hover:underline">
            Meeting DO
          </Link>
          ; does not send or assign.
        </p>

        <section className="mt-12 space-y-3">
          <h2 className="text-xl font-medium">Use when</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>You have a transcript and need structured actions/decisions for human review.</li>
            <li>You want a paid HTTP shape agents can call with a key + receipt.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Endpoint</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`POST /api/tools/meeting-enhance
GET  /api/tools/meeting-enhance
Auth: Authorization: Bearer <key>
   or X-Assembl-Tool-Key: <key>`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">OpenAPI-ish I/O</h2>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`// request
{ "transcript": "...", "title": "optional" }

// response.data
{
  "status": "ok" | "partial",
  "title": string | null,
  "summary": string,
  "decisions": [{ "text" }],
  "actions": [{ "text", "owner", "due" }],
  "followUps": [{ "text", "owner" }],
  "openQuestions": string[],
  "sections": [{ "heading", "body" }],
  "adapters": { "smartNotes": "sandbox" | "live" | "unavailable" },
  "sandbox": boolean,
  "draftsOnly": true,
  "gaps": string[]
}`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Sandbox (test_ keys)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <code className="font-mono text-[13px]">test_</code> keys return deterministic
            structured notes — no model call. Demo:{' '}
            <code className="font-mono text-[13px]">{DEMO_KEY}</code>.
          </p>
          <pre className="overflow-x-auto rounded-md bg-[color:var(--assembl-chalk,#F5F1F2)] p-4 font-mono text-[12px] leading-relaxed">
{`curl -sS -X POST "$ORIGIN/api/tools/meeting-enhance" \\
  -H "Authorization: Bearer ${DEMO_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Sprint sync","transcript":"Alex will ship the checklist by Friday. We agreed to launch next week. Budget still open."}'`}
          </pre>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Live adapters (honest)</h2>
          <p className="text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            Live calls reuse DO meeting-notes preparation when a model ladder is configured.
            If not configured → <strong>503</strong> with a fix hint. Never claims email was sent.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-medium">Errors / cap / receipts</h2>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
            <li>401 missing key — Bearer or X-Assembl-Tool-Key.</li>
            <li>400 validation — transcript required (min ~40 chars).</li>
            <li>429 daily cap — sandbox default 100¢/day UTC.</li>
            <li>503 upstream unconfigured — use test_ or configure DO models.</li>
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
          <Link href="/api/tools/meeting-enhance" className="underline-offset-2 hover:underline">
            health JSON
          </Link>
        </footer>
      </div>
    </main>
  );
}

import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { runEval } from '@/lib/journey/eval/run-eval';
import { AGENT_CONTRACT_LIST } from '@/lib/journey/contracts';
import { CAPABILITY_REGISTRY, resolveCapabilityStatus } from '@/lib/journey/capabilities';
import { journeyRepository } from '@/lib/journey/repository';
import { GROCERY_TENANT } from '@/lib/journey/genome/grocery-genome';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journey operations — internal',
  robots: { index: false, follow: false },
};

/**
 * Protected operational view (brief §10). Gated by real server-side auth
 * (`ensureAdmin` — Supabase auth + admin allowlist); unauthenticated visitors
 * are redirected to /admin/login and no operational data is rendered. The
 * middleware splash gate is defence-in-depth on top, not the access control.
 *
 * Shows eval-suite status, agent contracts + versions, live capability statuses
 * and recent runs. Durable run listing requires Supabase persistence.
 */
export default async function JourneyOpsPage() {
  // Fail closed: if the auth backend is not configured (e.g. sandbox with no
  // Supabase keys) nobody can authenticate, so deny access with a clean redirect
  // rather than a 500 — and never render operational data.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect('/admin/login?redirect=/internal/journeys');
  }
  // Real server-side authentication (Supabase auth + admin allowlist). Redirects
  // unauthenticated visitors to /admin/login; non-admins to the public site.
  // No internal data is computed or rendered before this gate passes.
  await ensureAdmin('/internal/journeys');
  const evalReport = runEval();
  const runs = await journeyRepository.listRuns(GROCERY_TENANT);
  const mono = 'var(--font-mono, monospace)';

  return (
    <main style={{ minHeight: '100dvh', background: '#f4f2ec', color: '#252d31', padding: 'clamp(1.5rem,4vw,3rem)', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ fontFamily: mono, fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3f7373', margin: 0 }}>
          assembl · internal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', margin: '0.4rem 0 1.5rem' }}>
          Journey operations
        </h1>

        {/* Eval status */}
        <section style={card()}>
          <h2 style={h2()}>Evaluation suite · v{evalReport.version}</h2>
          <p style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display, serif)', margin: '0 0 0.5rem' }}>
            {evalReport.passed}/{evalReport.total} scenarios passed
            {evalReport.criticalFailures > 0 ? (
              <span style={{ color: '#a24b3c' }}> · {evalReport.criticalFailures} critical failure(s)</span>
            ) : (
              <span style={{ color: '#2e6d4f' }}> · all critical checks pass</span>
            )}
          </p>
          {evalReport.results.filter((r) => r.criticalFailed).map((r) => (
            <p key={r.id} style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#a24b3c' }}>
              {r.id}: {r.checks.filter((c) => !c.passed).map((c) => c.id).join(', ')}
            </p>
          ))}
          <p style={hint()}>Run locally with <code>pnpm eval:journeys</code> (exits non-zero on critical failure).</p>
        </section>

        {/* Recent runs */}
        <section style={card()}>
          <h2 style={h2()}>Recent journeys</h2>
          {runs.length === 0 ? (
            <p style={hint()}>
              No durable runs. Runs persist only when Supabase is configured; the sandbox uses an
              in-process fallback that does not survive requests. Approvals, verification failures and
              exceptions will populate here once persistence is live.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#68766f' }}>
                  <th style={th()}>Run</th><th style={th()}>Stage</th><th style={th()}>Status</th><th style={th()}>Verif.</th><th style={th()}>Approvals</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 20).map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid rgba(17,19,17,0.1)' }}>
                    <td style={td()}>{r.id}</td>
                    <td style={td()}>{r.currentStageId}</td>
                    <td style={td()}>{r.status}</td>
                    <td style={td()}>{r.verifications.filter((v) => v.status !== 'passed').length} not-passed / {r.verifications.length}</td>
                    <td style={td()}>{r.proposedActions.filter((a) => a.status === 'completed').length}/{r.proposedActions.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Agent contracts */}
        <section style={card()}>
          <h2 style={h2()}>Agent contracts &amp; versions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ textAlign: 'left', color: '#68766f' }}><th style={th()}>Agent</th><th style={th()}>Version</th><th style={th()}>Authority</th><th style={th()}>Checks</th></tr></thead>
            <tbody>
              {AGENT_CONTRACT_LIST.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(17,19,17,0.1)' }}>
                  <td style={td()}>{c.name}</td>
                  <td style={{ ...td(), fontFamily: mono }}>v{c.version}</td>
                  <td style={{ ...td(), fontFamily: mono }}>{c.authorityLevel}</td>
                  <td style={td()}>{c.successChecks.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Capability statuses */}
        <section style={card()}>
          <h2 style={h2()}>Capability status (resolved from runtime config)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ textAlign: 'left', color: '#68766f' }}><th style={th()}>Capability</th><th style={th()}>Status</th><th style={th()}>Source</th><th style={th()}>Connected</th></tr></thead>
            <tbody>
              {CAPABILITY_REGISTRY.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(17,19,17,0.1)' }}>
                  <td style={td()}>{c.name}</td>
                  <td style={{ ...td(), fontFamily: mono }}>{resolveCapabilityStatus(c.id)}</td>
                  <td style={{ ...td(), fontFamily: mono }}>{c.dataSource}</td>
                  <td style={td()}>{c.externalConnected ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function card(): CSSProperties {
  return { background: '#fff', border: '1px solid rgba(17,19,17,0.12)', borderRadius: 16, padding: 'clamp(1rem,3vw,1.75rem)', marginBottom: '1.25rem' };
}
function h2(): CSSProperties {
  return { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3f7373', margin: '0 0 0.9rem' };
}
function th(): CSSProperties {
  return { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.5rem 0.5rem 0' };
}
function td(): CSSProperties {
  return { padding: '0.5rem 0.5rem 0.5rem 0' };
}
function hint(): CSSProperties {
  return { margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#68766f', lineHeight: 1.5 };
}

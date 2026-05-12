import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { KETES, type KeteSlug } from '@/lib/kete';
import { PaperworkChecklist } from './PaperworkChecklist';

/**
 * /app/admin/dashboard — operator dashboard for Kate.
 *
 * Five blocks, top to bottom:
 *   a) Kete + agents status        — agent_prompts grouped by pack
 *   b) Recent draft inbox          — last 10 toro_drafts
 *   c) Recent routing log          — last 20 routing_log rows
 *   d) Edge function health        — last 5 audit_log rows (iho-router proxy)
 *   e) Today's paperwork checklist — localStorage, no DB
 *
 * Access: email allowlist (assembl@assembl.co.nz, kate@assembl.co.nz).
 * Anyone else (or anonymous) is bounced to /login or shown a "not authorised"
 * notice. Service-role client used for cross-tenant reads (audit_log).
 */

export const metadata: Metadata = {
  title: 'assembl · admin dashboard',
  description: 'Operator view of kete, agents, drafts, routing, and paperwork.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const PACK_ORDER: readonly string[] = [
  'waihanga',
  'manaaki',
  'pikau',
  'arataki',
  'auaha',
  'hoko',
  'ako',
  'toro',
];

type AgentPromptRow = {
  agent_name: string;
  pack: string;
  display_name: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type DraftRow = {
  id: string;
  contact_name: string | null;
  draft_body: string | null;
  confidence: number | null;
  status: string;
  created_at: string;
};

type RoutingRow = {
  id: string;
  user_input: string;
  selected_kete: string;
  selected_agent: string | null;
  selected_model: string;
  confidence_score: number | null;
  routing_time_ms: number | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  agent_name: string;
  pack_id: string | null;
  model_used: string;
  duration_ms: number | null;
  error_message: string | null;
  compliance_passed: boolean | null;
  created_at: string;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect('/login?redirect=/app/admin/dashboard');
  }

  const email = (user.email || '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return <NotAuthorised email={user.email ?? ''} />;
  }

  // Parallel queries — keeps page <2s even on cold cache. Each section gates
  // its own error so a single broken query doesn't blank the whole dashboard.
  const [agentsRes, draftsRes, routingRes, auditRes] = await Promise.all([
    supabase
      .from('agent_prompts')
      .select('agent_name,pack,display_name,is_active,updated_at')
      .order('pack', { ascending: true })
      .order('agent_name', { ascending: true })
      .returns<AgentPromptRow[]>(),
    supabase
      .from('toro_drafts')
      .select('id,contact_name,draft_body,confidence,status,created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<DraftRow[]>(),
    supabase
      .from('routing_log')
      .select(
        'id,user_input,selected_kete,selected_agent,selected_model,confidence_score,routing_time_ms,created_at',
      )
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<RoutingRow[]>(),
    loadAuditRowsSafe(),
  ]);

  const agents = agentsRes.data ?? [];
  const drafts = draftsRes.data ?? [];
  const routing = routingRes.data ?? [];

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        <Header email={user.email ?? ''} />

        <section className="mt-10">
          <SectionHeading
            label="a · kete + agents"
            title="what is live"
            subtitle="agent_prompts — green = active, grey = inactive"
          />
          <KeteAgentsTable agents={agents} error={agentsRes.error?.message ?? null} />
        </section>

        <section className="mt-12">
          <SectionHeading
            label="b · recent drafts"
            title="tōro inbox"
            subtitle="last 10 toro_drafts · click through for detail"
          />
          <DraftsTable drafts={drafts} error={draftsRes.error?.message ?? null} />
        </section>

        <section className="mt-12">
          <SectionHeading
            label="c · routing log"
            title="iho router"
            subtitle="last 20 routing decisions · red row = failure"
          />
          <RoutingTable routing={routing} error={routingRes.error?.message ?? null} />
        </section>

        <section className="mt-12">
          <SectionHeading
            label="d · edge function health"
            title="iho-router activity"
            subtitle="last 5 audit_log entries · red row = non-2xx"
          />
          <AuditTable rows={auditRes.rows} error={auditRes.error} />
        </section>

        <section className="mt-12">
          <SectionHeading
            label="e · today's paperwork"
            title="todos"
            subtitle="local checklist · saved in this browser only"
          />
          <PaperworkChecklist />
        </section>

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-right font-mono text-[10.5px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
          loaded {formatDateTime(new Date().toISOString())} · {email}
        </footer>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service-role read for audit_log. RLS scopes audit_log to user_id = auth.uid()
// so the user-context client would only see Kate's own rows; the dashboard
// needs cross-tenant visibility. Email allowlist above is the gate.
// ─────────────────────────────────────────────────────────────────────────────

async function loadAuditRowsSafe(): Promise<{ rows: AuditRow[]; error: string | null }> {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('audit_log')
      .select(
        'id,agent_name,pack_id,model_used,duration_ms,error_message,compliance_passed,created_at',
      )
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<AuditRow[]>();
    if (error) return { rows: [], error: error.message };
    return { rows: data ?? [], error: null };
  } catch (e) {
    return {
      rows: [],
      error: e instanceof Error ? e.message : 'service-role client unavailable',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Header({ email }: { email: string }) {
  return (
    <header>
      <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> admin
      </p>
      <h1
        className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
        style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
      >
        dashboard
      </h1>
      <p className="mt-3 max-w-2xl font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
        what is live · what is queued · what is next · signed in as {email.toLowerCase()}
      </p>
    </header>
  );
}

function SectionHeading({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--assembl-gold-thread)]">
        {label}
      </p>
      <h2 className="mt-1 font-display text-[24px] font-light leading-tight text-[color:var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
        {subtitle}
      </p>
    </div>
  );
}

function KeteAgentsTable({
  agents,
  error,
}: {
  agents: AgentPromptRow[];
  error: string | null;
}) {
  if (error) return <ErrorPanel message={error} />;
  if (agents.length === 0) return <EmptyPanel label="no agent_prompts rows" />;

  // Group agents by pack, preserve PACK_ORDER for the eight kete; any pack
  // not in the canonical list lands at the bottom under "other".
  const groups = new Map<string, AgentPromptRow[]>();
  for (const a of agents) {
    const bucket = PACK_ORDER.includes(a.pack) ? a.pack : 'other';
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(a);
  }

  const orderedPacks = [
    ...PACK_ORDER.filter((p) => groups.has(p)),
    ...(groups.has('other') ? ['other'] : []),
  ];

  return (
    <div className="overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white">
      <table className="w-full text-[13px]">
        <thead className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
          <tr className="text-left">
            <Th>kete</Th>
            <Th>agent</Th>
            <Th>state</Th>
            <Th className="hidden md:table-cell">updated</Th>
          </tr>
        </thead>
        <tbody>
          {orderedPacks.map((pack) => {
            const rows = groups.get(pack)!;
            const keteMeta = KETES.find((k) => k.slug === (pack as KeteSlug));
            return rows.map((a, i) => (
              <tr
                key={a.pack + ':' + a.agent_name}
                className="border-b border-[color:var(--assembl-cloud)] last:border-b-0"
              >
                <Td>
                  {i === 0 ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-[color:var(--text-primary)]">
                        {keteMeta?.name ?? pack}
                      </span>
                      {keteMeta?.industry ? (
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                          {keteMeta.industry}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="font-mono text-[10.5px] text-[color:var(--text-secondary)]">
                      ↳
                    </span>
                  )}
                </Td>
                <Td>
                  <span className="font-mono text-[12px] text-[color:var(--text-primary)]">
                    {a.agent_name}
                  </span>
                  {a.display_name ? (
                    <span className="ml-2 text-[color:var(--text-secondary)]">
                      {a.display_name}
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <StatusPill active={Boolean(a.is_active)} />
                </Td>
                <Td className="hidden md:table-cell">
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {formatDateTime(a.updated_at)}
                  </span>
                </Td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[2px] bg-[color:var(--assembl-pounamu-paper)] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu-deep)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
        active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[2px] bg-[color:var(--assembl-cloud)] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-sand)]" aria-hidden />
      inactive
    </span>
  );
}

function DraftsTable({
  drafts,
  error,
}: {
  drafts: DraftRow[];
  error: string | null;
}) {
  if (error) return <ErrorPanel message={error} />;
  if (drafts.length === 0) return <EmptyPanel label="no drafts yet" />;
  return (
    <div className="overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white">
      <table className="w-full text-[13px]">
        <thead className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
          <tr className="text-left">
            <Th>when</Th>
            <Th>status</Th>
            <Th>contact</Th>
            <Th className="hidden md:table-cell">draft</Th>
            <Th className="hidden sm:table-cell">conf.</Th>
            <Th>open</Th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((d) => (
            <tr
              key={d.id}
              className="border-b border-[color:var(--assembl-cloud)] last:border-b-0"
            >
              <Td>
                <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                  {formatDateTime(d.created_at)}
                </span>
              </Td>
              <Td>
                <DraftStatusPill status={d.status} />
              </Td>
              <Td>
                <span className="text-[color:var(--text-primary)]">
                  {d.contact_name ?? '—'}
                </span>
              </Td>
              <Td className="hidden md:table-cell">
                <span className="text-[color:var(--text-secondary)]">
                  {truncate(d.draft_body ?? '', 80)}
                </span>
              </Td>
              <Td className="hidden sm:table-cell">
                <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                  {formatConfidence(d.confidence)}
                </span>
              </Td>
              <Td>
                {/* Stub link — detail page is a separate ticket. */}
                <Link
                  href={`/app/admin/dashboard/drafts/${d.id}`}
                  className="font-mono text-[11px] text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
                >
                  view →
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DraftStatusPill({ status }: { status: string }) {
  const palette: Record<string, { bg: string; fg: string }> = {
    pending_approval:  { bg: 'var(--assembl-cloud)',          fg: 'var(--text-primary)' },
    reviewing:         { bg: 'var(--assembl-cloud)',          fg: 'var(--text-primary)' },
    approved:          { bg: 'var(--assembl-pounamu-paper)',  fg: 'var(--assembl-pounamu-deep)' },
    edited_then_approved: { bg: 'var(--assembl-pounamu-paper)', fg: 'var(--assembl-pounamu-deep)' },
    sent:              { bg: 'var(--assembl-pounamu-paper)',  fg: 'var(--assembl-pounamu-deep)' },
    rejected:          { bg: 'var(--assembl-cloud)',          fg: 'var(--text-secondary)' },
    send_failed:       { bg: '#fbe9e7',                       fg: '#b3261e' },
    expired:           { bg: 'var(--assembl-cloud)',          fg: 'var(--text-secondary)' },
  };
  const pal = palette[status] ?? { bg: 'var(--assembl-cloud)', fg: 'var(--text-secondary)' };
  return (
    <span
      className="inline-flex rounded-[2px] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em]"
      style={{ backgroundColor: pal.bg, color: pal.fg }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function RoutingTable({
  routing,
  error,
}: {
  routing: RoutingRow[];
  error: string | null;
}) {
  if (error) return <ErrorPanel message={error} />;
  if (routing.length === 0) return <EmptyPanel label="no routing decisions logged yet" />;
  return (
    <div className="overflow-x-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white">
      <table className="w-full text-[13px]">
        <thead className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
          <tr className="text-left">
            <Th>when</Th>
            <Th>input</Th>
            <Th>kete</Th>
            <Th>agent</Th>
            <Th className="hidden sm:table-cell">conf.</Th>
            <Th className="hidden md:table-cell">ms</Th>
          </tr>
        </thead>
        <tbody>
          {routing.map((r) => {
            const failed = !r.selected_agent;
            return (
              <tr
                key={r.id}
                className={`border-b border-[color:var(--assembl-cloud)] last:border-b-0 ${
                  failed ? 'bg-[#fbe9e7]/40' : ''
                }`}
              >
                <Td>
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {formatDateTime(r.created_at)}
                  </span>
                </Td>
                <Td>
                  <span className="text-[color:var(--text-primary)]">
                    {truncate(r.user_input, 80)}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                    {r.selected_kete}
                  </span>
                </Td>
                <Td>
                  {failed ? (
                    <span className="font-mono text-[11px] text-[#b3261e]">— failed</span>
                  ) : (
                    <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                      {r.selected_agent}
                    </span>
                  )}
                </Td>
                <Td className="hidden sm:table-cell">
                  <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                    {formatConfidence(r.confidence_score)}
                  </span>
                </Td>
                <Td className="hidden md:table-cell">
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {r.routing_time_ms ?? '—'}
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AuditTable({ rows, error }: { rows: AuditRow[]; error: string | null }) {
  if (error) {
    return (
      <ErrorPanel
        message={error}
        hint="this section uses the service-role client; set SUPABASE_SERVICE_ROLE_KEY in Vercel env to enable it."
      />
    );
  }
  if (rows.length === 0) return <EmptyPanel label="no recent audit_log entries" />;
  return (
    <div className="overflow-x-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white">
      <table className="w-full text-[13px]">
        <thead className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
          <tr className="text-left">
            <Th>when</Th>
            <Th>agent</Th>
            <Th>model</Th>
            <Th>state</Th>
            <Th className="hidden md:table-cell">ms</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const failed = Boolean(a.error_message) || a.compliance_passed === false;
            return (
              <tr
                key={a.id}
                className={`border-b border-[color:var(--assembl-cloud)] last:border-b-0 ${
                  failed ? 'bg-[#fbe9e7]/40' : ''
                }`}
              >
                <Td>
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {formatDateTime(a.created_at)}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                    {a.agent_name}
                  </span>
                  {a.pack_id ? (
                    <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--text-secondary)]">
                      {a.pack_id}
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                    {truncate(a.model_used, 32)}
                  </span>
                </Td>
                <Td>
                  {failed ? (
                    <span className="inline-flex rounded-[2px] bg-[#fbe9e7] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#b3261e]">
                      {a.error_message ? 'error' : 'blocked'}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-[2px] bg-[color:var(--assembl-pounamu-paper)] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--assembl-pounamu-deep)]">
                      ok
                    </span>
                  )}
                </Td>
                <Td className="hidden md:table-cell">
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {a.duration_ms ?? '—'}
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--text-secondary)]">
        proxy view via audit_log · true edge-function logs (across all functions) needs a follow-up logs endpoint.
      </p>
    </div>
  );
}

function NotAuthorised({ email }: { email: string }) {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-24">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-gold-thread)]">
          not authorised
        </p>
        <h1
          className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
        >
          this surface is operator-only
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--text-body)]">
          You are signed in as <span className="font-mono">{email || '—'}</span>. The admin
          dashboard is gated to a small allowlist of operator emails.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--text-secondary)]">
          If this is a mistake, ping Kate.
        </p>
      </div>
    </main>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="rounded-[2px] border border-dashed border-[color:var(--assembl-cloud)] bg-white px-5 py-6">
      <p className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function ErrorPanel({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-[2px] border border-[#b3261e]/30 bg-white px-5 py-4">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#b3261e]">
        query error
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-primary)]">
        {message}
      </p>
      {hint ? (
        <p className="mt-2 font-mono text-[11px] text-[color:var(--text-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatConfidence(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (v <= 1) return `${(v * 100).toFixed(0)}%`;
  return `${v.toFixed(0)}%`;
}

function truncate(s: string, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

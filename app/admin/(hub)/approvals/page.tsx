import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getApprovals, getPendingApprovalCount } from '@/lib/admin/v2-data';
import { listActionRequests, dispatchEnabled, type ActionRequestRow } from '@/lib/agents/action-requests';
import { approveContent, rejectContent, reopenContent, approveAgentAction, rejectAgentAction, approveSparkTool, rejectSparkTool } from './actions';
import { listPendingSparkTools } from '@/lib/spark/store';
import {
  BODY,
  C,
  Card,
  Empty,
  MONO,
  PageHeader,
  Pill,
  SectionTitle,
  nzDate,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/approvals — the content-approval queue.
 *
 * AI-generated content lands in content_approvals as PENDING and only ships
 * once approved here (migration 20260703100000). Phase 5 (withBrandLock) is
 * the producer; this page is the human gate — Kate approves or rejects, with
 * an optional note that travels back to the producer.
 */

const FILTERS = ['pending', 'approved', 'rejected', 'all'] as const;

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  approved: 'ok',
  pending: 'warn',
  rejected: 'bad',
};

const noteInput: CSSProperties = {
  flex: '1 1 220px',
  padding: '8px 11px',
  fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
  fontSize: 13,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
};

function reviewButton(color: string, filled: boolean): CSSProperties {
  return {
    fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 13,
    color: filled ? '#fff' : color,
    background: filled ? color : 'transparent',
    border: `1.5px solid ${color}`,
    borderRadius: 999,
    padding: '7px 16px',
    cursor: 'pointer',
  };
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const filter = (FILTERS as readonly string[]).includes(statusParam ?? '') ? statusParam! : 'pending';

  const [{ rows, available }, pendingCount, actionRows, sparkDrafts] = await Promise.all([
    getApprovals(filter),
    getPendingApprovalCount(),
    listActionRequests('all'),
    listPendingSparkTools(),
  ]);
  const pendingActions = actionRows.filter((a) => a.status === 'pending');

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Approvals"
        title="content approvals"
        lede="Everything AI-generated waits here as pending until you approve it. Nothing ships to a live surface without a yes."
        actions={
          pendingCount !== null && pendingCount > 0 ? <Pill tone="warn">{pendingCount} pending</Pill> : undefined
        }
      />

      {!available ? (
        <Empty>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>content_approvals</code> queue isn&apos;t live in this
          environment yet — apply migration 20260703100000. Once Phase 5 (withBrandLock) starts producing, every
          artefact lands here as pending.
        </Empty>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {FILTERS.map((f) => (
              <Link
                key={f}
                href={f === 'pending' ? '/admin/approvals' : `/admin/approvals?status=${f}`}
                style={{
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 13,
                  color: filter === f ? C.ink : C.body,
                  background: filter === f ? C.gold : C.paper,
                  border: `1.5px solid ${filter === f ? C.gold : C.hairline}`,
                  borderRadius: 999,
                  padding: '6px 15px',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </Link>
            ))}
          </div>

          {rows.length === 0 ? (
            <Empty>
              {filter === 'pending'
                ? 'Nothing waiting — the queue is clear.'
                : `No ${filter === 'all' ? '' : filter + ' '}items yet.`}
            </Empty>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {rows.map((r) => (
                <Card key={r.id} style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Pill tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status}</Pill>
                    <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.ink }}>
                      {r.title ?? `${r.kind} for ${r.surface}`}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
                      {nzDate(r.created_at)}
                    </span>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.body, margin: '0 0 4px' }}>
                    {r.kind} · surface: {r.surface}
                    {r.tenant_slug ? ` · tenant: ${r.tenant_slug}` : ''}
                    {r.created_by ? ` · by ${r.created_by}` : ''}
                  </p>
                  {r.storage_path && (
                    <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.body, margin: '0 0 4px' }}>
                      {r.storage_path}
                    </p>
                  )}
                  {r.summary && (
                    <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: '6px 0 0' }}>{r.summary}</p>
                  )}

                  {r.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                      <form action={approveContent} style={{ display: 'contents' }}>
                        <input type="hidden" name="id" value={r.id} />
                        <input name="note" placeholder="Optional note back to the producer" style={noteInput} />
                        <button type="submit" style={reviewButton(C.ok, true)}>
                          Approve
                        </button>
                      </form>
                      <form action={rejectContent}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" style={reviewButton(C.bad, false)}>
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>
                        {r.status} by {r.reviewed_by ?? '—'} · {nzDate(r.reviewed_at)}
                        {r.review_note ? ` · "${r.review_note}"` : ''}
                      </span>
                      <form action={reopenContent}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          style={{
                            fontFamily: BODY,
                            fontWeight: 700,
                            fontSize: 12.5,
                            color: C.body,
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                          }}
                        >
                          Reopen
                        </button>
                      </form>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <SectionTitle>
            Agent action requests{pendingActions.length > 0 ? ` · ${pendingActions.length} pending` : ''}
          </SectionTitle>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.body, margin: '0 0 12px' }}>
            Actions agents filed from live chat — email drafts and webhook posts. Approving records
            your decision;{' '}
            {dispatchEnabled()
              ? 'dispatch is ON, so approved actions are carried out immediately.'
              : 'dispatch is OFF (ACTION_DISPATCH_ENABLED), so nothing sends even after approval — the yes is just on file.'}
          </p>
          {actionRows.length === 0 ? (
            <Empty>No agent action requests yet — they appear when an agent files a draft from chat.</Empty>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {actionRows.map((a: ActionRequestRow) => {
                const email = a.kind === 'email_draft' ? (a.payload as { to?: string; subject?: string; body?: string; reason?: string }) : null;
                const hook = a.kind === 'webhook' ? (a.payload as { url?: string; reason?: string }) : null;
                const conn = a.kind === 'connector_action' ? (a.payload as { action?: string; app?: string; data?: Record<string, unknown>; reason?: string }) : null;
                return (
                  <Card key={a.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <Pill tone={a.status === 'pending' ? 'warn' : a.status === 'rejected' || a.status === 'failed' ? 'bad' : 'ok'}>
                        {a.status}
                      </Pill>
                      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.ink }}>
                        {a.kind === 'email_draft'
                          ? `email draft — ${email?.subject ?? '(no subject)'}`
                          : a.kind === 'webhook'
                            ? `webhook — ${hook?.url ?? ''}`
                            : `${conn?.action?.replace(/_/g, ' ') ?? 'business action'} → ${conn?.app ?? 'connected tool'}`}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
                        {nzDate(a.created_at)}
                      </span>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.body, margin: '0 0 4px' }}>
                      agent: {a.agent_slug} · from: {a.requested_by}
                      {email?.to ? ` · to: ${email.to}` : a.kind === 'email_draft' ? ' · to: (not provided)' : ''}
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: 13, color: C.body, margin: '4px 0 0' }}>
                      {(email?.reason ?? hook?.reason ?? conn?.reason) || ''}
                    </p>
                    {conn?.data ? (
                      <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.body, whiteSpace: 'pre-wrap', margin: '8px 0 0', borderLeft: `2px solid ${C.hairline}`, paddingLeft: 12 }}>
                        {JSON.stringify(conn.data, null, 2).slice(0, 700)}
                      </p>
                    ) : null}
                    {email?.body ? (
                      <p style={{ fontFamily: BODY, fontSize: 13, color: C.body, whiteSpace: 'pre-wrap', margin: '8px 0 0', borderLeft: `2px solid ${C.hairline}`, paddingLeft: 12 }}>
                        {email.body.length > 900 ? `${email.body.slice(0, 900)}…` : email.body}
                      </p>
                    ) : null}

                    {a.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                        <form action={approveAgentAction} style={{ display: 'contents' }}>
                          <input type="hidden" name="id" value={a.id} />
                          <input name="note" placeholder="Optional review note" style={noteInput} />
                          <button type="submit" style={reviewButton(C.ok, true)}>
                            Approve
                          </button>
                        </form>
                        <form action={rejectAgentAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" style={reviewButton(C.bad, false)}>
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : (
                      <p style={{ fontFamily: MONO, fontSize: 11, color: C.muted, margin: '12px 0 0' }}>
                        {a.status} by {a.reviewer ?? '—'} · {nzDate(a.decided_at ?? a.created_at)}
                        {a.review_note ? ` · "${a.review_note}"` : ''}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          <SectionTitle>
            SPARK tool drafts{sparkDrafts.length > 0 ? ` · ${sparkDrafts.length} pending` : ''}
          </SectionTitle>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.body, margin: '0 0 12px' }}>
            Tools the public built at <code style={{ fontFamily: MONO, fontSize: 12 }}>/spark</code>. Each is stored as a
            draft and shows a draft ribbon on its shareable page until you approve it here — nothing auto-publishes.
          </p>
          {sparkDrafts.length === 0 ? (
            <Empty>No SPARK tool drafts waiting.</Empty>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {sparkDrafts.map((t) => (
                <Card key={t.id} style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Pill tone="warn">draft</Pill>
                    <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.ink }}>{t.title}</span>
                    <Link
                      href={`/spark/tool/${t.slug}`}
                      style={{ fontFamily: MONO, fontSize: 11.5, color: C.body }}
                      target="_blank"
                    >
                      /spark/tool/{t.slug} ↗
                    </Link>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
                      {nzDate(t.created_at)}
                    </span>
                  </div>
                  <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: '0 0 4px' }}>{t.summary}</p>
                  <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.body, margin: '0 0 4px' }}>
                    asked: &ldquo;{t.prompt.slice(0, 160)}{t.prompt.length > 160 ? '…' : ''}&rdquo;
                    {t.requested_by ? ` · ${t.requested_by}` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                    <form action={approveSparkTool} style={{ display: 'contents' }}>
                      <input type="hidden" name="slug" value={t.slug} />
                      <input name="note" placeholder="Optional note" style={noteInput} />
                      <button type="submit" style={reviewButton(C.ok, true)}>
                        Approve
                      </button>
                    </form>
                    <form action={rejectSparkTool}>
                      <input type="hidden" name="slug" value={t.slug} />
                      <button type="submit" style={reviewButton(C.bad, false)}>
                        Reject
                      </button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <SectionTitle>How producers use this queue</SectionTitle>
          <Card tone="cream">
            <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: 0 }}>
              Insert a row with <code style={{ fontFamily: MONO, fontSize: 12 }}>surface</code>,{' '}
              <code style={{ fontFamily: MONO, fontSize: 12 }}>kind</code> and either a{' '}
              <code style={{ fontFamily: MONO, fontSize: 12 }}>storage_path</code> or inline{' '}
              <code style={{ fontFamily: MONO, fontSize: 12 }}>payload</code> — it lands as pending. Publish only rows
              whose status is approved. Phase 5&apos;s withBrandLock wrapper writes here; the schema is deliberately
              generic so any surface can adopt it without a migration.
            </p>
          </Card>
        </>
      )}
    </>
  );
}

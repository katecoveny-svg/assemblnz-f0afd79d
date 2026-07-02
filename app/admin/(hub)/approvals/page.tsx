import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getApprovals, getPendingApprovalCount } from '@/lib/admin/v2-data';
import { approveContent, rejectContent, reopenContent } from './actions';
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

  const [{ rows, available }, pendingCount] = await Promise.all([
    getApprovals(filter),
    getPendingApprovalCount(),
  ]);

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
                  background: filter === f ? C.canary : C.paper,
                  border: `1.5px solid ${filter === f ? C.canary : C.hairline}`,
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

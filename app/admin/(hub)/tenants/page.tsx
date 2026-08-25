import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TENANTS } from '@/lib/customers/tenants';
import { brandSlugs } from '@/lib/brand/configs';
import { getTenantDbRows, type TenantDbRow } from '@/lib/admin/v2-data';
import { updateTenant } from './actions';
import {
  BODY,
  C,
  GoldButton,
  Card,
  Eyebrow,
  Grid,
  MONO,
  PageHeader,
  Pill,
  SectionTitle,
  StatCard,
  nzDate,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/tenants — the hosted pilot workspaces.
 *
 * The code registry (lib/customers/tenants.ts) decides WHICH pilots exist;
 * tenant_customers carries operational state (status, brand-config pointer,
 * demo-seed toggle) that this page edits. Registry entries without a DB row
 * still render — with a note that the seed migration hasn't run here.
 */

const input: CSSProperties = {
  padding: '8px 11px',
  fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
};

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'neutral' | 'gold'> = {
  live: 'ok',
  pilot: 'ok',
  'concept-pending': 'warn',
  concept: 'gold',
  paused: 'warn',
  archived: 'neutral',
};

const STATUSES = ['concept', 'concept-pending', 'pilot', 'live', 'paused', 'archived'];

export default async function TenantsPage() {
  const db = await getTenantDbRows();
  const dbBySlug = new Map<string, TenantDbRow>(db.rows.map((r) => [r.slug, r]));

  // Union: registry first (code truth), then any DB-only rows.
  const registrySlugs = new Set(TENANTS.map((t) => t.slug));
  const dbOnly = db.rows.filter((r) => !registrySlugs.has(r.slug));

  const liveCount = db.rows.filter((r) => r.status === 'pilot' || r.status === 'live').length;

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Tenants"
        title="tenants & pilots"
        lede="Hosted customer workspaces under /customers. Code registry decides which exist; this page edits pilot status, the brand-config pointer, and demo-seed visibility."
      />

      <Grid min={200}>
        <StatCard label="Registry pilots" value={TENANTS.length} hint="lib/customers/tenants.ts" />
        <StatCard label="DB rows" value={db.available ? db.rows.length : '—'} hint="tenant_customers" />
        <StatCard label="Signed / live" value={db.available ? liveCount : '—'} />
      </Grid>

      <SectionTitle>Pilot workspaces</SectionTitle>
      <div style={{ display: 'grid', gap: 12 }}>
        {TENANTS.map((t) => {
          const row = dbBySlug.get(t.slug);
          return (
            <Card key={t.slug} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 16, color: C.ink }}>{t.displayName}</span>
                <Pill tone={STATUS_TONE[row?.status ?? t.status] ?? 'neutral'}>{row?.status ?? t.status}</Pill>
                {row && !row.demo_seed_enabled && <Pill tone="neutral">seed off</Pill>}
                <Link
                  href={`/customers/${t.slug}`}
                  style={{ fontFamily: MONO, fontSize: 12, color: C.gold, textDecoration: 'none', marginLeft: 'auto' }}
                >
                  /customers/{t.slug} →
                </Link>
              </div>
              <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: '0 0 6px' }}>
                {t.blurb}
                {t.parentBrand ? ` · ${t.parentBrand}` : ''}
              </p>
              {row?.updated_at && (
                <p style={{ fontFamily: MONO, fontSize: 12, color: C.muted, margin: '0 0 12px' }}>
                  updated {nzDate(row.updated_at)}
                </p>
              )}

              {!db.available ? (
                <p style={{ fontFamily: MONO, fontSize: 12, color: C.muted, margin: 0 }}>
                  tenant_customers isn&apos;t live in this environment — read-only registry view.
                </p>
              ) : !row ? (
                <p style={{ fontFamily: MONO, fontSize: 12, color: C.muted, margin: 0 }}>
                  No DB row yet — this pilot&apos;s seed migration hasn&apos;t run here. Registry entry is read-only.
                </p>
              ) : (
                <form action={updateTenant} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <input type="hidden" name="slug" value={t.slug} />
                  <label>
                    <Eyebrow style={{ marginBottom: 5 }}>Pilot status</Eyebrow>
                    <select name="status" defaultValue={row.status ?? 'concept'} style={{ ...input, width: 170 }}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <Eyebrow style={{ marginBottom: 5 }}>Brand config</Eyebrow>
                    <select name="brand_config" defaultValue={row.brand_config ?? ''} style={{ ...input, width: 190, fontFamily: MONO, fontSize: 12.5 }}>
                      <option value="">— none —</option>
                      {brandSlugs.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ flex: '1 1 260px' }}>
                    <Eyebrow style={{ marginBottom: 5 }}>Tagline</Eyebrow>
                    <input name="tagline" defaultValue={row.tagline ?? ''} style={{ ...input, width: '100%' }} />
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontFamily: BODY,
                      fontSize: 13,
                      color: C.body,
                      paddingBottom: 9,
                      cursor: 'pointer',
                    }}
                  >
                    <input type="checkbox" name="demo_seed_enabled" defaultChecked={row.demo_seed_enabled} />
                    demo seed data
                  </label>
                  <GoldButton style={{ padding: '8px 16px' }}>Save</GoldButton>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      {dbOnly.length > 0 && (
        <>
          <SectionTitle>In the database but not the registry</SectionTitle>
          <Card tone="cream">
            <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: '0 0 10px' }}>
              These tenant_customers rows have no entry in lib/customers/tenants.ts — add them to the registry (code is
              the source of truth for which pilots exist) or archive them.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dbOnly.map((r) => (
                <Pill key={r.slug} tone="neutral">
                  {r.slug} · {r.status ?? '—'}
                </Pill>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}

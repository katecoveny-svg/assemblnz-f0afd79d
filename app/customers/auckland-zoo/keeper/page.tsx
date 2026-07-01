import Link from 'next/link';
import { SPECIES, TODAY, WELFARE_SUMMARY, getAnimal, getSpecies } from '@/lib/customers/auckland-zoo/data';
import {
  SHIFTS,
  ROSTER_DATE,
  COVER_REQUESTS,
  ENCLOSURE_CHECKS,
  EVENTS,
  DAILY_BRIEF,
} from '@/lib/customers/auckland-zoo/ops-data';
import { Card, DemoTag, Eyebrow, PageHeading, SpeciesSilhouette, StatusDot } from './_components/ui';

const BASE = '/customers/auckland-zoo/keeper';

export default function DashboardPage() {
  const focus = getAnimal(TODAY.focusAnimalId);
  const focusSpecies = focus ? getSpecies(focus.species) : undefined;
  const onToday = SHIFTS.filter((s) => s.staff !== 'Cover needed').length;
  const openCovers = COVER_REQUESTS.filter((c) => c.status === 'open').length;
  const flagChecks = ENCLOSURE_CHECKS.filter(
    (c) => c.barrier !== 'ok' || c.waterQuality !== 'ok' || c.feedTemp !== 'ok',
  );

  return (
    <div>
      <PageHeading
        eyebrow={`Keeper · ${ROSTER_DATE} · 07:00`}
        title="Kia ora — here's the day ahead"
        intro="Your open-of-day view: who's on, what needs eyes first, this morning's enclosure checks, and what's happening across the zoo. Every item links to an unsigned draft for a named human to sign."
      />

      {/* Top strip — the four things you check first */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="On today" value={String(onToday)} sub="keepers, vet, nurse, education, vols" href={`${BASE}/roster`} />
        <StatCard label="Welfare flags" value={String(WELFARE_SUMMARY.gaps + WELFARE_SUMMARY.reviewDue)} sub="need review" tone="watch" href={`${BASE}/welfare`} />
        <StatCard label="H&S checks flagged" value={String(flagChecks.length)} sub="this morning" tone="watch" href={`${BASE}/enclosures`} />
        <StatCard label="Cover requests" value={String(openCovers)} sub="open" tone={openCovers ? 'urgent' : 'ok'} href={`${BASE}/roster`} />
      </div>

      {/* Focus animal + urgent notes */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Eyebrow>Today's animal focus</Eyebrow>
          {focus && focusSpecies ? (
            <div className="mt-3 flex items-start gap-4">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary)' }}
              >
                <SpeciesSilhouette slug={focusSpecies.slug} className="h-10 w-10" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-[family-name:var(--font-display)] text-[22px]" style={{ color: 'var(--tenant-ink)' }}>
                    {focus.name}
                  </h2>
                  <StatusDot tone={focus.statusTone} />
                </div>
                <p className="text-[13px]" style={{ color: 'var(--tenant-muted)' }}>
                  {focusSpecies.name} · {focus.age}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
                  {focus.status}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={`${BASE}/clinical`} className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white" style={{ background: 'var(--tenant-primary)' }}>
                    Open clinical draft
                  </Link>
                  <DemoTag>{focus.provenance}</DemoTag>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <Eyebrow>Needs eyes first</Eyebrow>
          <ul className="mt-3 space-y-2.5">
            {DAILY_BRIEF.welfareFlags.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1"><StatusDot tone={f.tone} /></span>
                <span className="text-[13px] leading-snug" style={{ color: 'var(--tenant-ink)' }}>{f.label}</span>
              </li>
            ))}
          </ul>
          <Link href={`${BASE}/brief`} className="mt-4 inline-block text-[13px] font-medium underline-offset-2 hover:underline" style={{ color: 'var(--tenant-primary)' }}>
            Open the leadership brief →
          </Link>
        </Card>
      </div>

      {/* Morning checks + happening today */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <Eyebrow>This morning's enclosure checks</Eyebrow>
            <Link href={`${BASE}/enclosures`} className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--tenant-primary)' }}>
              All checks →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {ENCLOSURE_CHECKS.map((c) => {
              const tone = c.barrier !== 'ok' || c.waterQuality !== 'ok' || c.feedTemp !== 'ok' ? 'watch' : 'ok';
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}>
                  <span className="flex items-center gap-2 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                    <StatusDot tone={tone} />
                    {c.enclosure}
                  </span>
                  <span className="text-[11.5px]" style={{ color: 'var(--tenant-muted)' }}>{c.checkedBy} · {c.time}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <Eyebrow>Happening today</Eyebrow>
            <Link href={`${BASE}/events`} className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--tenant-primary)' }}>
              All events →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {EVENTS.map((e) => (
              <li key={e.id} className="rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-medium" style={{ color: 'var(--tenant-ink)' }}>{e.title}</span>
                  <StatusDot tone={e.status} />
                </div>
                <p className="text-[11.5px]" style={{ color: 'var(--tenant-muted)' }}>{e.when} · {e.headcount}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* VIPs + collection rail */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Eyebrow>Expected on site</Eyebrow>
          <ul className="mt-3 space-y-2">
            {DAILY_BRIEF.vips.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--tenant-ink)' }}>
                <span className="mt-1.5"><StatusDot tone="ok" /></span>
                {v}
              </li>
            ))}
          </ul>
        </Card>

        <section>
          <Eyebrow>Collection · {SPECIES.length} recovery species</Eyebrow>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {SPECIES.map((s) => (
              <Link key={s.slug} href={`${BASE}/species`} className="group">
                <div className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors group-hover:border-[var(--tenant-primary)]" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}>
                  <span style={{ color: 'var(--tenant-primary)' }}>
                    <SpeciesSilhouette slug={s.slug} className="h-8 w-8" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight" style={{ color: 'var(--tenant-ink)' }}>{s.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone = 'ok', href }: { label: string; value: string; sub: string; tone?: 'ok' | 'watch' | 'urgent'; href: string }) {
  return (
    <Link href={href} className="group">
      <div className="h-full rounded-2xl border p-4 transition-colors group-hover:border-[var(--tenant-primary)]" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}>
        <div className="flex items-center gap-2">
          <StatusDot tone={tone} />
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--tenant-muted)' }}>{label}</p>
        </div>
        <p className="mt-1.5 font-[family-name:var(--font-display)] text-[30px] leading-none" style={{ color: 'var(--tenant-ink)' }}>{value}</p>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{sub}</p>
      </div>
    </Link>
  );
}

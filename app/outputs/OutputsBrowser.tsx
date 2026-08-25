'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import {
  GROUP_ORDER,
  OUTPUTS,
  OUTPUT_CHANNELS,
  OUTPUT_GROUPS,
  OUTPUT_TYPES,
  type OutputChannel,
  type OutputDefinition,
  type OutputGroup,
  type OutputType,
} from '@/lib/outputs/catalogue';

// Curated framework filters — the NZ-regulated headline set the brief calls
// for. Each matches an output if any of its `frameworks` strings contains the
// `match` substring. Leading with these is the counter-position against the
// generic, location-neutral template lists: a procurement officer should see
// "NZ regulated industries" at a glance.
const FRAMEWORK_FILTERS: { label: string; match: string }[] = [
  { label: 'Privacy Act 2020', match: 'Privacy Act 2020' },
  { label: 'IPP 3A', match: 'IPP 3A' },
  { label: 'Fair Trading Act', match: 'Fair Trading Act' },
  { label: 'Consumer Guarantees Act', match: 'Consumer Guarantees Act' },
  { label: 'HSWA 2015', match: 'Health and Safety at Work Act 2015' },
  { label: 'Building Act 2004', match: 'Building Act 2004' },
  { label: 'Customs & Excise Act', match: 'Customs and Excise Act' },
  { label: 'Sale & Supply of Alcohol Act', match: 'Sale and Supply of Alcohol Act' },
  { label: 'Food Act 2014', match: 'Food Act 2014' },
  { label: 'Land Transport', match: 'Land Transport' },
  { label: 'Education & Training Act', match: 'Education and Training Act' },
  { label: 'Te Whāriki', match: 'Te Whāriki' },
  { label: 'NCEA / NZQA', match: 'NZQA' },
];

// A kete is "still filling out" when the catalogue holds fewer than this many
// named outputs for it. We ship those kete anyway with an honest "more
// workflows coming soon" card rather than fabricating output names. The count
// is taken from the full catalogue (not the filtered view), so an active
// filter never makes a healthy kete look thin.
const MIN_NAMED_OUTPUTS = 6;

const THIN_GROUPS = new Set<OutputGroup>(
  GROUP_ORDER.filter(
    (g) => OUTPUTS.filter((o) => o.group === g).length < MIN_NAMED_OUTPUTS,
  ),
);

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

export function OutputsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedGroups = parseList(searchParams.get('kete'));
  const selectedTypes = parseList(searchParams.get('type'));
  const selectedFrameworks = parseList(searchParams.get('framework'));
  const selectedChannels = parseList(searchParams.get('channel'));

  const activeCount =
    selectedGroups.length +
    selectedTypes.length +
    selectedFrameworks.length +
    selectedChannels.length;

  // URL-stateful toggling. Writing to the query string keeps every filter
  // combination directly shareable and back-button friendly.
  const setParam = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (values.length) params.set(key, values.join(','));
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggle = useCallback(
    (key: string, current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setParam(key, next);
    },
    [setParam],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const matches = useCallback(
    (o: OutputDefinition) => {
      if (selectedGroups.length && !selectedGroups.includes(o.group)) return false;
      if (selectedTypes.length && !selectedTypes.includes(o.type)) return false;
      if (selectedChannels.length) {
        const hit = selectedChannels.some((c) => o.channels.includes(c as OutputChannel));
        if (!hit) return false;
      }
      if (selectedFrameworks.length) {
        const hit = selectedFrameworks.some((label) => {
          const f = FRAMEWORK_FILTERS.find((x) => x.label === label);
          if (!f) return false;
          return o.frameworks.some((fw) => fw.includes(f.match));
        });
        if (!hit) return false;
      }
      return true;
    },
    [selectedGroups, selectedTypes, selectedChannels, selectedFrameworks],
  );

  const filtered = useMemo(() => OUTPUTS.filter(matches), [matches]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      meta: OUTPUT_GROUPS[group],
      items: filtered.filter((o) => o.group === group),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <>
      {/* Filter bar */}
      <div className="container">
        <div className="mx-auto max-w-7xl">
          <FilterGroup
            legend="Industry"
            hint="Kete pack"
            options={GROUP_ORDER.map((g) => ({
              value: g,
              label: OUTPUT_GROUPS[g].label,
            }))}
            selected={selectedGroups}
            onToggle={(v) => toggle('kete', selectedGroups, v)}
          />
          <FilterGroup
            legend="Output type"
            options={OUTPUT_TYPES.map((t) => ({ value: t, label: t }))}
            selected={selectedTypes}
            onToggle={(v) => toggle('type', selectedTypes, v)}
          />
          <FilterGroup
            legend="Framework"
            hint="NZ legislation"
            options={FRAMEWORK_FILTERS.map((f) => ({ value: f.label, label: f.label }))}
            selected={selectedFrameworks}
            onToggle={(v) => toggle('framework', selectedFrameworks, v)}
          />
          <FilterGroup
            legend="Channel"
            options={OUTPUT_CHANNELS.map((c) => ({ value: c, label: c }))}
            selected={selectedChannels}
            onToggle={(v) => toggle('channel', selectedChannels, v)}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(35,33,31,0.10)] pt-5">
            <p
              className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
              aria-live="polite"
            >
              {filtered.length} {filtered.length === 1 ? 'output' : 'outputs'}
              {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? '' : 's'} on` : ''}
            </p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(35,33,31,0.14)] bg-white/55 px-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-primary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results — grouped by kete */}
      <div className="container pb-24 pt-12">
        <div className="mx-auto max-w-7xl">
          {grouped.length === 0 ? (
            <div className="rounded-card border border-[rgba(35,33,31,0.12)] bg-white/55 p-10 text-center">
              <p className="font-display text-2xl text-[color:var(--text-primary)]">
                No outputs match those filters.
              </p>
              <p className="mt-3 text-sm text-[color:var(--text-body)]">
                Try clearing one — most outputs cross more than one industry.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="cta-primary mt-6 inline-flex h-11 items-center px-6 text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {grouped.map(({ group, meta, items }) => (
                <section key={group} aria-labelledby={`group-${group}`}>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="h-3 w-3 flex-shrink-0 translate-y-0.5 rounded-full"
                      style={{ backgroundColor: meta.accent }}
                      aria-hidden
                    />
                    <h2
                      id={`group-${group}`}
                      className="font-display text-3xl text-[color:var(--text-primary)] md:text-4xl"
                    >
                      {meta.label}
                    </h2>
                    <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                      {meta.sublabel} · {items.length}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((o) => (
                      <OutputCard key={o.slug} output={o} accent={meta.accent} />
                    ))}
                    {THIN_GROUPS.has(group) ? (
                      <ComingSoonCard label={meta.label} accent={meta.accent} />
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({
  legend,
  hint,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  hint?: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="border-0 p-0 [&+&]:mt-5">
      <legend className="mb-2.5 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {legend}
        {hint ? (
          <span className="text-[color:var(--text-secondary)]/70">· {hint}</span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt.value)}
              className={
                active
                  ? 'inline-flex h-9 items-center rounded-full border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] px-3.5 text-[13px] font-medium text-white transition'
                  : 'inline-flex h-9 items-center rounded-full border border-[rgba(35,33,31,0.16)] bg-white/55 px-3.5 text-[13px] text-[color:var(--text-primary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]'
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ComingSoonCard({ label, accent }: { label: string; accent: string }) {
  return (
    <div
      className="flex h-full flex-col justify-center rounded-card border border-dashed bg-white/30 p-6 text-left"
      style={{ borderColor: `${accent}55` }}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-chip border border-[rgba(35,33,31,0.12)] bg-white/50 px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        In build
      </span>
      <h3 className="mt-4 font-display text-2xl leading-tight text-[color:var(--text-primary)]">
        More {label} workflows coming soon
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
        We name an output here once it ships on the {label} pack — never before.
        Want one sooner? A Pilot Sprint builds it on your own work first.
      </p>
      <Link
        href="/pilot-sprint"
        className="mt-5 inline-flex w-fit items-center font-mono text-[12px] uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        Start a Pilot Sprint
        <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}

function OutputCard({
  output,
  accent,
}: {
  output: OutputDefinition;
  accent: string;
}) {
  return (
    <Link
      href={`/outputs/${output.slug}`}
      className="kete-card group flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5"
      style={{ ['--kete-accent' as string]: `${accent}59` }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-chip border border-[rgba(35,33,31,0.14)] bg-white/50 px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          {output.type}
        </span>
        {output.toolHref ? (
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
            Live tool
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 font-display text-2xl leading-tight text-[color:var(--text-primary)]">
        {output.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
        {output.oneLiner}
      </p>

      <span
        className="mt-5 inline-flex items-center font-mono text-[12px] uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        See the output
        <ArrowRight
          className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </span>
    </Link>
  );
}

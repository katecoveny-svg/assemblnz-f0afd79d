'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Resolve a `drive_path` value to something safe to render as an anchor href.
 * Rows may carry either a fully-qualified URL (when the workflow already
 * resolved the Drive document URL) or a storage-style path like
 * `Assembl-Drive/[customer-slug]/business-pulse/YYYY-MM-DD-pulse.md`.
 *
 * For URLs we link directly. For storage paths we route through the resolver
 * endpoint (`/api/business-pulse/[id]/open`) which redirects to the underlying
 * Drive document once the workflow API is wired. Returns null if we can't
 * produce a safe target — caller hides the link.
 */
function resolveBriefHref(briefId: string, drivePath: string | null): string | null {
  if (!drivePath) return null;
  if (/^https?:\/\//i.test(drivePath)) return drivePath;
  return `/api/business-pulse/${encodeURIComponent(briefId)}/open`;
}

/**
 * BusinessPulseWidget — Command Centre surface for the ARATAKI/business-pulse
 * Monday 07:00 NZT brief. Reads the latest row from `business_pulse_briefs`
 * for the signed-in org and renders the "three things that need you today"
 * summary, the cash flag, and a link through to the full Markdown brief on
 * Drive.
 *
 * Scaffold: the data fetch wires to /api/business-pulse/latest once that
 * route exists. Renders a placeholder until the ARATAKI/business-pulse
 * workflow lands and writes its first row.
 *
 * Spec: docs/handover/claude-for-small-business-2026-05-16.md Part 3.
 */

interface ThreeThing {
  source: 'cash' | 'settlements' | 'calendar' | 'pipeline' | 'inbox' | 'pilot_health';
  headline: string;
  recommended_action: string;
  staged_action: unknown | null;
}

interface PulseBrief {
  id: string;
  tenant_id: string;
  brief_date: string;
  drive_path: string | null;
  markdown: string;
  three_things: ThreeThing[];
  cash_position: { balance_nzd: number; forecast_14d_nzd: number; threshold_breach: boolean } | null;
  source_status: Record<string, 'ok' | 'skipped' | 'failed'>;
  tikanga_check_passed: boolean;
  privacy_check_passed: boolean;
  run_status: 'running' | 'completed' | 'skipped' | 'failed';
}

export function BusinessPulseWidget() {
  const [brief, setBrief] = useState<PulseBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/business-pulse/latest', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as PulseBrief | null;
        if (!cancelled) setBrief(data);
      } catch {
        // Endpoint not implemented yet — render the placeholder state.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-5">
        <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
          Business Pulse
        </p>
        <p className="mt-3 text-body-md text-[color:var(--text-secondary)]">Loading this week's brief…</p>
      </aside>
    );
  }

  if (!brief) {
    return (
      <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-5">
        <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
          Business Pulse
        </p>
        <h3 className="mt-3 font-display text-display-md font-light leading-tight">
          Your first brief lands Monday at 07:00.
        </h3>
        <p className="mt-3 text-body-md text-[color:var(--text-body)]">
          Connect Xero, Stripe, and Google Calendar to start. The brief synthesises the three
          things that need your attention each week.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
          Business Pulse · {brief.brief_date}
        </p>
        {(() => {
          const href = resolveBriefHref(brief.id, brief.drive_path);
          if (!href) return null;
          const external = /^https?:\/\//i.test(href);
          return (
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)]"
            >
              Full brief <ArrowRight className="h-3 w-3" aria-hidden />
            </a>
          );
        })()}
      </div>
      <h3 className="mt-3 font-display text-display-md font-light leading-tight">
        Three things that need you today.
      </h3>
      <ol className="mt-5 space-y-4">
        {brief.three_things.map((thing, index) => (
          <li key={`${thing.source}-${index}`} className="border-l-2 border-[color:var(--assembl-pounamu)] pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
              {thing.source}
            </p>
            <p className="mt-1 text-body-md text-[color:var(--text-primary)]">{thing.headline}</p>
            <p className="mt-1 text-body-md italic text-[color:var(--text-body)]">{thing.recommended_action}</p>
            {thing.staged_action != null && (
              <p className="mt-2 inline-flex rounded-full bg-[color:var(--assembl-paper)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)]">
                Action staged — review to send
              </p>
            )}
          </li>
        ))}
      </ol>
      {brief.cash_position?.threshold_breach && (
        <p className="mt-5 rounded-[6px] border border-[rgba(212,168,83,0.5)] bg-[rgba(212,168,83,0.08)] p-3 text-body-md text-[color:var(--text-primary)]">
          Cash forecast crosses your threshold within 14 days. Tap through to the full brief for the
          source breakdown.
        </p>
      )}
      {(!brief.tikanga_check_passed || !brief.privacy_check_passed) && (
        <p className="mt-3 text-xs text-[color:var(--text-secondary)]">
          Some sections were redacted by a compliance check. The full brief on Drive notes which.
        </p>
      )}
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Business Pulse dashboard widget.
//
// Reads the latest row from business_pulse_briefs for the operator's
// active tenant and renders the brief in three sections: the top three
// items, cash, and the week ahead. Read-only — recommended actions are
// drafts staged elsewhere (Gmail drafts, Drive, etc.); this widget
// links to those locations but does not send anything.
//
// Customer-facing copy. The word 'AI' is banned per plugins/CLAUDE.md
// canon §10.4. Use 'workflow', 'automation', 'business pulse'.

type ThreeThing = {
  source: 'xero' | 'stripe' | 'calendar' | 'hubspot' | 'pilot';
  thing: string;
  next_action: string;
  draft_location: string | null;
  action_staged: boolean;
};

type BusinessPulseBrief = {
  id: string;
  brief_date: string;
  timezone: string;
  drive_path: string | null;
  three_things: ThreeThing[];
  cash_position: Record<string, unknown> | null;
  weekly_commitments: Record<string, unknown> | null;
  tikanga_check_passed: boolean;
  privacy_check_passed: boolean;
  run_status: string;
  generated_at: string;
};

interface BusinessPulseWidgetProps {
  tenantId: string;
}

const SOURCE_LABEL: Record<ThreeThing['source'], string> = {
  xero: 'xero',
  stripe: 'stripe',
  calendar: 'calendar',
  hubspot: 'hubspot',
  pilot: 'pilot health',
};

export function BusinessPulseWidget({ tenantId }: BusinessPulseWidgetProps) {
  const [brief, setBrief] = useState<BusinessPulseBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('business_pulse_briefs')
        .select(
          'id, brief_date, timezone, drive_path, three_things, cash_position, weekly_commitments, tikanga_check_passed, privacy_check_passed, run_status, generated_at',
        )
        .eq('tenant_id', tenantId)
        .order('brief_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (dbError) {
        setError(dbError.message);
        setBrief(null);
      } else {
        setBrief(data as BusinessPulseBrief | null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (loading) {
    return (
      <section className="rounded-[2px] border border-[color:var(--assembl-line)] bg-white p-6 text-sm">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal)]">
          business pulse
        </p>
        <p className="mt-2 text-[color:var(--assembl-charcoal-60)]">loading the latest brief…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[2px] border border-[color:var(--assembl-line)] bg-white p-6 text-sm">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal)]">
          business pulse
        </p>
        <p className="mt-2 text-red-700">brief could not be loaded: {error}</p>
      </section>
    );
  }

  if (!brief) {
    return (
      <section className="rounded-[2px] border border-[color:var(--assembl-line)] bg-white p-6 text-sm">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal)]">
          business pulse
        </p>
        <p className="mt-2 text-[color:var(--assembl-charcoal-60)]">
          no brief yet. The first brief lands Monday at 07:00 in your timezone, or run one on demand from the
          assembl chat: <span className="font-mono">run my business pulse now</span>.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2px] border border-[color:var(--assembl-line)] bg-white p-6 text-sm">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal)]">
            business pulse
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--assembl-charcoal-60)]">
            {brief.brief_date} · {brief.timezone}
          </p>
        </div>
        <ComplianceChips
          tikanga={brief.tikanga_check_passed}
          privacy={brief.privacy_check_passed}
        />
      </header>

      <div className="mt-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal)]">
          three things that need you
        </h3>
        {brief.three_things.length === 0 ? (
          <p className="mt-3 text-[color:var(--assembl-charcoal-60)]">
            nothing urgent surfaced this week.
          </p>
        ) : (
          <ol className="mt-3 space-y-3">
            {brief.three_things.map((item, idx) => (
              <li key={idx} className="rounded-[2px] border border-[color:var(--assembl-line-soft)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--assembl-charcoal-60)]">
                  {SOURCE_LABEL[item.source]}
                </p>
                <p className="mt-1 text-[color:var(--assembl-charcoal)]">{item.thing}</p>
                <p className="mt-2 text-[color:var(--assembl-charcoal-60)]">
                  next: {item.next_action}
                </p>
                {item.action_staged && item.draft_location ? (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal-60)]">
                    draft staged · {item.draft_location}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>

      {brief.drive_path ? (
        <footer className="mt-6 border-t border-[color:var(--assembl-line-soft)] pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--assembl-charcoal-60)]">
            full brief · {brief.drive_path}
          </p>
        </footer>
      ) : null}
    </section>
  );
}

function ComplianceChips({ tikanga, privacy }: { tikanga: boolean; privacy: boolean }) {
  return (
    <div className="flex gap-1.5">
      <Chip label="tikanga" pass={tikanga} />
      <Chip label="privacy act" pass={privacy} />
    </div>
  );
}

function Chip({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span
      className={[
        'rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]',
        pass
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800',
      ].join(' ')}
    >
      {label} · {pass ? 'ok' : 'review'}
    </span>
  );
}

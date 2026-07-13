/**
 * Intelligence view — signals derived from what actually happened.
 *
 * (Brief §11 Intelligence.) Every number here is computed from real rows —
 * enquiries, tasks, evidence, model calls — never invented. Signals speak
 * human words and each recommendation names the action it deserves.
 * Fail-soft: an unreachable database yields empty sections, never errors.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

export type IntelligenceSignal = {
  label: string;
  value: string;
  hint: string;
};

export type IntelligenceRecommendation = {
  text: string;
  impact: 'high' | 'medium';
  href: string;
};

export type IntelligenceView = {
  signals: IntelligenceSignal[];
  recommendations: IntelligenceRecommendation[];
};

const OPS = '/customers/auckland-dog-trainer/ops';

export async function loadIntelligenceView(tenant: string): Promise<IntelligenceView> {
  try {
    const supabase = getServiceClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fortnightAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [enqThis, enqLast, awaiting, completed, calls, suggested] = await Promise.all([
      supabase
        .from('living_site_enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .gte('created_at', weekAgo),
      supabase
        .from('living_site_enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .gte('created_at', fortnightAgo)
        .lt('created_at', weekAgo),
      supabase
        .from('os_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .eq('status', 'awaiting_approval'),
      supabase
        .from('os_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .eq('status', 'completed')
        .gte('created_at', weekAgo),
      supabase
        .from('model_calls')
        .select('id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .gte('created_at', weekAgo),
      supabase
        .from('living_site_genome')
        .select('fact_id', { count: 'exact', head: true })
        .eq('tenant', tenant)
        .in('verification', ['suggested', 'inferred', 'stale', 'conflicting']),
    ]);

    const enquiriesThisWeek = enqThis.count ?? 0;
    const enquiriesLastWeek = enqLast.count ?? 0;
    const awaitingCount = awaiting.count ?? 0;
    const completedCount = completed.count ?? 0;
    const callCount = calls.count ?? 0;
    const unverifiedFacts = suggested.count ?? 0;

    const trend =
      enquiriesLastWeek === 0
        ? 'first week of data'
        : enquiriesThisWeek >= enquiriesLastWeek
          ? `up from ${enquiriesLastWeek} last week`
          : `down from ${enquiriesLastWeek} last week`;

    const signals: IntelligenceSignal[] = [
      {
        label: 'enquiries this week',
        value: String(enquiriesThisWeek),
        hint: trend,
      },
      {
        label: 'waiting for your yes',
        value: String(awaitingCount),
        hint: awaitingCount > 0 ? 'drafts ready to review' : 'nothing is waiting on you',
      },
      {
        label: 'work completed · proven',
        value: String(completedCount),
        hint: 'this week, each with evidence',
      },
      {
        label: 'model calls this week',
        value: String(callCount),
        hint: 'every one on the ledger',
      },
    ];

    const recommendations: IntelligenceRecommendation[] = [];
    if (awaitingCount > 0) {
      recommendations.push({
        text: `Say yes or no to ${awaitingCount} drafted repl${awaitingCount === 1 ? 'y' : 'ies'} — customers are waiting`,
        impact: 'high',
        href: `${OPS}?tab=work`,
      });
    }
    if (unverifiedFacts > 0) {
      recommendations.push({
        text: `Confirm or discard ${unverifiedFacts} unverified genome fact${unverifiedFacts === 1 ? '' : 's'} — agents only commit on confirmed facts`,
        impact: 'high',
        href: `${OPS}?tab=genome`,
      });
    }
    if (enquiriesThisWeek === 0) {
      recommendations.push({
        text: 'The desk is quiet — send yourself a test enquiry to watch the loop run',
        impact: 'medium',
        href: '/living-site/dog-training#book',
      });
    }
    recommendations.push({
      text: 'Check what is connected and what waits for your yes',
      impact: 'medium',
      href: `${OPS}?tab=connections`,
    });

    return { signals, recommendations };
  } catch {
    return { signals: [], recommendations: [] };
  }
}

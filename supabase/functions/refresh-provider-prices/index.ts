// refresh-provider-prices — Assembl Bills live pricing scraper.
//
// Scheduled (pg_cron → pg_net POST) Supabase Edge Function. For each configured
// NZ provider plans page it:
//   1. checks robots.txt and skips disallowed pages (good citizen),
//   2. fetches the page with an honest User-Agent, rate-limited 1 req/domain/sec,
//   3. asks Claude to extract structured plans (JSON), and
//   4. upserts each plan into public.assembl_bills_provider_prices, refreshing
//      source_last_verified_at + raw_scrape (audit trail).
// A plan seen before but missing now is marked status='discontinued' (kept, not
// deleted). A >15% price jump vs last scrape, or a 404, // a draft into content_approvals (/admin/approvals) for Kate to review.
//
// Nothing is dispatched — this only refreshes READ data. ACTION_DISPATCH stays off.
//
// Deploy:  supabase functions deploy refresh-provider-prices
// Secrets: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto).
// Schedule: see migration 20260718094000_provider_prices_cron.sql

import { createClient } from 'jsr:@supabase/supabase-js@2';

const UA = 'Assembl-Bills-PriceMonitor/1.0 (+assembl@assembl.co.nz)';
const MODEL = 'claude-sonnet-4-6';
const JUMP_THRESHOLD = 0.15; // 15%

type Source = { category: string; provider: string; url: string; trust: 'A' | 'B' | 'C' };

// The scrape targets. Weekly cadence for these categories (fuel/council run on
// their own schedules — add here as those categories are wired).
const SOURCES: Source[] = [
  { category: 'electricity', provider: 'Electric Kiwi', url: 'https://www.electrickiwi.co.nz/plans', trust: 'A' },
  { category: 'electricity', provider: 'Mercury Energy', url: 'https://www.mercury.co.nz/personal/plans', trust: 'A' },
  { category: 'electricity', provider: 'Contact Energy', url: 'https://contact.co.nz/residential/plans', trust: 'A' },
  { category: 'electricity', provider: 'Genesis Energy', url: 'https://www.genesisenergy.co.nz/residential/plans', trust: 'A' },
  { category: 'electricity', provider: 'Meridian Energy', url: 'https://www.meridianenergy.co.nz/personal/plans', trust: 'A' },
  { category: 'electricity', provider: 'Frank Energy', url: 'https://www.frankenergy.co.nz/plans', trust: 'A' },
  { category: 'electricity', provider: 'Nova Energy', url: 'https://www.novaenergy.co.nz/residential/plans', trust: 'A' },
  { category: 'broadband', provider: '2degrees', url: 'https://www.2degrees.nz/broadband/plans', trust: 'A' },
  { category: 'broadband', provider: 'Spark', url: 'https://www.spark.co.nz/shop/broadband/plans', trust: 'A' },
  { category: 'broadband', provider: 'One NZ', url: 'https://one.nz/broadband/plans', trust: 'A' },
  { category: 'broadband', provider: 'MyRepublic', url: 'https://www.myrepublic.co.nz/nz/broadband', trust: 'A' },
  { category: 'streaming', provider: 'Netflix', url: 'https://www.netflix.com/nz/', trust: 'A' },
  { category: 'streaming', provider: 'Disney+', url: 'https://www.disneyplus.com/en-nz', trust: 'A' },
  { category: 'subscription', provider: 'Spotify', url: 'https://www.spotify.com/nz/premium/', trust: 'A' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hostOf = (u: string) => new URL(u).host;

async function robotsAllows(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const res = await fetch(`${u.origin}/robots.txt`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return true; // no robots.txt → allowed
    const txt = await res.text();
    // Minimal parse: honour a global Disallow that covers our path.
    const lines = txt.split('\n').map((l) => l.trim());
    let applies = false;
    for (const line of lines) {
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey.toLowerCase();
      const val = rest.join(':').trim();
      if (key === 'user-agent') applies = val === '*';
      else if (applies && key === 'disallow' && val && u.pathname.startsWith(val)) return false;
    }
    return true;
  } catch {
    return true;
  }
}

async function extractPlans(html: string, src: Source): Promise<Record<string, unknown>[]> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return [];
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 24000);
  const prompt = `Extract every residential ${src.category} plan currently offered by ${src.provider} from this page text. Return ONLY a JSON array; each item: {"plan_name":string,"monthly_cost_nzd":number|null,"key_features":string[]}. Only currently-offered plans; ignore expired/promo offers older than 30 days. If none found, return [].\n\nPAGE:\n${text}`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const out = (data.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('').trim();
    const jsonStr = out.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const arr = JSON.parse(jsonStr);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = new Date().toISOString();
  const summary = { scraped: 0, upserted: 0, skipped: 0, alerts: 0, errors: [] as string[] };
  const lastHitByHost = new Map<string, number>();

  for (const src of SOURCES) {
    try {
      // Rate limit: 1 request per domain per second.
      const host = hostOf(src.url);
      const last = lastHitByHost.get(host) ?? 0;
      const wait = 1000 - (Date.now() - last);
      if (wait > 0) await sleep(wait);
      lastHitByHost.set(host, Date.now());

      if (!(await robotsAllows(src.url))) {
        summary.skipped++;
        continue;
      }

      const res = await fetch(src.url, { headers: { 'User-Agent': UA } });
      if (res.status === 404) {
        summary.alerts++;
        await supabase.from('content_approvals').insert({
          surface: 'assembl-bills:price-scrape',
          kind: 'scrape-alert',
          tenant_slug: 'assembl-bills',
          created_by: 'refresh-provider-prices',
          title: `Price page 404 — ${src.provider}`,
          summary: `${src.url} returned 404. Its prices may be stale; review the source URL.`,
          status: 'pending',
          payload: { provider: src.provider, url: src.url, http: 404 },
        });
        continue;
      }
      if (!res.ok) {
        summary.errors.push(`${src.provider}: HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();
      const plans = await extractPlans(html, src);
      summary.scraped++;

      const seenPlanNames: string[] = [];
      for (const plan of plans) {
        const planName = String(plan.plan_name ?? '').trim();
        if (!planName) continue;
        seenPlanNames.push(planName);
        const monthly = typeof plan.monthly_cost_nzd === 'number' ? plan.monthly_cost_nzd : null;

        // Price-jump guard: compare to the last stored value.
        const { data: prev } = await supabase
          .from('assembl_bills_provider_prices')
          .select('monthly_cost_nzd')
          .eq('provider', src.provider)
          .eq('plan_name', planName)
          .maybeSingle();
        const prevCost = prev?.monthly_cost_nzd as number | undefined;
        if (prevCost && monthly && Math.abs(monthly - prevCost) / prevCost > JUMP_THRESHOLD) {
          summary.alerts++;
          await supabase.from('content_approvals').insert({
          surface: 'assembl-bills:price-scrape',
          kind: 'scrape-alert',
          tenant_slug: 'assembl-bills',
          created_by: 'refresh-provider-prices',
            title: `Big price move — ${src.provider} ${planName}`,
            summary: `${planName} moved from $${prevCost} to $${monthly} (>${JUMP_THRESHOLD * 100}%). Review before it propagates.`,
            status: 'pending',
            payload: { provider: src.provider, plan: planName, from: prevCost, to: monthly },
          });
        }

        await supabase.from('assembl_bills_provider_prices').upsert(
          {
            category: src.category,
            provider: src.provider,
            plan_name: planName,
            monthly_cost_nzd: monthly,
            key_features: Array.isArray(plan.key_features) ? plan.key_features : [],
            source_url: src.url,
            source_last_verified_at: now,
            trust_tier: src.trust,
            status: 'active',
            raw_scrape: plan,
            updated_at: now,
          },
          { onConflict: 'provider,plan_name' },
        );
        summary.upserted++;
      }

      // Mark previously-active plans from this provider that vanished as discontinued.
      if (seenPlanNames.length > 0) {
        await supabase
          .from('assembl_bills_provider_prices')
          .update({ status: 'discontinued', updated_at: now })
          .eq('provider', src.provider)
          .eq('status', 'active')
          .not('plan_name', 'in', `(${seenPlanNames.map((n) => `"${n.replace(/"/g, '')}"`).join(',')})`);
      }
    } catch (err) {
      summary.errors.push(`${src.provider}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, ran_at: now, ...summary }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import {
  agentBySlug,
  groupedAgentsByPhase,
  PHASE_LABELS,
  type Agent,
} from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const metadata: Metadata = {
  title: 'Fleet',
  description: 'Tenant agent fleet grouped by work phase.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
};

type AccessRow = {
  agent_code: string;
  pack_id: string;
  is_enabled: boolean | null;
};

type PromptRow = {
  agent_name: string;
  system_prompt: string | null;
  is_draft?: boolean | null;
  is_active?: boolean | null;
};

type AuditRow = {
  agent_code: string;
};

export default async function TenantFleetPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const redirectTo = `/app/${slug}/fleet`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug,plan')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();

  const [memberResult, adminResult] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', (tenant as Tenant).id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle(),
  ]);

  if (!memberResult.data && !adminResult.data) {
    redirect('/app');
  }

  const { data: accessRows } = await service
    .from('agent_access')
    .select('agent_code,pack_id,is_enabled')
    .eq('tenant_id', (tenant as Tenant).id)
    .eq('is_enabled', true);

  const enabledAccess = ((accessRows ?? []) as AccessRow[]).filter((row) =>
    Boolean(agentBySlug(row.agent_code.toLowerCase())),
  );
  const agents = enabledAccess
    .map((row) => agentBySlug(row.agent_code.toLowerCase()))
    .filter(Boolean) as Agent[];
  const uniqueAgents = Array.from(new Map(agents.map((agent) => [agent.slug, agent])).values());
  const promptRows = await loadPromptRows(uniqueAgents.map((agent) => agent.slug));
  const activityCounts = await loadActivityCounts((tenant as Tenant).id);
  const accessByAgent = new Map(enabledAccess.map((row) => [row.agent_code.toLowerCase(), row]));
  const grouped = groupedAgentsByPhase(uniqueAgents);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/app"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              assembl / {(tenant as Tenant).slug}
            </Link>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.92]">
              {(tenant as Tenant).name} fleet.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
              Your active specialists, grouped by the work phase they support.
              Each agent is routed through human review and closes work with an
              evidence trail.
            </p>
          </div>
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 px-4 py-3 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Active agents
            </p>
            <p className="mt-1 font-display text-4xl font-light leading-none">
              {uniqueAgents.length}
            </p>
          </div>
        </header>

        {uniqueAgents.length === 0 ? (
          <section className="mt-10 rounded-[8px] border border-dashed border-[rgba(35,33,31,0.18)] bg-white/60 p-6">
            <p className="font-display text-2xl font-light">No fleet is active yet.</p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Ask an admin to activate a kete for this tenant after purchase.
            </p>
          </section>
        ) : (
          <div className="mt-10 space-y-9">
            {grouped.map((group) => (
              <section key={group.phase}>
                <div className="mb-3 flex items-center gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    {PHASE_LABELS[group.phase]}
                  </p>
                  <div className="h-px flex-1 bg-[rgba(35,33,31,0.10)]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.agents.map((agent) => {
                    const prompt = promptRows.get(agent.slug);
                    const access = accessByAgent.get(agent.slug);
                    return (
                      <AgentFleetCard
                        key={`${group.phase}-${agent.slug}`}
                        agent={agent}
                        packId={access?.pack_id ?? agent.kete}
                        description={descriptionFor(agent, prompt)}
                        activityCount={activityCounts.get(agent.slug) ?? 0}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AgentFleetCard({
  agent,
  packId,
  description,
  activityCount,
}: {
  agent: Agent;
  packId: string;
  description: string;
  activityCount: number;
}) {
  return (
    <Link
      href={`/app/chat/${agent.slug}?kete=${encodeURIComponent(packId)}`}
      className="group flex min-h-[210px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/65 p-5 shadow-[0_10px_32px_rgba(35,33,31,0.05)] transition-colors hover:bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-light leading-none">{agent.name}</h2>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            {agent.role}
          </p>
        </div>
        <span
          className="rounded-full border border-[rgba(43,107,87,0.25)] bg-[rgba(43,107,87,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]"
        >
          Live
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[color:var(--text-body)]">
        {description}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-[rgba(35,33,31,0.08)] pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          {activityCount} recent {activityCount === 1 ? 'activity' : 'activities'}
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
          Open chat
          <MessageCircle className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

async function loadPromptRows(agentSlugs: string[]) {
  const map = new Map<string, PromptRow>();
  if (agentSlugs.length === 0) return map;

  const service = getServiceClient();
  const { data } = await service
    .from('agent_prompts')
    .select('agent_name,system_prompt,is_draft,is_active')
    .in('agent_name', agentSlugs);

  for (const row of (data ?? []) as PromptRow[]) {
    map.set(row.agent_name, row);
  }

  return map;
}

async function loadActivityCounts(tenantId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const service = getServiceClient();
  const { data } = await service
    .from('audit_log')
    .select('agent_code')
    .eq('tenant_id', tenantId)
    .gte('created_at', since);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as AuditRow[]) {
    const slug = row.agent_code.toLowerCase();
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

function descriptionFor(agent: Agent, prompt?: PromptRow): string {
  if (!prompt?.system_prompt || prompt.system_prompt === 'DRAFT — content pending') {
    return agent.oneLiner;
  }

  const firstLine = prompt.system_prompt
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? truncate(firstLine, 150) : agent.oneLiner;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

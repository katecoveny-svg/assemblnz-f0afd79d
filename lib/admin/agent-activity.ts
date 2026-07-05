import 'server-only';

import { count, rows } from '@/lib/admin/data';
import { MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import { TENANTS } from '@/lib/customers/tenants';
import { countPendingActions } from '@/lib/agents/action-requests';

/**
 * Agent Activity — the operator command centre's data layer.
 *
 * One place that answers "what is every agent doing, and where are all the
 * demos". Everything is derived from the mana_receipts ledger (chats +
 * actions both land there), the action-request queue, and the tenant +
 * invite registries. Defensive like the rest of the admin data layer: a
 * missing table resolves to a safe empty, never a throw.
 */

const RECEIPT_WINDOW = 3000;

export type AgentActivityRow = {
  slug: string;
  name: string;
  status: string;
  bundle: string | null;
  recentChats: number;
  recentActions: number;
  lastActiveAt: string | null;
};

export type ActivityFeedRow = {
  id: string;
  agent: string | null;
  issuer: string | null;
  stage: string | null;
  at: string | null;
};

export type DemoLaunch = {
  slug: string;
  displayName: string;
  status: string;
  opsHref: string;
  shortHref: string;
  activeInvites: number;
};

export type ActivityOverview = {
  available: boolean;
  window: number;
  agentsLive: number;
  agentsTotal: number;
  totalReceipts: number | null;
  pendingActions: number;
  agents: AgentActivityRow[];
  feed: ActivityFeedRow[];
  demos: DemoLaunch[];
};

export async function getAgentActivity(): Promise<ActivityOverview> {
  const agentsLive = MARKETPLACE_AGENTS.filter((a) => a.status === 'live').length;
  const agentsTotal = MARKETPLACE_AGENTS.length;

  const demos = await demoLaunchpad();

  const totalReceipts = await count('mana_receipts');
  if (totalReceipts === null) {
    // Ledger not present in this environment — still show the roster + demos.
    return {
      available: false,
      window: 0,
      agentsLive,
      agentsTotal,
      totalReceipts: null,
      pendingActions: 0,
      agents: MARKETPLACE_AGENTS.map((a) => ({
        slug: a.slug,
        name: a.name,
        status: a.status,
        bundle: a.bundle ?? null,
        recentChats: 0,
        recentActions: 0,
        lastActiveAt: null,
      })),
      feed: [],
      demos,
    };
  }

  const receipts = await rows<{
    id: string | number;
    agent: string | null;
    issuer: string | null;
    hitl: { status?: string | null } | null;
    created_at: string | null;
  }>('mana_receipts', (q) =>
    q.order('created_at', { ascending: false }).limit(RECEIPT_WINDOW),
  );

  const perAgent = new Map<string, { chats: number; actions: number; last: string | null }>();
  for (const r of receipts) {
    if (!r.agent) continue;
    const m = perAgent.get(r.agent) ?? { chats: 0, actions: 0, last: null };
    if (r.issuer === 'action-path') m.actions += 1;
    else m.chats += 1;
    if (r.created_at && (!m.last || r.created_at > m.last)) m.last = r.created_at;
    perAgent.set(r.agent, m);
  }

  const agents: AgentActivityRow[] = MARKETPLACE_AGENTS.map((a) => {
    const m = perAgent.get(a.slug);
    return {
      slug: a.slug,
      name: a.name,
      status: a.status,
      bundle: a.bundle ?? null,
      recentChats: m?.chats ?? 0,
      recentActions: m?.actions ?? 0,
      lastActiveAt: m?.last ?? null,
    };
  }).sort((x, y) => {
    const byTime = (y.lastActiveAt ?? '').localeCompare(x.lastActiveAt ?? '');
    if (byTime !== 0) return byTime;
    return y.recentChats + y.recentActions - (x.recentChats + x.recentActions);
  });

  const feed: ActivityFeedRow[] = receipts.slice(0, 40).map((r) => ({
    id: String(r.id),
    agent: r.agent ?? null,
    issuer: r.issuer ?? null,
    stage: r.hitl?.status ?? null,
    at: r.created_at ?? null,
  }));

  const pendingActions = await countPendingActions();

  return {
    available: true,
    window: receipts.length,
    agentsLive,
    agentsTotal,
    totalReceipts,
    pendingActions,
    agents,
    feed,
    demos,
  };
}

/** Every pilot workspace + how many magic links are live for it. */
async function demoLaunchpad(): Promise<DemoLaunch[]> {
  const inviteRows = await rows<{ demo: string | null; revoked_at: string | null }>(
    'demo_invites',
    (q) => q.select('demo,revoked_at').is('revoked_at', null).limit(1000),
  ).catch(() => [] as Array<{ demo: string | null }>);

  const invitesByDemo = new Map<string, number>();
  for (const r of inviteRows) {
    if (!r.demo) continue;
    invitesByDemo.set(r.demo, (invitesByDemo.get(r.demo) ?? 0) + 1);
  }

  return TENANTS.map((t) => ({
    slug: t.slug,
    displayName: t.displayName,
    status: t.status,
    opsHref: `/customers/${t.slug}/ops`,
    shortHref: `/${t.slug}`,
    activeInvites: invitesByDemo.get(t.slug) ?? 0,
  }));
}

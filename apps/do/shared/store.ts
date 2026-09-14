/**
 * Local persistence for DO agents (DEMO v0).
 * JSON file under apps/do/data/ when writable; in-memory fallback otherwise
 * (e.g. read-only serverless). Not durable across cold starts on Vercel —
 * that is an honest DEMO limitation.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AgentSpec, AgentStatus, PendingApproval } from './types';
import { detectConsequentialVerb, requiresHumanApproval } from './policy';
import { buildMajorApproval, needsMajorChain } from './approval-chain';
import { diffSnapshots, getWatchFixture, snapshotFromText } from './watch';
import { evidenceFromSnapshots, evidenceFromSources } from './evidence';
import { stubAstraProvider } from './router';

const DATA_DIR = path.join(process.cwd(), 'apps/do/data');
const DATA_FILE = path.join(DATA_DIR, 'agents.json');

type StoreShape = { agents: AgentSpec[] };

const memory: StoreShape = { agents: [] };
let fileOk: boolean | null = null;

async function tryLoadFile(): Promise<StoreShape | null> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || !Array.isArray(parsed.agents)) return { agents: [] };
    return parsed;
  } catch {
    return null;
  }
}

async function persist(data: StoreShape): Promise<void> {
  memory.agents = data.agents;
  if (fileOk === false) return;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    fileOk = true;
  } catch {
    fileOk = false;
  }
}

async function load(): Promise<StoreShape> {
  if (fileOk === false) return memory;
  const fromFile = await tryLoadFile();
  if (fromFile) {
    memory.agents = fromFile.agents;
    fileOk = true;
    return fromFile;
  }
  return memory;
}

export async function listAgents(): Promise<AgentSpec[]> {
  const data = await load();
  return [...data.agents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAgent(id: string): Promise<AgentSpec | null> {
  const data = await load();
  return data.agents.find((a) => a.id === id) ?? null;
}

export async function saveAgent(spec: AgentSpec): Promise<AgentSpec> {
  const data = await load();
  const idx = data.agents.findIndex((a) => a.id === spec.id);
  const next = { ...spec, updatedAt: new Date().toISOString() };
  if (idx >= 0) data.agents[idx] = next;
  else data.agents.unshift(next);
  await persist(data);
  return next;
}

export async function deleteAgent(id: string): Promise<boolean> {
  const data = await load();
  const before = data.agents.length;
  data.agents = data.agents.filter((a) => a.id !== id);
  if (data.agents.length === before) return false;
  await persist(data);
  return true;
}

/**
 * Activate an agent: moves to working, and if the brief implies a
 * consequential follow-up, parks an approval under needs_you.
 */
export async function activateAgent(id: string): Promise<AgentSpec | null> {
  const agent = await getAgent(id);
  if (!agent) return null;

  const pending: PendingApproval[] = [...agent.pendingApprovals];
  let status: AgentStatus = 'working';
  let lastNote = 'Working · watching / preparing within policy.';
  let watchSnapshots = agent.watchSnapshots ? [...agent.watchSnapshots] : [];

  if (agent.primitive === 'watch') {
    // Seed a baseline snapshot for fixture watches / page text.
    if (agent.watches.some((w) => w.includes('power-price') || w.includes('fixture:power-price'))) {
      const page = getWatchFixture('v1');
      const snap = snapshotFromText(page.key, page.body, { label: page.label, url: page.url });
      watchSnapshots = [snap];
      lastNote = `Working · baseline stored for ${page.label}. Tick to simulate a change.`;
    } else if (agent.page?.pageText || agent.page?.url) {
      const body = agent.page.pageText || agent.page.title || agent.page.url;
      const snap = snapshotFromText(agent.page.url || 'page', body, {
        label: agent.page.title || agent.page.url,
        url: agent.page.url,
      });
      watchSnapshots = [snap];
      lastNote = `Working · watching ${agent.watches[0] ?? 'the page'} for ${agent.looks_for[0] ?? 'changes'}.`;
    } else {
      lastNote = `Working · watching ${agent.watches[0] ?? 'the page'} for ${agent.looks_for[0] ?? 'changes'}.`;
    }
  } else if (agent.lane === 'astra') {
    const astra = await stubAstraProvider.run({
      brief: agent.brief,
      contextSummary: agent.watches.join(', '),
    });
    lastNote = astra.draft;
    if (agent.must_ask_before.length > 0) {
      status = 'needs_you';
      const action = agent.must_ask_before[0];
      pending.push(
        needsMajorChain(action)
          ? buildMajorApproval(action)
          : {
              id: randomUUID(),
              action,
              reason: `Ready for your yes before: ${action}`,
              policyHit: detectConsequentialVerb(action) ?? 'policy',
              createdAt: new Date().toISOString(),
            },
      );
    }
  } else if (agent.must_ask_before.length > 0) {
    status = 'needs_you';
    const action = agent.must_ask_before[0];
    pending.push(
      needsMajorChain(action)
        ? buildMajorApproval(action)
        : {
            id: randomUUID(),
            action,
            reason: `Ready for your yes before: ${action}`,
            policyHit: detectConsequentialVerb(action) ?? 'policy',
            createdAt: new Date().toISOString(),
          },
    );
    lastNote = 'Needs you · draft ready; consequential step waiting on approval.';
  }

  return saveAgent({
    ...agent,
    status,
    pendingApprovals: pending,
    lastNote,
    watchSnapshots,
  });
}

/**
 * Tick a watch agent — DEMO change detection.
 * Pass `simulateChange: true` to advance the power-price fixture to v2.
 */
export async function tickWatch(
  id: string,
  opts: { simulateChange?: boolean } = {},
): Promise<AgentSpec | null> {
  const agent = await getAgent(id);
  if (!agent || agent.primitive !== 'watch') return null;

  const previous = agent.watchSnapshots?.[agent.watchSnapshots.length - 1];
  let nextBody: string;
  let label: string;
  let url: string | undefined;
  let key: string;

  const isPower = agent.watches.some((w) => w.includes('power-price'));
  if (isPower) {
    const page = getWatchFixture(opts.simulateChange ? 'v2' : 'v1');
    nextBody = page.body;
    label = page.label;
    url = page.url;
    key = page.key;
  } else {
    nextBody = agent.page?.pageText || previous?.excerpt || agent.page?.title || '';
    if (opts.simulateChange) nextBody = `${nextBody} · CHANGED ${Date.now()}`;
    label = agent.page?.title || agent.name;
    url = agent.page?.url;
    key = url || agent.id;
  }

  const next = snapshotFromText(key, nextBody, { label, url });
  const { changed, note } = diffSnapshots(previous, next);
  const snapshots = [...(agent.watchSnapshots ?? []), next].slice(-8);

  if (!changed) {
    return saveAgent({
      ...agent,
      status: 'working',
      watchSnapshots: snapshots,
      lastNote: note,
    });
  }

  const evidence = evidenceFromSnapshots(
    agent.id,
    previous ? [previous, next] : [next],
    'Rate or copy changed between snapshots — review before acting.',
    note,
  );

  const pending: PendingApproval[] = [...agent.pendingApprovals];
  if (agent.must_ask_before[0]) {
    const action = agent.must_ask_before[0];
    pending.push({
      id: randomUUID(),
      action,
      reason: `Change detected · ${action}`,
      policyHit: detectConsequentialVerb(action) ?? 'policy',
      createdAt: new Date().toISOString(),
    });
  }

  return saveAgent({
    ...agent,
    status: 'needs_you',
    watchSnapshots: snapshots,
    pendingApprovals: pending,
    evidence,
    lastNote: `${note} · moved to Needs you with Evidence.`,
  });
}

export async function approvePending(
  agentId: string,
  approvalId: string,
  decision: 'approve' | 'reject',
): Promise<AgentSpec | null> {
  const agent = await getAgent(agentId);
  if (!agent) return null;
  const item = agent.pendingApprovals.find((p) => p.id === approvalId);
  if (!item) return null;

  if (decision === 'approve' && requiresHumanApproval(item.action)) {
    // Recorded yes — still DEMO: we do not buy/book/send/etc.
  }

  const remaining = agent.pendingApprovals.filter((p) => p.id !== approvalId);
  const status: AgentStatus =
    decision === 'approve' && remaining.length === 0 ? 'done' : remaining.length ? 'needs_you' : 'working';

  let evidence = agent.evidence;
  if (decision === 'approve' && status === 'done' && !evidence) {
    evidence = evidenceFromSources(
      agent.id,
      [
        {
          kind: 'brief',
          label: agent.name,
          excerpt: agent.brief,
          capturedAt: new Date().toISOString(),
        },
        ...(agent.page
          ? [
              {
                kind: 'page' as const,
                label: agent.page.title || agent.page.url,
                url: agent.page.url,
                excerpt: (agent.page.pageText || agent.page.selectedText || '').slice(0, 200),
                capturedAt: new Date().toISOString(),
              },
            ]
          : []),
      ],
      `You approved “${item.action}”. DEMO — nothing was sent externally.`,
      `Outcome recorded for ${agent.name}.`,
    );
  }

  return saveAgent({
    ...agent,
    pendingApprovals: remaining,
    status,
    evidence,
    lastNote:
      decision === 'approve'
        ? `Done · you approved “${item.action}” (DEMO — nothing was sent externally).`
        : `Working · you declined “${item.action}”.`,
  });
}

export async function agentsByStatus(): Promise<Record<AgentStatus, AgentSpec[]>> {
  const all = await listAgents();
  return {
    needs_you: all.filter((a) => a.status === 'needs_you' || a.pendingApprovals.length > 0),
    working: all.filter((a) => a.status === 'working' && a.pendingApprovals.length === 0),
    done: all.filter((a) => a.status === 'done' && a.pendingApprovals.length === 0),
  };
}

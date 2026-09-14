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
  // First write attempt will set fileOk.
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
  // Demo behaviour: watchers start working; templates that prepare drafts
  // leave a review item under needs_you when must_ask_before is non-empty.
  let status: AgentStatus = 'working';
  let lastNote = 'Working · watching / preparing within policy.';

  if (agent.primitive === 'watch') {
    lastNote = `Working · watching ${agent.watches[0] ?? 'the page'} for ${agent.looks_for[0] ?? 'changes'}.`;
  } else if (agent.must_ask_before.length > 0) {
    status = 'needs_you';
    const action = agent.must_ask_before[0];
    const hit = detectConsequentialVerb(action) ?? 'policy';
    pending.push({
      id: randomUUID(),
      action,
      reason: `Ready for your yes before: ${action}`,
      policyHit: hit,
      createdAt: new Date().toISOString(),
    });
    lastNote = 'Needs you · draft ready; consequential step waiting on approval.';
  }

  return saveAgent({
    ...agent,
    status,
    pendingApprovals: pending,
    lastNote,
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

  // Even an "approve" in DEMO does not perform the consequential action —
  // we only record the decision and move the agent to done / working.
  if (decision === 'approve' && requiresHumanApproval(item.action)) {
    // Recorded yes — still DEMO: we do not buy/book/send/etc.
  }

  const remaining = agent.pendingApprovals.filter((p) => p.id !== approvalId);
  const status: AgentStatus =
    decision === 'approve' && remaining.length === 0 ? 'done' : remaining.length ? 'needs_you' : 'working';

  return saveAgent({
    ...agent,
    pendingApprovals: remaining,
    status,
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

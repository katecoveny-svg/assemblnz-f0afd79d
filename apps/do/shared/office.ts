import type { AgentSpec, AgentStatus } from './types';

/**
 * DO Office is a coordination view over the existing AgentSpec runtime.
 * It must not become a second agent model or a hidden agent-to-agent chat silo.
 */

export type DoOfficeSpaceKind = 'personal' | 'work' | 'client';
export type DoOfficePresence = AgentStatus | 'idle' | 'offline';
export type DoOfficeMailboxState = 'none' | 'proposed' | 'provisioned' | 'disabled';
export type DoOfficeMessageKind = 'handoff' | 'update' | 'question' | 'approval' | 'evidence';

export interface DoOfficeIdentity {
  id: string;
  /** Stable AgentSpec id when this identity represents an existing DO agent. */
  agentId?: string;
  name: string;
  role: string;
  space: DoOfficeSpaceKind;
  /** Only set after a mailbox has actually been provisioned. Never invent an address. */
  email?: string;
  emailState: DoOfficeMailboxState;
  initials?: string;
}

export interface DoOfficeMember {
  identity: DoOfficeIdentity;
  presence: DoOfficePresence;
  currentTask?: string;
  lastNote?: string;
  pendingApprovalCount: number;
  evidenceCount: number;
  updatedAt?: string;
}

/**
 * Structured internal coordination. This is deliberately not an unrestricted
 * hidden chat transcript: every handoff should point at a task/action/evidence need.
 */
export interface DoOfficeMessage {
  id: string;
  workspaceId: string;
  fromIdentityId: string;
  toIdentityId: string;
  kind: DoOfficeMessageKind;
  summary: string;
  taskId?: string;
  requestedAction?: string;
  evidenceRefs?: string[];
  createdAt: string;
  readAt?: string;
}

export interface DoOfficeWorkspace {
  id: string;
  name: string;
  kind: DoOfficeSpaceKind;
  memberIds: string[];
}

export interface DoOfficeSnapshot {
  workspaces: DoOfficeWorkspace[];
  members: DoOfficeMember[];
  inbox: DoOfficeMessage[];
  counts: {
    needsYou: number;
    working: number;
    done: number;
    unread: number;
  };
}

export function officeMemberFromAgent(
  agent: AgentSpec,
  options: Partial<Pick<DoOfficeIdentity, 'name' | 'role' | 'space' | 'email' | 'emailState' | 'initials'>> = {},
): DoOfficeMember {
  const identity: DoOfficeIdentity = {
    id: `agent:${agent.id}`,
    agentId: agent.id,
    name: options.name ?? agent.name,
    role: options.role ?? describeAgentRole(agent),
    space: options.space ?? 'personal',
    email: options.email,
    emailState: options.emailState ?? (options.email ? 'provisioned' : 'none'),
    initials: options.initials ?? initialsFor(agent.name),
  };

  return {
    identity,
    presence: agent.status,
    currentTask: agent.brief,
    lastNote: agent.lastNote,
    pendingApprovalCount: agent.pendingApprovals.length,
    evidenceCount: agent.evidence ? 1 : 0,
    updatedAt: agent.updatedAt,
  };
}

export function officeSnapshotFromAgents(
  agents: AgentSpec[],
  options: { workspaceId?: string; workspaceName?: string; kind?: DoOfficeSpaceKind } = {},
): DoOfficeSnapshot {
  const kind = options.kind ?? 'personal';
  const members = agents.map((agent) => officeMemberFromAgent(agent, { space: kind }));
  const workspaceId = options.workspaceId ?? `${kind}:default`;

  return {
    workspaces: [
      {
        id: workspaceId,
        name: options.workspaceName ?? (kind === 'personal' ? 'My DOs' : kind === 'work' ? 'Work DOs' : 'Client DOs'),
        kind,
        memberIds: members.map((member) => member.identity.id),
      },
    ],
    members,
    inbox: [],
    counts: {
      needsYou: agents.filter((agent) => agent.status === 'needs_you' || agent.pendingApprovals.length > 0).length,
      working: agents.filter((agent) => agent.status === 'working').length,
      done: agents.filter((agent) => agent.status === 'done').length,
      unread: 0,
    },
  };
}

function describeAgentRole(agent: AgentSpec): string {
  switch (agent.primitive) {
    case 'watch': return 'Watch + alert';
    case 'find': return 'Find + research';
    case 'extract': return 'Extract + organise';
    case 'prepare': return 'Prepare + draft';
    case 'compare': return 'Compare + recommend';
    default: return 'DO agent';
  }
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'DO';
}

/**
 * Central store for the studio. Zustand — no context provider needed, and
 * the store is a plain hook.
 *
 * The store is the single source of truth. Every surface (library,
 * properties panel, 3D scene, x-ray, activity view, top bar) reads from
 * and writes to this store. No component keeps its own copy of the agent.
 */

'use client';

import { create } from 'zustand';
import { KORO_AGENT } from './koro';
import {
  AgentConnection,
  AgentDefinition,
  findComponent,
  type AgentComponent,
  type ComponentType,
} from './schema';
import {
  REFUND_MESSAGE,
  TEST_STAGES,
  nextStage,
  stageIndex,
  type TestStageId,
} from './simulate';

export type ViewMode = 'build' | 'x-ray' | 'activity';
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface ActivityEntry {
  stage: TestStageId;
  label: string;
  detail: string;
  at: number;                        // ms since test start
  active: string[];                  // component IDs highlighted this step
}

export interface TestState {
  stage: TestStageId;
  approved: boolean | null;          // null = pending, true/false once acted
  activity: ActivityEntry[];
  startedAt: number | null;
  costEstimateUsd: number;
  durationMs: number;
  confidence: number;                // 0..1, updated per stage
}

const INITIAL_TEST: TestState = {
  stage: 'idle',
  approved: null,
  activity: [],
  startedAt: null,
  costEstimateUsd: 0,
  durationMs: 0,
  confidence: 0,
};

/** History snapshot for undo/redo. Only tracks the agent definition. */
interface HistorySnapshot {
  agent: AgentDefinition;
}

interface StudioStore {
  agent: AgentDefinition;
  selectedId: string;
  hoveredId: string | null;
  viewMode: ViewMode;
  reducedMotion: boolean;
  saveStatus: SaveStatus;
  panels: { library: boolean; properties: boolean; activity: boolean };
  test: TestState;

  // History
  history: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions — schema-safe.
  select: (id: string) => void;
  hover: (id: string | null) => void;
  setViewMode: (v: ViewMode) => void;
  setReducedMotion: (v: boolean) => void;
  togglePanel: (p: 'library' | 'properties' | 'activity') => void;

  updateInstructions: (patch: Partial<AgentDefinition['instructions']>) => void;
  updateIntelligence: (patch: Partial<AgentDefinition['intelligence']>) => void;
  updateMemory: (patch: Partial<AgentDefinition['memory']>) => void;
  updateIdentity: (patch: Partial<AgentDefinition['identity']>) => void;
  updateKnowledge: (id: string, patch: Partial<AgentDefinition['knowledge'][number]>) => void;
  updateAbility: (id: string, patch: Partial<AgentDefinition['abilities'][number]>) => void;
  updateConnector: (id: string, patch: Partial<AgentDefinition['connectors'][number]>) => void;
  updateBoundary: (id: string, patch: Partial<AgentDefinition['boundaries'][number]>) => void;
  updateApproval: (id: string, patch: Partial<AgentDefinition['approvals'][number]>) => void;
  updateEvaluation: (id: string, patch: Partial<AgentDefinition['evaluations'][number]>) => void;

  addComponent: (type: ComponentType) => void;
  removeComponent: (id: string) => void;
  connect: (edge: Omit<AgentConnection, 'id'>) => void;
  disconnect: (id: string) => void;

  // Test workflow
  runTest: () => void;
  approveSend: () => void;
  rejectSend: () => void;
  resetDemo: () => void;

  // Undo / redo
  undo: () => void;
  redo: () => void;
}

function push(prev: StudioStore, next: AgentDefinition): Partial<StudioStore> {
  return {
    agent: next,
    history: [...prev.history, { agent: prev.agent }].slice(-40),
    future: [],
    saveStatus: 'unsaved',
  };
}

let stageTimer: ReturnType<typeof setTimeout> | null = null;

export const useStudioStore = create<StudioStore>((set, get) => ({
  agent: KORO_AGENT,
  selectedId: 'instructions',
  hoveredId: null,
  viewMode: 'build',
  reducedMotion: false,
  saveStatus: 'saved',
  panels: { library: true, properties: true, activity: false },
  test: INITIAL_TEST,
  history: [],
  future: [],

  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  setViewMode: (v) => set({ viewMode: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  togglePanel: (p) => set((s) => ({ panels: { ...s.panels, [p]: !s.panels[p] } })),

  updateInstructions: (patch) => set((s) => push(s, { ...s.agent, instructions: { ...s.agent.instructions, ...patch } })),
  updateIntelligence: (patch) => set((s) => push(s, { ...s.agent, intelligence: { ...s.agent.intelligence, ...patch } })),
  updateMemory:       (patch) => set((s) => push(s, { ...s.agent, memory:       { ...s.agent.memory, ...patch } })),
  updateIdentity:     (patch) => set((s) => push(s, { ...s.agent, identity:     { ...s.agent.identity, ...patch } })),

  updateKnowledge: (id, patch) => set((s) => push(s, {
    ...s.agent,
    knowledge: s.agent.knowledge.map((k) => (k.id === id ? { ...k, ...patch } : k)),
  })),
  updateAbility: (id, patch) => set((s) => push(s, {
    ...s.agent,
    abilities: s.agent.abilities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  })),
  updateConnector: (id, patch) => set((s) => push(s, {
    ...s.agent,
    connectors: s.agent.connectors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  })),
  updateBoundary: (id, patch) => set((s) => push(s, {
    ...s.agent,
    boundaries: s.agent.boundaries.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  })),
  updateApproval: (id, patch) => set((s) => push(s, {
    ...s.agent,
    approvals: s.agent.approvals.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  })),
  updateEvaluation: (id, patch) => set((s) => push(s, {
    ...s.agent,
    evaluations: s.agent.evaluations.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  })),

  addComponent: (type) => {
    const id = `${type}-${Math.floor(performance.now() % 100000)}`;
    const s = get();
    // Minimal defaults per family; user can complete config in the panel.
    if (type.startsWith('knowledge-')) {
      const knowledgeType: 'file' | 'website' | 'drive-folder' | 'policy' =
        type === 'knowledge-website' ? 'website'
        : type === 'knowledge-drive' ? 'drive-folder'
        : type === 'knowledge-policy' ? 'policy'
        : 'file';
      set(push(s, {
        ...s.agent,
        knowledge: [...s.agent.knowledge, {
          id, type: knowledgeType, title: 'New knowledge source', description: '', items: 0, status: 'draft', lastIndexed: null,
        }],
      }));
      set({ selectedId: id });
      return;
    }
    if (type.startsWith('ability-')) {
      set(push(s, {
        ...s.agent,
        abilities: [...s.agent.abilities, {
          id, type, title: 'New ability', description: '', status: 'draft', connectorId: null, requiresApproval: false,
        }],
      }));
      set({ selectedId: id });
      return;
    }
    if (type.startsWith('connector-')) {
      set(push(s, {
        ...s.agent,
        connectors: [...s.agent.connectors, {
          id, type, provider: 'Provider TBC', scopes: [], status: 'draft', simulated: true,
        }],
      }));
      set({ selectedId: id });
      return;
    }
    if (type === 'boundary') {
      set(push(s, {
        ...s.agent,
        boundaries: [...s.agent.boundaries, {
          id, title: 'New boundary', description: '', rule: '', status: 'draft',
        }],
      }));
      set({ selectedId: id });
      return;
    }
    if (type === 'approval') {
      set(push(s, {
        ...s.agent,
        approvals: [...s.agent.approvals, {
          id, title: 'New approval', description: '', gatesAbilityId: s.agent.abilities[0]?.id ?? '', triggers: [], approver: 'owner', status: 'draft',
        }],
      }));
      set({ selectedId: id });
      return;
    }
    if (type === 'evaluation-tone' || type === 'evaluation-accuracy') {
      set(push(s, {
        ...s.agent,
        evaluations: [...s.agent.evaluations, {
          id, type, title: type === 'evaluation-tone' ? 'Tone check' : 'Accuracy check', description: '', passThreshold: 0.8, status: 'draft',
        }],
      }));
      set({ selectedId: id });
      return;
    }
    // essentials (instructions/intelligence/memory) are single-instance; ignore.
  },

  removeComponent: (id) => {
    const s = get();
    // Never remove essentials.
    if (id === 'identity' || id === 'instructions' || id === 'intelligence' || id === 'memory') return;
    const next: AgentDefinition = {
      ...s.agent,
      knowledge: s.agent.knowledge.filter((k) => k.id !== id),
      abilities: s.agent.abilities.filter((a) => a.id !== id),
      connectors: s.agent.connectors.filter((c) => c.id !== id),
      boundaries: s.agent.boundaries.filter((b) => b.id !== id),
      approvals: s.agent.approvals.filter((a) => a.id !== id),
      evaluations: s.agent.evaluations.filter((e) => e.id !== id),
      connections: s.agent.connections.filter((c) => c.sourceId !== id && c.targetId !== id),
    };
    set(push(s, next));
    if (s.selectedId === id) set({ selectedId: 'instructions' });
  },

  connect: (edge) => {
    const s = get();
    const id = `e-${Math.floor(performance.now() % 100000)}`;
    set(push(s, {
      ...s.agent,
      connections: [...s.agent.connections, { ...edge, id }],
    }));
  },

  disconnect: (id) => {
    const s = get();
    set(push(s, {
      ...s.agent,
      connections: s.agent.connections.filter((c) => c.id !== id),
    }));
  },

  runTest: () => {
    if (stageTimer) clearTimeout(stageTimer);
    set({
      test: {
        ...INITIAL_TEST,
        stage: 'idle',
        startedAt: Date.now(),
      },
      panels: { ...get().panels, activity: true },
    });
    // Kick off with the first real stage.
    const advance = (from: TestStageId) => {
      const next = nextStage(from);
      const spec = TEST_STAGES.find((x) => x.id === next);
      if (!spec) return;
      const now = Date.now();
      const startedAt = get().test.startedAt ?? now;
      set((s) => ({
        test: {
          ...s.test,
          stage: next,
          activity: [
            ...s.test.activity,
            { stage: next, label: spec.label, detail: spec.activity, at: now - startedAt, active: spec.active },
          ],
          confidence: Math.min(0.95, 0.5 + stageIndex(next) * 0.06),
          durationMs: now - startedAt,
          costEstimateUsd: Number(((now - startedAt) / 1000 * 0.006).toFixed(3)),
        },
      }));
      if (spec.autoAdvanceAfterMs !== null && next !== 'sent') {
        stageTimer = setTimeout(() => advance(next), spec.autoAdvanceAfterMs);
      }
    };
    stageTimer = setTimeout(() => advance('idle'), 300);
  },

  approveSend: () => {
    if (get().test.stage !== 'awaiting-approval') return;
    set((s) => ({ test: { ...s.test, approved: true } }));
    const advance = (from: TestStageId) => {
      const next = nextStage(from);
      const spec = TEST_STAGES.find((x) => x.id === next);
      if (!spec) return;
      const now = Date.now();
      const startedAt = get().test.startedAt ?? now;
      set((s) => ({
        test: {
          ...s.test,
          stage: next,
          activity: [
            ...s.test.activity,
            { stage: next, label: spec.label, detail: spec.activity, at: now - startedAt, active: spec.active },
          ],
          confidence: Math.min(0.98, 0.9 + stageIndex(next) * 0.01),
          durationMs: now - startedAt,
          costEstimateUsd: Number(((now - startedAt) / 1000 * 0.006).toFixed(3)),
        },
      }));
      if (spec.autoAdvanceAfterMs !== null && next !== 'sent') {
        stageTimer = setTimeout(() => advance(next), spec.autoAdvanceAfterMs);
      }
    };
    stageTimer = setTimeout(() => advance('awaiting-approval'), 400);
  },

  rejectSend: () => {
    if (stageTimer) clearTimeout(stageTimer);
    set((s) => ({
      test: {
        ...s.test,
        approved: false,
        activity: [
          ...s.test.activity,
          { stage: 'awaiting-approval', label: 'Rejected by owner', detail: 'Owner rejected the draft — send blocked.', at: Date.now() - (s.test.startedAt ?? Date.now()), active: ['ap-send'] },
        ],
      },
    }));
  },

  resetDemo: () => {
    if (stageTimer) clearTimeout(stageTimer);
    set({ test: INITIAL_TEST });
  },

  undo: () => {
    const s = get();
    const prev = s.history[s.history.length - 1];
    if (!prev) return;
    set({
      history: s.history.slice(0, -1),
      future: [{ agent: s.agent }, ...s.future],
      agent: prev.agent,
      saveStatus: 'unsaved',
    });
  },
  redo: () => {
    const s = get();
    const next = s.future[0];
    if (!next) return;
    set({
      history: [...s.history, { agent: s.agent }],
      future: s.future.slice(1),
      agent: next.agent,
      saveStatus: 'unsaved',
    });
  },
}));

// Convenience selector — MUST select the primitives (agent + selectedId)
// and derive the AgentComponent locally so React 19 doesn't complain about
// unstable snapshots. Zustand + React 19 rejects selectors that recompute a
// new object identity every render.
export function useSelectedComponent(): AgentComponent | undefined {
  const agent = useStudioStore((s) => s.agent);
  const selectedId = useStudioStore((s) => s.selectedId);
  return findComponent(agent, selectedId);
}

export const REFUND_TEST_INPUT = REFUND_MESSAGE;

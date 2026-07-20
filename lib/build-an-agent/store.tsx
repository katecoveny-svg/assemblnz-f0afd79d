'use client';

/**
 * Shared state for /build-an-agent — the 6 parts + placed positions + config.
 *
 * Kept as a light React context so BuilderScene (top of the page) and the
 * Configure + Ask sections (below the fold) can read and write the same
 * BuildConfig. No zustand — the shape stays small enough that a reducer
 * fits it fine.
 *
 * On mount the provider looks for a ?c=<base64> query param — a shared link
 * — and merges the decoded partial config into the initial state so the
 * receiver lands on the exact agent the sender built.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import type { BuildConfig, ModelTier, MemoryScope } from './config';
import { DEFAULT_CONFIG } from './config';
import { decodeConfig } from './share';

type PartPositions = Record<string, [number, number, number]>;

interface BuilderState {
  config: BuildConfig;
  parts: PartPositions;
  /** Which parts are magnetically docked to the intelligence core. */
  docked: Record<string, boolean>;
  /** True while the ask stream is in flight — the model-core mesh glows. */
  speaking: boolean;
}

type Action =
  | { type: 'setName'; value: string }
  | { type: 'setBusiness'; value: string }
  | { type: 'setModelTier'; value: ModelTier }
  | { type: 'setMemoryScope'; value: MemoryScope }
  | { type: 'toggleTool'; id: string }
  | { type: 'toggleKnowledge'; id: string }
  | { type: 'setVoice'; value: string }
  | { type: 'toggleGuardrail'; id: string }
  | { type: 'movePart'; id: string; position: [number, number, number] }
  | { type: 'setDocked'; id: string; value: boolean }
  | { type: 'setSpeaking'; value: boolean }
  | { type: 'hydrateConfig'; value: Partial<BuildConfig> };

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'setName':
      return { ...state, config: { ...state.config, name: action.value } };
    case 'setBusiness':
      return { ...state, config: { ...state.config, business: action.value } };
    case 'setModelTier':
      return { ...state, config: { ...state.config, modelTier: action.value } };
    case 'setMemoryScope':
      return { ...state, config: { ...state.config, memoryScope: action.value } };
    case 'toggleTool':
      return { ...state, config: { ...state.config, tools: toggle(state.config.tools, action.id) } };
    case 'toggleKnowledge':
      return { ...state, config: { ...state.config, knowledge: toggle(state.config.knowledge, action.id) } };
    case 'setVoice':
      return { ...state, config: { ...state.config, voice: action.value } };
    case 'toggleGuardrail':
      return {
        ...state,
        config: { ...state.config, guardrails: toggle(state.config.guardrails, action.id) },
      };
    case 'movePart':
      return { ...state, parts: { ...state.parts, [action.id]: action.position } };
    case 'setDocked':
      return { ...state, docked: { ...state.docked, [action.id]: action.value } };
    case 'setSpeaking':
      return { ...state, speaking: action.value };
    case 'hydrateConfig':
      return { ...state, config: { ...state.config, ...action.value } };
    default:
      return state;
  }
}

const INITIAL_PARTS: PartPositions = {
  model: [0, 0.6, 0],
  memory: [-2.4, 0.55, -0.4],
  tools: [2.4, 0.5, -0.4],
  knowledge: [-1.4, 0.55, 1.6],
  voice: [1.4, 0.55, 1.6],
  guardrails: [0, 0.5, 2.2],
};

interface Ctx {
  state: BuilderState;
  setName: (v: string) => void;
  setBusiness: (v: string) => void;
  setModelTier: (v: ModelTier) => void;
  setMemoryScope: (v: MemoryScope) => void;
  toggleTool: (id: string) => void;
  toggleKnowledge: (id: string) => void;
  setVoice: (v: string) => void;
  toggleGuardrail: (id: string) => void;
  movePart: (id: string, position: [number, number, number]) => void;
  setDocked: (id: string, value: boolean) => void;
  setSpeaking: (v: boolean) => void;
}

const BuilderContext = createContext<Ctx | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    config: DEFAULT_CONFIG,
    parts: INITIAL_PARTS,
    docked: {},
    speaking: false,
  });

  // Hydrate from ?c=<base64> on mount so a shared link lands on the exact
  // agent the sender built. Runs client-side only.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('c');
    if (!encoded) return;
    const decoded = decodeConfig(encoded);
    if (decoded) dispatch({ type: 'hydrateConfig', value: decoded });
  }, []);

  const setName          = useCallback((v: string)    => dispatch({ type: 'setName', value: v }), []);
  const setBusiness      = useCallback((v: string)    => dispatch({ type: 'setBusiness', value: v }), []);
  const setModelTier     = useCallback((v: ModelTier) => dispatch({ type: 'setModelTier', value: v }), []);
  const setMemoryScope   = useCallback((v: MemoryScope)=> dispatch({ type: 'setMemoryScope', value: v }), []);
  const toggleTool       = useCallback((id: string)   => dispatch({ type: 'toggleTool', id }), []);
  const toggleKnowledge  = useCallback((id: string)   => dispatch({ type: 'toggleKnowledge', id }), []);
  const setVoice         = useCallback((v: string)    => dispatch({ type: 'setVoice', value: v }), []);
  const toggleGuardrail  = useCallback((id: string)   => dispatch({ type: 'toggleGuardrail', id }), []);
  const movePart         = useCallback((id: string, position: [number, number, number]) =>
    dispatch({ type: 'movePart', id, position }), []);
  const setDocked        = useCallback((id: string, v: boolean) => dispatch({ type: 'setDocked', id, value: v }), []);
  const setSpeaking      = useCallback((v: boolean)   => dispatch({ type: 'setSpeaking', value: v }), []);

  const value = useMemo<Ctx>(
    () => ({ state, setName, setBusiness, setModelTier, setMemoryScope, toggleTool, toggleKnowledge, setVoice, toggleGuardrail, movePart, setDocked, setSpeaking }),
    [state, setName, setBusiness, setModelTier, setMemoryScope, toggleTool, toggleKnowledge, setVoice, toggleGuardrail, movePart, setDocked, setSpeaking],
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder(): Ctx {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder() must be used inside <BuilderProvider>');
  return ctx;
}

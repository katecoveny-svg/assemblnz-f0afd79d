import { create } from 'zustand';

/**
 * The one visual-state API for the Living Interface. The particle scene
 * reads this store every frame; page load drives dormant → gathering →
 * formed, and later phases (voice, dashboard events) call the same
 * setVisualState — they never touch the scene directly.
 */

export type AssemblVisualState =
  | 'dormant'
  | 'gathering'
  | 'formed'
  | 'listening'
  | 'thinking'
  | 'acting'
  | 'complete'
  | 'dispersing';

export type TargetForm = 'wing' | 'network' | 'agents';

type VisualStateStore = {
  state: AssemblVisualState;
  /** Which cached target form the particles hold. */
  form: TargetForm;
  /**
   * 1 = fully coherent. Error handling lowers this briefly (the sculpture
   * loses a little coherence — never red, never a shake) while the UI shows
   * accessible text. The scene eases it back toward 1 on its own.
   */
  coherence: number;
  setVisualState: (next: AssemblVisualState) => void;
  setForm: (next: TargetForm) => void;
  setCoherence: (next: number) => void;
};

export const useVisualState = create<VisualStateStore>((set) => ({
  state: 'dormant',
  form: 'wing',
  coherence: 1,
  setVisualState: (next) => set({ state: next }),
  setForm: (next) => set({ form: next }),
  setCoherence: (next) => set({ coherence: Math.min(1, Math.max(0, next)) }),
}));

/** Imperative helpers for non-React callers (agents, voice worker later). */
export function setVisualState(next: AssemblVisualState): void {
  useVisualState.getState().setVisualState(next);
}

export function setVisualForm(next: TargetForm): void {
  useVisualState.getState().setForm(next);
}

export function setVisualCoherence(next: number): void {
  useVisualState.getState().setCoherence(next);
}

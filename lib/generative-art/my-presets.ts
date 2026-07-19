/**
 * localStorage-backed "my presets" — Kate can save the current slider
 * state under a name, then bring it back in one click. Scoped per family
 * so the Line chip row shows Line saves only, etc.
 *
 * The store lives client-side; nothing hits the server.
 */

import type { FamilyId } from './families';
import type { BackgroundId } from './backgrounds';

export interface SavedPreset {
  id: string;                        // uuid-ish, generated at save time
  family: FamilyId;
  parentPresetId: string;            // which built-in preset the save was seeded from
  label: string;
  values: Record<string, number>;
  seed: number;
  background: BackgroundId | null;
  text: string;
  savedAt: string;                   // ISO timestamp
}

const STORAGE_KEY = 'assembl.creativePlayground.myPresets.v1';

function readAll(): SavedPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(next: SavedPreset[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / disabled — silent
  }
}

export function listSavedPresets(family: FamilyId): SavedPreset[] {
  return readAll()
    .filter((p) => p.family === family)
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export function savePreset(input: Omit<SavedPreset, 'id' | 'savedAt'>): SavedPreset {
  const all = readAll();
  const saved: SavedPreset = {
    ...input,
    id: `${input.family}-${input.parentPresetId}-${Math.random().toString(36).slice(2, 8)}-${Math.floor(performance.now() % 100000)}`,
    savedAt: new Date().toISOString(),
  };
  all.unshift(saved);
  writeAll(all.slice(0, 60)); // cap so localStorage doesn't grow forever
  return saved;
}

export function deleteSavedPreset(id: string): void {
  const all = readAll();
  writeAll(all.filter((p) => p.id !== id));
}

export function renameSavedPreset(id: string, label: string): void {
  const all = readAll();
  const next = all.map((p) => (p.id === id ? { ...p, label } : p));
  writeAll(next);
}

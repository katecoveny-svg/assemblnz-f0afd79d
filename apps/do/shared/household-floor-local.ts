/**
 * Device-local Household Floor persistence for the public share path.
 * Safe to import from client components.
 */

import type { HouseholdFloorInstance } from './household-floor';
import { applyDoPersonalisation, type DoPersonalisation } from './do-personalisation';

export const HOUSEHOLD_FLOOR_STORAGE_KEY = 'assembl-do-household-floor-v1';

export function readLocalHouseholdFloor(): HouseholdFloorInstance | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HOUSEHOLD_FLOOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HouseholdFloorInstance;
    if (!parsed?.id || !parsed?.templateId || !Array.isArray(parsed.seats)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalHouseholdFloor(floor: HouseholdFloorInstance): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HOUSEHOLD_FLOOR_STORAGE_KEY, JSON.stringify(floor));
}

export function clearLocalHouseholdFloor(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(HOUSEHOLD_FLOOR_STORAGE_KEY);
}

export function patchLocalPersonalisation(
  floor: HouseholdFloorInstance,
  patch: Partial<DoPersonalisation>,
): HouseholdFloorInstance {
  const next: HouseholdFloorInstance = {
    ...floor,
    personalisation: applyDoPersonalisation(patch, floor.personalisation),
    updatedAt: new Date().toISOString(),
  };
  writeLocalHouseholdFloor(next);
  return next;
}

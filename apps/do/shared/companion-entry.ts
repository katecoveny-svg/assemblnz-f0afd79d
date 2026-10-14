/** Entry navigation never starts capture, a provider request, or a voice session. */
export type CompanionEntry = 'write' | 'talk';
export type TalkEntryState = 'checking' | 'unavailable' | 'sign-in' | 'allowance' | 'ready' | 'unchecked';
export type TalkEntryReadiness = { state: TalkEntryState; canOpen: boolean; message: string };
export function talkEntryReadiness(value: unknown): TalkEntryReadiness {
  const no = (state: TalkEntryState, message: string): TalkEntryReadiness => ({ state, canOpen: false, message });
  if (value === null) return no('checking', 'Checking Talk availability…');
  if (!value || typeof value !== 'object') return no('unchecked', 'Talk availability could not be checked.');
  const status = value as Record<string, unknown>;
  if (typeof status.enabled !== 'boolean' || typeof status.configured !== 'boolean' || typeof status.signedIn !== 'boolean') return no('unchecked', 'Talk availability could not be checked.');
  if (!status.enabled || !status.configured) return no('unavailable', 'Live conversation with DO is not available here yet. Write still works.');
  if (!status.signedIn) return no('sign-in', 'Sign in in this workspace to use Talk.');
  if (typeof status.remaining !== 'number' || !Number.isFinite(status.remaining) || status.remaining < 0) return no('unchecked', 'Your Talk allowance could not be checked.');
  if (status.remaining === 0) return no('allowance', 'Today’s Talk allowance has been used. Write still works.');
  return { state: 'ready', canOpen: true, message: 'Talk is ready to open. Review microphone consent before starting.' };
}
export function isCompanionEntry(value: unknown): value is CompanionEntry { return value === 'write' || value === 'talk'; }

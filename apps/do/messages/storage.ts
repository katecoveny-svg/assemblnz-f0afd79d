import { parseWorkspace, serialiseWorkspace, type MessageWorkspace } from './model';
export const MESSAGE_STORAGE_KEY = 'assembl-do-messages-v1';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function saveMessages(w: MessageWorkspace, storage: Store) { storage.setItem(MESSAGE_STORAGE_KEY, serialiseWorkspace(w)); }
export function loadMessages(storage: Store): MessageWorkspace | null {
  const raw = storage.getItem(MESSAGE_STORAGE_KEY);
  return raw ? parseWorkspace(raw) : null;
}
export function forgetMessages(storage: Store) { storage.removeItem(MESSAGE_STORAGE_KEY); }

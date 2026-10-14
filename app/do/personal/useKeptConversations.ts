'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONVERSATION_NOTICE_VERSION, conversationRecordSchema, conversationTitle, type ConversationRecord, type ConversationTurn,
} from '@/apps/do/personal/conversation';

export type KeptStorage = 'loading' | 'none' | 'unavailable' | 'account';
export type ActiveConversation = { id: string; revision: number; turns: ConversationTurn[] };

/** Kept conversations for the signed-in owner. The server verifies identity on every call;
 * the workspace key it returns travels back as an expectation, never as authority. */
export function useKeptConversations() {
  const [storage, setStorage] = useState<KeptStorage>('loading');
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/do/personal/conversations', { cache: 'no-store' });
      const data = await response.json();
      if (!alive.current) return;
      setWorkspace(typeof data.workspaceKey === 'string' && data.workspaceKey !== 'guest' ? data.workspaceKey : null);
      if (response.status === 503 || data.storage === 'unavailable') { setStorage('unavailable'); setRecords([]); return; }
      if (data.storage === 'none') { setStorage('none'); setRecords([]); return; }
      setRecords(Array.isArray(data.records) ? data.records.map((item: unknown) => conversationRecordSchema.parse(item)) : []);
      setStorage('account');
    } catch { if (alive.current) { setStorage('unavailable'); setRecords([]); } }
  }, []);
  useEffect(() => {
    alive.current = true;
    // Owner-scoped read of kept transcripts; state updates follow the fetch, never a provider call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => { alive.current = false; };
  }, [load]);

  async function post(body: unknown): Promise<{ ok: true; record: ConversationRecord | null } | { ok: false; error: string; conflict?: boolean }> {
    if (!workspace) return { ok: false, error: 'Sign in to keep a conversation.' };
    try {
      const response = await fetch('/api/do/personal/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': workspace }, body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return { ok: false, error: typeof data.error === 'string' ? data.error : 'Conversation storage unavailable. No change was confirmed.', conflict: response.status === 409 };
      return { ok: true, record: data.record ? conversationRecordSchema.parse(data.record) : null };
    } catch { return { ok: false, error: 'Conversation storage unavailable. No change was confirmed.' }; }
  }
  /** Save the whole transcript under the active id (or a new one) at the expected revision. */
  const keep = useCallback(async (active: ActiveConversation | null, turns: ConversationTurn[]) => {
    const id = active?.id ?? crypto.randomUUID();
    const result = await post({ action: 'save', id, expectedRevision: active?.revision ?? 0, title: conversationTitle(turns), turns, consent: true, noticeVersion: CONVERSATION_NOTICE_VERSION });
    if (result.ok && result.record) {
      const saved = result.record;
      setRecords(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      return { ok: true as const, active: { id: saved.id, revision: saved.revision, turns: saved.turns } };
    }
    return result.ok ? { ok: false as const, error: 'Conversation storage unavailable. No change was confirmed.' } : result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);
  const forget = useCallback(async (active: ActiveConversation) => {
    const result = await post({ action: 'forget', id: active.id, expectedRevision: active.revision });
    if (result.ok) setRecords(previous => previous.filter(item => item.id !== active.id));
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  return { storage, records, workspace, reload: load, keep, forget };
}

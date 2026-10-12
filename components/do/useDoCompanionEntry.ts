'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { personalDoProfileSchema, type PersonalDoProfile } from '@/apps/do/personal/profile';
import { isCompanionEntry, talkEntryReadiness, type CompanionEntry, type TalkEntryReadiness, type TalkEntryState } from '@/apps/do/shared/companion-entry';

declare global {
  interface Window {
    assemblDoCompanionEntry?: { enter: (entry: CompanionEntry) => boolean; readiness: () => TalkEntryState; refresh: () => Promise<TalkEntryState> };
  }
}
/** A bounded read of the existing voice contract. No token POST or microphone access. */
export function useDoCompanionEntry(onEntry: (entry: CompanionEntry, profile?: PersonalDoProfile) => void) {
  const [profile, setProfile] = useState<PersonalDoProfile>();
  const [talk, setTalk] = useState<TalkEntryReadiness>(() => talkEntryReadiness(null));
  const profileAtEntry = useRef<PersonalDoProfile | undefined>(undefined);
  const latest = useRef(talk); const onEntryRef = useRef(onEntry); const request = useRef<AbortController | null>(null);
  useEffect(() => { latest.current = talk; onEntryRef.current = onEntry; }, [talk, onEntry]);
  const refresh = useCallback(async (): Promise<TalkEntryState> => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    try {
      const response = await fetch('/api/do/live-token', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
      let next = talkEntryReadiness(response.ok ? await response.json() : undefined);
      let reviewedProfile: PersonalDoProfile | undefined;
      if (next.canOpen) {
        const preferences = await fetch('/api/do/personal/profile', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
        const value = preferences.ok ? await preferences.json() : null;
        const parsed = personalDoProfileSchema.safeParse(value?.profile);
        if (!parsed.success || typeof value?.saved !== 'boolean') next = { state: 'unchecked', canOpen: false, message: 'Your saved preferences could not be checked. Retry before opening Talk.' };
        else if (value.saved) reviewedProfile = parsed.data;
      }
      if (!controller.signal.aborted) { profileAtEntry.current = reviewedProfile; latest.current = next; setTalk(next); setProfile(reviewedProfile); }
      return controller.signal.aborted ? 'unchecked' : next.state;
    } catch { if (!controller.signal.aborted) { const next = talkEntryReadiness(undefined); latest.current = next; setTalk(next); } return 'unchecked'; }
  }, []);
  useEffect(() => {
    const api = {
      enter(entry: CompanionEntry) { if (!isCompanionEntry(entry) || (entry === 'talk' && !latest.current.canOpen)) return false; onEntryRef.current(entry, profileAtEntry.current); return true; },
      readiness: () => latest.current.state, refresh,
    };
    window.assemblDoCompanionEntry = api;
    window.dispatchEvent(new Event('assembl:do-entry-ready'));
    const focus = () => { void refresh(); };
    const message = (event: MessageEvent) => {
      // Only the actual embedding parent can request navigation. No context or capture is accepted.
      if (window.parent === window || event.source !== window.parent || !isCompanionEntry(event.data?.entry) || event.data?.type !== 'assembl-do:entry') return;
      api.enter(event.data.entry);
    };
    const timer = window.setTimeout(() => void refresh(), 0);
    window.addEventListener('focus', focus); window.addEventListener('message', message);
    return () => { clearTimeout(timer); request.current?.abort(); window.removeEventListener('focus', focus); window.removeEventListener('message', message); if (window.assemblDoCompanionEntry === api) delete window.assemblDoCompanionEntry; };
  }, [refresh]);
  return { talk, refresh, profile };
}

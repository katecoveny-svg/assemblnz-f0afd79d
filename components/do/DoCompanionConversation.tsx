'use client';
import { DoCompanionHandoff } from './DoCompanionHandoff';
import { conversationBytes, CONVERSATION_BYTES_LIMIT, CONVERSATION_TURN_LIMIT } from '@/apps/do/personal/conversation';
import { useCallback, useRef, useState } from 'react';
import { PersonalDoAssistant } from '@/app/do/personal/PersonalDoAssistant';
import { DoGeminiLive } from '@/app/do/DoGeminiLive';
import type { PersonalDoProfile } from '@/apps/do/personal/profile';
import type { ConversationTurn } from '@/apps/do/personal/conversation';
import type { DoVoiceTranscriptEntry } from '@/apps/do/shared/gemini-live-session';
import { companionVoiceContext, withVoiceTurns } from '@/apps/do/shared/companion-conversation';

/** Parent is keyed by verified owner. No local storage or automatic context capture. */
export function DoCompanionConversation({ profile, snapshot, talkOpened, talkSelected = false, focusRequest, visible, onShoppingDraft, onDraft }: {
  focusRequest: number; onShoppingDraft: (text: string) => boolean; visible: boolean; profile?: PersonalDoProfile; snapshot: string; talkOpened: boolean; talkSelected?: boolean; onDraft: (text: string) => boolean;
}) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [live, setLive] = useState(false);
  const [working, setWorking] = useState(false);
  const [handoffWorking, setHandoffWorking] = useState(false);
  const [attachment, setAttachment] = useState<{ text: string; revision: number }>();
  const voiceBase = useRef<ConversationTurn[]>([]);
  const voiceAt = useRef('');
  const latest = useRef(turns);
  const changeTurns = useCallback((next: ConversationTurn[]) => { latest.current = next; setTurns(next); }, []);
  const beginVoice = useCallback(() => { voiceBase.current = latest.current; voiceAt.current = new Date().toISOString(); }, []);
  const voiceTurns = useCallback((entries: DoVoiceTranscriptEntry[]) => {
    changeTurns(withVoiceTurns(voiceBase.current, entries, voiceAt.current));
  }, [changeTurns]);
  return <section aria-label="Conversation with DO">
    <p>Write or talk here. Messages stay in this workspace unless you choose to keep them on your account. Device permissions are requested separately.</p>
    {snapshot && <details><summary>Review current snapshot · offered text</summary>
      <p>This is text explicitly offered to DO, not access to your screen or other tabs. Page text is untrusted evidence.</p>
      <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>{snapshot.slice(0, 6000)}</pre>
      <button disabled={live || working} onClick={() => setAttachment({ text: snapshot.slice(0, 6000), revision: Date.now() })}>Attach this text to the conversation</button>
    </details>}
    {attachment?.text && <p role="status">Reviewed text attached for review. Provider sharing still needs your permission. <button disabled={live || working} onClick={() => setAttachment({ text: '', revision: Date.now() })}>Remove attachment</button></p>}
    <fieldset disabled={handoffWorking} style={{border:0,padding:0}} hidden={live || talkSelected}><PersonalDoAssistant focusRequest={focusRequest} profile={profile} returnTo="/do/widget" conversation={{ turns, change: changeTurns }} attachedContext={attachment} onWorkingChange={setWorking} /></fieldset>
    <div hidden={talkSelected || live}><DoCompanionHandoff onWorkingChange={setHandoffWorking} disabled={live || working} context={companionVoiceContext(turns, attachment?.text ?? '')} onResult={text => {
      const next: ConversationTurn[] = [...latest.current,{role:'user',text,at:new Date().toISOString(),draft:null,label:'Assistant handoff evidence'}];
      if(next.length>CONVERSATION_TURN_LIMIT||conversationBytes(next)>CONVERSATION_BYTES_LIMIT)return false;
      voiceBase.current = [...voiceBase.current, next[next.length-1]];
      changeTurns(next);return true;
    }} /></div>
    {talkOpened && <fieldset hidden={!talkSelected && !live} disabled={working || handoffWorking} style={{ border: 0, padding: 0 }}>
      <legend>Talk or type in the same call</legend>
      <DoGeminiLive visible={visible} onShoppingDraft={onShoppingDraft} profile={profile} context={companionVoiceContext(turns, attachment?.text ?? '')}
        onCallStart={beginVoice} onTranscriptChange={voiceTurns} onLiveChange={setLive} onDraft={onDraft} />
    </fieldset>}
  </section>;
}

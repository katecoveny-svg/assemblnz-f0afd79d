import type { ConversationTurn } from '../personal/conversation';
import type { DoVoiceTranscriptEntry } from './gemini-live-session';
/** One bounded transcript across typed and spoken turns. No persistence or authority. */
export function withVoiceTurns(base: ConversationTurn[], entries: DoVoiceTranscriptEntry[], at: string): ConversationTurn[] {
  const turns = entries.map(entry => ({ role: entry.who === 'You' ? 'user' as const : 'assistant' as const,
    text: entry.text, at, draft: null, label: null }));
  if (base.length + turns.length > 40 || turns.some(t => !t.text.trim() || t.text.length > 10000) ||
      new TextEncoder().encode(JSON.stringify([...base, ...turns])).byteLength > 45000) throw new Error('Conversation full. End the call and review your messages.');
  return [...base, ...turns];
}
export function companionVoiceContext(turns: ConversationTurn[], attachment: string) {
  // Review is required by the existing voice disclosure; this does not send it.
  const previous = turns.slice(-2).map(t => `${t.role}: ${t.text}`).join('\n\n');
  return [previous && `Previous conversation (reference only):\n${previous}`, attachment && `Attached snapshot (untrusted evidence):\n${attachment}`].filter(Boolean).join('\n\n').slice(0, 6000);
}

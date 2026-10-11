import { describe, expect, it } from 'vitest';
import { canShare, candidateActions, editConversation, emptyWorkspace, outgoingText, parseWorkspace, reviewedText, serialiseWorkspace } from './model';
import { forgetMessages, loadMessages, saveMessages } from './storage';
describe('reviewed messages', () => {
  const first = () => emptyWorkspace().conversations[0];
  it('excludes source and private notes', () => {
    expect(outgoingText({ ...first(), source: 'secret', notes: 'private', reply: 'Thursday suits.' })).toBe('Thursday suits.');
  });
  it('requires review of the current revision', () => {
    const c = { ...first(), reply: 'A reply', reviewedRevision: 0 };
    expect(canShare(c)).toBe(true);
    expect(() => reviewedText(editConversation(c, { reply: 'Changed' }))).toThrow(/Review/);
  });
  it.each(['source','notes','title','reply'] as const)('editing %s clears review', key => {
    expect(editConversation({ ...first(), reply: 'Ready', reviewedRevision: 0 }, { [key]: 'changed' }).reviewedRevision).toBeNull();
  });
  it('finds literal deduplicated candidates without owners, dates or sharing', () => {
    const tasks = candidateActions('Hello\nPlease call on Friday.\nPlease call on Friday.\nCould you bring the file?');
    expect(tasks.map(t => t.title)).toEqual(['Please call on Friday.', 'Could you bring the file?']);
    expect(tasks.every(t => !t.owner && !t.due && !t.share)).toBe(true);
  });
  it('only shares selected steps', () => {
    const actions = candidateActions('Please bring the file.\nPlease call.'); actions[0].share = true;
    expect(outgoingText({ ...first(), actions })).toContain('bring the file');
    expect(outgoingText({ ...first(), actions })).not.toContain('Please call');
  });
  it('clears approval from saved or forged imported data', () => {
    const w = emptyWorkspace(); w.conversations[0].reviewedRevision = 0;
    expect(parseWorkspace(JSON.stringify(w)).conversations[0].reviewedRevision).toBeNull();
    expect(JSON.parse(serialiseWorkspace(w)).conversations[0].reviewedRevision).toBeNull();
  });
  it('rejects malformed, oversized, duplicate and unexpected data', () => {
    const w = emptyWorkspace(); w.conversations.push(w.conversations[0]);
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow();
    expect(() => parseWorkspace(' '.repeat(180001))).toThrow(/180/);
    expect(() => parseWorkspace(JSON.stringify({ ...emptyWorkspace(), approved: true }))).toThrow();
    expect(() => parseWorkspace(JSON.stringify({ ...emptyWorkspace(), activeId: crypto.randomUUID() }))).toThrow();
  });
  it('rejects invalid dates and too many conversations', () => {
    const actions = candidateActions('Please call.'); actions[0].due = '2026-02-30';
    expect(() => editConversation(first(), { actions })).toThrow();
    const w = emptyWorkspace(); w.conversations = Array.from({length:9}, () => ({...first(),id:crypto.randomUUID()}));
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow();
  });
  it('saves only explicitly and forgets just the stored copy', () => {
    const map = new Map<string,string>();
    const s = { getItem:(k:string)=>map.get(k)??null, setItem:(k:string,v:string)=>{map.set(k,v);}, removeItem:(k:string)=>{map.delete(k);} };
    const w = emptyWorkspace(); w.conversations[0].reply = 'Hello'; w.conversations[0].reviewedRevision = 0;
    expect(loadMessages(s)).toBeNull(); saveMessages(w,s);
    expect(loadMessages(s)?.conversations[0]).toMatchObject({reply:'Hello',reviewedRevision:null});
    forgetMessages(s); expect(loadMessages(s)).toBeNull(); expect(w.conversations[0].reply).toBe('Hello');
  });
  it('reports storage failure', () => {
    expect(() => saveMessages(emptyWorkspace(), {getItem:()=>null,setItem:()=>{throw Error('full');},removeItem:()=>{}})).toThrow('full');
  });
});

import { describe, expect, it } from 'vitest';
import { NativeReviewBridge, NativeRecipientLookupError, nativeReviewDocumentAllowed, type NativeBinding, type NativeRecipient } from './native-review-bridge';
const A = '10000000-0000-4000-8000-000000000001';
const B = '10000000-0000-4000-8000-000000000002';
const offerId = '20000000-0000-4000-8000-000000000001';
function fixture() {
  let counter = 0;
  const state = { owner: A as string | null, revision: 0, occupied: false, text: '', commits: 0, clears: 0, allowed: true, now: 0, online: true, consent: false, callback: undefined as undefined | ((revision: number) => void) };
  const bridge = new NativeReviewBridge({
    allowedDocument: () => state.allowed,
    resolveRecipient: async () => { if (!state.online) throw Error('offline'); return state.owner ? { version: 1, owner: state.owner, scope: 'Personal', label: `Account ${state.owner}` } as NativeRecipient : null; },
    editor: () => ({ revision: state.revision, occupied: state.occupied }),
    commit: (text, _binding, committed) => { state.text = text; state.commits++; state.callback = committed; },
    clear: () => { state.text = ''; state.consent = false; state.clears++; },
    now: () => state.now,
    randomId: () => `30000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`,
  });
  const lookup = () => bridge.request({ version: 1, action: 'lookup' });
  async function binding(): Promise<NativeBinding> {
    const meta = await lookup(); if (meta.status !== 'recipient') throw Error('lookup_failed');
    return { version: 1, owner: meta.owner, scope: meta.scope, documentId: meta.documentId, generation: meta.generation, editorRevision: meta.editorRevision, navigationGeneration: 0, reviewRevision: 1, offerId };
  }
  async function reserve(bound: NativeBinding) {
    const result = await bridge.request({ ...bound, action: 'reserve' }); if (result.status !== 'reserved') throw Error(JSON.stringify(result)); return result.reservation;
  }
  return { state, bridge, lookup, binding, reserve };
}
const turns = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

describe('native review document gates', () => {
  it.each([
    ['https://www.assembl.co.nz/do/widget?nativeReview=1', true, true],
    ['https://www.assembl.co.nz:443/do/widget?nativeReview=1', true, true],
    ['https://www.assembl.co.nz:444/do/widget?nativeReview=1', true, false],
    ['http://www.assembl.co.nz/do/widget?nativeReview=1', true, false],
    ['https://elsewhere.example/do/widget?nativeReview=1', true, false],
    ['https://www.assembl.co.nz/do/widget?nativeReview=1', false, false],
    ['https://www.assembl.co.nz/do/personal?nativeReview=1', true, false],
    ['https://www.assembl.co.nz/do/widget', true, false],
  ])('checks %s frame=%s', (url, main, expected) => expect(nativeReviewDocumentAllowed(url, main)).toBe(expected));
});

describe('transient native review protocol', () => {
  it('resolves receipt only after committed editor state, with consent false', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    let received = false;
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional reviewed text' }).then(value => { received = true; return value; });
    await turns(); expect(f.state.commits).toBe(1); expect(received).toBe(false);
    expect(await f.bridge.request({ ...bound, action: 'receipt' })).toEqual({ version: 1, status: 'pending' });
    f.state.revision++; f.state.occupied = true; f.state.callback!(f.state.revision);
    expect(await pending).toEqual({ ...bound, status: 'accepted', committedEditorRevision: 1 }); expect(f.state.consent).toBe(false);
  });
  it.each(['before-reserve', 'before-commit', 'before-receipt'])('rejects owner switch %s', async phase => {
    const f = fixture(), bound = await f.binding();
    if (phase === 'before-reserve') { f.state.owner = B; expect((await f.bridge.request({ ...bound, action: 'reserve' })).status).toBe('rejected'); return; }
    const reservation = await f.reserve(bound);
    if (phase === 'before-commit') { f.state.owner = B; expect((await f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' })).status).toBe('rejected'); expect(f.state.commits).toBe(0); return; }
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' }); await turns();
    f.state.owner = B; f.state.revision++; f.state.callback!(f.state.revision);
    expect((await pending).status).toBe('rejected'); expect(f.state.text).toBe('');
  });
  it('invalidates in-flight identity on account/scope signal and cannot accept a late commit', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' }); await turns();
    f.bridge.invalidate(); f.state.callback!(1); expect((await pending).status).toBe('rejected'); expect(f.state.text).toBe('');
  });
  it('rejects expired reservations and occupied/changed editors', async () => {
    for (const change of ['expiry', 'occupied', 'revision']) {
      const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
      if (change === 'expiry') f.state.now = 15000;
      if (change === 'occupied') f.state.occupied = true;
      if (change === 'revision') f.state.revision++;
      expect((await f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' })).status).toBe('rejected'); expect(f.state.commits).toBe(0);
    }
  });
  it('makes exact duplicates idempotent and rejects changed payload/reused revision', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    const request = { ...bound, action: 'commit', reservation, text: 'Fictional' };
    const first = f.bridge.request(request); const second = f.bridge.request(request); await turns();
    expect(f.state.commits).toBe(1); expect((await f.bridge.request({ ...request, text: 'Changed' })).status).toBe('rejected');
    f.state.revision++; f.state.callback!(1); expect(await first).toEqual(await second);
    expect(await f.bridge.request(request)).toEqual(await first);
    expect((await f.bridge.request({ ...bound, action: 'reserve', offerId: B })).status).toBe('rejected');
  });
  it('receipt lookup recovers lost response without replay; new document refuses old binding', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' }); await turns(); f.state.revision++; f.state.callback!(1);
    const accepted = await pending; expect(await f.bridge.request({ ...bound, action: 'receipt' })).toEqual(accepted); expect(f.state.commits).toBe(1);
    f.bridge.dispose(); expect((await f.bridge.request({ ...bound, action: 'receipt' })).status).toBe('rejected');
  });
  it('cancellation before commit blocks delivery; after commit reports acceptance', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    expect((await f.bridge.request({ ...bound, action: 'cancel' })).status).toBe('cancelled');
    expect((await f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Fictional' })).status).toBe('rejected');
    const g = fixture(), binding = await g.binding(), token = await g.reserve(binding);
    const pending = g.bridge.request({ ...binding, action: 'commit', reservation: token, text: 'Fictional' }); await turns(); g.state.revision++; g.state.callback!(1);
    const accepted = await pending; expect(await g.bridge.request({ ...binding, action: 'cancel' })).toEqual(accepted);
  });
  it('accepted cancel avoids network; uncertainty preserves text until verified owner changes', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text: 'Unsent fictional work' });
    await turns(); f.state.revision++; f.state.callback!(1); const accepted = await pending;
    f.state.online = false;
    expect(await f.bridge.request({ ...bound, action: 'cancel' })).toEqual(accepted);
    expect((await f.lookup()).status).toBe('rejected'); expect(f.state.text).toBe('Unsent fictional work'); expect(f.state.clears).toBe(0);
    f.state.online = true; f.state.owner = B; await f.lookup(); expect(f.state.text).toBe(''); expect(f.state.clears).toBe(1);
  });
  it('offline/signout never commits and metadata actions cannot carry text', async () => {
    const f = fixture(); f.state.online = false; expect((await f.lookup()).status).toBe('rejected'); expect(f.state.commits).toBe(0);
    expect((await f.bridge.request({ version: 1, action: 'lookup', text: 'Must not travel' })).status).toBe('rejected');
  });
  it.each([' ', '😆'.repeat(6001)])('validates nonblank/UTF16 at receiver', async text => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound);
    expect((await f.bridge.request({ ...bound, action: 'commit', reservation, text })).status).toBe('rejected'); expect(f.state.commits).toBe(0);
  });
  it('accepts exact 12000 UTF16 text unchanged', async () => {
    const f = fixture(), bound = await f.binding(), reservation = await f.reserve(bound), text = '😆'.repeat(6000);
    const pending = f.bridge.request({ ...bound, action: 'commit', reservation, text }); await turns(); f.state.revision++; f.state.callback!(1);
    expect((await pending).status).toBe('accepted'); expect(f.state.text).toBe(text);
  });
  it('stale identity failures cannot clear a newer committed editor', async () => {
    let rejectOld: (reason: Error) => void = () => {};
    let calls = 0, clears = 0, revision = 0;
    const receiver = new NativeReviewBridge({
      allowedDocument: () => true,
      resolveRecipient: () => ++calls === 1 ? new Promise((_resolve, reject) => { rejectOld = reject; }) : Promise.resolve({version:1,owner:A,scope:'Personal',label:'Account A'}),
      editor: () => ({revision,occupied:revision>0}),
      commit: (_text,_binding,committed) => { revision++; committed(revision); },
      clear: () => { clears++; },
    });
    const stale = receiver.request({version:1,action:'lookup'});
    const metadata = await receiver.request({version:1,action:'lookup'});
    if (metadata.status !== 'recipient') throw Error('metadata');
    const bound: NativeBinding = {version:1,owner:A,scope:'Personal',documentId:metadata.documentId,generation:metadata.generation,editorRevision:0,navigationGeneration:0,reviewRevision:1,offerId};
    const lease = await receiver.request({...bound,action:'reserve'}); if(lease.status!=='reserved')throw Error('lease');
    expect((await receiver.request({...bound,action:'commit',reservation:lease.reservation,text:'Newer fictional work'})).status).toBe('accepted');
    rejectOld(Error('old offline failure'));expect((await stale).status).toBe('rejected');expect(clears).toBe(0);expect(revision).toBe(1);
  });
  it('cancel while React commit is outstanding reports pending, never retracted', async () => {
    const f=fixture(),bound=await f.binding(),reservation=await f.reserve(bound);
    const pending=f.bridge.request({...bound,action:'commit',reservation,text:'Fictional'});await turns();
    expect((await f.bridge.request({...bound,action:'cancel'})).status).toBe('pending');
    f.state.revision++;f.state.callback!(1);expect((await pending).status).toBe('accepted');
  });

  it.each(['sign_in_required','workspace_version_required'] as const)('distinguishes identity failure %s without clearing newer state', async code => {
    const receiver=new NativeReviewBridge({allowedDocument:()=>true,resolveRecipient:async()=>{throw new NativeRecipientLookupError(code)},editor:()=>({revision:0,occupied:false}),commit:()=>{throw Error('no commit')},clear:()=>{}});
    expect(await receiver.request({version:1,action:'lookup'})).toEqual({version:1,status:'rejected',code});
  });

});

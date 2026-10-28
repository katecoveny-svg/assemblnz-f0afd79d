import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const hooks = vi.hoisted(() => ({ slots: [] as any[], index: 0 }));
vi.mock('react', async () => ({
  ...await vi.importActual<any>('react'),
  useState: (initial: any) => { const i = hooks.index++; if (!(i in hooks.slots)) hooks.slots[i] = initial; return [hooks.slots[i], (v: any) => { hooks.slots[i] = v; }]; },
  useRef: (value: any) => { const i = hooks.index++; return hooks.slots[i] ?? (hooks.slots[i] = { current: value }); },
  useEffect: () => {},
}));
import { DoFirstResult } from './DoFirstResult';
const talk = vi.fn(), dirty = vi.fn();
const render = () => { hooks.index = 0; return DoFirstResult({ onTalk: talk, onDirty: dirty }); };
function nodes(tree: any): any[] { if (!tree || typeof tree !== 'object') return []; return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)]; }
const button = (label: string) => nodes(render()).find(n => n.type === 'button' && n.props.children === label);
const field = (id: string) => nodes(render()).find(n => n.props?.id === id);
function prepare() {
  button('Start with one small task').props.onClick();
  button('Prepare a brief').props.onClick();
  field('do-first-goal').props.onChange({ target: { value: 'Plan a fictional Wellington weekend' } });
  field('do-first-notes').props.onChange({ target: { value: 'Two people, Sunday afternoon' } });
  nodes(render()).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
}
beforeEach(() => { hooks.slots = []; talk.mockClear(); dirty.mockClear(); vi.stubGlobal('fetch', vi.fn(() => { throw Error('No network allowed'); })); });
afterEach(() => vi.unstubAllGlobals());
it('prepares an editable local outline without network, voice or save claims', () => {
  prepare(); expect(field('do-first-draft').props.value).toContain('Two people, Sunday afternoon');
  expect(renderToStaticMarkup(render())).toContain('In this tab · not saved');
  expect(fetch).not.toHaveBeenCalled(); expect(talk).not.toHaveBeenCalled();
});
it('preserves edits through back, repeat preparation, skip and reopen', () => {
  prepare(); field('do-first-draft').props.onChange({ target: { value: 'My reviewed plan' } });
  button('Back').props.onClick(); nodes(render()).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  button('Close guide · keep work in this tab').props.onClick(); button('Return to my unsaved brief').props.onClick();
  expect(field('do-first-draft').props.value).toBe('My reviewed plan');
});
it('retains the brief after clipboard failure and rejected assistant handoff', async () => {
  prepare(); const original = field('do-first-draft').props.value;
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(Error('denied')) } });
  await button('Copy brief').props.onClick(); expect(renderToStaticMarkup(render())).toContain('copy it manually');
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  vi.stubGlobal('CustomEvent', class { constructor(public type: string, public init: unknown) {} });
  button('Review in Ask DO').props.onClick(); expect(renderToStaticMarkup(render())).toContain('Your brief stays here');
  expect(field('do-first-draft').props.value).toBe(original); expect(fetch).not.toHaveBeenCalled();
});
it('type instead never opens voice and voice options require an explicit click', () => {
  button('Start with one small task').props.onClick();
  button('Type instead').props.onClick(); expect(field('do-first-goal')).toBeDefined(); expect(talk).not.toHaveBeenCalled();
  button('Review voice options').props.onClick(); expect(talk).toHaveBeenCalledTimes(1); expect(fetch).not.toHaveBeenCalled();
});
it('offers a reviewed copy without sending it and keeps the original', () => {
  prepare(); const original = field('do-first-draft').props.value;
  const focus = vi.fn();
  vi.stubGlobal('document', { getElementById: () => ({ focus }) });
  vi.stubGlobal('CustomEvent', class { detail: any; constructor(_type: string, init: any) { this.detail = init.detail; } });
  vi.stubGlobal('window', { dispatchEvent: (event: any) => { event.detail.result = { accepted: true, text: event.detail.text }; } });
  button('Review in Ask DO').props.onClick();
  expect(renderToStaticMarkup(render())).toContain('Nothing was sent or saved');
  expect(field('do-first-draft').props.value).toBe(original); expect(fetch).not.toHaveBeenCalled();
});

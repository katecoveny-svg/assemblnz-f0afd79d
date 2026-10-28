// @vitest-environment jsdom
import { createElement, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ listener: null as null | ((event: string, session: unknown) => void) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { onAuthStateChange: (fn: typeof auth.listener) => { auth.listener = fn; return { data: { subscription: { unsubscribe() {} } } }; } } }) }));
vi.mock('@/components/do/DoSecondaryNavigation', () => ({ DoSecondaryNavigation: () => null }));
vi.mock('@/components/do/DoBrand', () => ({ DoBrand: () => null }));
vi.mock('@/components/do/DoPresence', () => ({ DoPresence: () => null }));
vi.mock('@/components/do/DoShareButton', () => ({ DoShareButton: () => null }));
vi.mock('@/components/do/DoReadAloud', () => ({ DoReadAloud: () => null }));
vi.mock('@/app/do/DoGeminiLive', () => ({ DoGeminiLive: () => null }));
vi.mock('./PersonalDoSettings', () => ({ PersonalDoSettings: () => null }));
vi.mock('./LifeAdmin', () => ({ LifeAdmin: () => createElement('section', { id: 'fixture-workspace' }, 'Workspace') }));
vi.mock('./PersonalDoAssistant', () => ({ PersonalDoAssistant: () => null }));
vi.mock('@/apps/do/shared/share-intake', () => ({ readDoShareForWorkspace: () => null }));
import { PersonalDo } from './PersonalDo';
let root: Root, container: HTMLDivElement;
let errors: ReturnType<typeof vi.spyOn>;
const fetcher = vi.fn();
async function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === text);
  expect(button, `button ${text}`).toBeDefined();
  await act(async () => { button!.click(); });
}
async function type(id: string, text: string) {
  const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  expect(input).not.toBeNull();
  const setter = Object.getOwnPropertyDescriptor(id === 'do-first-goal' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype, 'value')!.set!;
  for (const char of text) await act(async () => { setter.call(input, input.value + char); input.dispatchEvent(new Event('input', { bubbles: true })); });
}
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', fetcher);
  fetcher.mockReset().mockResolvedValue({ ok: false, status: 401, json: async () => ({ workspaceKey: 'guest' }) });
  errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => { root.render(createElement(PersonalDo)); });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it('keeps one guide through parent updates, native typing, back and skip/reopen', async () => {
  await click('Start with one small task');
  expect(container.querySelectorAll('#do-first-result-heading')).toHaveLength(1);
  await click('Prepare a brief');
  await type('do-first-goal', 'Fictional cloud picnic');
  await type('do-first-notes', 'Bring a blue blanket');
  expect(container.querySelectorAll('#do-first-goal')).toHaveLength(1);
  expect((container.querySelector('#do-first-goal') as HTMLInputElement).value).toBe('Fictional cloud picnic');
  await click('Make editable outline');
  expect((container.querySelector('#do-first-draft') as HTMLTextAreaElement).value).toContain('Bring a blue blanket');
  await click('Back'); await click('Return to my brief');
  await click('Close guide · keep work in this tab'); await click('Return to my unsaved brief');
  expect(container.querySelectorAll('#do-first-result-heading')).toHaveLength(1);
  expect((container.querySelector('#do-first-draft') as HTMLTextAreaElement).value).toContain('Fictional cloud picnic');
  expect(errors.mock.calls.filter((call: unknown[]) => String(call).includes('same key'))).toHaveLength(0);
});
it('quarantines notes on a transient refresh failure and restores only the verified same owner', async () => {
  await click('Start with one small task'); await click('Prepare a brief');
  await type('do-first-goal', 'Fictional private picnic'); await type('do-first-notes', 'Blue blanket');
  fetcher.mockRejectedValueOnce(Error('offline'));
  await act(async () => { window.dispatchEvent(new Event('focus')); });
  expect(container.querySelector('#do-first-goal')).toBeNull();
  expect(container.textContent).not.toContain('Fictional private picnic');
  await click('Try loading again');
  expect((container.querySelector('#do-first-goal') as HTMLInputElement).value).toBe('Fictional private picnic');
  expect((container.querySelector('#do-first-notes') as HTMLTextAreaElement).value).toBe('Blue blanket');
  expect(container.querySelectorAll('#do-first-result-heading')).toHaveLength(1);
});
it('removes all previous-owner DOM and draft state on account change or logout', async () => {
  await click('Start with one small task'); await click('Prepare a brief');
  await type('do-first-goal', 'Fictional previous owner');
  const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  fetcher.mockResolvedValue({ ok: true, status: 200, json: async () => ({ workspaceKey: owner, responsibilities: [], runs: [], storage: { available: false }, worker: { configured: false, lastSeenAt: null } }) });
  await act(async () => { auth.listener?.('SIGNED_IN', { user: { id: owner } }); });
  expect(container.textContent).not.toContain('Fictional previous owner');
  expect([...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')].some(input => input.value.includes('Fictional previous owner'))).toBe(false);
  expect(container.querySelectorAll('#do-first-goal')).toHaveLength(0);
  await click('Start with one small task'); await click('Prepare a brief');
  expect((container.querySelector('#do-first-goal') as HTMLInputElement).value).toBe('');
  await type('do-first-goal', 'Fictional account draft');
  fetcher.mockResolvedValue({ ok: false, status: 401, json: async () => ({ workspaceKey: 'guest' }) });
  await act(async () => { auth.listener?.('SIGNED_OUT', null); });
  expect(container.textContent).not.toContain('Fictional account draft');
  expect([...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')].some(input => input.value.includes('Fictional account draft'))).toBe(false);
  expect(container.querySelectorAll('#do-first-result-heading')).toHaveLength(0);
  await click('Start with one small task'); await click('Prepare a brief');
  expect((container.querySelector('#do-first-goal') as HTMLInputElement).value).toBe('');
  expect(container.querySelectorAll('#do-first-result-heading')).toHaveLength(1);
});
it('keeps signed-in notes quarantined across invalid JSON until the server verifies the same owner', async () => {
  const owner = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const response = { ok: true, status: 200, json: async () => ({ workspaceKey: owner, responsibilities: [], runs: [], storage: { available: false }, worker: { configured: false, lastSeenAt: null } }) };
  fetcher.mockResolvedValue(response);
  await act(async () => { auth.listener?.('SIGNED_IN', { user: { id: owner } }); });
  await click('Start with one small task'); await click('Prepare a brief'); await type('do-first-goal', 'Fictional signed-in plan');
  fetcher.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw Error('invalid JSON'); } });
  await act(async () => { window.dispatchEvent(new Event('focus')); });
  expect(container.querySelector('#do-first-goal')).toBeNull(); expect(container.textContent).not.toContain('Fictional signed-in plan');
  await click('Try loading again');
  expect((container.querySelector('#do-first-goal') as HTMLInputElement).value).toBe('Fictional signed-in plan');
});

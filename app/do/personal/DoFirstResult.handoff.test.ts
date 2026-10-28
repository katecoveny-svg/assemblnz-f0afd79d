// @vitest-environment jsdom
import { createElement as h, act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
vi.mock('./TodayTasks', () => ({ TodayTasks: () => null }));
vi.mock('./PetWeekly', () => ({ PetRoutineComposer: () => null, PetWeekly: () => null }));
vi.mock('./ChecklistCloud', () => ({ ChecklistCloud: () => null }));
vi.mock('./LifeAdminTraffic', () => ({ LifeAdminTraffic: () => null }));
vi.mock('@/app/do/DoVision', () => ({ DoVision: () => null }));
vi.mock('@/components/do/DoReadAloud', () => ({ DoReadAloud: () => null }));
vi.mock('@/components/do/DoCapabilityIdeas', () => ({ DoCapabilityIdeas: () => null }));
vi.mock('./useKeptConversations', () => ({ useKeptConversations: () => ({ storage: 'none', records: [], busy: false }) }));
import { LifeAdmin } from './LifeAdmin';
import { PersonalDoAssistant } from './PersonalDoAssistant';
import { DoFirstResult } from './DoFirstResult';
const noop = () => {};
function Fixture() {
  const [request, setRequest] = useState(0);
  return h('main', null,
    h(DoFirstResult, { onDirty: noop, onTalk: noop }),
    h(LifeAdmin, { storageScope: 'guest', revealAssistantRequest: request, assistant: h(PersonalDoAssistant, { showIdeas: false, onRevealWriting: () => setRequest(n => n + 1) }) }));
}
let root: Root, container: HTMLDivElement;
const fetcher = vi.fn();
async function click(label: string) {
  const b = [...container.querySelectorAll('button')].find(b => b.textContent === label);
  expect(b, label).toBeDefined(); await act(async () => b!.click());
}
async function fill(id: string, value: string) {
  const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(input.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', fetcher);
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  fetcher.mockReset().mockResolvedValue({ ok: false, status: 401, json: async () => ({ ready: false, signedIn: false, message: 'Sign in before sending.' }) });
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(h(Fixture)));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
it('reveals and focuses hidden Write after an accepted handoff without submitting', async () => {
  await click('Start with one small task'); await click('Prepare a brief');
  await fill('do-first-goal', 'Fictional garden picnic'); await click('Make editable outline');
  await click('Note or checklist');
  const input = container.querySelector<HTMLTextAreaElement>('#personal-assistant-input')!;
  expect(input.closest('[hidden]')).not.toBeNull();
  await click('Review in Ask DO');
  expect(input.closest('[hidden]')).toBeNull(); expect(document.activeElement).toBe(input);
  expect(input.value).toContain('Fictional garden picnic');
  expect(container.textContent).toContain('Nothing was sent or saved');
  expect(fetcher.mock.calls.every(call => !call[1]?.method || call[1].method === 'GET')).toBe(true);
});
it('rejects an occupied hidden editor and preserves both drafts', async () => {
  await fill('personal-assistant-input', 'Existing fictional work');
  await click('Start with one small task'); await click('Prepare a brief');
  await fill('do-first-goal', 'New fictional picnic'); await click('Make editable outline');
  await click('Note or checklist'); await click('Review in Ask DO');
  expect((container.querySelector('#personal-assistant-input') as HTMLTextAreaElement).value).toBe('Existing fictional work');
  expect((container.querySelector('#do-first-draft') as HTMLTextAreaElement).value).toContain('New fictional picnic');
  expect(container.textContent).toContain('Ask DO already contains work');
});

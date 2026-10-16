import { beforeEach, expect, it, vi } from 'vitest';
const hooks = vi.hoisted(() => ({ slots: [] as unknown[], index: 0 }));
vi.mock('react', async () => ({
  ...await vi.importActual<typeof import('react')>('react'),
  useState: (initial: unknown) => { const i = hooks.index++; if (!(i in hooks.slots)) hooks.slots[i] = initial; return [hooks.slots[i], (value: unknown) => { hooks.slots[i] = value; }]; },
  useRef: (initial: unknown) => { const i = hooks.index++; return hooks.slots[i] ?? (hooks.slots[i] = { current: initial }); },
  useCallback: (callback: unknown) => callback,
}));
vi.mock('@/app/do/personal/PersonalDoAssistant', () => ({ PersonalDoAssistant: () => null }));
vi.mock('@/app/do/DoGeminiLive', () => ({ DoGeminiLive: () => null }));
vi.mock('@/components/do/DoCompanionHandoff', () => ({ DoCompanionHandoff: () => null }));
import { DoCompanionConversation } from '@/components/do/DoCompanionConversation';
import { DoGeminiLive } from '@/app/do/DoGeminiLive';
import { PersonalDoAssistant } from '@/app/do/personal/PersonalDoAssistant';
import type { ReactElement } from 'react';
type Node = ReactElement<Record<string, any>>;
const nodes = (node: any): Node[] => !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
const render = (talkSelected: boolean) => { hooks.index = 0; return DoCompanionConversation({ talkSelected, talkOpened: true, visible: true, focusRequest: 0, snapshot: '', onDraft: () => true, onShoppingDraft: () => true }); };
beforeEach(() => { hooks.slots = []; hooks.index = 0; });
it('keeps the admitted call controls exposed across Write selection until the call ends', () => {
  let tree = render(true);
  const typed = { role: 'user', text: 'Fictional retained conversation', at: '2026-10-16T00:00:00Z', draft: null, label: null };
  nodes(tree).find(node => node.type === PersonalDoAssistant)!.props.conversation.change([typed]);
  nodes(tree).find(node => node.type === DoGeminiLive)!.props.onLiveChange(true);
  tree = render(false);
  const fieldsets = nodes(tree).filter(node => node.type === 'fieldset');
  const call = fieldsets.find(node => nodes(node).some(child => child.type === DoGeminiLive))!;
  const editor = fieldsets.find(node => nodes(node).some(child => child.type === PersonalDoAssistant))!;
  // The existing call component retains its own End/mute controls; no parent hides or remounts it.
  expect(call.props.hidden).toBe(false);
  expect(call.props.disabled).toBe(false);
  expect(editor.props.hidden).toBe(true);
  expect(nodes(call).find(node => node.type === DoGeminiLive)!.props.visible).toBe(true);
  expect(nodes(tree).find(node => node.type === PersonalDoAssistant)!.props.conversation.turns).toEqual([typed]);
  nodes(call).find(node => node.type === DoGeminiLive)!.props.onLiveChange(false);
  tree = render(false);
  expect(nodes(tree).filter(node => node.type === 'fieldset').map(node => node.props.hidden)).toEqual([false, true]);
  expect(nodes(tree).find(node => node.type === PersonalDoAssistant)!.props.conversation.turns).toEqual([typed]);
});

import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
const source = readFileSync('apps/do/extension/sidepanel.js', 'utf8');
function setup() {
  const handlers: Record<string, (event?: unknown) => unknown> = {};
  const send = vi.fn();
  const frame = { contentWindow: { postMessage: send }, addEventListener: (name: string, fn: () => void) => { handlers['frame:' + name] = fn; } };
  const button = { disabled: false, addEventListener: (name: string, fn: () => void) => { handlers['button:' + name] = fn; } };
  const status = { textContent: '' };
  const query = vi.fn(async () => [{ id: 7, url: 'https://example.test/page' }]);
  const execute = vi.fn(async () => [{ result: { text: 'Chosen text', title: 'Sample', url: 'https://example.test/page' } }]);
  runInNewContext(source, { document: { getElementById: (id: string) => ({ builder: frame, capture: button, status })[id] }, window: { addEventListener: (name: string, fn: () => void) => { handlers['window:' + name] = fn; } }, chrome: { tabs: { query }, scripting: { executeScript: execute } }, Error });
  return { handlers, frame, send, execute, query, status };
}
describe('persistent DO panel capture', () => {
  it('does not capture on startup or automatically execute a task', () => {
    const s = setup(); expect(s.query).not.toHaveBeenCalled(); expect(s.execute).not.toHaveBeenCalled(); expect(s.send).not.toHaveBeenCalled();
  });
  it('queues explicit selection until the real builder is ready', async () => {
    const s = setup(); await s.handlers['button:click'](); expect(s.execute).toHaveBeenCalledOnce(); expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({ source: s.frame.contentWindow, origin: 'https://other.example', data: { type: 'assembl-do:ready' } }); expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({ source: {}, origin: 'https://www.assembl.co.nz', data: { type: 'assembl-do:ready' } }); expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({ source: s.frame.contentWindow, origin: 'https://www.assembl.co.nz', data: { type: 'assembl-do:ready' } });
    expect(s.send).toHaveBeenCalledWith(expect.objectContaining({ type: 'assembl-do:context', text: 'Chosen text' }), 'https://www.assembl.co.nz');
    s.handlers['window:message']({ source: s.frame.contentWindow, origin: 'https://www.assembl.co.nz', data: { type: 'assembl-do:ready' } }); expect(s.send).toHaveBeenCalledOnce();
  });
  it('keeps permission failures visible and sends no context', async () => {
    const s = setup(); s.execute.mockRejectedValue(new Error('Capture unavailable'));
    await s.handlers['button:click'](); expect(s.status.textContent).toBe('Capture unavailable'); expect(s.send).not.toHaveBeenCalled();
  });
});

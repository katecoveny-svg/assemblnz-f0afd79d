import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
const source = readFileSync('apps/do/extension/sidepanel.js', 'utf8');
const html = readFileSync('apps/do/extension/sidepanel.html', 'utf8');

function el(extra: Record<string, unknown> = {}) {
  return {
    disabled: false,
    hidden: false,
    textContent: '',
    value: '',
    checked: false,
    href: '',
    contentWindow: { postMessage: vi.fn() },
    addEventListener: vi.fn(),
    ...extra,
  };
}

function setup() {
  const handlers: Record<string, (event?: unknown) => unknown> = {};
  const send = vi.fn();
  const runtimeSend = vi.fn(async () => ({ ok: true }));
  const frame = el({
    contentWindow: { postMessage: send },
    addEventListener: (name: string, fn: () => void) => {
      handlers['frame:' + name] = fn;
    },
  });
  const button = el({
    addEventListener: (name: string, fn: () => void) => {
      handlers['button:' + name] = fn;
    },
  });
  const float = el({
    addEventListener: (name: string, fn: () => void) => {
      handlers['float:' + name] = fn;
    },
  });
  const meeting = el({
    addEventListener: (name: string, fn: () => void) => {
      handlers['meeting:' + name] = fn;
    },
  });
  const draftReply = el({
    addEventListener: (name: string, fn: () => void) => {
      handlers['draft:' + name] = fn;
    },
  });
  const status = el();
  const query = vi.fn(async () => [{ id: 7, url: 'https://example.test/page' }]);
  const execute = vi.fn(async () => [
    { result: { text: 'Chosen text', title: 'Sample', url: 'https://example.test/page' } },
  ]);
  const nodes: Record<string, ReturnType<typeof el>> = {
    builder: frame,
    capture: button,
    float,
    status,
    'help-page': el({ addEventListener: vi.fn() }),
    'draft-reply': draftReply,
    meeting,
    'sign-in': el({ addEventListener: vi.fn() }),
    'refresh-frame': el({ addEventListener: vi.fn() }),
    'dl-chrome': el({ href: '' }),
    'dl-mac': el({ href: '' }),
    'seat-status': el(),
    'do-id': el({ addEventListener: vi.fn() }),
    'session-key': el({ addEventListener: vi.fn() }),
    'open-url': el(),
    'api-origin': el({ addEventListener: vi.fn(), value: 'https://www.assembl.co.nz' }),
    'seat-consent': el(),
    'seat-shot': el(),
    'seat-learn': el(),
    'playbook-label': el(),
    'open-url-btn': el({ addEventListener: vi.fn() }),
    'seat-capture': el({ addEventListener: vi.fn() }),
  };
  runInNewContext(source, {
    document: {
      getElementById: (id: string) => nodes[id] || el({ addEventListener: vi.fn() }),
    },
    window: {
      addEventListener: (name: string, fn: () => void) => {
        handlers['window:' + name] = fn;
      },
    },
    chrome: {
      tabs: { query },
      scripting: { executeScript: execute },
      storage: { local: { get: (_k: unknown, cb: (v: object) => void) => cb({}), set: vi.fn() } },
      runtime: { sendMessage: runtimeSend },
    },
    Error,
  });
  return { handlers, frame, send, execute, query, status, runtimeSend };
}

describe('persistent DO panel capture', () => {
  it('does not capture on startup or automatically execute a task', () => {
    const s = setup();
    expect(s.query).not.toHaveBeenCalled();
    expect(s.execute).not.toHaveBeenCalled();
    expect(s.send).not.toHaveBeenCalled();
  });
  it('queues explicit selection until the real builder is ready', async () => {
    const s = setup();
    await s.handlers['button:click']();
    expect(s.execute).toHaveBeenCalledOnce();
    expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({
      source: s.frame.contentWindow,
      origin: 'https://other.example',
      data: { type: 'assembl-do:ready' },
    });
    expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({
      source: {},
      origin: 'https://www.assembl.co.nz',
      data: { type: 'assembl-do:ready' },
    });
    expect(s.send).not.toHaveBeenCalled();
    s.handlers['window:message']({
      source: s.frame.contentWindow,
      origin: 'https://www.assembl.co.nz',
      data: { type: 'assembl-do:ready' },
    });
    expect(s.send).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'assembl-do:context', text: 'Chosen text' }),
      'https://www.assembl.co.nz',
    );
    s.handlers['window:message']({
      source: s.frame.contentWindow,
      origin: 'https://www.assembl.co.nz',
      data: { type: 'assembl-do:ready' },
    });
    expect(s.send).toHaveBeenCalledOnce();
  });
  it('keeps permission failures visible and sends no context', async () => {
    const s = setup();
    s.execute.mockRejectedValue(new Error('Capture unavailable'));
    await s.handlers['button:click']();
    expect(s.status.textContent).toBe('Capture unavailable');
    expect(s.send).not.toHaveBeenCalled();
  });
  it('opens Meeting DO top-level for recording without an auth gate card', async () => {
    const s = setup();
    await s.handlers['meeting:click']();
    expect(s.runtimeSend).toHaveBeenCalledWith({
      type: 'do:open-url-for-do',
      url: 'https://www.assembl.co.nz/do/meetings',
    });
    expect(s.status.textContent).toMatch(/Record\. Review\. Prepare/);
  });
  it('mirrors /do portable starters and downloads in the panel markup', () => {
    expect(html).toMatch(/What do you want to DO\?/);
    expect(html).toMatch(/Help with this page/);
    expect(html).toMatch(/Draft a reply/);
    expect(html).toMatch(/Meeting notes/);
    expect(html).toMatch(/Downloads/);
    expect(html).toMatch(/Chrome extension/);
    expect(html).toMatch(/Mac companion/);
    expect(html).toMatch(/Needs you/);
    expect(html).toMatch(/Working/);
    expect(html).toMatch(/Done/);
    expect(html).toMatch(/do-mark/);
    expect(html).not.toMatch(/✦|star/i);
    expect(html).not.toMatch(/meeting-card/);
    expect(html).not.toMatch(/Linda/i);
    expect(html).not.toMatch(/Chat\s*\/\s*Help/i);
  });
});

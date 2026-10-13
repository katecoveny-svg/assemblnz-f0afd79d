import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

// Exercise the shipping page wiring with a stub renderer, so input/cleanup behavior
// is tested without requiring a GPU or copying the engine's implementation.
const source = readFileSync('public/direction-4c/assembl-tide.js', 'utf8');
const wiring = source.slice(source.indexOf('function attach('), source.indexOf('window.AssemblTide ='));
async function fixture(initialReduced = false, delayed = false) {
  const listeners = new Map<string, Set<() => void>>();
  const frames = new Map<number, () => void>();
  const motionListeners = new Set<() => void>();
  let frameId = 0, top = 200;
  const par = { style: { transform: '', opacity: '', transition: '' }, parentElement: { getBoundingClientRect: () => ({ top, height: 100 }) } };
  const reveal = { style: { transform: '', opacity: '', transition: '' }, getAttribute: () => '0' };
  const query = { matches: initialReduced, addEventListener: (_: string, fn: () => void) => motionListeners.add(fn), removeEventListener: (_: string, fn: () => void) => motionListeners.delete(fn) };
  const api = { setForm: vi.fn(), setPointer: vi.fn(), setWide: vi.fn(), setPaused: vi.fn(), dispose: vi.fn() };
  const pending: Array<(value: typeof api) => void> = [];
  const context = {
    AbortController, matchMedia: () => query, innerHeight: 800, innerWidth: 1200, window: {}, console,
    document: { documentElement: { toggleAttribute: vi.fn(), removeAttribute: vi.fn() }, querySelectorAll: (selector: string) => selector === '[data-par]' ? [par] : selector === '[data-rv]' ? [reveal] : selector.includes(',') ? [par, reveal] : [] },
    requestAnimationFrame: (fn: () => void) => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
    addEventListener: (name: string, fn: () => void) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name)!.add(fn); },
    removeEventListener: (name: string, fn: () => void) => listeners.get(name)?.delete(fn),
    mount: () => delayed ? new Promise(resolve => pending.push(resolve)) : Promise.resolve(api),
  };
  const attach = runInNewContext(wiring + '\nattach;', context);
  const world = attach({ canvas: {} });
  if (!delayed) await world.ready;
  return { world, attach: () => attach({ canvas: {} }), pending, api, par, reveal, frames, listeners, motionListeners,
    move: () => { top += 200; },
    fire: (name: string) => [...(listeners.get(name) ?? [])].forEach(fn => fn()),
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); },
    reduce: (value: boolean) => { query.matches = value; [...motionListeners].forEach(fn => fn()); },
  };
}

describe('Direction 4c motion boundary', () => {
  it('cancels queued parallax, removes motion listeners and keeps content readable while paused', async () => {
    const f = await fixture();
    expect(f.par.style.transform).toContain('translate3d');
    f.fire('scroll');
    expect(f.frames.size).toBe(1);
    f.world.setPaused(true);
    expect(f.frames.size).toBe(0);
    expect(f.par.style.transform).toBe('none');
    expect(f.reveal.style.opacity).toBe('1');
    const formCalls = f.api.setForm.mock.calls.length;
    f.move(); f.fire('scroll'); f.fire('resize'); f.fire('pointermove'); f.flush();
    expect(f.par.style.transform).toBe('none');
    expect(f.api.setForm).toHaveBeenCalledTimes(formCalls);
    expect(f.api.setPointer).not.toHaveBeenCalled();
    expect(f.listeners.get('scroll')?.size).toBe(0);
    f.world.setPaused(false);
    expect(f.par.style.transform).toContain('translate3d');
    expect(f.listeners.get('scroll')?.size).toBe(1);
    f.world.dispose();
  });
  it('clears displaced sections when reduced motion changes and restores motion only when allowed', async () => {
    const f = await fixture();
    f.reduce(true);
    expect(f.par.style.transform).toBe('none');
    expect(f.listeners.get('scroll')?.size).toBe(0);
    f.world.setPaused(false);
    expect(f.api.setPaused).toHaveBeenLastCalledWith(true);
    f.reduce(false); f.world.setPaused(false);
    expect(f.api.setPaused).toHaveBeenLastCalledWith(false);
    expect(f.par.style.transform).toContain('translate3d');
    f.fire('scroll'); f.world.dispose();
    expect(f.frames.size).toBe(0);
    expect(f.motionListeners.size).toBe(0);
    expect(f.listeners.get('resize')?.size).toBe(0);
    expect(f.par.style.transform).toBe('');
    expect(f.reveal.style.opacity).toBe('');
    expect(f.api.dispose).toHaveBeenCalledOnce();
  });
  it('can pause and synchronously dispose while mount is unresolved', async () => {
    const f = await fixture(false, true);
    f.world.setPaused(true); f.move(); f.fire('scroll'); f.flush();
    expect(f.par.style.transform).toBe('none');
    expect(f.listeners.get('scroll')?.size).toBe(0);
    f.world.dispose();
    expect(f.par.style.transform).toBe('');
    expect(f.motionListeners.size).toBe(0);
    f.pending[0](f.api); await f.world.ready;
    expect(f.api.dispose).toHaveBeenCalledOnce();
    expect(f.par.style.transform).toBe('');
  });
  it('does not restore stale offsets after rapid preference changes and delayed mounts', async () => {
    const f = await fixture(false, true);
    f.reduce(true); f.world.dispose();
    f.reduce(false); const second = f.attach();
    f.pending[0](f.api); await f.world.ready;
    f.pending[1](f.api); await second.ready;
    f.reduce(true); second.dispose();
    expect(f.par.style.transform).toBe('');
    expect(f.motionListeners.size).toBe(0);
    expect(f.listeners.get('scroll')?.size).toBe(0);
  });
  it('starts without parallax under reduced motion', async () => {
    const f = await fixture(true);
    f.move(); f.fire('scroll'); f.flush();
    expect(f.par.style.transform).toBe('none');
    expect(f.api.setForm).not.toHaveBeenCalled();
    expect(f.frames.size).toBe(0);
    f.world.dispose();
  });
});

// Run the actual controller in a tiny DOM harness to cover async lifecycle races.
// No video/GPU dependency: the deferred world is a renderer boundary, not a copy of its logic.
async function controllerFixture() {
  const { transpileModule, ModuleKind, JsxEmit } = await import('typescript');
  const component = readFileSync('components/site/direction-4c/Direction4cHome.tsx', 'utf8');
  const js = transpileModule(component, { compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX } }).outputText;
  const frames = new Map<number, () => void>();
  const videoEvents = new Map<string, () => void>();
  const button = { setAttribute: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), textContent: '', disabled: false };
  const canvas = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const root = { dataset: {} as Record<string, string>, toggleAttribute: vi.fn(), querySelectorAll: () => [], querySelector: (selector: string) => selector === '[data-pause]' ? button : selector.includes('canvasRef') ? canvas : null };
  const video = { muted: false, playsInline: false, preload: '', duration: 24, currentTime: 0, seeking: false, src: '', pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: (name: string, fn: () => void) => videoEvents.set(name, fn), removeEventListener: (name: string) => videoEvents.delete(name) };
  let resolveAttach!: () => void;
  const world = { ready: new Promise<void>(resolve => { resolveAttach = resolve; }), api: { setKnock: vi.fn(), setArrive: vi.fn() }, setPaused: vi.fn(), dispose: vi.fn() };
  const attach = vi.fn((_options: { onFail(): void }) => world);
  let cleanup!: () => void;
  const exported: { Direction4cHome?: () => void } = {};
  let preference!: () => void;
  const media = { matches: false, addEventListener: (_: string, fn: () => void) => { preference = fn; }, removeEventListener: vi.fn() };
  runInNewContext(js, {
    exports: exported,
    require: (name: string) => name === 'react' ? { useRef: () => ({ current: root }), useEffect: (fn: () => () => void) => { cleanup = fn(); } } : name === 'react/jsx-runtime' ? { jsx: () => null } : {},
    document: { hidden: false, createElement: () => video, querySelector: () => ({ dataset: { loaded: 'true' } }), documentElement: { removeAttribute: vi.fn(), scrollHeight: 1000 }, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    window: { AssemblTide: { attach } }, matchMedia: () => media, scrollY: 0, innerHeight: 800, performance: { now: () => 0 },
    cancelAnimationFrame: (id: number) => frames.delete(id), requestAnimationFrame: (fn: () => void) => { frames.set(frames.size + 1, fn); return frames.size; },
  });
  exported.Direction4cHome!();
  for (let n = 0; n < 8; n++) await Promise.resolve();
  return { attach, world, root, video, videoEvents, frames, resolveAttach, cleanup, media, preference, flush: async () => { for (let n = 0; n < 8; n++) await Promise.resolve(); } };
}
it('disposes an attach that resolves after media failure without restarting frames or seeking video', async () => {
  const { attach, world, root, video, videoEvents, frames, resolveAttach, cleanup, flush } = await controllerFixture();
  expect(attach).toHaveBeenCalledOnce();
  videoEvents.get('error')!();
  expect(root.dataset.static).toBe('true');
  resolveAttach();
  await flush();
  expect(world.dispose).toHaveBeenCalled();
  expect(root.dataset.ready).toBeUndefined();
  expect(frames.size).toBe(0);
  expect(video.currentTime).toBe(0);
  expect(video.removeAttribute).toHaveBeenCalledWith('src');
  cleanup();
  expect(videoEvents.size).toBe(0);
});

it('ignores a superseded attachment failure after a newer scene is ready', async () => {
  const f = await controllerFixture();
  const staleFailure = f.attach.mock.calls[0][0].onFail;
  f.media.matches = true; f.preference();
  f.media.matches = false; f.preference();
  await f.flush();
  f.resolveAttach(); await f.flush();
  expect(f.root.dataset.ready).toBe('true');
  const disposals = f.world.dispose.mock.calls.length;
  staleFailure();
  expect(f.root.dataset.ready).toBe('true');
  expect(f.world.dispose).toHaveBeenCalledTimes(disposals);
  f.cleanup();
});

it('cancels delayed font initialization before allocating a WebGL renderer', async () => {
  const mountSource = source.slice(source.indexOf('async function mount('), source.indexOf('// Page wiring shared'));
  let loaded!: () => void;
  const renderer = vi.fn();
  const mount = runInNewContext(mountSource + '\nmount;', {
    FONT: 'Arial', DOMException, window: { THREE: { WebGLRenderer: renderer } },
    document: { fonts: { load: () => new Promise<void>(resolve => { loaded = resolve; }) } }, setTimeout: () => 0,
  });
  const abort = new AbortController();
  const pending = mount({}, { signal: abort.signal });
  abort.abort(); loaded();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(renderer).not.toHaveBeenCalled();
});

import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

// Exercise the shipping page wiring with a stub renderer, so input/cleanup behavior
// is tested without requiring a GPU or copying the engine's implementation.
const source = readFileSync('public/direction-4c/assembl-tide.js', 'utf8');
const wiring = source.slice(source.indexOf('async function attach('), source.indexOf('window.AssemblTide ='));
async function fixture(initialReduced = false) {
  const listeners = new Map<string, Set<() => void>>();
  const frames = new Map<number, () => void>();
  const motionListeners = new Set<() => void>();
  let frameId = 0, top = 200;
  const par = { style: { transform: '', opacity: '', transition: '' }, parentElement: { getBoundingClientRect: () => ({ top, height: 100 }) } };
  const reveal = { style: { transform: '', opacity: '', transition: '' }, getAttribute: () => '0' };
  const query = { matches: initialReduced, addEventListener: (_: string, fn: () => void) => motionListeners.add(fn), removeEventListener: (_: string, fn: () => void) => motionListeners.delete(fn) };
  const api = { setForm: vi.fn(), setPointer: vi.fn(), setWide: vi.fn(), setPaused: vi.fn(), dispose: vi.fn() };
  const context = {
    matchMedia: () => query, innerHeight: 800, innerWidth: 1200, window: {}, console,
    document: { documentElement: { toggleAttribute: vi.fn(), removeAttribute: vi.fn() }, querySelectorAll: (selector: string) => selector === '[data-par]' ? [par] : selector === '[data-rv]' ? [reveal] : selector.includes(',') ? [par, reveal] : [] },
    requestAnimationFrame: (fn: () => void) => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
    addEventListener: (name: string, fn: () => void) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name)!.add(fn); },
    removeEventListener: (name: string, fn: () => void) => listeners.get(name)?.delete(fn),
    mount: async () => api,
  };
  const attach = runInNewContext(wiring + '\nattach;', context);
  const world = await attach({ canvas: {} });
  return { world, api, par, reveal, frames, listeners, motionListeners,
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
it('disposes an attach that resolves after media failure without restarting frames or seeking video', async () => {
  const { transpileModule, ModuleKind, JsxEmit } = await import('typescript');
  const component = readFileSync('components/site/direction-4c/Direction4cHome.tsx', 'utf8');
  const js = transpileModule(component, { compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX } }).outputText;
  const frames = new Map<number, () => void>();
  const videoEvents = new Map<string, () => void>();
  const button = { setAttribute: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), textContent: '', disabled: false };
  const canvas = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const root = { dataset: {} as Record<string, string>, toggleAttribute: vi.fn(), querySelectorAll: () => [], querySelector: (selector: string) => selector === '[data-pause]' ? button : selector.includes('canvasRef') ? canvas : null };
  const video = { muted: false, playsInline: false, preload: '', duration: 24, currentTime: 0, seeking: false, src: '', pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: (name: string, fn: () => void) => videoEvents.set(name, fn), removeEventListener: (name: string) => videoEvents.delete(name) };
  const world = { api: { setKnock: vi.fn(), setArrive: vi.fn() }, setPaused: vi.fn(), dispose: vi.fn() };
  let resolveAttach!: (value: typeof world) => void;
  const attach = vi.fn(() => new Promise<typeof world>(resolve => { resolveAttach = resolve; }));
  let cleanup!: () => void;
  const exported: { Direction4cHome?: () => void } = {};
  const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  runInNewContext(js, {
    exports: exported,
    require: (name: string) => name === 'react' ? { useRef: () => ({ current: root }), useEffect: (fn: () => () => void) => { cleanup = fn(); } } : name === 'react/jsx-runtime' ? { jsx: () => null } : {},
    document: { hidden: false, createElement: () => video, querySelector: () => ({ dataset: { loaded: 'true' } }), documentElement: { removeAttribute: vi.fn() }, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    window: { AssemblTide: { attach } }, matchMedia: () => media,
    cancelAnimationFrame: (id: number) => frames.delete(id), requestAnimationFrame: (fn: () => void) => { frames.set(frames.size + 1, fn); return frames.size; },
  });
  exported.Direction4cHome!();
  for (let n = 0; n < 8; n++) await Promise.resolve();
  expect(attach).toHaveBeenCalledOnce();
  videoEvents.get('error')!();
  expect(root.dataset.static).toBe('true');
  resolveAttach(world);
  for (let n = 0; n < 8; n++) await Promise.resolve();
  expect(world.dispose).toHaveBeenCalledOnce();
  expect(root.dataset.ready).toBeUndefined();
  expect(frames.size).toBe(0);
  expect(video.currentTime).toBe(0);
  expect(video.removeAttribute).toHaveBeenCalledWith('src');
  cleanup();
  expect(videoEvents.size).toBe(0);
});

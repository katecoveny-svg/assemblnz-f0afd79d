import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { playVideoWhenAllowed } from './video-readiness';

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
  const videoListeners = new Map<string, Set<() => void>>();
  const buttonEvents = new Map<string, () => void>();
  const documentEvents = new Map<string, () => void>();
  const button = { setAttribute: vi.fn(), addEventListener: (name: string, fn: () => void) => buttonEvents.set(name, fn), removeEventListener: (name: string) => buttonEvents.delete(name), textContent: '', disabled: false };
  const canvas = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const copy = Object.fromEntries(['kickRef', 'cueRef', 'subRef', 'msgRef', 'markRef'].map(name => [name, { style: { opacity: '0', visibility: 'hidden', transform: '' } }]));
  let heroTop = 0;
  const hero = { getBoundingClientRect: () => ({ top: heroTop, height: 2560 }) };
  const root = { dataset: {} as Record<string, string>, toggleAttribute: vi.fn(), querySelectorAll: () => [], querySelector: (selector: string) => selector === '[data-coastal-video]' ? video : selector === '[data-pause]' ? button : selector.includes('canvasRef') ? canvas : selector.includes('heroRef') ? hero : copy[selector.match(/data-ref="([^"]+)"/)?.[1] ?? ''] ?? null };
  const video = { canPlayType: () => 'probably', readyState: 2, videoWidth: 1280, paused: true, muted: false, playsInline: false, preload: '', duration: 24, currentTime: 0, seeking: false, src: '', play: vi.fn(async () => { video.paused = false; }), pause: vi.fn(() => { video.paused = true; }), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: (name: string, fn: () => void) => { if (!videoListeners.has(name)) videoListeners.set(name, new Set()); videoListeners.get(name)!.add(fn); videoEvents.set(name, () => [...(videoListeners.get(name) ?? [])].forEach(listener => listener())); }, removeEventListener: (name: string, fn: () => void) => { videoListeners.get(name)?.delete(fn); if (!videoListeners.get(name)?.size) videoEvents.delete(name); } };
  let resolveAttach!: () => void;
  const world = { ready: new Promise<void>(resolve => { resolveAttach = resolve; }), api: { setKnock: vi.fn(), setArrive: vi.fn(), setLit: vi.fn(), pulse: vi.fn() }, setPaused: vi.fn(), dispose: vi.fn() };
  const attach = vi.fn((_options: { onFail(): void }) => world);
  let cleanup!: () => void;
  const exported: { Direction4cHome?: () => void } = {};
  let preference!: () => void;
  const media = { matches: false, addEventListener: (_: string, fn: () => void) => { preference = fn; }, removeEventListener: vi.fn() };
  let resize!: () => void;
  const mobile = { matches: false, addEventListener: (_: string, fn: () => void) => { resize = fn; }, removeEventListener: vi.fn() };
  const pageDocument = { hidden: false, createElement: () => video, querySelector: () => ({ dataset: { loaded: 'true' } }), documentElement: { removeAttribute: vi.fn(), scrollHeight: 1000 }, addEventListener: (name: string, fn: () => void) => documentEvents.set(name, fn), removeEventListener: (name: string) => documentEvents.delete(name) };
  runInNewContext(js, {
    exports: exported, AbortController,
    require: (name: string) => name === 'react' ? { useRef: () => ({ current: root }), useEffect: (fn: () => () => void) => { cleanup = fn(); } } : name === './video-readiness' ? { playVideoWhenAllowed } : name === 'react/jsx-runtime' ? { jsx: () => null, jsxs: () => null } : {},
    document: pageDocument,
    window: { AssemblTide: { attach } }, matchMedia: (query: string) => query.includes('max-width') ? mobile : media, scrollY: 0, innerHeight: 800, performance: { now: () => 0 },
    cancelAnimationFrame: (id: number) => frames.delete(id), requestAnimationFrame: (fn: () => void) => { frames.set(frames.size + 1, fn); return frames.size; },
  });
  exported.Direction4cHome!();
  for (let n = 0; n < 16; n++) await Promise.resolve();
  return { copy, moveHero: (top: number) => { heroTop = top; }, advanceFrame: () => { const entry = [...frames.entries()].at(-1); if (entry) { frames.delete(entry[0]); entry[1](); } }, attach, world, root, video, videoEvents, frames, resolveAttach, cleanup, media, preference, mobile, resize, button, buttonEvents, documentEvents, pageDocument, flush: async () => { for (let n = 0; n < 16; n++) await Promise.resolve(); } };
}
it('keeps the scene when footage fails: the source is dropped, nothing goes static and the flock still arrives', async () => {
  const { attach, world, root, video, videoEvents, resolveAttach, cleanup, flush } = await controllerFixture();
  expect(attach).toHaveBeenCalledOnce();
  videoEvents.get('error')!();
  expect(root.dataset.static).toBeUndefined();
  expect(root.dataset.videoReady).toBeUndefined();
  expect(video.removeAttribute).toHaveBeenCalledWith('src');
  resolveAttach();
  await flush();
  expect(root.dataset.ready).toBe('true');
  expect(world.dispose).not.toHaveBeenCalled();
  expect(video.currentTime).toBe(0);
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


it('keeps playback paused across a breakpoint change until explicitly resumed', async () => {
  const f = await controllerFixture(); f.resolveAttach(); await f.flush();
  f.buttonEvents.get('click')!(); expect(f.video.paused).toBe(true);
  const plays = f.video.play.mock.calls.length;
  f.mobile.matches = true; f.resize(); await f.flush();
  expect(f.video.play).toHaveBeenCalledTimes(plays);
  expect(f.root.dataset.videoReady).toBe('true');
  expect(f.attach).toHaveBeenCalledTimes(1);
  expect(f.world.dispose).not.toHaveBeenCalled();
  f.buttonEvents.get('click')!(); await f.flush();
  expect(f.video.play.mock.calls.length).toBeGreaterThan(plays);
  expect(f.root.dataset.videoReady).toBe('true'); f.cleanup();
});
it('preserves buffered video on stalled and restores waiting without a playing event', async () => {
  const f = await controllerFixture(); f.resolveAttach(); await f.flush();
  f.videoEvents.get('stalled')!();
  expect(f.root.dataset.videoReady).toBe('true'); expect(f.root.dataset.ready).toBe('true');
  f.videoEvents.get('waiting')!(); expect(f.root.dataset.videoReady).toBeUndefined();
  await f.flush();
  expect(f.root.dataset.videoReady).toBe('true'); expect(f.root.dataset.ready).toBe('true');
  f.cleanup();
});
it('defers initialization while the page is hidden and resumes on visibility', async () => {
  const f = await controllerFixture(); f.resolveAttach(); await f.flush();
  f.pageDocument.hidden = true; f.documentEvents.get('visibilitychange')!();
  const plays = f.video.play.mock.calls.length;
  f.mobile.matches = true; f.resize(); await f.flush();
  expect(f.video.play).toHaveBeenCalledTimes(plays);
  expect(f.root.dataset.static).toBeUndefined();
  f.pageDocument.hidden = false; f.documentEvents.get('visibilitychange')!(); await f.flush();
  expect(f.root.dataset.videoReady).toBe('true'); f.cleanup();
});

// Run the shipping reveal helper against a stub DOM: a decode interrupted by cleanup
// (renderer lost, reduced motion) must leave the real copy, not random letters.
async function revealFixture() {
  const { transpileModule, ModuleKind } = await import('typescript');
  const component = readFileSync('components/site/direction-4c/Direction4cHome.tsx', 'utf8');
  const snippet = component.slice(component.indexOf('function revealText('), component.indexOf('export function Direction4cHome'));
  const js = transpileModule(snippet + '\nrevealText;', { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
  const kicker = { textContent: 'evidence · why it is built this way', hasAttribute: (name: string) => name === 'data-scramble', querySelectorAll: () => [] };
  const root = { hasAttribute: () => false, querySelectorAll: (selector: string) => selector === '[data-scramble]' ? [kicker] : [] };
  const intervals = new Map<number, () => void>();
  const cleared = new Set<number>();
  const observers: Array<{ fire(): void }> = [];
  const context = {
    IntersectionObserver: class { cb: (entries: unknown[]) => void; constructor(cb: (entries: unknown[]) => void) { this.cb = cb; observers.push({ fire: () => cb([{ isIntersecting: true, target: kicker }]) }); } observe() {} unobserve() {} disconnect() {} },
    window: { setInterval: (fn: () => void) => { intervals.set(intervals.size + 1, fn); return intervals.size; } },
    clearInterval: (id: number) => cleared.add(id),
  };
  const revealText = runInNewContext(js, context);
  return { revealText: () => revealText(root) as () => void, kicker, intervals, cleared, fire: () => observers.at(-1)!.fire(), tick: (n: number) => { for (let i = 0; i < n; i++) intervals.get(intervals.size)!(); } };
}
it('restores kicker copy when a decode is interrupted and decodes cleanly on restart', async () => {
  const f = await revealFixture();
  const original = f.kicker.textContent;
  const cleanup = f.revealText();
  f.fire(); f.tick(3);
  expect(f.kicker.textContent).not.toBe(original);
  cleanup();
  expect(f.kicker.textContent).toBe(original);
  expect(f.cleared.has(1)).toBe(true);
  f.revealText(); f.fire(); f.tick(16);
  expect(f.kicker.textContent).toBe(original);
});

it('keeps the retry control accurate after renderer failure and visibility changes', async () => {
  const f = await controllerFixture(); f.resolveAttach(); await f.flush();
  f.attach.mock.calls[0][0].onFail();
  expect(f.root.dataset.static).toBe('true');
  expect(f.button.textContent).toBe('Play motion');
  f.pageDocument.hidden = true; f.documentEvents.get('visibilitychange')!();
  f.pageDocument.hidden = false; f.documentEvents.get('visibilitychange')!();
  expect(f.button.textContent).toBe('Play motion');
  expect(f.button.setAttribute).toHaveBeenLastCalledWith('aria-pressed', 'true');
  f.cleanup();
});

it('finishes visible desktop copy fades and freezes them through paused scrolling', async () => {
  const f = await controllerFixture(); f.resolveAttach(); await f.flush();
  f.moveHero(-1300); f.advanceFrame();
  expect(Number(f.copy.msgRef.style.opacity)).toBeGreaterThan(0);
  expect(Number(f.copy.msgRef.style.opacity)).toBeLessThan(1);
  f.buttonEvents.get('click')!();
  expect(f.copy.msgRef.style.opacity).toBe('1.000');
  const frozen = JSON.stringify(f.copy);
  for (const top of [0, -700, -1500, -1800]) {
    f.moveHero(top); f.advanceFrame();
    expect(JSON.stringify(f.copy)).toBe(frozen);
  }
  f.buttonEvents.get('click')!(); f.moveHero(0); f.advanceFrame();
  expect(f.copy.msgRef.style.opacity).toBe('0.000');
  f.cleanup();
});

it('keeps phone useful-work copy fully readable at intermediate hero stops', async () => {
  const f = await controllerFixture(); f.mobile.matches = true;
  f.resolveAttach(); await f.flush();
  for (const progress of [.64, .67, .70, .76, .82, .95]) {
    f.moveHero(-1760 * progress); f.advanceFrame();
    expect(f.copy.msgRef.style.opacity).toBe('1.000');
    expect(f.copy.msgRef.style.visibility).toBe('visible');
  }
  f.moveHero(-1760 * .5); f.advanceFrame();
  expect(f.copy.msgRef.style.visibility).toBe('hidden');
  f.cleanup();
});

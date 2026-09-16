import { describe, expect, it } from 'vitest';
import {
  DO_PWA_CACHE_PREFIX,
  DO_SW_VERSION,
  doServiceWorkerSource,
  isDoPwaScope,
} from '@/lib/do/do-service-worker';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DO PWA', () => {
  it('scopes the worker to /do/ and never claims root scope', () => {
    expect(isDoPwaScope('https://www.assembl.co.nz/do/')).toBe(true);
    expect(isDoPwaScope('https://www.assembl.co.nz/do')).toBe(true);
    expect(isDoPwaScope('https://www.assembl.co.nz/')).toBe(false);
    expect(isDoPwaScope('https://www.assembl.co.nz/customers/aironaut/')).toBe(false);
    expect(DO_PWA_CACHE_PREFIX).toBe('do-pwa-');
    expect(DO_SW_VERSION).toMatch(/^do-v/);
  });

  it('emits a network-first worker that skips auth and API', () => {
    const src = doServiceWorkerSource();
    expect(src).toContain("SCOPE_PATH = '/do'");
    expect(src).toContain('/api/');
    expect(src).toContain('/auth/');
    expect(src).toContain('/login');
    expect(src).toContain('Ready when you reconnect');
    expect(src).toContain('#240B21');
    expect(src).toContain('#FFFDFB');
    expect(src.toLowerCase()).toContain('#d6a5bd80');
    expect(src.toLowerCase()).toContain('#916a70');
  });

  it('locks the public DO manifest for installability', () => {
    const raw = readFileSync(join(process.cwd(), 'public/do/manifest.webmanifest'), 'utf8');
    const manifest = JSON.parse(raw) as {
      name: string;
      short_name: string;
      start_url: string;
      scope: string;
      display: string;
      theme_color: string;
      background_color: string;
      icons: { purpose: string; sizes: string }[];
      shortcuts: { url: string }[];
    };
    expect(manifest.name).toBe('DO by assembl');
    expect(manifest.short_name).toBe('DO');
    expect(manifest.start_url).toBe('/do');
    expect(manifest.scope).toBe('/do');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color.toLowerCase()).toBe('#240b21');
    expect(manifest.background_color.toLowerCase()).toBe('#fffdfb');
    expect(manifest.icons.some((i) => i.purpose === 'any' && i.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512')).toBe(true);
    const urls = manifest.shortcuts.map((s) => s.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        '/do/meetings?phone=1',
        '/do/household',
        '/do/office',
        '/do/builder',
        '/do/connections',
      ]),
    );
  });
});

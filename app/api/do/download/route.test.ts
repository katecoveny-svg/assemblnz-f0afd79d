import { describe, expect, it } from 'vitest';
import { Script } from 'node:vm';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { EXTENSION_FILES, GET } from './route';
import { doWidgetScript } from '@/apps/do/shared/distribution';

const EXTENSION_DIR = path.join(process.cwd(), 'apps/do/extension');

describe('DO downloadable product', () => {
  it('packages a working extension with D-mark icons, side panel and valid JS', async () => {
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/download?format=extension'));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/zip');
    expect(response.headers.get('Content-Disposition')).toContain('assembl-do-extension-1.5.2.zip');
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const manifest = JSON.parse(await zip.file('manifest.json')!.async('string'));
    expect(manifest.version).toBe('1.5.2');
    expect(manifest.action.default_icon['16']).toBe('icons/icon16.png');
    expect(manifest.action.default_icon['32']).toBe('icons/icon32.png');
    expect(manifest.action.default_icon['48']).toBe('icons/icon48.png');
    expect(manifest.icons['128']).toBe('icons/icon128.png');
    expect(manifest.permissions).toEqual(
      expect.arrayContaining(['activeTab', 'scripting', 'sidePanel', 'storage', 'tabs']),
    );
    expect(manifest.side_panel.default_path).toBe('sidepanel.html');
    expect(manifest.background.service_worker).toBe('background.js');
    expect(manifest.content_scripts?.[0]?.js).toEqual(['selection-badge.js']);
    for (const name of [
      'background.js',
      'sidepanel.js',
      'floating.js',
      'selection-badge.js',
      'popup.js',
      'sidepanel.html',
      'sidepanel.css',
      'icons/icon16.png',
      'icons/icon32.png',
      'icons/icon48.png',
      'icons/icon128.png',
      'README.md',
    ]) {
      expect(zip.file(name), name).toBeTruthy();
    }
    for (const name of ['background.js', 'sidepanel.js', 'floating.js', 'selection-badge.js', 'popup.js']) {
      const source = await zip.file(name)!.async('string');
      expect(source.includes("'use strict'"), `${name} must quote use strict`).toBe(true);
      expect(() => new Script(source), name).not.toThrow();
    }
    const panel = await zip.file('sidepanel.js')!.async('string');
    expect(panel).toContain('event.origin !== apiOrigin');
    expect(panel).toContain("captureButton.addEventListener('click'");
    expect(panel).toContain('format=mac');
    expect(panel).not.toContain('/api/do/prepare');
    const script = await zip.file('popup.js')!.async('string');
    expect(script).toContain("credentials: 'omit'");
    expect(script).not.toContain('OPENAI_API_KEY');
  });

  it('packages Mac companion source for format=mac and format=macos', async () => {
    for (const format of ['mac', 'macos', 'mac-companion'] as const) {
      const response = await GET(
        new Request(`https://www.assembl.co.nz/api/do/download?format=${format}`),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Disposition')).toContain('DO-mac-companion.zip');
      const zip = await JSZip.loadAsync(await response.arrayBuffer());
      expect(zip.file('macos/DOCompanion.swift')).toBeTruthy();
      expect(zip.file('macos/build.sh')).toBeTruthy();
      expect(zip.file('macos/package.sh')).toBeTruthy();
      const readme = await zip.file('README.md')!.async('string');
      expect(readme).toMatch(/no notarised public Mac installer/i);
      expect(readme).toContain('./build.sh');
    }
  });

  it('packages a website launcher that requires user-triggered preparation in its iframe', async () => {
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/download?format=embed'));
    expect(response.status).toBe(200);
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const script = await zip.file('do-widget.js')!.async('string');
    expect(() => new Script(script)).not.toThrow();
    expect(script).toContain('/do/widget');
    expect(script).not.toContain('/api/do/prepare');
    expect(script).not.toContain('document.body.innerText');
    expect(zip.file('example.html')).toBeTruthy();
  });

  it('keeps an origin value inside a JavaScript string', () => {
    expect(() => new Script(doWidgetScript('https://example.nz/";throw new Error("x")//'))).not.toThrow();
  });

  it('does not allow arbitrary file paths as a download format', async () => {
    expect((await GET(new Request('https://www.assembl.co.nz/api/do/download?format=../../.env'))).status).toBe(400);
  });
});

describe('extension JS package hygiene', () => {
  it('every packaged extension .js quotes use strict and parses', () => {
    const jsFiles = EXTENSION_FILES.filter((name) => name.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(3);
    for (const name of jsFiles) {
      const source = readFileSync(path.join(EXTENSION_DIR, name), 'utf8');
      expect(source.includes("'use strict'") || source.includes('"use strict"'), name).toBe(true);
      expect(() => new Script(source), name).not.toThrow();
    }
  });

  it('manifest declares toolbar default_icon sizes Chrome needs', () => {
    const manifest = JSON.parse(readFileSync(path.join(EXTENSION_DIR, 'manifest.json'), 'utf8'));
    expect(manifest.action.default_icon).toMatchObject({
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
    });
  });
});

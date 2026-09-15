import { describe, expect, it } from 'vitest';
import { Script } from 'node:vm';
import JSZip from 'jszip';
import { GET } from './route';
import { doWidgetScript } from '@/apps/do/shared/distribution';

describe('DO downloadable product', () => {
  it('packages a working least-permission extension with no background capture or model key', async () => {
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/download?format=extension'));
    expect(response.status).toBe(200); expect(response.headers.get('Content-Type')).toBe('application/zip');
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const manifest = JSON.parse(await zip.file('manifest.json')!.async('string'));
    expect(manifest.permissions).toEqual(['activeTab', 'scripting', 'sidePanel']);
    expect(manifest.host_permissions).toEqual(['https://www.assembl.co.nz/*']);
    expect(manifest.content_scripts).toBeUndefined();
    expect(manifest.side_panel.default_path).toBe('sidepanel.html');
    expect(manifest.action.default_popup).toBeUndefined();
    expect(manifest.background.service_worker).toBe('background.js');
    const worker = await zip.file('background.js')!.async('string');
    const panel = await zip.file('sidepanel.js')!.async('string');
    expect(() => new Script(worker)).not.toThrow(); expect(() => new Script(panel)).not.toThrow();
    expect(worker).not.toContain('executeScript'); expect(worker).not.toContain('fetch(');
    expect(panel).toContain("event.origin !== origin");
    expect(panel).toContain("captureButton.addEventListener('click'");
    expect(panel).not.toContain('/api/do/prepare');
    expect(zip.file('sidepanel.html')).toBeTruthy(); expect(zip.file('sidepanel.css')).toBeTruthy();
    const script = await zip.file('popup.js')!.async('string');
    expect(() => new Script(script)).not.toThrow();
    expect(script).toContain("credentials: 'omit'"); expect(script).toContain('consent.checked');
    expect(script).not.toContain('OPENAI_API_KEY'); expect(script).not.toContain('ANTHROPIC_API_KEY');
    expect(zip.file('popup.html')).toBeTruthy(); expect(zip.file('popup.css')).toBeTruthy(); expect(zip.file('README.md')).toBeTruthy();
  });
  it('packages a website launcher that requires user-triggered preparation in its iframe', async () => {
    const response = await GET(new Request('https://www.assembl.co.nz/api/do/download?format=embed'));
    expect(response.status).toBe(200);
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const script = await zip.file('do-widget.js')!.async('string');
    expect(() => new Script(script)).not.toThrow();
    expect(script).toContain('/do/widget'); expect(script).not.toContain('/api/do/prepare');
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

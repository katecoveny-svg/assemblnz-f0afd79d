import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';

const read = (path: string) => readFileSync(path);
const text = (path: string) => read(path).toString('utf8');
const mark = read('brand/assembl-identity/mark.svg');
const sizes = [16, 32, 48, 180, 192, 512];

describe('assembl lowercase browser identity', () => {
  it('keeps the reviewed lowercase Instrument Sans outlines, not a system-font substitute', () => {
    // Real lowercase glyph contours from the official 500 TTF. A capital letter
    // cannot pass merely by changing an accessible label on a different path.
    const outlines = [
      ['mark', 'a', 'b5b4e4ad4581252e9e77b6ab5ce7794a1ac647ab74b56c47ba11b191430e3094'],
      ['wordmark', 'assembl', 'fc87b569a7831f67c3afb0de390b54201d92bbddc372cb15276df2a45f73d18b'],
    ];
    for (const [file, label, hash] of outlines) {
      const source = text(`brand/assembl-identity/${file}.svg`);
      expect(source).toContain(`data-text="${label}"`);
      expect(source).toContain('data-font="Instrument Sans" data-weight="500"');
      expect(source).not.toMatch(/<text\b|font-family=|href=/);
      expect(source).toContain('fill="#FFFDFB"');
      expect(source).toContain('fill="#240B21"');
      const contour = source.match(/<path d="([^"]+)"/)![1];
      expect(createHash('sha256').update(contour).digest('hex')).toBe(hash);
    }
    expect(text('brand/assembl-identity/OFL.txt')).toContain('Copyright 2022 The Instrument Sans Project Authors');
    expect(text('brand/assembl-identity/OFL.txt')).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });

  it.each(sizes)('serves the canonical mark at %ipx with an opaque paper background', async (size) => {
    const png = read(`public/icons/assembl-icon-${size}x${size}.png`);
    expect(await sharp(png).metadata()).toMatchObject({ width: size, height: size, format: 'png' });
    const expected = await sharp(mark, { density: 576 }).resize(size, size).png().toBuffer();
    expect(png.equals(expected)).toBe(true);
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect([...data.subarray(0, 4)]).toEqual([255, 253, 251, 255]);
    for (let i = 3; i < data.length; i += info.channels) expect(data[i]).toBe(255);
  });

  it('keeps the maskable mark inside the central 80% safe circle', async () => {
    const { data, info } = await sharp(read('public/icons/assembl-icon-512x512.png'))
      .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let outsideInk = 0;
    let plumPixels = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const at = (y * info.width + x) * info.channels;
        const rgb = [data[at], data[at + 1], data[at + 2]];
        if (rgb.join(',') === '36,11,33') plumPixels++;
        if (Math.hypot(x + 0.5 - 256, y + 0.5 - 256) > 204.8 && rgb.join(',') !== '255,253,251') outsideInk++;
      }
    }
    expect(plumPixels).toBeGreaterThan(10000);
    expect(outsideInk).toBe(0);
  });

  it('keeps Next file-convention icons and every ICO frame in sync', () => {
    expect(read('app/icon.png').equals(read('public/icons/assembl-icon-32x32.png'))).toBe(true);
    expect(read('app/apple-icon.png').equals(read('public/icons/assembl-icon-180x180.png'))).toBe(true);
    const ico = read('public/icons/favicon.ico');
    expect(read('app/favicon.ico').equals(ico)).toBe(true);
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    for (const [index, size] of [16, 32, 48].entries()) {
      const at = 6 + index * 16;
      expect([ico[at], ico[at + 1]]).toEqual([size, size]);
      const bytes = ico.readUInt32LE(at + 8);
      const offset = ico.readUInt32LE(at + 12);
      expect(ico.subarray(offset, offset + bytes).equals(read(`public/icons/assembl-icon-${size}x${size}.png`))).toBe(true);
    }
  });

  it('maps root metadata and the PWA to this asset family', () => {
    const layout = text('app/layout.tsx');
    for (const size of [32, 192, 512]) expect(layout).toContain(`/icons/assembl-icon-${size}x${size}.png`);
    expect(layout).toContain("apple: '/icons/assembl-icon-180x180.png'");
    expect(layout).toContain("shortcut: '/icons/favicon.ico'");
    expect(layout).toContain("manifest: '/manifest.webmanifest'");
    const manifest = JSON.parse(text('public/manifest.webmanifest'));
    expect([manifest.name, manifest.short_name]).toEqual(['assembl', 'assembl']);
    expect([manifest.theme_color, manifest.background_color]).toEqual(['#240B21', '#FFFDFB']);
    expect(manifest.icons.map((icon: { src: string }) => icon.src)).toEqual([
      '/icons/assembl-icon-192x192.png', '/icons/assembl-icon-512x512.png',
    ]);
  });

  it('keeps the downloadable press wordmark on the same real font and palette', async () => {
    const png = read('public/img/press/assembl-wordmark.png');
    const expected = await sharp(read('brand/assembl-identity/wordmark.svg')).png().toBuffer();
    expect(png.equals(expected)).toBe(true);
    expect(await sharp(png).metadata()).toMatchObject({ width: 1200, height: 600 });
    expect(text('app/press/page.tsx')).toContain('/img/press/assembl-wordmark.png');
  });

  it('renders the shared wordmark lowercase, upright and medium, with a sans fallback', () => {
    const html = renderToStaticMarkup(createElement(AssemblWordmark, {
      className: 'proof-wordmark', style: { color: '#240B21', letterSpacing: '-0.04em' },
    }));
    expect(html).toContain('>assembl</span>');
    expect(html).toContain('Instrument Sans');
    expect(html).toContain('system-ui, sans-serif');
    expect(html).toContain('font-weight:500');
    expect(html).toContain('font-style:normal');
    expect(html).toContain('proof-wordmark');
    expect(html).toContain('letter-spacing:-0.04em');
    expect(html).not.toMatch(/Cormorant|Georgia|font-variation-settings|font-semibold/);
  });
});

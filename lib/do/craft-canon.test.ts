import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DO_CRAFT,
  DO_CRAFT_GUARD_PATHS,
  DO_PUBLIC_COPY_GUARD_PATHS,
  DO_WORK_COLUMN_LABEL,
} from '@/lib/do/craft-canon';

const root = process.cwd();

function* walk(path: string): Generator<string> {
  const st = statSync(path, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) {
    if (/\.(ts|tsx|css|js|html|mjs)$/.test(path)) yield path;
    return;
  }
  for (const entry of readdirSync(path)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    yield* walk(join(path, entry));
  }
}

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

describe('DO Spatial C craft canon', () => {
  it('locks craft CSS to plum stage, paper cards, rose accent, Instrument Sans', () => {
    const css = read('app/do/do-craft.css');
    expect(css).toMatch(/--do-stage:\s*#240b21/i);
    expect(css).toMatch(/--do-paper:\s*#fffdfb/i);
    expect(css).toMatch(/--do-rose:\s*#916a70/i);
    expect(css).toMatch(/--do-rose-glow:\s*#d6a5bd/i);
    expect(css).toMatch(/--do-rose-highlight:\s*#c995a8/i);
    expect(css).toMatch(/Instrument Sans/);
    expect(css).toMatch(/IBM Plex Mono/);
    expect(css).toMatch(/\.do-cta\b/);
    expect(css).toMatch(/\.do-cta--secondary/);
    expect(css).toMatch(/\.do-work-board/);
    expect(css).not.toMatch(/Arial/i);
    expect(css.toLowerCase()).not.toContain('#9b6f94');
    expect(css.toLowerCase()).not.toContain('#ecbddd');
    for (const hex of DO_CRAFT.bannedPurpleHex) {
      expect(css.toLowerCase()).not.toContain(hex.toLowerCase());
    }
    for (const hex of DO_CRAFT.bannedGreenHex) {
      expect(css.toLowerCase()).not.toContain(hex.toLowerCase());
    }
  });

  it('exports Spatial C tokens and work-board labels', () => {
    expect(DO_CRAFT.stage).toBe('#240B21');
    expect(DO_CRAFT.rose).toBe('#916A70');
    expect(DO_CRAFT.roseGlow).toBe('#D6A5BD');
    expect(DO_CRAFT.roseHighlight).toBe('#C995A8');
    expect(DO_CRAFT.roseBloom).toBe('#E8B6C4');
    expect(DO_CRAFT.orb.glow).toBe(66);
    expect(DO_CRAFT.orb.extension).toBe(36);
    expect(DO_CRAFT.orb.meeting).toBe(64);
    expect(DO_WORK_COLUMN_LABEL.needsYou).toBe('Needs you');
    expect(DO_WORK_COLUMN_LABEL.working).toBe('Working');
    expect(DO_WORK_COLUMN_LABEL.done).toBe('Done');
    expect(DO_CRAFT.bannedPurpleHex).toEqual(
      expect.arrayContaining(['#9b6f94', '#ecbddd', '#b479c3']),
    );
    expect(DO_CRAFT.bannedGreenHex).toEqual(
      expect.arrayContaining(['#3f7373', '#2dd4a8', '#2e7d32']),
    );
  });

  it('bans purple-leak hex, green accents and chatbot Chat CTA on DO portable surfaces', () => {
    const files: string[] = [];
    for (const rel of DO_CRAFT_GUARD_PATHS) {
      for (const file of walk(join(root, rel))) files.push(file);
    }
    expect(files.length).toBeGreaterThan(10);

    for (const file of files) {
      // Canon + guard assert the banned list itself — skip.
      if (file.endsWith('craft-canon.ts') || file.endsWith('craft-canon.test.ts')) continue;
      const text = readFileSync(file, 'utf8');
      // Strip block comments so doc lines naming banned hexes do not false-positive.
      const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const hex of DO_CRAFT.bannedPurpleHex) {
        expect(code.toLowerCase(), `${file} contains banned ${hex}`).not.toContain(
          hex.toLowerCase(),
        );
      }
      for (const hex of DO_CRAFT.bannedGreenHex) {
        expect(code.toLowerCase(), `${file} contains banned green ${hex}`).not.toContain(
          hex.toLowerCase(),
        );
      }
      for (const re of DO_CRAFT.bannedCopy) {
        expect(code, `${file} matches ${re}`).not.toMatch(re);
      }
      // Extension / portable CSS must not fall back to Arial as primary.
      if (file.endsWith('.css') || file.endsWith('floating.js') || file.endsWith('distribution.ts')) {
        expect(code, `${file} uses Arial`).not.toMatch(/font[^;{]*Arial/i);
      }
    }
  });

  it('keeps public DO UI free of vendor/env theatre and green stage type', () => {
    for (const relative of DO_PUBLIC_COPY_GUARD_PATHS) {
      const source = read(relative);
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const re of DO_CRAFT.bannedCopy) {
        expect(code, `${relative} matches ${re}`).not.toMatch(re);
      }
      expect(code).not.toMatch(/Deepgram nova/i);
      expect(code).not.toMatch(/Whisper-class/i);
      expect(code).not.toMatch(/Smart notes/i);
    }

    const homeCss = read('app/do/do-home.module.css');
    expect(homeCss).toMatch(/--plum:\s*#240b21/i);
    expect(homeCss).toMatch(/--paper:\s*#fffdfb/i);
    expect(homeCss).toMatch(/--rose:\s*#916a70/i);
    // Hero display type must be paper on plum — never muted (olive-on-plum fail).
    expect(homeCss).toMatch(/\.heroCopy h1[\s\S]*?color:\s*var\(--paper\)/);
    for (const hex of DO_CRAFT.bannedGreenHex) {
      expect(homeCss.toLowerCase()).not.toContain(hex.toLowerCase());
    }

    const companionCss = read('components/site/assembl-the-work/assembl-spatial.css');
    expect(companionCss).toMatch(/\.atw-companion-copy h2[\s\S]*?color:\s*#fffdfb/);
  });

  it('keeps Glow as the single web launcher (DoFloatingWidget is a thin wrapper)', () => {
    const floating = read('app/do/DoFloatingWidget.tsx');
    expect(floating).toMatch(/GlowDoWidget/);
    expect(floating).toMatch(/Spatial C|single launcher|thin wrapper/i);
  });
});

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import assets from './assets/customer-fonts.json';
import contracts from './customer-font-contracts.json';
import googleParity from './assets/noncanonical-google-parity.json';
import { preserveSingleFontStyle } from './local-font-metadata';

const root = resolve(import.meta.dirname, '../..');
const assetRoot = resolve(import.meta.dirname, 'assets');
type Font = { familyName: string; italicAngle: number; variationAxes: Record<string, { min: number; max: number }>; 'OS/2': { usWeightClass: number }; hasGlyphForCodePoint: (code: number) => boolean };
const fontFromBuffer = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default as (buffer: Buffer) => Font;
// Cormorant's variable source retains its legacy default-instance family name.
const embeddedFamilies: Record<string, string> = { 'Cormorant Garamond': 'Cormorant Garamond Light', Montserrat: 'Montserrat Thin', 'DM Sans': 'DM Sans 9pt' };
const embeddedFamily = (family: string) => embeddedFamilies[family] ?? family;
const expectedFamily = (file: string, family: string) => {
  const asset = assets.find(asset => asset.file === basename(file));
  return asset && 'embeddedFamily' in asset ? asset.embeddedFamily : embeddedFamily(family);
};

describe('licensed customer fonts without a Google build-time request', () => {
  it('preserves client directives before imports in every migrated module', () => {
    const clientFiles = new Set(['components/ops/toa/DrawingsToLife.tsx']);
    for (const file of new Set(contracts.map(contract => contract.file))) {
      const source = ts.createSourceFile(file, readFileSync(resolve(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const index = source.statements.findIndex(node => ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client');
      if (clientFiles.has(file) || index >= 0) expect(index, file).toBe(0);
    }
  });

  for (const asset of assets) {
    it(`keeps ${asset.family} ${asset.style}, its weight axis and Māori coverage`, () => {
      const bytes = readFileSync(resolve(assetRoot, asset.file));
      if (asset.file.endsWith('.woff2')) expect(bytes.toString('ascii', 0, 4)).toBe('wOF2');
      else expect(bytes.readUInt32BE(0)).toBe(0x00010000);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
      expect(readFileSync(resolve(assetRoot, asset.license), 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1');
      const font = fontFromBuffer(bytes);
      expect(font.familyName).toBe(expectedFamily(asset.file, asset.family));
      expect(font.italicAngle !== 0).toBe(asset.style === 'italic');
      if (asset.weightRange[0] === asset.weightRange[1]) {
        expect(Object.keys(font.variationAxes)).toEqual([]);
        expect(font['OS/2'].usWeightClass).toBe(asset.weightRange[0]);
      } else {
        expect(Object.keys(font.variationAxes)).toEqual(['wght']);
        expect([font.variationAxes.wght.min, font.variationAxes.wght.max]).toEqual(asset.weightRange);
      }
      // Preserve Google-served Lato/Orbitron's existing fallback for absent macrons.
      const missing: string[] = 'missingMacrons' in asset ? (asset.missingMacrons ?? []) : [];
      expect(missing).toEqual(['Lato', 'Orbitron'].includes(asset.family) ? [...'ĀāĒēĪīŌōŪū'] : []);
      for (const char of 'ĀāĒēĪīŌōŪū') expect(font.hasGlyphForCodePoint(char.codePointAt(0)!)).toBe(!missing.includes(char));
      if ('originalBinary' in asset && asset.originalBinary) expect(asset.sha256).toBe(asset.sourceSha256);
    });
  }

  for (const contract of contracts) {
    it(`preserves the existing ${contract.file} ${contract.name} typography contract`, () => {
      const text = readFileSync(resolve(root, contract.file), 'utf8');
      const source = ts.createSourceFile(contract.file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let options: ts.ObjectLiteralExpression | undefined;
      const visit = (node: ts.Node) => {
        if (ts.isVariableDeclaration(node) && node.name.getText(source) === ('sourceName' in contract ? contract.sourceName : contract.name) && node.initializer && ts.isCallExpression(node.initializer)) {
          expect(node.initializer.expression.getText(source)).toBe('localFont');
          const arg = node.initializer.arguments[0];
          if (ts.isObjectLiteralExpression(arg)) options = arg;
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      expect(options).toBeDefined();
      const property = (object: ts.ObjectLiteralExpression, name: string) => object.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === name) as ts.PropertyAssignment | undefined;
      const literal = (node: ts.Node | undefined) => node && ts.isStringLiteral(node) ? node.text : undefined;
      expect(literal(property(options!, 'variable')?.initializer) ?? null).toBe(contract.variable);
      expect(literal(property(options!, 'display')?.initializer)).toBe('swap');
      expect(property(options!, 'adjustFontFallback')?.initializer.kind).toBe(ts.SyntaxKind.FalseKeyword);
      const sourceOption = property(options!, 'src')!.initializer;
      if (ts.isStringLiteral(sourceOption)) {
        const font = fontFromBuffer(readFileSync(resolve(root, contract.file, '..', sourceOption.text)));
        expect(font.familyName).toBe(expectedFamily(sourceOption.text, contract.family));
        const expectedWeight = contract.weights.length === 1 ? contract.weights[0] : `${contract.weights[0]} ${contract.weights.at(-1)}`;
        expect(literal(property(options!, 'weight')?.initializer)).toBe(expectedWeight);
        expect(contract.styles).toHaveLength(1);
        expect(literal(property(options!, 'style')?.initializer)).toBe(contract.styles[0]);
        return;
      }
      const src = sourceOption as ts.ArrayLiteralExpression;
      const faces = src.elements.map(element => {
        const face = element as ts.ObjectLiteralExpression;
        const path = literal(property(face, 'path')?.initializer)!;
        const font = fontFromBuffer(readFileSync(resolve(root, contract.file, '..', path)));
        expect(font.familyName).toBe(expectedFamily(path, contract.family));
        return { weight: literal(property(face, 'weight')?.initializer), style: literal(property(face, 'style')?.initializer) };
      });
      expect(faces).toEqual(contract.styles.flatMap(style => contract.weights.map(weight => ({ weight, style }))));
      if ('metadataStyle' in contract) {
        expect(text).toContain(`${contract.name} = preserveSingleFontStyle(${contract.sourceName}, '${contract.metadataStyle}')`);
      }
      for (const node of source.statements) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'next/font/google') {
          expect(contract.file).toBe('app/layout.tsx');
          expect(node.importClause?.namedBindings?.getText(source)).toBe('{ IBM_Plex_Mono, Instrument_Sans }');
        }
      }
    });
  }

  it('uses a single source for className consumers that need the original normal-style reset', () => {
    for (const file of ['components/ops/toa/ArcHeroBand.tsx', 'components/ops/toa/DrawingsToLife.tsx', 'app/demo/toa-architects/page.tsx']) {
      const text = readFileSync(resolve(root, file), 'utf8');
      expect(text).toMatch(/const cormorant = localFont\(\{\s+src: '[^']+',\s+weight: '[\d ]+',\s+style: 'normal'/);
    }
  });

  it('retains the canonical Instrument Sans/Plex Mono loaders and previous fallback metrics', () => {
    const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8');
    expect(layout).toContain('IBM_Plex_Mono, Instrument_Sans');
    expect(layout).toContain("import '@/lib/fonts/customer-fallbacks.css'");
    const get = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/google/get-fallback-font-override-metrics').getFallbackFontOverrideMetrics as (family: string) => Record<string, string>;
    const css = readFileSync(resolve(import.meta.dirname, 'customer-fallbacks.css'), 'utf8');
    for (const family of new Set(assets.map(asset => asset.family))) {
      const face = css.split('@font-face').find(face => face.includes(`'${family} Build Fallback'`))!;
      const metrics = get(family);
      expect(face).toContain(`local('${metrics.fallbackFont}')`);
      for (const key of ['ascentOverride', 'descentOverride', 'lineGapOverride', 'sizeAdjust']) expect(face).toContain(metrics[key]);
    }
  });

  it('preserves className/style metadata without inventing a multi-weight fontWeight', () => {
    const font = { className: 'font-face', variable: 'font-variable', style: { fontFamily: 'Lato, Arial' } };
    const restored = preserveSingleFontStyle(font, 'normal');
    expect(restored).toEqual({ className: 'font-face assembl-local-font-normal', variable: 'font-variable', style: { fontFamily: 'Lato, Arial', fontStyle: 'normal' } });
    expect(font.style).not.toHaveProperty('fontStyle');
    expect(restored.style).not.toHaveProperty('fontWeight');
  });

  it('retains explicit single-weight metadata when restoring an italic class', () => {
    const font = { className: 'font-face', style: { fontFamily: 'Font', fontWeight: 400 } };
    expect(preserveSingleFontStyle(font, 'italic').style).toEqual({ fontFamily: 'Font', fontWeight: 400, fontStyle: 'italic' });
  });

  it('keeps current Google-served versions and all sampled glyph advance widths', () => {
    expect(new Set(googleParity.map(face => face.family)).size).toBe(11);
    for (const face of googleParity) {
      expect(face.sourceVersion, face.family).toBe(face.googleVersion);
      expect(face.maxAdvanceDelta, `${face.family} ${face.style} ${face.weight}`).toBe(0);
      expect(face.sharedGlyphs).toBeGreaterThan(100);
    }
  });

  it('allows only the unchanged canonical Google loaders throughout production code', () => {
    for (const area of ['app', 'components', 'lib']) {
      for (const file of readdirSync(resolve(root, area), { recursive: true }).filter(file => /\.(ts|tsx)$/.test(String(file)) && !String(file).endsWith('.test.ts'))) {
        const relative = `${area}/${file}`;
        const text = readFileSync(resolve(root, relative), 'utf8');
        if (!text.includes('next/font/google')) continue;
        const source = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        for (const node of source.statements) {
          if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'next/font/google') {
            expect(relative).toBe('app/layout.tsx');
            expect(node.importClause?.namedBindings?.getText(source)).toBe('{ IBM_Plex_Mono, Instrument_Sans }');
          }
        }
      }
    }
    const source = ts.createSourceFile('layout.tsx', readFileSync(resolve(root, 'app/layout.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const expected = {
      instrumentDisplay: ["Instrument_Sans", "['400', '500', '600', '700']", "'--font-display'"],
      instrumentBody: ["Instrument_Sans", "['400', '500', '600', '700']", "'--font-body'"],
      plexMono: ["IBM_Plex_Mono", "['400', '700']", "'--font-mono'"],
    };
    const found: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && node.name.getText(source) in expected && node.initializer && ts.isCallExpression(node.initializer)) {
        const name = node.name.getText(source) as keyof typeof expected;
        const options = node.initializer.arguments[0] as ts.ObjectLiteralExpression;
        const props = Object.fromEntries(options.properties.map(property => {
          const p = property as ts.PropertyAssignment;
          return [p.name.getText(source), p.initializer.getText(source)];
        }));
        expect([node.initializer.expression.getText(source), props.weight, props.variable]).toEqual(expected[name]);
        expect(props.subsets).toBe("['latin']");
        expect(props.display).toBe("'swap'");
        expect(Object.keys(props).sort()).toEqual(['display', 'subsets', 'variable', 'weight']);
        found.push(name);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(found.sort()).toEqual(Object.keys(expected).sort());
  });
});

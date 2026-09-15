import { describe, expect, it } from 'vitest';
import {
  scanClearWriting,
  applyClearSuggestions,
  compileAgent,
  getSurface,
} from './index';

describe('DO Clear writing', () => {
  it('flags AI-slop and basic grammar', () => {
    const text =
      'We will unlock next-generation value and seamlessly leverage our robust AI-powered landscape. Its important to note that we could of delivered this alot sooner.';
    const issues = scanClearWriting(text);
    expect(issues.some((i) => i.kind === 'slop' && /unlock/i.test(i.match))).toBe(true);
    expect(issues.some((i) => i.kind === 'slop' && /seamless/i.test(i.match))).toBe(true);
    expect(issues.some((i) => i.kind === 'grammar')).toBe(true);
    const { rewritten, applied, honesty } = applyClearSuggestions(text, issues);
    expect(applied).toBeGreaterThan(0);
    expect(rewritten.toLowerCase()).not.toContain('unlock');
    expect(honesty).toMatch(/DEMO/);
  });

  it('ships clear-writing-watch template', () => {
    const { spec } = compileAgent({ brief: '', templateId: 'clear-writing-watch' });
    expect(spec.primitive).toBe('watch');
    expect(spec.name).toMatch(/clear/i);
  });
});

describe('DO share + WhatsApp surfaces', () => {
  it('share adapter compiles shared text', () => {
    const adapter = getSurface('share');
    expect(adapter?.status).toBe('demo');
    const msg = adapter!.ingest({
      title: 'Quotes',
      text: 'compare these quotes',
      url: 'https://example.co.nz/q',
      templateId: 'quote-compare',
    });
    expect('stub' in msg).toBe(false);
    if (!('stub' in msg)) {
      expect(msg.surface).toBe('share');
      expect(msg.intent.brief).toMatch(/compare/i);
    }
  });

  it('whatsapp DEMO fixture sim returns a message', () => {
    const adapter = getSurface('whatsapp');
    const stubbed = adapter!.ingest({});
    expect('stub' in stubbed).toBe(true);
    const demo = adapter!.ingest({ demo: true });
    expect('stub' in demo).toBe(false);
    if (!('stub' in demo)) {
      expect(demo.surface).toBe('whatsapp');
      expect(demo.intent.templateId).toBe('power-price-watch');
    }
  });
});

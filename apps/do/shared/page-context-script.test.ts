import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { PAGE_CONTEXT_READER } from './page-context-script';

// Reader tests exercise excluded/hidden text and selected range boundaries with DOM-shaped fixtures.
function setup() {
  const rect = { left: 10, top: 10, right: 210, bottom: 50, width: 200, height: 40 };
  const body: any = { tagName: 'BODY' };
  const node = (tag: string, parent: any = null, attrs: Record<string, string> = {}): any => ({
    tagName: tag, nodeType: 1, parentElement: parent, attrs, nodes: [], rect, css: { opacity: '1' },
    closest(selector: string): any {
      const tags = selector.split(',').filter(s => !s.startsWith('['));
      if (tags.includes(tag.toLowerCase()) || Object.keys(attrs).some(k => selector.includes(`[${k}]`) || selector.includes(`[${k}="${attrs[k]}"]`))) return this;
      return parent?.closest(selector) || null;
    },
    getBoundingClientRect() { return this.rect; }, getAttribute(k: string) { return attrs[k] || null; },
  });
  const p = node('P');
  const text = (value: string, parent = p): any => ({ textContent: value, parentElement: parent, nodeType: 3, rect });
  let chosen: any = null;
  const doc: any = { body, documentElement: {}, activeElement: null, title: 'A page', querySelectorAll: () => [],
    createTreeWalker: (el: any) => { let i = 0; return { nextNode: () => el.nodes[i++] }; },
    createRange: () => { let selected: any; return { selectNodeContents: (n: any) => { selected = n; }, getClientRects: () => [selected.rect] }; },
  };
  const reader = runInNewContext(PAGE_CONTEXT_READER, {
    document: doc, window: { getSelection: () => chosen }, location: { origin: 'https://example.nz', pathname: '/page' },
    innerWidth: 800, innerHeight: 600, NodeFilter: { SHOW_TEXT: 4 }, getComputedStyle: (e: any) => e.css,
    fetch: vi.fn(() => { throw new Error('Reader must never use the network'); }),
  });
  return { reader, p, node, text, doc, select: (range: any) => { chosen = { rangeCount: 1, getRangeAt: () => range }; } };
}
describe('explicit page context reader', () => {
  it('excludes form fields, editable/private nodes, hidden content, scripts and offscreen text', () => {
    const s = setup();
    s.p.nodes = [s.text('Visible paragraph')];
    for (const [tag, attrs] of [['INPUT', {}], ['TEXTAREA', {}], ['DIV', { contenteditable: '' }], ['DIV', { 'data-do-private': '' }], ['SPAN', { 'aria-hidden': 'true' }], ['SCRIPT', {}]] as const) s.p.nodes.push(s.text('must be excluded', s.node(tag, s.p, attrs)));
    const transparent = s.node('SPAN', s.p); transparent.css.opacity = '0'; s.p.nodes.push(s.text('invisible', transparent));
    const offscreen = s.text('offscreen'); offscreen.rect = { ...offscreen.rect, top: 700, bottom: 740 }; s.p.nodes.push(offscreen);
    expect(s.reader.read(s.p)).toEqual({ text: 'Visible paragraph', title: 'A page', url: 'https://example.nz/page' });
  });
  it('uses image alt text without claiming to see pixels, and refuses canvas or iframe targets', () => {
    const s = setup(); expect(s.reader.read(s.node('IMG', null, { alt: 'A customer journey' })).text).toBe('Image description (not an image analysis): A customer journey');
    expect(s.reader.read(s.node('IMG'))).toBeNull(); expect(s.reader.candidate(s.node('CANVAS'))).toBeNull(); expect(s.reader.candidate(s.node('IFRAME'))).toBeNull();
  });
  it('bounds page text and ignores hidden ancestors', () => {
    const s = setup(); s.p.nodes = [s.text('x'.repeat(20000))]; expect(s.reader.read(s.p).text).toHaveLength(12000);
    const parent = s.node('DIV'); parent.css.display = 'none'; s.p.parentElement = parent; expect(s.reader.read(s.p)).toBeNull();
  });
  it('captures only the chosen part of a text node', () => {
    const s = setup(), t = s.text('before CHOSEN after'); s.p.nodes = [t];
    s.select({ commonAncestorContainer: t, startContainer: t, startOffset: 7, endContainer: t, endOffset: 13, intersectsNode: () => true });
    expect(s.reader.selection().text).toBe('CHOSEN');
  });
  it('refuses selections touching forms/private regions even if ordinary text is also selected', () => {
    const s = setup(), t = s.text('Public text'); s.p.nodes = [t];
    s.select({ commonAncestorContainer: s.p, intersectsNode: () => true }); s.doc.querySelectorAll = () => [s.node('INPUT')];
    expect(s.reader.selection()).toBeNull(); s.doc.querySelectorAll = () => []; s.doc.activeElement = s.node('TEXTAREA'); expect(s.reader.selection()).toBeNull();
  });
});

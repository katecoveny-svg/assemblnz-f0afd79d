import { describe, expect, it } from 'vitest';
import { rawNotesFallback, sanitizeNotes } from './notes-safety';

describe('meeting note safety', () => {
  it('reconstructs allowed elements without hostile attributes', () => {
    expect(sanitizeNotes('<h2 onclick="alert(1)" style="color:red">Notes</h2><p><strong onmouseover="alert(2)">Review</strong></p>')).toBe('<h2>Notes</h2><p><strong>Review</strong></p>');
    expect(sanitizeNotes('<p><svg onload="alert(1)"><script>alert(2)</script></svg><a href="javascript:alert(3)">Open</a><img src="x" onerror="alert(4)" /></p>')).not.toMatch(/<(svg|script|img|a)\b|onload=|href=/);
  });
  it('fails closed on malformed markup and preserves encoded text', () => {
    expect(sanitizeNotes('<p onclick=x><img src=x onerror=alert(1)>')).not.toContain('<img');
    expect(sanitizeNotes('<p>&lt;script&gt; &amp; notes</p>')).toBe('<p>&lt;script&gt; &amp; notes</p>');
  });
  it('keeps raw note order and never invents template decisions', () => {
    const html = rawNotesFallback('Discuss budget.\nNo decision yet.\n<script>alert(1)</script>');
    expect(html).toContain('No decisions or actions have been inferred.');
    expect(html).toContain('Discuss budget.</p><p>No decision yet.');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('None recorded.');
  });
});

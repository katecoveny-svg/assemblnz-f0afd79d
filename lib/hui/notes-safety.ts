import { SaxesParser } from 'saxes';

export function escapeNotes(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Parse and reconstruct a tiny vocabulary. No attributes or namespaces survive.
 * Malformed HTML is presented as text, never partially trusted markup. */
export function sanitizeNotes(input: string): string {
  const allowed = new Set(['h2', 'h3', 'p', 'ul', 'li', 'strong']);
  const parser = new SaxesParser({ fragment: true });
  let output = '', failed = false;
  parser.on('opentag', tag => { if (allowed.has(tag.name)) output += `<${tag.name}>`; });
  parser.on('closetag', tag => { if (allowed.has(tag.name)) output += `</${tag.name}>`; });
  parser.on('text', text => { output += escapeNotes(text); });
  parser.on('cdata', text => { output += escapeNotes(text); });
  parser.on('error', () => { failed = true; });
  try { parser.write(input).close(); } catch { failed = true; }
  return failed ? `<p>${escapeNotes(input)}</p>` : output.trim();
}

export function rawNotesFallback(raw: string): string {
  return '<h2>Raw notes. Not structured or reviewed.</h2><p>The drafting service was unavailable. No decisions or actions have been inferred.</p>' +
    raw.split(/\r?\n/).map(line => `<p>${escapeNotes(line)}</p>`).join('');
}

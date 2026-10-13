/** Local, bounded PDF text extraction. No OCR, URL fetch, model or attachment access.
 * Pass bytes explicitly; the live Gmail reader does not fetch PDF attachments. */
export async function extractSchoolPdf(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > 2 * 1024 * 1024) throw new Error('PDF must be between 1 byte and 2 MiB');
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = getDocument({ data: bytes.slice(), useSystemFonts: true });
  try {
    const doc = await task.promise;
    if (doc.numPages > 20) throw new Error('PDF exceeds 20 pages');
    const pages: { number: number; text: string }[] = [];
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const content = await page.getTextContent();
      const text = content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
      if (text.length > 16000) throw new Error('PDF page exceeds text limit');
      pages.push({ number, text });
      page.cleanup();
    }
    return { pages, needsManualReview: pages.some(p => !p.text.trim()), method: 'local-pdf-text' as const };
  } finally { await task.destroy(); }
}

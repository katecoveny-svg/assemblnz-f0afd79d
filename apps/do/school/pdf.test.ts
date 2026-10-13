import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { extractSchoolPdf } from './pdf';
import { extractSchoolRows } from './briefing';
import { schoolDemoCurrent } from './fixtures';
describe('local PDF evidence', () => {
  it('extracts actual fixture PDF bytes into page-cited rows', async () => {
    const result = await extractSchoolPdf(new Uint8Array(await readFile('public/do/school-fixtures/harbour-revised.pdf')));
    expect(result.needsManualReview).toBe(false);
    const event = extractSchoolRows({ ...schoolDemoCurrent[0], pages: result.pages }).events[0];
    expect(event).toMatchObject({ title: 'Mathematics exam', date: '22/10/2026', page: 1 });
  });
  it('marks image-only/blank PDFs for manual review', async () => {
    const doc = await PDFDocument.create(); doc.addPage(); expect((await extractSchoolPdf(await doc.save())).needsManualReview).toBe(true);
  });
  it('rejects oversized and corrupt input', async () => {
    await expect(extractSchoolPdf(new Uint8Array(2 * 1024 * 1024 + 1))).rejects.toThrow('2 MiB'); await expect(extractSchoolPdf(new Uint8Array([1, 2, 3]))).rejects.toThrow();
  });
});

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { mkdir, writeFile } from 'node:fs/promises';
import { schoolDemoPrevious, schoolDemoCurrent, schoolDemoSources } from '../apps/do/school/fixtures';
async function main() {
const dir = 'public/do/school-fixtures';
await mkdir(dir, { recursive: true });
const all = [...schoolDemoPrevious, ...schoolDemoCurrent, ...schoolDemoSources('conflict'), ...schoolDemoSources('missing')];
for (const source of new Map(all.map(s => [s.id, s])).values()) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Fictional school notice — DO local test');
  pdf.setCreationDate(new Date('2026-10-13T00:00:00Z'));
  pdf.setModificationDate(new Date('2026-10-13T00:00:00Z'));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const p = pdf.addPage([842, 595]);
  // Evidence page deliberately contains exactly the source row: no synthetic
  // header that could be mistaken for event data by the bounded row recipe.
  p.drawText(source.pages[0].text, { x: 30, y: 520, size: 11, font });
  await writeFile(`${dir}/${source.id}.pdf`, await pdf.save());
}

}
void main();

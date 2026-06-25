/**
 * Atlas readiness report — a one-page "here's where you're at + what to do next"
 * PDF, assembl-wordmarked. Reuses the shared brand helpers (wordmark, palette,
 * watermark, disclaimer) so it stamps identically to the roadmap and every
 * agent evidence pack.
 *
 * Client-side only (jsPDF needs the browser). `/atlas/readiness` calls
 * {@link downloadReadinessReport} from the report's "Save as PDF" button.
 */
import { jsPDF } from 'jspdf';
import { BRAND, WORDMARK, buildWatermark, exportDisclaimer, hexToRgb } from '@/lib/brand/wordmark';
import type { AgentMatch } from './recommend';
import type { ComplianceNote, ReadinessBand } from './readiness';

const A4 = { w: 210, h: 297 };
const MARGIN = 18;
const CONTENT_W = A4.w - MARGIN * 2;

const INK = hexToRgb(BRAND.ink);
const BODY = hexToRgb(BRAND.body);
const MUTED = hexToRgb(BRAND.muted);
const CANARY = hexToRgb(BRAND.canary);
const HAIRLINE = hexToRgb(BRAND.hairline);
const CREAM = hexToRgb(BRAND.cream);
const GOLD = hexToRgb(BRAND.gold);

export type ReadinessReportInput = {
  band: ReadinessBand;
  /** plain-words summary of their situation. */
  summary: string;
  /** the recommended agents, best first. */
  picks: AgentMatch[];
  /** the "why this fits you" line per pick, index-aligned with picks. */
  reasons: string[];
  /** privacy Acts surfaced by the data answer. */
  privacy: ComplianceNote[];
  /** sector Acts surfaced by the regulated-space answer. */
  sector: ComplianceNote[];
  /** a pre-filled Pilot brief for Builders (omit for other bands). */
  firstBuild?: string | null;
};

export type ReadinessReportResult = { doc: jsPDF; watermark: string; filename: string };

function heading(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(text, MARGIN, y);
  return y + 6;
}

function paragraph(doc: jsPDF, text: string, y: number, size = 9.5): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...BODY);
  for (const line of doc.splitTextToSize(text, CONTENT_W)) {
    doc.text(line, MARGIN, y);
    y += size * 0.52;
  }
  return y;
}

/** Build the one-page readiness report (does not download it). */
export function buildReadinessReport(input: ReadinessReportInput): ReadinessReportResult {
  const { watermark } = buildWatermark('atlas-readiness');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Canary accent bar + wordmark header.
  doc.setFillColor(...CANARY);
  doc.rect(0, 0, A4.w, 3, 'F');
  const my = 16;
  doc.setFillColor(...CANARY);
  doc.triangle(MARGIN, my, MARGIN + 3, my - 3, MARGIN + 6, my, 'F');
  doc.triangle(MARGIN, my, MARGIN + 3, my + 3, MARGIN + 6, my, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(WORDMARK, MARGIN + 9, my + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  const today = new Date().toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text('AI READINESS REPORT', A4.w - MARGIN, 12, { align: 'right' });
  doc.text(today, A4.w - MARGIN, 16, { align: 'right' });

  // Title + band chip.
  let y = my + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text('Your AI readiness', MARGIN, y);

  // Band chip on the right.
  const chipLabel = input.band.label.toUpperCase();
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  const chipW = doc.getTextWidth(chipLabel) + 10;
  doc.setFillColor(...CANARY);
  doc.roundedRect(A4.w - MARGIN - chipW, y - 5, chipW, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...INK);
  doc.text(chipLabel, A4.w - MARGIN - chipW / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`Mapped with Atlas · ${watermark}`, MARGIN, y);
  y += 4;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, A4.w - MARGIN, y);
  y += 9;

  // Band blurb.
  y = heading(doc, `You’re at: ${input.band.label}`, y);
  y = paragraph(doc, input.band.blurb, y) + 4;

  // Their situation.
  y = heading(doc, 'Your situation, in short', y);
  y = paragraph(doc, input.summary, y) + 6;

  // The picks.
  y = heading(doc, 'Three agents that fit you', y);
  input.picks.forEach((pick, i) => {
    const reason = input.reasons[i] ?? pick.description;
    const reasonLines = doc.splitTextToSize(reason, CONTENT_W - 12);
    const cardH = 12 + reasonLines.length * 4;
    doc.setFillColor(...CREAM);
    doc.rect(MARGIN, y, CONTENT_W, cardH, 'F');
    doc.setFillColor(...CANARY);
    doc.rect(MARGIN, y, 2, cardH, 'F');
    let yy = y + 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(`${i + 1}. ${pick.name}`, MARGIN + 6, yy);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(pick.price, A4.w - MARGIN - 2, yy, { align: 'right' });
    yy += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BODY);
    for (const line of reasonLines) {
      doc.text(line, MARGIN + 6, yy);
      yy += 4;
    }
    y += cardH + 4;
  });
  y += 2;

  // Privacy + compliance.
  const notes = [...input.privacy, ...input.sector];
  if (notes.length > 0) {
    y = heading(doc, 'Before you start — what to keep in mind', y);
    for (const note of notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(note.act, MARGIN, y);
      y += 4.5;
      y = paragraph(doc, note.why, y, 8.5) + 2.5;
    }
    y += 2;
  }

  // First build (Builders only).
  if (input.firstBuild) {
    y = heading(doc, 'Your suggested first build', y);
    y = paragraph(doc, input.firstBuild, y, 9) + 1;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('Hand this to Pilot to build it step by step.', MARGIN, y);
  }

  // Footer disclaimer.
  const fy = A4.h - 16;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy, A4.w - MARGIN, fy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(exportDisclaimer('Atlas'), CONTENT_W), MARGIN, fy + 4);

  const filename = `assembl-atlas-readiness-${watermark.split('-').slice(-2).join('-')}.pdf`;
  return { doc, watermark, filename };
}

/** Build and trigger a browser download of the readiness report. */
export function downloadReadinessReport(input: ReadinessReportInput): ReadinessReportResult {
  const result = buildReadinessReport(input);
  result.doc.save(result.filename);
  return result;
}

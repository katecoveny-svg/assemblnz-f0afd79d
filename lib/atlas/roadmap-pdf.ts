/**
 * Atlas roadmap — a one-page "here is where AI can help you this month" PDF,
 * assembl-wordmarked. Reuses the shared brand helpers (wordmark, palette,
 * watermark, disclaimer) so it stamps identically to every agent evidence pack.
 *
 * Client-side only (jsPDF needs the browser). `/atlas` calls
 * {@link downloadRoadmap} from the "save the roadmap" button.
 */
import { jsPDF } from 'jspdf';
import { BRAND, WORDMARK, buildWatermark, exportDisclaimer, hexToRgb } from '@/lib/brand/wordmark';
import type { AgentMatch } from './recommend';

const A4 = { w: 210, h: 297 };
const MARGIN = 18;
const CONTENT_W = A4.w - MARGIN * 2;

const INK = hexToRgb(BRAND.ink);
const BODY = hexToRgb(BRAND.body);
const MUTED = hexToRgb(BRAND.muted);
const CANARY = hexToRgb(BRAND.accentGold);
const HAIRLINE = hexToRgb(BRAND.hairline);
const CREAM = hexToRgb(BRAND.cream);
const GOLD = hexToRgb(BRAND.gold);

export type RoadmapInput = {
  /** a short plain-words summary of the person's week, from the diagnostic. */
  summary: string;
  /** the recommended agents, best first. */
  picks: AgentMatch[];
  /** what AI will not help with — honest, specific bullets. */
  limits: string[];
  /** true if the person is handling other people's personal information. */
  privacyFlag?: boolean;
  /** true if the work touches Māori data or whānau information. */
  tikangaFlag?: boolean;
};

export type RoadmapResult = { doc: jsPDF; watermark: string; filename: string };

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

/** Build the one-page roadmap document (does not download it). */
export function buildRoadmap(input: RoadmapInput): RoadmapResult {
  const { watermark } = buildWatermark('atlas-roadmap');
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
  doc.text('YOUR AI ROADMAP', A4.w - MARGIN, 12, { align: 'right' });
  doc.text(today, A4.w - MARGIN, 16, { align: 'right' });

  // Title.
  let y = my + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text('Where AI can help you this month', MARGIN, y);
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

  // Your week.
  y = heading(doc, 'Your week, in short', y);
  y = paragraph(doc, input.summary, y) + 6;

  // The picks.
  y = heading(doc, 'Start here', y);
  for (const [i, pick] of input.picks.entries()) {
    const cardH = 22;
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
    for (const line of doc.splitTextToSize(pick.description, CONTENT_W - 12)) {
      doc.text(line, MARGIN + 6, yy);
      yy += 4;
    }
    y += cardH + 4;
  }
  y += 4;

  // Where AI won't help.
  if (input.limits.length > 0) {
    y = heading(doc, 'Where AI will not help', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BODY);
    for (const limit of input.limits) {
      for (const [li, line] of doc.splitTextToSize(`•  ${limit}`, CONTENT_W).entries()) {
        doc.text(line, MARGIN + (li === 0 ? 0 : 4), y);
        y += 5;
      }
    }
    y += 4;
  }

  // Privacy + tikanga notes.
  if (input.privacyFlag || input.tikangaFlag) {
    y = heading(doc, 'Before you start', y);
    if (input.privacyFlag) {
      y = paragraph(
        doc,
        'You handle other people’s personal information. The Privacy Act 2020 applies. From 1 May 2026, IPP 3A means you must tell people when an automated system makes or materially affects a decision about them.',
        y,
        9,
      ) + 2;
    }
    if (input.tikangaFlag) {
      y = paragraph(
        doc,
        'Your work touches Māori data or whānau information. Treat it as taonga under Māori Data Sovereignty principles, and involve the right people rather than letting a tool decide.',
        y,
        9,
      ) + 2;
    }
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

  const filename = `assembl-atlas-roadmap-${watermark.split('-').slice(-2).join('-')}.pdf`;
  return { doc, watermark, filename };
}

/** Build and trigger a browser download of the roadmap. */
export function downloadRoadmap(input: RoadmapInput): RoadmapResult {
  const result = buildRoadmap(input);
  result.doc.save(result.filename);
  return result;
}

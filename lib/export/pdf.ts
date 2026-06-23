/**
 * Branded evidence-pack PDF export — shared by every marketplace agent.
 *
 * Ported from the old `assemblnz-f0afd79d-main/src/lib/pdfBranding.ts` (848-line
 * jsPDF engine) and `evidencePackPdf.ts`, re-skinned from the old taupe/mist
 * palette to the locked Dash canary/charcoal brand and trimmed to what the
 * marketplace chat actually needs: a branded header (wordmark + canary accent
 * bar), a light markdown body, a reviewer sign-off block, the standing AI/advice
 * disclaimer footer, page numbers, and the `ASSEMBL-…` tracking watermark.
 *
 * Client-side only (jsPDF needs the browser). The chat "Download pack" button
 * calls {@link downloadConversationPack}; any agent export can call
 * {@link buildAgentPdf} directly.
 */

import { jsPDF } from 'jspdf';
import { BRAND, WORDMARK, buildWatermark, exportDisclaimer, hexToRgb } from '@/lib/brand/wordmark';

const A4 = { w: 210, h: 297 };
const MARGIN = 18;
const CONTENT_W = A4.w - MARGIN * 2;

const INK = hexToRgb(BRAND.ink);
const BODY = hexToRgb(BRAND.body);
const MUTED = hexToRgb(BRAND.muted);
const CANARY = hexToRgb(BRAND.canary);
const HAIRLINE = hexToRgb(BRAND.hairline);

export type ConversationTurn = { role: 'user' | 'assistant'; text: string };

export type AgentPackInput = {
  agentName: string;
  agentSlug: string;
  /** category/kete accent for the header chip (defaults to canary). */
  accent?: string;
  turns: ConversationTurn[];
  /** optional reviewer role shown on the sign-off line. */
  reviewerRole?: string;
};

export type AgentPackResult = { doc: jsPDF; watermark: string; filename: string };

/** Draw the branded header band; returns the y to continue body content from. */
function drawHeader(doc: jsPDF, agentName: string, accent: [number, number, number], watermark: string): number {
  // Canary accent bar across the very top.
  doc.setFillColor(...accent);
  doc.rect(0, 0, A4.w, 3, 'F');

  // Geometric mark: a small canary diamond (echoes the wordmark dash).
  const mx = MARGIN;
  const my = 16;
  doc.setFillColor(...CANARY);
  doc.triangle(mx, my, mx + 3, my - 3, mx + 6, my, 'F');
  doc.triangle(mx, my, mx + 3, my + 3, mx + 6, my, 'F');

  // Wordmark.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(WORDMARK, mx + 9, my + 2);

  // CONFIDENTIAL + generated date, right-aligned.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('CONFIDENTIAL', A4.w - MARGIN, 12, { align: 'right' });
  const today = new Date().toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Generated ${today}`, A4.w - MARGIN, 16, { align: 'right' });

  // Agent + pack title line.
  let y = my + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(`${agentName} — evidence pack`, MARGIN, y);
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(watermark, MARGIN, y);

  // Hairline divider.
  y += 4;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, A4.w - MARGIN, y);
  return y + 8;
}

/** Footer with the standing AI/advice disclaimer. Drawn on every page. */
function drawFooter(doc: jsPDF, agentName: string): void {
  const fy = A4.h - 14;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy, A4.w - MARGIN, fy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(exportDisclaimer(agentName), CONTENT_W);
  doc.text(lines, MARGIN, fy + 4);
}

/** Page-break helper: if y would overflow, add a page and reset to top margin. */
function ensureSpace(doc: jsPDF, y: number, needed: number, agentName: string): number {
  if (y + needed > A4.h - 22) {
    drawFooter(doc, agentName);
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

/** Render one conversation turn as a labelled block. Returns the new y. */
function drawTurn(doc: jsPDF, turn: ConversationTurn, y: number, agentName: string): number {
  const label = turn.role === 'user' ? 'You' : agentName;
  const labelColor = turn.role === 'user' ? MUTED : INK;

  y = ensureSpace(doc, y, 14, agentName);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...labelColor);
  doc.text(label.toUpperCase(), MARGIN, y);
  y += 4;

  // Body — strip markdown emphasis, keep line breaks and bullets readable.
  const clean = turn.text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '• ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BODY);
  for (const para of clean.split('\n')) {
    const lines = doc.splitTextToSize(para || ' ', CONTENT_W);
    for (const line of lines) {
      y = ensureSpace(doc, y, 6, agentName);
      doc.text(line, MARGIN, y);
      y += 5;
    }
  }
  return y + 4;
}

/** Reviewer sign-off block — signature lines + legal declaration. */
function drawSignOff(doc: jsPDF, y: number, watermark: string, reviewerRole: string | undefined, agentName: string): number {
  y = ensureSpace(doc, y, 40, agentName);
  doc.setFillColor(...hexToRgb(BRAND.cream));
  doc.rect(MARGIN, y, CONTENT_W, 34, 'F');
  let yy = y + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Pack sign-off', MARGIN + 5, yy);
  yy += 6;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`Pack ID: ${watermark}`, MARGIN + 5, yy);
  yy += 8;

  // Two signature lines.
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.3);
  const colW = (CONTENT_W - 10) / 2 - 6;
  doc.line(MARGIN + 5, yy, MARGIN + 5 + colW, yy);
  doc.line(MARGIN + 15 + colW, yy, MARGIN + 15 + colW + colW, yy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...BODY);
  doc.text(`Reviewed by${reviewerRole ? ` (${reviewerRole})` : ''}`, MARGIN + 5, yy + 4);
  doc.text('Date', MARGIN + 15 + colW, yy + 4);
  yy += 10;
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  const decl = doc.splitTextToSize(
    `A named human reviewer approves this pack before it is sent, filed, lodged, or relied on. ` +
      `Drafted with ${agentName} via ${WORDMARK}.`,
    CONTENT_W - 10,
  );
  doc.text(decl, MARGIN + 5, yy);
  return y + 40;
}

/** Build the full branded PDF document (does not download it). */
export function buildAgentPdf(input: AgentPackInput): AgentPackResult {
  const accent = input.accent ? hexToRgb(input.accent) : CANARY;
  const { watermark } = buildWatermark(input.agentSlug);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, input.agentName, accent, watermark);
  for (const turn of input.turns) {
    if (!turn.text.trim()) continue;
    y = drawTurn(doc, turn, y, input.agentName);
  }
  y = drawSignOff(doc, y + 2, watermark, input.reviewerRole, input.agentName);
  drawFooter(doc, input.agentName);

  // Page numbers.
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`${p} / ${pages}`, A4.w - MARGIN, A4.h - 8, { align: 'right' });
  }

  const filename = `assembl-${input.agentSlug}-pack-${watermark.split('-').slice(-2).join('-')}.pdf`;
  return { doc, watermark, filename };
}

/** Build and trigger a browser download of the conversation as a branded pack. */
export function downloadConversationPack(input: AgentPackInput): AgentPackResult {
  const result = buildAgentPdf(input);
  result.doc.save(result.filename);
  return result;
}

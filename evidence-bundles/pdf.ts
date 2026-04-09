/**
 * Evidence pack PDF generator — Assembl
 * Version: 0.1.0 · 2026-04-09
 *
 * Generates cover.pdf and detail.pdf for an evidence pack.
 * Uses jsPDF (already in project deps). Works in Node.js + browser.
 *
 * Brand rules enforced here:
 * - User-facing strings say "evidence pack" (not "bundle")
 * - SIMULATED watermark on every page when simulated: true — no override
 * - Kōwhai Gold accent, plain business English, no AI/brain/sprint
 */

import { jsPDF } from 'jspdf';
import type { WorkflowResult, Finding, Citation } from './schema.js';

// ── Brand palette (Whenua) ──────────────────────────────────────────────────
const KOWHAI_GOLD: [number, number, number] = [212, 168, 67];
const POUNAMU_TEAL: [number, number, number] = [58, 125, 110];
const TEXT_PRIMARY: [number, number, number] = [20, 20, 30];
const TEXT_SECONDARY: [number, number, number] = [90, 90, 100];
const TEXT_MUTED: [number, number, number] = [140, 140, 150];
const DIVIDER: [number, number, number] = [220, 215, 205];
const RED_BADGE: [number, number, number] = [200, 50, 50];
const GREEN_BADGE: [number, number, number] = [58, 125, 110];

const PAGE_W = 210;
const MARGIN = 20;
const MAX_W = PAGE_W - MARGIN * 2;

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate cover.pdf for the evidence pack.
 * Returns the PDF as a Buffer.
 */
export function generateCoverPdf(result: WorkflowResult): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = drawPackHeader(doc, result);

  // Simulation banner — red, prominent, non-dismissable
  if (result.simulated) {
    y = drawSimulatedBanner(doc, y);
  }

  y += 4;
  y = drawCoverSummary(doc, result, y);
  y += 4;
  y = drawPipelineTrace(doc, result, y);
  y += 4;
  y = drawReviewerBlock(doc, result, y);

  if (result.simulated) {
    addSimulatedWatermarkAllPages(doc);
  }

  drawCoverFooter(doc, result);
  return Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
}

/**
 * Generate detail.pdf — full workflow trace with findings and citations.
 * Returns the PDF as a Buffer.
 */
export function generateDetailPdf(result: WorkflowResult): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = drawPackHeader(doc, result);

  if (result.simulated) {
    y = drawSimulatedBanner(doc, y);
  }

  y += 4;

  // Inputs
  y = drawSection(doc, 'Inputs', y);
  for (const input of result.inputs) {
    y = checkPage(doc, y, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_PRIMARY);
    const simTag = input.simulated ? ' [simulated]' : '';
    doc.text(`• ${input.kind}: ${input.source_ref}${simTag}`, MARGIN + 4, y);
    y += 4.5;
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`  SHA-256: ${input.content_hash}`, MARGIN + 4, y);
    y += 5;
  }

  y += 2;

  // Findings
  y = drawSection(doc, 'Findings', y);
  if (result.findings.length === 0) {
    y = checkPage(doc, y, 8);
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('No findings produced.', MARGIN + 4, y);
    y += 6;
  } else {
    for (const finding of result.findings) {
      y = drawFinding(doc, finding, result.citations, y);
    }
  }

  y += 2;

  // Citations
  y = drawSection(doc, 'Citations', y);
  if (result.citations.length === 0) {
    y = checkPage(doc, y, 8);
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('No citations recorded.', MARGIN + 4, y);
    y += 6;
  } else {
    for (const citation of result.citations) {
      y = drawCitation(doc, citation, y);
    }
  }

  if (result.simulated) {
    addSimulatedWatermarkAllPages(doc);
  }

  drawDetailFooter(doc, result);
  return Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function drawPackHeader(doc: jsPDF, result: WorkflowResult): number {
  let y = 14;

  // Top accent bar
  doc.setFillColor(...KOWHAI_GOLD);
  doc.rect(0, 0, PAGE_W, 2.5, 'F');
  doc.setFillColor(...POUNAMU_TEAL);
  doc.rect(0, 2.5, PAGE_W, 0.5, 'F');

  // Assembl mark
  drawDiamond(doc, MARGIN, y + 5);

  // Brand name
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text('ASSEMBL', MARGIN + 14, y + 6);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_SECONDARY);
  doc.text('assembl.co.nz  ·  Built in Aotearoa', MARGIN + 14, y + 10);

  // Right metadata
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  const dateStr = new Date(result.generated_at).toLocaleDateString('en-NZ', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Pacific/Auckland',
  });
  doc.text(`Generated: ${dateStr}`, PAGE_W - MARGIN, y + 3, { align: 'right' });
  doc.text(`Pack ID: ${result.bundle_id}`, PAGE_W - MARGIN, y + 7, { align: 'right' });

  y += 18;

  // Document title
  const title = `Evidence pack — ${result.agent.kete} · ${result.agent.name} v${result.agent.version}`;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(title, MARGIN, y, { maxWidth: MAX_W });
  y += 7;

  // Divider
  drawDivider(doc, y);
  y += 6;

  return y;
}

function drawSimulatedBanner(doc: jsPDF, y: number): number {
  y = checkPage(doc, y, 14);

  // Red banner
  doc.setFillColor(220, 50, 50);
  doc.rect(MARGIN, y, MAX_W, 10, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SIMULATED — NOT FOR AUDIT USE', PAGE_W / 2, y + 6.5, { align: 'center' });

  y += 12;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 50, 50);
  const msg = 'This evidence pack was produced from synthetic data using the Assembl simulator. ' +
    'It is not a record of any real event, person, or organisation. ' +
    'It must not be used in place of a real evidence pack in any audit, legal, or regulatory context.';
  const lines = doc.splitTextToSize(msg, MAX_W);
  for (const line of lines) {
    doc.text(line, MARGIN, y);
    y += 4.5;
  }
  y += 4;
  return y;
}

function drawCoverSummary(doc: jsPDF, result: WorkflowResult, y: number): number {
  y = drawSection(doc, 'Evidence pack summary', y);

  const rows: Array<[string, string]> = [
    ['Agent', `${result.agent.name} v${result.agent.version}`],
    ['Kete', result.agent.kete],
    ['Pack ID', result.bundle_id],
    ['Generated at', `${result.generated_at} (UTC)`],
    ['Inputs processed', String(result.inputs.length)],
    ['Findings', String(result.findings.length)],
    ['Citations', String(result.citations.length)],
    ['Status', result.simulated ? 'SIMULATED — not for audit use' : 'Real inputs — signed pack'],
  ];

  for (const [label, value] of rows) {
    y = checkPage(doc, y, 7);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_SECONDARY);
    doc.text(label, MARGIN + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_PRIMARY);

    const isStatus = label === 'Status';
    if (isStatus && result.simulated) {
      doc.setTextColor(...RED_BADGE);
    } else if (isStatus) {
      doc.setTextColor(...GREEN_BADGE);
    }
    doc.text(value, MARGIN + 50, y, { maxWidth: MAX_W - 50 });
    y += 5.5;
  }

  return y + 2;
}

function drawPipelineTrace(doc: jsPDF, result: WorkflowResult, y: number): number {
  y = drawSection(doc, 'Pipeline trace', y);

  const stages = ['kahu', 'iho', 'ta', 'mahara', 'mana'] as const;
  const labels: Record<string, string> = {
    kahu: 'Kahu  (intake)', iho: 'Iho  (orientation)',
    ta: 'Tā  (the work)', mahara: 'Mahara  (citations)', mana: 'Mana  (sign-off)',
  };

  for (const stage of stages) {
    y = checkPage(doc, y, 7);
    const ran = result.pipeline[stage] !== null;
    const tick = ran ? '✓' : '○';
    const color: [number, number, number] = ran ? POUNAMU_TEAL : TEXT_MUTED;

    doc.setFontSize(9);
    doc.setFont('helvetica', ran ? 'bold' : 'normal');
    doc.setTextColor(...color);
    doc.text(`${tick}  ${labels[stage]}`, MARGIN + 4, y);

    if (ran && result.pipeline[stage]) {
      const s = result.pipeline[stage]!;
      const duration = Math.round(
        (new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 1000
      );
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`${s.started_at}  (${duration}s)`, MARGIN + 70, y);
    }
    y += 5.5;
  }

  return y + 2;
}

function drawReviewerBlock(doc: jsPDF, result: WorkflowResult, y: number): number {
  y = drawSection(doc, 'Reviewer sign-off', y);
  y = checkPage(doc, y, 25);

  if (result.reviewer) {
    const { name, role, org, signed_at } = result.reviewer;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(`Name: ${name}`, MARGIN + 4, y);        y += 5;
    doc.text(`Role: ${role}`, MARGIN + 4, y);         y += 5;
    doc.text(`Organisation: ${org}`, MARGIN + 4, y);  y += 5;
    doc.text(`Signed: ${signed_at}`, MARGIN + 4, y);  y += 5;

    // Signature space
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN + 4, y + 5, MARGIN + 80, y + 5);
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Signature', MARGIN + 4, y + 9);
  } else {
    // Unsigned state
    doc.setFillColor(255, 245, 220);
    doc.rect(MARGIN, y, MAX_W, 12, 'F');
    doc.setDrawColor(...KOWHAI_GOLD);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, y, MAX_W, 12, 'D');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(160, 100, 20);
    doc.text('Unsigned — not yet certified by a named reviewer', MARGIN + 4, y + 8);
    y += 14;

    // Signing block for printing
    y += 4;
    const lines = [
      ['Name', ''],
      ['Role', ''],
      ['Organisation', ''],
      ['Date', ''],
    ];
    for (const [label] of lines) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_SECONDARY);
      doc.text(label + ':', MARGIN + 4, y);
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.2);
      doc.line(MARGIN + 35, y + 1, MARGIN + MAX_W - 4, y + 1);
      y += 7;
    }
  }

  return y + 4;
}

function drawFinding(doc: jsPDF, finding: Finding, citations: Citation[], y: number): number {
  y = checkPage(doc, y, 15);

  const severityColour: Record<string, [number, number, number]> = {
    critical: [200, 40, 40],
    high: [200, 80, 40],
    medium: [180, 130, 20],
    low: POUNAMU_TEAL,
    info: TEXT_MUTED,
  };

  const colour = severityColour[finding.severity] ?? TEXT_MUTED;

  // Severity badge
  doc.setFillColor(...colour);
  doc.roundedRect(MARGIN, y - 2, 18, 5, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(finding.severity.toUpperCase(), MARGIN + 1.5, y + 1.8);

  // Statement
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_PRIMARY);
  const statLines = doc.splitTextToSize(finding.statement, MAX_W - 22);
  for (const line of statLines) {
    doc.text(line, MARGIN + 22, y);
    y += 4.5;
  }

  // Source pointer
  const cite = citations.find(c => c.id === finding.source_pointer);
  if (cite) {
    y = checkPage(doc, y, 5);
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Source: ${cite.label} — ${cite.locator}`, MARGIN + 22, y);
    y += 4.5;
  }

  y += 3;
  return y;
}

function drawCitation(doc: jsPDF, citation: Citation, y: number): number {
  y = checkPage(doc, y, 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...POUNAMU_TEAL);
  doc.text(`[${citation.id}]  ${citation.label}`, MARGIN + 4, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.setFontSize(8);
  const locLines = doc.splitTextToSize(citation.locator, MAX_W - 8);
  for (const line of locLines) {
    y = checkPage(doc, y, 5);
    doc.text(line, MARGIN + 8, y);
    y += 4;
  }

  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Retrieved: ${citation.retrieved_at}`, MARGIN + 8, y);
  y += 6;
  return y;
}

function addSimulatedWatermarkAllPages(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Diagonal red watermark across the page
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 50, 50);
    // Save graphics state — rotate text
    doc.saveGraphicsState();
    // jsPDF doesn't have a built-in rotate transform for text,
    // but we can use the internal API to write rotated text
    doc.text('SIMULATED', PAGE_W / 2, 148, {
      angle: 45,
      align: 'center',
      renderingMode: 'fill',
      // Make it 40% transparent by using a lighter colour
      charSpace: 2,
    });
    doc.restoreGraphicsState();
  }
}

function drawCoverFooter(doc: jsPDF, result: WorkflowResult): void {
  const total = doc.getNumberOfPages();
  const kete = result.agent.kete.toLowerCase();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawPageFooter(doc, `${result.agent.name} — evidence pack`, result.bundle_id, p, total, result.simulated);
    if (result.simulated) {
      drawSimulatedFooterLine(doc, result, kete);
    }
  }
}

function drawDetailFooter(doc: jsPDF, result: WorkflowResult): void {
  const total = doc.getNumberOfPages();
  const kete = result.agent.kete.toLowerCase();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawPageFooter(doc, `${result.agent.name} — detail report`, result.bundle_id, p, total, result.simulated);
    if (result.simulated) {
      drawSimulatedFooterLine(doc, result, kete);
    }
  }
}

function drawPageFooter(
  doc: jsPDF, label: string, bundleId: string,
  page: number, total: number, simulated: boolean,
): void {
  const ph = doc.internal.pageSize.getHeight();
  let y = ph - 15;

  doc.setDrawColor(...KOWHAI_GOLD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + 20, y);
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 20, y, PAGE_W - MARGIN, y);
  y += 3.5;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `${label}  ·  Pack ID: ${bundleId}  ·  assembl.co.nz  ·  Built in Aotearoa`,
    MARGIN, y,
  );

  doc.setFontSize(7);
  doc.setTextColor(...POUNAMU_TEAL);
  doc.text(`Page ${page} of ${total}`, PAGE_W - MARGIN, y, { align: 'right' });
  y += 4;

  if (simulated) {
    doc.setFontSize(6);
    doc.setTextColor(...RED_BADGE);
    doc.text(
      `SIMULATED DATA — not a real audit record — scenario generated by Assembl simulator — ${new Date().toISOString()}`,
      MARGIN, y, { maxWidth: MAX_W },
    );
  } else {
    doc.setFontSize(6);
    doc.setTextColor(160, 155, 145);
    doc.text(
      `Assembl does not provide legal, financial, or professional advice. ` +
      `Verify NZ legislation at legislation.govt.nz. © ${new Date().getFullYear()} Assembl Ltd, Auckland.`,
      MARGIN, y, { maxWidth: MAX_W },
    );
  }

  // Bottom accent
  doc.setFillColor(...KOWHAI_GOLD);
  doc.rect(0, ph - 2.5, PAGE_W, 2.5, 'F');
}

function drawSimulatedFooterLine(doc: jsPDF, result: WorkflowResult, scenarioId: string): void {
  // Already handled inside drawPageFooter
  void result;
  void scenarioId;
}

// ── Layout helpers ─────────────────────────────────────────────────────────

function drawSection(doc: jsPDF, title: string, y: number): number {
  y = checkPage(doc, y, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(title, MARGIN, y);
  y += 2;
  doc.setDrawColor(...POUNAMU_TEAL);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + 25, y);
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 25, y, PAGE_W - MARGIN, y);
  return y + 6;
}

function drawDivider(doc: jsPDF, y: number): void {
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  doc.setDrawColor(...KOWHAI_GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, MARGIN + 30, y);
}

function drawDiamond(doc: jsPDF, lx: number, ly: number): void {
  const d = 5;
  doc.setFillColor(...KOWHAI_GOLD);
  doc.setDrawColor(...KOWHAI_GOLD);
  doc.setLineWidth(0.5);
  const pts = [
    { x: lx + d, y: ly - d },
    { x: lx + d * 2, y: ly },
    { x: lx + d, y: ly + d },
    { x: lx, y: ly },
  ];
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    doc.line(pts[i].x, pts[i].y, next.x, next.y);
  }
  doc.setFillColor(...POUNAMU_TEAL);
  doc.circle(lx + d, ly, 1.5, 'F');
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 20;
  }
  return y;
}

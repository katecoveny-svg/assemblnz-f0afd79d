import jsPDF from "jspdf";

// ──────────────────────────────────────────────────────────────
// Assembl Brand Guidelines v1.0 (2026-04-22) — canonical tokens
// Mist / Taupe / Soft Gold sparkle. Retires the Whenua palette.
// ──────────────────────────────────────────────────────────────

// Hex → RGB tuple helper (kept tiny; jsPDF needs RGB triples).
const hex = (h: string): [number, number, number] => {
  const v = h.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
};

// Core surfaces & text — locked to assemblTokens.ts
const ASSEMBL_MIST       = hex("#F7F3EE"); // page background tint
const ASSEMBL_CLOUD      = hex("#EEE7DE"); // soft section fill
const ASSEMBL_SAND       = hex("#D8C8B4"); // dividers / chips
const ASSEMBL_TAUPE      = hex("#9D8C7D"); // secondary text / strokes
const ASSEMBL_TAUPE_DEEP = hex("#6F6158"); // primary text / display
const ASSEMBL_SAGE_MIST  = hex("#C9D8D0"); // calm support tone
const SOFT_GOLD          = hex("#D9BC7A"); // sparkle accent (default)

const TEXT_PRIMARY:   [number, number, number] = ASSEMBL_TAUPE_DEEP;
const TEXT_SECONDARY: [number, number, number] = hex("#8E8177");
const TEXT_BODY:      [number, number, number] = hex("#5F554F");
const TEXT_MUTED:     [number, number, number] = hex("#A89B8F");
const DIVIDER:        [number, number, number] = ASSEMBL_SAND;

// Back-compat alias — older call sites still import POUNAMU_TEAL by name.
// Brand book retires teal: route it to deep taupe so output stays on-palette.
const POUNAMU_TEAL: [number, number, number] = ASSEMBL_TAUPE_DEEP;
// Default sparkle accent (replaces KOWHAI_GOLD).
const KOWHAI_GOLD: [number, number, number] = SOFT_GOLD;

// ── Kete Accent Colours (RGB) ──
// Mirrors ASSEMBL_TOKENS.industries — soft, low-chroma per Brand Guidelines v1.0.
export const KETE_COLORS: Record<string, { accent: [number, number, number]; label: string }> = {
  manaaki:  { accent: hex("#E6D8C6"), label: "Manaaki · Hospitality" },        // Warm Linen
  waihanga: { accent: hex("#CBB8A4"), label: "Waihanga · Construction" },      // Clay Sand
  hanga:    { accent: hex("#CBB8A4"), label: "Hanga · Construction" },         // legacy alias
  auaha:    { accent: hex("#C8DDD8"), label: "Auaha · Creative" },             // Pale Seafoam
  arataki:  { accent: hex("#D5C0C8"), label: "Arataki · Automotive & Fleet" }, // Dusky Rose
  pikau:    { accent: hex("#B8C7B1"), label: "Pikau · Freight & Customs" },    // Soft Moss
  toro:     { accent: hex("#C7D9E8"), label: "Tōro · Family" },                // Moonstone Blue
  hoko:     { accent: hex("#D8C3C2"), label: "Hoko · Retail" },                // Blush Stone
  ako:      { accent: hex("#C7D6C7"), label: "Ako · Early Childhood" },        // Soft Sage
};

// ── Agent → Kete mapping for cross-agent awareness ──
export const AGENT_KETE_MAP: Record<string, string> = {
  // Manaaki
  AURA: "manaaki", SAFFRON: "manaaki", CELLAR: "manaaki", NOVA: "manaaki",
  // Waihanga / Hanga
  APEX: "waihanga", KAUPAPA: "waihanga", ARAI: "waihanga", WHAKAE: "waihanga", MATAI: "waihanga",
  // Auaha
  PRISM: "auaha", ECHO: "auaha", SPARK: "auaha", FLUX: "auaha",
  TAHI: "auaha", RUA: "auaha", TORU: "auaha", WHA: "auaha", RIMA: "auaha",
  // Arataki
  MOTOR: "arataki", FLEET: "arataki", WARRANT: "arataki",
  // Pikau
  NEXUS: "pikau", TARIFF: "pikau", ROUTE: "pikau",
  // Toro
  TORO: "toro",
  // Cross-pack agents (use platform branding)
  LEDGER: "platform", AROHA: "platform", ANCHOR: "platform", HAVEN: "platform",
  COMPASS: "platform", SHIELD: "platform",
};

function getKeteAccent(agentName?: string): [number, number, number] {
  if (!agentName) return KOWHAI_GOLD;
  const kete = AGENT_KETE_MAP[agentName.toUpperCase()];
  if (!kete || kete === "platform") return KOWHAI_GOLD;
  return KETE_COLORS[kete]?.accent ?? KOWHAI_GOLD;
}

function getKeteLabel(agentName?: string): string | null {
  if (!agentName) return null;
  const kete = AGENT_KETE_MAP[agentName.toUpperCase()];
  if (!kete || kete === "platform") return null;
  return KETE_COLORS[kete]?.label ?? null;
}

// ────────────────────────────────────────────────
// HEADER
// ────────────────────────────────────────────────

export function drawAssemblPDFHeader(
  doc: jsPDF,
  options: {
    agentName?: string;
    agentDesignation?: string;
    subtitle?: string;
    margin?: number;
    customLogoUrl?: string;
    customBusinessName?: string;
    documentTitle?: string;
    documentVersion?: string;
    keteSlug?: string;
    /** When true, shows cross-agent attribution block */
    crossAgentSources?: Array<{ agent: string; kete?: string }>;
  } = {}
): number {
  const {
    agentName, agentDesignation, subtitle, margin = 20,
    customBusinessName, documentTitle, documentVersion,
    keteSlug, crossAgentSources,
  } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  const accent = keteSlug
    ? (KETE_COLORS[keteSlug]?.accent ?? KOWHAI_GOLD)
    : getKeteAccent(agentName);

  // Top accent bar — kete-aware colour
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  // Secondary thin line — Pounamu Teal
  doc.setFillColor(...POUNAMU_TEAL);
  doc.rect(0, 2.5, pageWidth, 0.5, "F");

  // Assembl mark — geometric diamond
  const lx = margin;
  const ly = y + 5;
  const diamondSize = 5;

  doc.setFillColor(...accent);
  doc.setDrawColor(...accent);
  const pts = [
    { x: lx + diamondSize, y: ly - diamondSize },
    { x: lx + diamondSize * 2, y: ly },
    { x: lx + diamondSize, y: ly + diamondSize },
    { x: lx, y: ly },
  ];
  doc.setLineWidth(0.5);
  doc.line(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
  doc.line(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
  doc.line(pts[2].x, pts[2].y, pts[3].x, pts[3].y);
  doc.line(pts[3].x, pts[3].y, pts[0].x, pts[0].y);

  // Inner dot — Pounamu Teal
  doc.setFillColor(...POUNAMU_TEAL);
  doc.circle(lx + diamondSize, ly, 1.5, "F");

  // Brand name
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_PRIMARY);
  const displayName = customBusinessName || "ASSEMBL";
  doc.text(displayName, margin + 14, y + 6);

  // Tagline
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_SECONDARY);
  if (!customBusinessName) {
    doc.text("assembl.co.nz  ·  Business Intelligence Platform  ·  Built in Aotearoa", margin + 14, y + 10);
  }

  // Right-aligned metadata
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
  doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth - margin, y + 3, { align: "right" });
  if (documentVersion) {
    doc.text(`Version: ${documentVersion}`, pageWidth - margin, y + 7, { align: "right" });
  }
  doc.setFontSize(6);
  doc.setTextColor(...accent);
  doc.text("CONFIDENTIAL", pageWidth - margin, y + (documentVersion ? 11 : 7), { align: "right" });

  y += 18;

  // Kete label
  const keteLabel = keteSlug ? KETE_COLORS[keteSlug]?.label : getKeteLabel(agentName);
  if (keteLabel) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(keteLabel.toUpperCase(), margin, y);
    y += 5;
  }

  // Document title
  if (documentTitle) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_PRIMARY);
    const titleLines = doc.splitTextToSize(documentTitle, pageWidth - margin * 2);
    for (const line of titleLines) { doc.text(line, margin, y); y += 6; }
    y += 1;
  }

  // Agent info
  if (agentName) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...POUNAMU_TEAL);
    const agentLine = agentDesignation ? `${agentName}  ·  ${agentDesignation}` : agentName;
    doc.text(agentLine, margin, y);
    y += 5;
  }

  // Cross-agent attribution
  if (crossAgentSources && crossAgentSources.length > 0) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    const sourceList = crossAgentSources
      .map(s => s.kete ? `${s.agent} (${s.kete})` : s.agent)
      .join("  ·  ");
    doc.text(`Contributing agents: ${sourceList}`, margin, y);
    y += 5;
  }

  // Subtitle
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(subtitle, margin, y);
    y += 5;
  }

  // Divider — kete-aware accent
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 30, y);
  y += 8;

  return y;
}

// ────────────────────────────────────────────────
// FOOTER
// ────────────────────────────────────────────────

export function drawAssemblPDFFooter(
  doc: jsPDF,
  options: {
    agentName?: string;
    margin?: number;
    y?: number;
    includePageNumbers?: boolean;
    keteSlug?: string;
    /** When true, adds the compliance pipeline badge */
    showPipeline?: boolean;
  } = {}
): void {
  const {
    agentName = "Assembl AI", margin = 20,
    y: customY, includePageNumbers = true,
    keteSlug, showPipeline = false,
  } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const totalPages = doc.getNumberOfPages();
  const accent = keteSlug
    ? (KETE_COLORS[keteSlug]?.accent ?? KOWHAI_GOLD)
    : getKeteAccent(agentName);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    let y = customY ?? pageHeight - 30;

    // Pipeline badge
    if (showPipeline && pageNum === totalPages) {
      const pipelineY = y - 8;
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_MUTED);
      doc.text("PIPELINE:  Kahu → Iho → Tā → Mahara → Mana", margin, pipelineY);
      doc.setDrawColor(...POUNAMU_TEAL);
      doc.setLineWidth(0.2);
      doc.line(margin, pipelineY + 2, margin + 70, pipelineY + 2);
    }

    // Divider
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 20, y);
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(margin + 20, y, pageWidth - margin, y);
    y += 3.5;

    // AI disclaimer
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `Generated by ${agentName} via Assembl — AI-generated content. Review by a qualified professional before use or reliance. ` +
      `Assembl does not provide legal, financial, tax, medical, or construction advice. Consult a licensed professional for your situation.`,
      margin, y, { maxWidth }
    );
    y += 7;

    // Copyright
    doc.setFontSize(6);
    doc.setTextColor(160, 155, 145);
    doc.text(
      `© ${new Date().getFullYear()} Assembl Ltd, Auckland, New Zealand. All rights reserved. Built in Aotearoa. ` +
      `NZ legislation references are current as at date of generation — verify at legislation.govt.nz.`,
      margin, y, { maxWidth }
    );

    // Page numbers
    if (includePageNumbers && totalPages > 1) {
      doc.setFontSize(7);
      doc.setTextColor(...POUNAMU_TEAL);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Bottom accent bars — kete-aware
    doc.setFillColor(...POUNAMU_TEAL);
    doc.rect(0, pageHeight - 3, pageWidth, 0.5, "F");
    doc.setFillColor(...accent);
    doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, "F");
  }
}

// ────────────────────────────────────────────────
// CROSS-AGENT SECTION BLOCK
// ────────────────────────────────────────────────

export interface CrossAgentSection {
  agent: string;
  designation?: string;
  kete?: string;
  title: string;
  body: string;
  status?: "pass" | "flag" | "fail";
  legislationRef?: string;
}

/**
 * Renders a cross-agent section block inside a PDF.
 * Each contributing agent gets a branded header bar with its kete accent.
 */
export function renderCrossAgentSection(
  doc: jsPDF,
  section: CrossAgentSection,
  options: { startY: number; margin?: number }
): number {
  const margin = options.margin ?? 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxW = pageWidth - margin * 2;
  let y = options.startY;

  const checkPage = (needed: number) => {
    if (y + needed > 260) { doc.addPage(); y = 20; }
  };

  const kete = section.kete || AGENT_KETE_MAP[section.agent.toUpperCase()];
  const accent = kete && kete !== "platform" && KETE_COLORS[kete]
    ? KETE_COLORS[kete].accent
    : KOWHAI_GOLD;

  checkPage(16);

  // Agent section header bar
  doc.setFillColor(240, 238, 232);
  doc.rect(margin, y - 3, maxW, 9, "F");
  doc.setFillColor(...accent);
  doc.rect(margin, y - 3, 1.5, 9, "F");

  // Status badge
  if (section.status) {
    const statusColors: Record<string, [number, number, number]> = {
      pass: [34, 197, 94],
      flag: [234, 179, 8],
      fail: [239, 68, 68],
    };
    const sc = statusColors[section.status] ?? TEXT_MUTED;
    const statusLabel = section.status.toUpperCase();
    const badgeX = pageWidth - margin - 18;
    doc.setFillColor(...sc);
    doc.roundedRect(badgeX, y - 2, 16, 5, 1, 1, "F");
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, badgeX + 8, y + 1.5, { align: "center" });
  }

  // Agent name
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  const agentLabel = section.designation
    ? `${section.agent} · ${section.designation}`
    : section.agent;
  doc.text(agentLabel, margin + 5, y + 1);

  // Section title
  const agentLabelWidth = doc.getTextWidth(agentLabel + "  ");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(section.title, margin + 5 + agentLabelWidth, y + 1);
  y += 10;

  // Legislation reference
  if (section.legislationRef) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...POUNAMU_TEAL);
    doc.text(`Ref: ${section.legislationRef}`, margin, y);
    y += 5;
  }

  // Body text
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_SECONDARY);
  const bodyLines = doc.splitTextToSize(section.body, maxW);
  for (const line of bodyLines) {
    checkPage(5);
    doc.text(line, margin, y);
    y += 4;
  }
  y += 4;

  return y;
}

// ────────────────────────────────────────────────
// PACK SIGN-OFF BLOCK
// ────────────────────────────────────────────────

/**
 * Draws the evidence pack sign-off block at the bottom of the last page.
 * Includes signature lines for reviewer name, date, and role.
 */
export function drawSignOffBlock(
  doc: jsPDF,
  options: {
    startY: number;
    margin?: number;
    packId?: string;
    complianceStatus?: "pass" | "flag" | "fail";
    agentSources?: string[];
  }
): number {
  const margin = options.margin ?? 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxW = pageWidth - margin * 2;
  let y = options.startY;

  const checkPage = (needed: number) => {
    if (y + needed > 260) { doc.addPage(); y = 20; }
  };

  checkPage(50);

  // Divider
  doc.setDrawColor(...KOWHAI_GOLD);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 40, y);
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(margin + 40, y, pageWidth - margin, y);
  y += 8;

  // Sign-off title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text("Pack Sign-Off", margin, y);
  y += 6;

  // Pack ID and status
  if (options.packId || options.complianceStatus) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    const parts: string[] = [];
    if (options.packId) parts.push(`Pack ID: ${options.packId}`);
    if (options.complianceStatus) parts.push(`Overall status: ${options.complianceStatus.toUpperCase()}`);
    doc.text(parts.join("  ·  "), margin, y);
    y += 5;
  }

  // Agent attribution
  if (options.agentSources && options.agentSources.length > 0) {
    doc.setFontSize(7);
    doc.setTextColor(...POUNAMU_TEAL);
    doc.text(`Contributing agents: ${options.agentSources.join(", ")}`, margin, y);
    y += 6;
  }

  // Pipeline badge
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Compliance pipeline: Kahu → Iho → Tā → Mahara → Mana", margin, y);
  y += 8;

  // Signature lines
  const lineWidth = (maxW - 12) / 3;
  const labels = ["Reviewer Name", "Date", "Role / Title"];
  for (let i = 0; i < 3; i++) {
    const x = margin + i * (lineWidth + 6);
    doc.setDrawColor(...TEXT_MUTED);
    doc.setLineWidth(0.3);
    doc.line(x, y + 8, x + lineWidth, y + 8);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(labels[i], x, y + 12);
  }
  y += 18;

  // Legal declaration
  doc.setFontSize(6);
  doc.setTextColor(160, 155, 145);
  doc.text(
    "I confirm I have reviewed this evidence pack and the information contained herein is accurate to the best of my knowledge. " +
    "AI-generated content has been reviewed. This document may be relied upon for audit, legal review, or regulatory compliance purposes.",
    margin, y, { maxWidth: maxW }
  );
  y += 10;

  return y;
}

// ────────────────────────────────────────────────
// CROSS-AGENT EVIDENCE PACK (FULL DOCUMENT)
// ────────────────────────────────────────────────

export interface EvidencePackConfig {
  title: string;
  packId: string;
  client?: string;
  keteSlug?: string;
  summary?: string;
  sections: CrossAgentSection[];
  documentVersion?: string;
}

/**
 * Generates a complete cross-agent evidence pack PDF.
 * This is the canonical function all agents should call to produce
 * branded, multi-agent PDF outputs with sign-off blocks.
 */
export function generateEvidencePackPDF(config: EvidencePackConfig): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxW = pageWidth - margin * 2;

  const uniqueAgents = [...new Set(config.sections.map(s => s.agent))];
  const crossAgentSources = uniqueAgents.map(a => ({
    agent: a,
    kete: AGENT_KETE_MAP[a.toUpperCase()] || undefined,
  }));

  // Header
  let y = drawAssemblPDFHeader(doc, {
    documentTitle: config.title,
    subtitle: config.client
      ? `${config.client}  ·  ${new Date().toLocaleDateString("en-NZ")}  ·  Pack ID: ${config.packId}`
      : `Pack ID: ${config.packId}`,
    keteSlug: config.keteSlug,
    documentVersion: config.documentVersion,
    crossAgentSources: crossAgentSources.length > 1 ? crossAgentSources : undefined,
    margin,
  });

  // Summary
  if (config.summary) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 50);
    const summaryLines = doc.splitTextToSize(config.summary, maxW);
    for (const l of summaryLines) { doc.text(l, margin, y); y += 4.5; }
    y += 6;
  }

  // Sections
  for (const section of config.sections) {
    y = renderCrossAgentSection(doc, section, { startY: y, margin });
  }

  // Sign-off
  y = drawSignOffBlock(doc, {
    startY: y,
    margin,
    packId: config.packId,
    complianceStatus: deriveOverallStatus(config.sections),
    agentSources: uniqueAgents,
  });

  // Footer
  drawAssemblPDFFooter(doc, {
    agentName: uniqueAgents.length === 1 ? uniqueAgents[0] : "Assembl Multi-Agent",
    margin,
    keteSlug: config.keteSlug,
    showPipeline: true,
  });

  return doc;
}

function deriveOverallStatus(
  sections: CrossAgentSection[]
): "pass" | "flag" | "fail" {
  const statuses = sections.map(s => s.status).filter(Boolean);
  if (statuses.includes("fail")) return "fail";
  if (statuses.includes("flag")) return "flag";
  return "pass";
}

// ────────────────────────────────────────────────
// MARKDOWN RENDERER (existing, improved)
// ────────────────────────────────────────────────

/**
 * Renders markdown content to PDF with proper formatting.
 * Handles headings, bold, bullets, numbered lists, checkboxes, and tables.
 * Whenua-branded heading accents and table styling.
 */
export function renderMarkdownToPDF(
  doc: jsPDF,
  content: string,
  options: {
    startY: number;
    margin?: number;
    maxWidth?: number;
    senderLabel?: string;
    senderColor?: [number, number, number];
    accentColor?: [number, number, number];
  }
): number {
  const margin = options.margin ?? 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = options.maxWidth ?? pageWidth - margin * 2;
  const accentColor = options.accentColor ?? KOWHAI_GOLD;
  let y = options.startY;

  const checkPage = (needed: number) => {
    if (y + needed > 260) { doc.addPage(); y = 20; }
  };

  // Sender label
  if (options.senderLabel) {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const [r, g, b] = options.senderColor || TEXT_PRIMARY;
    doc.setTextColor(r, g, b);
    doc.text(options.senderLabel, margin, y);
    const w = doc.getTextWidth(options.senderLabel);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1, margin + w, y + 1);
    y += 7;
  }

  const lines = content.split("\n");
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const cols = tableRows[0].length;
    const colWidth = maxWidth / cols;

    checkPage(8);
    doc.setFillColor(240, 238, 232);
    doc.rect(margin, y - 3, maxWidth, 7, "F");
    doc.setFillColor(...accentColor);
    doc.rect(margin, y - 3, 1.5, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 55);
    for (let c = 0; c < cols; c++) {
      const text = (tableRows[0][c] || "").trim();
      doc.text(text, margin + c * colWidth + 4, y + 1, { maxWidth: colWidth - 6 });
    }
    y += 6;
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 1, margin + maxWidth, y - 1);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 60);
    for (let r = 1; r < tableRows.length; r++) {
      checkPage(6);
      if (r % 2 === 0) {
        doc.setFillColor(250, 248, 244);
        doc.rect(margin, y - 2.5, maxWidth, 5, "F");
      }
      for (let c = 0; c < cols; c++) {
        const text = (tableRows[r][c] || "").trim();
        doc.text(text, margin + c * colWidth + 4, y + 1, { maxWidth: colWidth - 6 });
      }
      y += 5;
      if (r < tableRows.length - 1) {
        doc.setDrawColor(235, 230, 220);
        doc.setLineWidth(0.15);
        doc.line(margin, y - 1.5, margin + maxWidth, y - 1.5);
      }
    }
    y += 3;
    tableRows = [];
    inTable = false;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|[\s\-:]+\|/.test(trimmed) && trimmed.replace(/[\s|:\-]/g, "") === "") {
        inTable = true;
        continue;
      }
      const cells = trimmed.split("|").filter((_, i, a) => i > 0 && i < a.length - 1);
      tableRows.push(cells);
      inTable = true;
      continue;
    }

    if (inTable) flushTable();
    if (!trimmed) { y += 3; continue; }

    const h1 = trimmed.match(/^#\s+(.*)/);
    const h2 = trimmed.match(/^##\s+(.*)/);
    const h3 = trimmed.match(/^###\s+(.*)/);
    const h4 = trimmed.match(/^####\s+(.*)/);

    if (h1) {
      checkPage(12);
      y += 4;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_PRIMARY);
      const wrapped = doc.splitTextToSize(h1[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 6.5; }
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 2, margin + 40, y - 2);
      y += 2;
    } else if (h2) {
      checkPage(10);
      y += 3;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(35, 35, 50);
      const wrapped = doc.splitTextToSize(h2[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 6; }
      doc.setDrawColor(...POUNAMU_TEAL);
      doc.setLineWidth(0.3);
      doc.line(margin, y - 1, margin + 25, y - 1);
      y += 2;
    } else if (h3) {
      checkPage(8);
      y += 2;
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 65);
      const wrapped = doc.splitTextToSize(h3[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 5.5; }
      y += 1;
    } else if (h4) {
      checkPage(7);
      y += 1;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 75);
      doc.text(h4[1].replace(/\*+/g, ""), margin, y);
      y += 5;
    } else {
      let text = trimmed
        .replace(/^#+\s*/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1");

      const checkbox = text.match(/^[-*]\s*\[([ xX])\]\s*(.*)/);
      if (checkbox) {
        const checked = checkbox[1].trim() !== "";
        text = `${checked ? "☑" : "☐"}  ${checkbox[2]}`;
      } else {
        text = text.replace(/^[-*]\s+/g, "•  ");
      }

      const isBullet = text.startsWith("•") || text.startsWith("☑") || text.startsWith("☐");
      const isNumbered = /^\d+[\.\)]\s/.test(text);
      const indent = (isBullet || isNumbered) ? margin + 4 : margin;
      const textMaxWidth = (isBullet || isNumbered) ? maxWidth - 4 : maxWidth;

      const hasBold = /\*\*/.test(rawLine);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", hasBold ? "bold" : "normal");
      doc.setTextColor(40, 40, 50);

      if (isBullet && text.startsWith("•")) {
        checkPage(5);
        doc.setTextColor(...accentColor);
        doc.text("•", indent - 3, y);
        doc.setTextColor(40, 40, 50);
        const restText = text.substring(3);
        const wrapped = doc.splitTextToSize(restText, textMaxWidth);
        for (const wLine of wrapped) { checkPage(5); doc.text(wLine, indent, y); y += 4.5; }
        y += 1;
      } else {
        const wrapped = doc.splitTextToSize(text, textMaxWidth);
        for (const wLine of wrapped) { checkPage(5); doc.text(wLine, indent, y); y += 4.5; }
        y += 1;
      }
    }
  }

  if (inTable) flushTable();
  return y;
}

/**
 * Adds page numbers to all pages — Pounamu Teal accent
 */
export function addPageNumbers(doc: jsPDF, margin = 20): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...POUNAMU_TEAL);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }
}

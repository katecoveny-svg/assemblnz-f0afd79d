import jsPDF from "jspdf";
import {
  drawAssemblPDFHeader,
  drawAssemblPDFFooter,
  renderMarkdownToPDF,
} from "@/lib/pdfBranding";
import type { MeetingItem } from "@/components/hui/MeetingList";

export interface HuiNotesPayload {
  decisions: string[];
  actions: { who: string; what: string; due?: string }[];
  highlights: string[];
  parking: string[];
  notes: string;
}

const MARGIN = 20;

const formatWhen = (start: string, end?: string) => {
  const s = new Date(start).toLocaleString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!end) return s;
  const e = new Date(end).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${s} – ${e}`;
};

const buildMarkdown = (meeting: MeetingItem, payload: HuiNotesPayload): string => {
  const attendees = (meeting.attendees ?? [])
    .map((a) => a.displayName || a.email)
    .filter(Boolean);

  const lines: string[] = [];
  lines.push(`**When:** ${formatWhen(meeting.start, meeting.end)}`);
  if (attendees.length) lines.push(`**Attendees:** ${attendees.join(", ")}`);
  if (meeting.description) {
    lines.push("");
    lines.push("## Brief");
    lines.push(meeting.description);
  }

  if (payload.decisions.length) {
    lines.push("");
    lines.push("## Decisions");
    payload.decisions.forEach((d) => lines.push(`- ${d}`));
  }

  if (payload.actions.length) {
    lines.push("");
    lines.push("## Action items");
    payload.actions.forEach((a) => {
      const due = a.due ? ` _(due ${a.due})_` : "";
      lines.push(`- **${a.who}** — ${a.what}${due}`);
    });
  }

  if (payload.highlights.length) {
    lines.push("");
    lines.push("## Key highlights");
    payload.highlights.forEach((h) => lines.push(`- ${h}`));
  }

  if (payload.parking.length) {
    lines.push("");
    lines.push("## Parking lot");
    payload.parking.forEach((p) => lines.push(`- ${p}`));
  }

  const trimmedNotes = payload.notes?.trim();
  if (trimmedNotes) {
    lines.push("");
    lines.push("## Notes");
    lines.push(trimmedNotes);
  }

  return lines.join("\n");
};

const safeFile = (label: string, title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "hui";
  return `hui-${label}-${slug}.pdf`;
};

export const exportHuiNotesPdf = (meeting: MeetingItem, payload: HuiNotesPayload) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const title = meeting.summary || "Hui meeting notes";

  const y = drawAssemblPDFHeader(doc, {
    agentName: "HUI",
    agentDesignation: "Meeting Copilot",
    documentTitle: title,
    subtitle: formatWhen(meeting.start, meeting.end),
    margin: MARGIN,
  });

  renderMarkdownToPDF(doc, buildMarkdown(meeting, payload), { startY: y, margin: MARGIN });
  drawAssemblPDFFooter(doc, { agentName: "HUI", margin: MARGIN });

  doc.save(safeFile("notes", title));
};

export const exportHuiSummaryPdf = (meeting: MeetingItem, summary: string) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const title = meeting.summary || "Hui executive summary";

  const y = drawAssemblPDFHeader(doc, {
    agentName: "HUI",
    agentDesignation: "Meeting Copilot",
    documentTitle: title,
    subtitle: `Executive summary · ${formatWhen(meeting.start, meeting.end)}`,
    margin: MARGIN,
  });

  const attendees = (meeting.attendees ?? [])
    .map((a) => a.displayName || a.email)
    .filter(Boolean);

  const md: string[] = [];
  if (attendees.length) md.push(`**Attendees:** ${attendees.join(", ")}`);
  md.push("");
  md.push("## Summary");
  md.push(summary?.trim() || "Summary unavailable.");

  renderMarkdownToPDF(doc, md.join("\n"), { startY: y, margin: MARGIN });
  drawAssemblPDFFooter(doc, { agentName: "HUI", margin: MARGIN });

  doc.save(safeFile("summary", title));
};

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Word-compatible HTML download (.doc) — opens in Word, Pages, Google Docs. */
export const exportHuiNotesDoc = (meeting: MeetingItem, payload: HuiNotesPayload) => {
  const title = meeting.summary || "Hui meeting notes";
  const attendees = (meeting.attendees ?? [])
    .map((a) => a.displayName || a.email)
    .filter(Boolean);

  const section = (heading: string, body: string) =>
    body ? `<h2>${escapeHtml(heading)}</h2>${body}` : "";

  const list = (items: string[]) =>
    items.length
      ? `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      : "";

  const actionsList = payload.actions.length
    ? `<ul>${payload.actions
        .map(
          (a) =>
            `<li><strong>${escapeHtml(a.who)}</strong> — ${escapeHtml(a.what)}${
              a.due ? ` <em>(due ${escapeHtml(a.due)})</em>` : ""
            }</li>`
        )
        .join("")}</ul>`
    : "";

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #3D4250; line-height: 1.5; }
    h1 { font-size: 24pt; color: #6F6158; margin-bottom: 4pt; }
    h2 { font-size: 14pt; color: #9D8C7D; margin-top: 18pt; margin-bottom: 6pt; }
    p, li { font-size: 11pt; }
    .meta { color: #9D8C7D; font-size: 10pt; margin-bottom: 18pt; }
    hr { border: none; border-top: 1px solid #D8C8B4; margin: 12pt 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(formatWhen(meeting.start, meeting.end))}${
    attendees.length ? ` · ${escapeHtml(attendees.join(", "))}` : ""
  }</p>
  <hr />
  ${meeting.description ? section("Brief", `<p>${escapeHtml(meeting.description)}</p>`) : ""}
  ${section("Decisions", list(payload.decisions))}
  ${section("Action items", actionsList)}
  ${section("Key highlights", list(payload.highlights))}
  ${section("Parking lot", list(payload.parking))}
  ${
    payload.notes?.trim()
      ? section(
          "Notes",
          `<p>${escapeHtml(payload.notes.trim()).replace(/\n/g, "<br />")}</p>`
        )
      : ""
  }
  <hr />
  <p class="meta">Generated by Hui · Assembl</p>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  downloadBlob(blob, safeFile("notes", title).replace(/\.pdf$/, ".doc"));
};

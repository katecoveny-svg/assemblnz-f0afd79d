import type { SchoolSurvivalItem } from "./newsletter-parser";

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function compactDate(date: string): string {
  return date.replace(/-/g, "");
}

function compactDateTime(date: string, time?: string): string {
  const safeTime = time && /^\d{2}:\d{2}$/.test(time) ? time : "09:00";
  return `${compactDate(date)}T${safeTime.replace(":", "")}00`;
}

function reminderFor(item: SchoolSurvivalItem): string {
  if (item.kind === "event" || item.kind === "sport" || item.kind === "music") {
    return "-P7D";
  }
  if (item.kind === "gear") {
    return "-PT2H";
  }
  return "-P1D";
}

function descriptionFor(item: SchoolSurvivalItem): string {
  const parts = [
    item.amount ? `Amount: NZ$${item.amount}` : null,
    item.item ? `Item: ${item.item}` : null,
    item.child_year_level ? `Year level: ${item.child_year_level}` : null,
    item.source_paragraph ? `Source: ${item.source_paragraph}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

export function generateSchoolSurvivalIcs({
  id,
  items,
}: {
  id: string;
  items: SchoolSurvivalItem[];
}): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const events = items.map((item, index) => {
    const dtStart = item.time ? compactDateTime(item.date, item.time) : compactDate(item.date);
    const dateLine = item.time ? `DTSTART;TZID=Pacific/Auckland:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`;
    const dueLine = item.time ? "" : `\nDTEND;VALUE=DATE:${dtStart}`;
    return [
      "BEGIN:VEVENT",
      `UID:toro-school-survival-${id}-${index}@assembl.co.nz`,
      `DTSTAMP:${now}`,
      dateLine,
      dueLine.trim(),
      `SUMMARY:${escapeIcs(item.title)}`,
      `DESCRIPTION:${escapeIcs(descriptionFor(item))}`,
      "BEGIN:VALARM",
      `TRIGGER:${reminderFor(item)}`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(item.title)}`,
      "END:VALARM",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//assembl//toro school survival//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

// WTD index page → per-section PDF pointers + chapter spans + titles.
// Never invents codes, rates, or dates — only extracts what the page states.

export interface WtdSection {
  roman: string; // "VIII"
  chapters: number[]; // [41, 42, 43]
  title: string; // "Raw hides and skins, leather, ..."
  pdfUrl: string;
  effective: string | null; // "1 January 2026" when present beside the link
}

const ORIGIN = "https://www.customs.govt.nz";

/** Decode the handful of entities Customs uses in section titles. */
export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&apos;/gi, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#x2019;/gi, "'")
    .replace(/&#x2013;/gi, "–")
    .replace(/&ndash;/gi, "–")
    .replace(/&#x2014;/gi, "—")
    .replace(/&mdash;/gi, "—")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function expandChapters(chapterSpan: string): number[] {
  const nums = chapterSpan.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 2 && nums[1] > nums[0]) {
    const chapters: number[] = [];
    for (let c = nums[0]; c <= nums[1]; c++) chapters.push(c);
    return chapters;
  }
  return nums;
}

/** "Section VIII, Chapters 41 - 43: Raw hides…" → structured fields. */
export function parseSectionLabel(
  label: string,
): { roman: string; chapters: number[]; title: string } | null {
  const cleaned = decodeHtmlEntities(label).replace(/\s+/g, " ").trim();
  const m = cleaned.match(
    /^Section\s+([IVXLC]+)\s*,\s*Chapters?\s+([\d\s\-–—]+)\s*:\s*(.+)$/i,
  );
  if (!m) return null;
  const title = m[3].replace(/\s*\(pdf\b[^)]*\)\s*$/i, "").trim();
  if (!title) return null;
  const chapters = expandChapters(m[2]);
  if (chapters.length === 0) return null;
  return { roman: m[1].toUpperCase(), chapters, title };
}

function absolutePdfUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return `${ORIGIN}${href.startsWith("/") ? href : `/${href}`}`;
}

function effectiveNear(html: string, from: number): string | null {
  const tail = html.slice(from, from + 1600);
  const eff = tail.match(/Effective\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  return eff ? eff[1] : null;
}

/**
 * Pull WTD section rows from the customs.govt.nz Working Tariff index HTML.
 *
 * Supports:
 *   1. Current layout (2026): `/media/.../section-viii.pdf` + title text in
 *      `download-block__title` ("Section VIII, Chapters 41 - 43: …").
 *   2. Legacy layout: `title="Section VIII, Chapters …"` on the PDF `<a>`.
 *   3. Filename + nearby plain-text fallback if class names drift.
 *
 * Returns sections in document order; duplicates (same roman) are skipped.
 */
export function parseWtdSections(
  html: string,
): { sections: WtdSection[]; docEffective: string | null } {
  const sections: WtdSection[] = [];
  const seen = new Set<string>();

  const push = (s: WtdSection) => {
    if (seen.has(s.roman)) return;
    if (s.chapters.length === 0 || !s.title || !s.pdfUrl) return;
    seen.add(s.roman);
    sections.push(s);
  };

  // ── Current: section-{roman}.pdf + download-block__title text ────────────
  const currentRe =
    /href="((?:https?:\/\/www\.customs\.govt\.nz)?\/media\/[^"]*\/section-([ivxlc]+)\.pdf)"[^>]*>[\s\S]*?download-block__title[^>]*>\s*([\s\S]*?)(?:<span\s+class="download-block__meta"|<\/span>)/gi;
  let m: RegExpExecArray | null;
  while ((m = currentRe.exec(html)) !== null) {
    const [, href, romanFromFile, rawInner] = m;
    const label = decodeHtmlEntities(
      rawInner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    );
    const parsed = parseSectionLabel(label) ??
      parseSectionLabel(
        `Section ${romanFromFile.toUpperCase()}, ${label}`,
      );
    if (!parsed) continue;
    push({
      roman: parsed.roman,
      chapters: parsed.chapters,
      title: parsed.title,
      pdfUrl: absolutePdfUrl(href),
      effective: effectiveNear(html, m.index),
    });
  }

  // ── Legacy: title="Section VIII, Chapters …" on the anchor ───────────────
  if (sections.length === 0) {
    const legacyRe =
      /href="((?:https?:\/\/www\.customs\.govt\.nz)?\/media\/[^"]+\.pdf)"[^>]*title="(Section\s+[IVXLC]+[^"]*)"/gi;
    while ((m = legacyRe.exec(html)) !== null) {
      const [, href, titleAttr] = m;
      const parsed = parseSectionLabel(titleAttr);
      if (!parsed) continue;
      push({
        roman: parsed.roman,
        chapters: parsed.chapters,
        title: parsed.title,
        pdfUrl: absolutePdfUrl(href),
        effective: effectiveNear(html, m.index),
      });
    }
  }

  // ── Filename + nearby text fallback (class / attribute drift) ────────────
  if (sections.length === 0) {
    const fileRe =
      /href="((?:https?:\/\/www\.customs\.govt\.nz)?\/media\/[^"]*\/section-([ivxlc]+)\.pdf)"/gi;
    while ((m = fileRe.exec(html)) !== null) {
      const [, href, romanFromFile] = m;
      const window = html.slice(m.index, m.index + 2500);
      const text = decodeHtmlEntities(
        window.replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " "),
      );
      const labelMatch = text.match(
        /Section\s+([IVXLC]+)\s*,\s*Chapters?\s+([\d\s\-–—]+)\s*:\s*([^]+?)(?:\s*\(pdf\b|\s{2,}|$)/i,
      );
      if (!labelMatch) continue;
      const parsed = parseSectionLabel(labelMatch[0]);
      if (!parsed) continue;
      // Prefer roman from the label; filename is the backup identity key.
      const roman = parsed.roman || romanFromFile.toUpperCase();
      push({
        roman,
        chapters: parsed.chapters,
        title: parsed.title,
        pdfUrl: absolutePdfUrl(href),
        effective: effectiveNear(html, m.index),
      });
    }
  }

  const doc = html.match(
    /recent updates,\s*effective\s+(\d{1,2}\s+\w+\s+\d{4})/i,
  );
  return { sections, docEffective: doc ? doc[1] : null };
}

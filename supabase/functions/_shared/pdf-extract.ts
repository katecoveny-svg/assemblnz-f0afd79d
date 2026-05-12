// ════════════════════════════════════════════════════════════════════════
// pdf-extract — text extraction from forwarded PDF newsletters.
//
// NZ school newsletters from Hero/SchoolBridge/Kindo are predominantly
// text-based PDFs, so unpdf's text extraction covers the acceptance path
// (Sacred Heart / Baradene). For scanned or image-only PDFs the extracted
// text comes back too short to be useful — the caller can then route the
// inbound through a Claude vision fallback (callClaudeVision below).
//
// We deliberately don't run the vision fallback inline here — the caller
// knows the attachment type (image/png from a Hero notification screenshot
// vs. application/pdf from a forwarded newsletter) and picks the path.
//
// unpdf is Deno-compatible via esm.sh. It pulls pdf.js under the hood
// without DOM dependencies, which is what makes it edge-function safe
// (no canvas, no XHR, just typed arrays in / strings out).
// ════════════════════════════════════════════════════════════════════════

import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

export type PdfExtractStatus = "ok" | "empty" | "likely_scanned" | "error";

export interface PdfExtractResult {
  status: PdfExtractStatus;
  text: string;
  page_count: number;
  /** Raw error message if status === "error". */
  error?: string;
}

/**
 * The threshold below which we treat the extracted text as "likely_scanned"
 * — i.e. the PDF is probably an image, not a text-bearing doc, and the
 * caller should consider a vision fallback.
 *
 * Picked to be slightly larger than what a one-page banner-only PDF would
 * yield from pdf.js (typically <60 chars of header/footer cruft).
 */
const LIKELY_SCANNED_THRESHOLD = 120;

/**
 * Extract text from a forwarded PDF attachment.
 *
 * Returns `status: 'ok'` when we got a usable text run; `'likely_scanned'`
 * when text is too short to parse meaningfully; `'empty'` when the doc has
 * zero pages; `'error'` when unpdf failed (corrupted PDF, password-protected,
 * etc.). The caller falls back to vision (or `parse_failed` draft) per the
 * status.
 */
export async function extractPdfText(
  bytes: Uint8Array,
): Promise<PdfExtractResult> {
  try {
    const doc = await getDocumentProxy(bytes);

    // unpdf's extractText({ mergePages: true }) returns the combined text
    // as a single string AND the page count. For an empty doc this is
    // { totalPages: 0, text: '' }, which we report as "empty".
    const { totalPages, text } = await extractText(doc, { mergePages: true });

    if (totalPages === 0) {
      return { status: "empty", text: "", page_count: 0 };
    }

    const normalised = normaliseText(text);

    if (normalised.length < LIKELY_SCANNED_THRESHOLD) {
      return {
        status: "likely_scanned",
        text: normalised,
        page_count: totalPages,
      };
    }

    return { status: "ok", text: normalised, page_count: totalPages };
  } catch (err) {
    return {
      status: "error",
      text: "",
      page_count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Collapse the runs of whitespace pdf.js emits between table cells and
 * pretty-print page breaks. We keep blank lines (parser benefits from
 * paragraph breaks) but knock down 4+ spaces / 3+ newlines.
 */
function normaliseText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]{4,}/g, "    ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Vision fallback — used by the caller for image attachments (Hero screenshots)
// or for likely_scanned PDFs where text extraction yielded nothing useful.
//
// This calls the Anthropic Messages API directly because the shared
// `callLlm` helper only handles text-content turns. Returns the model's
// raw text response — the caller pipes that into `parseNotice` exactly
// like it would for a PDF-extracted text run.
//
// Image bytes are passed in as a Uint8Array along with the mediaType
// ('image/png', 'image/jpeg', 'application/pdf'). The function base64-
// encodes them inline.
// ─────────────────────────────────────────────────────────────────────────────

export interface VisionFallbackResult {
  ok: boolean;
  text: string;
  error?: string;
}

export async function callClaudeVision(
  bytes: Uint8Array,
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif" | "application/pdf",
  prompt: string,
  model = "claude-opus-4-7",
): Promise<VisionFallbackResult> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    return { ok: false, text: "", error: "ANTHROPIC_API_KEY missing" };
  }

  const base64 = base64Encode(bytes);

  // Anthropic uses different block types per media kind: image blocks for
  // raster formats, document blocks for PDFs.
  const contentBlock = mediaType === "application/pdf"
    ? {
        type: "document" as const,
        source: { type: "base64" as const, media_type: mediaType, data: base64 },
      }
    : {
        type: "image" as const,
        source: { type: "base64" as const, media_type: mediaType, data: base64 },
      };

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        // PDF document blocks require this beta header.
        ...(mediaType === "application/pdf"
          ? { "anthropic-beta": "pdfs-2024-09-25" }
          : {}),
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return { ok: false, text: "", error: `anthropic ${upstream.status}: ${errText.slice(0, 300)}` };
    }

    const raw = await upstream.json();
    const text = Array.isArray(raw?.content)
      ? raw.content
          .filter((b: { type?: string }) => b?.type === "text")
          .map((b: { text?: string }) => b.text ?? "")
          .join("\n")
      : "";

    return { ok: true, text };
  } catch (err) {
    return {
      ok: false,
      text: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Base64-encode arbitrary bytes for Anthropic's content blocks. */
function base64Encode(bytes: Uint8Array): string {
  let s = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    s += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)),
    );
  }
  return btoa(s);
}

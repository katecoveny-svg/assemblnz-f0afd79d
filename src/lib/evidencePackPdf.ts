/**
 * Unified Evidence Pack PDF service.
 *
 * Single entry point used by every kete dashboard and the chat composer to
 * generate branded "Proof of Life" evidence packs. Writes a row to
 * `evidence_packs` and triggers a client download.
 *
 * Wraps the canonical generator in `pdfBranding.ts` (kete-aware colours,
 * cross-agent attribution, sign-off block, compliance pipeline footer).
 */
import { generateEvidencePackPDF, type CrossAgentSection } from "@/lib/pdfBranding";
import { supabase } from "@/integrations/supabase/client";

export interface EvidencePackInput {
  /** Canonical kete slug — drives accent colour and branding */
  kete: string;
  /** Document title shown in header */
  title: string;
  /** Optional client / project name shown in subtitle */
  client?: string;
  /** Optional one-paragraph executive summary */
  summary?: string;
  /** Body sections — each rendered with cross-agent attribution */
  sections: CrossAgentSection[];
  /** Document version label (e.g. "v1.0") */
  version?: string;
  /** Optional simulation flag — appended to summary when true */
  simulated?: boolean;
}

export interface EvidencePackResult {
  packId: string;
  watermark: string;
  filename: string;
  rowId?: string;
}

/** Build the `ASSEMBL-{KETE}-{ts}-{shortid}` watermark. */
function buildWatermark(kete: string): { id: string; watermark: string } {
  const ts = Date.now();
  const short = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8);
  const id = `${ts}-${short}`;
  return { id, watermark: `ASSEMBL-${kete.toUpperCase()}-${id}` };
}

/**
 * Generate a branded evidence pack PDF, save metadata to `evidence_packs`,
 * and trigger a client download. Idempotent at the call-site — caller decides
 * when to invoke it.
 */
export async function generateAndDownloadEvidencePack(
  input: EvidencePackInput,
): Promise<EvidencePackResult> {
  const { kete, title, client, summary, sections, version, simulated } = input;
  const { id, watermark } = buildWatermark(kete);

  const finalSummary = simulated
    ? `${summary ? summary + "\n\n" : ""}SIMULATED — generated from sample context. Not for filing.`
    : summary;

  const doc = generateEvidencePackPDF({
    title,
    packId: watermark,
    client,
    keteSlug: kete,
    summary: finalSummary,
    sections,
    documentVersion: version ?? "v1.0",
  });

  const safeTitle = title.replace(/[^a-z0-9\-_]+/gi, "-").replace(/-+/g, "-").slice(0, 60);
  const filename = `${kete}-${safeTitle}-${id}.pdf`;

  // Trigger download
  doc.save(filename);

  // Best-effort write to evidence_packs (non-blocking on failure)
  let rowId: string | undefined;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("evidence_packs")
        .insert({
          user_id: user.id,
          kete,
          action_type: "evidence_pack_generated",
          request_id: id,
          watermark,
          evidence_json: {
            title,
            client,
            simulated: !!simulated,
            summary: finalSummary,
            section_count: sections.length,
            agent_sources: [...new Set(sections.map((s) => s.agent))],
            version: version ?? "v1.0",
            sections: sections.map((s) => ({
              agent: s.agent,
              title: s.title,
              status: s.status,
              legislation_ref: s.legislationRef,
            })),
          },
        })
        .select("id")
        .single();
      if (!error && data) rowId = data.id as string;
    }
  } catch {
    // Persistence is best-effort — the PDF download already succeeded
  }

  return { packId: watermark, watermark, filename, rowId };
}

/**
 * Convenience: build a pack from a chat conversation transcript.
 * Splits the transcript into one section per assistant message.
 */
export async function generateEvidencePackFromConversation(opts: {
  kete: string;
  agentName: string;
  agentDesignation?: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<EvidencePackResult> {
  const { kete, agentName, agentDesignation, title, messages } = opts;
  const assistantMessages = messages.filter(
    (m) => m.role === "assistant" && typeof m.content === "string" && m.content.trim().length > 0,
  );

  const sections: CrossAgentSection[] = assistantMessages.slice(0, 12).map((m, idx) => ({
    agent: agentName,
    designation: agentDesignation,
    title: `Response ${idx + 1}`,
    body: m.content.slice(0, 2400),
    status: "pass" as const,
  }));

  if (sections.length === 0) {
    sections.push({
      agent: agentName,
      designation: agentDesignation,
      title: "Conversation summary",
      body: "No assistant responses captured yet — start a conversation to populate this pack.",
      status: "flag" as const,
    });
  }

  const summary = `Evidence pack compiled from a live conversation with ${agentName}. ` +
    `${assistantMessages.length} agent response${assistantMessages.length === 1 ? "" : "s"} captured.`;

  return generateAndDownloadEvidencePack({
    kete,
    title,
    summary,
    sections,
    version: "v1.0",
  });
}

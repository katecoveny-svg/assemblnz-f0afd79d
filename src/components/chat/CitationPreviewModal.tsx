import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CitationPreviewModalProps {
  chunkId: string | null;
  fallbackCitation?: string;
  fallbackSource?: string;
  fallbackTier?: number;
  onClose: () => void;
}

interface ChunkRow {
  id: string;
  kete: string;
  tier: number;
  doc_title: string | null;
  source_url: string | null;
  chunk_text: string;
  chunk_index: number;
}

/**
 * Modal that opens when a user clicks a citation in the GroundingBadge.
 * Fetches the cited chunk's text from `industry_kb_chunks` so users can
 * audit the exact passage the agent grounded on, and provides a deep
 * link out to the source URL when available.
 */
export function CitationPreviewModal({
  chunkId,
  fallbackCitation,
  fallbackSource,
  fallbackTier,
  onClose,
}: CitationPreviewModalProps) {
  const [chunk, setChunk] = useState<ChunkRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chunkId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setChunk(null);

    (async () => {
      const { data, error: err } = await supabase
        .from("industry_kb_chunks")
        .select("id, kete, tier, doc_title, source_url, chunk_text, chunk_index")
        .eq("id", chunkId)
        .maybeSingle();

      if (cancelled) return;
      if (err) setError(err.message);
      else if (!data) setError("This citation is no longer available in the knowledge base.");
      else setChunk(data as ChunkRow);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [chunkId]);

  useEffect(() => {
    if (!chunkId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chunkId, onClose]);

  if (!chunkId) return null;

  const sourceUrl = chunk?.source_url ?? (fallbackSource && /^https?:\/\//i.test(fallbackSource) ? fallbackSource : null);
  const title = chunk?.doc_title ?? fallbackCitation ?? "Cited passage";
  const tier = chunk?.tier ?? fallbackTier;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(61, 66, 80, 0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Citation preview"
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(142,129,119,0.18)",
          boxShadow: "0 20px 60px rgba(111,97,88,0.18)",
          fontFamily: "'Inter', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: "rgba(142,129,119,0.14)" }}
        >
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] uppercase tracking-wider mb-1"
              style={{ color: "#9D8C7D", letterSpacing: "0.08em" }}
            >
              {chunk?.kete ? `${chunk.kete} · ` : ""}{tier ? `Tier ${tier} source` : "Source"}
            </div>
            <h2
              className="text-lg leading-tight"
              style={{
                color: "#6F6158",
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
              }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" style={{ color: "#6F6158" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#6F6158" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading cited passage…
            </div>
          )}

          {error && !loading && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: "#F0CFCD", color: "#7A3A36" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Unable to load passage</div>
                <div className="text-xs mt-0.5 opacity-90">{error}</div>
              </div>
            </div>
          )}

          {chunk && !loading && (
            <div className="space-y-3">
              <div
                className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-2xl"
                style={{
                  background: "rgba(247,243,238,0.7)",
                  border: "1px solid rgba(142,129,119,0.10)",
                  color: "#3D4250",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12.5px",
                }}
              >
                {chunk.chunk_text}
              </div>
              <div className="text-[10px]" style={{ color: "#9D8C7D" }}>
                Passage {chunk.chunk_index + 1} · chunk_id: <code>{chunk.id.slice(0, 8)}…</code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-2 px-5 py-3 border-t"
          style={{ borderColor: "rgba(142,129,119,0.14)", background: "rgba(247,243,238,0.4)" }}
        >
          <span className="text-[11px]" style={{ color: "#6F6158" }}>
            Audit-grade citation. Verify against the original source.
          </span>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: "#D9BC7A",
                color: "#6F6158",
              }}
            >
              Open source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default CitationPreviewModal;

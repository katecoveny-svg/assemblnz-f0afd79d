import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface ParsedResult {
  summary: string;
  keyFindings: { label: string; value: string }[];
  complianceFlags: string[];
  recommendations: string[];
}

interface KeteDocUploadProps {
  keteSlug: string;
  keteColor: string;
  keteName: string;
  /** Extra context for the AI about what kind of documents to expect */
  docContext?: string;
  onParsed?: (result: ParsedResult) => void;
  className?: string;
}

const ACCEPTED_TYPES = ".pdf,.txt,.md,.csv,.docx,.doc,.jpg,.jpeg,.png,.webp";

export default function KeteDocUpload({
  keteSlug,
  keteColor,
  keteName,
  docContext = "",
  onParsed,
  className = "",
}: KeteDocUploadProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const parseDocument = useCallback(async (file: File) => {
    if (!user) {
      toast.error("Sign in to use document intelligence");
      return;
    }

    setUploading(true);
    setResult(null);
    setFileName(file.name);

    try {
      // Extract text content from file
      let textContent = "";
      if (file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name)) {
        textContent = await file.text();
      } else if (file.type.startsWith("image/")) {
        // Convert image to base64 for AI vision
        const buffer = await file.arrayBuffer();
        const base64 = arrayBufferToBase64(new Uint8Array(buffer));
        textContent = `[Image uploaded: ${file.name}]\n[base64:${base64.slice(0, 50000)}]`;
      } else {
        // For PDFs/docx, read as text (basic) or send raw
        try {
          textContent = await file.text();
        } catch {
          textContent = `[Binary document uploaded: ${file.name} (${file.type})]`;
        }
      }

      const truncated = textContent.slice(0, 12000);

      const prompt = `You are an AI document parser for the ${keteName} kete (${keteSlug}) at Assembl. ${docContext}

Parse this uploaded document and extract structured intelligence. Return your response in this exact JSON format:
{
  "summary": "2-3 sentence summary of the document",
  "keyFindings": [{"label": "Field Name", "value": "extracted value"}],
  "complianceFlags": ["any compliance issues or flags found"],
  "recommendations": ["actionable recommendations based on the document"]
}

Document filename: ${file.name}
Document content:
${truncated}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            agentId: keteSlug,
          }),
        }
      );

      if (!res.ok) throw new Error(`AI parse failed (${res.status})`);

      // Read streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) full += c;
          } catch { /* partial */ }
        }
      }

      // Extract JSON from response
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: ParsedResult = JSON.parse(jsonMatch[0]);
        setResult(parsed);
        onParsed?.(parsed);
        toast.success("Document parsed successfully");
      } else {
        // Fallback: create structured result from raw text
        setResult({
          summary: full.slice(0, 300),
          keyFindings: [{ label: "Raw Analysis", value: full.slice(0, 500) }],
          complianceFlags: [],
          recommendations: [],
        });
        onParsed?.({
          summary: full.slice(0, 300),
          keyFindings: [{ label: "Raw Analysis", value: full.slice(0, 500) }],
          complianceFlags: [],
          recommendations: [],
        });
      }
    } catch (err: any) {
      console.error("Doc parse error:", err);
      toast.error("Failed to parse document", { description: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [user, keteSlug, keteName, docContext, onParsed]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseDocument(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseDocument(file);
  }, [parseDocument]);

  return (
    <div className={className}>
      <div
        className="rounded-2xl border p-4 space-y-3 transition-all"
        style={{
          background: `linear-gradient(135deg, ${keteColor}08, transparent)`,
          borderColor: dragOver ? keteColor : `${keteColor}20`,
          boxShadow: dragOver ? `0 0 20px ${keteColor}20` : "none",
        }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${keteColor}15` }}>
            <Sparkles size={14} style={{ color: keteColor }} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground font-display">Document Intelligence</h3>
            <p className="text-[10px] text-muted-foreground">AI-powered document parsing for {keteName}</p>
          </div>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:border-opacity-40"
          style={{ borderColor: `${keteColor}25` }}
        >
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="mx-auto w-fit"
            >
              <Loader2 size={28} style={{ color: keteColor }} />
            </motion.div>
          ) : (
            <Upload size={28} className="mx-auto" style={{ color: `${keteColor}60` }} />
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {uploading ? `Parsing ${fileName}...` : "Drop a document here or click to upload"}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            PDF, DOCX, TXT, CSV, JPG, PNG • Max 10MB
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFile}
          className="hidden"
        />

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(14,14,26,0.85)", border: `1px solid ${keteColor}20` }}
            >
              {/* Scan line */}
              <div
                className="h-[2px] animate-pulse"
                style={{ background: `linear-gradient(90deg, transparent, ${keteColor}, transparent)`, opacity: 0.5 }}
              />

              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} style={{ color: keteColor }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: keteColor }}>
                      Document Scanned
                    </span>
                  </div>
                  <button onClick={() => setResult(null)} className="text-muted-foreground/40 hover:text-foreground">
                    <X size={12} />
                  </button>
                </div>

                {/* Summary */}
                <p className="text-[11px] text-muted-foreground leading-relaxed">{result.summary}</p>

                {/* Key findings */}
                {result.keyFindings.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-foreground/70">Key Findings</p>
                    {result.keyFindings.map((f, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground shrink-0">{f.label}:</span>
                        <span className="text-[10px] text-foreground font-medium text-right">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Compliance flags */}
                {result.complianceFlags.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[#4AA5A8]/80">Compliance Flags</p>
                    {result.complianceFlags.map((flag, i) => (
                      <p key={i} className="text-[10px] text-[#4AA5A8]/60 flex gap-1.5">
                        <span>•</span><span>{flag}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-foreground/70">Recommendations</p>
                    {result.recommendations.map((rec, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                        <span style={{ color: keteColor }}>→</span><span>{rec}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

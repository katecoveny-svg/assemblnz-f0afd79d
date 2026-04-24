import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateAndDownloadEvidencePack } from "@/lib/evidencePackPdf";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  agentDesignation?: string;
  keteCode: string;
  accent: string;
  onCompleted?: () => void;
}

const MAX_BYTES = 15 * 1024 * 1024; // 15MB per file
const MAX_FILES = 5;

/**
 * UploadEvidencePackDialog — lets a user attach source documents and
 * generate a branded evidence pack linked to the agent's kete.
 *
 * Files upload to the private `evidence-uploads` bucket under the user's
 * own folder. The generated PDF includes a manifest of attached files
 * and the metadata row links the pack to the agent's kete.
 */
export default function UploadEvidencePackDialog({
  open,
  onOpenChange,
  agentName,
  agentDesignation,
  keteCode,
  accent,
  onCompleted,
}: Props) {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle("");
    setClient("");
    setNotes("");
    setFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const accepted: File[] = [];
    for (const f of picked) {
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 15MB and was skipped`);
        continue;
      }
      accepted.push(f);
    }
    const combined = [...files, ...accepted].slice(0, MAX_FILES);
    if (files.length + accepted.length > MAX_FILES) {
      toast.warning(`Only the first ${MAX_FILES} files are kept per pack`);
    }
    setFiles(combined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Give the pack a title before generating");
      return;
    }
    if (!keteCode) {
      toast.error("This agent isn't bound to a kete — pack cannot be filed");
      return;
    }

    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to generate a pack");

      // 1. Upload each file to evidence-uploads/{user_id}/{ts}-{name}
      const uploaded: Array<{ name: string; path: string; size: number; type: string }> = [];
      for (const f of files) {
        const safeName = f.name.replace(/[^a-z0-9.\-_]+/gi, "-").slice(0, 80);
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("evidence-uploads")
          .upload(path, f, { upsert: false, contentType: f.type || undefined });
        if (upErr) throw new Error(`Failed to upload ${f.name}: ${upErr.message}`);
        uploaded.push({ name: f.name, path, size: f.size, type: f.type || "unknown" });
      }

      // 2. Build the pack with a "Source documents" section + optional notes
      const sections = [
        ...(notes.trim()
          ? [{
              agent: agentName,
              designation: agentDesignation,
              title: "Submitter notes",
              body: notes.trim(),
              status: "pass" as const,
            }]
          : []),
        {
          agent: agentName,
          designation: agentDesignation,
          title: "Source documents",
          body: uploaded.length === 0
            ? "No source documents were attached to this pack."
            : uploaded
                .map((u, i) => `${i + 1}. ${u.name} — ${(u.size / 1024).toFixed(1)} KB · ${u.type}`)
                .join("\n"),
          status: "pass" as const,
        },
        {
          agent: agentName,
          designation: agentDesignation,
          title: "Provenance",
          body: `Submitted via ${agentName}'s workspace on ${new Date().toLocaleString("en-NZ")}. ` +
                `Files stored privately in evidence-uploads. ` +
                `This pack is filed against the ${keteCode} kete.`,
          status: "pass" as const,
        },
      ];

      const result = await generateAndDownloadEvidencePack({
        kete: keteCode.toLowerCase(),
        title: title.trim(),
        client: client.trim() || undefined,
        summary: `Evidence pack generated by ${agentName} from ${uploaded.length} attached source document${uploaded.length === 1 ? "" : "s"}.`,
        sections,
        version: "v1.0",
      });

      toast.success("Evidence pack generated", { description: result.filename });
      reset();
      onOpenChange(false);
      onCompleted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate pack");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: accent }}>Generate evidence pack</DialogTitle>
          <DialogDescription>
            Attach source documents and {agentName} will generate a branded pack filed against the{" "}
            <span className="font-mono text-xs">{keteCode || "—"}</span> kete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pack-title">Pack title</Label>
            <Input
              id="pack-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Privacy Compliance — Acme Ltd"
              maxLength={140}
              disabled={busy}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pack-client">Client or project (optional)</Label>
            <Input
              id="pack-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Acme Ltd · 24 Apr 2026"
              maxLength={140}
              disabled={busy}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pack-notes">Notes for the pack (optional)</Label>
            <Textarea
              id="pack-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this pack is being filed, what to look for, who signs off..."
              rows={3}
              maxLength={2000}
              disabled={busy}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Source documents (up to {MAX_FILES} · 15MB each)</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || files.length >= MAX_FILES}
              className="w-full"
            >
              <Upload size={14} className="mr-2" />
              {files.length === 0 ? "Choose files" : `Add more (${files.length}/${MAX_FILES})`}
            </Button>
            {files.length > 0 && (
              <ul className="space-y-1 mt-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs"
                    style={{ background: "rgba(0,0,0,0.04)" }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={12} className="shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={busy}
                      aria-label={`Remove ${f.name}`}
                      className="ml-2 hover:opacity-70 disabled:opacity-30"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy || !title.trim()} style={{ background: accent }}>
            {busy ? (
              <><Loader2 size={14} className="mr-2 animate-spin" /> Generating…</>
            ) : (
              <><FileText size={14} className="mr-2" /> Generate pack</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

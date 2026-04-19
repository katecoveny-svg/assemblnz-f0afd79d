import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const HELM_COLOR = "#3A6A9C";

interface InboxMessage { id: string; subject: string | null; sender: string | null; status: string; received_at: string; raw_text: string | null; }

export default function HelmInbox({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const { data } = await supabase.from("inbox_messages").select("*").eq("family_id", fm.family_id).order("received_at", { ascending: false });
        setMessages(data || []);
      }
    })();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !familyId) return;
    
    setUploading(true);
    try {
      // Read file as text (for now, PDFs would need parsing)
      let text = "";
      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        text = await file.text();
      } else {
        text = `[Uploaded file: ${file.name} (${file.type})] — AI parsing would extract content here`;
      }

      const { data } = await supabase.from("inbox_messages").insert({
        family_id: familyId,
        subject: file.name.replace(/\.[^.]+$/, ""),
        sender: "Uploaded",
        raw_text: text,
        status: "pending",
      }).select().single();

      if (data) {
        setMessages([data, ...messages]);
        // Trigger AI parsing via chat
        onSendToChat?.(`Parse this school notice and extract events and tasks:\n\n${text.slice(0, 2000)}`);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "parsed": return <CheckCircle size={12} className="text-[#5AADA0]" />;
      case "pending": return <Clock size={12} className="text-[#4AA5A8]" />;
      default: return <AlertCircle size={12} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/90">School Notice Inbox</h2>
        <button onClick={() => fileRef.current?.click()} disabled={uploading || !familyId}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:bg-white/10"
          style={{ background: HELM_COLOR + "15", color: HELM_COLOR, border: `1px solid ${HELM_COLOR}30` }}>
          <Upload size={12} />
          {uploading ? "Processing..." : "Upload Notice"}
        </button>
      </div>
      
      <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp" onChange={handleUpload} className="hidden" />

      <div className="rounded-lg p-3" style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}>
        <p className="text-[11px] text-white/60">Upload school newsletters, notices, or emails. TORO's AI will extract events, tasks, and deadlines automatically.</p>
        <p className="text-[10px] text-gray-400 mt-1">Supports: PDF, TXT, JPG, PNG, WEBP</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={32} style={{ color: HELM_COLOR }} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm text-white/40">No notices yet</p>
          <p className="text-xs text-white/25 mt-1">Upload a school newsletter to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className="rounded-lg p-3 flex items-start gap-3 cursor-pointer transition hover:bg-white/[0.03]"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
              onClick={() => onSendToChat?.(`Review this school notice: ${msg.subject}\n\n${msg.raw_text?.slice(0, 1500)}`)}>
              <FileText size={16} style={{ color: HELM_COLOR }} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-white/80 truncate">{msg.subject || "Untitled"}</p>
                  {statusIcon(msg.status)}
                </div>
                {msg.sender && <p className="text-[10px] text-gray-400 mt-0.5">From: {msg.sender}</p>}
                {msg.raw_text && <p className="text-[10px] text-white/20 mt-1 line-clamp-2">{msg.raw_text.slice(0, 150)}</p>}
              </div>
              <span className="text-[9px] text-white/20 font-mono shrink-0">{new Date(msg.received_at).toLocaleDateString("en-NZ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

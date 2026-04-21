import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateEvidencePackFromConversation } from "@/lib/evidencePackPdf";
import { AGENT_KETE_MAP } from "@/lib/pdfBranding";

interface Props {
  messages: Array<{ role: string; content: string }>;
  agentName: string;
  agentDesignation?: string;
  agentColor: string;
}

export default function ChatEvidencePackButton({ messages, agentName, agentDesignation, agentColor }: Props) {
  const [busy, setBusy] = useState(false);
  const assistantCount = messages.filter((m) => m.role === "assistant").length;
  if (assistantCount < 3) return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      const kete = AGENT_KETE_MAP[agentName.toUpperCase()] ?? "platform";
      const result = await generateEvidencePackFromConversation({
        kete: kete === "platform" ? "manaaki" : kete,
        agentName,
        agentDesignation,
        title: `Conversation Evidence Pack — ${agentName}`,
        messages,
      });
      toast.success("Evidence pack downloaded", { description: result.filename });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate pack");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title="Generate branded evidence pack from this conversation"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 disabled:opacity-50"
      style={{ backgroundColor: agentColor + "15", color: agentColor, border: `1px solid ${agentColor}30` }}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      <span className="hidden sm:inline">Evidence Pack</span>
    </button>
  );
}

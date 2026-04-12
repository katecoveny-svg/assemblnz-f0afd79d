import { useState } from "react";
import { Download, Share2, Check } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter, renderMarkdownToPDF, AGENT_KETE_MAP } from "@/lib/pdfBranding";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  agentName: string;
  agentDesignation: string;
  agentColor: string;
}

const ConversationExport = ({ messages, agentName, agentDesignation, agentColor }: Props) => {
  const [shared, setShared] = useState(false);

  const handleExport = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 20;

    const keteSlug = AGENT_KETE_MAP[agentName.toUpperCase()] || undefined;
    const resolvedKete = keteSlug === "platform" ? undefined : keteSlug;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      agentDesignation,
      documentTitle: `${agentName} Conversation`,
      subtitle: `Exported on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      margin,
      keteSlug: resolvedKete,
    });

    for (const msg of messages) {
      const sender = msg.role === "user" ? "You" : agentName;
      const cleanContent = msg.content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim();

      y = renderMarkdownToPDF(doc, cleanContent, {
        startY: y,
        margin,
        senderLabel: sender,
        senderColor: msg.role === "user" ? [100, 100, 120] : [20, 20, 35],
      });

      y += 4;
    }

    drawAssemblPDFFooter(doc, { agentName, margin, keteSlug: resolvedKete });

    const fileName = `assembl-${agentName.toLowerCase()}-conversation-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exported_outputs").insert({
          user_id: user.id,
          agent_id: agentName.toLowerCase(),
          agent_name: agentName,
          output_type: "conversation",
          title: `${agentName} Conversation Export`,
          content_preview: messages.slice(-2).map(m => m.content.substring(0, 80)).join(" | "),
          format: "pdf",
        });
      }
    } catch { /* silent */ }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${agentName} Conversation — Assembl`,
      text: `Check out my ${agentName} conversation on Assembl`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-medium transition-colors hover:opacity-80 shrink-0"
        style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
        title="Export conversation as PDF"
        aria-label="Export conversation as PDF"
      >
        <Download size={10} />
        <span className="hidden sm:inline">Export</span>
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-medium transition-colors hover:opacity-80 shrink-0"
        style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
        title="Share conversation"
        aria-label="Share conversation"
      >
        {shared ? <Check size={10} /> : <Share2 size={10} />}
        <span className="hidden sm:inline">{shared ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
};

export default ConversationExport;

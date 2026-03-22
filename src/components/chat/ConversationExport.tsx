import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter } from "@/lib/pdfBranding";
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
  const handleExport = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      agentDesignation,
      documentTitle: `${agentName} Conversation`,
      subtitle: `Exported on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      margin,
    });

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPage = (needed: number) => { if (y + needed > 255) addPage(); };

    // Messages
    for (const msg of messages) {
      checkPage(15);
      const sender = msg.role === "user" ? "You" : agentName;

      // Sender label with coloured underline
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(msg.role === "user" ? 80 : 20);
      doc.text(sender, margin, y);

      // Subtle underline
      const senderWidth = doc.getTextWidth(sender);
      doc.setDrawColor(msg.role === "user" ? 180 : 100);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 1, margin + senderWidth, y + 1);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40);

      // Process content line by line for better formatting
      const contentLines = msg.content.split("\n");
      for (const rawLine of contentLines) {
        const trimmed = rawLine.trim();
        if (!trimmed) { y += 2; continue; }

        const h2 = trimmed.match(/^##\s+(.*)/);
        const h3 = trimmed.match(/^###\s+(.*)/);

        if (h2) {
          checkPage(8);
          doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30);
          doc.text(h2[1], margin, y); y += 6;
        } else if (h3) {
          checkPage(7);
          doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(45);
          doc.text(h3[1], margin, y); y += 5.5;
        } else {
          let text = trimmed
            .replace(/^#+\s*/g, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/^[-*]\s*\[([ xX])\]\s*/g, (_, c) => (c.trim() ? "☑ " : "☐ "))
            .replace(/^[-*]\s+/g, "• ");

          doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(40);
          const lines = doc.splitTextToSize(text, maxWidth);
          for (const line of lines) {
            checkPage(5);
            doc.text(line, margin, y);
            y += 4.5;
          }
        }
      }
      y += 5;
    }

    // Footer on all pages
    drawAssemblPDFFooter(doc, { agentName, margin });

    const fileName = `assembl-${agentName.toLowerCase()}-conversation-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    // Log export
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

  if (messages.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-jakarta font-medium transition-colors hover:opacity-80 shrink-0"
      style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
      title="Export conversation as PDF"
      aria-label="Export conversation as PDF"
    >
      <Download size={10} />
      <span className="hidden sm:inline">Export</span>
    </button>
  );
};

export default ConversationExport;

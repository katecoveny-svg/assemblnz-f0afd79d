import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter } from "@/lib/pdfBranding";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  content: string;
  agentId: string;
  agentName: string;
  agentDesignation?: string;
  agentColor: string;
}

const MessagePDFButton = ({ content, agentId, agentName, agentDesignation, agentColor }: Props) => {
  const handleDownload = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Detect a title from the content
    const titleMatch = content.match(/^#+\s+(.{5,80})/m);
    const docTitle = titleMatch?.[1]?.replace(/[#*]/g, "").trim() || `${agentName} Output`;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      agentDesignation,
      documentTitle: docTitle,
      subtitle: `Generated on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}`,
      margin,
    });

    const contentLines = content.split("\n");
    for (const rawLine of contentLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) { y += 3; continue; }

      const h1 = trimmed.match(/^#\s+(.*)/);
      const h2 = trimmed.match(/^##\s+(.*)/);
      const h3 = trimmed.match(/^###\s+(.*)/);

      if (h1) {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(20, 20, 35);
        doc.text(h1[1], margin, y); y += 8;
      } else if (h2) {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 60);
        doc.text(h2[1], margin, y); y += 7;
      } else if (h3) {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 50, 70);
        doc.text(h3[1], margin, y); y += 6;
      } else {
        let text = trimmed
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/^[-*]\s*\[([ xX])\]\s*/g, (_, c) => (c.trim() ? "☑ " : "☐ "))
          .replace(/^[-*]\s+/g, "• ")
          .replace(/^\d+\.\s+/g, (m) => m);

        const isBold = /\*\*/.test(rawLine);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(40);

        const wrapped = doc.splitTextToSize(text, maxWidth);
        for (const wLine of wrapped) {
          if (y > 255) { doc.addPage(); y = 20; }
          doc.text(wLine, margin, y);
          y += 4.5;
        }
        y += 1;
      }
    }

    drawAssemblPDFFooter(doc, { agentName, margin });

    const fileName = `${agentName.toLowerCase()}-${docTitle.toLowerCase().replace(/\s+/g, "-").substring(0, 40)}.pdf`;
    doc.save(fileName);

    // Log export
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exported_outputs").insert({
          user_id: user.id,
          agent_id: agentId,
          agent_name: agentName,
          output_type: "chat_output",
          title: docTitle,
          content_preview: content.substring(0, 300),
          format: "pdf",
        });
      }
    } catch { /* silent */ }
  };

  // Only show for messages with meaningful content
  if (content.length < 80) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleDownload}
          className="p-1 rounded-md transition-colors hover:opacity-80"
          style={{ color: "hsl(0 0% 100% / 0.15)" }}
          aria-label="Download as PDF"
        >
          <FileDown size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">Download as PDF</TooltipContent>
    </Tooltip>
  );
};

export default MessagePDFButton;

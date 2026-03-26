import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter, renderMarkdownToPDF } from "@/lib/pdfBranding";
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
    const margin = 20;

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

    // Render content using shared markdown renderer
    const cleanContent = content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim();
    renderMarkdownToPDF(doc, cleanContent, { startY: y, margin });

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
import { useState } from "react";
import { Copy, Download, Check, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import HelmChecklist from "@/components/helm/HelmChecklist";
import { drawAssemblPDFHeader, drawAssemblPDFFooter, renderMarkdownToPDF } from "@/lib/pdfBranding";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  title: string;
  content: string;
  agentName: string;
  agentColor: string;
  hasChecklist?: boolean;
}

function detectOutputType(content: string): string | null {
  const lower = content.toLowerCase();
  const patterns: [RegExp, string][] = [
    [/^#+\s*(checklist|compliance checklist|safety checklist|audit|h&s)/im, "Compliance Checklist"],
    [/^#+\s*(tax calculation|gst calculation|duty calculation|calculator)/im, "Tax Calculation"],
    [/^#+\s*(template|agreement|policy|contract|terms)/im, "Generated Template"],
    [/^#+\s*(plan|meal plan|budget|schedule|calendar)/im, "Generated Plan"],
    [/^#+\s*(report|status report|inspection|assessment)/im, "Report"],
    [/^#+\s*(checklist|moving checklist|preparation|document checklist)/im, "Checklist"],
    [/import entry summary/i, "Import Entry Summary"],
    [/^#+\s*(proposal|brief|charter|register)/im, "Document"],
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(content)) return label;
  }

  const checklistCount = (content.match(/^[-*]\s*\[([ xX])\]/gm) || []).length;
  if (checklistCount >= 3) return "Checklist";

  const tableRows = (content.match(/^\|.*\|$/gm) || []).length;
  if (tableRows >= 3) return "Data Table";

  const numberedSteps = (content.match(/^\d+\.\s+/gm) || []).length;
  if (numberedSteps >= 5) return "Step-by-Step Guide";

  const headers = (content.match(/^#+\s+/gm) || []).length;
  if (headers >= 3 && content.length > 800) return "Structured Output";

  return null;
}

const StructuredOutputCard = ({ title, content, agentName, agentColor, hasChecklist }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logExport("csv");
  };

  const logExport = async (format: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        agent_id: agentName.toLowerCase(),
        agent_name: agentName,
        output_type: detectOutputType(content) || "document",
        title,
        content_preview: content.substring(0, 200),
        format,
      });
    } catch { /* silent */ }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      documentTitle: title,
      subtitle: `Generated on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}`,
      margin,
    });

    // Content rendering with proper formatting using shared renderer
    renderMarkdownToPDF(doc, content, { startY: y, margin });

    // Footer on all pages
    drawAssemblPDFFooter(doc, { agentName, margin });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    logExport("pdf");
  };

  const renderContent = () => {
    if (!hasChecklist) {
      return (
        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-foreground prose-strong:text-foreground font-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }

    const lines = content.split("\n");
    const parts: { type: "text" | "checklist"; content: string }[] = [];
    let currentText = "";
    let checklistLines: string[] = [];

    const flushText = () => { if (currentText.trim()) { parts.push({ type: "text", content: currentText }); currentText = ""; } };
    const flushChecklist = () => { if (checklistLines.length) { parts.push({ type: "checklist", content: checklistLines.join("\n") }); checklistLines = []; } };

    for (const line of lines) {
      if (/^[-*]\s*\[([ xX])\]/.test(line.trim())) {
        flushText();
        checklistLines.push(line);
      } else {
        flushChecklist();
        currentText += line + "\n";
      }
    }
    flushText();
    flushChecklist();

    return (
      <>
        {parts.map((p, i) =>
          p.type === "checklist" ? (
            <HelmChecklist key={i} content={p.content} />
          ) : (
            <div key={i} className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-foreground prose-strong:text-foreground font-body">
              <ReactMarkdown>{p.content}</ReactMarkdown>
            </div>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="rounded-xl overflow-hidden my-2"
      style={{
        background: "#0F0F1C",
        borderLeft: `3px solid ${agentColor}`,
        border: `1px solid ${agentColor}15`,
        borderLeftWidth: 3,
        borderLeftColor: agentColor,
      }}
    >
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${agentColor}10` }}>
        <span className="text-xs font-display font-bold" style={{ color: agentColor }}>
          {title}
        </span>
      </div>

      <div className="px-4 py-3 text-sm">
        {renderContent()}
      </div>

      <div className="px-4 py-2.5 flex gap-2 flex-wrap" style={{ borderTop: `1px solid ${agentColor}10` }}>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-colors"
          style={{ background: agentColor + "12", color: agentColor, border: `1px solid ${agentColor}20` }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-colors"
          style={{ background: agentColor + "12", color: agentColor, border: `1px solid ${agentColor}20` }}
        >
          <FileDown size={11} />
          Download as PDF
        </button>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-colors"
          style={{ background: agentColor + "12", color: agentColor, border: `1px solid ${agentColor}20` }}
        >
          <Download size={11} />
          Download as CSV
        </button>
      </div>
    </div>
  );
};

export { detectOutputType };
export default StructuredOutputCard;

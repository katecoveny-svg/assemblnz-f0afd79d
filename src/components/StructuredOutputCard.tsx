import { useState } from "react";
import { Copy, Download, Check, FileDown, Share2, Link2 } from "lucide-react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import HelmChecklist from "@/components/helm/HelmChecklist";
import { drawAssemblPDFHeader, drawAssemblPDFFooter, renderMarkdownToPDF, AGENT_KETE_MAP } from "@/lib/pdfBranding";
import { supabase } from "@/integrations/supabase/client";
import TikangaCheckButton from "@/components/TikangaCheckButton";
import NZExportPresets from "@/components/NZExportPresets";
import HITLSignOff from "@/components/HITLSignOff";

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
  const [linkCopied, setLinkCopied] = useState(false);
  const outputType = detectOutputType(content) || "AI Output";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} — ${agentName} via Assembl`,
      text: content.substring(0, 280) + (content.length > 280 ? "…" : ""),
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      // Fallback — copy link
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
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
    const margin = 20;
    const keteSlug = AGENT_KETE_MAP[agentName.toUpperCase()] || undefined;
    const resolvedKete = keteSlug === "platform" ? undefined : keteSlug;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      documentTitle: title,
      subtitle: `Generated on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}`,
      margin,
      keteSlug: resolvedKete,
    });

    renderMarkdownToPDF(doc, content, { startY: y, margin });
    drawAssemblPDFFooter(doc, { agentName, margin, keteSlug: resolvedKete });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    logExport("pdf");
  };

  const renderContent = () => {
    if (!hasChecklist) {
      return (
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] [&_h1]:text-[#3D4250] [&_h2]:text-[#3D4250] [&_h3]:text-[#3D4250] font-body">
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
            <div key={i} className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] [&_h1]:text-[#3D4250] [&_h2]:text-[#3D4250] [&_h3]:text-[#3D4250] font-body">
              <ReactMarkdown>{p.content}</ReactMarkdown>
            </div>
          )
        )}
      </>
    );
  };

  const ActionBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all duration-200 hover:brightness-125"
      style={{
        background: `${agentColor}12`,
        color: agentColor,
        border: `1px solid ${agentColor}20`,
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="rounded-xl overflow-hidden my-2"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(74, 165, 168, 0.15)",
        borderLeft: `3px solid ${agentColor}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(212, 168, 67, 0.08)" }}
      >
        <span className="text-xs font-display uppercase tracking-widest" style={{ color: agentColor, letterSpacing: "3px" }}>
          {title}
        </span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-body font-medium transition-all duration-200 hover:brightness-125"
          style={{
            color: agentColor,
            border: `1px solid ${agentColor}25`,
            background: `${agentColor}08`,
          }}
          title="Share this output"
        >
          {linkCopied ? <Check size={10} /> : <Share2 size={10} />}
          {linkCopied ? "Link copied" : "Share"}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 text-sm">
        {renderContent()}
      </div>

      {/* Action bar */}
      <div
        className="px-4 py-2.5 flex gap-2 flex-wrap"
        style={{ borderTop: "1px solid rgba(212, 168, 67, 0.08)" }}
      >
        <ActionBtn onClick={handleCopy}>
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </ActionBtn>
        <ActionBtn onClick={handleDownloadPDF}>
          <FileDown size={11} />
          PDF
        </ActionBtn>
        <ActionBtn onClick={handleDownloadCSV}>
          <Download size={11} />
          CSV
        </ActionBtn>
        <ActionBtn onClick={handleShare}>
          <Link2 size={11} />
          Share
        </ActionBtn>
      </div>

      {/* Tikanga Check & NZ Export Presets */}
      <div
        className="px-4 py-2 flex flex-wrap gap-2"
        style={{ borderTop: "1px solid rgba(212, 168, 67, 0.06)" }}
      >
        <TikangaCheckButton content={content} agentName={agentName} agentColor={agentColor} />
        <NZExportPresets content={content} title={title} agentName={agentName} agentColor={agentColor} />
      </div>

      {/* HITL Sign-Off */}
      <div className="px-4 pb-3">
        <HITLSignOff
          outputId={`${agentName}-${Date.now()}`}
          outputType={outputType || "AI Output"}
          agentName={agentName}
          content={content}
        />
      </div>
    </div>
  );
};

export { detectOutputType };
export default StructuredOutputCard;

import { useState } from "react";
import { FileDown, Monitor, Smartphone, FileText, Building2, HardHat, UtensilsCrossed, GraduationCap, Heart, Landmark, ChevronDown, ChevronUp, Check } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter, renderMarkdownToPDF, AGENT_KETE_MAP } from "@/lib/pdfBranding";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  content: string;
  title: string;
  agentName: string;
  agentColor?: string;
}

interface ExportPreset {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  description: string;
  format: string;
  specs?: Record<string, string>;
}

const PRESETS: ExportPreset[] = [
  // Media
  { id: "herald-social", label: "NZ Herald / Stuff", category: "Media", icon: Monitor, description: "Social media ad dimensions for NZ news sites", format: "image", specs: { "Facebook": "1200×628px", "Instagram": "1080×1080px", "Story": "1080×1920px" } },
  { id: "tvnz-15", label: "TVNZ / Three — 15s", category: "Media", icon: Monitor, description: "15-second broadcast spec", format: "video", specs: { "Resolution": "1920×1080", "Duration": "15s", "Codec": "H.264", "Audio": "AAC 48kHz" } },
  { id: "tvnz-30", label: "TVNZ / Three — 30s", category: "Media", icon: Monitor, description: "30-second broadcast spec", format: "video", specs: { "Resolution": "1920×1080", "Duration": "30s", "Codec": "H.264", "Audio": "AAC 48kHz" } },
  { id: "nz-mobile", label: "NZ Mobile Ads", category: "Media", icon: Smartphone, description: "Spark/Vodafone/One NZ mobile banner specs", format: "image", specs: { "Banner": "320×50px", "MREC": "300×250px", "Interstitial": "320×480px" } },

  // Government
  { id: "companies-office", label: "Companies Office", category: "Government", icon: Building2, description: "Annual return & company report format", format: "pdf", specs: { "Format": "A4 PDF", "Font": "Arial 11pt", "Margins": "25mm" } },
  { id: "mbie-report", label: "MBIE Compliance", category: "Government", icon: Landmark, description: "MBIE-formatted compliance report", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "NZISM compliant", "Classification": "IN-CONFIDENCE" } },
  { id: "ird-filing", label: "IRD Filing", category: "Government", icon: FileText, description: "IR format for tax documents", format: "pdf", specs: { "Format": "A4 PDF", "IRD#": "Required field", "Period": "YYYY-MM" } },
  { id: "privacy-commissioner", label: "Privacy Commissioner", category: "Government", icon: FileText, description: "Privacy breach notification format", format: "pdf", specs: { "Standard": "Privacy Act 2020", "Section": "s114", "Timeline": "72h" } },

  // Industry
  { id: "moe-education", label: "Ministry of Education", category: "Industry", icon: GraduationCap, description: "Education sector report format", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "MoE Template", "Reference": "Education Act 2020" } },
  { id: "moh-health", label: "Ministry of Health", category: "Industry", icon: Heart, description: "Health & safety compliance format", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "HSWA 2015", "Classification": "Health Information" } },
  { id: "mbie-construction", label: "Building & Construction", category: "Industry", icon: HardHat, description: "Building consent & inspection format", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "Building Act 2004", "Code": "NZBC" } },
  { id: "mpi-hospitality", label: "MPI Food Safety", category: "Industry", icon: UtensilsCrossed, description: "Food Control Plan & verification format", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "Food Act 2014", "Plan": "FCP Template" } },
  { id: "worksafe-report", label: "WorkSafe NZ", category: "Industry", icon: HardHat, description: "Incident & hazard notification format", format: "pdf", specs: { "Format": "A4 PDF", "Standard": "HSWA 2015", "Form": "Notifiable Event" } },
];

const CATEGORIES = [...new Set(PRESETS.map(p => p.category))];

const NZExportPresets = ({ content, title, agentName, agentColor = "#D4A843" }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());

  const handleExport = async (preset: ExportPreset) => {
    setExporting(preset.id);

    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const margin = 25; // NZ Govt standard
      const keteSlug = AGENT_KETE_MAP[agentName.toUpperCase()] || undefined;
      const resolvedKete = keteSlug === "platform" ? undefined : keteSlug;

      // Header with preset context
      let y = drawAssemblPDFHeader(doc, {
        agentName,
        documentTitle: title,
        subtitle: `${preset.label} Export — ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}`,
        margin,
        keteSlug: resolvedKete,
      });

      // Preset metadata block
      if (preset.specs) {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        y += 2;
        doc.text(`FORMAT: ${preset.label.toUpperCase()}`, margin, y);
        y += 4;
        for (const [key, val] of Object.entries(preset.specs)) {
          doc.text(`${key}: ${val}`, margin + 2, y);
          y += 3.5;
        }
        y += 4;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, 210 - margin, y);
        y += 6;
      }

      // Content
      renderMarkdownToPDF(doc, content, { startY: y, margin });

      // Footer
      drawAssemblPDFFooter(doc, { agentName, margin, keteSlug: resolvedKete });

      // Classification watermark for govt docs
      if (preset.category === "Government") {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(180, 180, 180);
          doc.text("DRAFT — NOT FOR OFFICIAL SUBMISSION WITHOUT REVIEW", 105, 290, { align: "center" });
        }
      }

      const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-${preset.id}.pdf`;
      doc.save(filename);

      // Log export
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("exported_outputs").insert({
            user_id: user.id,
            agent_id: agentName.toLowerCase(),
            agent_name: agentName,
            output_type: preset.label,
            title,
            content_preview: content.substring(0, 200),
            format: `pdf-${preset.id}`,
          });
        }
      } catch { /* silent */ }

      setExported(prev => new Set([...prev, preset.id]));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all duration-200 hover:brightness-125"
        style={{
          background: `${agentColor}12`,
          color: agentColor,
          border: `1px solid ${agentColor}20`,
        }}
      >
        <FileDown size={11} />
        NZ Export Presets
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {expanded && (
        <div
          className="mt-2 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${agentColor}15`,
          }}
        >
          {CATEGORIES.map(cat => (
            <div key={cat}>
              <div
                className="px-4 py-2 text-[9px] font-display uppercase tracking-[3px]"
                style={{ color: agentColor, borderBottom: `1px solid ${agentColor}08` }}
              >
                {cat}
              </div>
              <div className="px-3 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESETS.filter(p => p.category === cat).map(preset => {
                  const Icon = preset.icon;
                  const isDone = exported.has(preset.id);
                  const isLoading = exporting === preset.id;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleExport(preset)}
                      disabled={isLoading}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all hover:bg-white/[0.04] disabled:opacity-50 group"
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all group-hover:scale-105"
                        style={{ background: `${agentColor}10`, border: `1px solid ${agentColor}15` }}
                      >
                        {isDone ? (
                          <Check size={12} style={{ color: "#00A86B" }} />
                        ) : isLoading ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" style={{ color: agentColor }} />
                        ) : (
                          <Icon size={12} style={{ color: agentColor }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-body font-medium text-[#1A1D29] block">{preset.label}</span>
                        <span className="text-[9px] font-body text-gray-400 block">{preset.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NZExportPresets;

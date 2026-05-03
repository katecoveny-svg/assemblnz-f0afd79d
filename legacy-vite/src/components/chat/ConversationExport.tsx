import { useState, useRef, useEffect } from "react";
import { Download, Share2, Check, FileText, FileJson, ChevronDown } from "lucide-react";
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
  agentId?: string;
}

const ConversationExport = ({ messages, agentName, agentDesignation, agentColor, agentId }: Props) => {
  const [shared, setShared] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const baseFileName = () =>
    `assembl-${agentName.toLowerCase()}-conversation-${new Date().toISOString().split("T")[0]}`;

  const logExport = async (format: "pdf" | "json") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exported_outputs").insert({
          user_id: user.id,
          agent_id: (agentId ?? agentName).toLowerCase(),
          agent_name: agentName,
          output_type: "conversation",
          title: `${agentName} Conversation Export`,
          content_preview: messages.slice(-2).map(m => m.content.substring(0, 80)).join(" | "),
          format,
        });
      }
    } catch { /* silent */ }
  };

  const handleExportPDF = async () => {
    setMenuOpen(false);
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
    doc.save(`${baseFileName()}.pdf`);
    void logExport("pdf");
  };

  const handleExportJSON = async () => {
    setMenuOpen(false);
    const payload = {
      schema: "assembl.conversation.v1",
      exportedAt: new Date().toISOString(),
      agent: {
        id: agentId ?? agentName.toLowerCase(),
        name: agentName,
        designation: agentDesignation,
        color: agentColor,
      },
      messageCount: messages.length,
      messages: messages.map((m, i) => ({
        index: i,
        role: m.role,
        content: m.content,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFileName()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    void logExport("json");
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
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-medium transition-colors hover:opacity-80 shrink-0"
          style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
          title="Export conversation"
          aria-label="Export conversation"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Download size={10} />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown size={9} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-1 z-50 min-w-[160px] rounded-lg overflow-hidden shadow-xl"
            style={{
              background: "rgba(14,14,26,0.96)",
              border: `1px solid ${agentColor}30`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <button
              role="menuitem"
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-body text-left transition-colors hover:bg-white/5"
              style={{ color: "#E8EEEC" }}
            >
              <FileText size={12} style={{ color: agentColor }} />
              <span className="flex-1">PDF report</span>
              <span className="text-[9px] opacity-50">.pdf</span>
            </button>
            <button
              role="menuitem"
              onClick={handleExportJSON}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-body text-left transition-colors hover:bg-white/5 border-t border-white/5"
              style={{ color: "#E8EEEC" }}
            >
              <FileJson size={12} style={{ color: agentColor }} />
              <span className="flex-1">JSON transcript</span>
              <span className="text-[9px] opacity-50">.json</span>
            </button>
          </div>
        )}
      </div>

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

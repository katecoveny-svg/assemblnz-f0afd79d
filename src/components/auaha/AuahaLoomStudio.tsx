import { useState } from "react";
import { motion } from "framer-motion";
import { MonitorPlay, Link2, ExternalLink, Play, Copy, Check, Plus, Trash2, Video } from "lucide-react";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import { toast } from "sonner";

const ACCENT = "#F0D078";

interface LoomEmbed {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
}

function extractLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
  return match ? match[1] : null;
}

export default function AuahaLoomStudio() {
  const [looms, setLooms] = useState<LoomEmbed[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const addLoom = () => {
    const loomId = extractLoomId(inputUrl);
    if (!loomId) {
      toast.error("Please paste a valid Loom share URL");
      return;
    }
    const newLoom: LoomEmbed = {
      id: loomId,
      title: inputTitle || `Loom ${looms.length + 1}`,
      url: inputUrl,
      embedUrl: `https://www.loom.com/embed/${loomId}`,
    };
    setLooms((prev) => [newLoom, ...prev]);
    setInputUrl("");
    setInputTitle("");
    toast.success("Loom added");
  };

  const removeLoom = (id: string) => {
    setLooms((prev) => prev.filter((l) => l.id !== id));
    toast.success("Loom removed");
  };

  const copyEmbed = (embedUrl: string, id: string) => {
    const code = `<div style="position:relative;padding-bottom:56.25%;height:0"><iframe src="${embedUrl}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe></div>`;
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Embed code copied");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
          <MonitorPlay className="w-5 h-5" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-foreground text-xl font-light uppercase tracking-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
            Loom Studio
          </h1>
          <p className="text-[#6B7280] text-xs" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Record walkthroughs, embed demos, and share client presentations
          </p>
        </div>
      </motion.div>

      {/* Add Loom */}
      <DashboardGlassCard accentColor={ACCENT} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4" style={{ color: ACCENT }} />
          <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]" style={{ fontFamily: "Lato, sans-serif" }}>Add Loom Video</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Title (optional)"
            className="flex-shrink-0 w-full sm:w-40 px-4 py-2.5 rounded-xl text-sm text-[#1A1D29] placeholder:text-[#8B92A0] outline-none transition-all focus:ring-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            onFocus={(e) => (e.target.style.borderColor = `${ACCENT}40`)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste Loom share URL (e.g. https://www.loom.com/share/...)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[#1A1D29] placeholder:text-[#8B92A0] outline-none transition-all focus:ring-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            onFocus={(e) => (e.target.style.borderColor = `${ACCENT}40`)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            onKeyDown={(e) => e.key === "Enter" && addLoom()}
          />
          <button onClick={addLoom}
            className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #D4A843)`, color: "#09090F" }}>
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </DashboardGlassCard>

      {/* Loom Grid */}
      {looms.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {looms.map((loom, i) => (
            <motion.div key={loom.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <DashboardGlassCard accentColor={ACCENT} className="overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={loom.embedUrl}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                    title={loom.title}
                  />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[#1A1D29] text-sm font-medium">{loom.title}</p>
                    <a href={loom.url} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 mt-1 hover:underline" style={{ color: `${ACCENT}99` }}>
                      Open in Loom <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyEmbed(loom.embedUrl, loom.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(74,165,168,0.04)] transition-colors" title="Copy embed code">
                      {copied === loom.id ? <Check className="w-4 h-4 text-[#5AADA0]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                    </button>
                    <button onClick={() => removeLoom(loom.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(74,165,168,0.04)] transition-colors" title="Remove">
                      <Trash2 className="w-4 h-4 text-[#6B7280] hover:text-[#C85A54]" />
                    </button>
                  </div>
                </div>
              </DashboardGlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <DashboardGlassCard className="p-12 text-center">
          <Video className="w-10 h-10 mx-auto mb-4" style={{ color: `${ACCENT}40` }} />
          <p className="text-[#6B7280] text-sm mb-1">No Loom videos yet</p>
          <p className="text-[#8B92A0] text-xs">Paste a Loom share URL above to embed walkthrough videos</p>
        </DashboardGlassCard>
      )}

      {/* Tips */}
      <DashboardGlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Play className="w-3.5 h-3.5" style={{ color: ACCENT }} />
          <h4 className="text-[#6B7280] text-[10px] uppercase tracking-[2px]">Tips</h4>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-[#1A1D29]/35" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          <div>Record product walkthroughs for client onboarding and embed them directly in proposals.</div>
          <div>Use Loom's built-in analytics to see who watched and how far — great for sales follow-ups.</div>
          <div>Copy the embed code to paste into campaign landing pages or internal knowledge bases.</div>
        </div>
      </DashboardGlassCard>
    </div>
  );
}

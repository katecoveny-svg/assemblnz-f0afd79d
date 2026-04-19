import { useState } from "react";
import { Save, Trash2, Plus, Copy, Tag, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ACCENT = "#F0D078";

interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  type: "image" | "video";
  model: string;
  tags: string[];
  createdAt: string;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaPromptLibrary() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([
    { id: "1", name: "NZ Landscape Hero", prompt: "Cinematic drone shot of rolling green hills in Waikato at golden hour, warm light, editorial photography, no text overlay", type: "image", model: "fal-flux-pro", tags: ["hero", "landscape", "NZ"], createdAt: new Date().toISOString() },
    { id: "2", name: "Product Flatlay", prompt: "Minimalist product flatlay on light timber surface, soft shadows, warm tones, professional studio lighting", type: "image", model: "auto", tags: ["product", "ecommerce"], createdAt: new Date().toISOString() },
    { id: "3", name: "Social Reel Intro", prompt: "Dynamic text reveal animation, brand colors, energetic music-driven cuts, 9:16 vertical format", type: "video", model: "fal-kling", tags: ["social", "reel", "intro"], createdAt: new Date().toISOString() },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState<"image" | "video">("image");
  const [newTags, setNewTags] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const filtered = prompts.filter(p => filter === "all" || p.type === filter);

  const addPrompt = () => {
    if (!newName.trim() || !newPrompt.trim()) return toast.error("Name and prompt required");
    setPrompts(prev => [{
      id: Date.now().toString(),
      name: newName, prompt: newPrompt, type: newType,
      model: "auto", tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }, ...prev]);
    setShowNew(false); setNewName(""); setNewPrompt(""); setNewTags("");
    toast.success("Prompt saved to library");
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    toast.success("Prompt removed");
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied — paste in Generate Studio");
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Prompts</p>
          <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Prompt Library</h1>
          <p className="text-[#6B7280] text-sm mt-1">Team prompt templates with type + model tagging</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} size="sm" style={{ background: ACCENT, color: "#000" }}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Prompt
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "image", "video"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${f === filter ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
            style={f === filter ? { background: ACCENT } : {}}>
            {f === "all" ? "All" : f === "image" ? "Image" : "Video"}
          </button>
        ))}
        <span className="text-[#8B92A0] text-xs ml-auto self-center">{filtered.length} prompts</span>
      </div>

      {/* New prompt form */}
      {showNew && (
        <GlassCard className="p-5 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-[#8B92A0]"
            placeholder="Prompt name..." />
          <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)}
            className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm min-h-[80px] placeholder:text-[#8B92A0]"
            placeholder="Prompt text..." />
          <div className="flex gap-3">
            <div className="flex gap-2">
              {(["image", "video"] as const).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${t === newType ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
                  style={t === newType ? { background: ACCENT } : {}}>
                  {t}
                </button>
              ))}
            </div>
            <input value={newTags} onChange={e => setNewTags(e.target.value)}
              className="flex-1 bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-1.5 text-foreground text-xs placeholder:text-[#8B92A0]"
              placeholder="Tags (comma-separated)" />
            <Button onClick={addPrompt} size="sm" style={{ background: ACCENT, color: "#000" }}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Prompt cards */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#1A1D29]/10" />
          <p className="text-[#6B7280] text-sm">No prompts saved yet</p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <GlassCard key={p.id} className="p-5 group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[#1A1D29] text-sm font-medium">{p.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: `${ACCENT}15`, color: `${ACCENT}CC` }}>
                    {p.type} • {p.model}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyPrompt(p.prompt)} className="p-1.5 rounded-lg hover:bg-[rgba(74,165,168,0.06)] text-[#6B7280]">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deletePrompt(p.id)} className="p-1.5 rounded-lg hover:bg-[#C85A54]/10 text-[#6B7280] hover:text-[#C85A54]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[#6B7280] text-xs leading-relaxed line-clamp-3">{p.prompt}</p>
              {p.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {p.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280] flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

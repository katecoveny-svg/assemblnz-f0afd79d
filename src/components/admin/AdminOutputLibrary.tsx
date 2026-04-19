import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import {
  FolderOpen, Image, FileText, Video, PenTool, Download,
  Filter, RefreshCw, ExternalLink, Calendar,
} from "lucide-react";
import { toast } from "sonner";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};

type OutputType = "all" | "image" | "copy" | "ad" | "evidence" | "video";

interface OutputItem {
  id: string;
  title: string;
  type: string;
  agent: string;
  agentColor: string;
  preview?: string;
  imageUrl?: string;
  createdAt: string;
  source: "creative_assets" | "content_items" | "ad_creatives" | "exported_outputs";
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  copy: PenTool,
  ad: FileText,
  video: Video,
  evidence: FileText,
};

export default function AdminOutputLibrary() {
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OutputType>("all");

  const loadOutputs = async () => {
    setLoading(true);
    const items: OutputItem[] = [];

    // Creative assets (images, videos)
    const { data: creative } = await supabase
      .from("creative_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (creative) {
      creative.forEach((c) => {
        const agentInfo = agents.find((a) => a.id === c.user_id) || null;
        items.push({
          id: c.id,
          title: c.prompt || `${c.asset_type} asset`,
          type: c.asset_type === "video" ? "video" : "image",
          agent: c.style || "Creative Studio",
          agentColor: "#A8DDDB",
          imageUrl: c.thumbnail_url || c.file_url,
          preview: c.prompt?.substring(0, 100),
          createdAt: c.created_at || "",
          source: "creative_assets",
        });
      });
    }

    // Content items (copy)
    const { data: content } = await supabase
      .from("content_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (content) {
      content.forEach((c) => {
        items.push({
          id: c.id,
          title: c.title,
          type: "copy",
          agent: c.agent_attribution || "Copy Studio",
          agentColor: "#5AADA0",
          preview: c.body?.substring(0, 120),
          createdAt: c.created_at,
          source: "content_items",
        });
      });
    }

    // Ad creatives
    const { data: ads } = await supabase
      .from("ad_creatives")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (ads) {
      ads.forEach((a) => {
        items.push({
          id: a.id,
          title: a.headline,
          type: "ad",
          agent: a.agent_name || "Ad Manager",
          agentColor: "#4AA5A8",
          imageUrl: a.image_url || undefined,
          preview: a.primary_text?.substring(0, 120),
          createdAt: a.created_at || "",
          source: "ad_creatives",
        });
      });
    }

    // Sort by date
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOutputs(items);
    setLoading(false);
  };

  useEffect(() => { loadOutputs(); }, []);

  const filtered = filter === "all" ? outputs : outputs.filter((o) => o.type === filter);

  const typeCounts = outputs.reduce<Record<string, number>>((acc, o) => {
    acc[o.type] = (acc[o.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-light tracking-[3px] uppercase text-white/90"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Output Library
          </h2>
          <p className="text-sm text-white/40 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {outputs.length} outputs across all agents and studios
          </p>
        </div>
        <button
          onClick={loadOutputs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-medium text-white/40 hover:text-white/60 transition-all"
          style={GLASS}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "all", label: "All", count: outputs.length },
            { key: "image", label: "Images", count: typeCounts.image || 0 },
            { key: "copy", label: "Copy", count: typeCounts.copy || 0 },
            { key: "ad", label: "Ads", count: typeCounts.ad || 0 },
            { key: "video", label: "Video", count: typeCounts.video || 0 },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2.5 rounded-2xl text-[11px] font-medium transition-all ${
              filter === t.key ? "text-foreground" : "text-gray-400 hover:text-gray-500"
            }`}
            style={
              filter === t.key
                ? {
                    ...GLASS,
                    background: "linear-gradient(135deg, rgba(212,168,67,0.1), rgba(212,168,67,0.03))",
                    border: "1px solid rgba(212,168,67,0.2)",
                  }
                : GLASS
            }
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Output grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-10 h-10 mx-auto text-white/10 mb-4" />
          <p className="text-sm text-gray-400 mb-2">No outputs yet</p>
          <p className="text-xs text-white/15">
            Generate content from the Creative Studio, Ad Manager, or Copy Studio
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            return (
              <div
                key={`${item.source}-${item.id}`}
                className="group rounded-3xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
                style={GLASS}
              >
                {/* Image preview */}
                {item.imageUrl ? (
                  <div className="relative aspect-video overflow-hidden">
                    <img loading="lazy" decoding="async"
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span
                      className="absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-lg uppercase"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        color: item.agentColor,
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                ) : (
                  <div
                    className="aspect-video flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${item.agentColor}08, ${item.agentColor}03)`,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: `${item.agentColor}30` }} />
                  </div>
                )}

                <div className="p-4">
                  <p className="text-[12px] font-medium text-white/80 line-clamp-2 mb-2">{item.title}</p>
                  {item.preview && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 mb-3">{item.preview}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: `${item.agentColor}12`, color: item.agentColor }}
                      >
                        {item.agent}
                      </span>
                    </div>
                    <span className="text-[9px] text-white/20 font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-NZ") : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

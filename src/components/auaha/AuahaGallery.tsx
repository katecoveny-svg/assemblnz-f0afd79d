import { useState } from "react";
import { Image, Video, Filter, Download, Eye, Clock, Shield, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const ACCENT = "#A8DDDB";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaGallery() {
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  const { data: assets = [] } = useQuery({
    queryKey: ["auaha-gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("creative_assets").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const filtered = assets.filter((a: any) => {
    if (filter !== "all" && a.asset_type !== filter) return false;
    if (search && !a.prompt?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Gallery</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Inter, sans-serif' }}>Gallery</h1>
        <p className="text-[#6B7280] text-sm mt-1">All generated assets with provider metadata and Kahu status</p>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {(["all", "image", "video"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${f === filter ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
                style={f === filter ? { background: ACCENT } : {}}>
                {f === "all" ? "All" : f === "image" ? "Images" : "Videos"}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A0]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-foreground text-xs placeholder:text-[#8B92A0]"
              placeholder="Search by prompt..." />
          </div>
          <span className="text-[#6B7280] text-xs">{filtered.length} assets</span>
        </div>
      </GlassCard>

      {/* Grid */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Image className="w-12 h-12 mx-auto mb-3 text-[#1A1D29]/10" />
          <p className="text-[#6B7280] text-sm">No assets yet</p>
          <p className="text-[#1A1D29]/15 text-[10px] mt-1">Generate images or videos in the Generate Studio</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((asset: any) => (
            <GlassCard key={asset.id} className="overflow-hidden group">
              <div className="aspect-square bg-[rgba(26,29,41,0.04)] relative overflow-hidden">
                {asset.asset_type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-[#8B92A0]" />
                  </div>
                ) : (
                  <img loading="lazy" decoding="async" src={asset.file_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <a href={asset.file_url} target="_blank" rel="noopener noreferrer" className="text-[#2A2F3D] hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </a>
                    <a href={asset.file_url} download className="text-[#2A2F3D] hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {/* Provider badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FAFBFC]/60 text-[9px] text-[#4A5160]">
                  {(asset.metadata as any)?.provider || "lovable"}
                </div>
              </div>
              <div className="p-3">
                <p className="text-[#4A5160] text-[11px] line-clamp-2">{asset.prompt || "No prompt"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-[#8B92A0]" />
                  <span className="text-[#8B92A0] text-[10px]">{formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}</span>
                  {asset.style && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280]">{asset.style}</span>}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

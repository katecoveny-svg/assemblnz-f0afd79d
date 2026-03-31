import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import AgentAvatar from "@/components/AgentAvatar";
import {
  FileText, Image, BarChart3, Calendar, Grid3X3, List,
  Download, Copy, Search, Filter, RefreshCw, Sparkles,
  MessageSquare, Palette, ChevronRight, Clock, Eye, Brush,
  Share2, Tag,
} from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  agent_id: string;
  agent_name: string;
  output_type: string;
  title: string;
  content_preview: string | null;
  format: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, any> = {
  document: FileText,
  image: Image,
  social_post: MessageSquare,
  analysis: BarChart3,
  report: FileText,
  creative: Palette,
};
const TYPE_COLORS: Record<string, string> = {
  document: "#4FC3F7",
  image: "#3A6A9C",
  social_post: "#5AADA0",
  analysis: "#FFB800",
  report: "#1A3A5C",
  creative: "#FF6B9D",
};

const glassCard = "rounded-2xl relative overflow-hidden";
const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ContentHub = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<"content" | "brand">("content");

  const loadContent = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [contentRes, brandRes] = await Promise.allSettled([
      supabase.from("exported_outputs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200),
      supabase.from("brand_profiles").select("*").eq("user_id", user.id).limit(1).maybeSingle(),
    ]);
    if (contentRes.status === "fulfilled" && contentRes.value.data) setItems(contentRes.value.data as ContentItem[]);
    if (brandRes.status === "fulfilled" && brandRes.value.data) setBrandProfile(brandRes.value.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadContent(); }, [loadContent]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("content-hub-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exported_outputs", filter: `user_id=eq.${user.id}` }, (payload) => {
        setItems(prev => [payload.new as ContentItem, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filtered = items.filter(item => {
    if (agentFilter !== "all" && item.agent_id !== agentFilter) return false;
    if (typeFilter !== "all" && item.output_type !== typeFilter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.agent_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const agentCounts = items.reduce<Record<string, number>>((acc, i) => { acc[i.agent_id] = (acc[i.agent_id] || 0) + 1; return acc; }, {});
  const typeCounts = items.reduce<Record<string, number>>((acc, i) => { acc[i.output_type] = (acc[i.output_type] || 0) + 1; return acc; }, {});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!user) return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <BrandNav />
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <Sparkles size={32} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Sign in to access your Content Hub</p>
          <Link to="/login" className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#5AADA0", color: "#09090B" }}>Sign In</Link>
        </div>
      </div>
      <BrandFooter />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <BrandNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-light text-xl sm:text-2xl text-foreground">Content Hub</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">{items.length} assets generated across {Object.keys(agentCounts).length} agents</p>
          </div>
          <button onClick={loadContent} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2">
          {[
            { key: "content" as const, label: "Generated Content", icon: Grid3X3 },
            { key: "brand" as const, label: "Brand Assets", icon: Brush },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: activeSection === tab.key ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.03)",
                border: activeSection === tab.key ? "1px solid rgba(212,168,67,0.2)" : "1px solid rgba(255,255,255,0.04)",
                color: activeSection === tab.key ? "#3A6A9C" : "rgba(255,255,255,0.5)",
              }}>
              <tab.icon size={12} />{tab.label}
            </button>
          ))}
        </div>

        {activeSection === "brand" ? (
          /* Brand Asset Library */
          <div className="space-y-6">
            {brandProfile ? (
              <>
                {/* Brand Colors */}
                <div className={glassCard + " p-6"} style={glassStyle}>
                  <h3 className="text-sm font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Palette size={14} style={{ color: "#3A6A9C" }} /> Brand Colours
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(brandProfile.brand_dna as any)?.colors?.map((color: string, i: number) => (
                      <button key={i} onClick={() => { navigator.clipboard.writeText(color); toast.success(`Copied ${color}`); }}
                        className="group flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl border border-white/10 transition-transform group-hover:scale-110"
                          style={{ background: color, boxShadow: `0 4px 20px ${color}40` }} />
                        <span className="text-[9px] text-muted-foreground font-mono">{color}</span>
                      </button>
                    )) || <p className="text-xs text-muted-foreground">No colours extracted yet. Run a Brand Scan in PRISM.</p>}
                  </div>
                </div>

                {/* Brand Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Business Name", value: brandProfile.business_name || "Not set", icon: Tag, color: "#3A6A9C" },
                    { label: "Industry", value: brandProfile.industry || "Not set", icon: BarChart3, color: "#3A6A9C" },
                    { label: "Brand Tone", value: brandProfile.tone || "Not set", icon: Share2, color: "#5AADA0" },
                  ].map(info => (
                    <div key={info.label} className={glassCard + " p-4"} style={glassStyle}>
                      <info.icon size={14} style={{ color: info.color }} className="mb-2" />
                      <p className="text-[10px] text-muted-foreground mb-1">{info.label}</p>
                      <p className="text-sm font-bold text-foreground">{info.value}</p>
                    </div>
                  ))}
                </div>

                {/* Key Message & Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Key Message</p>
                    <p className="text-xs text-foreground leading-relaxed">{brandProfile.key_message || "Not defined yet — ask PRISM to help craft your key message."}</p>
                  </div>
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Target Audience</p>
                    <p className="text-xs text-foreground leading-relaxed">{brandProfile.audience || "Not defined yet — ask PRISM to define your target audience."}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Brush size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No brand profile found</p>
                <p className="text-xs text-muted-foreground/60 mb-4">Run a Brand Scan in PRISM to extract your colours, tone, and visual identity.</p>
                <Link to="/chat/marketing" className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#3A6A9C", color: "#09090B" }}>
                  Open PRISM →
                </Link>
              </div>
            )}
          </div>
        ) : (
        <>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Assets", value: items.length, color: "#3A6A9C", icon: Grid3X3 },
            { label: "Documents", value: typeCounts["document"] || 0, color: "#4FC3F7", icon: FileText },
            { label: "Social Posts", value: typeCounts["social_post"] || 0, color: "#5AADA0", icon: MessageSquare },
            { label: "This Week", value: items.filter(i => Date.now() - new Date(i.created_at).getTime() < 7 * 86400000).length, color: "#3A6A9C", icon: Clock },
          ].map(s => (
            <div key={s.label} className={glassCard + " p-4"} style={{ ...glassStyle, boxShadow: `0 0 15px ${s.color}06` }}>
              <s.icon size={14} style={{ color: s.color }} className="mb-2" />
              <p className="text-xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Agent Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAgentFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${agentFilter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={{ background: agentFilter === "all" ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.03)", border: agentFilter === "all" ? "1px solid rgba(212,168,67,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>
            All Agents
          </button>
          {Object.entries(agentCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([agentId, count]) => {
            const agent = agents.find(a => a.id === agentId);
            if (!agent) return null;
            const isActive = agentFilter === agentId;
            return (
              <button key={agentId} onClick={() => setAgentFilter(isActive ? "all" : agentId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors`}
                style={{
                  background: isActive ? `${agent.color}15` : "rgba(255,255,255,0.03)",
                  border: isActive ? `1px solid ${agent.color}30` : "1px solid rgba(255,255,255,0.04)",
                  color: isActive ? agent.color : "rgba(255,255,255,0.5)",
                }}>
                <div className="w-2 h-2 rounded-full" style={{ background: agent.color }} />
                {agent.name}
                <span className="text-[9px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
              style={{ background: "rgba(14,14,26,0.7)" }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-border text-foreground focus:outline-none" style={{ background: "rgba(14,14,26,0.7)" }}>
            <option value="all">All Types</option>
            {Object.keys(typeCounts).map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><Grid3X3 size={14} /></button>
            <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><List size={14} /></button>
          </div>
        </div>

        {/* Content Grid/List */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-2xl animate-pulse" style={glassStyle} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles size={32} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No content found</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Start chatting with agents to generate content that appears here automatically.</p>
            <Link to="/agents" className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#5AADA0", color: "#09090B" }}>
              Browse Agents →
            </Link>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const agent = agents.find(a => a.id === item.agent_id);
              const Icon = TYPE_ICONS[item.output_type] || FileText;
              const typeColor = TYPE_COLORS[item.output_type] || "#888";
              return (
                <div key={item.id} className={glassCard + " p-5 group hover:bg-white/[0.02] transition-colors"} style={glassStyle}>
                  <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ background: `linear-gradient(90deg, transparent, ${agent?.color || "#888"}60, transparent)` }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {agent && <AgentAvatar agentId={agent.id} color={agent.color} size={24} showGlow={false} />}
                      <span className="text-[11px] font-bold" style={{ color: agent?.color || "#888" }}>{item.agent_name}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"
                      style={{ background: `${typeColor}15`, color: typeColor }}>
                      <Icon size={8} />{item.output_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-display font-bold text-foreground mb-2 line-clamp-2">{item.title}</h3>
                  {item.content_preview && (
                    <p className="text-[11px] text-muted-foreground line-clamp-3 mb-3">{item.content_preview}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                    <span className="text-[9px] text-muted-foreground/50">{timeAgo(item.created_at)}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => copyToClipboard(item.title)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground/40 hover:text-foreground transition-colors" title="Copy">
                        <Copy size={11} />
                      </button>
                      <Link to={`/chat/${item.agent_id}`}
                        className="p-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground/40 hover:text-foreground transition-colors" title="Open Agent">
                        <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={glassCard + " overflow-hidden"} style={glassStyle}>
            <div className="divide-y divide-border">
              {filtered.map(item => {
                const agent = agents.find(a => a.id === item.agent_id);
                const Icon = TYPE_ICONS[item.output_type] || FileText;
                const typeColor = TYPE_COLORS[item.output_type] || "#888";
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <Icon size={14} style={{ color: typeColor }} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                      {item.content_preview && <p className="text-[10px] text-muted-foreground truncate">{item.content_preview.substring(0, 100)}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-2 h-2 rounded-full" style={{ background: agent?.color || "#888" }} />
                      <span className="text-[10px] font-bold" style={{ color: agent?.color || "#888" }}>{item.agent_name}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyToClipboard(item.title)} className="p-1 text-muted-foreground/40 hover:text-foreground"><Copy size={11} /></button>
                      <Link to={`/chat/${item.agent_id}`} className="p-1 text-muted-foreground/40 hover:text-foreground"><ChevronRight size={11} /></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </main>
      <BrandFooter />
    </div>
  );
};

export default ContentHub;

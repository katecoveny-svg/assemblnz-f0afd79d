import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Sparkles, CheckCircle, XCircle, Clock, RefreshCw, Search, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminShell from "@/components/admin/AdminShell";

const ACCENT = "#3A7D6E";

const PAGES = [
  { id: "homepage", label: "Homepage", route: "/", color: "#3A7D6E" },
  { id: "manaaki-landing", label: "Manaaki", route: "/manaaki", color: "#4AA5A8" },
  { id: "waihanga-landing", label: "Waihanga", route: "/waihanga", color: "#3A7D6E" },
  { id: "auaha-landing", label: "Auaha", route: "/auaha", color: "#A8DDDB" },
  { id: "arataki-landing", label: "Arataki", route: "/arataki", color: "#C65D4E" },
  { id: "pikau-landing", label: "Pikau", route: "/pikau", color: "#5AADA0" },
];

const REGIONS = ["hero-subheadline", "feature-list", "feature-cards", "use-cases", "cta-copy", "social-proof"];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AdminFlintDashboard() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState("homepage");
  const [selectedRegion, setSelectedRegion] = useState("hero-subheadline");
  const [instructions, setInstructions] = useState("");
  const [seoTarget, setSeoTarget] = useState("");
  const [currentContent, setCurrentContent] = useState("");

  const page = PAGES.find((p) => p.id === selectedPage)!;
  const availableRegions = selectedPage === "homepage" 
    ? ["hero-subheadline", "feature-cards", "social-proof", "cta-copy"]
    : ["hero-subheadline", "feature-list", "use-cases", "cta-copy"];

  // Fetch proposals
  const { data: proposals, isLoading: loadingProposals } = useQuery({
    queryKey: ["flint-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flint_proposals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Generate copy mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("flint-mcp", {
        body: {
          action: "generate",
          pageId: selectedPage,
          region: selectedRegion,
          currentContent,
          instructions: instructions || "Improve this copy for conversion and SEO",
          seoTarget,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Copy generated — verdict: ${data.guard?.verdict || "unknown"}`);
      queryClient.invalidateQueries({ queryKey: ["flint-proposals"] });
    },
    onError: (err: any) => toast.error(err.message || "Generation failed"),
  });

  // SEO audit mutation
  const seoAuditMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("flint-mcp", {
        body: { action: "seo-audit", pageId: selectedPage, seoTarget },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("SEO audit complete"),
    onError: (err: any) => toast.error(err.message || "Audit failed"),
  });

  // Approve/reject mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("flint_proposals")
        .update({ status, review_notes: notes || null, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Proposal updated");
      queryClient.invalidateQueries({ queryKey: ["flint-proposals"] });
    },
  });

  const verdictIcon = (v: string) => {
    if (v === "allow" || v === "approved") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (v === "block" || v === "rejected") return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  return (
    <AdminShell
      title="Flint AI"
      subtitle="Generate copy, audit SEO, and manage proposals across all marketing pages"
      icon={<Sparkles size={18} style={{ color: "#3A7D6E" }} />}
      backTo="/admin/dashboard"
    >

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="bg-white/5 border border-gray-200">
          <TabsTrigger value="generate" className="data-[state=active]:bg-white/10 text-[#6B7280] data-[state=active]:text-foreground">
            <Sparkles className="w-4 h-4 mr-2" /> Generate Copy
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-white/10 text-[#6B7280] data-[state=active]:text-foreground">
            <Search className="w-4 h-4 mr-2" /> SEO Audit
          </TabsTrigger>
          <TabsTrigger value="proposals" className="data-[state=active]:bg-white/10 text-[#6B7280] data-[state=active]:text-foreground">
            <FileText className="w-4 h-4 mr-2" /> Proposals ({proposals?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ── Generate Tab ─────────────────────────────────── */}
        <TabsContent value="generate">
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-foreground text-sm font-medium">Target Page</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPage(p.id); setSelectedRegion(p.id === "homepage" ? "hero-subheadline" : "hero-subheadline"); }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedPage === p.id ? "text-black" : "text-[#6B7280] bg-white/5 hover:bg-white/10"}`}
                    style={selectedPage === p.id ? { background: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <h3 className="text-foreground text-sm font-medium pt-2">Region</h3>
              <div className="flex flex-wrap gap-2">
                {availableRegions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedRegion === r ? "bg-white/20 text-foreground" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">Current Content (optional)</label>
                <textarea
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm min-h-[80px] focus:outline-none"
                  placeholder="Paste current copy to improve..."
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm min-h-[60px] focus:outline-none"
                  placeholder="e.g. Make it more urgent, add social proof, focus on compliance..."
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-1">SEO Target Keywords</label>
                <input
                  value={seoTarget}
                  onChange={(e) => setSeoTarget(e.target.value)}
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                  placeholder="e.g. NZ construction compliance software"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full"
                style={{ background: ACCENT, color: "#3D4250" }}
              >
                {generateMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate with Flint AI
              </Button>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-foreground text-sm font-medium mb-3">Latest Result</h3>
              {generateMutation.data ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {verdictIcon(generateMutation.data.guard?.verdict || "")}
                    <span className="text-foreground text-xs uppercase tracking-wider">
                      {generateMutation.data.guard?.verdict || "Unknown"}
                    </span>
                    <span className="text-gray-400 text-xs ml-auto">{generateMutation.data.guard?.auditId}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-[#1A1D29] text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                    {typeof generateMutation.data.proposal?.result?.content === "string"
                      ? generateMutation.data.proposal.result.content
                      : JSON.stringify(generateMutation.data.proposal, null, 2)}
                  </div>
                  {generateMutation.data.proposal?.result?.source === "lovable-ai-fallback" && (
                    <p className="text-amber-400/60 text-xs">Generated via AI fallback (Flint MCP unavailable)</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Generate copy to see results here</p>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        {/* ── SEO Audit Tab ────────────────────────────────── */}
        <TabsContent value="seo">
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-foreground text-sm font-medium">SEO Audit</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPage(p.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedPage === p.id ? "text-black" : "text-[#6B7280] bg-white/5 hover:bg-white/10"}`}
                    style={selectedPage === p.id ? { background: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">Target Keywords</label>
                <input
                  value={seoTarget}
                  onChange={(e) => setSeoTarget(e.target.value)}
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                  placeholder="e.g. NZ hospitality compliance, hotel management software"
                />
              </div>
              <Button
                onClick={() => seoAuditMutation.mutate()}
                disabled={seoAuditMutation.isPending}
                className="w-full"
                style={{ background: ACCENT, color: "#3D4250" }}
              >
                {seoAuditMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Run SEO Audit
              </Button>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-foreground text-sm font-medium mb-3">Audit Results</h3>
              {seoAuditMutation.data ? (
                <div className="bg-white/5 rounded-lg p-4 text-[#1A1D29] text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {(() => {
                    const audit = seoAuditMutation.data.seoAudit;
                    if (audit?.overallScore !== undefined) {
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold" style={{ color: audit.overallScore > 70 ? "#4ade80" : audit.overallScore > 40 ? "#fbbf24" : "#f87171" }}>
                              {audit.overallScore}
                            </div>
                            <span className="text-gray-500 text-xs">/ 100</span>
                          </div>
                          {audit.recommendations?.map((r: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 text-xs mt-0.5">{i + 1}.</span>
                              <span className="text-[#3D4250] text-xs">{r}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return JSON.stringify(audit, null, 2);
                  })()}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Run an audit to see results</p>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        {/* ── Proposals Tab ────────────────────────────────── */}
        <TabsContent value="proposals">
          <GlassCard className="p-6">
            <h3 className="text-foreground text-sm font-medium mb-4">All Proposals</h3>
            {loadingProposals ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : !proposals?.length ? (
              <p className="text-gray-400 text-sm">No proposals yet. Generate some copy to get started.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {proposals.map((p: any) => (
                  <div key={p.id} className="bg-white/5 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {verdictIcon(p.status)}
                      <span className="text-foreground text-xs font-medium">{p.page_id}</span>
                      <span className="text-gray-400 text-xs">/{p.region}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                        p.status === "approved" ? "bg-green-500/20 text-green-400" :
                        p.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[#6B7280] text-xs line-clamp-3">{p.proposed_content}</p>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <span>{new Date(p.created_at).toLocaleDateString("en-NZ")}</span>
                      {p.audit_id && <span>· {p.audit_id}</span>}
                    </div>
                    {p.status === "pending_review" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => reviewMutation.mutate({ id: p.id, status: "approved" })} className="bg-green-600 hover:bg-green-700 text-foreground text-xs h-7">
                          Approve
                        </Button>
                        <Button size="sm" onClick={() => reviewMutation.mutate({ id: p.id, status: "rejected", notes: "Manually rejected" })} className="bg-red-600 hover:bg-red-700 text-foreground text-xs h-7">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

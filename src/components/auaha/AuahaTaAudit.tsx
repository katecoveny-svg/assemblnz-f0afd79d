import { useState } from "react";
import { Shield, Download, Clock, ChevronDown, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

const stageColor = (stage: string) => ({
  kahu: "#FBBF24", iho: "#60A5FA", ta: "#34D399", generate: "#A78BFA", evidence: "#F0D078",
}[stage] || "#666");

export default function AuahaTaAudit() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["auaha-audit-log"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const filtered = auditLogs.filter((l: any) => {
    if (!search) return true;
    return l.agent_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.request_summary?.toLowerCase().includes(search.toLowerCase());
  });

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ta-audit-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Tā Audit</p>
          <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Tā Audit Trail</h1>
          <p className="text-[#6B7280] text-sm mt-1">Timestamped NZ time • Every stage logged • JSON export</p>
        </div>
        <button onClick={exportAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(74,165,168,0.04)] text-[#6B7280] text-xs hover:bg-[rgba(74,165,168,0.06)] transition-all">
          <Download className="w-3.5 h-3.5" /> Export JSON
        </button>
      </div>

      {/* Search */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A0]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-foreground text-xs placeholder:text-[#8B92A0]"
            placeholder="Search audit entries..." />
        </div>
      </GlassCard>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-[#1A1D29]/10" />
            <p className="text-[#6B7280] text-sm">No audit entries yet</p>
            <p className="text-[#1A1D29]/15 text-[10px] mt-1">Entries appear when agents process requests through the pipeline</p>
          </GlassCard>
        ) : (
          filtered.map((log: any) => (
            <GlassCard key={log.id} className="overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all text-left">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: log.compliance_passed ? "#34D399" : "#EF4444" }} />
                  <span className="text-[#4A5160] text-xs font-mono flex-shrink-0">{log.request_id?.slice(0, 8) || "—"}</span>
                  <span className="text-[#6B7280] text-xs truncate">{log.agent_name}</span>
                  <span className="text-[#6B7280] text-[10px] flex-shrink-0">{log.model_used}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[#8B92A0] text-[10px] font-mono">
                    {new Date(log.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour12: false })}
                  </span>
                  {log.compliance_passed !== null && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${log.compliance_passed ? "bg-[#3A7D6E]/10 text-[#5AADA0]" : "bg-[#C85A54]/10 text-[#C85A54]"}`}>
                      {log.compliance_passed ? "PASS" : "FAIL"}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-[#8B92A0] transition-transform ${expandedId === log.id ? "rotate-180" : ""}`} />
                </div>
              </button>

              {expandedId === log.id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Agent</span>
                      <p className="text-[#4A5160]">{log.agent_name} ({log.agent_code})</p>
                    </div>
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Model</span>
                      <p className="text-[#4A5160]">{log.model_used}</p>
                    </div>
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Tokens</span>
                      <p className="text-[#4A5160] font-mono">{log.input_tokens || 0} → {log.output_tokens || 0} ({log.total_tokens || 0})</p>
                    </div>
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Duration</span>
                      <p className="text-[#4A5160] font-mono">{log.duration_ms || 0}ms</p>
                    </div>
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Cost</span>
                      <p className="text-[#4A5160] font-mono">${(log.cost_nzd || 0).toFixed(4)} NZD</p>
                    </div>
                    <div>
                      <span className="text-[#6B7280] text-[10px]">PII</span>
                      <p className="text-[#4A5160]">{log.pii_detected ? `Detected${log.pii_masked ? " (masked)" : ""}` : "None"}</p>
                    </div>
                  </div>
                  {log.request_summary && (
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Request</span>
                      <p className="text-[#6B7280] text-xs mt-1">{log.request_summary}</p>
                    </div>
                  )}
                  {log.response_summary && (
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Response</span>
                      <p className="text-[#6B7280] text-xs mt-1">{log.response_summary}</p>
                    </div>
                  )}
                  {log.policies_checked && log.policies_checked.length > 0 && (
                    <div>
                      <span className="text-[#6B7280] text-[10px]">Policies Checked</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {log.policies_checked.map((p: string, i: number) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280]">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

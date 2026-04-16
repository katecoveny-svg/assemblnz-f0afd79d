import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, Route, Zap, Brain, Scale,
  CheckCircle2, XCircle, Clock, FileText, Download,
  RefreshCw, ChevronDown, Eye, Filter,
} from "lucide-react";

const glassCard = "rounded-2xl relative overflow-hidden";
const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const TopGlow = ({ color }: { color: string }) => (
  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
);

interface PipelineSummary {
  totalAuditLogs: number;
  approvals: { total: number; pending: number; approved: number; rejected: number };
  evidencePacks: { total: number; signed: number; unsigned: number };
  totalExports: number;
}

type SubTab = "overview" | "audit-logs" | "approvals" | "evidence" | "exports";

const STATUS_COLORS: Record<string, string> = {
  pending: "#D4A843",
  approved: "#5AADA0",
  rejected: "#C85A54",
  expired: "#888",
  started: "#7ECFC2",
  completed: "#5AADA0",
  forbidden: "#C85A54",
  allowed: "#5AADA0",
  approval_required: "#D4A843",
};

export default function AdminPipelineTab() {
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [evidencePacks, setEvidencePacks] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const adminCall = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-api", { body: { action, ...params } });
    if (error) throw error;
    return data;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      adminCall("get_pipeline_summary"),
      adminCall("get_pipeline_audit_logs"),
      adminCall("get_approval_queue"),
      adminCall("get_evidence_packs"),
      adminCall("get_aaaip_exports"),
    ]);
    if (results[0].status === "fulfilled") setSummary(results[0].value);
    if (results[1].status === "fulfilled") setAuditLogs(results[1].value || []);
    if (results[2].status === "fulfilled") setApprovals(results[2].value || []);
    if (results[3].status === "fulfilled") setEvidencePacks(results[3].value || []);
    if (results[4].status === "fulfilled") setExports(results[4].value || []);
    setLoading(false);
  }, [adminCall]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id: string) => {
    await adminCall("approve_queue_item", { itemId: id });
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };
  const handleReject = async (id: string) => {
    await adminCall("reject_queue_item", { itemId: id });
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  };
  const handleSign = async (id: string) => {
    await adminCall("sign_evidence_pack", { packId: id });
    setEvidencePacks(prev => prev.map(e => e.id === id ? { ...e, signed_by: "admin", signed_at: new Date().toISOString() } : e));
  };

  const subTabs: { id: SubTab; label: string; icon: any; color: string }[] = [
    { id: "overview", label: "Overview", icon: Scale, color: "#5AADA0" },
    { id: "audit-logs", label: "Audit Trail", icon: ShieldCheck, color: "#3A7D6E" },
    { id: "approvals", label: "Approvals", icon: Clock, color: "#D4A843" },
    { id: "evidence", label: "Evidence Packs", icon: FileText, color: "#7ECFC2" },
    { id: "exports", label: "Exports", icon: Download, color: "#1A3A5C" },
  ];

  const filteredApprovals = approvalFilter === "all" ? approvals : approvals.filter(a => a.status === approvalFilter);

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${subTab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={subTab === t.id ? { background: `${t.color}15`, border: `1px solid ${t.color}30` } : { border: "1px solid transparent" }}>
            <t.icon size={12} style={{ color: t.color }} />
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Refresh">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* OVERVIEW */}
      {subTab === "overview" && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Audit Logs", value: summary.totalAuditLogs, icon: ShieldCheck, color: "#3A7D6E" },
              { label: "Pending Approvals", value: summary.approvals.pending, icon: Clock, color: "#D4A843" },
              { label: "Approved", value: summary.approvals.approved, icon: CheckCircle2, color: "#5AADA0" },
              { label: "Evidence Packs", value: summary.evidencePacks.total, icon: FileText, color: "#7ECFC2" },
              { label: "Signed Off", value: summary.evidencePacks.signed, icon: Scale, color: "#1A3A5C" },
            ].map(m => (
              <div key={m.label} className={glassCard + " p-4"} style={{ ...glassStyle, boxShadow: `0 0 20px ${m.color}08` }}>
                <TopGlow color={m.color} />
                <m.icon size={14} style={{ color: m.color }} className="mb-2" />
                <p className="text-xl font-bold text-foreground tabular-nums">{m.value}</p>
                <p className="text-[10px] mt-1 text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline flow diagram */}
          <div className={glassCard + " p-5"} style={glassStyle}>
            <TopGlow color="#3A6A9C" />
            <h3 className="text-sm font-bold text-foreground mb-4">Pipeline Architecture</h3>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: "Kahu", sub: "Compliance", icon: ShieldCheck, color: "#C85A54" },
                { label: "Iho", sub: "Router", icon: Route, color: "#3A7D6E" },
                { label: "Tā", sub: "Execution", icon: Zap, color: "#D4A843" },
                { label: "Mahara", sub: "Memory", icon: Brain, color: "#7ECFC2" },
                { label: "Mana", sub: "Assurance", icon: Scale, color: "#5AADA0" },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl" style={{ background: `${stage.color}10`, border: `1px solid ${stage.color}25` }}>
                    <stage.icon size={18} style={{ color: stage.color }} />
                    <span className="text-xs font-bold text-foreground">{stage.label}</span>
                    <span className="text-[9px] text-muted-foreground">{stage.sub}</span>
                  </div>
                  {i < 4 && <span className="text-muted-foreground/30 text-lg">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS */}
      {subTab === "audit-logs" && (
        <div className={glassCard + " overflow-hidden"} style={glassStyle}>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Pipeline Audit Trail ({auditLogs.length})</h3>
          </div>
          {auditLogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <ShieldCheck size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">No audit logs yet. Run a pipeline request to generate entries.</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-muted-foreground/50 w-16 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${STATUS_COLORS[log.status] || "#888"}15`, color: STATUS_COLORS[log.status] || "#888" }}>
                      {log.status}
                    </span>
                    <span className="text-[10px] font-bold text-foreground/80 shrink-0">{log.kete}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">{log.step}</span>
                    <span className="text-[10px] text-foreground/60 flex-1 truncate">{log.action_type}</span>
                    <button onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={12} /></button>
                  </div>
                  {expandedRow === log.id && log.details && (
                    <pre className="mt-2 text-[10px] font-mono text-foreground/60 bg-black/20 rounded-lg p-3 overflow-x-auto max-h-40">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPROVALS */}
      {subTab === "approvals" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-muted-foreground" />
            {["all", "pending", "approved", "rejected"].map(f => (
              <button key={f} onClick={() => setApprovalFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase transition-colors ${approvalFilter === f ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={approvalFilter === f ? { background: `${STATUS_COLORS[f] || "#9CA3AF"}15`, border: `1px solid ${STATUS_COLORS[f] || "#9CA3AF"}30` } : { border: "1px solid transparent" }}>
                {f} {f !== "all" && `(${approvals.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>
          <div className={glassCard + " overflow-hidden"} style={glassStyle}>
            {filteredApprovals.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Clock size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No approval requests found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {filteredApprovals.map(item => (
                  <div key={item.id} className="px-5 py-4 hover:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${STATUS_COLORS[item.status] || "#888"}15`, color: STATUS_COLORS[item.status] || "#888" }}>
                          {item.status}
                        </span>
                        <span className="text-xs font-bold text-foreground">{item.kete}</span>
                        <span className="text-[11px] text-muted-foreground">{item.action_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/40">
                          {new Date(item.requested_at).toLocaleDateString("en-NZ")}
                        </span>
                        {item.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ background: "rgba(90,173,160,0.15)", color: "#5AADA0" }}>
                              <CheckCircle2 size={10} /> Approve
                            </button>
                            <button onClick={() => handleReject(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ background: "rgba(200,90,84,0.15)", color: "#C85A54" }}>
                              <XCircle size={10} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {item.context && (
                      <pre className="text-[10px] font-mono text-foreground/50 bg-black/20 rounded-lg p-2 overflow-x-auto max-h-24">
                        {JSON.stringify(item.context, null, 2)}
                      </pre>
                    )}
                    {item.decision_reason && (
                      <p className="text-[10px] text-foreground/60 mt-1">Reason: {item.decision_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVIDENCE PACKS */}
      {subTab === "evidence" && (
        <div className={glassCard + " overflow-hidden"} style={glassStyle}>
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Evidence Packs ({evidencePacks.length})</h3>
          </div>
          {evidencePacks.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <FileText size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">No evidence packs generated yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {evidencePacks.map(pack => (
                <div key={pack.id} className="px-5 py-4 hover:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText size={14} style={{ color: "#E040FB" }} />
                      <span className="text-xs font-bold text-foreground">{pack.kete}</span>
                      <span className="text-[11px] text-muted-foreground">{pack.action_type}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(224,64,251,0.1)", color: "#E040FB" }}>
                        {pack.watermark}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pack.signed_by ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(90,173,160,0.15)", color: "#5AADA0" }}>
                          <CheckCircle2 size={10} /> Signed
                        </span>
                      ) : (
                        <button onClick={() => handleSign(pack.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors hover:opacity-80"
                          style={{ background: "rgba(224,64,251,0.15)", color: "#E040FB" }}>
                          <Scale size={10} /> Sign Off
                        </button>
                      )}
                      <button onClick={() => setExpandedRow(expandedRow === pack.id ? null : pack.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={12} /></button>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {new Date(pack.created_at).toLocaleDateString("en-NZ")} {new Date(pack.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {expandedRow === pack.id && pack.evidence_json && (
                    <pre className="mt-2 text-[10px] font-mono text-foreground/60 bg-black/20 rounded-lg p-3 overflow-x-auto max-h-60">
                      {JSON.stringify(pack.evidence_json, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPORTS */}
      {subTab === "exports" && (
        <div className={glassCard + " overflow-hidden"} style={glassStyle}>
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">AAAIP Audit Exports ({exports.length})</h3>
          </div>
          {exports.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <Download size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">No exports yet. Submit an audit from a pilot dashboard.</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {exports.map(exp => (
                <div key={exp.id} className="px-5 py-3 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(58,125,110,0.15)", color: "#5AADA0" }}>
                      {exp.domain}
                    </span>
                    <span className="text-xs text-foreground">{exp.pilot_label || exp.domain}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {exp.total_decisions} decisions · {exp.entry_count} entries
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/40">
                      {new Date(exp.created_at).toLocaleDateString("en-NZ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[9px] text-foreground/50">Allowed: {exp.allowed}</span>
                    <span className="text-[9px] text-foreground/50">Blocked: {exp.blocked}</span>
                    <span className="text-[9px] text-foreground/50">Human: {exp.needs_human}</span>
                    <span className="text-[9px] text-foreground/50">Compliance: {(exp.compliance_rate * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

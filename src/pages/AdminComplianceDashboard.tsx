/**
 * Admin Compliance Dashboard — /admin/compliance
 * Shows scan history, pending reviews, agent knowledge status, and stale entries.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Shield, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Activity, Brain } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const BONE = "#F5F0E8";
const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";

const impactBadge = (level: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    high: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
    medium: { bg: "rgba(74,165,168,0.15)", text: TEAL_ACCENT },
    low: { bg: "rgba(58,125,110,0.15)", text: POUNAMU },
  };
  const c = colors[level] || colors.low;
  return (
    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {level}
    </span>
  );
};

export default function AdminComplianceDashboard() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [staleEntries, setStaleEntries] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalKb, setTotalKb] = useState(0);
  const [staleCount, setStaleCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<{ impact?: string; agent?: string }>({});
  const [tab, setTab] = useState<"updates" | "scans" | "stale">("updates");

  const loadData = useCallback(async () => {
    // Parallel fetch
    const [updRes, logRes, staleRes, pendRes, kbCountRes, staleCountRes] = await Promise.all([
      supabase.from("compliance_updates").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("compliance_scan_log").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("agent_knowledge_base").select("agent_id, topic, last_verified, is_stale, stale_reason").eq("is_stale", true).order("last_verified", { ascending: true }).limit(50),
      supabase.from("compliance_updates").select("id", { count: "exact", head: true }).eq("requires_human_review", true).eq("verified", false),
      supabase.from("agent_knowledge_base").select("id", { count: "exact", head: true }),
      supabase.from("agent_knowledge_base").select("id", { count: "exact", head: true }).eq("is_stale", true),
    ]);

    setUpdates(updRes.data || []);
    setScanLogs(logRes.data || []);
    setStaleEntries(staleRes.data || []);
    setPendingCount(pendRes.count || 0);
    setTotalKb(kbCountRes.count || 0);
    setStaleCount(staleCountRes.count || 0);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const runScanNow = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-scanner");
      if (error) throw error;
      toast.success(`Scan complete: ${data?.changes_detected || 0} changes found`);
      loadData();
    } catch (e: any) {
      toast.error("Scan failed: " + (e.message || "Unknown error"));
    } finally {
      setScanning(false);
    }
  };

  const approveUpdate = async (id: string) => {
    await supabase.from("compliance_updates").update({ verified: true, requires_human_review: false }).eq("id", id);
    toast.success("Update approved and applied");
    loadData();
  };

  const rejectUpdate = async (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    await supabase.from("compliance_updates").update({ verified: false, requires_human_review: false, review_notes: reason || "Rejected by admin" }).eq("id", id);
    toast.info("Update rejected");
    loadData();
  };

  const filteredUpdates = updates.filter((u) => {
    if (filter.impact && u.impact_level !== filter.impact) return false;
    if (filter.agent && !(u.affected_agents || []).includes(filter.agent)) return false;
    return true;
  });

  const lastScan = scanLogs[0];

  return (
    <AdminShell
      title="Compliance Scanner"
      subtitle="Regulatory monitoring & knowledge base health"
      icon={<Shield size={18} style={{ color: TEAL_ACCENT }} />}
      backTo="/admin/dashboard"
      actions={
        <button
          onClick={runScanNow}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ background: `${TEAL_ACCENT}20`, color: TEAL_ACCENT, border: `1px solid ${TEAL_ACCENT}30` }}
        >
          <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
          {scanning ? "Scanning..." : "Run Scan Now"}
        </button>
      }
    >
      <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminGlassCard>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} style={{ color: `${BONE}50` }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: `${BONE}50` }}>Last Scan</span>
            </div>
            {lastScan ? (
              <>
                <p className="text-sm font-medium" style={{ color: `${BONE}CC` }}>
                  {new Date(lastScan.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-[11px] mt-1" style={{ color: `${BONE}40` }}>
                  {lastScan.sources_checked} sources · {lastScan.changes_detected} changes · {lastScan.scan_duration_seconds}s
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: `${BONE}30` }}>No scans yet</p>
            )}
          </div>
        </AdminGlassCard>

        <AdminGlassCard accent="#ef4444">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} style={{ color: pendingCount > 0 ? "#ef4444" : `${BONE}50` }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: `${BONE}50` }}>Pending Review</span>
            </div>
            <p className="text-2xl font-light" style={{ color: pendingCount > 0 ? "#ef4444" : `${BONE}CC` }}>{pendingCount}</p>
            <p className="text-[11px]" style={{ color: `${BONE}40` }}>HIGH impact changes awaiting approval</p>
          </div>
        </AdminGlassCard>

        <AdminGlassCard accent={POUNAMU}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} style={{ color: POUNAMU }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: `${BONE}50` }}>Agent Knowledge</span>
            </div>
            <p className="text-2xl font-light" style={{ color: `${BONE}CC` }}>{totalKb}</p>
            <p className="text-[11px]" style={{ color: `${BONE}40` }}>entries across all agents</p>
          </div>
        </AdminGlassCard>

        <AdminGlassCard accent={TEAL_ACCENT}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} style={{ color: staleCount > 0 ? TEAL_ACCENT : `${BONE}50` }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: `${BONE}50` }}>Stale Entries</span>
            </div>
            <p className="text-2xl font-light" style={{ color: staleCount > 0 ? TEAL_ACCENT : `${BONE}CC` }}>{staleCount}</p>
            <p className="text-[11px]" style={{ color: `${BONE}40` }}>not verified in 90+ days</p>
          </div>
        </AdminGlassCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.65)" }}>
        {(["updates", "scans", "stale"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
            style={{
              background: tab === t ? `${TEAL_ACCENT}15` : "transparent",
              color: tab === t ? TEAL_ACCENT : `${BONE}50`,
              fontFamily: "Lato, sans-serif",
            }}
          >
            {t === "updates" ? "Updates" : t === "scans" ? "Scan Log" : "Stale Knowledge"}
          </button>
        ))}
      </div>

      {/* Updates Tab */}
      {tab === "updates" && (
        <AdminGlassCard>
          <div className="p-4">
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "high", "medium", "low"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter((f) => ({ ...f, impact: level === "all" ? undefined : level }))}
                  className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider transition-all"
                  style={{
                    background: (filter.impact === level || (!filter.impact && level === "all")) ? `${TEAL_ACCENT}20` : "rgba(255,255,255,0.03)",
                    color: (filter.impact === level || (!filter.impact && level === "all")) ? TEAL_ACCENT : `${BONE}40`,
                    border: `1px solid ${(filter.impact === level || (!filter.impact && level === "all")) ? `${TEAL_ACCENT}30` : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Date</TableHead>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Title</TableHead>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Impact</TableHead>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Agents</TableHead>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Status</TableHead>
                    <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUpdates.map((u) => (
                    <TableRow key={u.id} style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <TableCell style={{ color: `${BONE}60`, fontSize: "11px" }}>
                        {new Date(u.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium" style={{ color: `${BONE}BB` }}>{u.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: `${BONE}40` }}>{u.change_summary?.substring(0, 80)}...</p>
                      </TableCell>
                      <TableCell>{impactBadge(u.impact_level)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(u.affected_agents || []).slice(0, 3).map((a: string) => (
                            <span key={a} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
                              {a}
                            </span>
                          ))}
                          {(u.affected_agents || []).length > 3 && (
                            <span className="text-[9px]" style={{ color: `${BONE}30` }}>+{(u.affected_agents || []).length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.verified ? (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: POUNAMU }}>
                            <CheckCircle size={10} /> Applied
                          </span>
                        ) : u.requires_human_review ? (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "#ef4444" }}>
                            <AlertTriangle size={10} /> Pending
                          </span>
                        ) : (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: `${BONE}30` }}>
                            <XCircle size={10} /> Rejected
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.requires_human_review && !u.verified && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => approveUpdate(u.id)}
                              className="text-[10px] px-2 py-1 rounded transition-all"
                              style={{ background: `${POUNAMU}15`, color: POUNAMU, border: `1px solid ${POUNAMU}30` }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectUpdate(u.id)}
                              className="text-[10px] px-2 py-1 rounded transition-all"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUpdates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-xs" style={{ color: `${BONE}30` }}>No compliance updates found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </AdminGlassCard>
      )}

      {/* Scan Log Tab */}
      {tab === "scans" && (
        <AdminGlassCard>
          <div className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Date</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Sources</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Changes</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>High Impact</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Duration</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanLogs.map((log) => (
                  <TableRow key={log.id} style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <TableCell style={{ color: `${BONE}60`, fontSize: "11px" }}>
                      {new Date(log.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell style={{ color: `${BONE}80`, fontSize: "12px" }}>{log.sources_checked}</TableCell>
                    <TableCell style={{ color: `${BONE}80`, fontSize: "12px" }}>{log.changes_detected}</TableCell>
                    <TableCell>
                      {log.high_impact_count > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                          {log.high_impact_count}
                        </span>
                      ) : (
                        <span style={{ color: `${BONE}30`, fontSize: "11px" }}>0</span>
                      )}
                    </TableCell>
                    <TableCell style={{ color: `${BONE}60`, fontSize: "11px" }}>{log.scan_duration_seconds}s</TableCell>
                    <TableCell>
                      {log.errors?.length > 0 ? (
                        <span className="text-[10px]" style={{ color: TEAL_ACCENT }}>{log.errors.length} errors</span>
                      ) : (
                        <span className="text-[10px]" style={{ color: POUNAMU }}>Clean</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AdminGlassCard>
      )}

      {/* Stale Knowledge Tab */}
      {tab === "stale" && (
        <AdminGlassCard>
          <div className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Agent</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Topic</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Last Verified</TableHead>
                  <TableHead style={{ color: `${BONE}50`, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staleEntries.map((entry, i) => (
                  <TableRow key={i} style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <TableCell>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${TEAL_ACCENT}15`, color: TEAL_ACCENT }}>
                        {entry.agent_id}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: `${BONE}80`, fontSize: "12px" }}>{entry.topic}</TableCell>
                    <TableCell style={{ color: `${BONE}50`, fontSize: "11px" }}>
                      {entry.last_verified ? new Date(entry.last_verified).toLocaleDateString("en-NZ") : "Never"}
                    </TableCell>
                    <TableCell style={{ color: `${BONE}40`, fontSize: "11px" }}>{entry.stale_reason || "90+ days"}</TableCell>
                  </TableRow>
                ))}
                {staleEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-xs" style={{ color: `${BONE}30` }}>No stale entries — all knowledge is current ✓</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </AdminGlassCard>
      )}
      </div>
    </AdminShell>
  );
}

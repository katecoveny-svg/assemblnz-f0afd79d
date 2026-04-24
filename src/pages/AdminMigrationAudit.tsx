/**
 * AdminMigrationAudit — Persisted migration audit log.
 *
 * Reads from `public.migration_runs` (admin-only RLS) and lets admins
 * record new runs with per-pack updated/skipped counts and notes.
 */
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminShell from "@/components/admin/AdminShell";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  MinusCircle,
  Plus,
  AlertCircle,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PerPackResult {
  pack: string;
  count: number;
  skipped?: number;
  agents?: string[];
}

interface MigrationRun {
  id: string;
  run_name: string;
  description: string | null;
  operator_email: string | null;
  started_at: string;
  finished_at: string | null;
  status: string;
  total_rows_changed: number;
  total_rows_skipped: number;
  packs_updated: string[];
  packs_skipped: string[];
  per_pack_results: PerPackResult[] | null;
  notes: string | null;
  created_at: string;
}

const ADMIN_EMAILS = ["assembl@assembl.co.nz", "kate@assembl.co.nz"];

const formatNZ = (iso: string) =>
  new Date(iso).toLocaleString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: "rgba(58,125,110,0.08)", color: "#3A7D6E", label: "Completed" },
  running: { bg: "rgba(217,188,122,0.15)", color: "#9D7C2E", label: "Running" },
  partial: { bg: "rgba(217,188,122,0.15)", color: "#9D7C2E", label: "Partial" },
  failed: { bg: "rgba(200,90,84,0.10)", color: "#C85A54", label: "Failed" },
};

const AdminMigrationAudit = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<MigrationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [runName, setRunName] = useState("");
  const [description, setDescription] = useState("");
  const [packsInput, setPacksInput] = useState("");
  const [rowsChanged, setRowsChanged] = useState("");
  const [rowsSkipped, setRowsSkipped] = useState("");
  const [notes, setNotes] = useState("");

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());

  const load = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("migration_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(`Could not load runs: ${error.message}`);
    } else if (data) {
      setRuns(data as unknown as MigrationRun[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const totalRuns = runs.length;
    const totalChanged = runs.reduce((s, r) => s + (r.total_rows_changed || 0), 0);
    const totalSkipped = runs.reduce((s, r) => s + (r.total_rows_skipped || 0), 0);
    const lastRun = runs[0];
    return { totalRuns, totalChanged, totalSkipped, lastRun };
  }, [runs]);

  const resetForm = () => {
    setRunName("");
    setDescription("");
    setPacksInput("");
    setRowsChanged("");
    setRowsSkipped("");
    setNotes("");
  };

  const submitRun = async () => {
    if (!runName.trim()) {
      toast.error("Run name is required");
      return;
    }
    setSubmitting(true);
    const packs = packsInput
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);

    const { error } = await supabase.from("migration_runs").insert({
      run_name: runName.trim(),
      description: description.trim() || null,
      operator_email: user?.email ?? null,
      operator_id: user?.id ?? null,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      status: "completed",
      total_rows_changed: parseInt(rowsChanged, 10) || 0,
      total_rows_skipped: parseInt(rowsSkipped, 10) || 0,
      packs_updated: packs,
      per_pack_results: packs.map((p) => ({
        pack: p,
        count: Math.round((parseInt(rowsChanged, 10) || 0) / Math.max(packs.length, 1)),
      })),
      notes: notes.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error(`Failed: ${error.message}`);
      return;
    }
    toast.success("Migration run logged");
    resetForm();
    setShowForm(false);
    load();
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AdminShell
      title="Migration Audit"
      subtitle="Persisted log of every data migration run"
      icon={<Database size={18} className="text-[#3A7D6E]" />}
      backTo="/admin/dashboard"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={refreshing}
            className="text-[#6F6158] hover:text-[#3D4250]"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm((s) => !s)}
            className="bg-[#D9BC7A] hover:bg-[#C9AB6A] text-[#6F6158]"
          >
            <Plus size={14} />
            <span className="ml-2">Log new run</span>
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[#6F6158]/60 font-body">Loading audit log…</p>
      ) : (
        <div className="space-y-8">
          {/* TOP STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total runs" value={stats.totalRuns.toString()} accent="#3A7D6E" />
            <StatCard label="Rows changed" value={stats.totalChanged.toString()} accent="#4AA5A8" />
            <StatCard
              label="Rows skipped"
              value={stats.totalSkipped.toString()}
              accent="#9D8C7D"
            />
            <StatCard
              label="Last run"
              value={stats.lastRun ? formatNZ(stats.lastRun.started_at).split(",")[0] : "—"}
              accent="#D9BC7A"
            />
          </div>

          {/* NEW RUN FORM */}
          {showForm && (
            <section
              className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl p-5 space-y-3"
              style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
            >
              <h3 className="font-display text-xl text-[#3D4250]">Log a new migration run</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6F6158]">Run name *</Label>
                  <Input
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder="e.g. Seed HOKO retail agents"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6F6158]">
                    Packs touched (comma-separated)
                  </Label>
                  <Input
                    value={packsInput}
                    onChange={(e) => setPacksInput(e.target.value)}
                    placeholder="hoko, ako"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6F6158]">Rows changed</Label>
                  <Input
                    type="number"
                    value={rowsChanged}
                    onChange={(e) => setRowsChanged(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6F6158]">
                    Rows skipped (idempotent conflicts)
                  </Label>
                  <Input
                    type="number"
                    value={rowsSkipped}
                    onChange={(e) => setRowsSkipped(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6F6158]">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One-line summary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6F6158]">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth flagging — conflicts, warnings, follow-ups."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="text-[#6F6158]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRun}
                  disabled={submitting}
                  className="bg-[#3A7D6E] hover:bg-[#2A6D5E] text-white"
                >
                  {submitting ? "Saving…" : "Save run"}
                </Button>
              </div>
            </section>
          )}

          {/* RUNS LIST */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-[#9D8C7D] tracking-wide">
              Migration history
            </h2>

            {runs.length === 0 ? (
              <p className="text-sm text-[#6F6158]/60 font-body italic">
                No migration runs logged yet. Click &quot;Log new run&quot; to record one.
              </p>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => {
                  const statusStyle = STATUS_STYLES[run.status] ?? STATUS_STYLES.completed;
                  const perPack = Array.isArray(run.per_pack_results) ? run.per_pack_results : [];
                  return (
                    <div
                      key={run.id}
                      className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl p-5"
                      style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
                              style={{ background: statusStyle.bg, color: statusStyle.color }}
                            >
                              {statusStyle.label}
                            </span>
                            <p className="font-display text-lg text-[#3D4250]">{run.run_name}</p>
                          </div>
                          {run.description && (
                            <p className="text-sm text-[#6F6158]/80 mt-1 font-body">
                              {run.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#6F6158]/60 font-body">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {formatNZ(run.started_at)}
                            </span>
                            {run.operator_email && (
                              <span className="flex items-center gap-1">
                                <UserIcon size={11} />
                                {run.operator_email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-2xl text-[#3A7D6E]">
                            {run.total_rows_changed}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50">
                            changed
                          </p>
                          {run.total_rows_skipped > 0 && (
                            <>
                              <p className="font-mono text-sm text-[#9D8C7D] mt-1">
                                {run.total_rows_skipped}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50">
                                skipped
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {perPack.length > 0 && (
                        <div className="border-t border-[rgba(142,129,119,0.12)] pt-3">
                          <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50 font-body mb-2">
                            Packs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {perPack.map((p) => (
                              <div
                                key={p.pack}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-body"
                                style={{
                                  background: "rgba(74,165,168,0.08)",
                                  border: "1px solid rgba(74,165,168,0.2)",
                                  color: "#3D4250",
                                }}
                                title={p.agents?.join(", ")}
                              >
                                <CheckCircle2 size={12} className="text-[#3A7D6E]" />
                                <span className="font-mono uppercase">{p.pack}</span>
                                <span className="text-[#6F6158]/60">·</span>
                                <span className="text-[#6F6158]">{p.count} rows</span>
                                {p.skipped !== undefined && p.skipped > 0 && (
                                  <>
                                    <span className="text-[#6F6158]/60">·</span>
                                    <span className="text-[#9D8C7D] flex items-center gap-1">
                                      <MinusCircle size={10} />
                                      {p.skipped}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {run.packs_skipped && run.packs_skipped.length > 0 && (
                        <div className="border-t border-[rgba(142,129,119,0.12)] pt-3 mt-3">
                          <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50 font-body mb-2 flex items-center gap-1">
                            <MinusCircle size={11} /> Skipped (already applied)
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {run.packs_skipped.map((p) => (
                              <span
                                key={p}
                                className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-full bg-[#EEE7DE] text-[#9D8C7D]"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {run.notes && (
                        <div className="border-t border-[rgba(142,129,119,0.12)] pt-3 mt-3 flex gap-2 items-start">
                          <AlertCircle size={12} className="text-[#9D8C7D] mt-0.5 shrink-0" />
                          <p className="text-xs text-[#6F6158]/70 font-body italic">
                            {run.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <p className="text-xs text-[#6F6158]/50 font-body italic">
            Source: <code className="font-mono">public.migration_runs</code> · Admin-only via RLS
          </p>
        </div>
      )}
    </AdminShell>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div
    className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl p-4"
    style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
  >
    <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50 font-body mb-1">
      {label}
    </p>
    <p className="font-display text-2xl" style={{ color: accent }}>
      {value}
    </p>
  </div>
);

export default AdminMigrationAudit;

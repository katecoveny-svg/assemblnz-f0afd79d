/**
 * Privacy & Governance Vault — NZ Privacy Act 2020 compliance
 * Light-glass theme.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Download, Trash2, Eye, Database, Lock,
  FileText, AlertTriangle, CheckCircle2, Loader2,
  Brain, Key, Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(74,165,168,0.18)",
  boxShadow: "0 4px 20px rgba(26,29,41,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const TEAL = "#4AA5A8";
const POUNAMU = "#3A8A8D";
const TEXT = "#1A1D29";
const MUTED = "#6B7280";
const SUBTLE = "#4A5160";

interface DataCategory {
  id: string;
  label: string;
  table: string;
  icon: React.ElementType;
  description: string;
  count: number | null;
}

export default function PrivacyVault() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [dataCounts, setDataCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  const categories: DataCategory[] = [
    { id: "conversations", label: "Chat Conversations", table: "conversations", icon: Brain, description: "All agent chat history and context", count: dataCounts.conversations ?? null },
    { id: "memory", label: "AI Memory & Learning", table: "agent_memory", icon: Database, description: "Personalisation data the AI has learned about you", count: dataCounts.memory ?? null },
    { id: "summaries", label: "Conversation Summaries", table: "conversation_summaries", icon: FileText, description: "Compressed context used for long-term memory", count: dataCounts.summaries ?? null },
    { id: "analytics", label: "Usage Analytics", table: "agent_analytics", icon: Eye, description: "How you've interacted with agents", count: dataCounts.analytics ?? null },
    { id: "brand", label: "Brand Identities", table: "brand_identities", icon: Globe, description: "Scanned brand DNA and identity data", count: dataCounts.brand ?? null },
    { id: "signoffs", label: "Sign-Off Records", table: "agent_memory", icon: Shield, description: "HITL verification audit trail", count: dataCounts.signoffs ?? null },
  ];

  const loadCounts = async () => {
    if (!user || loaded) return;
    const tables = ["conversations", "agent_memory", "conversation_summaries", "agent_analytics", "brand_identities"];
    const results: Record<string, number> = {};
    await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabase.from(t as any).select("id", { count: "exact", head: true }).eq("user_id", user.id);
        results[t === "agent_memory" ? "memory" : t === "brand_identities" ? "brand" : t === "agent_analytics" ? "analytics" : t === "conversation_summaries" ? "summaries" : t] = count || 0;
      })
    );
    setDataCounts(results);
    setLoaded(true);
  };

  useState(() => { loadCounts(); });

  const handleExportAll = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const exportData: Record<string, any> = { exportDate: new Date().toISOString(), userId: user.id };
      const tables = ["conversations", "agent_memory", "conversation_summaries", "brand_identities"];
      for (const t of tables) {
        const { data } = await supabase.from(t as any).select("*").eq("user_id", user.id).limit(1000);
        exportData[t] = data || [];
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assembl-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAIData = async () => {
    if (!user) return;
    setDeleting("all");
    try {
      await Promise.all([
        supabase.from("agent_memory").delete().eq("user_id", user.id),
        supabase.from("conversation_summaries").delete().eq("user_id", user.id),
      ]);
      setDataCounts((prev) => ({ ...prev, memory: 0, summaries: 0, signoffs: 0 }));
      setDeleteConfirm(false);
      toast.success("AI training data deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ color: TEXT }}>
      <SEO title="Privacy & Governance | Assembl" description="Manage your data, AI transparency, and NZ Privacy Act 2020 compliance." />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(74,165,168,0.18), rgba(168,221,219,0.25))" }}>
              <Shield className="w-6 h-6" style={{ color: POUNAMU }} />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight" style={{ color: TEXT, fontFamily: "'Inter', sans-serif" }}>Privacy & Governance</h1>
              <p className="text-sm" style={{ color: MUTED }}>NZ Privacy Act 2020 · Your data, your control</p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Act Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ ...GLASS, borderColor: "rgba(74,165,168,0.25)" }}>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: POUNAMU }} />
            <div className="space-y-1">
              <p className="text-sm font-medium" style={{ color: POUNAMU }}>NZ Privacy Act 2020 Compliance</p>
              <p className="text-xs" style={{ color: SUBTLE }}>
                Under Information Privacy Principles (IPPs), you have the right to access all personal information
                we hold about you and request its correction or deletion. All data is processed within
                NZ-aligned infrastructure.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Categories */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: TEXT }}>
            <Eye className="w-5 h-5" style={{ color: TEAL }} />
            What Data We Hold
          </h2>
          <div className="grid gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl p-4 flex items-center gap-4"
                style={GLASS}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(74,165,168,0.10)" }}>
                  <cat.icon className="w-5 h-5" style={{ color: POUNAMU }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: TEXT }}>{cat.label}</p>
                  <p className="text-xs truncate" style={{ color: MUTED }}>{cat.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold" style={{ color: TEAL }}>
                    {cat.count !== null ? cat.count : "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>records</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportAll}
            disabled={exporting || !user}
            className="rounded-2xl p-6 text-left space-y-3 transition-all disabled:opacity-50"
            style={{ ...GLASS, borderColor: "rgba(74,165,168,0.30)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(74,165,168,0.15)" }}>
              {exporting ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: POUNAMU }} /> : <Download className="w-6 h-6" style={{ color: POUNAMU }} />}
            </div>
            <div>
              <p className="font-semibold" style={{ color: POUNAMU }}>Export All My Data</p>
              <p className="text-xs mt-1" style={{ color: SUBTLE }}>
                Download a complete JSON export of all personal data we hold. IPP 6 compliant.
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDeleteConfirm(true)}
            disabled={!user}
            className="rounded-2xl p-6 text-left space-y-3 transition-all disabled:opacity-50"
            style={{ ...GLASS, borderColor: "rgba(200,90,84,0.25)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(200,90,84,0.10)" }}>
              <Trash2 className="w-6 h-6" style={{ color: "#C85A54" }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "#C85A54" }}>Delete All AI Training Data</p>
              <p className="text-xs mt-1" style={{ color: SUBTLE }}>
                Permanently remove all AI memory and conversation summaries. Chat history is retained.
              </p>
            </div>
          </motion.button>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 space-y-4" style={{ ...GLASS, borderColor: "rgba(200,90,84,0.35)" }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C85A54" }} />
              <div>
                <p className="font-semibold" style={{ color: "#C85A54" }}>Confirm Deletion</p>
                <p className="text-xs mt-1" style={{ color: SUBTLE }}>
                  This will permanently delete all AI memory and learned context. This action cannot be undone.
                  Your chat history and account will remain intact.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteAIData} disabled={!!deleting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "#C85A54", color: "#FFFFFF" }}>
                {deleting ? "Deleting…" : "Yes, Delete Everything"}
              </button>
              <button onClick={() => setDeleteConfirm(false)}
                className="px-6 py-2.5 rounded-xl text-sm transition-colors" style={{ ...GLASS, color: SUBTLE }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Compliance Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 space-y-3" style={GLASS}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: TEXT }}>
            <Key className="w-4 h-4" style={{ color: TEAL }} />
            Your Rights Under NZ Privacy Act 2020
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs" style={{ color: SUBTLE }}>
            {[
              { ipp: "IPP 6", txt: "Right to access your personal information" },
              { ipp: "IPP 7", txt: "Right to request correction of your data" },
              { ipp: "IPP 5", txt: "Your data is stored securely" },
              { ipp: "IPP 11", txt: "Data not disclosed without your consent" },
            ].map((r) => (
              <div key={r.ipp} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: POUNAMU }} />
                <span><strong style={{ color: TEXT }}>{r.ipp}:</strong> {r.txt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText, Download, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertTriangle, Clock, FileJson, FileSpreadsheet,
} from "lucide-react";
import {
  type AuditEntry,
  entriesToCsv,
  entriesToJson,
  downloadFile,
} from "./useGovernanceAuditLog";

const POUNAMU = "#3A7D6E";
const ALERT_AMBER = "#C68A3D";
const ALERT_RED = "#B5483A";

interface Props {
  entries: AuditEntry[];
  onClear: () => void;
  kete: string;
}

export function GovernanceAuditPanel({ entries, onClear, kete }: Props) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = {
    total: entries.length,
    allowed: entries.filter((e) => e.verdict === "allow").length,
    needsHuman: entries.filter((e) => e.verdict === "needs_human").length,
    blocked: entries.filter((e) => e.verdict === "block").length,
  };

  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const exportCsv = () => {
    if (!entries.length) return;
    downloadFile(`${kete.toLowerCase()}-audit-${stamp()}.csv`, entriesToCsv(entries), "text/csv");
  };
  const exportJson = () => {
    if (!entries.length) return;
    downloadFile(
      `${kete.toLowerCase()}-audit-${stamp()}.json`,
      entriesToJson(entries),
      "application/json",
    );
  };

  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(58,125,110,0.03)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors hover:bg-black/[0.02]"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${POUNAMU}15` }}
          >
            <ScrollText size={13} style={{ color: POUNAMU }} />
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#3D4250" }}>
            Governed action audit
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(0,0,0,0.04)", color: "#6B7280" }}
          >
            {stats.total} entr{stats.total === 1 ? "y" : "ies"}
          </span>
          {stats.blocked > 0 && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${ALERT_RED}15`, color: ALERT_RED }}
            >
              {stats.blocked} blocked
            </span>
          )}
          {stats.needsHuman > 0 && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${ALERT_AMBER}15`, color: ALERT_AMBER }}
            >
              {stats.needsHuman} sign-off
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={14} style={{ color: "#9CA3AF" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 space-y-2">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "#6B7280" }}>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={10} style={{ color: POUNAMU }} />
                    {stats.allowed} allowed
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={10} style={{ color: ALERT_AMBER }} />
                    {stats.needsHuman} sign-off
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle size={10} style={{ color: ALERT_RED }} />
                    {stats.blocked} blocked
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={exportCsv}
                    disabled={!entries.length}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors disabled:opacity-40"
                    style={{ background: `${POUNAMU}15`, color: POUNAMU }}
                    title="Export as CSV"
                  >
                    <FileSpreadsheet size={11} /> CSV
                  </button>
                  <button
                    onClick={exportJson}
                    disabled={!entries.length}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors disabled:opacity-40"
                    style={{ background: `${POUNAMU}15`, color: POUNAMU }}
                    title="Export as JSON"
                  >
                    <FileJson size={11} /> JSON
                  </button>
                  <button
                    onClick={onClear}
                    disabled={!entries.length}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors disabled:opacity-40"
                    style={{ background: `${ALERT_RED}10`, color: ALERT_RED }}
                    title="Clear local audit log"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Entry list */}
              <div
                className="max-h-64 overflow-y-auto rounded-lg"
                style={{ border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)" }}
              >
                {entries.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center gap-1 py-6 text-[10px]"
                    style={{ color: "#9CA3AF" }}
                  >
                    <ScrollText size={20} style={{ opacity: 0.4 }} />
                    No governed actions logged yet. Each chat turn will appear here.
                  </div>
                ) : (
                  <ul className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                    {entries.map((entry) => (
                      <AuditRow
                        key={entry.id}
                        entry={entry}
                        expanded={expandedId === entry.id}
                        onToggle={() =>
                          setExpandedId((id) => (id === entry.id ? null : entry.id))
                        }
                      />
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-[9px]" style={{ color: "#9CA3AF" }}>
                Local audit log — server-side records persist in <code className="font-mono">audit_log</code>.
                Last {entries.length}/200 entries shown.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuditRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: AuditEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const verdictMeta = {
    allow: { color: POUNAMU, label: "Allowed", Icon: CheckCircle2 },
    needs_human: { color: ALERT_AMBER, label: "Sign-off", Icon: AlertTriangle },
    block: { color: ALERT_RED, label: "Blocked", Icon: XCircle },
  }[entry.verdict];

  const time = new Date(entry.timestamp).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const failed = entry.evaluations.filter((p) => !p.passed);

  return (
    <li>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-black/[0.02] transition-colors"
      >
        <verdictMeta.Icon size={11} style={{ color: verdictMeta.color, flexShrink: 0 }} />
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: `${verdictMeta.color}12`, color: verdictMeta.color }}
        >
          {verdictMeta.label}
        </span>
        <span className="text-[10px] font-medium" style={{ color: "#3D4250" }}>
          {entry.action}
        </span>
        {entry.zone && (
          <span className="text-[9px] font-mono" style={{ color: "#6B7280" }}>
            · {entry.zone}
          </span>
        )}
        <span className="flex-1 truncate text-[10px]" style={{ color: "#6B7280" }}>
          {entry.userMessagePreview}
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono" style={{ color: "#9CA3AF" }}>
          <Clock size={9} /> {time}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 pt-0.5 space-y-1.5 text-[10px]" style={{ color: "#3D4250" }}>
              <div>
                <span className="font-medium">Rationale: </span>
                <span style={{ color: "#6B7280" }}>{entry.rationale}</span>
              </div>
              {entry.approvalId && (
                <div>
                  <span className="font-medium">Approval ID: </span>
                  <span className="font-mono" style={{ color: "#6B7280" }}>
                    {entry.approvalId}
                  </span>
                </div>
              )}
              {failed.length > 0 && (
                <div>
                  <div className="font-medium mb-0.5">Failed policies</div>
                  <ul className="space-y-0.5">
                    {failed.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 px-1.5 py-1 rounded"
                        style={{
                          background: p.severity === "block" ? `${ALERT_RED}08` : `${ALERT_AMBER}08`,
                        }}
                      >
                        <span
                          className="text-[9px] font-mono px-1 py-0.5 rounded"
                          style={{
                            background: p.severity === "block" ? `${ALERT_RED}20` : `${ALERT_AMBER}20`,
                            color: p.severity === "block" ? ALERT_RED : ALERT_AMBER,
                          }}
                        >
                          {p.policyId}
                        </span>
                        <span style={{ color: "#6B7280" }}>{p.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5" style={{ color: "#6B7280" }}>
                <div>
                  PPE: <strong>{String(entry.context.ppeConfirmed ?? "—")}</strong>
                </div>
                <div>
                  Consent: <strong>{String(entry.context.workerConsent ?? "—")}</strong>
                </div>
                <div>
                  Sign-off: <strong>{String(entry.context.humanSignoff ?? "—")}</strong>
                </div>
                <div>
                  Headcount:{" "}
                  <strong>
                    {entry.context.headcount ?? "—"}/{entry.context.headcountCap ?? "—"}
                  </strong>
                </div>
              </div>
              {(entry.context.criticalHazardZones?.length ?? 0) > 0 && (
                <div>
                  <span className="font-medium">Locked zones: </span>
                  <span className="font-mono" style={{ color: ALERT_RED }}>
                    {entry.context.criticalHazardZones!.join(", ")}
                  </span>
                </div>
              )}
              {entry.durationMs !== undefined && (
                <div style={{ color: "#9CA3AF" }}>Latency: {entry.durationMs} ms</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

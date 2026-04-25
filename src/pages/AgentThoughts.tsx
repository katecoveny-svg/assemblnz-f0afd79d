import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Brain, Plus, Play, Loader2, Trash2, ChevronRight } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import NoiseOverlay from "@/components/NoiseOverlay";
import { useAuth } from "@/hooks/useAuth";
import {
  useThoughts, useThoughtRuns, useCreateThought, useUpdateThought,
  useDeleteThought, useRunThoughtNow,
  type AgentThought,
} from "@/hooks/useThoughts";
import { keteAccentHex } from "@/lib/keteColors";
import { toast } from "sonner";

/**
 * AgentThoughts — control surface for the ambient thinking loop.
 *
 * Users register standing prompts ("every hour, scan the latest MPI updates
 * for anything affecting a Wellington cafe") against a kete agent. The
 * /ambient-agent-loop edge function (cron, every minute) picks them up
 * when they're due and writes outputs to agent_thought_runs.
 *
 * This page is the human side: create/edit/delete thoughts, see the latest
 * run preview, drill into history, and fire "Run now" via /run-thought.
 *
 * Brand-aligned with Mārama Whenua tokens — Cormorant Garamond display,
 * soft-glass surfaces, kete accent per-card.
 */

const AGENT_OPTIONS: { id: string; label: string; sub: string }[] = [
  { id: "manaaki",  label: "Manaaki",  sub: "Hospitality" },
  { id: "waihanga", label: "Waihanga", sub: "Construction" },
  { id: "auaha",    label: "Auaha",    sub: "Creative" },
  { id: "pakihi",   label: "Pakihi",   sub: "Small business" },
  { id: "pikau",    label: "Pikau",    sub: "Freight & customs" },
  { id: "toro",     label: "Tōro",     sub: "Family" },
];

const CADENCE_OPTIONS = [
  { value: 30,    label: "Every 30 minutes" },
  { value: 60,    label: "Hourly" },
  { value: 240,   label: "Every 4 hours" },
  { value: 720,   label: "Every 12 hours" },
  { value: 1440,  label: "Daily" },
  { value: 10080, label: "Weekly" },
];

export default function AgentThoughtsPage() {
  const { user, loading } = useAuth();
  const thoughts = useThoughts();
  const create = useCreateThought();
  const update = useUpdateThought();
  const remove = useDeleteThought();
  const runNow = useRunThoughtNow();
  const [drawerThought, setDrawerThought] = useState<AgentThought | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading) return <PageShell><LoadingState /></PageShell>;
  if (!user) return <Navigate to="/login?redirect=/thoughts" replace />;

  const handleCreate = async (
    input: { agent_id: string; title: string; prompt: string; cadence_minutes: number },
  ) => {
    try {
      await create.mutateAsync(input);
      toast.success("Thought registered. The ambient loop will pick it up on its next tick.");
    } catch (e) {
      toast.error((e as Error).message || "Failed to register thought");
    }
  };

  const handleRunNow = async (id: string) => {
    setBusyId(id);
    try {
      const r = await runNow.mutateAsync(id);
      toast.success(`Ran in ${(r.duration_ms ?? 0) / 1000}s · ${r.kb_hits ?? 0} kb hits · ${r.memory_hits ?? 0} memory hits`);
    } catch (e) {
      toast.error((e as Error).message || "Run failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (t: AgentThought) => {
    try {
      await update.mutateAsync({ id: t.id, patch: { enabled: !t.enabled } });
    } catch (e) {
      toast.error((e as Error).message || "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this thought and all its run history?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Deleted.");
      if (drawerThought?.id === id) setDrawerThought(null);
    } catch (e) {
      toast.error((e as Error).message || "Delete failed");
    }
  };

  return (
    <PageShell>
      <header className="max-w-[960px] mx-auto px-4 sm:px-6 pt-12 pb-8">
        <p className="text-[10px] tracking-[5px] uppercase mb-4"
           style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-soft-gold)" }}>
          — Ambient agents —
        </p>
        <h1 className="mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.012em",
              color: "var(--assembl-taupe-deep)",
            }}>
          Thoughts your agents <em style={{ color: "var(--assembl-soft-gold)" }}>keep for you.</em>
        </h1>
        <p className="max-w-[58ch] mt-4 text-[16px] leading-[1.7]"
           style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>
          Register a standing prompt and an agent will think on it on a quiet schedule —
          grounded in live knowledge and your remembered context. Each run lands in the
          history below.
        </p>
      </header>

      <main className="max-w-[960px] mx-auto px-4 sm:px-6 pb-24 grid gap-8">
        <CreateForm onSubmit={handleCreate} pending={create.isPending} />

        {thoughts.isLoading && <LoadingState />}
        {!thoughts.isLoading && (thoughts.data?.length ?? 0) === 0 && <EmptyState />}

        {(thoughts.data ?? []).map((t) => (
          <ThoughtCard
            key={t.id}
            thought={t}
            busy={busyId === t.id}
            onRunNow={() => handleRunNow(t.id)}
            onToggle={() => handleToggle(t)}
            onDelete={() => handleDelete(t.id)}
            onOpenHistory={() => setDrawerThought(t)}
          />
        ))}
      </main>

      <AnimatePresence>
        {drawerThought && (
          <RunsDrawer
            thought={drawerThought}
            onClose={() => setDrawerThought(null)}
          />
        )}
      </AnimatePresence>

      <BrandFooter />
    </PageShell>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ background: "var(--assembl-mist)" }}>
      <SEO
        title="Ambient agents · assembl"
        description="Register standing prompts and let your kete agents think on them on a quiet schedule. Grounded in live NZ knowledge and remembered context."
      />
      <NoiseOverlay />
      <BrandNav />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────

function CreateForm({
  onSubmit, pending,
}: {
  onSubmit: (input: { agent_id: string; title: string; prompt: string; cadence_minutes: number }) => void;
  pending: boolean;
}) {
  const [agentId, setAgentId] = useState("manaaki");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [cadence, setCadence] = useState(60);

  const accent = keteAccentHex(agentId);
  const canSubmit = title.trim().length > 0 && prompt.trim().length > 0 && !pending;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[24px] p-6 sm:p-8 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(var(--surface-blur))",
        WebkitBackdropFilter: "blur(var(--surface-blur))",
        border: "var(--hairline)",
        boxShadow: "var(--shadow-brand)",
      }}>
      <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.4,
      }} />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
             style={{ background: `${accent}20` }}>
          <Plus size={18} style={{ color: accent }} />
        </div>
        <div>
          <h2 className="text-[20px]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "var(--assembl-taupe-deep)" }}>
            Register a new thought
          </h2>
          <p className="text-[13px]" style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>
            Pick an agent, write the question once, choose how often it should be re-asked.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Agent">
          <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={selectCls}>
            {AGENT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label} · {o.sub}</option>
            ))}
          </select>
        </Field>

        <Field label="Cadence">
          <select value={cadence} onChange={(e) => setCadence(Number(e.target.value))} className={selectCls}>
            {CADENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Title" hint="A short label for your dashboard.">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Daily MPI food safety scan"
            maxLength={200}
            className={inputCls}
          />
        </Field>

        <Field label="Prompt" hint="What should the agent think on?" full>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Scan the latest MPI food safety updates that affect a Wellington cafe and summarise anything new since yesterday."
            maxLength={4000}
            rows={4}
            className={`${inputCls} resize-y`}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit({ agent_id: agentId, title: title.trim(), prompt: prompt.trim(), cadence_minutes: cadence })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #D9BC7A 0%, #C4A664 100%)",
            color: "#3D3428",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
            boxShadow: "0 12px 32px -10px rgba(217,188,122,0.55)",
          }}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
          {pending ? "Registering" : "Register thought"}
        </button>
      </div>
    </motion.section>
  );
}

function Field({
  label, hint, children, full,
}: {
  label: string; hint?: string; children: React.ReactNode; full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] tracking-[3px] uppercase mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)" }}>
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1.5 text-[12px]"
                     style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-[16px] text-[14px] focus:outline-none focus:ring-1 transition-colors";
const selectCls = `${inputCls} appearance-none pr-10`;

// ─── Thought card ─────────────────────────────────────────────────────────

function ThoughtCard({
  thought, busy, onRunNow, onToggle, onDelete, onOpenHistory,
}: {
  thought: AgentThought;
  busy: boolean;
  onRunNow: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onOpenHistory: () => void;
}) {
  const accent = keteAccentHex(thought.agent_id);
  const lastRun = thought.last_run_at ? new Date(thought.last_run_at) : null;
  const nextDue = thought.next_due_at ? new Date(thought.next_due_at) : null;

  const cadenceLabel = useMemo(() => {
    const m = thought.cadence_minutes;
    if (m % 1440 === 0) return m === 1440 ? "daily" : `every ${m / 1440} days`;
    if (m % 60 === 0)   return m === 60 ? "hourly" : `every ${m / 60}h`;
    return `every ${m}m`;
  }, [thought.cadence_minutes]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[24px] p-6 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(var(--surface-blur))",
        WebkitBackdropFilter: "blur(var(--surface-blur))",
        border: "var(--hairline)",
        boxShadow: "var(--shadow-brand)",
        opacity: thought.enabled ? 1 : 0.7,
      }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
           style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] tracking-[3px] uppercase px-3 py-1 rounded-full"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: `${accent}20`, color: accent, border: `1px solid ${accent}40`,
                  }}>
              {thought.agent_id}
            </span>
            <span className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)" }}>
              {cadenceLabel}
            </span>
            {!thought.enabled && (
              <span className="text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded-full"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(111,97,88,0.08)", color: "var(--assembl-taupe)" }}>
                paused
              </span>
            )}
          </div>

          <h3 className="text-[22px] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "var(--assembl-taupe-deep)", lineHeight: 1.2 }}>
            {thought.title}
          </h3>
          <p className="text-[14px] leading-[1.7]" style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>
            {thought.prompt}
          </p>

          <p className="mt-3 text-[12px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)" }}>
            {lastRun ? `Last run ${formatRelative(lastRun)}` : "Never run"}
            {nextDue && thought.enabled ? ` · next due ${formatRelative(nextDue)}` : ""}
          </p>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <IconButton onClick={onRunNow} disabled={busy} accent={accent} label={busy ? "Running" : "Run now"}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          </IconButton>
          <IconButton onClick={onToggle} accent="var(--assembl-taupe)" label={thought.enabled ? "Pause" : "Resume"}>
            <span className="text-[10px] tracking-[2px] uppercase"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {thought.enabled ? "Pause" : "Resume"}
            </span>
          </IconButton>
          <IconButton onClick={onOpenHistory} accent="var(--assembl-taupe)" label="History">
            <ChevronRight size={14} />
          </IconButton>
          <IconButton onClick={onDelete} accent="#A55B5B" label="Delete">
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
    </motion.article>
  );
}

function IconButton({
  children, accent, label, onClick, disabled,
}: {
  children: React.ReactNode; accent: string; label: string;
  onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full transition-all disabled:opacity-50 hover:-translate-y-px"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(var(--surface-blur))",
        WebkitBackdropFilter: "blur(var(--surface-blur))",
        border: "var(--hairline)",
        color: accent,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.16em",
      }}>
      {children}
    </button>
  );
}

// ─── Run history drawer ──────────────────────────────────────────────────

function RunsDrawer({ thought, onClose }: { thought: AgentThought; onClose: () => void }) {
  const runs = useThoughtRuns(thought.id, 20);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: "rgba(111,97,88,0.25)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[560px] h-full overflow-y-auto"
        style={{
          background: "var(--assembl-mist)",
          borderLeft: "var(--hairline)",
          boxShadow: "0 0 60px rgba(111,97,88,0.18)",
        }}>
        <header className="px-6 py-5 sticky top-0 z-10"
                style={{ background: "rgba(247,243,238,0.92)", borderBottom: "var(--hairline)", backdropFilter: "blur(var(--surface-blur))" }}>
          <p className="text-[10px] tracking-[3px] uppercase"
             style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-soft-gold)" }}>
            — Run history —
          </p>
          <h3 className="mt-1 text-[22px]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "var(--assembl-taupe-deep)" }}>
            {thought.title}
          </h3>
          <button onClick={onClose} className="absolute top-5 right-5 text-[12px]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)", letterSpacing: "0.16em" }}>
            CLOSE
          </button>
        </header>

        <div className="px-6 py-6 grid gap-5">
          {runs.isLoading && <p style={{ color: "var(--assembl-taupe)" }}>Loading…</p>}
          {!runs.isLoading && (runs.data?.length ?? 0) === 0 && (
            <p className="text-[14px]" style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>
              No runs yet — try the “Run now” button on the card.
            </p>
          )}
          {(runs.data ?? []).map((r) => (
            <article key={r.id} className="rounded-[16px] p-5"
                     style={{
                       background: "rgba(255,255,255,0.85)",
                       border: "var(--hairline)",
                       boxShadow: "var(--shadow-soft)",
                     }}>
              <div className="flex items-center justify-between mb-3 text-[11px]"
                   style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)" }}>
                <span>{new Date(r.created_at).toLocaleString()}</span>
                <span>
                  {r.status} · kb {r.kb_hits} · mem {r.memory_hits} · {r.duration_ms ?? "?"}ms
                </span>
              </div>
              {r.status === "success" ? (
                <p className="text-[14px] whitespace-pre-wrap leading-[1.7]"
                   style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe-deep)" }}>
                  {r.output}
                </p>
              ) : (
                <p className="text-[13px]"
                   style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#A55B5B" }}>
                  {r.error_message ?? "Unknown error"}
                </p>
              )}
            </article>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="text-center py-12"
         style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--assembl-taupe)", letterSpacing: "0.16em" }}>
      LOADING THOUGHTS
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 max-w-[380px] mx-auto">
      <p className="text-[15px] mb-2"
         style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--assembl-taupe)" }}>
        Quietly, nothing yet.
      </p>
      <p className="text-[13px]"
         style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>
        Register your first standing thought above and the loop will pick it up on its next minute tick.
      </p>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatRelative(d: Date): string {
  const ms = d.getTime() - Date.now();
  const abs = Math.abs(ms);
  const future = ms > 0;
  const minutes = Math.round(abs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return future ? `in ${minutes}m` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return future ? `in ${days}d` : `${days}d ago`;
}

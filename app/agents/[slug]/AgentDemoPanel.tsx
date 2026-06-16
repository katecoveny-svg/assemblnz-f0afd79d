'use client';

import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Loader2, Mail, Play, ShieldCheck } from 'lucide-react';

type Props = {
  agentSlug: string;
  agentName: string;
  keteName: string;
  keteAccent: string;
  workflowId?: string | null;
  workflowTitle?: string | null;
  starterPrompt: string;
  evidencePack?: string | null;
  reviewerRole?: string | null;
};

type DemoResponse = {
  response?: string;
  error?: string;
  agentUsed?: { code?: string; name?: string; pack?: string; model?: string };
  modelUsed?: string;
};

export function AgentDemoPanel({
  agentSlug,
  agentName,
  keteName,
  keteAccent,
  workflowId,
  workflowTitle,
  starterPrompt,
  evidencePack,
  reviewerRole,
}: Props) {
  const [message, setMessage] = useState(starterPrompt);
  const [response, setResponse] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    return [
      `assembl live agent demo`,
      ``,
      `Kete: ${keteName}`,
      `Agent: ${agentName}`,
      workflowTitle ? `Workflow: ${workflowTitle}` : null,
      evidencePack ? `Evidence pack: ${evidencePack}` : null,
      reviewerRole ? `Reviewer: ${reviewerRole}` : null,
      ``,
      `Prompt:`,
      message,
      ``,
      response?.response ? `Agent draft:\n${response.response}` : `Agent draft: not run yet`,
      ``,
      `Draft only. A named human reviewer approves before anything is sent, filed, lodged, or relied on.`,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }, [agentName, evidencePack, keteName, message, response?.response, reviewerRole, workflowTitle]);

  const runDemo = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/agent-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentSlug,
          workflowId,
          message: trimmed,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as DemoResponse;
      setResponse(
        res.ok
          ? data
          : { error: data.error || `Live demo failed with HTTP ${res.status}` },
      );
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : 'The live demo could not be reached.',
      });
    } finally {
      setLoading(false);
    }
  }, [agentSlug, loading, message, workflowId]);

  const copyBrief = useCallback(async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [shareText]);

  const emailBrief = useCallback(() => {
    const subject = encodeURIComponent(
      workflowTitle ? `assembl demo: ${workflowTitle}` : `assembl demo: ${agentName}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(shareText)}`;
  }, [agentName, shareText, workflowTitle]);

  return (
    <section className="glass-card mx-auto mt-8 max-w-7xl overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="border-b border-[rgba(35,33,31,0.10)] bg-[rgba(250,247,242,0.72)] p-6 lg:border-b-0 lg:border-r">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.12)] bg-white/70 px-3 py-1 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: keteAccent }} />
            Live Iho demo
          </div>
          <h2 className="mt-5 font-display text-5xl font-light leading-[0.95] text-[color:var(--text-primary)]">
            Fire {agentName} now.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
            This panel calls the real assembl Iho router. Copy or email the reply straight to a
            client after you run it.
          </p>

          <div className="mt-6 grid gap-3 text-sm">
            <Fact label="Kete" value={keteName} />
            {workflowTitle ? <Fact label="Workflow" value={workflowTitle} /> : null}
            {evidencePack ? <Fact label="Evidence pack" value={evidencePack} /> : null}
            {reviewerRole ? <Fact label="Reviewer" value={reviewerRole} /> : null}
          </div>
        </div>

        <div className="p-6">
          <label htmlFor="agent-demo-message" className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Demo prompt
          </label>
          <textarea
            id="agent-demo-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="mt-3 min-h-[160px] w-full resize-y rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-[color:var(--assembl-paper)] p-4 text-sm leading-relaxed text-[color:var(--text-primary)] outline-none focus:border-[color:var(--assembl-pounamu)]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runDemo}
              disabled={loading || !message.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-white disabled:opacity-45"
              style={{ backgroundColor: keteAccent }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              Run live agent
            </button>
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white/65 px-5 text-sm"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={emailBrief}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white/65 px-5 text-sm"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Email
            </button>
          </div>

          {response?.error ? (
            <div className="mt-5 rounded-[8px] border border-[rgba(172,88,56,0.35)] bg-[rgba(172,88,56,0.08)] p-4 text-sm leading-relaxed text-[color:var(--text-body)]">
              <p className="font-medium text-[color:var(--text-primary)]">Live agent did not respond</p>
              <p className="mt-1">{response.error}</p>
            </div>
          ) : response?.response ? (
            <div className="glass-card mt-5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  {response.agentUsed?.name ?? agentName} · {response.modelUsed ?? response.agentUsed?.model ?? 'live model'}
                </p>
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--text-body)]">
                {response.response}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-[color:var(--text-primary)]">{value}</p>
    </div>
  );
}

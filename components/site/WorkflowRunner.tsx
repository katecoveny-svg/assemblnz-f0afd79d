'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Check, Copy, ExternalLink, LayoutDashboard, Link as LinkIcon, Play, Code2 } from 'lucide-react';
import type { Workflow } from '@/lib/workflows';
import { getKete } from '@/lib/kete';

type Inputs = Record<string, string | string[]>;

export function WorkflowRunner({
  workflow,
  minimal = false,
}: {
  workflow: Workflow;
  minimal?: boolean;
}) {
  const kete = getKete(workflow.kete);
  const initialInputs = useMemo(() => {
    return workflow.inputs.reduce<Inputs>((acc, input) => {
      acc[input.id] = input.type === 'checkboxes' ? [] : String(workflow.sampleInput[input.id] ?? '');
      return acc;
    }, {});
  }, [workflow]);
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const [output, setOutput] = useState(workflow.sampleOutput);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const installOrigin = 'https://assembl.co.nz';
  const shareUrl = `${installOrigin}/w/${workflow.slug}?org=your-org`;
  const embedCode = `<script src="${installOrigin}/embed/w/${workflow.slug}.js" data-org="your-org" defer></script>`;

  async function runWorkflow() {
    setRunning(true);
    setOutput('');
    try {
      const response = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: workflow.slug, inputs }),
      });
      if (!response.ok) throw new Error('Workflow run failed');
      const text = await response.text();
      setOutput(text || workflow.sampleOutput);
    } catch {
      setOutput(workflow.sampleOutput);
    } finally {
      setRunning(false);
    }
  }

  async function copy(value: string, key: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div
      className={minimal ? 'mx-auto w-full max-w-[920px]' : 'grid gap-6 lg:grid-cols-[1.08fr_0.92fr]'}
      style={{ '--workflow-accent': kete.accent } as CSSProperties}
    >
      <section
        id="preview"
        className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5 shadow-[0_18px_60px_rgba(35,33,31,0.07)] backdrop-blur"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--workflow-accent)]">
              Live sandbox
            </p>
            <h2 className="mt-2 font-display text-4xl font-light italic leading-none">
              Try the workflow.
            </h2>
          </div>
          <span className="rounded-full border border-[rgba(35,33,31,0.10)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            Draft only
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {workflow.inputs.map((input) => (
            <label key={input.id} className="block">
              <span className="text-sm font-medium text-[color:var(--text-primary)]">
                {input.label}
                {input.required ? <span className="text-[color:var(--workflow-accent)]"> *</span> : null}
              </span>
              {input.type === 'textarea' ? (
                <textarea
                  value={String(inputs[input.id] ?? '')}
                  onChange={(event) => setInputs((current) => ({ ...current, [input.id]: event.target.value }))}
                  placeholder={input.placeholder}
                  className="mt-2 min-h-[118px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/80 px-4 py-3 text-sm outline-none focus:border-[color:var(--workflow-accent)]"
                />
              ) : input.type === 'select' ? (
                <select
                  value={String(inputs[input.id] ?? '')}
                  onChange={(event) => setInputs((current) => ({ ...current, [input.id]: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/80 px-4 text-sm outline-none focus:border-[color:var(--workflow-accent)]"
                >
                  <option value="">Choose...</option>
                  {input.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : input.type === 'checkboxes' ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {input.options?.map((option) => {
                    const selected = Array.isArray(inputs[input.id]) && inputs[input.id].includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setInputs((current) => {
                            const currentValue = current[input.id];
                            const existing: string[] = Array.isArray(currentValue) ? currentValue : [];
                            return {
                              ...current,
                              [input.id]: selected ? existing.filter((item) => item !== option) : [...existing, option],
                            };
                          });
                        }}
                        className={[
                          'rounded-full border px-3 py-1.5 text-sm transition',
                          selected
                            ? 'border-[color:var(--workflow-accent)] bg-[color:var(--workflow-accent)] text-white'
                            : 'border-[rgba(35,33,31,0.14)] bg-white/72 text-[color:var(--text-primary)]',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type={input.type}
                  value={String(inputs[input.id] ?? '')}
                  onChange={(event) => setInputs((current) => ({ ...current, [input.id]: event.target.value }))}
                  placeholder={input.placeholder}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/80 px-4 text-sm outline-none focus:border-[color:var(--workflow-accent)]"
                />
              )}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={runWorkflow}
          disabled={running}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-[color:var(--workflow-accent)] px-6 font-medium text-white disabled:cursor-wait disabled:opacity-70"
        >
          <Play className="mr-2 h-4 w-4" aria-hidden />
          {running ? 'Running...' : 'Run preview'}
        </button>
        <div
          className="prose prose-sm mt-6 max-w-none rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5 text-[color:var(--text-body)]"
          dangerouslySetInnerHTML={{ __html: output || '<p>Drafting...</p>' }}
        />
      </section>

      {!minimal && (
        <aside className="space-y-5">
          <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5 backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--workflow-accent)]">
              Install
            </p>
            <h2 className="mt-2 font-display text-4xl font-light italic leading-none">
              Pick how you want to use it.
            </h2>
            <InstallOption
              icon={<LinkIcon className="h-4 w-4" aria-hidden />}
              title="Share a link"
              body="A bookmarkable URL anyone in your organisation can open."
              value={shareUrl}
              button="Copy link"
              copied={copied === 'link'}
              onCopy={() => copy(shareUrl, 'link')}
            />
            <InstallOption
              icon={<Code2 className="h-4 w-4" aria-hidden />}
              title="Embed on your site"
              body="Paste this line wherever you want the workflow available."
              value={embedCode}
              button="Copy code"
              copied={copied === 'embed'}
              onCopy={() => copy(embedCode, 'embed')}
            />
            <a
              href={`/app?workflow=${workflow.slug}`}
              className="mt-4 flex items-center justify-between rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4 text-sm transition hover:border-[color:var(--workflow-accent)]"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-[color:var(--workflow-accent)]" aria-hidden />
                Open in your dashboard
              </span>
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </section>
          <InfoBlock title="What it does" items={workflow.whatItDoes} />
          <InfoBlock title="What it cannot do" items={workflow.requirements} />
        </aside>
      )}
    </div>
  );
}

function InstallOption({
  icon,
  title,
  body,
  value,
  button,
  copied,
  onCopy,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  value: string;
  button: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-4 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4">
      <div className="flex items-center gap-2 font-medium">
        <span className="text-[color:var(--workflow-accent)]">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{body}</p>
      <code className="mt-3 block overflow-x-auto rounded-[8px] bg-white/75 p-3 text-[11px] text-[color:var(--text-primary)]">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 inline-flex h-9 items-center rounded-full border border-[rgba(35,33,31,0.14)] px-4 text-sm"
      >
        {copied ? <Check className="mr-2 h-4 w-4" aria-hidden /> : <Copy className="mr-2 h-4 w-4" aria-hidden />}
        {copied ? 'Copied' : button}
      </button>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5 backdrop-blur">
      <h2 className="font-display text-3xl font-light italic leading-none">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[color:var(--text-body)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--workflow-accent)]" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

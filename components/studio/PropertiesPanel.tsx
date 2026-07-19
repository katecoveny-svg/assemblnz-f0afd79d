'use client';

import { useState } from 'react';
import { useStudioStore, useSelectedComponent } from '@/lib/studio/store';
import { composeSystemPrompt } from '@/lib/studio/schema';

/** Small typed field row so each config screen doesn't reinvent the layout. */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        <span>{label}</span>
        {hint && <span className="tracking-[0.06em] text-[9.5px]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
function TextField(props: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
    />
  );
}
function TextArea(props: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      rows={props.rows ?? 3}
      placeholder={props.placeholder}
      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px] leading-[1.5] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
    />
  );
}
function ListField({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex gap-1.5">
          <TextField
            value={v}
            onChange={(nv) => onChange(values.map((x, j) => (j === i ? nv : x)))}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 font-mono text-[10.5px] hover:border-[color:var(--text-primary)]"
            aria-label="remove"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
      >
        + add item {placeholder ? `— ${placeholder}` : ''}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    configured: 'bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)]',
    draft: 'bg-[color:var(--assembl-gold-thread)] text-[color:var(--text-primary)]',
    inactive: 'bg-[color:var(--assembl-cloud)] text-[color:var(--text-primary)]',
    warning: 'bg-red-400 text-white',
  };
  return (
    <span className={`inline-block rounded-[2px] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}

export function PropertiesPanel() {
  const component = useSelectedComponent();
  const agent = useStudioStore((s) => s.agent);
  const store = useStudioStore.getState.bind(useStudioStore);
  const removeComponent = useStudioStore((s) => s.removeComponent);
  const [tab, setTab] = useState<'main' | 'advanced'>('main');

  if (!component) {
    return (
      <aside className="flex h-full flex-col gap-3 border-l border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">nothing selected</p>
        <p className="text-sm text-[color:var(--text-secondary)]">Click a module in the scene or a chip in the library.</p>
      </aside>
    );
  }

  const removable = !['identity', 'instructions', 'intelligence', 'memory'].includes(component.id);
  const status = (component.data as { status?: string }).status ?? 'configured';

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
      <div className="flex flex-col gap-2 border-b border-[color:var(--assembl-cloud)] p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            {component.kind}
          </span>
          <StatusBadge status={status} />
        </div>
        <h2 className="font-display text-[22px] font-light lowercase text-[color:var(--text-primary)]">
          {getTitle(component)}
        </h2>
        <p className="text-[12px] leading-[1.55] text-[color:var(--text-secondary)]">
          {getPurpose(component)}
        </p>
        <div className="mt-1 flex gap-1.5" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setTab('main')}
            className={[
              'rounded-[2px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]',
              tab === 'main'
                ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
            ].join(' ')}
          >
            Configure
          </button>
          <button type="button" role="tab" aria-selected={tab === 'advanced'} onClick={() => setTab('advanced')}
            className={[
              'rounded-[2px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]',
              tab === 'advanced'
                ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
            ].join(' ')}
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {tab === 'main' ? renderMain() : renderAdvanced()}

        {removable && (
          <button
            type="button"
            onClick={() => { if (confirm('Remove this component from the agent?')) removeComponent(component.id); }}
            className="mt-4 self-start rounded-[2px] border border-red-300 bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-red-600 hover:bg-red-50"
          >
            Remove component
          </button>
        )}
      </div>
    </aside>
  );

  function renderMain(): React.ReactNode {
    switch (component!.kind) {
      case 'instructions': {
        const d = component!.data;
        const upd = useStudioStore.getState().updateInstructions;
        return (
          <>
            <Field label="role"><TextField value={d.role} onChange={(v) => upd({ role: v })} /></Field>
            <Field label="responsibility"><TextArea value={d.responsibility} onChange={(v) => upd({ responsibility: v })} /></Field>
            <Field label="priorities" hint="in order"><ListField values={d.priorities} onChange={(v) => upd({ priorities: v })} placeholder="priority" /></Field>
            <Field label="communication style"><TextArea value={d.communicationStyle} onChange={(v) => upd({ communicationStyle: v })} rows={2} /></Field>
            <Field label="when to escalate"><ListField values={d.whenToEscalate} onChange={(v) => upd({ whenToEscalate: v })} placeholder="condition" /></Field>
            <Field label="prohibited actions"><ListField values={d.prohibitedActions} onChange={(v) => upd({ prohibitedActions: v })} placeholder="never" /></Field>
          </>
        );
      }
      case 'intelligence': {
        const d = component!.data;
        const upd = useStudioStore.getState().updateIntelligence;
        return (
          <>
            <Field label="model"><TextField value={d.model} onChange={(v) => upd({ model: v })} /></Field>
            <Field label="reasoning effort">
              <select value={d.reasoningEffort} onChange={(e) => upd({ reasoningEffort: e.target.value as 'low' | 'medium' | 'high' })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
              </select>
            </Field>
            <Field label={`temperature — ${d.temperature.toFixed(2)}`}>
              <input type="range" min={0} max={1.5} step={0.05} value={d.temperature} onChange={(e) => upd({ temperature: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label={`max output tokens — ${d.maxOutputTokens}`}>
              <input type="range" min={200} max={4000} step={50} value={d.maxOutputTokens} onChange={(e) => upd({ maxOutputTokens: Number(e.target.value) })} className="w-full" />
            </Field>
          </>
        );
      }
      case 'memory': {
        const d = component!.data;
        const upd = useStudioStore.getState().updateMemory;
        return (
          <>
            <Field label="scope">
              <select value={d.scope} onChange={(e) => upd({ scope: e.target.value as typeof d.scope })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                <option value="session">session</option><option value="per-customer">per-customer</option><option value="business-wide">business-wide</option>
              </select>
            </Field>
            <Field label="retention (days)">
              <input type="number" min={1} max={3650} value={d.retentionDays} onChange={(e) => upd({ retentionDays: Number(e.target.value) })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]" />
            </Field>
            <Field label="summary strategy">
              <select value={d.summaryStrategy} onChange={(e) => upd({ summaryStrategy: e.target.value as typeof d.summaryStrategy })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                <option value="none">none</option><option value="rolling">rolling</option><option value="nightly-summary">nightly-summary</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 font-mono text-[11.5px] text-[color:var(--text-primary)]">
              <input type="checkbox" checked={d.containsPII} onChange={(e) => upd({ containsPII: e.target.checked })} />
              may contain personally identifiable information
            </label>
          </>
        );
      }
      case 'identity': {
        const d = component!.data;
        const upd = useStudioStore.getState().updateIdentity;
        return (
          <>
            <Field label="display name"><TextField value={d.displayName} onChange={(v) => upd({ displayName: v })} /></Field>
            <Field label="handle"><TextField value={d.handle} onChange={(v) => upd({ handle: v })} /></Field>
            <Field label="language"><TextField value={d.language} onChange={(v) => upd({ language: v })} /></Field>
          </>
        );
      }
      case 'knowledge': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateKnowledge(d.id, patch);
        return (
          <>
            <Field label="title"><TextField value={d.title} onChange={(v) => upd({ title: v })} /></Field>
            <Field label="description"><TextArea value={d.description} onChange={(v) => upd({ description: v })} /></Field>
            <Field label={`items — ${d.items}`}><span className="font-mono text-[11px] text-[color:var(--text-secondary)]">indexed {d.items} items · last {d.lastIndexed ?? 'never'}</span></Field>
          </>
        );
      }
      case 'ability': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateAbility(d.id, patch);
        return (
          <>
            <Field label="title"><TextField value={d.title} onChange={(v) => upd({ title: v })} /></Field>
            <Field label="description"><TextArea value={d.description} onChange={(v) => upd({ description: v })} /></Field>
            <Field label="connector">
              <select value={d.connectorId ?? ''} onChange={(e) => upd({ connectorId: e.target.value || null })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                <option value="">(none)</option>
                {agent.connectors.map((c) => <option key={c.id} value={c.id}>{c.provider}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-2 font-mono text-[11.5px] text-[color:var(--text-primary)]">
              <input type="checkbox" checked={d.requiresApproval} onChange={(e) => upd({ requiresApproval: e.target.checked })} />
              requires human approval before running
            </label>
          </>
        );
      }
      case 'connector': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateConnector(d.id, patch);
        return (
          <>
            <Field label="provider"><TextField value={d.provider} onChange={(v) => upd({ provider: v })} /></Field>
            <Field label="scopes"><ListField values={d.scopes} onChange={(v) => upd({ scopes: v })} placeholder="scope" /></Field>
            <div className="rounded-[3px] border border-[color:var(--assembl-gold-thread)]/50 bg-[color:var(--assembl-gold-thread)]/10 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">simulated integration</div>
              <p className="mt-1 text-[12px] text-[color:var(--text-primary)]">
                This connector is a stand-in for the prototype. Nothing is fetched from a live account and no message actually sends.
              </p>
            </div>
          </>
        );
      }
      case 'boundary': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateBoundary(d.id, patch);
        return (
          <>
            <Field label="title"><TextField value={d.title} onChange={(v) => upd({ title: v })} /></Field>
            <Field label="rule"><TextArea value={d.rule} onChange={(v) => upd({ rule: v })} /></Field>
            <Field label="description"><TextArea value={d.description} onChange={(v) => upd({ description: v })} /></Field>
          </>
        );
      }
      case 'approval': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateApproval(d.id, patch);
        return (
          <>
            <Field label="title"><TextField value={d.title} onChange={(v) => upd({ title: v })} /></Field>
            <Field label="description"><TextArea value={d.description} onChange={(v) => upd({ description: v })} /></Field>
            <Field label="gates ability">
              <select value={d.gatesAbilityId} onChange={(e) => upd({ gatesAbilityId: e.target.value })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                {agent.abilities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </Field>
            <Field label="triggers"><ListField values={d.triggers} onChange={(v) => upd({ triggers: v })} placeholder="trigger" /></Field>
            <Field label="approver">
              <select value={d.approver} onChange={(e) => upd({ approver: e.target.value as typeof d.approver })}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[12px]">
                <option value="owner">owner</option><option value="any-teammate">any teammate</option><option value="named-teammate">a named teammate</option>
              </select>
            </Field>
          </>
        );
      }
      case 'evaluation': {
        const d = component!.data;
        const upd = (patch: Partial<typeof d>) => useStudioStore.getState().updateEvaluation(d.id, patch);
        return (
          <>
            <Field label="title"><TextField value={d.title} onChange={(v) => upd({ title: v })} /></Field>
            <Field label="description"><TextArea value={d.description} onChange={(v) => upd({ description: v })} /></Field>
            <Field label={`pass threshold — ${d.passThreshold.toFixed(2)}`}>
              <input type="range" min={0.5} max={1} step={0.01} value={d.passThreshold} onChange={(e) => upd({ passThreshold: Number(e.target.value) })} className="w-full" />
            </Field>
          </>
        );
      }
    }
  }

  function renderAdvanced(): React.ReactNode {
    if (component!.kind === 'instructions') {
      const composed = composeSystemPrompt(agent);
      return (
        <>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            composed system prompt · read-only
          </div>
          <pre className="whitespace-pre-wrap rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3 font-mono text-[11px] leading-[1.55] text-[color:var(--text-primary)]">{composed}</pre>
          <p className="font-mono text-[10px] text-[color:var(--text-secondary)]">
            Composed from the structured fields above. Edit them, not this text.
          </p>
        </>
      );
    }
    return (
      <>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">raw</div>
        <pre className="whitespace-pre-wrap rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3 font-mono text-[10.5px] leading-[1.5] text-[color:var(--text-primary)]">{JSON.stringify(component!.data, null, 2)}</pre>
      </>
    );
  }
}

function getTitle(c: ReturnType<typeof useSelectedComponent> & object): string {
  const d = (c as { data: Record<string, unknown> }).data;
  if (typeof (d as { displayName?: string }).displayName === 'string') return (d as { displayName: string }).displayName;
  if (typeof (d as { title?: string }).title === 'string') return (d as { title: string }).title;
  if (typeof (d as { provider?: string }).provider === 'string') return (d as { provider: string }).provider;
  if (typeof (d as { role?: string }).role === 'string') return 'instructions';
  if (typeof (d as { model?: string }).model === 'string') return 'intelligence';
  if (typeof (d as { scope?: string }).scope === 'string') return 'memory';
  return c.id;
}
function getPurpose(c: ReturnType<typeof useSelectedComponent> & object): string {
  const d = (c as { data: Record<string, unknown> }).data;
  const desc = (d as { description?: string }).description ?? (d as { rule?: string }).rule ?? '';
  if (desc) return desc;
  // Fall back per kind so the header still reads well.
  switch (c.kind) {
    case 'instructions': return 'How koro thinks about its job — role, priorities, when to escalate, what never to do.';
    case 'intelligence': return 'Which model powers reasoning and how carefully it works.';
    case 'memory': return 'What koro remembers between messages — and for how long.';
    case 'identity': return 'How koro appears to a customer: name, handle, language.';
    default: return '';
  }
}

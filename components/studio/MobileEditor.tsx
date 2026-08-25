'use client';

import { useStudioStore } from '@/lib/studio/store';
import { COMPONENT_LIBRARY, CATEGORY_LABEL, listAllComponents } from '@/lib/studio/schema';
import { PropertiesPanel } from './PropertiesPanel';
import { AgentAvatar } from '@/components/agents/AgentAvatar';

/**
 * The mobile experience. We do NOT shrink the desktop workbench onto a
 * phone — instead we replace it with a guided editor:
 *   1. a preview of the agent (a simple hero avatar + summary)
 *   2. a flat list of every component grouped by category
 *   3. the properties panel for whichever component is selected
 */
export function MobileEditor() {
  const agent = useStudioStore((s) => s.agent);
  const select = useStudioStore((s) => s.select);
  const selectedId = useStudioStore((s) => s.selectedId);

  const all = listAllComponents(agent);
  const byCategory = COMPONENT_LIBRARY.reduce((acc, entry) => {
    const list = acc.get(entry.category) ?? [];
    // Find agent instances of this type — map schema kind → present items.
    const items = all.filter((c) => {
      if (entry.type === 'instructions') return c.kind === 'instructions';
      if (entry.type === 'intelligence') return c.kind === 'intelligence';
      if (entry.type === 'memory') return c.kind === 'memory';
      if (entry.type === 'boundary') return c.kind === 'boundary';
      if (entry.type === 'approval') return c.kind === 'approval';
      if (entry.type.startsWith('knowledge-') || entry.type.startsWith('ability-') || entry.type.startsWith('connector-') || entry.type.startsWith('evaluation-')) {
        return (c.data as { type?: string }).type === entry.type;
      }
      return false;
    });
    for (const item of items) list.push({ label: (item.data as { title?: string; displayName?: string; provider?: string }).title ?? (item.data as { displayName?: string }).displayName ?? (item.data as { provider?: string }).provider ?? entry.label, id: item.id });
    acc.set(entry.category, list);
    return acc;
  }, new Map<string, { label: string; id: string }[]>());

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
        <div className="flex items-center gap-4">
          <AgentAvatar slug="assembl" size={72} round />
          <div>
            <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">koro · sample agent</div>
            <div className="mt-0.5 font-display text-[22px] font-light lowercase text-[color:var(--text-primary)]">{agent.name}</div>
            <div className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">{agent.role}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
        <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">components in this agent</div>
        {(['essentials', 'knowledge', 'abilities', 'connected-apps', 'boundaries', 'approvals', 'tests'] as const).map((cat) => {
          const items = byCategory.get(cat) ?? [];
          return (
            <div key={cat} className="mt-3 flex flex-col gap-1">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">{CATEGORY_LABEL[cat]}</div>
              {items.length === 0 ? (
                <p className="font-mono text-[12px] text-[color:var(--text-secondary)]">none</p>
              ) : items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => select(it.id)}
                  className={[
                    'rounded-[2px] border px-3 py-1.5 text-left font-mono text-[12px]',
                    selectedId === it.id
                      ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                      : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]',
                  ].join(' ')}
                >
                  {it.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
        <PropertiesPanel />
      </div>
    </div>
  );
}

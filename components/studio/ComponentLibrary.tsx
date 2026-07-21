'use client';

import { useStudioStore } from '@/lib/studio/store';
import { COMPONENT_LIBRARY, CATEGORY_LABEL, type ComponentCategory, type ComponentType, type ComponentStatus } from '@/lib/studio/schema';

function statusDot(status: ComponentStatus): string {
  switch (status) {
    case 'configured': return 'bg-[color:var(--assembl-pounamu)]';
    case 'draft':      return 'bg-[color:var(--assembl-gold-thread)]';
    case 'inactive':   return 'bg-[color:var(--assembl-cloud)]';
    case 'warning':    return 'bg-red-400';
  }
}

/**
 * Read the agent's current instances of each library entry so we can
 * show status inline. Every reader here is derived from the schema, so
 * adding a component type in schema.ts is enough for it to appear.
 */
function useLibraryStatus(): Map<ComponentType, { count: number; worstStatus: ComponentStatus }> {
  const agent = useStudioStore((s) => s.agent);
  const map = new Map<ComponentType, { count: number; worstStatus: ComponentStatus }>();
  const bump = (type: ComponentType, status: ComponentStatus) => {
    const cur = map.get(type);
    if (!cur) { map.set(type, { count: 1, worstStatus: status }); return; }
    cur.count += 1;
    if (worstOf(cur.worstStatus, status) === status) cur.worstStatus = status;
  };
  bump('instructions', 'configured');
  bump('intelligence', 'configured');
  bump('memory', 'configured');
  for (const k of agent.knowledge) {
    const map: Record<string, ComponentType> = {
      file: 'knowledge-file', website: 'knowledge-website', 'drive-folder': 'knowledge-drive', policy: 'knowledge-policy',
    };
    bump(map[k.type] ?? 'knowledge-file', k.status);
  }
  for (const a of agent.abilities) bump(a.type, a.status);
  for (const c of agent.connectors) bump(c.type, c.status);
  for (const b of agent.boundaries) bump('boundary', b.status);
  for (const a of agent.approvals) bump('approval', a.status);
  for (const e of agent.evaluations) bump(e.type, e.status);
  return map;
}
function worstOf(a: ComponentStatus, b: ComponentStatus): ComponentStatus {
  const rank: Record<ComponentStatus, number> = { warning: 3, draft: 2, inactive: 1, configured: 0 };
  return rank[a] >= rank[b] ? a : b;
}

export function ComponentLibrary() {
  const addComponent = useStudioStore((s) => s.addComponent);
  const status = useLibraryStatus();
  const categories: ComponentCategory[] = ['essentials', 'knowledge', 'abilities', 'connected-apps', 'boundaries', 'approvals', 'tests'];

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-r border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[18px] font-light text-[color:var(--text-primary)]">Components</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          library
        </span>
      </div>

      {categories.map((cat) => {
        const entries = COMPONENT_LIBRARY.filter((e) => e.category === cat);
        return (
          <section key={cat} className="flex flex-col gap-1.5">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              {CATEGORY_LABEL[cat]}
            </div>
            {entries.map((entry) => {
              const s = status.get(entry.type);
              const inAgent = s !== undefined && s.count > 0;
              return (
                <button
                  key={entry.type}
                  type="button"
                  onClick={() => addComponent(entry.type)}
                  className="group flex flex-col gap-1 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 text-left transition hover:border-[color:var(--text-primary)]"
                  title={entry.multiInstance ? 'Add a new instance' : inAgent ? 'Already in the agent' : 'Add to the agent'}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
                      {entry.label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {inAgent ? (
                        <span className={`h-2 w-2 rounded-full ${statusDot(s.worstStatus)}`} aria-hidden />
                      ) : (
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)] opacity-0 transition group-hover:opacity-100">+ add</span>
                      )}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] leading-[1.5] tracking-[0.02em] text-[color:var(--text-secondary)]">
                    {entry.description}
                  </p>
                </button>
              );
            })}
          </section>
        );
      })}
    </aside>
  );
}

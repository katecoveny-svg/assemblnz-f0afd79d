'use client';

import { useStudioStore } from '@/lib/studio/store';
import { findComponent, listAllComponents } from '@/lib/studio/schema';

/**
 * The x-ray view. Explains the wiring in plain language:
 *   {source component} — {relationship verb} → {target component}
 *   with an explanation sentence per connection.
 *
 * Reads from the same store as the 3D scene, so every relationship
 * mentioned here IS represented as a line in the scene.
 */
export function XRayView() {
  const agent = useStudioStore((s) => s.agent);
  const select = useStudioStore((s) => s.select);

  const relLabel: Record<string, string> = {
    'informs': 'informs',
    'enables': 'enables',
    'requires-approval': 'requires approval before',
    'protects': 'protects',
    'evaluates': 'evaluates',
  };

  const all = listAllComponents(agent);
  const kinds: { kind: string; label: string; items: typeof all }[] = [
    { kind: 'essentials', label: 'Essentials', items: all.filter((c) => ['identity','instructions','intelligence','memory'].includes(c.kind)) },
    { kind: 'knowledge', label: 'Knowledge sources', items: all.filter((c) => c.kind === 'knowledge') },
    { kind: 'abilities', label: 'Abilities', items: all.filter((c) => c.kind === 'ability') },
    { kind: 'connectors', label: 'Connected apps', items: all.filter((c) => c.kind === 'connector') },
    { kind: 'controls', label: 'Control', items: all.filter((c) => ['boundary','approval','evaluation'].includes(c.kind)) },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[color:var(--assembl-paper)] p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-8">
        <header>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            {agent.name} · x-ray
          </p>
          <h2 className="mt-2 font-display text-[38px] font-light lowercase leading-[1.05] text-[color:var(--text-primary)]">
            what {agent.name} knows and what it can do.
          </h2>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-[color:var(--text-secondary)]">
            Every module in the build view corresponds to a real configuration below. Every arrow is a real relationship — click one to jump to the source component.
          </p>
        </header>

        {kinds.map((section) => (
          <section key={section.kind} className="flex flex-col gap-2">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              {section.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {section.items.length === 0 ? (
                <p className="font-mono text-[12px] text-[color:var(--text-secondary)]">none configured yet</p>
              ) : section.items.map((c) => {
                const d = c.data as { title?: string; displayName?: string; provider?: string; role?: string; scope?: string; model?: string };
                const label = d.title ?? d.displayName ?? d.provider ?? d.role ?? d.model ?? d.scope ?? c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(c.id)}
                    className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]"
                    title={c.kind}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Relationships
          </h3>
          <ul className="flex flex-col gap-1.5">
            {agent.connections.map((edge) => {
              const src = findComponent(agent, edge.sourceId);
              const dst = findComponent(agent, edge.targetId);
              const srcLabel = (src?.data as { title?: string; displayName?: string; provider?: string })?.title
                ?? (src?.data as { displayName?: string })?.displayName
                ?? (src?.data as { provider?: string })?.provider
                ?? src?.id ?? '?';
              const dstLabel = (dst?.data as { title?: string; displayName?: string; provider?: string })?.title
                ?? (dst?.data as { displayName?: string })?.displayName
                ?? (dst?.data as { provider?: string })?.provider
                ?? dst?.id ?? '?';
              return (
                <li key={edge.id} className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3">
                  <div className="flex flex-wrap items-baseline gap-1.5 font-mono text-[12px]">
                    <button type="button" onClick={() => src && select(src.id)} className="underline decoration-[color:var(--assembl-cloud)] underline-offset-4 hover:decoration-[color:var(--text-primary)]">
                      {srcLabel}
                    </button>
                    <span className="text-[color:var(--text-secondary)]">— {relLabel[edge.relationship]} →</span>
                    <button type="button" onClick={() => dst && select(dst.id)} className="underline decoration-[color:var(--assembl-cloud)] underline-offset-4 hover:decoration-[color:var(--text-primary)]">
                      {dstLabel}
                    </button>
                  </div>
                  <p className="mt-1 text-[12px] leading-[1.55] text-[color:var(--text-secondary)]">
                    {edge.explanation}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  HOME_AGENTS,
  HOME_AGENT_CATEGORIES,
  type HomeAgent,
} from '@/lib/home/agent-roster';

/**
 * The agent gallery panel — every live agent assembl runs, in one place you can
 * pick through.
 *
 * Every word on this panel comes from the same registry that backs /agents and
 * the marketplace: the description, the three lines of work, the sample output
 * and the NZ sources. Nothing here is written for the homepage, so nothing here
 * can drift from what the agent actually does.
 *
 * The sample line is shown as the agent's own output because that is what it
 * is — the registry's `sampleOutputs`, which is the shape of line this agent
 * produces. It is labelled as an example rather than a live call, because it is
 * one; the live call is one tap away on the phone.
 */

/** Ask the homepage phone to switch to this agent and scroll to it. */
export const HOME_AGENT_EVENT = 'assembl:home-agent';

export function askAgent(slug: string) {
  window.dispatchEvent(new CustomEvent(HOME_AGENT_EVENT, { detail: { slug } }));
}

export function HomeAgentGallery() {
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<HomeAgent>(HOME_AGENTS[0]);

  const shown = useMemo(
    () => (category ? HOME_AGENTS.filter((a) => a.category === category) : HOME_AGENTS),
    [category],
  );

  return (
    <section className="aj-panel aj-agents" id="agent-gallery">
      <div className="aj-agents-head">
        <span>05 / THE AGENTS</span>
        <h2>{HOME_AGENTS.length} agents. Pick one.</h2>
        <p>
          Each one states what it does and where a person stays in control. Choose an agent to see
          the work it takes on, a line it actually produces, and the New Zealand sources it is
          grounded in.
        </p>
        <div className="aj-agents-cats">
          <button
            type="button"
            className={category === null ? 'is-on' : undefined}
            onClick={() => setCategory(null)}
          >
            everything <b>{HOME_AGENTS.length}</b>
          </button>
          {HOME_AGENT_CATEGORIES.map((c) => (
            <button
              key={c.category}
              type="button"
              className={category === c.category ? 'is-on' : undefined}
              onClick={() => setCategory(c.category)}
            >
              {c.label} <b>{c.count}</b>
            </button>
          ))}
        </div>
      </div>

      <ul className="aj-agents-grid">
        {shown.map((a) => (
          <li key={a.slug}>
            <button
              type="button"
              className={selected.slug === a.slug ? 'is-on' : undefined}
              aria-pressed={selected.slug === a.slug}
              onMouseEnter={() => setSelected(a)}
              onFocus={() => setSelected(a)}
              onClick={() => setSelected(a)}
            >
              <strong>{a.name}</strong>
              <em>{a.categoryLabel}</em>
            </button>
          </li>
        ))}
      </ul>

      <article className="aj-agents-detail" aria-live="polite">
        <span>{selected.categoryLabel}</span>
        <h3>
          {selected.name}
          {selected.teReo ? <i>{selected.teReo}</i> : null}
        </h3>
        <p>{selected.description}</p>

        {selected.does.length > 0 && (
          <ol className="aj-agents-does">
            {selected.does.map((d, i) => (
              <li key={d}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                {d}
              </li>
            ))}
          </ol>
        )}

        {selected.samples[0] && (
          <figure className="aj-agents-sample">
            <figcaption>A LINE THIS AGENT PRODUCES</figcaption>
            <blockquote>{selected.samples[0]}</blockquote>
          </figure>
        )}

        {selected.grounding.length > 0 && (
          <small className="aj-agents-grounding">
            GROUNDED IN <b>{selected.grounding.join(' · ')}</b>
          </small>
        )}

        <button type="button" className="aj-agents-ask" onClick={() => askAgent(selected.slug)}>
          Talk to {selected.name} <i aria-hidden="true">↗</i>
        </button>
      </article>
    </section>
  );
}

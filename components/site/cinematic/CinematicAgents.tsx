"use client";

import { useState } from "react";
import type { HomeAgent } from "@/lib/home/agent-roster";
import {
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

type Category = { category: string; label: string; count: number };
export function CinematicAgents({
  agents,
  categories,
}: {
  agents: HomeAgent[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [limit, setLimit] = useState(12);
  const needle = query.trim().toLocaleLowerCase("en-NZ");
  const filtered = agents.filter(
    (agent) =>
      (category === "all" || agent.category === category) &&
      [agent.name, agent.teReo, agent.description, ...agent.does]
        .join(" ")
        .toLocaleLowerCase("en-NZ")
        .includes(needle),
  );
  return (
    <PublicPage>
      <PageHero
        eyebrow="Specialist agents"
        title="Find the right"
        accent="pair of hands."
        body="Choose the work you need help with. Each specialist has a defined task, a useful output and a boundary for review."
        image="tiles"
      >
        <TextLink href="#explore" primary>
          Find an agent
        </TextLink>
        <TextLink href="/how-it-works">See how they work</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="The collection"
          title="A specialist for the task."
          body="Explore the public agent collection. Read what each one can prepare and check its limits before sharing information."
        />
        <div className="public-searchbar">
          <label className="public-search">
            <span aria-hidden>⌕</span>
            <span className="sr-only">Search agents</span>
            <input
              type="search"
              placeholder="What do you need help with?"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(12);
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setLimit(12);
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </label>
          <p role="status" aria-live="polite">
            {filtered.length}{" "}
            {filtered.length === 1 ? "specialist" : "specialists"} found
          </p>
        </div>
        <div className="public-filters" aria-label="Filter agents by work">
          {[
            { category: "all", label: "All work", count: agents.length },
            ...categories,
          ].map((item) => (
            <button
              key={item.category}
              aria-pressed={category === item.category}
              onClick={() => {
                setCategory(item.category);
                setLimit(12);
              }}
            >
              {item.label} <span>({item.count})</span>
            </button>
          ))}
        </div>
        {filtered.length ? (
          <div className="public-agent-grid">
            {filtered.slice(0, limit).map((agent) => (
              <article className="public-agent-card" key={agent.slug}>
                <div className="public-agent-card-top">
                  <span className="public-agent-seal" aria-hidden>
                    {agent.name.slice(0, 1)}
                  </span>
                  <span>{agent.categoryLabel}</span>
                </div>
                <h3>{agent.name}</h3>
                <p>{agent.description}</p>
                <TextLink href={`/agents/${agent.slug}`}>
                  Meet {agent.name}
                </TextLink>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-empty">
            <p>No specialists match this search.</p>
            <button
              className="public-button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Show all agents <span aria-hidden>↗</span>
            </button>
          </div>
        )}
        {filtered.length > limit && (
          <div className="public-actions">
            <button
              className="public-button"
              onClick={() => setLimit((value) => value + 12)}
            >
              Show more specialists <span aria-hidden>+</span>
            </button>
            <span className="public-note">
              Showing {limit} of {filtered.length}
            </span>
          </div>
        )}
        <PageNote>
          Availability and tools vary by specialist. An agent page describes its
          scope; it does not give blanket permission to send, book or decide.
        </PageNote>
      </section>
      <section className="public-section">
        <SectionHeading
          label="Made for a real journey"
          title="Start with the moment. Then choose the agent."
          body="The useful part is what happens around the agent: the customer’s choice, the work prepared, the person reviewing it and a clear next step."
        />
        <TextLink href="/journeys" primary>
          Explore customer journeys
        </TextLink>
      </section>
    </PublicPage>
  );
}

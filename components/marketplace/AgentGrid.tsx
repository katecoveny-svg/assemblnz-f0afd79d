'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  agentPriceLabel,
  type MarketplaceCategory,
  type PublicMarketplaceAgent,
} from '@/lib/marketplace/agents';
import { AgentIcon } from './AgentIcon';
import styles from './orbGrid.module.css';

type Filter = 'all' | MarketplaceCategory;

// Gold orb shades, cycled per card — matches the homepage marketplace grid
// (app/page.tsx ORB_GOLDS) so the two surfaces read identically.
const ORB_GOLDS: [string, string][] = [
  ['#FFD42A', '#E0A800'],
  ['#FFE066', '#F2C200'],
  ['#FFCB1F', '#D89A00'],
  ['#FFD96B', '#E0A800'],
  ['#FFE680', '#E0A800'],
  ['#FFDD55', '#D89A00'],
  ['#FFCF3A', '#E0A800'],
];

export function AgentGrid({ agents }: { agents: PublicMarketplaceAgent[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.teReo.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [agents, query, filter]);

  return (
    <div>
      {/* Search */}
      <div className={styles.search}>
        <Search className={styles.searchIcon} size={18} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents — fridge, tax, captions, meetings…"
          aria-label="Search agents"
          className={styles.searchInput}
        />
      </div>

      {/* Category filter */}
      <div className={styles.filters}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? styles.filterActive : styles.filter}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setFilter(c.slug)}
            className={filter === c.slug ? styles.filterActive : styles.filter}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className={styles.empty}>No agents match that. Try a different word.</p>
      ) : (
        <div className={styles.grid}>
          {visible.map((agent, i) => (
            <AgentCard key={agent.slug} agent={agent} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, index }: { agent: PublicMarketplaceAgent; index: number }) {
  // Featured agents get the dark editorial tile, mirroring the home grid.
  const dark = agent.featured;
  const [tone, deep] = ORB_GOLDS[index % ORB_GOLDS.length];

  return (
    <div className={dark ? `${styles.card} ${styles.cardDark}` : styles.card}>
      <span className={styles.cardGlow} aria-hidden />

      <Link href={`/agents/${agent.slug}`} className={styles.head} aria-label={`${agent.name} — details`}>
        <span
          className={styles.orb}
          style={{ background: `radial-gradient(circle at 33% 26%, #FFFDF7 0%, ${tone} 52%, ${deep} 100%)` }}
          aria-hidden
        >
          <span className={styles.orbSpec} aria-hidden />
          <AgentIcon name={agent.icon} className={styles.orbIcon} />
        </span>
        <span className={styles.nameWrap}>
          <span className={styles.name}>{agent.name}</span>
          <span className={styles.tag}>{CATEGORY_LABELS[agent.category]}</span>
        </span>
      </Link>

      <Link href={`/agents/${agent.slug}`} className={styles.blurb}>
        {agent.description}
      </Link>

      <div className={styles.foot}>
        <span className={styles.price}>{agentPriceLabel(agent)}</span>
        <span className={styles.footActions}>
          <Link href={`/agents/${agent.slug}`} className={styles.details}>
            Details
          </Link>
          <Link href={`/agents/${agent.slug}/chat`} className={styles.installPill}>
            Install
            <ArrowRight size={14} aria-hidden />
          </Link>
        </span>
      </div>
    </div>
  );
}

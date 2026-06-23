'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DocMeta } from '@/lib/docs';

type SearchDoc = DocMeta & { searchText: string };

export function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs.slice(0, 6);
    return docs
      .filter((doc) => doc.searchText.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [docs, query]);

  return (
    <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-4">
      <label
        htmlFor="docs-search"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
      >
        Search docs
      </label>
      <div className="mt-3 flex items-center gap-3 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] px-3">
        <Search className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
        <input
          id="docs-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search kete, integrations, evidence..."
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--text-secondary)]"
        />
      </div>
      <div className="mt-4 space-y-2">
        {results.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="block rounded-[8px] border border-transparent px-3 py-2 transition-colors hover:border-[rgba(58,56,50,0.20)] hover:bg-white"
          >
            <span className="font-display text-2xl font-light leading-none">{doc.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-secondary)]">
              {doc.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

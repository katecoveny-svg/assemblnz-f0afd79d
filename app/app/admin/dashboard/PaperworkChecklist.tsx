'use client';

import { useEffect, useState } from 'react';

/**
 * Today's paperwork checklist — localStorage-backed. Three hardcoded items
 * Kate flagged in the brief (FSP, pen test, insurance broker). Not a Supabase
 * table; intentionally simple so it can be edited inline without a migration.
 *
 * If the list of items needs to expand, just edit ITEMS below. Reseeds with
 * any new items not already in localStorage (existing checks are preserved).
 */

type Item = { id: string; label: string };

const ITEMS: readonly Item[] = [
  { id: 'fsp-registration', label: 'FSP registration — push next step' },
  { id: 'pen-test-call', label: 'Pen test booking call' },
  { id: 'insurance-broker-call', label: 'Insurance broker call' },
];

const STORAGE_KEY = 'assembl-admin-paperwork-checks-v1';

export function PaperworkChecklist() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecks(JSON.parse(raw));
    } catch {
      // ignore — fresh state is fine
    }
    setHydrated(true);
  }, []);

  function toggle(id: string) {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage can fail in private mode — checks still toggle in-memory
      }
      return next;
    });
  }

  return (
    <ul className="space-y-2">
      {ITEMS.map((item) => {
        const done = hydrated && Boolean(checks[item.id]);
        return (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-4 py-3 text-[13px] leading-relaxed transition-colors hover:border-[color:var(--assembl-pounamu-soft)]">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[color:var(--assembl-pounamu)]"
                checked={done}
                onChange={() => toggle(item.id)}
                aria-label={item.label}
              />
              <span
                className={
                  done
                    ? 'text-[color:var(--text-secondary)] line-through'
                    : 'text-[color:var(--text-primary)]'
                }
              >
                {item.label}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

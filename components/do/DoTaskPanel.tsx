'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  DO_TASK_PRIORITY_LABEL,
  DO_TASK_STATUS_LABEL,
  addIssue,
  findBoard,
  nextOpenTodos,
  openIssues,
  readDoTaskStore,
  resolveDoTaskOwnerKey,
  updateIssue,
  writeDoTaskStore,
  type DoTask,
  type DoTaskStore,
} from '@/apps/do/shared/do-tasks';
import styles from './do-task-panel.module.css';

type Props = {
  boardId: string;
  /** Show more than the compact next-N when true (default). */
  limit?: number;
  title?: string;
};

/**
 * Compact Linear-inspired to-do panel for a single DO surface.
 * Check off, add task, persist to the shared per-owner/device store.
 */
export function DoTaskPanel({ boardId, limit = 8, title }: Props) {
  const [ownerKey, setOwnerKey] = useState('device');
  const [store, setStore] = useState<DoTaskStore | null>(null);
  const [draft, setDraft] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const owner = await resolveDoTaskOwnerKey();
      if (cancelled) return;
      setOwnerKey(owner.ownerKey);
      setStore(readDoTaskStore(window.localStorage, owner.ownerKey));
    })();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const persist = useCallback(
    (next: DoTaskStore) => {
      setStore(writeDoTaskStore(window.localStorage, ownerKey, next));
    },
    [ownerKey],
  );

  const board = store ? findBoard(store, boardId) : undefined;
  const items = useMemo(() => {
    if (!board) return [];
    const open = openIssues(board.issues);
    const done = board.issues.filter((item) => item.status === 'done').slice(0, 2);
    return [...open.slice(0, limit), ...done];
  }, [board, limit]);

  function toggleDone(item: DoTask) {
    if (!store) return;
    persist(
      updateIssue(store, boardId, item.id, {
        status: item.status === 'done' ? 'todo' : 'done',
      }),
    );
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    if (!store || !draft.trim()) return;
    persist(addIssue(store, boardId, { title: draft }));
    setDraft('');
  }

  if (!store || !board) {
    return (
      <section className={styles.panel} aria-busy="true">
        <p className={styles.eyebrow}>To-do</p>
        <p className={styles.empty}>Loading tasks…</p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label={`${board.title} to-do list`}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>To-do · this DO</p>
          <h2>{title ?? board.title}</h2>
        </div>
        <Link href={`/do/tasks?board=${encodeURIComponent(board.id)}`} className={styles.rollup}>
          All boards →
        </Link>
      </div>

      <ul className={styles.list}>
        {items.map((item) => {
          const open = item.status !== 'done';
          return (
            <li key={item.id} className={open ? undefined : styles.doneRow}>
              <button
                type="button"
                className={styles.check}
                aria-pressed={!open}
                aria-label={open ? `Mark done: ${item.title}` : `Reopen: ${item.title}`}
                onClick={() => toggleDone(item)}
              >
                {open ? '' : '✓'}
              </button>
              <button
                type="button"
                className={styles.rowBody}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <span className={styles.priority} data-priority={item.priority}>
                  {DO_TASK_PRIORITY_LABEL[item.priority]}
                </span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.status} data-status={item.status}>
                  {DO_TASK_STATUS_LABEL[item.status]}
                </span>
              </button>
              {expandedId === item.id ? (
                <div className={styles.detail}>
                  <p>{item.notes || 'No notes yet.'}</p>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                      Open link →
                    </a>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!items.length ? <p className={styles.empty}>No tasks yet — add one below.</p> : null}

      <form className={styles.add} onSubmit={onAdd}>
        <label className={styles.srOnly} htmlFor={`do-task-add-${boardId}`}>
          Add task
        </label>
        <input
          id={`do-task-add-${boardId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task…"
          maxLength={300}
        />
        <button type="submit">Add</button>
      </form>
      <p className={styles.note}>
        Saved on this device{nextOpenTodos(board, 99).length ? ` · ${nextOpenTodos(board, 99).length} open` : ''} · not synced to Linear.app
      </p>
    </section>
  );
}

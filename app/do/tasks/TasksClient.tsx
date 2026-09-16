'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  DO_TASK_PRIORITY_LABEL,
  DO_TASK_STATUS_LABEL,
  addIssue,
  findBoard,
  groupIssuesByStatus,
  readDoTaskStore,
  resetDoTaskStore,
  resolveDoTaskOwnerKey,
  updateIssue,
  writeDoTaskStore,
  type DoTask,
  type DoTaskBoard,
  type DoTaskPriority,
  type DoTaskStatus,
  type DoTaskStore,
} from '@/apps/do/shared/do-tasks';
import { DoMark } from '@/components/do/DoMark';
import styles from './tasks.module.css';

const PRIORITIES: DoTaskPriority[] = ['p0', 'p1', 'p2'];
const STATUSES: DoTaskStatus[] = ['backlog', 'todo', 'doing', 'blocked', 'done'];

/** Optional rollup across per-DO boards. Primary UX stays on each DO surface. */
export function TasksClient() {
  const params = useSearchParams();
  const [ownerKey, setOwnerKey] = useState('device');
  const [signedIn, setSignedIn] = useState(false);
  const [store, setStore] = useState<DoTaskStore | null>(null);
  const [boardId, setBoardId] = useState(params.get('board') || 'household-floor');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPriority, setDraftPriority] = useState<DoTaskPriority>('p2');
  const [focusIndex, setFocusIndex] = useState(0);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const owner = await resolveDoTaskOwnerKey();
      if (cancelled) return;
      setOwnerKey(owner.ownerKey);
      setSignedIn(owner.signedIn);
      const next = readDoTaskStore(window.localStorage, owner.ownerKey);
      setStore(next);
      const requested = params.get('board');
      if (requested && next.boards.some((board) => board.id === requested)) {
        setBoardId(requested);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const persist = useCallback(
    (next: DoTaskStore) => {
      setStore(writeDoTaskStore(window.localStorage, ownerKey, next));
    },
    [ownerKey],
  );

  const board = store ? findBoard(store, boardId) : undefined;
  const groups = useMemo(
    () => (board ? groupIssuesByStatus(board.issues) : []),
    [board],
  );
  const flatRows = useMemo(
    () => groups.flatMap((group) => group.issues),
    [groups],
  );
  const selected = board?.issues.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!flatRows.length) {
      setFocusIndex(0);
      return;
    }
    setFocusIndex((index) => Math.min(index, flatRows.length - 1));
  }, [flatRows.length, boardId]);

  function selectBoard(id: string) {
    setBoardId(id);
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.set('board', id);
    window.history.replaceState({}, '', url.toString());
  }

  function openIssue(issue: DoTask) {
    setSelectedId(issue.id);
    const index = flatRows.findIndex((row) => row.id === issue.id);
    if (index >= 0) setFocusIndex(index);
  }

  function patchSelected(patch: Partial<Pick<DoTask, 'title' | 'status' | 'priority' | 'notes' | 'href'>>) {
    if (!store || !selected) return;
    persist(updateIssue(store, boardId, selected.id, patch));
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    if (!store || !draftTitle.trim()) return;
    persist(addIssue(store, boardId, { title: draftTitle, priority: draftPriority }));
    setDraftTitle('');
    setDraftPriority('p2');
    addRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
        setSelectedId(null);
      }
      return;
    }
    if (event.key === 'j' || event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((index) => Math.min(index + 1, Math.max(flatRows.length - 1, 0)));
    } else if (event.key === 'k' || event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && flatRows[focusIndex]) {
      event.preventDefault();
      openIssue(flatRows[focusIndex]!);
    } else if (event.key === 'Escape') {
      setSelectedId(null);
    } else if (event.key === 'c' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      addRef.current?.focus();
    }
  }

  if (!store || !board) {
    return <div className={styles.loading} role="status">Loading tasks…</div>;
  }

  return (
    <div className={styles.shell} onKeyDown={onKeyDown} tabIndex={0}>
      <header className={styles.topbar}>
        <div className={styles.brandRow}>
          <Link href="/do" className={styles.brand}>
            <span aria-hidden="true"><DoMark /></span>
            DO
          </Link>
          <span className={styles.slash}>/</span>
          <strong>Tasks</strong>
          <span className={styles.preview}>per-DO rollup</span>
        </div>
        <nav aria-label="DO">
          <Link href="/do/office">Office</Link>
          <Link href="/do/builder">Builder DO</Link>
          <Link href="/do/widget">Companion</Link>
          <Link href="/do/connections">Connections</Link>
        </nav>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="DO boards">
          <p className={styles.eyebrow}>Each DO</p>
          <ul className={styles.boardList}>
            {store.boards.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === boardId ? styles.boardActive : styles.boardButton}
                  onClick={() => selectBoard(item.id)}
                  aria-current={item.id === boardId ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.glyph}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.issues.filter((issue) => issue.status !== 'done').length} open</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.persistNote}>
            Saved on this {signedIn ? 'signed-in owner' : 'device'} · primary lists live on each DO page · not synced to Linear.app
          </p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              if (window.confirm('Reset all per-DO task boards on this device/owner to the Assembl seed list?')) {
                persist(resetDoTaskStore(window.localStorage, ownerKey));
                setSelectedId(null);
              }
            }}
          >
            Reset to seed
          </button>
        </aside>

        <main className={styles.main}>
          <div className={styles.boardHead}>
            <div>
              <p className={styles.eyebrow}>{board.glyph} To-do list</p>
              <h1>{board.title}</h1>
              <p className={styles.lede}>
                Linear-inspired rows for this DO. Edit freely — seed reflects open Assembl work as of 16 Sep 2026. Prefer the panel on the DO surface itself when you are working there.
              </p>
            </div>
            <Link className={styles.openSurface} href={board.href}>
              Open surface →
            </Link>
          </div>

          <form className={styles.addRow} onSubmit={onAdd}>
            <label className={styles.srOnly} htmlFor="do-tasks-add">Add task</label>
            <input
              id="do-tasks-add"
              ref={addRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Add task… (c)"
              maxLength={300}
            />
            <select
              aria-label="Priority"
              value={draftPriority}
              onChange={(event) => setDraftPriority(event.target.value as DoTaskPriority)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>{DO_TASK_PRIORITY_LABEL[priority]}</option>
              ))}
            </select>
            <button type="submit">Add</button>
          </form>

          <div className={styles.list} role="list">
            {groups.map((group) => (
              <section key={group.status} className={styles.group} aria-labelledby={`status-${group.status}`}>
                <header className={styles.groupHead}>
                  <h2 id={`status-${group.status}`}>{group.label}</h2>
                  <span>{group.issues.length}</span>
                </header>
                {group.issues.length ? (
                  <ul>
                    {group.issues.map((issue) => {
                      const flatIndex = flatRows.findIndex((row) => row.id === issue.id);
                      const focused = flatIndex === focusIndex;
                      return (
                        <li key={issue.id}>
                          <button
                            type="button"
                            role="listitem"
                            className={[
                              styles.row,
                              selectedId === issue.id ? styles.rowSelected : '',
                              focused ? styles.rowFocused : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => openIssue(issue)}
                            onFocus={() => setFocusIndex(flatIndex)}
                          >
                            <span className={styles.priority} data-priority={issue.priority}>
                              {DO_TASK_PRIORITY_LABEL[issue.priority]}
                            </span>
                            <span className={styles.title}>{issue.title}</span>
                            <span className={styles.status} data-status={issue.status}>
                              {DO_TASK_STATUS_LABEL[issue.status]}
                            </span>
                            {issue.href ? <span className={styles.linkHint}>link</span> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={styles.emptyGroup}>Nothing here yet.</p>
                )}
              </section>
            ))}
          </div>
          <p className={styles.keyboard}>Keyboard · j/k move · Enter open · c add · Esc close</p>
        </main>

        {selected ? (
          <DetailDrawer
            board={board}
            issue={selected}
            onClose={() => setSelectedId(null)}
            onPatch={patchSelected}
          />
        ) : null}
      </div>
    </div>
  );
}

function DetailDrawer({
  board,
  issue,
  onClose,
  onPatch,
}: {
  board: DoTaskBoard;
  issue: DoTask;
  onClose: () => void;
  onPatch: (patch: Partial<Pick<DoTask, 'title' | 'status' | 'priority' | 'notes' | 'href'>>) => void;
}) {
  const [notes, setNotes] = useState(issue.notes);
  const [title, setTitle] = useState(issue.title);

  useEffect(() => {
    setNotes(issue.notes);
    setTitle(issue.title);
  }, [issue.id, issue.notes, issue.title]);

  return (
    <aside className={styles.drawer} aria-label="Task detail">
      <div className={styles.drawerTop}>
        <p className={styles.eyebrow}>{board.title}</p>
        <button type="button" className={styles.iconClose} onClick={onClose} aria-label="Close detail">✕</button>
      </div>
      <label className={styles.field}>
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (title.trim() && title !== issue.title) onPatch({ title: title.trim() });
          }}
        />
      </label>
      <div className={styles.metaRow}>
        <label>
          <span>Status</span>
          <select value={issue.status} onChange={(event) => onPatch({ status: event.target.value as DoTaskStatus })}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{DO_TASK_STATUS_LABEL[status]}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={issue.priority} onChange={(event) => onPatch({ priority: event.target.value as DoTaskPriority })}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{DO_TASK_PRIORITY_LABEL[priority]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={styles.field}>
        <span>Notes</span>
        <textarea
          value={notes}
          rows={8}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => {
            if (notes !== issue.notes) onPatch({ notes });
          }}
        />
      </label>
      {issue.href ? (
        <a className={styles.drawerLink} href={issue.href} target={issue.href.startsWith('http') ? '_blank' : undefined} rel={issue.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
          Open link →
        </a>
      ) : null}
      <div className={styles.drawerActions}>
        {issue.status !== 'done' ? (
          <button type="button" className={styles.primary} onClick={() => onPatch({ status: 'done' })}>Mark done</button>
        ) : (
          <button type="button" className={styles.secondary} onClick={() => onPatch({ status: 'todo' })}>Reopen</button>
        )}
        <a className={styles.secondary} href={board.href}>Open {board.title}</a>
      </div>
      <p className={styles.drawerStamp}>
        Updated {new Date(issue.updatedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </aside>
  );
}

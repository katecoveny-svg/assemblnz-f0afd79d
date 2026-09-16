'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  DO_TASK_PRIORITY_LABEL,
  findBoard,
  nextOpenTodos,
  readDoTaskStore,
  resolveDoTaskOwnerKey,
  type DoTask,
} from '@/apps/do/shared/do-tasks';
import styles from './do-task-strip.module.css';

type Props = {
  boardId: string;
  limit?: number;
  label?: string;
};

/** Compact “this DO’s next N tasks” strip for portable widget / Office. */
export function DoTaskStrip({ boardId, limit = 3, label }: Props) {
  const [items, setItems] = useState<DoTask[]>([]);
  const [title, setTitle] = useState(label ?? 'Next tasks');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const owner = await resolveDoTaskOwnerKey();
      if (cancelled) return;
      const store = readDoTaskStore(window.localStorage, owner.ownerKey);
      const board = findBoard(store, boardId);
      setTitle(label ?? (board ? `${board.title} · next` : 'Next tasks'));
      setItems(nextOpenTodos(board, limit));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [boardId, limit, label]);

  if (!ready) {
    return (
      <section className={styles.strip} aria-busy="true">
        <p className={styles.eyebrow}>To-do</p>
        <p className={styles.empty}>Loading next tasks…</p>
      </section>
    );
  }

  return (
    <section className={styles.strip} aria-label={`${title}`}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{title}</p>
        <Link href={`/do/tasks?board=${encodeURIComponent(boardId)}`}>Open list →</Link>
      </div>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/do/tasks?board=${encodeURIComponent(boardId)}`}>
                <span className={styles.priority} data-priority={item.priority}>
                  {DO_TASK_PRIORITY_LABEL[item.priority]}
                </span>
                <span className={styles.itemTitle}>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No open tasks on this DO.</p>
      )}
      <p className={styles.note}>Local per-DO list · not Linear.app sync</p>
    </section>
  );
}

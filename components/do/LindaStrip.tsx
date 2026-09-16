'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LINDA_PRIORITY_LABEL,
  findBoard,
  nextOpenTodos,
  readLindaStore,
  resolveLindaOwnerKey,
  type LindaIssue,
} from '@/apps/do/shared/linda';
import styles from './linda-strip.module.css';

type Props = {
  boardId: string;
  limit?: number;
  /** Compact label override */
  label?: string;
};

/**
 * Compact “this DO’s next N todos” strip for portable widget / Office embeds.
 * Reads the same localStorage Linda store as `/do/linda`.
 */
export function LindaStrip({ boardId, limit = 3, label }: Props) {
  const [items, setItems] = useState<LindaIssue[]>([]);
  const [title, setTitle] = useState(label ?? 'Linda');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const owner = await resolveLindaOwnerKey();
      if (cancelled) return;
      const store = readLindaStore(window.localStorage, owner.ownerKey);
      const board = findBoard(store, boardId);
      setTitle(label ?? (board ? `${board.title} · next` : 'Linda · next'));
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
        <p className={styles.eyebrow}>Linda</p>
        <p className={styles.empty}>Loading next todos…</p>
      </section>
    );
  }

  return (
    <section className={styles.strip} aria-label={`${title} todos`}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{title}</p>
        <Link href={`/do/linda?board=${encodeURIComponent(boardId)}`}>Open Linda →</Link>
      </div>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/do/linda?board=${encodeURIComponent(boardId)}`}>
                <span className={styles.priority} data-priority={item.priority}>
                  {LINDA_PRIORITY_LABEL[item.priority]}
                </span>
                <span className={styles.itemTitle}>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No open todos on this board.</p>
      )}
      <p className={styles.note}>Local Linda list · not Linear.app sync</p>
    </section>
  );
}

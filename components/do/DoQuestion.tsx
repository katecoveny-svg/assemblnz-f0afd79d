import styles from './do-miniature-list.module.css';

/** Immediately readable semantic heading; the visible words settle once. */
export function DoQuestion({ id }: { id?: string }) {
  return <h1 id={id} className={styles.question} aria-label="What would make life easier?">
    <span aria-hidden="true">What would</span>{' '}<span aria-hidden="true">make life</span>{' '}<span aria-hidden="true">easier?</span>
  </h1>;
}

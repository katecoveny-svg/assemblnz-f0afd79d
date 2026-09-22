import styles from './fluid-field.module.css';

/** Decorative light follows the reader's scroll; no canvas, timer or provider call. */
export function FluidField({ tone = 'paper' }: { tone?: 'paper' | 'plum' }) {
  return <span className={styles.field} data-tone={tone} aria-hidden="true"><span /><span /><span /></span>;
}

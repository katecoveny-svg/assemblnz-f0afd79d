import { DoPresence } from './DoPresence';
import './do-spark.css';
/** Compatibility wrapper: older task surfaces now use the same canonical D. */
export function DoSpark({ working = false }: { working?: boolean }) {
  return <span className="do-spark" aria-hidden="true"><DoPresence size="small" working={working} /></span>;
}

import './do-spark.css';
/** DO's code-native identity stays crisp from toolbar scale to hero scale. */
export function DoSpark({ working = false }: { working?: boolean }) {
  return <span className={`do-spark${working ? ' do-spark-working' : ''}`} aria-hidden="true"><span className="do-spark-core"/><span className="do-spark-star"/><span className="do-spark-dot"/></span>;
}

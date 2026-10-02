/** Unmounted proposal. Inject pinned pg.Client and a scoped connection configuration.
 * No env lookup, broad service client, caller query text, bodies or error logging.
 */
export function proposedQuotaDriver(Client, connection) {
  let active = 0;
  const run = async (text, values, signal) => {
    if (signal?.aborted || active >= 4) return null;
    active++;
    let client;
    try { client = new Client({ ...connection, connectionTimeoutMillis: 250, statement_timeout: 500, lock_timeout: 100, query_timeout: 1000, application_name: 'nz-freight-quota' }); }
    catch { active--; return null; }
    client.on('error', () => {});
    client.once('end', () => { active--; }); // Actual end only; timeout never decrements capacity.
    const terminate = () => { try { void Promise.resolve(client.end()).catch(() => {}); } catch { /* retain capacity */ } };
    let stop;
    const stopped = new Promise(resolve => { stop = resolve; });
    const abort = () => { terminate(); stop(null); };
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 1000);
    const operation = (async () => {
      try {
        await client.connect();
        if (signal?.aborted) return null;
        const result = await client.query(text, values);
        return signal?.aborted ? null : result.rows[0]?.result ?? null;
      } catch { return null; }
    })();
    try { return await Promise.race([operation, stopped]); }
    finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); terminate(); }
  };
  return {
    claim(request, signal) { return run("SELECT CASE WHEN (nz_freight_quota.cleanup_health()->>'healthy')::pg_catalog.bool THEN nz_freight_quota.claim($1::pg_catalog.uuid,$2::pg_catalog.text,$3::pg_catalog.uuid) ELSE NULL END AS result", [request.invocationId, request.kind, request.parentLeaseId ?? null], signal); },
    release(id, fence, signal) { return run('SELECT nz_freight_quota.release($1::pg_catalog.uuid,$2::pg_catalog.int8) AS result', [id, fence], signal); },
    active: () => active,
  };
}

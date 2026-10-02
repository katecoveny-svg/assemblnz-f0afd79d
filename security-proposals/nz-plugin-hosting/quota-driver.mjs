const safeOptions = '-c statement_timeout=500 -c lock_timeout=100 -c idle_in_transaction_session_timeout=500 -c search_path=pg_catalog';
function ownData(value, keys) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Object.getOwnPropertySymbols(value).length) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.keys(descriptors).sort().join(',') !== [...keys].sort().join(',') || Object.values(descriptors).some(d => !('value' in d))) return null;
  return Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.value]));
}
/** No connectionString/options/custom streams, partial credentials or ambient defaults. */
export function normalizeQuotaConnection(input, fixture = false) {
  const fields = ownData(input, ['host', 'port', 'user', 'database', 'password', 'ssl']);
  if (!fields || typeof fields.password !== 'string' || !fields.password.length || fields.password.length > 512 || fields.database !== 'postgres') return null;
  if (fixture) {
    if (fields.host !== '127.0.0.1' || fields.port !== 55439 || fields.user !== 'nz_driver_fixture' || fields.ssl !== false) return null;
  } else {
    if (typeof fields.host !== 'string' || fields.host.length > 253 || !/^db\.[a-z0-9-]+\.supabase\.co$/.test(fields.host) || fields.port !== 5432 || fields.user !== 'nz_freight_runtime') return null;
    const tls = ownData(fields.ssl, ['rejectUnauthorized', 'ca']);
    if (!tls || tls.rejectUnauthorized !== true || typeof tls.ca !== 'string' || !tls.ca.startsWith('-----BEGIN CERTIFICATE-----') || tls.ca.length > 65536) return null;
    fields.ssl = Object.freeze(tls);
  }
  return Object.freeze(fields);
}
function effectiveMatches(client, config) {
  const p = client.connectionParameters;
  return p && p.host === config.host && p.port === config.port && p.user === config.user && p.database === config.database && p.password === config.password && p.ssl === config.ssl
    && p.options === safeOptions && p.statement_timeout === 500 && p.lock_timeout === 100 && p.query_timeout === 1000 && p.idle_in_transaction_session_timeout === 500
    && p.application_name === 'nz-freight-quota' && p.client_encoding === 'UTF8' && p.sslnegotiation === 'postgres' && p.binary === false && !p.replication
    && p.connect_timeout === 0 && client._connectionTimeoutMillis === 250;
}
export function proposedQuotaDriver(Client, input) { return driver(Client, normalizeQuotaConnection(input)); }
/** Fixture-only bridge injection; no such transport is admitted by the runtime factory. */
export function proposedQuotaDriverForFixture(Client, input, streamFactory) {
  return driver(Client, typeof streamFactory === 'function' ? normalizeQuotaConnection(input, true) : null, streamFactory);
}
/** Unmounted proposal. Inject pinned pg.Client and a scoped connection configuration.
 * No env lookup, broad service client, caller query text, bodies or error logging.
 */
function driver(Client, connection, fixtureStream) {
  let active = 0;
  const run = async (text, values, signal) => {
    if (!connection || signal?.aborted || active >= 4) return null;
    active++;
    let client;
    const config = { host: connection.host, port: connection.port, user: connection.user, database: connection.database, password: connection.password, ssl: connection.ssl,
      connectionTimeoutMillis: 250, statement_timeout: 500, lock_timeout: 100, query_timeout: 1000, idle_in_transaction_session_timeout: 500,
      options: safeOptions, sslnegotiation: 'postgres', client_encoding: 'UTF8', application_name: 'nz-freight-quota', binary: false, replication: false };
    if (fixtureStream) config.stream = fixtureStream;
    try { client = new Client(config); }

    catch { active--; return null; }
    client.on('error', () => {});
    const ended = () => { active--; };
    client.once('end', ended); // Actual end only; timeout never decrements capacity.
    const terminate = () => { try { void Promise.resolve(client.end()).catch(() => {}); } catch { /* retain capacity */ } };
    if (!effectiveMatches(client, config)) { client.removeListener('end', ended); active--; terminate(); return null; } // Never connected: no outstanding backend.
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

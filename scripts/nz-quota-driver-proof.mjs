import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { Duplex } from 'node:stream';
import { resolve } from 'node:path';
import { proposedQuotaDriverForFixture } from '../security-proposals/nz-plugin-hosting/quota-driver.mjs';
const root = resolve(import.meta.dirname, '..');
const container = JSON.parse(execFileSync('docker', ['inspect', 'assembl-nz-driver-proof-task3'], { encoding: 'utf8' }))[0];
assert.equal(container.HostConfig.Memory, 268435456);
assert.equal(container.HostConfig.NetworkMode, 'assembl-nz-driver-proof-task3');
const network = JSON.parse(execFileSync('docker', ['network', 'inspect', 'assembl-nz-driver-proof-task3'], { encoding: 'utf8' }))[0];
assert.equal(network.Internal, true); assert.deepEqual(Object.keys(container.NetworkSettings.Networks),['assembl-nz-driver-proof-task3']);
assert.equal(container.NetworkSettings.Networks['assembl-nz-driver-proof-task3'].NetworkID,network.Id);
assert.deepEqual(Object.keys(network.Containers),[container.Id]); assert(!container.Mounts.some(m => m.Type === 'bind'));
// Fixture-only protocol bridge: real pg protocol via nc on the isolated container's own loopback.
// No external TCP connection or production endpoint; this does not prove hosted TLS/network behavior.
class FixtureStream extends Duplex {
  constructor() {
    super();
    this.child=spawn('docker',['exec','-i','assembl-nz-driver-proof-task3','busybox','nc','127.0.0.1','5432'],{stdio:['pipe','pipe','ignore']});
    this.child.stdout.on('data',data=>this.push(data));
    this.child.stdout.on('end',()=>this.destroy());
    this.child.on('error',error=>this.destroy(error));
    this.child.on('close',()=>{this.push(null);this.destroy();});
  }
  connect() { queueMicrotask(()=>this.emit('connect')); }
  setNoDelay() {} setKeepAlive() {}
  _read() {}
  _write(chunk,encoding,callback) { this.child.stdin.write(chunk,encoding,callback); }
  _final(callback) { this.child.stdin.end(callback); }
  _destroy(error,callback) { this.child?.stdin.destroy(); this.child?.kill('SIGKILL'); callback(error); }
}
const require = createRequire(resolve(root, 'security-proposals/nz-plugin-hosting/driver-proof/package.json'));
const { Client } = require('pg');
const prepared = [];
async function prepare() { prepared.push(new FixtureStream()); await new Promise(r => setTimeout(r, 4000)); }
const connection = { host: '127.0.0.1', port: 55439, user: 'nz_driver_fixture', database: 'postgres', password: 'fictional-fixture-only', ssl: false };
await prepare();
const streamFactory=()=>{const stream=prepared.shift();assert(stream);return stream;};
const admin = new Client({ ...connection, user: 'postgres', connectionTimeoutMillis: 1000, options:'-c statement_timeout=2000', sslnegotiation:'postgres',client_encoding:'UTF8', stream: streamFactory }); await admin.connect();
try {
  await admin.query("DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='nz_driver_fixture') THEN CREATE ROLE nz_driver_fixture LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS; END IF; END $$; GRANT nz_freight_quota TO nz_driver_fixture; UPDATE nz_freight_quota.control SET enabled=true; SELECT nz_freight_quota.cleanup_expired()");
  const driver = proposedQuotaDriverForFixture(Client, connection, streamFactory);
  await admin.query("UPDATE nz_freight_quota.cleanup_status SET last_success=pg_catalog.clock_timestamp()-interval '31 minutes'");
  await prepare(); assert.equal(await driver.claim({ invocationId: randomUUID(), kind: 'mcp' }), null);
  await admin.query('SELECT nz_freight_quota.cleanup_expired()');
  await prepare();
  const first = await driver.claim({ invocationId: randomUUID(), kind: 'mcp' }); assert.equal(first.state, 'admitted');
  for(let i=0;i<100 && driver.active();i++) await new Promise(r=>setTimeout(r,10));
  assert.equal(driver.active(),0);
  await admin.query("DELETE FROM nz_freight_quota.leases; DELETE FROM nz_freight_quota.windows; CREATE FUNCTION nz_freight_quota.driver_delay() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_catalog.pg_sleep(10); RETURN NEW; END $$; CREATE TRIGGER driver_delay BEFORE INSERT ON nz_freight_quota.leases FOR EACH ROW EXECUTE FUNCTION nz_freight_quota.driver_delay()");
  await prepare();
  const started = performance.now();
  assert.equal(await driver.claim({ invocationId: randomUUID(), kind: 'mcp' }), null);
  assert(performance.now() - started < 1200);
  for(let i=0;i<100 && driver.active();i++) await new Promise(r=>setTimeout(r,10));
  assert.equal(driver.active(),0);
  assert.equal((await admin.query('SELECT count(*)::int AS n FROM nz_freight_quota.leases')).rows[0].n, 0);
  assert.equal((await admin.query('SELECT count(*)::int AS n FROM nz_freight_quota.windows')).rows[0].n, 0);
  const controller = new AbortController();
  await prepare();
  const pending = driver.claim({ invocationId: randomUUID(), kind: 'mcp' }, controller.signal);
  let pid;
  for (let i = 0; i < 40; i++) {
    pid = (await admin.query("SELECT pid FROM pg_catalog.pg_stat_activity WHERE application_name='nz-freight-quota' AND wait_event='PgSleep'")).rows[0]?.pid;
    if (pid) break;
    await new Promise(r => setTimeout(r, 5));
  }
  assert(pid); controller.abort(); assert.equal(await pending, null);
  for (let i = 0; i < 120; i++) {
    const active = (await admin.query('SELECT count(*)::int AS n FROM pg_catalog.pg_stat_activity WHERE pid=$1', [pid])).rows[0].n;
    if (!active) break;
    await new Promise(r => setTimeout(r, 10));
  }
  assert.equal((await admin.query('SELECT count(*)::int AS n FROM pg_catalog.pg_stat_activity WHERE pid=$1', [pid])).rows[0].n, 0);
  assert.equal((await admin.query('SELECT count(*)::int AS n FROM nz_freight_quota.windows')).rows[0].n, 0);
  await admin.query('DROP TRIGGER driver_delay ON nz_freight_quota.leases; DROP FUNCTION nz_freight_quota.driver_delay()');
  await prepare();
  const retry = await driver.claim({ invocationId: randomUUID(), kind: 'mcp' }); assert.equal(retry.state, 'admitted');
  console.log(JSON.stringify({ scope: 'actual pg driver over fixture protocol bridge/internal Docker loopback only; hosted TLS/network unproved', driverVersion: require('pg/package.json').version, serverVersion: (await admin.query('SHOW server_version')).rows[0].server_version, sqlSha256: createHash('sha256').update(readFileSync(resolve(root, 'security-proposals/nz-plugin-hosting/quota-review.sql'))).digest('hex'), adapterSha256: createHash('sha256').update(readFileSync(resolve(root, 'security-proposals/nz-plugin-hosting/quota-driver.mjs'))).digest('hex'), cleanupSqlSha256: createHash('sha256').update(readFileSync(resolve(root, 'security-proposals/nz-plugin-hosting/cleanup-review.sql'))).digest('hex'), tests: ['explicit fixture configuration; final effective pg settings validated; no ambient credentials', 'stale cleanup receipt denies driver admission', 'scoped login admitted; end releases capacity', 'server500ms timeout rolls back real claim', 'caller abort ends actual driver connection; backend absent by bounded check; no counter commit', 'fresh connection retry admitted'], imageId: container.Image, publicActivation: false }, null, 2));
} finally { await admin.end(); }

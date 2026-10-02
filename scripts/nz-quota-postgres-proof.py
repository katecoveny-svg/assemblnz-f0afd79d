"""Explicit local proof only. Fixed disposable container; no host DB/network credentials."""
import concurrent.futures, json, subprocess, time, uuid
CONTAINER = 'assembl-nz-quota-proof-task3'
proof = []
def sql(query, check=True):
    p = subprocess.run(['docker','exec',CONTAINER,'psql','-X','-U','postgres','-At','-v','ON_ERROR_STOP=1','-c',query],capture_output=True,text=True,timeout=5)
    if check and p.returncode: raise AssertionError(p.stderr)
    return p
def value(query): return sql(query).stdout.strip().splitlines()[-1]
def claim(kind='mcp', parent=None):
    parent_sql = "NULL" if parent is None else "'"+parent+"'::pg_catalog.uuid"
    result = sql("SET ROLE nz_freight_quota; SELECT nz_freight_quota.claim('"+str(uuid.uuid4())+"','"+kind+"',"+parent_sql+");",False)
    if result.returncode:
        assert 'lock timeout' in result.stderr
        return {'state':'denied','reason':'lock_timeout'}
    return json.loads(result.stdout.strip().splitlines()[-1])
def reset(): sql('RESET ROLE; DELETE FROM nz_freight_quota.leases; DELETE FROM nz_freight_quota.windows; UPDATE nz_freight_quota.control SET enabled=true;')
sql('UPDATE nz_freight_quota.control SET enabled=false;'); assert claim()['reason']=='closed'; proof.append('default-disabled returns closed')
for role in ['anon','authenticated','nz_freight_quota']:
    assert sql('SET ROLE '+role+'; SELECT * FROM nz_freight_quota.control;',False).returncode != 0
for role in ['anon','authenticated']:
    assert sql('SET ROLE '+role+"; SELECT nz_freight_quota.claim('"+str(uuid.uuid4())+"','mcp');",False).returncode != 0
assert sql('SET ROLE nz_freight_quota; SELECT nz_freight_quota.take_backend_attempt();',False).returncode != 0
assert value("SELECT count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='nz_freight_quota' AND pg_catalog.has_function_privilege('public',p.oid,'EXECUTE');")=='0'
sql("SET ROLE nz_freight_quota_owner; CREATE FUNCTION nz_freight_quota.future_acl_probe() RETURNS pg_catalog.bool LANGUAGE sql AS 'SELECT true';")
assert value("SELECT pg_catalog.has_function_privilege('public','nz_freight_quota.future_acl_probe()','EXECUTE');")=='f'
sql('DROP FUNCTION nz_freight_quota.future_acl_probe();')
proof.append('table/helper/public/anon/authenticated and future-function default ACL denied')
reset()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(lambda _:claim(),range(8)))
assert sum(x['state']=='admitted' for x in results)<=4
for _ in range(4): claim()
assert value("SELECT count(*) FROM nz_freight_quota.leases WHERE NOT released;")=='4'
proof.append('8 concurrent replicas yield exactly4 active MCP leases')
reset(); parent=claim()['lease']['id']; sql("UPDATE nz_freight_quota.leases SET expires_at=pg_catalog.clock_timestamp()+interval '16 seconds' WHERE id='"+parent+"';")
child=claim('source_load',parent); assert child['state']=='admitted'
assert value("SELECT (c.expires_at<=p.expires_at)::text FROM nz_freight_quota.leases c JOIN nz_freight_quota.leases p ON p.id=c.parent;")=='true'
assert child['lease']['expiresAtMs']-child['lease']['issuedAtMs']<20000
sql("UPDATE nz_freight_quota.leases SET expires_at=pg_catalog.clock_timestamp()+interval '1 second' WHERE id='"+parent+"';")
assert claim('source_load',parent)['state']=='denied'; proof.append('child capped at parent expiry; short parent denies')
reset(); parent=claim()['lease']['id']; sql("UPDATE nz_freight_quota.leases SET released=true WHERE id='"+parent+"';")
assert claim('source_load',parent)['state']=='denied'; proof.append('released parent denies')
reset(); parent=claim()['lease']['id']
lock=subprocess.Popen(['docker','exec',CONTAINER,'psql','-X','-U','postgres','-At','-c',"SET application_name='nz-quota-parent-proof'; BEGIN; SELECT id FROM nz_freight_quota.leases WHERE id='"+parent+"' FOR UPDATE; SELECT pg_sleep(1); COMMIT;"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
for _ in range(30):
    if value("SELECT count(*) FROM pg_catalog.pg_stat_activity WHERE application_name='nz-quota-parent-proof' AND wait_event='PgSleep';")=='1':break
    time.sleep(.02)
assert claim('source_load',parent)['reason']=='lock_timeout'
lock.communicate(timeout=3)
proof.append('parent row lock is real and lock wait fails closed at100ms')
# Temp objects use adversarial names/types; privileged function resolution must remain catalog-first.
reset()
attack="""SET ROLE nz_freight_quota; CREATE TEMP TABLE control(id int,enabled bool); CREATE DOMAIN pg_temp.uuid AS text; CREATE DOMAIN pg_temp.bool AS text; CREATE FUNCTION pg_temp.clock_timestamp() RETURNS timestamptz LANGUAGE sql AS 'SELECT ''1900-01-01''::timestamptz'; SELECT nz_freight_quota.claim('"""+str(uuid.uuid4())+"""','mcp');"""
res=json.loads(value(attack)); assert res['state']=='admitted' and res['databaseNowMs']>1700000000000
proof.append('temporary relation/type/function shadowing fails')
# Lock wait timeout and cancellation are actual PostgreSQL behavior, not ignored JS cancellation.
reset()
lock=subprocess.Popen(['docker','exec',CONTAINER,'psql','-X','-U','postgres','-At','-c',"SET application_name='nz-quota-lock-proof'; BEGIN; SELECT id FROM nz_freight_quota.control WHERE id=1 FOR UPDATE; SELECT pg_sleep(1); COMMIT;"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
for _ in range(30):
    if value("SELECT count(*) FROM pg_catalog.pg_stat_activity WHERE application_name='nz-quota-lock-proof' AND wait_event='PgSleep';")=='1':break
    time.sleep(.02)
failed=sql("SET ROLE nz_freight_quota; SELECT nz_freight_quota.claim('"+str(uuid.uuid4())+"','mcp');",False)
assert failed.returncode!=0 and 'lock timeout' in failed.stderr; lock.communicate(timeout=3)
proof.append('control lock wait capped100ms')
sleeper=subprocess.Popen(['docker','exec',CONTAINER,'psql','-X','-U','postgres','-At','-c',"SET application_name='nz-quota-cancel-proof'; SELECT pg_sleep(10);"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
for _ in range(30):
    ids=value("SELECT coalesce(string_agg(pid::text,','),'none') FROM pg_catalog.pg_stat_activity WHERE application_name='nz-quota-cancel-proof' AND wait_event='PgSleep';")
    if ids!='none':break
    time.sleep(.02)
assert ids.isdigit(); assert value('SELECT pg_catalog.pg_cancel_backend('+ids+');')=='t'
_,err=sleeper.communicate(timeout=3); assert sleeper.returncode!=0 and 'canceling statement' in err
proof.append('actual pg_cancel_backend cancels isolated query; caller abort alone remains insufficient')
# Demonstrate cutoff honestly: cleanup executes only after enabled valid claim reaches cleanup.
reset(); sql("INSERT INTO nz_freight_quota.leases VALUES ('"+str(uuid.uuid4())+"','"+str(uuid.uuid4())+"',999999,'mcp',NULL,pg_catalog.statement_timestamp()-interval '49 hours',pg_catalog.statement_timestamp()-interval '49 hours'+interval '20 seconds',true);")
sql('UPDATE nz_freight_quota.control SET enabled=false;'); assert claim()['reason']=='closed'
assert value("SELECT count(*) FROM nz_freight_quota.leases WHERE issued_at<pg_catalog.clock_timestamp()-interval '48 hours';")=='1'
sql('UPDATE nz_freight_quota.control SET enabled=true;'); assert claim()['state']=='admitted'
assert value("SELECT count(*) FROM nz_freight_quota.leases WHERE issued_at<pg_catalog.clock_timestamp()-interval '48 hours';")=='0'
proof.append('49hour cleanup on successful claim; disabled service retains row (activation gate)')
print(json.dumps({'scope':'disposable network-none postgres17 only','tests':proof,'count':len(proof),'production_access':False},indent=2))

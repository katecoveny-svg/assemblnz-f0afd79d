"""Only the guarded task-owned driver fixture. No production database or scheduler."""
import hashlib,json,pathlib,subprocess
container='assembl-nz-driver-proof-task3'
config=json.loads(subprocess.check_output(['docker','inspect',container],text=True))[0]
network=json.loads(subprocess.check_output(['docker','network','inspect','assembl-nz-driver-proof-task3'],text=True))[0]
assert network['Internal'] and config['HostConfig']['Memory']==268435456
assert config['HostConfig']['NetworkMode']=='assembl-nz-driver-proof-task3'
assert set(config['NetworkSettings']['Networks'])=={'assembl-nz-driver-proof-task3'}
assert config['NetworkSettings']['Networks']['assembl-nz-driver-proof-task3']['NetworkID']==network['Id']
assert set(network['Containers'])=={config['Id']}
assert not any(m['Type']=='bind' for m in config['Mounts'])
def sql(q,check=True,user='postgres'):
 p=subprocess.run(['docker','exec',container,'psql','-X','-U',user,'-d','postgres','-At','-v','ON_ERROR_STOP=1','-c',q],capture_output=True,text=True,timeout=5)
 if check and p.returncode:raise AssertionError(p.stderr)
 return p
def value(q,user='postgres'):return sql(q,user=user).stdout.strip().splitlines()[-1]
sql("DELETE FROM nz_freight_quota.leases; UPDATE nz_freight_quota.control SET enabled=false; INSERT INTO nz_freight_quota.leases SELECT pg_catalog.gen_random_uuid(),pg_catalog.gen_random_uuid(),100000+i,'mcp',NULL,pg_catalog.statement_timestamp()-interval '50 hours',pg_catalog.statement_timestamp()-interval '50 hours'+interval '20 seconds',true FROM pg_catalog.generate_series(1,250) i; DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='nz_cleanup_fixture') THEN CREATE ROLE nz_cleanup_fixture LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; END IF; END $$; GRANT nz_freight_cleanup TO nz_cleanup_fixture;")
sql('UPDATE nz_freight_quota.cleanup_status SET last_success=NULL,overdue=true;')
assert json.loads(value('SELECT nz_freight_quota.cleanup_health();','nz_cleanup_fixture'))['healthy'] is False
results=[]
sql('UPDATE nz_freight_quota.control SET enabled=true;')
assert value('SELECT enabled FROM nz_freight_quota.control;')=='t'
for expected in [100,100,50]:
 result=json.loads(value("SET statement_timeout='500ms'; SELECT nz_freight_quota.cleanup_expired();",'nz_cleanup_fixture'))
 assert result['deleted']==expected;results.append(result)
 if expected==100:assert value('SELECT enabled FROM nz_freight_quota.control;')=='f'
assert value('SELECT count(*) FROM nz_freight_quota.leases;')=='0'
assert value('SELECT enabled FROM nz_freight_quota.control;')=='f'
assert json.loads(value('SELECT nz_freight_quota.cleanup_health();','nz_cleanup_fixture'))['healthy'] is True
sql("UPDATE nz_freight_quota.cleanup_status SET last_success=pg_catalog.clock_timestamp()-interval '31 minutes';")
assert json.loads(value('SELECT nz_freight_quota.cleanup_health();','nz_cleanup_fixture'))['healthy'] is False
for query in ['SET ROLE postgres;','SET ROLE nz_freight_quota_owner;','SELECT * FROM nz_freight_quota.leases;','UPDATE nz_freight_quota.control SET enabled=true;']:
 assert sql(query,False,'nz_cleanup_fixture').returncode!=0
assert sql('SELECT nz_freight_quota.cleanup_expired();',False,'nz_driver_fixture').returncode!=0
source=pathlib.Path(__file__).resolve().parent.parent/'security-proposals/nz-plugin-hosting/cleanup-review.sql'
print(json.dumps({'scope':'guarded disposable only; scheduler not created','sole_network_verified':True,'network_attachment_count':len(config['NetworkSettings']['Networks']),'cleanup_sql_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'image_id':config['Image'],'server_version':value('SHOW server_version;'),'tests':['subsequent cleanup runs with service disabled','250 overdue rows drain100/100/50 under fixed200 total ceiling','overdue transitions enabled pilot to disabled','fresh cleanup LOGIN cannot elevate/read/write tables','quota runtime cannot execute cleanup','null/stale cleanup health fails closed; fresh drained status healthy without reopening pilot'],'batches':results,'production_access':False},indent=2))

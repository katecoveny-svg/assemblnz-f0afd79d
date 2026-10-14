#!/usr/bin/env python3
"""Disposable no-network synthetic DB tests. Never targets production/linked DB.
Requires the already reviewed local Supabase image; never pulls an image.
Not executed evidence until a terminal PASS is produced.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json, subprocess, time, uuid

ROOT=Path(__file__).resolve().parents[2]
NAME='assembl-owner-run-review-'+uuid.uuid4().hex[:8]
IMAGE='f6cdd6bf9b55'
def command(args,**kwargs):
    return subprocess.run(args,text=True,capture_output=True,timeout=20,**kwargs)
def sql(query,fail=False):
    p=command(['docker','exec','-i',NAME,'psql','-X','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'],input=query)
    if fail:
        assert p.returncode, p.stdout
        return p.stderr
    assert p.returncode==0,p.stderr
    return p.stdout.strip()
def literal(value):return '$fixture$'+json.dumps(value,separators=(',',':'))+'$fixture$::jsonb'
A='11111111-1111-4111-8111-111111111111';B='22222222-2222-4222-8222-222222222222';C='44444444-4444-4444-8444-444444444444'
RUN=str(uuid.uuid4());ACTION=str(uuid.uuid4());FP='a'*64
POL={'id':'synthetic-review','ownerId':A,'expiresAt':'2099-01-01T00:00:00Z','maxRuns':1,'provider':'openai','accountRef':'fictional-test-only','model':'test-model','pricingVersion':'synthetic-v1','maxCalls':2,'maxInputTokens':2000,'maxOutputTokens':1000,'maxUsdMicros':7000,'inputUsdMicrosPerMillion':1000000,'outputUsdMicrosPerMillion':5000000,'tools':False,'cache':False,'retries':0,'repairs':0}
def rpc(command_name,body,owner=A,role='service_role',fail=False):
    return sql(f"set role {role};select public.studio_owner_run_command('{owner}','{command_name}',{literal(body)});",fail)
created=False
try:
    p=command(['docker','run','--detach','--pull','never','--network','none','--name',NAME,'-e','POSTGRES_PASSWORD=synthetic-local-only',IMAGE])
    assert p.returncode==0,p.stderr
    created=True
    meta=json.loads(command(['docker','inspect',NAME]).stdout)[0]
    assert meta['HostConfig']['NetworkMode']=='none' and meta['Config']['Image']==IMAGE
    for _ in range(30):
        ready=command(['docker','exec',NAME,'pg_isready','-U','supabase_admin'])
        if ready.returncode==0:break
        time.sleep(.2)
    assert ready.returncode==0
    sql("create or replace function auth.jwt() returns jsonb language sql stable as 'select coalesce(nullif(current_setting(''request.jwt.claims'',true),''''),''{}'')::jsonb';grant usage on schema auth to authenticated,anon;grant execute on function auth.jwt() to authenticated,anon;")
    sql(f"insert into auth.users(id) values('{A}'),('{B}'),('{C}') on conflict do nothing;")
    sql((ROOT/'docs/migration-review/owner-schema-proposal.sql').read_text())
    # Adversarial broad default ACLs must not survive the new proposal.
    sql('alter default privileges in schema public grant all on tables to public;alter default privileges in schema public grant execute on functions to public;')
    sql((ROOT/'docs/migration-review/owner-run-schema-proposal.sql').read_text())
    sql(f"insert into public.studio_owner_access(owner_user_id,enabled) values('{A}',true),('{B}',true),('{C}',false);insert into public.studio_owner_run_policies values('{A}','synthetic-review',{literal(POL)});")
    create={'runId':RUN,'inputFingerprint':FP,'selectedSourceReceipts':[],'policyId':POL['id']}
    assert 'permission denied' in rpc('create',create,role='authenticated',fail=True)
    assert 'permission denied' in rpc('create',create,role='anon',fail=True)
    assert 'run_owner_denied' in rpc('create',create,owner=C,fail=True)
    r=json.loads(rpc('create',create));assert r['revision']==0
    assert 'run_policy_already_used' in rpc('create',{**create,'runId':str(uuid.uuid4())},fail=True)
    assert 'run_input_conflict' in rpc('create',{**create,'inputFingerprint':'b'*64},fail=True)
    assert 'run_input_invalid' in rpc('create',{**create,'model':'forged'},fail=True)
    claim={'runId':RUN,'actionId':ACTION,'action':'develop','inputFingerprint':FP,'expectedRevision':0}
    with ThreadPoolExecutor(max_workers=2) as pool:
        pair=list(pool.map(lambda _:json.loads(rpc('claim',claim)),range(2)))
    assert sorted(v['kind'] for v in pair)==['claimed','existing']
    c=next(v for v in pair if v['kind']=='claimed');cid=c['claimId']
    start={'runId':RUN,'claimId':cid,'expectedRevision':1}
    r=json.loads(rpc('start',start));assert r['dispatch'] is True and r['receipt']['claims'][0]['state']=='started'
    assert 'run_revision_conflict' in rpc('start',start,fail=True)
    r=json.loads(rpc('outcome',{**start,'expectedRevision':2,'status':'complete'}))
    assert r['claims'][0]['state']=='usage-unverified' and r['reservedUsdMicros']==7000
    assert json.loads(rpc('lookup',{'runId':RUN}))==r
    assert 'run_dispatch_denied' in rpc('start',{**start,'expectedRevision':3},fail=True)
    assert 'run_budget_exceeded' in rpc('claim',{**claim,'actionId':str(uuid.uuid4()),'action':'build','expectedRevision':3},fail=True)
    assert 'permission denied' in sql("set role service_role;update public.studio_owner_run_policies set policy='{}';",True)
    policy_b={**POL,'id':'synthetic-review-b','ownerId':B};run_b=str(uuid.uuid4())
    sql(f"insert into public.studio_owner_run_policies values('{B}','synthetic-review-b',{literal(policy_b)});")
    rpc('create',{**create,'runId':run_b,'policyId':policy_b['id']},owner=B)
    for owner,foreign,own_run,foreign_run in [(A,B,RUN,run_b),(B,A,run_b,RUN)]:
        prefix=f"set role authenticated;set request.jwt.claim.sub='{owner}';"
        assert sql(prefix+"select count(*) from public.studio_owner_runs;")=='1'
        assert sql(prefix+f"select count(*) from public.studio_owner_runs where owner_user_id='{foreign}' or run_id='{foreign_run}';")=='0'
        assert 'permission denied' in rpc('lookup',{'runId':foreign_run},owner=foreign,role='authenticated',fail=True)
        assert 'run_unavailable' in rpc('lookup',{'runId':foreign_run},owner=owner,fail=True)
        assert json.loads(rpc('lookup',{'runId':own_run},owner=owner))['ownerId']==owner
    sql(f"update public.studio_owner_access set enabled=false where owner_user_id='{A}';")
    assert 'run_owner_denied' in rpc('lookup',{'runId':RUN},fail=True)
    print('PASS: disposable SQL admission, duplicate atomic claim, CAS, budget, uncertainty, role denial, RLS and disablement')
finally:
    if created:
        p=command(['docker','rm','--force',NAME]);assert p.returncode==0,p.stderr

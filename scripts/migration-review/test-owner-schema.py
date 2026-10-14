#!/usr/bin/env python3
"""Synthetic owner-only tests, exclusively in the named network-disabled container."""
from concurrent.futures import ThreadPoolExecutor
import json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
CONTAINER='assembl-hub-hardened-review'
meta=json.loads(subprocess.check_output(['docker','inspect',CONTAINER],text=True))[0]
assert meta['HostConfig']['NetworkMode']=='none', 'Refuse a networked database'
assert meta['Config']['Image']=='f6cdd6bf9b55', 'Refuse another database image'
results=[]
def sql(query, expected=None):
 p=subprocess.run(['docker','exec','-i',CONTAINER,'psql','-X','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-qAt'],input=query,text=True,capture_output=True)
 if expected:
  assert p.returncode and expected in p.stderr, (expected,p.stderr[-1500:])
 else:
  assert p.returncode==0,p.stderr[-2000:]
 return p.stdout.strip().splitlines()
def check(label,query,expected=None,tail=None):
 out=sql(query,expected)
 if tail is not None:assert out[-1]==str(tail),(label,out[-6:])
 results.append(label)
def identity(owner,anonymous=False):
 return f"set role authenticated;set request.jwt.claim.sub='{owner}';set request.jwt.claims='{{\"is_anonymous\":{str(anonymous).lower()}}}';"
def literal(payload):return '$payload$'+json.dumps(payload)+'$payload$::jsonb'
payload=json.loads((ROOT/'scripts/migration-review/synthetic-owner-payload.json').read_text())
brand={'primary':'#240B21','onPrimary':'#ffffff','accent':'#916A70','paper':'#FFFDFB','ink':'#240B21','font':'system','logo':'','notes':'','notesApproved':False,'decks':[]}
P=literal(payload)
A='11111111-1111-4111-8111-111111111111';B='22222222-2222-4222-8222-222222222222';C='33333333-3333-4333-8333-333333333333';D='44444444-4444-4444-8444-444444444444'
sql("drop table if exists public.studio_owner_drafts,public.studio_owner_access cascade;drop schema if exists studio_private cascade;drop function if exists public.studio_save_owner_draft(uuid,integer,jsonb),public.studio_delete_owner_draft(uuid,integer),public.studio_purge_deleted_owner_drafts();")
# Image defaults grant named client roles broadly. Add PUBLIC too, as an adversarial
# test; the proposal must revoke these inherited grants, not merely assume none.
for role in ['postgres','supabase_admin']:sql(f'alter default privileges for role {role} in schema public revoke all on tables from public;alter default privileges for role {role} in schema public revoke execute on functions from public;')
defaults=sql("select defaclrole::regrole,defaclnamespace::regnamespace,defaclobjtype,defaclacl from pg_default_acl where defaclnamespace='public'::regnamespace;")
sql("alter default privileges in schema public grant all on tables to public;alter default privileges in schema public grant execute on functions to public;")
# This Postgres image has auth.uid but lacks auth.jwt (normally installed by Auth).
# Supply only the JWT accessor for synthetic GUC claims; no production JWT proof.
sql("do $$ begin if to_regprocedure('auth.jwt()') is null then execute $f$create function auth.jwt() returns jsonb language sql stable as 'select coalesce(nullif(current_setting(''request.jwt.claims'',true),''''),''{}'')::jsonb'$f$;end if;end $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid(),auth.jwt() to authenticated,anon;")
sql(f"insert into auth.users(id) values('{A}'),('{B}'),('{C}'),('{D}') on conflict do nothing;")
sql('begin;'+(ROOT/'docs/migration-review/owner-schema-proposal.sql').read_text()+'commit;')
check('no recipient or media tables',"select count(*) from information_schema.tables where table_schema='public' and table_name like 'studio_%' and table_name not in ('studio_owner_access','studio_owner_drafts');",tail=0)
check('direct RPC denied before DB enablement',identity(A)+f'select * from public.studio_save_owner_draft(null,0,{P});','42501')
sql(f"insert into public.studio_owner_access(owner_user_id,enabled,draft_limit) values('{A}',true,20),('{B}',false,20),('{C}',true,1),('{D}',true,1);")
check('disabled DB owner denied',identity(B)+f'select * from public.studio_save_owner_draft(null,0,{P});','42501')
for role in ['anon','authenticated','service_role']:
 for privilege in ['INSERT','UPDATE','DELETE','TRUNCATE']:
  check(f'{role} has no {privilege}',f"select has_table_privilege('{role}','public.studio_owner_drafts','{privilege}');",tail='f')
 check(f'{role} cannot enable owner',f"select has_table_privilege('{role}','public.studio_owner_access','UPDATE');",tail='f')
check('PUBLIC cannot save',"select not exists(select 1 from pg_proc p, lateral aclexplode(p.proacl) a where p.oid='public.studio_save_owner_draft(uuid,integer,jsonb)'::regprocedure and a.grantee=0);",tail='t')
check('PUBLIC grants absent on all proposed tables',"select not exists(select 1 from pg_class c, lateral aclexplode(c.relacl) a where c.oid in ('public.studio_owner_access'::regclass,'public.studio_owner_drafts'::regclass) and a.grantee=0);",tail='t')
check('PUBLIC grants absent on all proposed functions',"select not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace, lateral aclexplode(p.proacl) a where (n.nspname='studio_private' or p.proname in ('studio_save_owner_draft','studio_delete_owner_draft','studio_purge_deleted_owner_drafts')) and a.grantee=0);",tail='t')
for function in ['studio_save_owner_draft(uuid,integer,jsonb)','studio_delete_owner_draft(uuid,integer)']:
 for role in ['anon','service_role']:check(f'{role} cannot execute {function}',f"select has_function_privilege('{role}','public.{function}','EXECUTE');",tail='f')
check('anonymous authenticated identity denied',identity(A,True)+f'select * from public.studio_save_owner_draft(null,0,{P});','42501')
check('missing identity denied','set role authenticated;'+f'select * from public.studio_save_owner_draft(null,0,{P});','42501')
check('NULL revision denied',identity(A)+f'select * from public.studio_save_owner_draft(null,null,{P});','22023')
check('NULL payload denied',identity(A)+'select * from public.studio_save_owner_draft(null,0,null);','22023')
bad=[]
for value in [None,'1',2]:
 x=dict(payload);x['schemaVersion']=value;bad.append(('schemaVersion '+str(value),x))
x=dict(payload);del x['schemaVersion'];bad.append(('missing schemaVersion',x))
bad.extend([('incomplete payload',{'schemaVersion':1}),('owner injection',{**payload,'owner_user_id':A}),('oversized note',{**payload,'privateNotes':'x'*6001}),('oversized sources',{**payload,'sources':[{}]*41}),('wrong nested type',{**payload,'journey':{**payload['journey'],'before':7}}),('unknown nested field',{**payload,'journey':{**payload['journey'],'unapproved':True}}),('blank company',{**payload,'seller':'   '}),('invalid logo',{**payload,'sellerBrand':{**brand,'logo':'javascript:alert(1)'}}),('bad colour contrast',{**payload,'sellerBrand':{**brand,'onPrimary':brand['primary']}}),('upload without owned selection',{**payload,'cinema':{'mode':'upload','title':'','description':''}})])
for label,value in bad:check('reject '+label,identity(A)+f'select * from public.studio_save_owner_draft(null,0,{literal(value)});','22023')
for url in ['javascript:alert(1)','https://user:password@example.test/path','file:///private/example']:
 value={**payload,'sources':[{'id':'synthetic','title':'Synthetic source','url':url,'claim':'Example','status':'concept','checked':'Not verified','include':False}]}
 check('reject forbidden source URL '+url.split(':')[0],identity(A)+f'select * from public.studio_save_owner_draft(null,0,{literal(value)});','22023')
row=sql(identity(A)+f'select id from public.studio_save_owner_draft(null,0,{P});')[-1]
check('valid uppercase brand colours accepted',identity(A)+f"select count(*) from public.studio_save_owner_draft(null,0,{literal({**payload,'sellerBrand':brand})});",tail=1)
check('create returns revision1',identity(A)+f"select revision from public.studio_owner_drafts where id='{row}';",tail=1)
check('wrong user cannot read',identity(C)+f"select count(*) from public.studio_owner_drafts where id='{row}';",tail=0)
check('wrong user cannot overwrite',identity(C)+f"select count(*) from public.studio_save_owner_draft('{row}',1,{P});",tail=0)
check('direct UPDATE denied',identity(A)+f"update public.studio_owner_drafts set revision=99 where id='{row}';",'42501')
check('direct INSERT denied',identity(A)+f"insert into public.studio_owner_drafts(owner_user_id,revision,payload) values('{A}',1,{P});",'42501')
check('direct allowlist UPDATE denied',identity(A)+f"update public.studio_owner_access set enabled=true where owner_user_id='{B}';",'42501')
check('CAS update succeeds',identity(A)+f"select revision from public.studio_save_owner_draft('{row}',1,{P});",tail=2)
check('stale CAS cannot overwrite',identity(A)+f"select count(*) from public.studio_save_owner_draft('{row}',1,{P});",tail=0)
check('invalid update revision denied',identity(A)+f"select * from public.studio_save_owner_draft('{row}',0,{P});",'22023')
# Simultaneous sessions contend on the same owner lock. A winning writer holds
# its transaction open briefly, forcing the second to re-evaluate after commit.
def concurrent(queries):
 with ThreadPoolExecutor(max_workers=2) as pool:
  return list(pool.map(sql,queries))
out=concurrent([identity(A)+f"begin;select count(*) from public.studio_save_owner_draft('{row}',2,{P});select pg_sleep(0.5);commit;" for _ in range(2)])
assert sorted([int(x[0]) for x in out])==[0,1],out
results.append('concurrent CAS exactly one winner')
attempt=f"create function pg_temp.try_save() returns integer language plpgsql as $try$ begin perform * from public.studio_save_owner_draft(null,0,{P});return 1;exception when sqlstate 'P0001' then return -1;end $try$;"
out=concurrent([identity(C)+attempt+"begin;select pg_temp.try_save();select pg_sleep(0.5);commit;" for _ in range(2)])
assert sorted([int(x[0]) for x in out])==[-1,1],out
results.append('concurrent draft quota exactly one winner')
# Byte quota uses the same locked row. Fill with valid bounded history snapshots.
large=json.loads(json.dumps(payload))
snapshot={k:v for k,v in payload['design'].items() if k in ['name','client','buyer','brief','source','evidenceState','reviewer','pursuitId','brandLogo','frame']}
snapshot['brandLogo']='data:image/png;base64,'+'A'*49000
large['design']['history']=[{'id':str(i),'label':'Synthetic snapshot','at':'2026-10-01','frame':payload['design']['frame'],'snapshot':snapshot} for i in range(20)]
sql(f"update public.studio_owner_access set draft_limit=20,byte_limit=1800000 where owner_user_id='{D}';")
L=literal(large)
too_large=json.loads(json.dumps(large));too_large['design']['history']+=too_large['design']['history'][:10]
too_large['sellerBrand']={**brand,'logo':'data:image/png;base64,'+'A'*219000}
too_large['privateNotes']='x'*6000;too_large['research']='x'*45000
too_large['clientBrand']={'preset':'custom','name':'Synthetic client','programme':'Example','primary':'#240B21','onPrimary':'#ffffff','accent':'#916A70','paper':'#FFFDFB','ink':'#240B21','logo':'data:image/png;base64,'+'A'*219000,'sourceUrl':'','checked':'Unverified'}
check('total payload byte cap enforced',identity(A)+f'select * from public.studio_save_owner_draft(null,0,{literal(too_large)});','22023')
out=concurrent([identity(D)+attempt.replace(P,L)+"begin;select pg_temp.try_save();select pg_sleep(0.5);commit;" for _ in range(2)])
assert sorted([int(x[0]) for x in out])==[-1,1],out
results.append('concurrent byte quota exactly one winner')
check('NULL delete id denied',identity(A)+'select * from public.studio_delete_owner_draft(null,3);','22023')
check('NULL delete revision denied',identity(A)+f"select * from public.studio_delete_owner_draft('{row}',null);",'22023')
check('stale delete denied',identity(A)+f"select count(*) from public.studio_delete_owner_draft('{row}',2);",tail=0)
check('soft delete increments revision',identity(A)+f"select revision from public.studio_delete_owner_draft('{row}',3);",tail=4)
check('deleted record invisible',identity(A)+f"select count(*) from public.studio_owner_drafts where id='{row}';",tail=0)
check('deleted record cannot be overwritten',identity(A)+f"select count(*) from public.studio_save_owner_draft('{row}',4,{P});",tail=0)
sql(f"update public.studio_owner_access set draft_limit=2 where owner_user_id='{A}';")
check('tombstone remains in quota',identity(A)+f'select * from public.studio_save_owner_draft(null,0,{P});','P0001')
check('owner cannot purge',identity(A)+'select public.studio_purge_deleted_owner_drafts();','42501')
check('fresh tombstone retained','set role service_role;select public.studio_purge_deleted_owner_drafts();',tail=0)
sql(f"update public.studio_owner_drafts set deleted_at=now()-interval '31 days' where id='{row}';")
check('due tombstone purged by operator','set role service_role;select public.studio_purge_deleted_owner_drafts();',tail=1)
check('quota restored after purge',identity(A)+f'select revision from public.studio_save_owner_draft(null,0,{P});',tail=1)
sql(f"update public.studio_owner_access set enabled=false where owner_user_id='{A}';")
check('disabled owner loses read access',identity(A)+'select count(*) from public.studio_owner_drafts;',tail=0)
check('disabled owner cannot delete',identity(A)+f"select * from public.studio_delete_owner_draft('{row}',4);",'42501')
check('disabled owner cannot write',identity(A)+f'select * from public.studio_save_owner_draft(null,0,{P});','42501')
sql(f"delete from auth.users where id='{D}';")
check('auth-user deletion cascades new drafts',f"select count(*) from public.studio_owner_drafts where owner_user_id='{D}';",tail=0)
sql('alter default privileges in schema public revoke all on tables from public;alter default privileges in schema public revoke execute on functions from public;')
report={'database':'isolated Supabase Postgres17.6.1.139, network none, synthetic only','auth_limit':'real image auth.uid; synthetic auth.jwt accessor/GUC claims, no cookie/JWT acceptance','inherited_defaults':defaults,'passed':len(results),'checks':results,'recipient_storage':'absent/inactive; no Storage policy tests claimed'}
(ROOT/'docs/migration-review/evidence/owner-schema-v2-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

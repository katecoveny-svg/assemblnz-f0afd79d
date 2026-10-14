// Isolated embedded PostgreSQL only; never reads environment credentials or connects remotely.
// npm install --prefix /tmp/do-saved-sql --ignore-scripts @electric-sql/pglite@0.3.14
const { PGlite } = require('/tmp/do-saved-sql/node_modules/@electric-sql/pglite');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path'); const assert = require('node:assert/strict');
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', id = '33333333-3333-4333-8333-333333333333';
const content = { version: 1, kind: 'note', title: 'Fictional shelf', text: 'Try a reading corner.', sourceUrl: '', tags: [] };
(async () => {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'do-saved-db-')); let db = new PGlite(directory); let checks = 0;
 const check = (name, value) => { assert.ok(value, name); checks++; console.log('PASS ' + name); };
 const fails = async fn => { try { await fn(); return false; } catch { return true; } };
 const as = async (owner, role = 'authenticated', anonymous = false) => {
   await db.exec('reset role');
   await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
   await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({is_anonymous:anonymous})]);
   await db.exec(`set role ${role}`);
 };
 const insert = (owner, itemId, value = content) => db.query("insert into public.do_saved_items(owner_id,id,revision,content,consent_version) values($1,$2,1,$3,'do-saved-v1') returning *",[owner,itemId,value]);
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema auth to authenticated;
    create table auth.users(id uuid primary key);
    insert into auth.users values('${a}'),('${b}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    alter default privileges grant all on tables to anon,authenticated,service_role;`);
  await db.exec(fs.readFileSync(path.join(__dirname,'../docs/do-saved/schema-review.sql'),'utf8'));
  await as(a);
  for (const key of Object.keys(content)) {
    check('reject null ' + key, (await db.query('select public.do_saved_valid_content($1) as ok',[{...content,[key]:null}])).rows[0].ok === false);
    const missing={...content}; delete missing[key];
    check('reject missing ' + key, (await db.query('select public.do_saved_valid_content($1) as ok',[missing])).rows[0].ok === false);
  }
  for (const extra of [{ownerId:b},{imageUrl:'https://example.com/image'},{html:'<script>'}])
    check('reject extra fields ' + Object.keys(extra)[0],(await db.query('select public.do_saved_valid_content($1) as ok',[{...content,...extra}])).rows[0].ok === false);
  check('null kind cannot be inserted',await fails(()=>insert(a,id,{...content,kind:null})));
  check('owner save', (await insert(a,id)).rows.length===1);
  check('owner sees own record',(await db.query('select * from public.do_saved_items')).rows.length===1);
  await as(b);
  check('other owner sees no record',(await db.query('select * from public.do_saved_items')).rows.length===0);
  check('other owner cannot insert for A',await fails(()=>insert(a,'44444444-4444-4444-8444-444444444444')));
  check('other owner cannot edit',(await db.query('update public.do_saved_items set revision=2 where id=$1 returning *',[id])).rows.length===0);
  await as(a,'anon'); check('anonymous table access denied',await fails(()=>db.query('select * from public.do_saved_items')));
  await as(a,'service_role'); check('service role table access denied',await fails(()=>db.query('select * from public.do_saved_items')));
  await as(a,'authenticated',true); check('anonymous signin sees no rows',(await db.query('select * from public.do_saved_items')).rows.length===0);
  check('anonymous signin cannot insert',await fails(()=>insert(a,'44444444-4444-4444-8444-444444444444')));
  await as(a);
  check('owner reassignment denied',await fails(()=>db.query('update public.do_saved_items set owner_id=$1,revision=2 where id=$2',[b,id])));
  check('revision skip denied',await fails(()=>db.query('update public.do_saved_items set revision=4 where id=$1',[id])));
  check('CAS edit accepted',(await db.query('update public.do_saved_items set revision=2,content=$1 where id=$2 and revision=1 returning *',[{...content,text:'Reviewed edit'},id])).rows.length===1);
  check('stale CAS has no write',(await db.query('update public.do_saved_items set revision=2 where id=$1 and revision=1 returning *',[id])).rows.length===0);
  check('hard delete denied',await fails(()=>db.query('delete from public.do_saved_items where id=$1',[id])));
  await db.query('update public.do_saved_items set content=null,deleted=true,revision=3 where id=$1',[id]);
  check('erasure removes content',(await db.query('select content from public.do_saved_items where id=$1',[id])).rows[0].content===null);
  check('tombstone update cannot resurrect',await fails(()=>db.query('update public.do_saved_items set content=$1,deleted=false,revision=4 where id=$2',[content,id])));
  check('same ID insert cannot resurrect',await fails(()=>insert(a,id)));
  // Persistent embedded database is closed and reopened through a new instance.
  await db.close(); db = new PGlite(directory); await as(a);
  check('new connection reload keeps erased tombstone',(await db.query('select deleted,content,revision from public.do_saved_items where id=$1',[id])).rows[0].revision===3);
  for(let n=0;n<80;n++) await insert(a,`55555555-5555-4555-8555-${String(n).padStart(12,'0')}`);
  check('81st live item rejected',await fails(()=>insert(a,'66666666-6666-4666-8666-666666666666')));
  console.log(JSON.stringify({checks,postgres:'embedded PGlite',productionTouched:false}));
 } finally { await db.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

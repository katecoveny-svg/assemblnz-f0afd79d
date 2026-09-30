// Local-only regression for legacy registry shape collisions. No live database.
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || '/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const file = name => fs.readFileSync('supabase/migrations/' + name, 'utf8');
const zoo = file('20260701140000_auckland_zoo_keeper_pilot.sql');
const air = file('20260701145000_tenant_air_nz_pilot.sql');
const rewards = file('20260701150000_everyday_rewards_pilot.sql');
const lula = file('20260701160000_lula_inn_hospo_pilot.sql');
const registry = file('20260708090000_sync_registry_mirrors.sql');
const happy = file('20260702090000_happy_tails_tenant.sql');
const create = source => source.match(/create table if not exists public\.tenant_customers\s*\([\s\S]*?\n\);/i)[0];
const seed = source => source.match(/insert into public\.tenant_customers\s*\([\s\S]*?;\n/i)[0];
const checks = [];
const check = (label, result) => { assert.ok(result, label); checks.push(label); console.log('PASS ' + label); };

(async () => {
  for (const shape of ['zoo', 'air', 'lula']) {
    const db = new PGlite();
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(create(shape === 'zoo' ? zoo : shape === 'air' ? air : lula));
    if (shape === 'zoo') await db.exec("insert into public.tenant_customers(slug,name,status) values ('existing-zoo','Existing unchanged name','concept-pending');");
    const before = await db.query("select column_name,is_nullable from information_schema.columns where table_schema='public' and table_name='tenant_customers' and column_name in ('name','display_name')");
    // Replay the whole Air NZ and Everyday Rewards migrations, not copied seeds.
    await db.exec(air);
    await db.exec(rewards);
    check(`${shape}: Air NZ and Everyday Rewards seeds replay`, (await db.query("select count(*)::int as count from public.tenant_customers where slug in ('air-nz','everyday-rewards')")).rows[0].count === 2);
    check(`${shape}: aliases satisfy both seed contracts`, (await db.query("select count(*)::int as count from public.tenant_customers where slug in ('air-nz','everyday-rewards') and name=display_name and name is not null")).rows[0].count === 2);
    for (const column of before.rows.filter(row => row.is_nullable === 'NO')) {
      const after = await db.query("select is_nullable from information_schema.columns where table_schema='public' and table_name='tenant_customers' and column_name=$1", [column.column_name]);
      check(`${shape}: preserves ${column.column_name} NOT NULL`, after.rows[0].is_nullable === 'NO');
    }
    if (shape === 'zoo') check('existing Zoo data unchanged', (await db.query("select name,status from public.tenant_customers where slug='existing-zoo'")).rows[0].name === 'Existing unchanged name');
    // Lula's existing additive compatibility section supplies its own columns.
    const lulaRegistry = lula.slice(lula.indexOf('create table if not exists public.tenant_customers'), lula.indexOf('-- 2 · Ops data model'));
    await db.exec(lulaRegistry);
    await db.exec(seed(happy));
    await db.exec(seed(registry));
    check(`${shape}: later registry seeds remain compatible`, (await db.query("select count(*)::int as count from public.tenant_customers where slug in ('lula-inn','happy-tails','aironaut')")).rows[0].count === 3);
    await db.exec(air); await db.exec(rewards);
    check(`${shape}: repeat replay is idempotent`, (await db.query("select count(*)::int as count from public.tenant_customers where slug='air-nz'")).rows[0].count === 1);
    check(`${shape}: RLS remains enabled`, (await db.query("select relrowsecurity from pg_class where oid='public.tenant_customers'::regclass")).rows[0].relrowsecurity);
    check(`${shape}: trigger has no elevated execution`, (await db.query("select prosecdef from pg_proc where oid='public.tenant_customers_fill_name_aliases()'::regprocedure")).rows[0].prosecdef === false);
    await db.exec("insert into public.tenant_customers(slug,name,display_name,status) values ('both-labels','Internal name','Display label','demo')");
    check(`${shape}: intentional distinct labels survive`, (await db.query("select name,display_name from public.tenant_customers where slug='both-labels'")).rows[0].name === 'Internal name');
    await db.exec("grant select,insert,update on public.tenant_customers to service_role; set role service_role; insert into public.tenant_customers(slug,display_name,status) values ('service-test','Service label','demo'); reset role;");
    check(`${shape}: authorised service insert still fills aliases`, (await db.query("select name from public.tenant_customers where slug='service-test'")).rows[0].name === 'Service label');
    await db.exec('set role anon');
    await assert.rejects(() => db.exec("insert into public.tenant_customers(slug,name,display_name,status) values ('blocked','No','No','demo')"));
    check(`${shape}: public writes still denied`, true);
    await db.close();
  }
  console.log(`${checks.length} tenant registry replay checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });

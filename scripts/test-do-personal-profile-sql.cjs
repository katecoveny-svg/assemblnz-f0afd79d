// Local-only profile contract proof. No production connection or provider call.
// npm install --prefix /tmp/assembl-personal-sql @electric-sql/pglite@0.3.14
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || "/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite");
const fs = require("node:fs");
const assert = require("node:assert/strict");

(async () => {
  const db = new PGlite();
  let count = 0;
  const check = (name, condition) => { assert.ok(condition, name); count++; console.log(`PASS ${name}`); };
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key,is_anonymous boolean default false);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    grant usage on schema auth to authenticated,service_role;
    grant select on auth.users to service_role;
  `);
  await db.exec(fs.readFileSync("supabase/migrations/20260930031622_do_personal_profiles.sql", "utf8"));
  const a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  await db.query("insert into auth.users values ($1,false),($2,false)", [a, b]);
  await db.exec("set role service_role");
  await db.query("insert into public.do_personal_profiles(owner_id,display_name,consented_at,consent_version) values ($1,'Orbit',now(),1),($2,'Bloom',now(),1)", [a, b]);
  check("service role can save profiles", (await db.query("select count(*)::integer as count from public.do_personal_profiles")).rows[0].count === 2);
  const defaults = (await db.query("select * from public.do_personal_profiles where owner_id=$1", [a])).rows[0];
  check("defaults never claim onboarding or action permission", defaults.onboarding_completed === false && defaults.initiative === "gentle" && defaults.preferences === "");
  await db.query("insert into public.do_personal_profiles(owner_id,display_name,consented_at,consent_version) values ($1,'Pebble',now(),1) on conflict(owner_id) do update set display_name=excluded.display_name", [a]);
  check("owner upsert preserves one row per account", (await db.query("select count(*)::integer as count from public.do_personal_profiles where owner_id=$1", [a])).rows[0].count === 1);
  for (const [label, sql] of [
    ["empty names", "display_name=''"], ["overlong names", "display_name=repeat('a',33)"],
    ["multiline names", "display_name=E'DO\\nAdmin'"], ["unknown avatar", "avatar='robot'"],
    ["unknown tone", "tone='other'"], ["unknown response length", "response_length='infinite'"],
    ["authority-like initiative", "initiative='autonomous'"], ["overlong preferences", "preferences=repeat('x',1201)"],
    ["unknown voice", "voice_name='unknown'"], ["missing consent timestamp", "consented_at=null"],
    ["unsupported consent version", "consent_version=2"],
  ]) {
    await assert.rejects(() => db.query(`update public.do_personal_profiles set ${sql} where owner_id=$1`, [a]));
    check(`storage rejects ${label}`, true);
  }
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [a]);
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ is_anonymous: false })]);
  await db.exec("set role authenticated");
  const ownRows = (await db.query("select owner_id,display_name from public.do_personal_profiles")).rows;
  check("authenticated owner reads only their own profile", ownRows.length === 1 && ownRows[0].owner_id === a && ownRows[0].display_name === "Pebble");
  check("direct lookup cannot reveal another profile", (await db.query("select * from public.do_personal_profiles where owner_id=$1", [b])).rows.length === 0);
  for (const [label, sql] of [
    ["insert", "insert into public.do_personal_profiles(owner_id,consented_at,consent_version) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',now(),1)"],
    ["update", "update public.do_personal_profiles set preferences='Bypass consent'"],
    ["delete", "delete from public.do_personal_profiles"],
  ]) {
    await assert.rejects(() => db.query(sql));
    check(`authenticated client cannot ${label} profiles directly`, true);
  }
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ is_anonymous: true })]);
  await db.exec("set role authenticated");
  check("anonymous sign-in cannot read an owner profile", (await db.query("select * from public.do_personal_profiles")).rows.length === 0);
  await db.exec("reset role; set role anon");
  await assert.rejects(() => db.query("select * from public.do_personal_profiles"));
  check("signed-out clients cannot read profiles", true);
  await db.exec("reset role; set role service_role");
  await db.query("delete from public.do_personal_profiles where owner_id=$1", [a]);
  const remaining = (await db.query("select owner_id from public.do_personal_profiles")).rows;
  check("forgetting one profile leaves other owners intact", remaining.length === 1 && remaining[0].owner_id === b);
  await db.exec("reset role");
  await db.query("delete from auth.users where id=$1", [b]);
  check("account deletion cascades to its profile", (await db.query("select * from public.do_personal_profiles")).rows.length === 0);
  check("table has RLS enabled", (await db.query("select relrowsecurity from pg_class where oid='public.do_personal_profiles'::regclass")).rows[0].relrowsecurity === true);
  await db.close();
  console.log(`${count} profile database checks passed`);
})().catch((error) => { console.error(error); process.exitCode = 1; });

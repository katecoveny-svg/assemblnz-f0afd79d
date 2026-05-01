// ══════════════════════════════════════════════════════════════════════════
// migrate-helper — TEMPORARY edge function for Lovable → assembl-prod migration
// ══════════════════════════════════════════════════════════════════════════
// REDEPLOY 2026-05-02: original PR #9 was merged 2026-05-01 but Lovable
// never auto-deployed the new function (a known issue with NEW edge
// functions on the Lovable→Supabase sync). Rotating the bearer token and
// touching this file forces Lovable to treat it as a CHANGE to an existing
// file, which deploys reliably within ~2-3 min of merge.
//
// SCOPE: One-shot data export tool. Lives only as long as the migration takes.
// MUST BE DELETED after migration is complete (separate PR will remove it).
//
// AUTH: Hardcoded bearer token below. Token is throwaway — only valid while
// this function is deployed. Once the function is deleted, the token is dead.
//
// CAPABILITIES (with valid bearer token):
//   - List schemas, tables, row counts (via SUPABASE_DB_URL direct postgres)
//   - Dump table rows (paginated, any schema)
//   - Dump auth.users (via admin API)
//   - List/download storage buckets and objects
//
// USAGE: GET https://<ref>.supabase.co/functions/v1/migrate-helper?action=<a>&...
//   Authorization: Bearer <TOKEN>
//
// Actions:
//   action=health
//   action=list-schemas
//   action=list-tables&schema=public
//   action=dump-table&schema=public&table=agent_prompts&offset=0&limit=500
//   action=list-auth-users&offset=0&limit=100
//   action=list-storage-buckets
//   action=list-storage-objects&bucket=<b>&offset=0&limit=100
//   action=download-storage-object&bucket=<b>&path=<p>
//
// SECURITY NOTE: This is intentionally a temporary tool. Do NOT extend or
// repurpose it. After migration, delete the entire migrate-helper directory.
// ══════════════════════════════════════════════════════════════════════════

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// THROWAWAY TOKEN — rotated 2026-05-02 for the actual migration run. The
// previous token (in PR #9 commit history) is dead because the function
// never deployed under it; rotating defensively in case anyone scraped the
// public commit. This token is also temporary — once migrate-helper is
// deleted (cleanup PR after migration), this token is meaningless.
const TOKEN = "h2kPPHVhuqkjwwMLFombY50GBx-bXp0kbawsHl566jUBnEN3lE6vIN-l7aZXRkoy";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SYSTEM_SCHEMAS = [
  "pg_catalog",
  "information_schema",
  "pg_toast",
  "pg_temp_1",
  "pg_toast_temp_1",
  "realtime",
  "vault",
  "extensions",
  "graphql",
  "graphql_public",
  "pgsodium",
  "pgsodium_masks",
  "net",
  "supabase_migrations",
  "_realtime",
  "_analytics",
  "cron",
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function authorize(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${TOKEN}`;
}

// ── Lazy clients ─────────────────────────────────────────────────────────────────

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) throw new Error("SUPABASE_DB_URL env var not set");
    _pool = new Pool(dbUrl, 1, true);
  }
  return _pool;
}

async function pgQuery<T = Record<string, unknown>>(
  sql: string,
  args: unknown[] = [],
): Promise<T[]> {
  const conn = await getPool().connect();
  try {
    const result = await conn.queryObject<T>(sql, args);
    return result.rows;
  } finally {
    conn.release();
  }
}

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    _admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

// ── Action handlers ────────────────────────────────────────────────────────────

async function actionListSchemas() {
  const placeholders = SYSTEM_SCHEMAS.map((_, i) => `$${i + 1}`).join(",");
  const rows = await pgQuery<{ schema_name: string }>(
    `SELECT schema_name
     FROM information_schema.schemata
     WHERE schema_name NOT IN (${placeholders})
     ORDER BY schema_name`,
    SYSTEM_SCHEMAS,
  );
  return jsonResponse({ schemas: rows.map((r) => r.schema_name) });
}

async function actionListTables(schema: string) {
  const rows = await pgQuery<{
    table_name: string;
    row_count: string;
    size_bytes: string;
    size_pretty: string;
  }>(
    `SELECT
       c.relname AS table_name,
       c.reltuples::bigint::text AS row_count,
       pg_total_relation_size(c.oid)::text AS size_bytes,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS size_pretty
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relkind IN ('r', 'p')
     ORDER BY c.relname`,
    [schema],
  );
  return jsonResponse({
    schema,
    tables: rows.map((r) => ({
      table_name: r.table_name,
      row_count_estimate: parseInt(r.row_count, 10),
      size_bytes: parseInt(r.size_bytes, 10),
      size_pretty: r.size_pretty,
    })),
  });
}

const SAFE_IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

async function actionDumpTable(
  schema: string,
  table: string,
  offset: number,
  limit: number,
) {
  if (!SAFE_IDENT.test(schema) || !SAFE_IDENT.test(table)) {
    return jsonResponse({ error: "invalid_identifier", schema, table }, 400);
  }
  // Get exact row count (cheap for small tables, OK for migration scale)
  const countRows = await pgQuery<{ count: string }>(
    `SELECT count(*)::text AS count FROM "${schema}"."${table}"`,
  );
  const total = parseInt(countRows[0]?.count ?? "0", 10);

  // Get ordered slice. ORDER BY ctid is stable enough for a one-shot dump.
  const rows = await pgQuery(
    `SELECT * FROM "${schema}"."${table}" ORDER BY ctid LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return jsonResponse({
    schema,
    table,
    offset,
    limit,
    total,
    returned: rows.length,
    rows,
  });
}

async function actionListAuthUsers(offset: number, limit: number) {
  const admin = getAdmin();
  // listUsers paginates by page (1-based) and perPage. Translate offset/limit.
  const perPage = Math.min(limit, 1000);
  const page = Math.floor(offset / perPage) + 1;
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({
    page,
    perPage,
    users: data.users,
    total: data.users.length, // listUsers doesn't return total; client paginates until empty
  });
}

async function actionListStorageBuckets() {
  const admin = getAdmin();
  const { data, error } = await admin.storage.listBuckets();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ buckets: data });
}

async function actionListStorageObjects(
  bucket: string,
  offset: number,
  limit: number,
) {
  const admin = getAdmin();
  const { data, error } = await admin.storage.from(bucket).list("", {
    limit,
    offset,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ bucket, offset, limit, objects: data });
}

async function actionDownloadStorageObject(bucket: string, path: string) {
  const admin = getAdmin();
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error) return jsonResponse({ error: error.message }, 500);
  if (!data) return jsonResponse({ error: "not_found", bucket, path }, 404);
  const buf = new Uint8Array(await data.arrayBuffer());
  // Base64-encode for JSON transport. Limit to ~5MB per object to avoid edge
  // function memory pressure; larger objects should be downloaded in chunks
  // via separate methods (out of scope for this temporary helper).
  if (buf.length > 5 * 1024 * 1024) {
    return jsonResponse(
      { error: "object_too_large", sizeBytes: buf.length, limit: 5 * 1024 * 1024 },
      413,
    );
  }
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  const b64 = btoa(binary);
  return jsonResponse({
    bucket,
    path,
    contentType: data.type ?? null,
    sizeBytes: buf.length,
    contentBase64: b64,
  });
}

// ── Main handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!authorize(req)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "health";
  const intParam = (k: string, dflt: number) => {
    const v = url.searchParams.get(k);
    if (!v) return dflt;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : dflt;
  };

  try {
    switch (action) {
      case "health":
        return jsonResponse({
          ok: true,
          time: new Date().toISOString(),
          deno: Deno.version.deno,
        });
      case "list-schemas":
        return await actionListSchemas();
      case "list-tables":
        return await actionListTables(url.searchParams.get("schema") ?? "public");
      case "dump-table":
        return await actionDumpTable(
          url.searchParams.get("schema") ?? "public",
          url.searchParams.get("table") ?? "",
          intParam("offset", 0),
          intParam("limit", 500),
        );
      case "list-auth-users":
        return await actionListAuthUsers(intParam("offset", 0), intParam("limit", 100));
      case "list-storage-buckets":
        return await actionListStorageBuckets();
      case "list-storage-objects":
        return await actionListStorageObjects(
          url.searchParams.get("bucket") ?? "",
          intParam("offset", 0),
          intParam("limit", 100),
        );
      case "download-storage-object":
        return await actionDownloadStorageObject(
          url.searchParams.get("bucket") ?? "",
          url.searchParams.get("path") ?? "",
        );
      default:
        return jsonResponse({ error: "unknown_action", action }, 400);
    }
  } catch (err) {
    return jsonResponse(
      {
        error: "exception",
        message: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

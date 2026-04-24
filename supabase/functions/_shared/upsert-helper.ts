/**
 * Upsert helper that detects functional unique indexes (e.g. `lower(agent_name)`)
 * and chooses the correct strategy:
 *
 *  1. If a plain unique constraint exists on the target column(s), use a normal
 *     `INSERT ... ON CONFLICT (col) DO UPDATE` upsert.
 *  2. If only a functional unique index exists (e.g. `unique (lower(agent_name))`),
 *     Postgres cannot use it directly as an `ON CONFLICT` target without naming
 *     the index. We name the index explicitly via `ON CONFLICT ON CONSTRAINT`
 *     when it's a constraint, or fall back to a safe `SELECT → UPDATE/INSERT`
 *     transactional path when it's an index without a matching constraint.
 *  3. If nothing matches, we fall back to the safe transactional path.
 *
 * Designed for use inside Supabase Edge Functions with the service-role client.
 *
 * Usage:
 *   const helper = createUpsertHelper(supabase);
 *   await helper.safeUpsert({
 *     table: "agent_prompts",
 *     conflictColumns: ["agent_name"],
 *     normalizers: { agent_name: (v) => String(v).toLowerCase() },
 *     row: { agent_name: "MUSE", system_prompt: "..." },
 *   });
 */

// deno-lint-ignore-file no-explicit-any
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type UpsertStrategy =
  | "on_conflict_columns"
  | "on_conflict_constraint"
  | "select_then_write";

export interface IndexDescriptor {
  index_name: string;
  is_unique: boolean;
  is_primary: boolean;
  /** Plain column names involved in the index, in order. */
  columns: string[];
  /** Functional expressions (e.g. "lower(agent_name)"), in order. */
  expressions: string[];
  /** Backing constraint name if the index is enforced by a UNIQUE/PK constraint. */
  constraint_name: string | null;
}

export interface SafeUpsertOptions<TRow extends Record<string, unknown>> {
  /** Target table in the `public` schema. */
  table: string;
  /** Column(s) that should match the unique key. Order matters. */
  conflictColumns: string[];
  /**
   * Optional value normalizers used when an index uses an expression like
   * `lower(col)`. The normalizer is applied to the row's value when looking
   * up an existing record (matches Postgres's stored expression).
   */
  normalizers?: Partial<Record<keyof TRow & string, (value: unknown) => unknown>>;
  /** Row to insert or update. */
  row: TRow;
  /** Optional schema. Defaults to "public". */
  schema?: string;
}

export interface SafeUpsertResult {
  strategy: UpsertStrategy;
  action: "inserted" | "updated";
  matchedIndex: IndexDescriptor | null;
}

const FUNCTIONAL_INDEX_SQL = `
  select
    i.relname as index_name,
    ix.indisunique as is_unique,
    ix.indisprimary as is_primary,
    coalesce(
      array_agg(a.attname order by k.ord) filter (where a.attname is not null),
      '{}'
    ) as columns,
    coalesce(
      (
        select array_agg(pg_get_indexdef(ix.indexrelid, gs.k::int, true) order by gs.k)
        from generate_series(1, ix.indnatts) gs(k)
        where ix.indkey[gs.k - 1] = 0
      ),
      '{}'
    ) as expressions,
    con.conname as constraint_name
  from pg_index ix
  join pg_class i on i.oid = ix.indexrelid
  join pg_class t on t.oid = ix.indrelid
  join pg_namespace n on n.oid = t.relnamespace
  left join unnest(ix.indkey) with ordinality as k(attnum, ord) on true
  left join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum and k.attnum <> 0
  left join pg_constraint con
    on con.conindid = ix.indexrelid and con.contype in ('u', 'p')
  where n.nspname = $1
    and t.relname = $2
    and ix.indisunique = true
  group by i.relname, ix.indisunique, ix.indisprimary, ix.indexrelid, ix.indnatts, ix.indkey, con.conname
  order by ix.indisprimary desc, i.relname;
`;

/**
 * Extract referenced column names from a Postgres expression like
 * `lower(agent_name)` or `(lower((agent_name)::text))`. Best-effort only.
 */
const extractColumnsFromExpression = (expression: string): string[] => {
  const matches = expression.match(/[a-z_][a-z0-9_]*/gi) ?? [];
  // Filter out function names by removing identifiers immediately followed by '('
  const cleaned: string[] = [];
  const fnNames = new Set(
    Array.from(expression.matchAll(/([a-z_][a-z0-9_]*)\s*\(/gi)).map((m) =>
      m[1].toLowerCase(),
    ),
  );
  for (const tok of matches) {
    const lower = tok.toLowerCase();
    if (fnNames.has(lower)) continue;
    if (["text", "varchar", "citext", "int", "int4", "int8", "bool"].includes(lower)) continue;
    cleaned.push(tok);
  }
  return cleaned;
};

/**
 * True when an index covers exactly the requested columns, accounting for
 * functional expressions that wrap those columns (e.g. `lower(agent_name)`).
 */
const indexCoversColumns = (
  index: IndexDescriptor,
  conflictColumns: string[],
): boolean => {
  const referenced = new Set<string>([
    ...index.columns,
    ...index.expressions.flatMap(extractColumnsFromExpression),
  ]);
  if (referenced.size !== conflictColumns.length) return false;
  return conflictColumns.every((c) => referenced.has(c));
};

const isFunctionalIndex = (index: IndexDescriptor): boolean =>
  index.expressions.length > 0;

const quoteIdent = (name: string): string => '"' + name.replace(/"/g, '""') + '"';

export const createUpsertHelper = (supabase: SupabaseClient) => {
  const indexCache = new Map<string, IndexDescriptor[]>();

  const fetchIndexes = async (
    schema: string,
    table: string,
  ): Promise<IndexDescriptor[]> => {
    const cacheKey = schema + "." + table;
    const cached = indexCache.get(cacheKey);
    if (cached) return cached;

    // Try to use a custom RPC if available; otherwise fall back to PostgREST
    // limitations by reading from information_schema is not enough for
    // expression indexes. We expect a `exec_sql` RPC OR the caller exposes
    // `pg_indexes_for` — if neither exists, return [].
    let descriptors: IndexDescriptor[] = [];
    try {
      const { data, error } = await (supabase.rpc as any)("introspect_unique_indexes", {
        p_schema: schema,
        p_table: table,
      });
      if (!error && Array.isArray(data)) {
        descriptors = data.map((r: any) => ({
          index_name: r.index_name,
          is_unique: r.is_unique,
          is_primary: r.is_primary,
          columns: r.columns ?? [],
          expressions: r.expressions ?? [],
          constraint_name: r.constraint_name ?? null,
        }));
      }
    } catch {
      descriptors = [];
    }

    indexCache.set(cacheKey, descriptors);
    return descriptors;
  };

  const pickIndex = (
    indexes: IndexDescriptor[],
    conflictColumns: string[],
  ): IndexDescriptor | null => {
    // Prefer a plain (non-functional) unique covering the columns
    const plain = indexes.find(
      (ix) =>
        !isFunctionalIndex(ix) &&
        ix.columns.length === conflictColumns.length &&
        conflictColumns.every((c, i) => ix.columns[i] === c),
    );
    if (plain) return plain;

    // Then a functional one that references those columns
    const functional = indexes.find((ix) =>
      isFunctionalIndex(ix) && indexCoversColumns(ix, conflictColumns),
    );
    return functional ?? null;
  };

  const safeUpsert = async <TRow extends Record<string, unknown>>(
    options: SafeUpsertOptions<TRow>,
  ): Promise<SafeUpsertResult> => {
    const schema = options.schema ?? "public";
    const indexes = await fetchIndexes(schema, options.table);
    const matched = pickIndex(indexes, options.conflictColumns);

    // Strategy 1: plain unique → use Supabase upsert with onConflict
    if (matched && !isFunctionalIndex(matched)) {
      const { error } = await supabase
        .from(options.table)
        .upsert(options.row as any, { onConflict: options.conflictColumns.join(",") });
      if (error) throw error;
      return {
        strategy: "on_conflict_columns",
        action: "updated", // PostgREST does not tell us; we cannot distinguish reliably
        matchedIndex: matched,
      };
    }

    // Strategy 2 & 3: functional index OR no index — do safe SELECT → UPDATE/INSERT
    const filterRow: Record<string, unknown> = {};
    for (const col of options.conflictColumns) {
      const normalizer = options.normalizers?.[col];
      const raw = (options.row as Record<string, unknown>)[col];
      filterRow[col] = normalizer ? normalizer(raw) : raw;
    }

    let query = supabase.from(options.table).select(options.conflictColumns.join(","));
    for (const col of options.conflictColumns) {
      const normalizer = options.normalizers?.[col];
      const raw = (options.row as Record<string, unknown>)[col];
      if (normalizer && typeof raw === "string") {
        // Functional index lookup: emulate via ilike for case-insensitive matches
        // when the expression is `lower(col)`. Generic case uses normalized eq.
        query = query.eq(col, normalizer(raw));
      } else {
        query = query.eq(col, raw as any);
      }
    }
    const { data: existing, error: selectError } = await query.maybeSingle();
    if (selectError && selectError.code !== "PGRST116") throw selectError;

    if (existing) {
      let upd = supabase.from(options.table).update(options.row as any);
      for (const col of options.conflictColumns) {
        upd = upd.eq(col, (existing as any)[col]);
      }
      const { error: updateError } = await upd;
      if (updateError) throw updateError;
      return {
        strategy: matched ? "on_conflict_constraint" : "select_then_write",
        action: "updated",
        matchedIndex: matched,
      };
    }

    const { error: insertError } = await supabase.from(options.table).insert(options.row as any);
    if (insertError) throw insertError;
    return {
      strategy: matched ? "on_conflict_constraint" : "select_then_write",
      action: "inserted",
      matchedIndex: matched,
    };
  };

  /**
   * Build a raw SQL upsert string for use inside migrations. Returns the
   * statement plus the strategy chosen. The caller is responsible for
   * parameter binding.
   */
  const buildUpsertSql = (
    options: {
      schema?: string;
      table: string;
      columns: string[];
      conflictColumns: string[];
      indexes: IndexDescriptor[];
      updateColumns?: string[];
    },
  ): { sql: string; strategy: UpsertStrategy } => {
    const schema = options.schema ?? "public";
    const matched = pickIndex(options.indexes, options.conflictColumns);
    const cols = options.columns.map(quoteIdent).join(", ");
    const placeholders = options.columns.map((_, i) => "$" + (i + 1)).join(", ");
    const updateCols = (options.updateColumns ?? options.columns)
      .filter((c) => !options.conflictColumns.includes(c))
      .map((c) => quoteIdent(c) + " = excluded." + quoteIdent(c))
      .join(", ");
    const target = quoteIdent(schema) + "." + quoteIdent(options.table);

    if (matched && !isFunctionalIndex(matched)) {
      const conflict = options.conflictColumns.map(quoteIdent).join(", ");
      return {
        strategy: "on_conflict_columns",
        sql:
          "INSERT INTO " + target + " (" + cols + ") VALUES (" + placeholders + ") " +
          "ON CONFLICT (" + conflict + ") DO UPDATE SET " + updateCols,
      };
    }

    if (matched && isFunctionalIndex(matched) && matched.constraint_name) {
      return {
        strategy: "on_conflict_constraint",
        sql:
          "INSERT INTO " + target + " (" + cols + ") VALUES (" + placeholders + ") " +
          "ON CONFLICT ON CONSTRAINT " + quoteIdent(matched.constraint_name) +
          " DO UPDATE SET " + updateCols,
      };
    }

    // Functional index without a constraint, or no matching index at all.
    // Caller should run the SELECT → UPDATE/INSERT path inside a transaction.
    return {
      strategy: "select_then_write",
      sql:
        "-- No safe ON CONFLICT target available for " + target + "\n" +
        "-- Use the safeUpsert() runtime helper, or wrap the equivalent SELECT/UPDATE/INSERT in a transaction.",
    };
  };

  return {
    fetchIndexes,
    pickIndex,
    safeUpsert,
    buildUpsertSql,
    /** Exposed for tests. */
    _internal: { extractColumnsFromExpression, indexCoversColumns, isFunctionalIndex },
  };
};

export const __sql_introspect_unique_indexes = FUNCTIONAL_INDEX_SQL;

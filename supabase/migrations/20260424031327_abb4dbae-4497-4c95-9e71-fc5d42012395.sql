-- Introspect unique indexes (including functional/expression indexes)
CREATE OR REPLACE FUNCTION public.introspect_unique_indexes(
  p_schema text,
  p_table text
)
RETURNS TABLE (
  index_name text,
  is_unique boolean,
  is_primary boolean,
  columns text[],
  expressions text[],
  constraint_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT
    i.relname::text AS index_name,
    ix.indisunique AS is_unique,
    ix.indisprimary AS is_primary,
    COALESCE(
      (
        SELECT array_agg(a.attname::text ORDER BY k.ord)
        FROM unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord)
        LEFT JOIN pg_attribute a
          ON a.attrelid = t.oid AND a.attnum = k.attnum
        WHERE k.attnum <> 0
      ),
      ARRAY[]::text[]
    ) AS columns,
    COALESCE(
      (
        SELECT array_agg(pg_get_indexdef(ix.indexrelid, gs.k::int, true) ORDER BY gs.k)
        FROM generate_series(1, ix.indnatts) gs(k)
        WHERE ix.indkey[gs.k - 1] = 0
      ),
      ARRAY[]::text[]
    ) AS expressions,
    con.conname::text AS constraint_name
  FROM pg_index ix
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_class t ON t.oid = ix.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  LEFT JOIN pg_constraint con
    ON con.conindid = ix.indexrelid AND con.contype IN ('u', 'p')
  WHERE n.nspname = p_schema
    AND t.relname = p_table
    AND ix.indisunique = true
  ORDER BY ix.indisprimary DESC, i.relname;
$$;

GRANT EXECUTE ON FUNCTION public.introspect_unique_indexes(text, text) TO authenticated, service_role, anon;
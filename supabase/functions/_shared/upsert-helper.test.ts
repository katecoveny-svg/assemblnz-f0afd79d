// Deno tests for the upsert helper internals (no Supabase round-trips).
// Run with: deno test supabase/functions/_shared/upsert-helper.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createUpsertHelper, type IndexDescriptor } from "./upsert-helper.ts";

// Minimal stub — we only exercise the pure helpers via _internal.
const stubClient = {} as unknown as Parameters<typeof createUpsertHelper>[0];
const helper = createUpsertHelper(stubClient);

Deno.test("extracts column names from lower(agent_name)", () => {
  const cols = helper._internal.extractColumnsFromExpression("lower(agent_name)");
  assertEquals(cols, ["agent_name"]);
});

Deno.test("strips function names and casts from expressions", () => {
  const cols = helper._internal.extractColumnsFromExpression(
    "(lower((agent_name)::text))",
  );
  assertEquals(cols.includes("agent_name"), true);
  assertEquals(cols.includes("text"), false);
  assertEquals(cols.includes("lower"), false);
});

Deno.test("detects functional vs plain indexes", () => {
  const plain: IndexDescriptor = {
    index_name: "agent_prompts_pkey",
    is_unique: true,
    is_primary: true,
    columns: ["id"],
    expressions: [],
    constraint_name: "agent_prompts_pkey",
  };
  const functional: IndexDescriptor = {
    index_name: "agent_prompts_lower_name_idx",
    is_unique: true,
    is_primary: false,
    columns: [],
    expressions: ["lower(agent_name)"],
    constraint_name: null,
  };
  assertEquals(helper._internal.isFunctionalIndex(plain), false);
  assertEquals(helper._internal.isFunctionalIndex(functional), true);
});

Deno.test("indexCoversColumns matches functional index by referenced column", () => {
  const ix: IndexDescriptor = {
    index_name: "x",
    is_unique: true,
    is_primary: false,
    columns: [],
    expressions: ["lower(agent_name)"],
    constraint_name: null,
  };
  assertEquals(helper._internal.indexCoversColumns(ix, ["agent_name"]), true);
  assertEquals(helper._internal.indexCoversColumns(ix, ["other"]), false);
});

Deno.test("buildUpsertSql picks plain ON CONFLICT (cols)", () => {
  const indexes: IndexDescriptor[] = [{
    index_name: "agent_prompts_agent_name_key",
    is_unique: true,
    is_primary: false,
    columns: ["agent_name"],
    expressions: [],
    constraint_name: "agent_prompts_agent_name_key",
  }];
  const out = helper.buildUpsertSql({
    table: "agent_prompts",
    columns: ["agent_name", "system_prompt"],
    conflictColumns: ["agent_name"],
    indexes,
  });
  assertEquals(out.strategy, "on_conflict_columns");
  assertEquals(out.sql.includes('ON CONFLICT ("agent_name")'), true);
});

Deno.test("buildUpsertSql picks ON CONFLICT ON CONSTRAINT for functional+constraint", () => {
  const indexes: IndexDescriptor[] = [{
    index_name: "agent_prompts_lower_name_uniq",
    is_unique: true,
    is_primary: false,
    columns: [],
    expressions: ["lower(agent_name)"],
    constraint_name: "agent_prompts_lower_name_uniq",
  }];
  const out = helper.buildUpsertSql({
    table: "agent_prompts",
    columns: ["agent_name", "system_prompt"],
    conflictColumns: ["agent_name"],
    indexes,
  });
  assertEquals(out.strategy, "on_conflict_constraint");
  assertEquals(out.sql.includes("ON CONFLICT ON CONSTRAINT"), true);
});

Deno.test("buildUpsertSql falls back to select_then_write when only a functional index without constraint", () => {
  const indexes: IndexDescriptor[] = [{
    index_name: "agent_prompts_lower_name_idx",
    is_unique: true,
    is_primary: false,
    columns: [],
    expressions: ["lower(agent_name)"],
    constraint_name: null,
  }];
  const out = helper.buildUpsertSql({
    table: "agent_prompts",
    columns: ["agent_name", "system_prompt"],
    conflictColumns: ["agent_name"],
    indexes,
  });
  assertEquals(out.strategy, "select_then_write");
});

Deno.test("buildUpsertSql falls back to select_then_write when no matching index", () => {
  const out = helper.buildUpsertSql({
    table: "agent_prompts",
    columns: ["agent_name", "system_prompt"],
    conflictColumns: ["agent_name"],
    indexes: [],
  });
  assertEquals(out.strategy, "select_then_write");
});

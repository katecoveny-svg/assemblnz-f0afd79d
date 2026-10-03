import type { createClient as realCreateClient } from "npm:@supabase/supabase-js@2.45.0";
export const writes: Array<{ table: string; values: Record<string, unknown> }> = [];
export const calls: string[] = [];
export const rpcState = { returnedError: false, throws: false, statusZero: false };
export const documentState = { existing: null as null | { id: string; content_hash: string }, legacy: false };
export const faultState = { stage: "", mode: "" as "" | "returned" | "throw" | "status0", afterCommit: false, concurrentLater: false, beforeSourceFinish: false, timestampCollision: false };
export const source = {
  id: "fixture-source", url: "https://example.org/feed", name: "Fixture", type: "fixture",
  config: {} as Record<string, unknown>, last_checked_at: "2026-10-03T01:00:00Z",
  last_successful_fetch: "2026-09-13T22:50:03.788Z", last_updated_at: "2026-09-13T22:50:03.788Z", status: "error",
};
export function reset() {
  writes.length = 0; calls.length = 0;
  Object.assign(source, { status: "error", config: {}, last_checked_at: "2026-10-03T01:00:00Z", last_successful_fetch: "2026-09-13T22:50:03.788Z", last_updated_at: "2026-09-13T22:50:03.788Z" });
  Object.assign(faultState, { stage: "", mode: "", afterCommit: false, concurrentLater: false, beforeSourceFinish: false, timestampCollision: false });
  Object.assign(documentState, { existing: null, legacy: false });
  Object.assign(rpcState, { returnedError: false, throws: false, statusZero: false });
}
function createStub() {
  return {
    from(table: string) {
      let operation = "read";
      let values: Record<string, unknown> = {};
      let limited = false;
      const filters: Array<[string, unknown]> = [];
      const execute = async () => {
        const stage = table === "kb_sources" ? operation === "read" ? "source_lookup" : values.status === "ok" ? "source_finish" : "source_failure" :
          table === "kb_source_runs" ? operation === "insert" ? "run_start" : values.status === "ok" ? "run_finish" : "run_failure" :
          table === "kb_changes" ? "change_insert" : operation === "read" ? limited ? "identity_lookup" : "document_lookup" : operation === "insert" ? "document_insert" : "document_update";
        calls.push(stage);
        if (stage === "source_finish" && faultState.beforeSourceFinish) Object.assign(source, { status: "ok", last_checked_at: faultState.timestampCollision ? source.last_checked_at : "2026-10-03T02:00:00Z", last_updated_at: "2026-10-03T02:00:00Z", last_successful_fetch: "2026-10-03T02:00:00Z" });
        const apply = () => {
          if (operation !== "read") writes.push({ table, values });
          if (table === "kb_sources" && operation === "update") {
            if (!filters.every(([field, expected]) => field === "id" ? expected === source.id : (source as unknown as Record<string, unknown>)[field] === expected)) return { data: null, error: { code: "PGRST116" } };
            Object.assign(source, values);
          }
          if (stage === "run_finish") source.last_successful_fetch = String(values.finished_at);
          const data = stage === "source_lookup" ? { ...source } : stage === "document_lookup" ? documentState.existing : stage === "identity_lookup" ? documentState.legacy ? { id: "legacy" } : null : { id: 1 };
          return { data, error: null };
        };
        if (faultState.stage === stage) {
          if (faultState.concurrentLater) Object.assign(source, { status: "ok", last_checked_at: "2026-10-03T02:00:00Z", last_successful_fetch: "2026-10-03T02:00:00Z", last_updated_at: "2026-10-03T02:00:00Z" });
          if (faultState.afterCommit) apply();
          if (faultState.mode === "throw") throw new Error("fixture transport throw");
          return { data: null, error: { code: "XX000" }, status: faultState.mode === "status0" ? 0 : 500 };
        }
        return apply();
      };
      const query = {
        select(_columns?: string) { return query; },
        eq(field: string, value: unknown) { filters.push([field, value]); return query; },
        is(field: string, value: unknown) { filters.push([field, value]); return query; },
        or(_filter: string) { return query; },
        limit(_count: number) { limited = true; return query; },
        insert(input: Record<string, unknown>) { operation = "insert"; values = input; return query; },
        update(input: Record<string, unknown>) { operation = "update"; values = input; return query; },
        single() { return execute(); },
        maybeSingle() { return execute(); },
        then(resolve: (value: unknown) => unknown, reject?: (error: unknown) => unknown) { return execute().then(resolve, reject); },
      };
      return query;
    },
    rpc() {
      if (rpcState.throws) throw new Error("fixture RPC transport throw");
      calls.push("failure_counter");
      return Promise.resolve({ error: rpcState.returnedError || rpcState.statusZero ? { code: "PGRST202" } : null, status: rpcState.statusZero ? 0 : 200 });
    },
  };
}
export const createClient = createStub as unknown as typeof realCreateClient;

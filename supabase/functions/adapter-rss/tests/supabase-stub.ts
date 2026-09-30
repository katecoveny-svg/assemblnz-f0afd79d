import type { createClient as realCreateClient } from "npm:@supabase/supabase-js@2.45.0";
export const writes: Array<{ table: string; values: Record<string, unknown> }> = [];
export const source = {
  id: "fixture-source", url: "https://example.org/feed", name: "Fixture",
  last_successful_fetch: "2026-09-13T22:50:03.788Z",
  last_updated_at: "2026-09-13T22:50:03.788Z", status: "error",
};
function createStub() {
  return {
    from(table: string) {
      let operation = "read";
      const query = {
        select() { return query; },
        eq() { return query; },
        insert(values: Record<string, unknown>) {
          operation = "insert";
          writes.push({ table, values });
          return query;
        },
        update(values: Record<string, unknown>) {
          operation = "update";
          writes.push({ table, values });
          return query;
        },
        single() {
          return Promise.resolve({ data: table === "kb_sources" ? source : { id: 1 }, error: null });
        },
        then(resolve: (value: unknown) => unknown) {
          if (table === "kb_sources" && operation === "update") {
            Object.assign(source, writes.findLast((entry) => entry.table === table)?.values);
          }
          return Promise.resolve(resolve({ data: null, error: null }));
        },
      };
      return query;
    },
    rpc() { return Promise.resolve({ error: null }); },
  };
}

// Keep the handler checked against the real client contract, with a local test implementation.
export const createClient = createStub as unknown as typeof realCreateClient;

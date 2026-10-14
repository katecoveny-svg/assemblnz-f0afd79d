import { source, writes } from "./supabase-stub.ts";
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
Deno.test("actual JSON handler distinguishes invalid envelopes from true empty collections", async () => {
  let handler: ((request: Request) => Response | Promise<Response>) | undefined;
  const original = { serve: Deno.serve, fetch: globalThis.fetch, env: Deno.env.get };
  try {
    Deno.serve = ((callback: typeof handler) => { handler = callback; }) as unknown as typeof Deno.serve;
    Deno.env.get = () => "fictional-test-value";
    await import("../index.ts");
    assert(handler, "handler must be captured");
    for (const [config, body, valid] of [
      [{}, { error: "fixture" }, false],
      [{ path: "features" }, { unrelated: [] }, false],
      [{ path: "features" }, [{ id: "wrong path" }], false],
      [{ path: "features" }, { features: [null] }, false],
      [{}, [{ id: "fixture", date: "not-a-date" }], false],
      [{ path: "features" }, { features: [] }, true],
      [{}, [], true],
    ] as const) {
      writes.length = 0;
      source.config = config;
      source.status = "error";
      globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }));
      const response = await handler(new Request("https://example.org/json", { method: "POST", body: JSON.stringify({ source_id: source.id }) }));
      const result = await response.json();
      assert(response.status === (valid ? 200 : 500), "invalid shape must fail; genuine empty collection succeeds");
      assert(result.ok === valid, "truthful response");
      assert(source.status === (valid ? "ok" : "error"), "truthful source health");
      assert(source.last_updated_at === "2026-09-13T22:50:03.788Z", "no-result or failed check must not advance content freshness");
      assert(!writes.some((entry) => entry.table === "kb_documents"), "no invented documents");
      const finished = writes.find((entry) => entry.table === "kb_source_runs" && entry.values.finished_at);
      assert(finished?.values.status === (valid ? "ok" : "error"), "last-success trigger gets truthful run state");
      if (valid) assert(result.collection_state === "no_results", "valid empty array is explicit no-results");
    }
  } finally { Deno.serve = original.serve; globalThis.fetch = original.fetch; Deno.env.get = original.env; }
});

import { source, writes } from "./supabase-stub.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("actual handler rejects blocked poll without marking stale data current", async () => {
  let handler: ((request: Request) => Response | Promise<Response>) | undefined;
  const originalServe = Deno.serve;
  const originalFetch = globalThis.fetch;
  const originalEnvGet = Deno.env.get;
  try {
    // Capture the real entrypoint without listening or connecting to any database.
    Deno.serve = ((callback: typeof handler) => { handler = callback; }) as unknown as typeof Deno.serve;
    Deno.env.get = () => "fictional-test-value";
    globalThis.fetch = () => Promise.resolve(new Response(
      '<html><script async></script><iframe src="/_Incapsula_Resource?token=private"></iframe></html>',
      { status: 200, headers: { "Content-Type": "text/html" } },
    ));
    await import("../index.ts");
    assert(handler, "entrypoint must register its handler");
    const response = await handler(new Request("https://example.org/adapter-rss", {
      method: "POST", body: JSON.stringify({ source_id: source.id }),
    }));
    assert(response.status === 500, "blocked poll must fail");
    assert((await response.json()).ok === false, "response must not claim success");
    assert(source.status === "error", "recent check must leave health in error");
    assert(source.last_successful_fetch === "2026-09-13T22:50:03.788Z", "last success must remain intact");
    assert(source.last_updated_at === "2026-09-13T22:50:03.788Z", "document freshness must remain intact");
    const sourceWrite = writes.find((entry) => entry.table === "kb_sources");
    assert(sourceWrite?.values.last_checked_at, "attempt timestamp must still be recorded");
    assert(!writes.some((entry) => entry.table === "kb_documents" || entry.table === "kb_changes"), "challenge must never become a document");
    const finishedRun = writes.find((entry) => entry.table === "kb_source_runs" && entry.values.finished_at);
    assert(finishedRun?.values.status === "error", "reliability trigger must receive an error run");
    const error = finishedRun.values.error as Record<string, unknown>;
    assert(error.code === "feed_upstream_blocked", "run must identify upstream blocking");
    assert(error.http_status === 200 && error.content_type === "text/html", "run must retain safe format diagnostics");
    assert(!JSON.stringify(writes).includes("private"), "challenge token must not enter telemetry");
  } finally {
    Deno.serve = originalServe;
    Deno.env.get = originalEnvGet;
    globalThis.fetch = originalFetch;
  }
});

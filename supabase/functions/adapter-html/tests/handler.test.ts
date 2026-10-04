import { documentState, source, writes } from "./supabase-stub.ts";
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
Deno.test("actual HTML handler separates source-page observation from unknown publication", async () => {
  let handler: ((request: Request) => Response | Promise<Response>) | undefined;
  const original = { serve: Deno.serve, fetch: globalThis.fetch, env: Deno.env.get };
  try {
    Deno.serve = ((callback: typeof handler) => { handler = callback; }) as unknown as typeof Deno.serve;
    Deno.env.get = (key) => key === "FIRECRAWL_API_KEY" ? undefined : "fictional-test-value";
    globalThis.fetch = (url) => {
      assert(url === source.url, "fixture must not attempt a scraper/provider substitution");
      return Promise.resolve(new Response('<html><body>Fixture page</body></html>', { headers: { "Content-Type": "text/html" } }));
    };
    await import("../index.ts");
    assert(handler, "handler must be captured");
    const hashBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("Fixture page"));
    const unchangedHash = Array.from(new Uint8Array(hashBytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    for (const mode of ["new", "changed", "unchanged"]) {
      writes.length = 0;
      documentState.existing = mode === "new" ? null : { id: "fixture-doc", content_hash: mode === "changed" ? "old" : unchangedHash };
      const response = await handler(new Request("https://example.org/html", { method: "POST", body: JSON.stringify({ source_id: source.id }) }));
      assert(response.status === 200, "valid fixture page should be observed");
      const document = writes.find((entry) => entry.table === "kb_documents");
      assert(document, "page observation must be recorded");
      if (mode === "unchanged") assert(!("published_at" in document.values), "unchanged historical date must not be rewritten");
      else assert(document.values.published_at === null, "new/changed snapshots must keep publication unknown");
      const metadata = document.values.metadata as Record<string, unknown>;
      assert(metadata.extraction_scope === "source_page", "not a structured event");
      assert(metadata.publication_date_state === "unknown", "observation time is not publisher evidence");
      assert(typeof metadata.observed_at === "string", "retain fetched/observed timestamp separately");
      assert(metadata.observation_type === "source_page_snapshot", "preserve snapshot semantics");
    }
  } finally { Deno.serve = original.serve; globalThis.fetch = original.fetch; Deno.env.get = original.env; }
});

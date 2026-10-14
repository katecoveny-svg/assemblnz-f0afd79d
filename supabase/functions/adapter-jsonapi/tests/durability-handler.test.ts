import { calls, documentState, faultState, reset, rpcState, source, writes } from "./supabase-stub.ts";
function lastSuccessfulFetch(): string { return source.last_successful_fetch; }
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
Deno.test("actual jsonapi durability faults stop success and expose uncertainty", async () => {
  let handler: ((request: Request) => Response | Promise<Response>) | undefined;
  const original = { serve: Deno.serve, fetch: globalThis.fetch, env: Deno.env.get };
  try {
    Deno.serve = ((callback: typeof handler) => { handler = callback; }) as unknown as typeof Deno.serve;
    Deno.env.get = (key) => key === "FIRECRAWL_API_KEY" ? undefined : "fictional-test-value";
    await import("../index.ts");
    assert(handler, "handler must be captured");
    const validBody = JSON.stringify([{ id: "fixture-item", title: "Fixture item", description: "Fixture content" }]);
    const mime = "application/json";
    const call = () => handler!(new Request("https://example.org/test", { method: "POST", body: JSON.stringify({ source_id: source.id }) }));
    const upstream = () => { globalThis.fetch = () => Promise.resolve(new Response(validBody, { headers: { "Content-Type": mime } })); };
    for (const stage of ["source_lookup", "run_start", "document_lookup", "document_insert", "document_update", "change_insert", "source_finish", "run_finish"]) {
      for (const mode of ["returned", "throw", "status0"] as const) {
        reset(); upstream();
        if (stage === "document_update") documentState.existing = { id: "existing", content_hash: "old" };
        Object.assign(faultState, { stage, mode });
        const response = await call(); const result = await response.json();
        assert(response.status === 500 && result.ok === false, `${stage}/${mode} must not claim success`);
        assert(source.last_successful_fetch === "2026-09-13T22:50:03.788Z", "known uncommitted fixture must retain last success");
        if (mode !== "returned") {
          assert(calls.at(-1) === stage, "unknown ACK must stop all subsequent writes");
          assert(result.completion_state === (["source_finish", "run_finish"].includes(stage) ? "finalization_unknown" : "persistence_unknown"), "unknown commit must be explicit");
        } else {
          assert(!calls.slice(calls.indexOf(stage) + 1).includes("run_finish"), "returned error stops successful finalization");
          if (stage !== "run_finish") assert(source.last_updated_at === "2026-09-13T22:50:03.788Z", "before source completion, known failures retain content timestamp");
        }
        if (stage === "document_insert") assert(result.confirmed_document_writes === 0 && result.document_write_attempts === 1 && result.unknown_document_writes === (mode !== "returned" ? 1 : 0), "attempt, confirmation and unknown commit must be distinct");
      }
    }
    for (const stage of ["source_failure", "run_failure"]) {
      for (const mode of ["returned", "throw", "status0"] as const) {
        reset(); Object.assign(faultState, { stage, mode });
        globalThis.fetch = () => Promise.resolve(new Response("{invalid JSON", { headers: { "Content-Type": mime } }));
        const response = await call(); const result = await response.json();
        assert(response.status === 500 && result.ok === false, "failure-recording fault cannot become success");
        assert(result.audit_persistence[stage === "source_failure" ? "source" : "run"] === "unconfirmed", "failed failure-recording must be explicit");
        if (mode !== "returned") assert(calls.at(-1) === stage, "unknown failure-recording ACK stops subsequent writes");
        assert(source.last_successful_fetch === "2026-09-13T22:50:03.788Z", "failure-recording must never overwrite success timestamp");
      }
    }
    reset(); upstream(); Object.assign(faultState, { stage: "run_finish", mode: "returned", concurrentLater: true });
    const concurrent = await (await call()).json();
    assert(concurrent.ok === false && concurrent.audit_persistence.source === "unconfirmed", "old failure cannot claim source rollback after another poll");
    assert(source.last_checked_at === "2026-10-03T02:00:00Z" && source.last_updated_at === "2026-10-03T02:00:00Z" && source.last_successful_fetch === "2026-10-03T02:00:00Z" && source.status === "ok", "cursor guard must preserve a newer success");
    assert(calls.filter((stage) => stage === "run_finish").length === 1, "known failure never attempts a later success write");
    reset(); upstream(); faultState.stage = "document_insert"; faultState.mode = "returned"; rpcState.statusZero = true;
    const counterUnknown = await (await call()).json();
    assert(counterUnknown.completion_state === "failure_counter_unknown" && calls.at(-1) === "failure_counter", "resolved RPC status zero stops run failure and every subsequent write");
    for (const timestampCollision of [false, true]) {
      reset(); upstream(); Object.assign(faultState, { beforeSourceFinish: true, timestampCollision, stage: "run_finish", mode: "returned" });
      const beforeFinish = await (await call()).json();
      assert(beforeFinish.ok === false, "superseded poll must not claim success");
      assert(!calls.includes("run_finish"), "snapshot CAS must stop before successful run finalization");
      assert(source.last_updated_at === "2026-10-03T02:00:00Z" && source.last_successful_fetch === "2026-10-03T02:00:00Z" && source.status === "ok", "CAS protects newer success even with equal check timestamps");
    }
    // A run write can commit and trigger freshness before its ACK is lost.
    reset(); upstream(); Object.assign(faultState, { stage: "run_finish", mode: "throw", afterCommit: true });
    const uncertain = await (await call()).json();
    assert(uncertain.completion_state === "finalization_unknown", "post-commit lost ACK cannot become success");
    assert(lastSuccessfulFetch() !== "2026-09-13T22:50:03.788Z", "fixture proves JS cannot promise unchanged timestamp after unknown commit");
    assert(calls.at(-1) === "run_finish", "do not compensate or overwrite a remotely committed success");
    reset(); upstream(); Object.assign(faultState, { stage: "run_finish", mode: "status0", afterCommit: true });
    const resolvedUnknown = await (await call()).json();
    assert(resolvedUnknown.completion_state === "finalization_unknown" && calls.at(-1) === "run_finish", "resolved status zero cannot compensate or rewrite a committed success");
    // Populated success cases exercise insert, changed content, and unchanged metadata.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("Fixture content"));
    const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    for (const mode of ["returned", "throw", "status0"] as const) {
      reset(); upstream(); documentState.existing = { id: "existing", content_hash: hash };
      Object.assign(faultState, { stage: "document_update", mode });
      const response = await call(); const result = await response.json();
      assert(response.status === 500 && result.ok === false, "unchanged metadata durability failure cannot become success");
      assert(result.confirmed_document_writes === 0 && result.document_write_attempts === 1, "metadata attempt is not confirmation");
    }
    for (const kind of ["new", "changed", "unchanged"]) {
      reset(); upstream(); documentState.existing = kind === "new" ? null : { id: "existing", content_hash: kind === "changed" ? "old" : hash };
      const response = await call(); const result = await response.json();
      assert(response.status === 200 && result.ok === true, `${kind} populated fixture must succeed`);
      assert(calls.at(-1) === "run_finish", "only acknowledge success after checked durable completion");
      assert(result.added === (kind === "new" ? 1 : 0), "insert count must match fixture");
      assert(result.updated === (kind === "changed" ? 1 : 0), "change count must match fixture");
    }
    reset();
    globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify([{ id: "valid" }, { id: "invalid", date: "not-a-date" }]), { headers: { "Content-Type": mime } }));
    assert((await call()).status === 500, "second invalid item must fail whole normalization");
    assert(!writes.some((entry) => entry.table === "kb_documents"), "preflight every item before any document write");
    for (const nested of [{ path: "features", payload: { features: [{ type: "Feature", properties: { publicID: "fixture" } }] } }, { path: "vulnerabilities", payload: { vulnerabilities: [{ cve: { id: "CVE-2026-12345" } }] } }]) {
      reset(); source.config = { path: nested.path }; documentState.legacy = true;
      globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(nested.payload), { headers: { "Content-Type": mime } }));
      const legacy = await (await call()).json();
      assert(legacy.error_code === "identity_reconciliation_needed", "legacy algorithm transition requires explicit reconciliation");
      assert(!writes.some((entry) => entry.table === "kb_documents"), "no implicit duplicate insertion/merge/deletion");
    }

  } finally { Deno.serve = original.serve; globalThis.fetch = original.fetch; Deno.env.get = original.env; }
});

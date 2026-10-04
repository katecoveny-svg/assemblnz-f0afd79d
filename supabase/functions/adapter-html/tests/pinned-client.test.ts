import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { durable, DurabilityError } from "../durability.ts";
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
Deno.test("pinned client resolved transport faults are unknown and stop subsequent mutations", async () => {
  // Actual pinned SDK, custom fetch only; no network, database, provider, env or server.
  for (const stage of ["document_insert", "source_finish", "run_finish", "failure_counter"]) {
    for (const fault of ["fetch", "body_read", "invalid_json"]) {
      let calls = 0;
      let remotelyCommitted = false;
      const client = createClient("https://fixture.invalid", "fictional-key", {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: async () => {
          calls++; remotelyCommitted = true;
          if (fault === "fetch") throw new TypeError("fixture lost ACK");
          if (fault === "body_read") return {
            ok: true, status: 200, statusText: "OK", headers: new Headers(),
            text: () => Promise.reject(new TypeError("fixture body lost")),
          } as Response;
          return new Response("{invalid", { status: 200 });
        } },
      });
      const operation = stage === "failure_counter" ? client.rpc("kb_inc_failures", { p_source: "fixture" }) :
        stage === "document_insert" ? client.from("kb_documents").insert({ title: "Fixture" }).select("id").single() :
        client.from(stage === "source_finish" ? "kb_sources" : "kb_source_runs").update({ status: "ok" }).eq("id", "fixture").select("id").single();
      let caught: unknown;
      try {
        await durable(operation, stage);
        await durable(client.from("kb_source_runs").update({ status: "error" }).eq("id", "fixture").select("id").single(), "must_not_execute");
      } catch (error) { caught = error; }
      assert(caught instanceof DurabilityError && caught.uncertain && caught.stage === stage, `${stage}/${fault}: status zero must be unknown`);
      assert(calls === 1 && remotelyCommitted, "unknown ACK must stop further requests even if the first write committed");
    }
  }
  const client = createClient("https://fixture.invalid", "fictional-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async () => new Response(JSON.stringify({ code: "23514", message: "fixture constraint" }), { status: 400 }) },
  });
  let caught: unknown;
  try { await durable(client.from("kb_sources").update({ status: "ok" }).eq("id", "fixture").select("id").single(), "source_finish"); }
  catch (error) { caught = error; }
  assert(caught instanceof DurabilityError && !caught.uncertain, "acknowledged database error remains a known failure");
});

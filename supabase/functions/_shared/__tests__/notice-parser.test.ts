// Deno tests for notice-parser pure helpers (validateAction, stripJsonFences).
// The LLM-calling `parseNotice` is exercised by integration tests with a
// mocked fetch, not here.
//
// Run with: deno test supabase/functions/_shared/__tests__/notice-parser.test.ts

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { stripJsonFences, validateAction } from "../notice-parser.ts";

// ─── stripJsonFences ─────────────────────────────────────────────────────

Deno.test("stripJsonFences: strips ```json …``` fences", () => {
  const raw = "```json\n{\"actions\":[]}\n```";
  assertEquals(stripJsonFences(raw), "{\"actions\":[]}");
});

Deno.test("stripJsonFences: strips bare ``` fences", () => {
  const raw = "```\n{\"actions\":[]}\n```";
  assertEquals(stripJsonFences(raw), "{\"actions\":[]}");
});

Deno.test("stripJsonFences: passes raw JSON through untouched", () => {
  assertEquals(stripJsonFences("{\"actions\":[]}"), "{\"actions\":[]}");
});

Deno.test("stripJsonFences: trims surrounding whitespace", () => {
  assertEquals(stripJsonFences("   {\"x\":1}\n\n"), "{\"x\":1}");
});

// ─── validateAction: positive paths ──────────────────────────────────────

Deno.test("validateAction: accepts a well-formed calendar event", () => {
  const r = validateAction({
    type: "event.calendar",
    kid_name: "Jack",
    title: "Athletics Day",
    starts_at: "2026-05-20T09:00:00",
    location: "Sacred Heart fields",
    dress_code: "PE gear",
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  assertEquals(r.value.type, "event.calendar");
});

Deno.test("validateAction: accepts a well-formed payment with bank account", () => {
  const r = validateAction({
    type: "event.payment",
    kid_name: "Mila",
    title: "Camp deposit",
    amount_nzd: 95.0,
    due_date: "2026-05-23",
    recipient: "Sacred Heart College",
    bank_account: "03-1234-5678901-00",
    reference: "MILA-HUDSON",
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  assertEquals(r.value.type, "event.payment");
});

Deno.test("validateAction: accepts a well-formed gear list", () => {
  const r = validateAction({
    type: "event.gear",
    kid_name: "Mila",
    date: "2026-05-15",
    items: ["togs", "towel"],
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  assertEquals(r.value.type, "event.gear");
});

Deno.test("validateAction: accepts a well-formed permission slip", () => {
  const r = validateAction({
    type: "event.permission",
    kid_name: "Jack",
    title: "Trip to Te Papa",
    deadline: "2026-05-18",
    needs_signature: true,
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  assertEquals(r.value.type, "event.permission");
});

Deno.test("validateAction: accepts a well-formed transition", () => {
  const r = validateAction({
    type: "event.transition",
    kid_name: "Mila",
    description: "Moves into senior swim squad",
    takes_effect_on: "2026-06-01",
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  assertEquals(r.value.type, "event.transition");
});

// ─── validateAction: negative paths ──────────────────────────────────────

Deno.test("validateAction: rejects unknown action type", () => {
  const r = validateAction({ type: "event.bogus" });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason.startsWith("unknown type"), true);
});

Deno.test("validateAction: rejects payment with non-positive amount", () => {
  const r = validateAction({
    type: "event.payment",
    kid_name: "Jack",
    title: "Camp",
    amount_nzd: 0,
    due_date: "2026-05-23",
    recipient: "Sacred Heart",
  });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason, "amount_nzd");
});

Deno.test("validateAction: rejects payment with malformed due_date", () => {
  const r = validateAction({
    type: "event.payment",
    kid_name: "Jack",
    title: "Camp",
    amount_nzd: 95.0,
    due_date: "23/05/2026", // DD/MM/YYYY — not ISO
    recipient: "Sacred Heart",
  });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason, "due_date");
});

Deno.test("validateAction: rejects gear with empty items", () => {
  const r = validateAction({
    type: "event.gear",
    kid_name: "Mila",
    date: "2026-05-15",
    items: [],
  });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason, "items");
});

Deno.test("validateAction: rejects permission missing needs_signature true", () => {
  const r = validateAction({
    type: "event.permission",
    kid_name: "Jack",
    title: "Trip",
    deadline: "2026-05-18",
    needs_signature: false,
  });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason, "needs_signature");
});

Deno.test("validateAction: rejects calendar with malformed starts_at", () => {
  const r = validateAction({
    type: "event.calendar",
    kid_name: null,
    title: "Hui",
    starts_at: "Friday 6pm",
  });
  if (r.ok) throw new Error("expected failure");
  assertEquals(r.reason, "starts_at");
});

Deno.test("validateAction: null kid_name accepted", () => {
  const r = validateAction({
    type: "event.calendar",
    kid_name: null,
    title: "Whānau hui",
    starts_at: "2026-05-22T18:00:00",
  });
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
});

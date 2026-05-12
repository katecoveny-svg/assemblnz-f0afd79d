// Deno tests for agentmail-inbound/lib.ts pure helpers.
// Run with: deno test supabase/functions/agentmail-inbound/__tests__/lib.test.ts

import { assertEquals, assertStringIncludes }
  from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  parseRecipient,
  clampConfidence,
  guessSchool,
  renderDraftBody,
} from "../lib.ts";
import type {
  CalendarAction,
  PaymentAction,
  GearAction,
  PermissionAction,
  TransitionAction,
} from "../../_shared/notice-parser.ts";

// ─── parseRecipient ───────────────────────────────────────────────────────

Deno.test("parseRecipient: bare slug local-part", () => {
  const r = parseRecipient("term-hudson@toro.nz", "toro.nz");
  assertEquals(r, { whanau_id: "hudson" });
});

Deno.test("parseRecipient: uuid local-part", () => {
  const r = parseRecipient(
    "term-550e8400-e29b-41d4-a716-446655440000@toro.nz",
    "toro.nz",
  );
  assertEquals(r, { whanau_id: "550e8400-e29b-41d4-a716-446655440000" });
});

Deno.test("parseRecipient: name-decorated address form", () => {
  const r = parseRecipient(
    'Kate Hudson <term-hudson@toro.nz>',
    "toro.nz",
  );
  assertEquals(r, { whanau_id: "hudson" });
});

Deno.test("parseRecipient: mixed-case input is lowercased", () => {
  const r = parseRecipient("Term-Hudson@TORO.NZ", "toro.nz");
  assertEquals(r, { whanau_id: "hudson" });
});

Deno.test("parseRecipient: domain mismatch", () => {
  const r = parseRecipient("term-hudson@example.com", "toro.nz");
  if (!("error" in r)) throw new Error("expected error");
  assertStringIncludes(r.error, "domain mismatch");
});

Deno.test("parseRecipient: wrong local-part prefix", () => {
  const r = parseRecipient("kid-hudson@toro.nz", "toro.nz");
  if (!("error" in r)) throw new Error("expected error");
  assertStringIncludes(r.error, "must start with");
});

Deno.test("parseRecipient: empty whanau_id rejected", () => {
  const r = parseRecipient("term-@toro.nz", "toro.nz");
  if (!("error" in r)) throw new Error("expected error");
  assertStringIncludes(r.error, "empty whanau_id");
});

Deno.test("parseRecipient: malformed address with no @ rejected", () => {
  const r = parseRecipient("term-hudson", "toro.nz");
  if (!("error" in r)) throw new Error("expected error");
  assertStringIncludes(r.error, "no @");
});

// ─── clampConfidence ─────────────────────────────────────────────────────

Deno.test("clampConfidence: clamps to [0, 1] and rounds to 2 dp", () => {
  assertEquals(clampConfidence(0.123456), 0.12);
  assertEquals(clampConfidence(1.5), 1);
  assertEquals(clampConfidence(-0.2), 0);
  assertEquals(clampConfidence(Number.NaN), 0);
  assertEquals(clampConfidence(Number.POSITIVE_INFINITY), 0);
});

// ─── guessSchool ─────────────────────────────────────────────────────────

Deno.test("guessSchool: detects Sacred Heart from subject or sender", () => {
  assertEquals(
    guessSchool("Term 2 newsletter", "newsletter@sacredheart.school.nz"),
    "Sacred Heart College",
  );
  assertEquals(
    guessSchool("Sacred Heart College — Term 2 newsletter", "noreply@hero.co.nz"),
    "Sacred Heart College",
  );
});

Deno.test("guessSchool: detects Baradene", () => {
  assertEquals(
    guessSchool("Baradene weekly update", "office@baradene.school.nz"),
    "Baradene College",
  );
});

Deno.test("guessSchool: returns null for unknown sources", () => {
  assertEquals(guessSchool("Random thing", "someone@example.com"), null);
});

// ─── renderDraftBody ─────────────────────────────────────────────────────

Deno.test("renderDraftBody: parse_failed fallback explains and keeps the inbound", () => {
  const out = renderDraftBody({
    schoolGuess: "Sacred Heart College",
    parseStatus: "parse_failed",
    actions: [],
    confidence: 0,
  });
  assertStringIncludes(out, "Sacred Heart College");
  assertStringIncludes(out, "couldn't extract structured actions");
  assertStringIncludes(out, "Tōro draft, ready for your review.");
});

Deno.test("renderDraftBody: empty actions but parsed — files for context", () => {
  const out = renderDraftBody({
    schoolGuess: null,
    parseStatus: "parsed",
    actions: [],
    confidence: 0.9,
  });
  assertStringIncludes(out, "Nothing actionable");
  assertStringIncludes(out, "Tōro draft, ready for your review.");
});

Deno.test("renderDraftBody: full mix of action types renders each block", () => {
  const calendar: CalendarAction = {
    type: "event.calendar",
    kid_name: "Jack",
    title: "Athletics Day",
    starts_at: "2026-05-20T09:00:00",
    location: "Sacred Heart fields",
    dress_code: "PE gear",
  };
  const payment: PaymentAction = {
    type: "event.payment",
    kid_name: "Jack",
    title: "Year 9 camp deposit",
    amount_nzd: 95.0,
    due_date: "2026-05-23",
    recipient: "Sacred Heart College",
    bank_account: "03-1234-5678901-00",
    reference: "JACK-HUDSON",
  };
  const gear: GearAction = {
    type: "event.gear",
    kid_name: "Mila",
    date: "2026-05-15",
    items: ["togs", "towel", "goggles"],
  };
  const permission: PermissionAction = {
    type: "event.permission",
    kid_name: "Jack",
    title: "Trip to Te Papa",
    deadline: "2026-05-18",
    needs_signature: true,
  };
  const transition: TransitionAction = {
    type: "event.transition",
    kid_name: "Mila",
    description: "Moves into the senior swimming squad",
    takes_effect_on: "2026-06-01",
  };

  const out = renderDraftBody({
    schoolGuess: "Sacred Heart College",
    parseStatus: "parsed",
    actions: [calendar, payment, gear, permission, transition],
    confidence: 0.85,
  });

  assertStringIncludes(out, "Athletics Day");
  assertStringIncludes(out, "$95.00");
  assertStringIncludes(out, "03-1234-5678901-00");
  assertStringIncludes(out, "togs, towel, goggles");
  assertStringIncludes(out, "Trip to Te Papa");
  assertStringIncludes(out, "senior swimming squad");
  // High confidence => no "double-check" callout.
  assertEquals(out.includes("double-check"), false);
});

Deno.test("renderDraftBody: low confidence appends double-check callout", () => {
  const calendar: CalendarAction = {
    type: "event.calendar",
    kid_name: null,
    title: "Whānau hui",
    starts_at: "2026-05-22T18:00:00",
  };
  const out = renderDraftBody({
    schoolGuess: null,
    parseStatus: "parsed",
    actions: [calendar],
    confidence: 0.55,
  });
  assertStringIncludes(out, "55%");
  assertStringIncludes(out, "double-check");
});

Deno.test("renderDraftBody: null kid_name renders as whānau", () => {
  const payment: PaymentAction = {
    type: "event.payment",
    kid_name: null,
    title: "Donation",
    amount_nzd: 30.0,
    due_date: "2026-05-25",
    recipient: "Sacred Heart College",
  };
  const out = renderDraftBody({
    schoolGuess: null,
    parseStatus: "parsed",
    actions: [payment],
    confidence: 0.9,
  });
  assertStringIncludes(out, "whānau");
});

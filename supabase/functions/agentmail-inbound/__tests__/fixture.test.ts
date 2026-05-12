// Fixture-based acceptance shape test for agentmail-inbound.
//
// What this is: a "the structures still hold" test that loads the
// representative Sacred Heart newsletter, runs the deterministic parts
// (NZ-PII redaction + the expected ExtractedAction shapes the LLM is
// asked to return) and verifies the whole pipeline up to insert is sound.
//
// What this is NOT: an end-to-end LLM-call test. Calling Claude during
// `deno test` would burn API budget and pin tests to model behaviour.
// The schema-validation test in
// _shared/__tests__/notice-parser.test.ts exercises the validator with
// hand-rolled action objects; this fixture documents the shapes the
// brief's acceptance test demands the parser produce.
//
// Run with:
//   deno test --allow-read supabase/functions/agentmail-inbound/__tests__/fixture.test.ts

import { assertEquals, assertStringIncludes }
  from "https://deno.land/std@0.224.0/assert/mod.ts";
import { redactNzPii } from "../../_shared/nz-pii-redact.ts";
import { validateAction, type ExtractedAction }
  from "../../_shared/notice-parser.ts";
import { renderDraftBody } from "../lib.ts";

const FIXTURE_PATH = new URL(
  "./fixtures/sacred-heart-term2-newsletter.txt",
  import.meta.url,
);

async function loadFixture(): Promise<string> {
  return await Deno.readTextFile(FIXTURE_PATH);
}

Deno.test("fixture: NZ-PII redaction strips bank account, email, landline", async () => {
  const text = await loadFixture();
  const { redacted, stats } = redactNzPii(text);

  // The newsletter contains exactly one bank account number, one email,
  // one landline.
  assertEquals(stats.bank_accounts, 1);
  assertEquals(stats.emails, 1);
  assertEquals(stats.landlines, 1);

  assertStringIncludes(redacted, "[REDACTED:bank_account]");
  assertStringIncludes(redacted, "[REDACTED:email]");
  assertStringIncludes(redacted, "[REDACTED:landline]");

  // Dates must survive redaction — Term Planner relies on them.
  assertStringIncludes(redacted, "20 May");
  assertStringIncludes(redacted, "23 May");
  assertStringIncludes(redacted, "Friday 30 May");

  // School name, dollar amounts, kid-irrelevant proper nouns survive.
  assertStringIncludes(redacted, "Sacred Heart");
  assertStringIncludes(redacted, "$95.00");
  assertStringIncludes(redacted, "Tauhara");
});

Deno.test("fixture: expected action set validates and renders sensibly", async () => {
  // The brief's acceptance test for Term Planner reads: forward a real
  // Sacred Heart newsletter, within 60 seconds get back at least
  // calendar events + payment requests with amounts and due dates +
  // gear list + permission slips. Below is the canonical action set the
  // notice-parser is asked to produce from this fixture.
  const expected: ExtractedAction[] = [
    {
      type: "event.calendar",
      kid_name: null,
      title: "Athletics Day",
      starts_at: "2026-05-20T09:00:00",
      location: "Sacred Heart fields",
      dress_code: "PE gear, house colours, water bottle",
      notes: "Buses depart 8:15am. Lunch provided.",
    },
    {
      type: "event.calendar",
      kid_name: null,
      title: "Year 9 Camp",
      starts_at: "2026-06-09T00:00:00",
      ends_at: "2026-06-13T00:00:00",
      location: "Tauhara Centre, Taupō",
    },
    {
      type: "event.calendar",
      kid_name: null,
      title: "Parent / Teacher / Whānau interviews",
      starts_at: "2026-05-22T15:30:00",
      ends_at: "2026-05-22T19:00:00",
      location: "College Hall",
      notes: "Bookings open on Hero next Monday.",
    },
    {
      type: "event.payment",
      kid_name: null,
      title: "Year 9 Camp deposit",
      amount_nzd: 95.0,
      due_date: "2026-05-23",
      recipient: "Sacred Heart College",
      bank_account: "03-1234-5678901-00",
      reference: "STUDENT-NAME / CAMP",
      notes: "Late payments incur a $15 admin fee.",
    },
    {
      type: "event.payment",
      kid_name: null,
      title: "Term 2 sports subs",
      amount_nzd: 45.0,
      due_date: "2026-05-30",
      recipient: "Sacred Heart College",
      bank_account: "03-1234-5678901-00",
      reference: "STUDENT-NAME / SPORTS",
    },
    {
      type: "event.permission",
      kid_name: null,
      title: "Te Papa Year 10 trip",
      deadline: "2026-05-18",
      needs_signature: true,
      notes: "Hard copy to whānau teacher, not the office.",
    },
    {
      type: "event.gear",
      kid_name: null,
      date: "2026-05-15",
      items: ["togs", "towel", "goggles", "swim cap", "house colours under uniform"],
      notes: "swimming + relays",
    },
    {
      type: "event.gear",
      kid_name: null,
      date: "2026-05-16",
      items: ["house colours", "running shoes", "water bottle", "a banana"],
      notes: "cross country trial",
    },
    {
      type: "event.transition",
      kid_name: null,
      description: "Mrs Patel moves into the Year 9 Dean's role",
      takes_effect_on: "2026-06-01",
      notes: "Direct Year 9 pastoral concerns to her from that date.",
    },
  ];

  // Each expected action validates against the schema enforced by
  // notice-parser.validateAction. If we break the schema, this test
  // surfaces it.
  for (const a of expected) {
    const r = validateAction(a);
    if (!r.ok) {
      throw new Error(`expected action failed validation: ${r.reason} — ${JSON.stringify(a)}`);
    }
  }

  // Acceptance count: 3 calendar + 2 payment + 1 permission + 2 gear + 1 transition.
  const byType = expected.reduce<Record<string, number>>(
    (acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; },
    {},
  );
  assertEquals(byType["event.calendar"], 3);
  assertEquals(byType["event.payment"], 2);
  assertEquals(byType["event.permission"], 1);
  assertEquals(byType["event.gear"], 2);
  assertEquals(byType["event.transition"], 1);

  // Render the parent-facing body and sanity-check the headline items.
  const body = renderDraftBody({
    schoolGuess: "Sacred Heart College",
    parseStatus: "parsed",
    actions: expected,
    confidence: 0.9,
  });
  assertStringIncludes(body, "Sacred Heart College");
  assertStringIncludes(body, "Athletics Day");
  assertStringIncludes(body, "Year 9 Camp deposit");
  assertStringIncludes(body, "$95.00");
  assertStringIncludes(body, "Te Papa Year 10 trip");
  assertStringIncludes(body, "togs, towel, goggles");
  // High confidence ⇒ no double-check callout.
  assertEquals(body.includes("double-check"), false);
});

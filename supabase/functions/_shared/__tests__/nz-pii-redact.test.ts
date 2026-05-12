// Deno tests for nz-pii-redact.
// Run with: deno test supabase/functions/_shared/__tests__/nz-pii-redact.test.ts

import { assertEquals, assertStringIncludes }
  from "https://deno.land/std@0.224.0/assert/mod.ts";
import { redactNzPii } from "../nz-pii-redact.ts";

Deno.test("redacts NZ mobile numbers in common formats", () => {
  const cases = [
    "ring 021 234 5678",
    "ring 0212345678",
    "ring 022-345-6789",
    "ring +6427 123 4567",
  ];
  for (const c of cases) {
    const { redacted, stats } = redactNzPii(c);
    assertStringIncludes(redacted, "[REDACTED:mobile]");
    assertEquals(stats.mobiles, 1, `expected 1 mobile redaction in: ${c}`);
  }
});

Deno.test("redacts NZ landlines but not mobiles via same pattern", () => {
  const { redacted, stats } = redactNzPii("call (09) 123 4567 for the office");
  assertStringIncludes(redacted, "[REDACTED:landline]");
  assertEquals(stats.landlines, 1);
  assertEquals(stats.mobiles, 0);
});

Deno.test("does NOT redact bare year ranges or addresses that look phone-ish", () => {
  // "2024" / street numbers / NSNs shouldn't be touched.
  const inputs = [
    "Term 2 of 2026 starts Monday.",
    "Sacred Heart College, 250 West Tamaki Rd, Glendowie",
    "ID 12345678 is the student number",
  ];
  for (const i of inputs) {
    const { stats } = redactNzPii(i);
    assertEquals(
      stats.mobiles + stats.landlines + stats.ird_numbers + stats.bank_accounts,
      0,
      `expected zero redactions in: ${i}`,
    );
  }
});

Deno.test("redacts email addresses", () => {
  const { redacted, stats } = redactNzPii(
    "Email Mrs Patel at j.patel@sacredheart.school.nz for the form.",
  );
  assertStringIncludes(redacted, "[REDACTED:email]");
  assertEquals(stats.emails, 1);
});

Deno.test("redacts IRD numbers only when anchored on the IRD token", () => {
  const withCtx = redactNzPii("IRD 123-456-789 for the trip refund");
  assertStringIncludes(withCtx.redacted, "[REDACTED:ird]");
  assertEquals(withCtx.stats.ird_numbers, 1);

  // Same 8-9 digit pattern WITHOUT the IRD token should NOT trigger.
  const noCtx = redactNzPii("Order number 123-456-789 will be shipped tomorrow");
  assertEquals(noCtx.stats.ird_numbers, 0);
});

Deno.test("redacts NZ bank account numbers in canonical 4-section form", () => {
  const { redacted, stats } = redactNzPii(
    "Direct credit 12-3045-0789012-00 by Friday please.",
  );
  assertStringIncludes(redacted, "[REDACTED:bank_account]");
  assertEquals(stats.bank_accounts, 1);
});

Deno.test("does NOT redact kid names — those flow through to extracted_actions", () => {
  // Names are preserved by design — the notice parser needs them and stores
  // each action with kid_name; the retention class on the row is what
  // controls downstream exposure.
  const input = "Jack (Yr 9) and Mila (Yr 7) both need togs Wednesday.";
  const { redacted } = redactNzPii(input);
  assertStringIncludes(redacted, "Jack");
  assertStringIncludes(redacted, "Mila");
});

Deno.test("multi-pattern paragraph: counts each match once", () => {
  const input =
    "Pay 03-1234-5678901-00 by 18/05/2026, IRD 123-456-789 if asked, " +
    "ring 027 444 5566 or email kahu@sacredheart.school.nz.";
  const { redacted, stats } = redactNzPii(input);

  assertEquals(stats.bank_accounts, 1);
  assertEquals(stats.ird_numbers, 1);
  assertEquals(stats.mobiles, 1);
  assertEquals(stats.emails, 1);

  assertStringIncludes(redacted, "[REDACTED:bank_account]");
  assertStringIncludes(redacted, "[REDACTED:ird]");
  assertStringIncludes(redacted, "[REDACTED:mobile]");
  assertStringIncludes(redacted, "[REDACTED:email]");

  // Dates should pass through (term plan needs them for calendar events).
  assertStringIncludes(redacted, "18/05/2026");
});

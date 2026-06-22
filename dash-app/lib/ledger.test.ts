// Unit tests for the wallet ledger maths. Run with:  npm test
// Money logic must be exact — these guard against accidental balance bugs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { balanceOf, canRedeem, redemptionEntry, formatNZD } from "./ledger";

test("balance is the sum of entries", () => {
  const entries = [
    { amount_cents: 1, reason: "impression" },
    { amount_cents: 5, reason: "click" },
    { amount_cents: 1, reason: "impression" },
  ];
  assert.equal(balanceOf(entries), 7);
});

test("redemptions reduce the balance", () => {
  const entries = [
    { amount_cents: 600, reason: "impression" },
    redemptionEntry(500),
  ];
  assert.equal(balanceOf(entries), 100);
});

test("empty ledger is zero", () => {
  assert.equal(balanceOf([]), 0);
});

test("can redeem only at/above threshold and within balance", () => {
  assert.equal(canRedeem(1000, 500), true);   // ok
  assert.equal(canRedeem(1000, 1000), true);  // exactly balance
  assert.equal(canRedeem(1000, 1500), false); // more than balance
  assert.equal(canRedeem(1000, 499), false);  // below threshold
  assert.equal(canRedeem(1000, 0), false);    // zero
  assert.equal(canRedeem(400, 500), false);   // balance below threshold
});

test("redemption entry is negative", () => {
  assert.equal(redemptionEntry(500).amount_cents, -500);
  assert.equal(redemptionEntry(-500).amount_cents, -500); // always negative
});

test("formatNZD formats cents to dollars", () => {
  assert.equal(formatNZD(1234), "$12.34");
  assert.equal(formatNZD(5), "$0.05");
  assert.equal(formatNZD(0), "$0.00");
});

test("a full earn-then-redeem cycle nets correctly", () => {
  const entries: { amount_cents: number; reason: string }[] = [];
  for (let i = 0; i < 300; i++) entries.push({ amount_cents: 2, reason: "impression" }); // 600c earned
  const bal = balanceOf(entries);
  assert.equal(bal, 600);
  assert.equal(canRedeem(bal, 500), true);
  entries.push(redemptionEntry(500));
  assert.equal(balanceOf(entries), 100);
});

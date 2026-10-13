import { describe, expect, it } from "vitest";
import { dateIn, localDay, prepareWorksheet, worksheetItems } from "./worksheet";

// Tuesday 13 October 2026, 08:30 NZDT.
const now = new Date("2026-10-12T19:30:00Z");
const today = localDay(now, "Pacific/Auckland");
const base = { title: "Prepare my day", goal: "A short brief.", timezone: "Pacific/Auckland", now, trigger: "scheduled" as const };

describe("localDay", () => {
  it("uses the owner's calendar date, not the server's", () => {
    expect(today.toISOString()).toBe("2026-10-13T00:00:00.000Z");
    expect(localDay(now, "UTC").toISOString()).toBe("2026-10-12T00:00:00.000Z");
  });
});

describe("dateIn", () => {
  it.each([
    ["ISO dates", "Renew the WOF 2026-10-20", "2026-10-20"],
    ["NZ day/month", "Dentist 21/10", "2026-10-21"],
    ["NZ day/month/year", "Rates due 1/2/2027", "2027-02-01"],
    ["day and month", "Proposal due 16 Oct", "2026-10-16"],
    ["month and day", "Flight October 30th", "2026-10-30"],
    ["a day/month that just passed stays this year", "Pay the 10/10 invoice", "2026-10-10"],
    ["a day/month long past rolls to next year", "Birthday 3 Feb", "2027-02-03"],
    ["today", "Call the school today", "2026-10-13"],
    ["tomorrow", "Bins out tomorrow", "2026-10-14"],
    ["a weekday ahead", "Quote back by Friday", "2026-10-16"],
    ["the same weekday means today", "Standup Tuesday", "2026-10-13"],
    ["next weekday", "Plumber next Tuesday", "2026-10-20"],
    ["next week", "Review the lease next week", "2026-10-19"],
  ])("reads %s", (_name, text, expected) => expect(dateIn(text, today)).toBe(expected));
  it("ignores impossible dates and lines without one", () => {
    expect(dateIn("Version 31/13 shipped", today)).toBeNull();
    expect(dateIn("Buy milk", today)).toBeNull();
  });
  it("does not read ordinary words as weekdays", () => {
    for (const text of ["Pay the monthly bill", "Plan the wedding", "Walk at sunset", "Move money", "Thursdays are busy"]) expect(dateIn(text, today)).toBeNull();
    expect(dateIn("Standup Tues", today)).toBe("2026-10-13");
    expect(dateIn("Gym Thurs", today)).toBe("2026-10-15");
  });
  it("keeps a late-December day/month in the year that just ended when read in early January", () => {
    const january = new Date("2027-01-03T09:00:00Z");
    expect(dateIn("Return the hire gear 30/12", january)).toBe("2026-12-30");
    expect(dateIn("Bach booked 28 Dec", january)).toBe("2026-12-28");
    expect(dateIn("Rates due 20 Dec", january)).toBe("2027-12-20");
  });
});

describe("worksheetItems", () => {
  it("splits bullets and sentences, strips markers and flags waiting, questions and done", () => {
    const items = worksheetItems("- Proposal due Friday. Waiting on Sam for the quote.\n1) Should I renew the lease?\n- [x] Paid the power bill", today);
    expect(items.map(i => i.text)).toEqual(["Proposal due Friday.", "Waiting on Sam for the quote.", "Should I renew the lease?", "Paid the power bill"]);
    expect(items.map(i => [i.waiting, i.question, i.done])).toEqual([[false, false, false], [true, false, false], [false, true, false], [false, false, true]]);
  });
});

describe("prepareWorksheet", () => {
  const notes = "Proposal due 10 Oct.\nCall the school today.\nQuote back by Friday.\nWaiting on Sam for the invoice.\nShould we switch power company?\nBook the bach for 20/12.\nBuy a present for Ari.\n[x] Paid the rates.";
  it("sorts the saved notes into overdue, today, this week, later, waiting, questions and the rest", () => {
    const text = prepareWorksheet({ ...base, notes });
    expect(text.split("\n")[0]).toBe("Prepare my day · Tue 13 Oct · DO woke up on schedule · prepared from your saved notes · no model called");
    expect(text).toContain("Overdue\n- Proposal due 10 Oct. (Sat 10 Oct)");
    expect(text).toContain("Today\n- Call the school today.");
    expect(text).toContain("This week\n- Quote back by Friday. (Fri 16 Oct)");
    expect(text).toContain("Later\n- Book the bach for 20/12. (Sun 20 Dec)");
    expect(text).toContain("Waiting on someone else\n- Waiting on Sam for the invoice.");
    expect(text).toContain("Questions only you can answer\n- Should we switch power company?");
    expect(text).toContain("Everything else you noted\n- Buy a present for Ari.");
    expect(text).toContain("Already done\n- Paid the rates.");
    expect(text).toContain("Suggested next step: Proposal due 10 Oct.");
    expect(text).toContain("Nothing was sent, booked or changed outside DO.");
  });
  it("answers a note by pulling the matching lines to the top", () => {
    const text = prepareWorksheet({ ...base, notes, trigger: "message", note: "Focus on the invoice and the quote" });
    expect(text).toContain("DO woke up for your note");
    expect(text).toContain("Your note: “Focus on the invoice and the quote”");
    expect(text).toContain("About your note\n- Quote back by Friday.\n- Waiting on Sam for the invoice.");
  });
  it("says so when nothing is dated, waiting or open", () => {
    const text = prepareWorksheet({ ...base, notes: "Buy milk", trigger: "manual" });
    expect(text).toContain("DO woke up because you asked");
    expect(text).toContain("Suggested next step: Buy milk");
    expect(prepareWorksheet({ ...base, notes: "[x] Done everything", trigger: "once" })).toContain("Nothing in these notes is dated, waiting or open.");
  });
  it("never invents content: every worksheet line comes from the notes, the goal or fixed copy", () => {
    const text = prepareWorksheet({ ...base, notes });
    for (const line of text.split("\n").filter(l => l.startsWith("- "))) {
      expect(notes).toContain(line.slice(2).replace(/ \([^)]*\)$/, ""));
    }
  });
});

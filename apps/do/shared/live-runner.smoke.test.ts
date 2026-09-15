import { expect, it } from "vitest";
import { runDoConversationTask } from "./live-runner";

// Explicit opt-in: normal test runs never spend API credits.
it.skipIf(process.env.DO_LIVE_SMOKE !== "1")(
  "retains a corrected date through a real DO agent run",
  async () => {
    const output = await runDoConversationTask(
      {
        id: "synthetic-check",
        agent: "newsletter",
        revision: 2,
        status: "running",
        context: [
          {
            id: "u1",
            role: "user",
            text: "Synthetic school note: the library visit is Tuesday at 10 am. Bring a water bottle. What must I remember?",
          },
          {
            id: "u2",
            role: "user",
            text: "Correction from school: Wednesday at 10 am, not Tuesday. Please summarise the corrected action in two sentences. No web search is needed.",
          },
        ],
      },
      AbortSignal.timeout(55000),
    );
    expect(output).toMatch(/Wednesday/i);
    expect(output).toMatch(/water bottle/i);
    expect(output).not.toMatch(/(?:I have|I've) (?:sent|booked|scheduled)/i);
  },
  60000,
);

// Source-scope regression: do not generalise two stated exceptions to all terms.
it.skipIf(process.env.DO_LIVE_SMOKE !== "1")(
  "preserves the scope of a source qualification",
  async () => {
    const output = await runDoConversationTask(
      {
        id: "scope-check",
        agent: "assistant",
        webSearch: false,
        revision: 1,
        status: "running",
        context: [
          {
            id: "source",
            role: "user",
            text: "Source excerpt: Schools have flexibility to decide when Term 1 starts and when Term 4 finishes. Terms 2 and 3 are fixed. Based only on this excerpt, explain exactly which dates are flexible. Do not add general advice or qualifications.",
          },
        ],
      },
      AbortSignal.timeout(55000),
    );
    expect(output).toMatch(/Term 1/i);
    expect(output).toMatch(/Term 4/i);
    expect(output).toMatch(/fixed/i);
    expect(output).not.toMatch(/(?:each|every|all) term.{0,60}flexib/i);
  },
  60000,
);

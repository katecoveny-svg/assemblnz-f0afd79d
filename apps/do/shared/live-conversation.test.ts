import { describe, expect, it } from "vitest";
import {
  newDoConversation,
  transitionDoConversation as step,
  reconcileDoTaskControllers,
} from "./live-conversation";
function ready() {
  return step(step(newDoConversation(), { type: "connecting" }), {
    type: "connected",
  });
}
function running() {
  return step(
    step(ready(), {
      type: "turn",
      turn: { id: "u1", role: "user", text: "Draft a reply for Tuesday." },
    }),
    { type: "start_task", id: "job1" },
  );
}
describe("DO live conversation and task ownership", () => {
  it("keeps backend work running when only speech is interrupted", () => {
    const state = step(running(), { type: "interrupt_speech" });
    const controller = new AbortController();
    const controllers = new Map([["job1", controller]]);
    reconcileDoTaskControllers(state, controllers);
    expect(state.tasks.job1.status).toBe("running");
    expect(controller.signal.aborted).toBe(false);
  });
  it("aborts cancelled work and refuses its late result", () => {
    const state = step(running(), { type: "cancel_task", id: "job1" });
    const controller = new AbortController();
    const controllers = new Map([["job1", controller]]);
    reconcileDoTaskControllers(state, controllers);
    expect(controller.signal.aborted).toBe(true);
    expect(
      step(state, {
        type: "task_result",
        id: "job1",
        revision: 1,
        output: "Old result",
      }),
    ).toBe(state);
  });
  it("includes corrections in subsequent work and rejects obsolete results", () => {
    const corrected = step(running(), {
      type: "turn",
      turn: { id: "u2", role: "user", text: "Actually Wednesday." },
      supersedesRunningTask: true,
    });
    expect(corrected.tasks.job1.status).toBe("cancelled");
    const current = step(corrected, { type: "start_task", id: "job2" });
    expect(current.tasks.job2.context.map((t) => t.text)).toEqual([
      "Draft a reply for Tuesday.",
      "Actually Wednesday.",
    ]);
    expect(
      step(current, {
        type: "task_result",
        id: "job1",
        revision: 1,
        output: "Tuesday",
      }),
    ).toBe(current);
    expect(
      step(current, {
        type: "task_result",
        id: "job2",
        revision: 2,
        output: "Wednesday",
      }).tasks.job2.status,
    ).toBe("completed");
  });
  it("does not duplicate a repeated delegation or transcript event", () => {
    const state = running();
    expect(step(state, { type: "start_task", id: "job1" })).toBe(state);
    expect(
      step(state, {
        type: "turn",
        turn: { id: "u1", role: "user", text: "Draft a reply for Tuesday." },
      }),
    ).toBe(state);
  });
  it("allows a status question while work continues", () => {
    const state = step(running(), {
      type: "turn",
      turn: { id: "u2", role: "user", text: "How is it going?" },
    });
    expect(state.tasks.job1.status).toBe("running");
    expect(
      step(state, {
        type: "task_result",
        id: "job1",
        revision: 1,
        output: "Draft ready",
      }).tasks.job1.status,
    ).toBe("completed");
  });
  it("captures agent selection per job while preserving conversation", () => {
    const selected = step(running(), {
      type: "select_agent",
      agent: "grammar",
    });
    const next = step(selected, { type: "start_task", id: "job2" });
    expect(next.tasks.job1.agent).toBe("assistant");
    expect(next.tasks.job2.agent).toBe("grammar");
    expect(next.tasks.job2.context).toEqual(next.turns);
  });
  it("captures public-search permission across skill changes", () => {
    const disabled = step(ready(), {
      type: "search_permission",
      enabled: false,
    });
    const typed = step(disabled, {
      type: "turn",
      turn: { id: "u", role: "user", text: "Polish this sentence." },
    });
    const selected = step(typed, { type: "select_agent", agent: "writing" });
    expect(
      step(selected, { type: "start_task", id: "no-search" }).tasks["no-search"]
        .webSearch,
    ).toBe(false);
    expect(running().tasks.job1.webSearch).toBe(true);
  });
  it("closing blocks late startup, results and new jobs", () => {
    const closed = step(running(), { type: "closed" });
    expect(closed.tasks.job1.status).toBe("cancelled");
    expect(step(closed, { type: "connected" })).toBe(closed);
    expect(step(closed, { type: "start_task", id: "job2" })).toBe(closed);
    expect(
      step(closed, {
        type: "task_result",
        id: "job1",
        revision: 1,
        output: "late",
      }),
    ).toBe(closed);
  });
});

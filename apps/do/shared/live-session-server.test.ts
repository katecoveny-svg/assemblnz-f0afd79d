import { EventEmitter } from "node:events";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("./live-runner", () => ({
  runDoConversationTask: vi.fn(async () => "Prepared draft"),
}));
const sockets = vi.hoisted(() => ({ all: [] as any[] }));
vi.mock("ws", () => ({
  default: class extends EventEmitter {
    static OPEN = 1;
    readyState = 1;
    sent: string[] = [];
    constructor() {
      super();
      sockets.all.push(this);
      queueMicrotask(() => this.emit("open"));
    }
    send(value: string) {
      this.sent.push(value);
    }
    close() {
      this.emit("close");
    }
    terminate() {
      this.emit("close");
    }
  },
}));
import {
  createLocalDoSession,
  localDoSession,
  connectLocalDoVoice,
  closeLocalDoVoice,
  disposeLocalDoSession,
  submitLocalDoText,
} from "./live-session-server";
let tokens: string[] = [];
let serial = 0;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("OPENAI_API_KEY", "synthetic-test-key");
  sockets.all.length = 0;
  serial = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("/hangup")
        ? { ok: true }
        : {
            ok: true,
            json: async () => ({
              session: { id: `test-${++serial}` },
              transport: { sdp: "test-answer" },
            }),
          },
    ),
  );
});
afterEach(() => {
  for (const token of tokens) disposeLocalDoSession(token);
  tokens = [];
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function session() {
  const token = createLocalDoSession("assistant");
  tokens.push(token);
  return localDoSession(token);
}
it("seeds voice with prior typed context, preserving roles", async () => {
  const s = session();
  submitLocalDoText(s, "Please keep Wednesday as the due date.", false);
  await connectLocalDoVoice(s, "test-offer");
  const call = vi
    .mocked(fetch)
    .mock.calls.find(([url]) => String(url).endsWith("/sessions"))!;
  const body = JSON.parse(String(call[1]?.body));
  expect(body.session.input).toContainEqual({
    type: "message",
    role: "user",
    content: [
      { type: "input_text", text: "Please keep Wednesday as the due date." },
    ],
  });
});
it("an old close timer cannot mark a reconnected voice session as failed", async () => {
  const s = session();
  await connectLocalDoVoice(s, "first-offer");
  const first = sockets.all.at(-1);
  closeLocalDoVoice(s);
  first.emit(
    "message",
    Buffer.from(JSON.stringify({ type: "session.closed" })),
  );
  await connectLocalDoVoice(s, "second-offer");
  await vi.advanceTimersByTimeAsync(12001);
  expect(s.voice).toBe("live");
  expect(s.error).toBeUndefined();
});
it("reconnection starts a fresh transcript fragment even when provider timestamps restart", async () => {
  const s = session();
  await connectLocalDoVoice(s, "first-offer");
  const first = sockets.all.at(-1);
  first.emit(
    "message",
    Buffer.from(
      JSON.stringify({
        type: "session.input_transcript.delta",
        delta: "First request.",
        event_id: "one",
        start_ms: 0,
        end_ms: 1000,
      }),
    ),
  );
  closeLocalDoVoice(s);
  first.emit(
    "message",
    Buffer.from(JSON.stringify({ type: "session.closed" })),
  );
  await connectLocalDoVoice(s, "second-offer");
  sockets.all
    .at(-1)
    .emit(
      "message",
      Buffer.from(
        JSON.stringify({
          type: "session.input_transcript.delta",
          delta: "Second request.",
          event_id: "one",
          start_ms: 0,
          end_ms: 1000,
        }),
      ),
    );
  expect(
    s.state.turns.filter((t) => t.role === "user").map((t) => t.text),
  ).toEqual(["First request.", "Second request."]);
});

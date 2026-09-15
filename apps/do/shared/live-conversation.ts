/** Shared by DO's live transport and task runner. Contains no provider secrets. */
export const DO_LIVE_AGENTS = [
  "assistant",
  "research",
  "writing",
  "grammar",
  "study",
  "newsletter",
  "travel",
] as const;
export type DoLiveAgent = (typeof DO_LIVE_AGENTS)[number];
export type ConversationTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
};
export type ConversationTask = {
  id: string;
  agent: DoLiveAgent;
  webSearch?: boolean;
  revision: number;
  context: ConversationTurn[];
  status: "running" | "completed" | "cancelled" | "failed";
  output?: string;
};
export type DoConversation = {
  phase: "idle" | "connecting" | "connected" | "closing" | "closed";
  agent: DoLiveAgent;
  webSearch?: boolean;
  turns: ConversationTurn[];
  tasks: Record<string, ConversationTask>;
  revision: number;
  speechInterrupted: boolean;
};
export function newDoConversation(
  agent: DoLiveAgent = "assistant",
): DoConversation {
  return {
    phase: "idle",
    agent,
    webSearch: true,
    turns: [],
    tasks: {},
    revision: 0,
    speechInterrupted: false,
  };
}
export type DoConversationEvent =
  | {
      type:
        | "connecting"
        | "connected"
        | "interrupt_speech"
        | "closing"
        | "closed";
    }
  | { type: "select_agent"; agent: DoLiveAgent }
  | { type: "search_permission"; enabled: boolean }
  | { type: "turn"; turn: ConversationTurn; supersedesRunningTask?: boolean }
  | { type: "start_task"; id: string }
  | { type: "cancel_task"; id: string }
  | {
      type: "task_result";
      id: string;
      revision: number;
      output: string;
      failed?: boolean;
    };

/** Immutable transitions make late results and task cancellation auditable. */
export function transitionDoConversation(
  state: DoConversation,
  event: DoConversationEvent,
): DoConversation {
  switch (event.type) {
    case "connecting":
      return state.phase === "idle" || state.phase === "closed"
        ? { ...state, phase: "connecting" }
        : state;
    case "connected":
      return state.phase === "connecting"
        ? { ...state, phase: "connected" }
        : state;
    case "closing":
    case "closed":
      return {
        ...state,
        phase: event.type,
        tasks: Object.fromEntries(
          Object.entries(state.tasks).map(([id, task]) => [
            id,
            task.status === "running"
              ? { ...task, status: "cancelled" as const }
              : task,
          ]),
        ),
      };
    case "search_permission":
      return { ...state, webSearch: event.enabled };
    case "select_agent":
      return DO_LIVE_AGENTS.includes(event.agent)
        ? { ...state, agent: event.agent }
        : state;
    case "interrupt_speech":
      return { ...state, speechInterrupted: true };
    case "turn": {
      if (state.phase !== "connected" || !event.turn.text.trim()) return state;
      const turn = {
        ...event.turn,
        text: event.turn.text.trim().slice(0, 12000),
      };
      const old = state.turns.find((t) => t.id === turn.id);
      if (old?.role === turn.role && old?.text === turn.text) return state;
      const turns = [
        ...state.turns.filter((t) => t.id !== turn.id),
        turn,
      ].slice(-32);
      // Corrections invalidate running work. The runner aborts the old revision;
      // a new explicit delegation or typed submit uses the updated context.
      const corrects =
        turn.role === "user" && event.supersedesRunningTask === true;
      const revision =
        state.revision +
        (corrects ||
        (turn.role === "user" && !state.turns.some((t) => t.role === "user"))
          ? 1
          : 0);
      return {
        ...state,
        turns,
        revision,
        speechInterrupted: false,
        tasks: corrects
          ? Object.fromEntries(
              Object.entries(state.tasks).map(([id, task]) => [
                id,
                task.status === "running"
                  ? { ...task, status: "cancelled" as const }
                  : task,
              ]),
            )
          : state.tasks,
      };
    }
    case "start_task": {
      if (
        state.phase !== "connected" ||
        state.tasks[event.id] ||
        Object.keys(state.tasks).length >= 32 ||
        !state.turns.some((t) => t.role === "user")
      )
        return state;
      // Never evict delegation IDs within a session: replay must stay idempotent.
      const entries = Object.entries(state.tasks);
      const task: ConversationTask = {
        id: event.id,
        agent: state.agent,
        webSearch: state.webSearch !== false,
        revision: state.revision,
        context: state.turns.map((t) => ({ ...t })),
        status: "running",
      };
      return {
        ...state,
        tasks: { ...Object.fromEntries(entries), [event.id]: task },
      };
    }
    case "cancel_task": {
      const task = state.tasks[event.id];
      if (!task || task.status !== "running") return state;
      return {
        ...state,
        tasks: { ...state.tasks, [event.id]: { ...task, status: "cancelled" } },
      };
    }
    case "task_result": {
      const task = state.tasks[event.id];
      if (
        state.phase !== "connected" ||
        !task ||
        task.status !== "running" ||
        task.revision !== event.revision ||
        state.revision !== event.revision
      )
        return state;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [event.id]: {
            ...task,
            status: event.failed ? "failed" : "completed",
            output: event.output.slice(0, 16000),
          },
        },
      };
    }
  }
}

/** Abort actual backend requests whose state has been cancelled or superseded. */
export function reconcileDoTaskControllers(
  state: DoConversation,
  controllers: Map<string, AbortController>,
) {
  for (const [id, controller] of controllers) {
    if (state.tasks[id]?.status !== "running") {
      controller.abort();
      controllers.delete(id);
    }
  }
}

export const DO_LIVE_AGENT_INSTRUCTIONS: Record<DoLiveAgent, string> = {
  assistant:
    "Help with the ongoing task, everyday administration and plans. Clarify missing details. Prepare useful drafts and next steps.",
  research:
    "Research current information with the available search tool. Cite primary sources and distinguish verified facts, estimates and gaps. Do not claim whole-market coverage.",
  writing:
    "Write useful, ready-to-edit drafts in the requested tone. Preserve meaning, dates and qualifications. Messages remain drafts for the user to review.",
  grammar:
    "Correct spelling, grammar and punctuation using New Zealand English. Preserve the author’s meaning and voice. Explain material ambiguities briefly.",
  study:
    "Be a patient, age-appropriate study buddy. Ask the learner’s level and help them reason with hints and small examples. Do not request identifying information or establish secret/private relationships. Encourage a trusted adult for concerning personal situations.",
  newsletter:
    "Extract school or family administration from the newsletter text provided: dates, required actions, costs, items to bring and unanswered questions. Quote supporting source excerpts. Do not infer missing dates or claim inbox access.",
  travel:
    "Help plan travel from New Zealand. Ask for destination, dates, total budget and currency, traveller count and practical preferences; do not request passport or payment details. Research current options using the search tool and provide primary-source links. Distinguish indicative prices from a live dated fare or room quote; include taxes, baggage, transfers, cancellation terms and availability gaps. Prepare an editable day-by-day itinerary and packing list. Nothing is booked or held. Booking checkout requires a separate specific approval and a connected booking service, which is not available here.",
};

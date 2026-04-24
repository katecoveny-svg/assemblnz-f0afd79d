// ═══════════════════════════════════════════════════════════════
// ToroTutorChat — Claude-backed tutor/day-planner panel for Tōro pages
// ───────────────────────────────────────────────────────────────
// Streams via /claude-chat (toro-education agent) so whānau can ask
// tutor-like questions about a child's school day, NCEA progress or the
// shape of an upcoming day. Context (child name, year, school, subjects,
// today's gear) is passed as a system-style preamble in the first user
// message so Claude can ground answers without leaking PII into prompts
// stored elsewhere.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { streamMcpChat, type ChatMsg } from "@/lib/mcpChat";
import { toast } from "sonner";

interface Props {
  /** Display title above the chat (e.g. "Ask Tōro about Mia"). */
  title?: string;
  /**
   * Lines of context Claude should see before answering. Rendered as a
   * `[Context: …]` preamble on the first user turn only.
   */
  contextLines?: string[];
  /** Suggested questions shown as one-tap chips before the first message. */
  suggestions?: string[];
  /**
   * Variant — switches the system agent used:
   *  - "education" → toro-education (akoranga / NCEA / study)
   *  - "day" → toro-family (day plan, gear, transport, after-school)
   */
  variant?: "education" | "day";
}

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

const DEFAULT_SUGGESTIONS_EDUCATION = [
  "What should we focus on this week?",
  "Explain the latest grade in plain words.",
  "Suggest 15 minutes of revision tonight.",
];

const DEFAULT_SUGGESTIONS_DAY = [
  "Walk me through today.",
  "What's the gear plan for tomorrow?",
  "Anything I should chase before school?",
];

export function ToroTutorChat({
  title = "Ask Tōro",
  contextLines = [],
  suggestions,
  variant = "education",
}: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agentId = variant === "day" ? "toro-family" : "toro-education";
  const chips = suggestions ?? (variant === "day" ? DEFAULT_SUGGESTIONS_DAY : DEFAULT_SUGGESTIONS_EDUCATION);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || streaming) return;

      // Prepend context only on the first turn so it isn't repeated.
      const isFirstTurn = messages.length === 0;
      const preamble =
        isFirstTurn && contextLines.length > 0
          ? `[Context for Tōro — use only to ground the answer, do not echo back verbatim:\n${contextLines.map((l) => `• ${l}`).join("\n")}]\n\n`
          : "";

      const userMsg: ChatMsg = { role: "user", content: text };
      const sendable: ChatMsg = { role: "user", content: preamble + text };

      setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      try {
        await streamMcpChat({
          agentId,
          messages: [...messages, sendable],
          params: { model: CLAUDE_MODEL, temperature: 0.4, max_tokens: 1024 },
          onDelta: (chunk) => {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, content: (last.content as string) + chunk };
              }
              return next;
            });
          },
          onDone: (finalContent) => {
            if (finalContent) {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: finalContent };
                }
                return next;
              });
            }
            setStreaming(false);
          },
          onError: (e) => {
            toast.error(e.message || "Tōro chat failed");
            // Drop the empty assistant placeholder.
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === "assistant" && last.content === "") next.pop();
              return next;
            });
            setStreaming(false);
          },
        });
      } catch (e) {
        toast.error((e as Error).message || "Tōro chat failed");
        setStreaming(false);
      }
    },
    [input, streaming, messages, contextLines, agentId],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-[#D9BC7A]" />
        <h3 className="font-display text-xl text-[#9D8C7D]">{title}</h3>
      </div>
      <p className="font-body text-xs text-[#9D8C7D] mb-4">
        {variant === "day"
          ? "Plain-English help with today's plan, transport and gear."
          : "Tutor-style help with school work, NCEA progress and study habits."}
      </p>

      <div
        ref={scrollRef}
        className="space-y-3 max-h-[360px] overflow-y-auto rounded-2xl bg-[#F7F3EE]/60 border border-[rgba(142,129,119,0.10)] p-4 mb-3"
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="font-body text-sm text-[#6F6158]">
              Kia ora. Pick a suggestion or type a question.
            </p>
            <div className="flex flex-wrap gap-2">
              {chips.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={streaming}
                  onClick={() => void send(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-body bg-white/80 border border-[rgba(142,129,119,0.14)] text-[#6F6158] hover:border-[#C7D9E8] hover:bg-[#C7D9E8]/20 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === "user";
            const text = typeof m.content === "string" ? m.content : "";
            const isPending = !isUser && text === "" && streaming && i === messages.length - 1;
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    isUser
                      ? "bg-[#C7D9E8]/60 text-[#6F6158] rounded-br-md"
                      : "bg-white/90 text-[#3D4250] border border-[rgba(142,129,119,0.10)] rounded-bl-md"
                  }`}
                >
                  {isPending ? (
                    <Loader2 size={14} className="animate-spin text-[#9D8C7D]" />
                  ) : isUser ? (
                    <p className="font-body text-sm whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="font-body text-sm prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:font-display prose-headings:text-[#6F6158]">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            variant === "day"
              ? "e.g. What's the plan for Mia tomorrow?"
              : "e.g. How is Mia tracking in maths?"
          }
          disabled={streaming}
          className="flex-1 resize-none rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white/80 px-4 py-2.5 font-body text-sm text-[#3D4250] placeholder:text-[#9D8C7D] focus:border-[#C7D9E8] focus:outline-none focus:ring-2 focus:ring-[#C7D9E8]/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={streaming || !input.trim()}
          aria-label="Send"
          className="rounded-2xl bg-[#D9BC7A] hover:bg-[#C4A665] disabled:opacity-40 disabled:hover:bg-[#D9BC7A] text-[#6F6158] px-4 py-2.5 transition-colors"
        >
          {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

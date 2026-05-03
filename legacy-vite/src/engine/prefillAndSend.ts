// ────────────────────────────────────────────────────────────────
// Starter-prompt UX helper.
//
// When a user clicks an agent's starter question we want a small
// visible "the system typed this for me" beat before the message
// is sent — it clarifies what was actually submitted and feels
// less abrupt than an instant send.
//
// Usage:
//   prefillAndSend({
//     prompt,
//     setInput,           // React setState for the chat input
//     send,               // (text) => void  — your existing sendMessage
//     focusRef,           // optional: ref to the <input>/<textarea>
//     delayMs: 220,       // optional override (default 220ms)
//   });
// ────────────────────────────────────────────────────────────────

import type { RefObject } from "react";

export interface PrefillAndSendOptions {
  prompt: string;
  setInput: (value: string) => void;
  send: (value: string) => void | Promise<unknown>;
  focusRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  delayMs?: number;
}

export function prefillAndSend({
  prompt,
  setInput,
  send,
  focusRef,
  delayMs = 220,
}: PrefillAndSendOptions): void {
  const text = prompt.trim();
  if (!text) return;

  // 1. Show the prompt in the input so the user sees what's about to send.
  setInput(text);

  // 2. Focus the input so any caret animation / IME state lines up.
  if (focusRef?.current) {
    try {
      focusRef.current.focus();
    } catch {
      // Focus failures are non-fatal — keep going.
    }
  }

  // 3. Send shortly after so the prefill is visible for one frame.
  window.setTimeout(() => {
    try {
      void send(text);
    } finally {
      // The send handler is responsible for clearing the input.
      // We intentionally do NOT clear here to avoid a flicker if
      // the consumer's send is synchronous and already cleared it.
    }
  }, delayMs);
}

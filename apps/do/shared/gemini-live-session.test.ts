import { describe, expect, it } from "vitest";
import {
  appendVoiceTranscript,
  DO_VOICE_TRANSCRIPT_LIMIT,
  voiceTranscriptForReview,
} from "./gemini-live-session";

describe("call transcript review", () => {
  it("preserves earlier turns and streamed text instead of silently discarding them", () => {
    let entries = appendVoiceTranscript([], "You", "A".repeat(5_000));
    entries = appendVoiceTranscript(entries, "You", " continued");
    for (let i = 0; i < 30; i++)
      entries = appendVoiceTranscript(entries, i % 2 ? "You" : "DO", `Turn ${i}`);
    expect(entries).toHaveLength(31);
    expect(entries[0].text).toBe("A".repeat(5_000) + " continued");
  });
  it("leaves the stored transcript unchanged when producing a bounded review excerpt", () => {
    const entries = [{ who: "You", text: "A".repeat(7_000) }];
    const review = voiceTranscriptForReview(entries);
    expect(review.text).toHaveLength(6_000);
    expect(review.shortened).toBe(true);
    expect(entries[0].text).toHaveLength(7_000);
    expect(voiceTranscriptForReview([{ who: "You", text: "Please prepare a plan" }]))
      .toEqual({ text: "You: Please prepare a plan", shortened: false });
  });
  it("fails at the explicit memory bound without mutating earlier transcript", () => {
    const entries = [{ who: "You", text: "A".repeat(DO_VOICE_TRANSCRIPT_LIMIT) }];
    expect(() => appendVoiceTranscript(entries, "DO", "extra")).toThrow("transcript limit");
    expect(entries).toHaveLength(1);
    expect(appendVoiceTranscript(entries, "DO", "")).toBe(entries);
  });
});

import { describe, expect, it } from "vitest";
import { localDoReadoutVoice } from "./read-aloud";
describe("DO on-device readout", () => {
  it("prefers local New Zealand English without using a remote default", () => {
    const voices = [{ lang: "en-NZ", localService: false }, { lang: "en-US", localService: true }, { lang: "en-NZ", localService: true }];
    expect(localDoReadoutVoice(voices)).toBe(voices[2]);
  });
  it("uses available local English or reports unavailable", () => {
    expect(localDoReadoutVoice([{ lang: "en-US", localService: true }])?.lang).toBe("en-US");
    expect(localDoReadoutVoice([{ lang: "en-NZ", localService: false }, { lang: "fr-FR", localService: true }])).toBeUndefined();
    expect(localDoReadoutVoice([])).toBeUndefined();
  });
});

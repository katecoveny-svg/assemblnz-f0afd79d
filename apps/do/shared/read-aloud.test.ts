import { describe, expect, it } from "vitest";
import { DO_PRONUNCIATION_SAMPLE, doReadoutVoiceLabel, localDoReadoutVoice, localDoReadoutVoices, selectedDoReadoutVoice } from "./read-aloud";
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

describe("DO explicit device voice options", () => {
  const nz = { name: "Device NZ", voiceURI: "local:nz", lang: "en-NZ", localService: true };
  const au = { name: "Device AU", voiceURI: "local:au", lang: "en-AU", localService: true };
  it("never lists or selects remote voices, even with an NZ locale", () => {
    const remote = { ...nz, voiceURI: "remote:nz", localService: false };
    expect(localDoReadoutVoices([remote, au, nz, nz])).toEqual([au, nz]);
    expect(selectedDoReadoutVoice([remote, au], remote.voiceURI)).toBeUndefined();
  });
  it("retains the explicit voice instead of silently using another accent", () => {
    expect(selectedDoReadoutVoice([nz, au], au.voiceURI)).toBe(au);
    expect(selectedDoReadoutVoice([au], nz.voiceURI)).toBeUndefined();
    expect(selectedDoReadoutVoice([au, nz], "")).toBe(nz);
  });
  it("reports NZ locale as unverified and never relabels Australian English", () => {
    expect(doReadoutVoiceLabel(nz)).toContain("NZ locale, not listening-verified");
    expect(doReadoutVoiceLabel(au)).not.toContain("NZ");
  });
  it("preserves macrons in the fixed pronunciation preview", () => {
    expect(DO_PRONUNCIATION_SAMPLE).toContain("Whangārei, Taupō, Ōtaki");
    expect(DO_PRONUNCIATION_SAMPLE).toContain("Māori and whānau");
  });
});

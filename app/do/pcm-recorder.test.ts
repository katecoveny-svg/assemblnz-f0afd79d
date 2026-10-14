import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../../public/do/audio/pcm-recorder.js", import.meta.url),
  "utf8",
);

function recorderAt(inputRate: number) {
  const frames: Int16Array[] = [];
  let Recorder: new () => {
    process: (inputs: Float32Array[][]) => boolean;
    offset: number;
  };
  class Processor {
    port = {
      postMessage: (buffer: ArrayBuffer) => frames.push(new Int16Array(buffer).slice()),
    };
  }
  runInNewContext(source, {
    AudioWorkletProcessor: Processor,
    registerProcessor: (_name: string, implementation: typeof Recorder) => {
      Recorder = implementation;
    },
    sampleRate: inputRate,
    Int16Array,
    Math,
  });
  return { recorder: new Recorder!(), frames };
}

describe("DO Live microphone PCM", () => {
  it("converts a 48 kHz browser stream to 16 kHz signed PCM", () => {
    const { recorder, frames } = recorderAt(48_000);
    expect(recorder.process([[new Float32Array(6_144).fill(0.5)]])).toBe(true);
    expect(frames).toHaveLength(1);
    expect(recorder.offset).toBe(0);
    expect([...frames[0]].every((sample) => Math.abs(sample - 16_384) <= 1)).toBe(true);
  });

  it("keeps fractional 44.1 kHz sample boundaries across callbacks", () => {
    const { recorder, frames } = recorderAt(44_100);
    for (let i = 0; i < 44_100; i += 147)
      recorder.process([[new Float32Array(147).fill(0.25)]]);
    expect(frames.length * 2_048 + recorder.offset).toBe(16_000);
    expect(frames[0][0]).toBeCloseTo(8_192, 0);
  });
});

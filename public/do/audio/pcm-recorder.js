/* global AudioWorkletProcessor, registerProcessor, sampleRate */
class DoPcmRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frame = new Int16Array(2048);
    this.offset = 0;
    // Gemini Live expects 16 kHz PCM; browser AudioContext rates are commonly 48 kHz.
    this.inputSampleWeight = 16000 / sampleRate;
    this.partialSample = 0;
    this.partialWeight = 0;
  }
  process(inputs) {
    const samples = inputs[0]?.[0];
    if (!samples) return true;
    for (const sample of samples) {
      // Box-filter each output sample, carrying fractional input samples across
      // process() calls so 44.1 kHz devices do not drift or drop boundaries.
      let remaining = this.inputSampleWeight;
      while (remaining > 1e-9) {
        const weight = Math.min(remaining, 1 - this.partialWeight);
        this.partialSample += sample * weight;
        this.partialWeight += weight;
        remaining -= weight;
        if (this.partialWeight >= 1 - 1e-9) {
          this.frame[this.offset++] = Math.round(
            Math.max(-1, Math.min(1, this.partialSample)) * 32767,
          );
          this.partialSample = 0;
          this.partialWeight = 0;
          if (this.offset === this.frame.length) {
            this.port.postMessage(this.frame.buffer, [this.frame.buffer]);
            this.frame = new Int16Array(2048);
            this.offset = 0;
          }
        }
      }
    }
    return true;
  }
}
registerProcessor('do-pcm-recorder', DoPcmRecorder);

/* global AudioWorkletProcessor, registerProcessor */
class DoPcmRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frame = new Int16Array(2048);
    this.offset = 0;
  }
  process(inputs) {
    const samples = inputs[0]?.[0];
    if (!samples) return true;
    for (const sample of samples) {
      this.frame[this.offset++] = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
      if (this.offset === this.frame.length) {
        this.port.postMessage(this.frame.buffer, [this.frame.buffer]);
        this.frame = new Int16Array(2048);
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('do-pcm-recorder', DoPcmRecorder);

/**
 * Loop exports for Generative assembly: MP4, WebM and GIF.
 *
 * The family renders each frame on demand (`draw(i)`), so a loop is the same
 * every time for the same seed, species and formation. MP4 and WebM go
 * through WebCodecs (mediabunny); GIF through gifenc. Nothing leaves the
 * browser.
 */

export type LoopFormat = 'mp4' | 'webm' | 'gif';

export interface LoopRequest {
  format: LoopFormat;
  /** Canvas the family draws each frame into, at the export size. */
  canvas: HTMLCanvasElement;
  frames: number;
  fps: number;
  /** Draw frame `i` into `canvas`. */
  draw: (i: number) => Promise<void> | void;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

export const LOOP_FORMATS: { id: LoopFormat; label: string; mime: string }[] = [
  { id: 'mp4', label: 'MP4', mime: 'video/mp4' },
  { id: 'webm', label: 'WebM', mime: 'video/webm' },
  { id: 'gif', label: 'GIF', mime: 'image/gif' },
];

/** Whether this browser can encode the format. GIF always can. */
export async function canEncode(format: LoopFormat, width: number, height: number): Promise<boolean> {
  if (format === 'gif') return true;
  if (typeof VideoEncoder === 'undefined') return false;
  const { canEncodeVideo } = await import('mediabunny');
  return canEncodeVideo(format === 'mp4' ? 'avc' : 'vp9', { width, height });
}

export async function encodeLoop(req: LoopRequest): Promise<Blob> {
  return req.format === 'gif' ? encodeGif(req) : encodeVideo(req);
}

async function encodeVideo({ format, canvas, frames, fps, draw, onProgress, signal }: LoopRequest): Promise<Blob> {
  const { Output, Mp4OutputFormat, WebMOutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH } = await import('mediabunny');
  const output = new Output({
    format: format === 'mp4' ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(),
    target: new BufferTarget(),
  });
  const source = new CanvasSource(canvas, { codec: format === 'mp4' ? 'avc' : 'vp9', quality: QUALITY_HIGH, keyFrameInterval: 1 });
  output.addVideoTrack(source, { frameRate: fps });
  await output.start();
  for (let i = 0; i < frames; i++) {
    if (signal?.aborted) { await output.cancel(); throw new DOMException('Export cancelled', 'AbortError'); }
    await draw(i);
    await source.add(i / fps, 1 / fps);
    onProgress?.(i + 1, frames);
  }
  await output.finalize();
  return new Blob([output.target.buffer!], { type: format === 'mp4' ? 'video/mp4' : 'video/webm' });
}

async function encodeGif({ canvas, frames, fps, draw, onProgress, signal }: LoopRequest): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const gif = GIFEncoder();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // A WebGL canvas has no 2D context: read it through a scratch canvas.
  const scratch = ctx ? null : document.createElement('canvas');
  if (scratch) { scratch.width = canvas.width; scratch.height = canvas.height; }
  const read = scratch ? scratch.getContext('2d', { willReadFrequently: true })! : ctx!;
  const delay = Math.round(1000 / fps);
  for (let i = 0; i < frames; i++) {
    if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
    await draw(i);
    if (scratch) read.drawImage(canvas, 0, 0);
    const { data } = read.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), canvas.width, canvas.height, { palette, delay });
    onProgress?.(i + 1, frames);
    // keep the page responsive between frames
    await new Promise((r) => setTimeout(r, 0));
  }
  gif.finish();
  return new Blob([gif.bytes().slice().buffer as ArrayBuffer], { type: 'image/gif' });
}

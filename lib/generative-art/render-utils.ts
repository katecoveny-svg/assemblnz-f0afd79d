/**
 * Shared helpers so families don't each reinvent "render at any pixel size
 * and hand back a PNG blob".
 */

import { stampWatermarkOnCanvas } from './watermark';

/** Rasterise an SVG string into a PNG blob at the exact size given. */
export async function svgToPngBlob(
  svg: string,
  width: number,
  height: number,
  ground: string,
  dpr = 1,
): Promise<Blob | null> {
  const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const img = new Image();
  img.decoding = 'sync';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('svg decode failed'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const stamped = stampWatermarkOnCanvas(canvas, ground);
  return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
}

/**
 * Scale a source canvas into a new PNG blob at a target size. Used as the
 * fallback for stateful renderers (Flow) where re-running the sim at a
 * different size would produce a genuinely different piece rather than a
 * higher-resolution version of the same one.
 */
export async function canvasScaledToBlob(
  source: HTMLCanvasElement,
  width: number,
  height: number,
  ground: string,
  dpr = 1,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fit the source into the target while preserving its aspect (letterbox
  // with the ground colour) — beats stretching a square into a wide banner.
  const srcAspect = source.width / source.height;
  const dstAspect = canvas.width / canvas.height;
  let dw: number;
  let dh: number;
  if (srcAspect > dstAspect) {
    dw = canvas.width;
    dh = canvas.width / srcAspect;
  } else {
    dh = canvas.height;
    dw = canvas.height * srcAspect;
  }
  const dx = (canvas.width - dw) / 2;
  const dy = (canvas.height - dh) / 2;
  ctx.drawImage(source, dx, dy, dw, dh);
  const stamped = stampWatermarkOnCanvas(canvas, ground);
  return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
}

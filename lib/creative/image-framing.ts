/** One framing contract for image preview, PNG export and post handoff. */
export type ImageFraming = {
  fit: 'cover' | 'contain';
  x: number;
  y: number;
  zoom: number;
  inset: number;
  background: '#FFFDFB' | '#240B21' | '#916A70';
};

export const DEFAULT_IMAGE_FRAMING: ImageFraming = {
  fit: 'cover', x: 50, y: 50, zoom: 1, inset: 0, background: '#FFFDFB',
};

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

/** Position is the percentage along the available crop/padding, matching object-position. */
export function imageFrameGeometry(width: number, height: number, sourceWidth: number, sourceHeight: number, frame: ImageFraming) {
  if (![width, height, sourceWidth, sourceHeight].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error('The image dimensions are invalid.');
  }
  const inset = Math.min(width, height) * clamp(frame.inset, 0, 12, 0) / 100;
  const areaWidth = width - inset * 2;
  const areaHeight = height - inset * 2;
  const fit = frame.fit === 'contain' ? Math.min : Math.max;
  const scale = fit(areaWidth / sourceWidth, areaHeight / sourceHeight) * clamp(frame.zoom, 1, 2.5, 1);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  return {
    inset, areaWidth, areaHeight, drawWidth, drawHeight,
    x: inset + (areaWidth - drawWidth) * clamp(frame.x, 0, 100, 50) / 100,
    y: inset + (areaHeight - drawHeight) * clamp(frame.y, 0, 100, 50) / 100,
  };
}

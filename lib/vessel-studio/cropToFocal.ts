// Smart fit-to-fill crop with focal-point clamping. Returns the rect in source-
// pixel space that should be drawn into a target canvas of size targetW × targetH
// using drawImage(src, sx,sy,sw,sh, 0,0, targetW,targetH).

export interface CropResult {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  srcW: number;
  srcH: number;
}

export interface FocalPoint {
  x: number; // 0..1
  y: number; // 0..1
}

export function computeCrop(
  img: HTMLImageElement,
  focal: FocalPoint,
  targetW: number,
  targetH: number
): CropResult {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const targetAR = targetW / targetH;
  const srcAR = srcW / srcH;
  let sw: number;
  let sh: number;
  if (srcAR > targetAR) {
    sh = srcH;
    sw = Math.round(sh * targetAR);
  } else {
    sw = srcW;
    sh = Math.round(sw / targetAR);
  }
  const focalX = focal.x * srcW;
  const focalY = focal.y * srcH;
  let sx = Math.round(focalX - sw / 2);
  let sy = Math.round(focalY - sh / 2);
  sx = Math.max(0, Math.min(srcW - sw, sx));
  sy = Math.max(0, Math.min(srcH - sh, sy));
  return { sx, sy, sw, sh, srcW, srcH };
}

// If less than 40% of either source axis is kept, warn.
export function isExtremeCrop(crop: CropResult): boolean {
  const kept = Math.min(crop.sw / crop.srcW, crop.sh / crop.srcH);
  return kept < 0.4;
}

// Load an image from any URL via fetch → blob → object URL so the resulting
// <img> has a same-origin source and the canvas is never tainted.
export async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const r = await fetch(url, { mode: 'cors' });
  if (!r.ok) throw new Error(`fetch failed (${r.status})`);
  const blob = await r.blob();
  const objUrl = URL.createObjectURL(blob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('image decode failed'));
    };
    img.src = objUrl;
  });
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image decode failed'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

export function cropAndExportBlob(
  img: HTMLImageElement,
  focal: FocalPoint,
  targetW: number,
  targetH: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const c = document.createElement('canvas');
    c.width = targetW;
    c.height = targetH;
    const ctx = c.getContext('2d');
    if (!ctx) return reject(new Error('canvas context unavailable'));
    ctx.imageSmoothingQuality = 'high';
    const crop = computeCrop(img, focal, targetW, targetH);
    ctx.drawImage(
      img,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      targetW,
      targetH
    );
    c.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('blob generation failed'));
      },
      'image/jpeg',
      0.92
    );
  });
}

/** Explicit file selection only. Decode locally, strip metadata by re-encoding, bound memory. */
export async function prepareLocalImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new Error('Choose a JPEG, PNG or WebP under 5 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 24_000_000) throw new Error('Choose an image smaller than 24 megapixels.');
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preview is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/webp', 0.85);
    if (data.length > 2_000_000) throw new Error('This image is too detailed. Choose a smaller one.');
    return data;
  } finally { bitmap.close(); }
}

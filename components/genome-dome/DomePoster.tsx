'use client';

import * as React from 'react';

const POSTER = '/brand/genome/assembl-topdown-pale-dome.png';

/**
 * The approved Auckland render was delivered on a bright magenta compositing
 * key. Keep the original asset untouched and remove that key in the fallback
 * canvas so non-WebGL and loading states still match the live pale dome.
 */
export function DomePoster({ className }: { className?: string }) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const target = canvas.current;
    if (!target) return;

    const image = new window.Image();
    image.decoding = 'async';
    image.src = POSTER;
    image.onload = () => {
      const size = 720;
      target.width = size;
      target.height = size;
      const context = target.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.clearRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size);
      for (let offset = 0; offset < pixels.data.length; offset += 4) {
        const red = pixels.data[offset];
        const green = pixels.data[offset + 1];
        const blue = pixels.data[offset + 2];
        if (red > 225 && blue > 205 && green < 70) pixels.data[offset + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
    };
    return () => {
      image.onload = null;
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className={className}
      role="img"
      aria-label="A pale liquid-glass dome holding a miniature map of central Auckland and its gold data network"
    />
  );
}

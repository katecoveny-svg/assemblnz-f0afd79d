import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from "lucide-react";

interface ImageLightboxProps {
  url: string | null;
  alt?: string;
  /** Optional download filename (without extension) */
  downloadName?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const ZOOM_STEP = 0.5;

/**
 * Full-screen image viewer with pinch/scroll zoom, drag-to-pan, keyboard shortcuts,
 * and a one-tap PNG download. Mounted at the page root so it overlays everything.
 *
 * Keyboard: Esc close · + / - zoom · 0 reset · D download
 */
export default function ImageLightbox({ url, alt = "Generated image", downloadName, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))), []);
  const zoomOut = useCallback(() =>
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    }), []);

  const handleDownload = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const pngBlob = new Blob([blob], { type: "image/png" });
      const blobUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${downloadName || "assembl-image"}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  }, [url, downloadName]);

  // Reset state whenever a new image opens
  useEffect(() => {
    if (url) reset();
  }, [url, reset]);

  // Lock body scroll while open
  useEffect(() => {
    if (!url) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [url]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomIn(); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomOut(); }
      else if (e.key === "0") { e.preventDefault(); reset(); }
      else if (e.key === "d" || e.key === "D") { e.preventDefault(); handleDownload(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [url, onClose, zoomIn, zoomOut, reset, handleDownload]);

  if (!url) return null;

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP / 2 : ZOOM_STEP / 2;
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(z + delta).toFixed(2)));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom === 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
    });
  };
  const onPointerUp = () => { dragRef.current = null; };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-lg">
        <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="p-2 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground" title="Zoom out (−)" aria-label="Zoom out">
          <ZoomOut size={16} />
        </button>
        <button onClick={reset} className="px-3 py-1 text-[11px] font-mono font-medium tabular-nums text-foreground hover:bg-muted rounded-full transition-colors min-w-[52px]" title="Reset (0)" aria-label="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="p-2 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground" title="Zoom in (+)" aria-label="Zoom in">
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-border mx-1" aria-hidden />
        <button onClick={reset} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground" title="Fit to screen (0)" aria-label="Fit to screen">
          <Maximize2 size={16} />
        </button>
        <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-[11px] font-body font-medium" title="Download PNG (D)" aria-label="Download PNG">
          <Download size={13} strokeWidth={2.25} />
          <span>PNG</span>
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-lg hover:bg-muted transition-colors text-foreground"
        title="Close (Esc)"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* Image stage */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
        onClick={(e) => {
          // Click image to toggle zoom on desktops where wheel isn't obvious
          if (e.target instanceof HTMLImageElement && zoom === 1) {
            e.stopPropagation();
            setZoom(2);
          }
        }}
      >
        <img
          src={url}
          alt={alt}
          draggable={false}
          className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragRef.current ? "none" : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Hint pill */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-border text-[10px] font-mono text-muted-foreground tracking-wide">
        scroll to zoom · drag to pan · Esc to close
      </div>
    </div>
  );
}

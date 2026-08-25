'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  cropAndExportBlob,
  computeCrop,
  isExtremeCrop,
  type FocalPoint,
} from '@/lib/vessel-studio/cropToFocal';
import {
  EXPORT_SIZES,
  fileNameFor,
  sizeLabel,
} from '@/lib/vessel-studio/socialSizes';
import type { SocialSize, SizeExportRecord } from '@/lib/vessel-studio/types';

interface MultiSizeExportProps {
  open: boolean;
  image: HTMLImageElement | null;
  sourceLabel: string;
  onClose: () => void;
  onSizeExport?: (record: SizeExportRecord) => void;
}

export function MultiSizeExport({
  open,
  image,
  sourceLabel,
  onClose,
  onSizeExport,
}: MultiSizeExportProps) {
  const [focal, setFocal] = useState<FocalPoint>({ x: 0.5, y: 0.5 });
  const [zipping, setZipping] = useState(false);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const focalDotRef = useRef<HTMLDivElement>(null);
  const sourceWrapRef = useRef<HTMLDivElement>(null);
  const previewRefs = useRef<
    Map<string, { canvas: HTMLCanvasElement; warning: boolean }>
  >(new Map());
  const [warningMap, setWarningMap] = useState<Record<string, boolean>>({});

  // Group sizes by group name, preserving order.
  const groups = useMemo(() => {
    const byGroup = new Map<string, SocialSize[]>();
    for (const sz of EXPORT_SIZES) {
      const arr = byGroup.get(sz.group) ?? [];
      arr.push(sz);
      byGroup.set(sz.group, arr);
    }
    return Array.from(byGroup.entries());
  }, []);

  // Block scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Esc closes modal.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset focal when a new image arrives.
  useEffect(() => {
    if (image) setFocal({ x: 0.5, y: 0.5 });
  }, [image]);

  // Compute display size for source canvas.
  const draw = useCallback(() => {
    if (!image || !sourceCanvasRef.current) return;
    const c = sourceCanvasRef.current;
    const MAX_W = 600;
    const MAX_H = 480;
    let dw = image.naturalWidth;
    let dh = image.naturalHeight;
    if (dw > MAX_W) {
      dh = dh * (MAX_W / dw);
      dw = MAX_W;
    }
    if (dh > MAX_H) {
      dw = dw * (MAX_H / dh);
      dh = MAX_H;
    }
    dw = Math.round(dw);
    dh = Math.round(dh);
    c.width = dw;
    c.height = dh;
    c.style.width = dw + 'px';
    c.style.height = dh + 'px';
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(image, 0, 0, dw, dh);
  }, [image]);

  const renderAllPreviews = useCallback(() => {
    if (!image) return;
    const nextWarn: Record<string, boolean> = {};
    EXPORT_SIZES.forEach((sz) => {
      const key = fileNameFor(sz);
      const entry = previewRefs.current.get(key);
      if (!entry) return;
      const cv = entry.canvas;
      const targetAR = sz.w / sz.h;
      let tw: number;
      let th: number;
      if (targetAR >= 1) {
        tw = 120;
        th = Math.round(120 / targetAR);
      } else {
        th = 120;
        tw = Math.round(120 * targetAR);
      }
      cv.width = tw;
      cv.height = th;
      cv.style.width = tw + 'px';
      cv.style.height = th + 'px';
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingQuality = 'high';
      const crop = computeCrop(image, focal, sz.w, sz.h);
      ctx.clearRect(0, 0, tw, th);
      ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, tw, th);
      nextWarn[key] = isExtremeCrop(crop);
    });
    setWarningMap(nextWarn);
  }, [focal, image]);

  // Redraw when image, focal, or open state changes.
  useEffect(() => {
    if (!open || !image) return;
    draw();
    renderAllPreviews();
  }, [open, image, focal, draw, renderAllPreviews]);

  const focalFromPointer = useCallback(
    (clientX: number, clientY: number): FocalPoint => {
      const c = sourceCanvasRef.current;
      if (!c) return { x: 0.5, y: 0.5 };
      const r = c.getBoundingClientRect();
      let nx = (clientX - r.left) / r.width;
      let ny = (clientY - r.top) / r.height;
      nx = Math.max(0, Math.min(1, nx));
      ny = Math.max(0, Math.min(1, ny));
      return { x: nx, y: ny };
    },
    []
  );

  // Drag handling for the focal dot + canvas-click snap.
  const draggingRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    function move(clientX: number, clientY: number) {
      if (!draggingRef.current) return;
      setFocal(focalFromPointer(clientX, clientY));
    }
    function up() {
      draggingRef.current = false;
    }
    function onMouseMove(e: MouseEvent) {
      move(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (!e.touches[0]) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', up);
    document.addEventListener('touchcancel', up);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', up);
      document.removeEventListener('touchcancel', up);
    };
  }, [open, focalFromPointer]);

  async function downloadOne(sz: SocialSize) {
    if (!image) return;
    try {
      const blob = await cropAndExportBlob(image, focal, sz.w, sz.h);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNameFor(sz);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onSizeExport?.({
        size_label: sizeLabel(sz),
        exported_at: new Date().toISOString(),
        focal_point: focal,
      });
    } catch (err) {
      // surface via console only — modal stays minimal
      console.error('size export failed:', err);
    }
  }

  async function downloadAllZip() {
    if (!image) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (const sz of EXPORT_SIZES) {
        const blob = await cropAndExportBlob(image, focal, sz.w, sz.h);
        zip.file(fileNameFor(sz), blob);
        onSizeExport?.({
          size_label: sizeLabel(sz),
          exported_at: new Date().toISOString(),
          focal_point: focal,
        });
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assembl-vessel-pack-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('zip failed:', err);
    } finally {
      setZipping(false);
    }
  }

  if (!open) return null;

  // Focal dot position — canvas sits inside source-wrap with 6px padding.
  const c = sourceCanvasRef.current;
  const dotLeft = c ? focal.x * c.clientWidth + 6 : 6;
  const dotTop = c ? focal.y * c.clientHeight + 6 : 6;

  return (
    <div className="fixed inset-0 z-[1000] flex items-stretch justify-center">
      <div
        className="absolute inset-0 bg-[rgba(35,33,31,0.42)] backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="relative m-8 w-full max-w-[1240px] overflow-y-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6 shadow-[0_24px_60px_-20px_rgba(35,33,31,0.25)] motion-reduce:shadow-none"
        style={{ maxHeight: 'calc(100vh - 64px)' }}
      >
        <header className="mb-5 flex items-start justify-between gap-6 border-b border-[color:var(--assembl-cloud)] pb-4.5">
          <div>
            <div className="font-mono text-[12px] lowercase tracking-[0.2em] text-[color:var(--text-secondary)]">
              surface
            </div>
            <h2
              id="export-title"
              className="mt-1 font-display text-[30px] font-light leading-tight text-[color:var(--text-primary)]"
            >
              compose for the surface
            </h2>
            <div className="mt-1 font-mono text-[12px] tracking-[0.06em] text-[color:var(--text-secondary)]">
              drag the focal point — every size below updates live
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={downloadAllZip}
              disabled={zipping || !image}
              className="rounded-[2px] border border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-paper)] px-4.5 py-2.5 font-mono text-[12px] lowercase tracking-[0.2em] text-[color:var(--text-primary)] transition-colors enabled:hover:bg-[color:var(--assembl-cloud)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {zipping ? 'building zip…' : 'download all as zip'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="close panel"
              className="h-8 w-8 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-transparent text-lg leading-none text-[color:var(--text-secondary)] hover:bg-[color:var(--assembl-cloud)] hover:text-[color:var(--text-primary)]"
            >
              ×
            </button>
          </div>
        </header>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2.5">
            <div
              ref={sourceWrapRef}
              className="relative inline-block self-start rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-1.5"
              style={{ lineHeight: 0 }}
            >
              <canvas
                ref={sourceCanvasRef}
                className="block max-w-full cursor-crosshair"
                onClick={(e) => {
                  if (!image) return;
                  setFocal(focalFromPointer(e.clientX, e.clientY));
                }}
              />
              {image && (
                <div
                  ref={focalDotRef}
                  role="slider"
                  aria-label="focal point"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={focal.x}
                  tabIndex={0}
                  onMouseDown={(e) => {
                    draggingRef.current = true;
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    draggingRef.current = true;
                    e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    const step = e.shiftKey ? 0.05 : 0.01;
                    let nx = focal.x;
                    let ny = focal.y;
                    let handled = false;
                    if (e.key === 'ArrowLeft') {
                      nx = Math.max(0, focal.x - step);
                      handled = true;
                    }
                    if (e.key === 'ArrowRight') {
                      nx = Math.min(1, focal.x + step);
                      handled = true;
                    }
                    if (e.key === 'ArrowUp') {
                      ny = Math.max(0, focal.y - step);
                      handled = true;
                    }
                    if (e.key === 'ArrowDown') {
                      ny = Math.min(1, focal.y + step);
                      handled = true;
                    }
                    if (handled) {
                      e.preventDefault();
                      setFocal({ x: nx, y: ny });
                    }
                  }}
                  className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-[color:var(--assembl-gold-thread)] bg-[rgba(43,107,87,0.28)] shadow-[0_0_0_1px_rgba(35,33,31,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--assembl-pounamu)] active:cursor-grabbing"
                  style={{ left: `${dotLeft}px`, top: `${dotTop}px` }}
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1 bottom-1 w-px -translate-x-1/2 bg-[color:var(--text-primary)]"
                  />
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-1 right-1 h-px -translate-y-1/2 bg-[color:var(--text-primary)]"
                  />
                </div>
              )}
            </div>
            <p className="font-mono text-[12px] leading-[1.6] tracking-[0.04em] text-[color:var(--text-secondary)]">
              drag the <b className="font-normal text-[color:var(--text-primary)]">gold dot</b> to
              set the focal point. previews update live.{' '}
              {sourceLabel ? `· ${sourceLabel}` : ''}
            </p>
          </div>

          <div
            className="flex flex-col gap-4 overflow-y-auto pr-1"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {groups.map(([groupName, sizes]) => (
              <div key={groupName} className="flex flex-col gap-2">
                <div className="border-b border-[color:var(--assembl-cloud)] pb-1 font-display text-base font-light tracking-[0.01em] text-[color:var(--text-secondary)]">
                  {groupName}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                  {sizes.map((sz) => {
                    const key = fileNameFor(sz);
                    return (
                      <div
                        key={key}
                        className="relative flex flex-col items-center gap-2 rounded-[2px] border border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-cloud)] p-2.5"
                      >
                        {warningMap[key] && (
                          <span
                            title="extreme crop — consider regenerating native at this size."
                            className="absolute right-2 top-2 h-2.5 w-2.5 cursor-help rounded-full bg-[#B85C38] shadow-[0_0_0_2px_var(--assembl-cloud)]"
                            aria-label="extreme crop warning"
                          />
                        )}
                        <div className="flex h-30 w-30 items-center justify-center">
                          <canvas
                            ref={(el) => {
                              if (el)
                                previewRefs.current.set(key, {
                                  canvas: el,
                                  warning: false,
                                });
                            }}
                            className="block rounded-[1px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]"
                          />
                        </div>
                        <div className="text-center font-mono text-[12px] leading-tight tracking-[0.08em]">
                          <div className="text-[color:var(--text-primary)]">{sz.name}</div>
                          <div className="text-[color:var(--text-secondary)]">
                            {sz.w}×{sz.h}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadOne(sz)}
                          className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1 font-mono text-[12px] lowercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/40"
                        >
                          download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

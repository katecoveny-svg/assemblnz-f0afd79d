"use client";
import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import PreviewImage from './PreviewImage';

export default function ContextVisual({ src, alt, onChoose, compact = false, className = '' }: { src?: string; alt: string; onChoose?: () => void; compact?: boolean; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (src && failedSrc !== src) return <PreviewImage className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
  if (compact) return <div className={`context-visual-prompt context-visual-compact ${className}`} role="group" aria-label="Visual direction required"><ImagePlus size={20} aria-hidden="true" /><span>Visual to define</span></div>;
  return <div className="context-visual-prompt" role="group" aria-label="Visual direction required">
    <div className="context-visual-shapes" aria-hidden="true"><span /><span /><span /></div>
    <div><ImagePlus size={24} aria-hidden="true" /><strong>Make this visual specific.</strong>
      <p>{src ? 'This visual is unavailable in the review. Choose an authorised image for this brief.' : 'Describe the client, the moment and what the image should help someone understand.'}</p>
      {onChoose && <button type="button" className="cs-secondary" onClick={onChoose}>Choose a relevant visual</button>}
    </div>
  </div>;
}

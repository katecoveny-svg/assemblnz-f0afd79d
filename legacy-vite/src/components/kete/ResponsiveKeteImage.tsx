import { CSSProperties } from "react";
// Responsive master kete — WebP with PNG fallback, retina-aware via srcset.
// Square (1:1) artwork, trimmed and centered, generated at build time.
import kete256 from "@/assets/kete-master/kete-256.webp";
import kete480 from "@/assets/kete-master/kete-480.webp";
import kete720 from "@/assets/kete-master/kete-720.webp";
import kete1024 from "@/assets/kete-master/kete-1024.webp";
import kete1440 from "@/assets/kete-master/kete-1440.webp";
import kete256png from "@/assets/kete-master/kete-256.png";
import kete480png from "@/assets/kete-master/kete-480.png";
import kete720png from "@/assets/kete-master/kete-720.png";
import kete1024png from "@/assets/kete-master/kete-1024.png";
import kete1440png from "@/assets/kete-master/kete-1440.png";

interface ResponsiveKeteImageProps {
  /** Rendered display width in CSS px (largest expected size). Drives `sizes` hint. */
  displayWidth: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  draggable?: boolean;
}

const WEBP_SRCSET = [
  `${kete256} 256w`,
  `${kete480} 480w`,
  `${kete720} 720w`,
  `${kete1024} 1024w`,
  `${kete1440} 1440w`,
].join(", ");

const PNG_SRCSET = [
  `${kete256png} 256w`,
  `${kete480png} 480w`,
  `${kete720png} 720w`,
  `${kete1024png} 1024w`,
  `${kete1440png} 1440w`,
].join(", ");

/**
 * Picks the right kete image variant for the device pixel ratio + viewport,
 * always serving WebP when supported and falling back to PNG. Square 1:1.
 */
export default function ResponsiveKeteImage({
  displayWidth,
  alt = "",
  className = "",
  style,
  loading = "lazy",
  fetchPriority = "auto",
  draggable = false,
}: ResponsiveKeteImageProps) {
  // sizes hint: tells the browser the image will render at ~displayWidth CSS px.
  // The browser then picks the smallest source ≥ displayWidth × DPR.
  const sizes = `(max-width: 640px) min(90vw, ${displayWidth}px), ${displayWidth}px`;

  return (
    <picture>
      <source type="image/webp" srcSet={WEBP_SRCSET} sizes={sizes} />
      <source type="image/png" srcSet={PNG_SRCSET} sizes={sizes} />
      <img
        src={kete1024png}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className={className}
        style={style}
        loading={loading}
        // @ts-expect-error - fetchpriority is a valid HTML attribute, React typing lags
        fetchpriority={fetchPriority}
        decoding="async"
        draggable={draggable}
        width={1024}
        height={1024}
      />
    </picture>
  );
}

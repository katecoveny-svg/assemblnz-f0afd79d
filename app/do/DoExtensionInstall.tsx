'use client';

import { useState } from 'react';

type Props = {
  /** Compact floating paper card in the spatial stage. */
  variant?: 'stage' | 'panel';
};

/**
 * Chrome extension install — not a Mac .dmg / App Store app.
 * Clear path: download zip → unzip → Chrome Load unpacked → apps/do/extension.
 */
export function DoExtensionInstall({ variant = 'stage' }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  function onDownload() {
    setDownloaded(true);
  }

  return (
    <aside
      className={`do-ext-card${variant === 'panel' ? ' do-ext-card-panel' : ''}`}
      aria-label="Chrome extension install"
    >
      <p className="do-mono">Chrome extension</p>
      <strong>Load unpacked</strong>
      <ol className="do-ext-steps">
        <li>
          <a
            className="do-ext-download"
            href="/api/do/extension/zip"
            download="DO-Chrome-Extension.zip"
            onClick={onDownload}
          >
            DO-Chrome-Extension.zip
          </a>
        </li>
        <li>Unzip → folder</li>
        <li>
          Chrome → <span className="do-mono">chrome://extensions</span>
        </li>
        <li>Developer mode → Load unpacked</li>
        <li>
          Select folder · path <span className="do-mono">apps/do/extension</span>
        </li>
      </ol>
      {downloaded ? (
        <p className="do-ext-saved">
          Saved as <span className="do-mono">DO-Chrome-Extension.zip</span> (Downloads). Not a Mac
          .dmg.
        </p>
      ) : (
        <p className="do-ext-saved">Chrome only · not a Mac App Store app.</p>
      )}
    </aside>
  );
}

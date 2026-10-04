import { useId } from 'react';

export const DO_FUNCTIONAL_MARK_ASSET = '/brand/canonical/do-vector-v1/DO-D-mono.svg';

/** Legacy dimensional presence geometry: retained unchanged for existing scenes. */
export const DO_MARK_PATH = "M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z";

export function DoMark({
  character = "symbol",
}: {
  character?: "symbol" | "franklin";
}) {
  const maskId = `do-functional-${useId().replaceAll(':', '')}`;
  return (
    <svg viewBox={character === "symbol" ? "0 0 960 1040" : "0 0 64 64"} aria-hidden="true" focusable="false">
      {character === "symbol" ? (
        <>
          <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="1040" style={{maskType:'alpha'}}>
            <image href={DO_FUNCTIONAL_MARK_ASSET} x="0" y="0" width="960" height="1040" />
          </mask></defs>
          <rect width="960" height="1040" fill="currentColor" mask={`url(#${maskId})`} />
        </>
      ) : (
        <>
          <path
            d="M17 19Q27 7 39 19L47 30H57Q61 35 56 39H36L30 53H15Q10 38 17 19Z"
            fill="currentColor"
          />
          <path d="M20 19Q9 17 9 35Q10 51 20 44L26 24" fill="#513044" />
          <circle cx="37" cy="26" r="2.5" fill="#20101f" />
          <circle cx="57" cy="33" r="3" fill="#20101f" />
        </>
      )}
    </svg>
  );
}

/**
 * Gateway customs clearance pack SVG — customs-native ONLY.
 * Motif: vessel/manifest + entry docs + HS tariff lines + border clearance.
 * Explicitly NOT Arc: no floor plan, no rooms, no N-compass, no A1 plate.
 */

/** Assembled clearance pack underlay for interactive pins. */
export function GatewayEntryUnderlay() {
  return (
    <>
      {/* Vessel / voyage / B/L strip */}
      <g stroke="#240B21" fill="none">
        <rect x="40" y="36" width="560" height="48" strokeWidth="1.8" />
      </g>
      {/* Simple vessel silhouette — broker desk DNA, not architecture */}
      <g stroke="#916A70" fill="none" strokeWidth="1.4">
        <path d="M52 68 L68 52 L118 52 L132 68 Z" />
        <line x1="78" y1="52" x2="78" y2="44" />
        <line x1="98" y1="52" x2="98" y2="46" />
      </g>
      <text
        x="148"
        y="56"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="1"
        fill="#240B21"
      >
        MANIFEST · MV HARBOUR DEMO · VOY 26-04 · B/L DEMO-8841
      </text>
      <text
        x="148"
        y="72"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="8"
        letterSpacing="0.8"
        fill="#654A4E"
      >
        IMPORT ENTRY DRAFT · STAGED · NOT LODGED TO TSW
      </text>

      {/* Commercial invoice */}
      <g stroke="#240B21" fill="none">
        <rect x="40" y="98" width="168" height="148" strokeWidth="1.8" />
        <line x1="52" y1="126" x2="192" y2="126" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="144" x2="180" y2="144" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="162" x2="172" y2="162" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="180" x2="186" y2="180" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="198" x2="160" y2="198" strokeWidth="1" stroke="#654A4E" />
      </g>

      {/* Packing list + COO */}
      <g stroke="#240B21" fill="none">
        <rect x="220" y="98" width="148" height="148" strokeWidth="1.6" />
        <rect
          x="232"
          y="172"
          width="124"
          height="56"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          stroke="#916A70"
        />
      </g>

      {/* HS / Working Tariff card with code cells */}
      <g stroke="#916A70" fill="none">
        <rect x="380" y="98" width="220" height="148" strokeWidth="2" />
        <rect x="394" y="128" width="192" height="28" strokeWidth="1.3" />
        <rect x="394" y="164" width="192" height="28" strokeWidth="1.3" />
        <rect x="394" y="200" width="192" height="28" strokeWidth="1.3" />
      </g>

      {/* CIF / duty / GST valuation strip */}
      <g stroke="#240B21" fill="none">
        <rect x="40" y="260" width="340" height="68" strokeWidth="1.8" />
        <line x1="153" y1="260" x2="153" y2="328" strokeWidth="1" opacity="0.4" />
        <line x1="266" y1="260" x2="266" y2="328" strokeWidth="1" opacity="0.4" />
        <line x1="40" y1="294" x2="380" y2="294" strokeWidth="1" opacity="0.3" />
      </g>

      {/* Border clearance gate + evidence receipt */}
      <g stroke="#240B21" fill="none">
        <rect x="392" y="260" width="208" height="108" strokeWidth="1.6" />
      </g>
      <g stroke="#916A70" fill="none">
        <rect x="410" y="290" width="72" height="48" strokeWidth="1.4" />
        <circle cx="536" cy="314" r="24" strokeWidth="1.6" />
        <circle cx="536" cy="314" r="16" strokeWidth="1" strokeDasharray="3 2" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="0.6"
      >
        <text x="52" y="116">
          COMMERCIAL INVOICE
        </text>
        <text x="232" y="116">
          PACKING LIST
        </text>
        <text x="248" y="202" fill="#916A70">
          COO / PREFERENCE
        </text>
        <text x="394" y="116" fill="#916A70">
          WORKING TARIFF · HS
        </text>
        <text x="404" y="146" fill="#916A70" fontSize="8">
          8544.42 · CONFIRM
        </text>
        <text x="404" y="182" fill="#916A70" fontSize="8">
          LINE 2 · GRI PENDING
        </text>
        <text x="404" y="218" fill="#916A70" fontSize="8">
          DUTY · FTA CHECK
        </text>
        <text x="52" y="280">
          CIF
        </text>
        <text x="165" y="280">
          DUTY
        </text>
        <text x="278" y="280">
          IMPORT GST
        </text>
        <text x="52" y="316" fontSize="8">
          VALUATION EVIDENCE
        </text>
        <text x="404" y="280">
          BORDER CLEARANCE
        </text>
        <text x="420" y="318" fontSize="8">
          GATE
        </text>
        <text x="404" y="356" fill="#916A70" fontSize="8">
          EVIDENCE RECEIPT
        </text>
      </g>
    </>
  );
}

/**
 * Flat-lay vessel/manifest docs → assembled clearance pack.
 * Parts are entry documents and HS cards — never building frames.
 */
export function GatewayAssembleParts() {
  return (
    <>
      <g
        data-flat
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="1.1"
      >
        <text x="36" y="26">
          FLAT LAY · MANIFEST / ENTRY / TARIFF
        </text>
        <text x="430" y="26">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      {/* Manifest / vessel strip */}
      <g data-part data-sx="-30" data-sy="-40" data-sr="-3" stroke="#240B21" fill="none">
        <rect x="40" y="36" width="560" height="48" strokeWidth="1.8" />
        <path d="M52 68 L68 52 L118 52 L132 68 Z" stroke="#916A70" strokeWidth="1.4" />
      </g>

      {/* Invoice */}
      <g data-part data-sx="-62" data-sy="44" data-sr="-9" stroke="#240B21" fill="none">
        <rect x="40" y="98" width="168" height="148" strokeWidth="1.8" />
        <line x1="52" y1="126" x2="192" y2="126" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="144" x2="180" y2="144" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="162" x2="172" y2="162" strokeWidth="1" stroke="#654A4E" />
        <line x1="52" y1="180" x2="186" y2="180" strokeWidth="1" stroke="#654A4E" />
      </g>

      {/* Packing + COO */}
      <g data-part data-sx="18" data-sy="-50" data-sr="8" stroke="#240B21" fill="none">
        <rect x="220" y="98" width="148" height="148" strokeWidth="1.6" />
        <rect
          x="232"
          y="172"
          width="124"
          height="56"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          stroke="#916A70"
        />
      </g>

      {/* HS tariff card */}
      <g data-part data-sx="68" data-sy="-26" data-sr="10" stroke="#916A70" fill="none">
        <rect x="380" y="98" width="220" height="148" strokeWidth="2" />
        <rect x="394" y="128" width="192" height="28" strokeWidth="1.3" />
        <rect x="394" y="164" width="192" height="28" strokeWidth="1.3" />
        <rect x="394" y="200" width="192" height="28" strokeWidth="1.3" />
      </g>

      {/* Valuation + border gate */}
      <g data-part data-sx="-20" data-sy="54" data-sr="-6" stroke="#240B21" fill="none">
        <rect x="40" y="260" width="340" height="68" strokeWidth="1.8" />
        <rect x="392" y="260" width="208" height="108" strokeWidth="1.6" />
        <rect x="410" y="290" width="72" height="48" strokeWidth="1.4" stroke="#916A70" />
        <circle cx="536" cy="314" r="24" strokeWidth="1.6" stroke="#916A70" />
        <line x1="153" y1="260" x2="153" y2="328" strokeWidth="1" opacity="0.4" />
        <line x1="266" y1="260" x2="266" y2="328" strokeWidth="1" opacity="0.4" />
      </g>

      <g
        data-assembled
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="0.6"
        opacity="0"
      >
        <text x="148" y="56" fill="#240B21" fontSize="10" letterSpacing="1">
          MANIFEST · MV HARBOUR DEMO · VOY 26-04 · B/L DEMO-8841
        </text>
        <text x="148" y="72" fontSize="8" letterSpacing="0.8">
          IMPORT ENTRY DRAFT · STAGED · NOT LODGED TO TSW
        </text>
        <text x="52" y="116">
          COMMERCIAL INVOICE
        </text>
        <text x="232" y="116">
          PACKING LIST
        </text>
        <text x="248" y="202" fill="#916A70">
          COO / PREFERENCE
        </text>
        <text x="394" y="116" fill="#916A70">
          WORKING TARIFF · HS
        </text>
        <text x="404" y="146" fill="#916A70" fontSize="8">
          8544.42 · CONFIRM
        </text>
        <text x="404" y="182" fill="#916A70" fontSize="8">
          LINE 2 · GRI PENDING
        </text>
        <text x="404" y="218" fill="#916A70" fontSize="8">
          DUTY · FTA CHECK
        </text>
        <text x="52" y="280">
          CIF
        </text>
        <text x="165" y="280">
          DUTY
        </text>
        <text x="278" y="280">
          IMPORT GST
        </text>
        <text x="52" y="316" fontSize="8">
          VALUATION EVIDENCE
        </text>
        <text x="404" y="280">
          BORDER CLEARANCE
        </text>
        <text x="420" y="318" fontSize="8">
          GATE
        </text>
        <text x="404" y="356" fill="#916A70" fontSize="8">
          EVIDENCE RECEIPT
        </text>
      </g>

      <g data-assemble-stamp opacity="0">
        <rect x="40" y="348" width="132" height="42" fill="none" stroke="#916A70" strokeWidth="1.2" />
        <text
          x="106"
          y="366"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#916A70"
          letterSpacing="1.4"
        >
          DEMO
        </text>
        <text
          x="106"
          y="380"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="8"
          fill="#654A4E"
        >
          not lodged to TSW
        </text>
      </g>
    </>
  );
}

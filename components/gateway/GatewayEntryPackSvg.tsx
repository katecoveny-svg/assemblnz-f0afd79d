/**
 * SVG for Gateway customs clearance pack — NOT an architecture plan sheet.
 * Motif: invoice / packing / tariff / entry / border docs assemble into a
 * broker-ready clearance pack. Paper field chrome comes from the shared kit;
 * the drawing itself is industry-true to NZ customs brokerage.
 */

/** Assembled clearance pack underlay for PlanPins. */
export function GatewayEntryUnderlay() {
  return (
    <>
      {/* Pack header bar — entry job strip, not a building envelope */}
      <g stroke="#240B21" fill="none">
        <rect x="48" y="42" width="544" height="36" strokeWidth="1.8" />
      </g>
      <text
        x="60"
        y="64"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="11"
        letterSpacing="1.2"
        fill="#240B21"
      >
        IMPORT ENTRY DRAFT · DEMO · NOT LODGED
      </text>

      {/* Commercial invoice document */}
      <g stroke="#240B21" fill="none">
        <rect x="48" y="92" width="176" height="150" strokeWidth="1.8" />
        <line x1="60" y1="120" x2="208" y2="120" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="138" x2="196" y2="138" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="156" x2="188" y2="156" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="174" x2="200" y2="174" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="192" x2="176" y2="192" strokeWidth="1" stroke="#654A4E" />
      </g>

      {/* Packing list + certificate of origin */}
      <g stroke="#240B21" fill="none">
        <rect x="236" y="92" width="152" height="150" strokeWidth="1.6" />
        <rect
          x="248"
          y="168"
          width="128"
          height="58"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          stroke="#916A70"
        />
      </g>

      {/* Working Tariff / HS line card */}
      <g stroke="#916A70" fill="none">
        <rect x="400" y="92" width="192" height="150" strokeWidth="2" />
        <rect x="414" y="122" width="164" height="26" strokeWidth="1.3" />
        <rect x="414" y="156" width="164" height="26" strokeWidth="1.3" />
        <rect x="414" y="190" width="164" height="26" strokeWidth="1.3" />
      </g>

      {/* Entry value strip — CIF / duty / GST */}
      <g stroke="#240B21" fill="none">
        <rect x="48" y="256" width="360" height="72" strokeWidth="1.8" />
        <line x1="168" y1="256" x2="168" y2="328" strokeWidth="1" opacity="0.45" />
        <line x1="288" y1="256" x2="288" y2="328" strokeWidth="1" opacity="0.45" />
        <line x1="48" y1="292" x2="408" y2="292" strokeWidth="1" opacity="0.35" />
      </g>

      {/* Border clearance + evidence receipt */}
      <g stroke="#240B21" fill="none">
        <rect x="420" y="256" width="172" height="110" strokeWidth="1.6" />
      </g>
      <g stroke="#916A70" fill="none">
        <circle cx="506" cy="308" r="26" strokeWidth="1.6" />
        <circle cx="506" cy="308" r="18" strokeWidth="1" strokeDasharray="3 2" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="0.7"
      >
        <text x="60" y="110">
          COMMERCIAL INVOICE
        </text>
        <text x="248" y="110">
          PACKING · ORIGIN
        </text>
        <text x="264" y="198" fill="#916A70">
          COO / PREFERENCE
        </text>
        <text x="414" y="110" fill="#916A70">
          WORKING TARIFF
        </text>
        <text x="424" y="139" fill="#916A70" fontSize="8">
          HS · GRI · DUTY
        </text>
        <text x="424" y="173" fill="#916A70" fontSize="8">
          LINE 2 · PENDING
        </text>
        <text x="60" y="276">
          CIF
        </text>
        <text x="180" y="276">
          DUTY
        </text>
        <text x="300" y="276">
          IMPORT GST
        </text>
        <text x="60" y="314" fontSize="8">
          VALUATION EVIDENCE
        </text>
        <text x="434" y="276">
          BORDER CLEARANCE
        </text>
        <text x="434" y="352" fill="#916A70" fontSize="8">
          EVIDENCE RECEIPT
        </text>
      </g>

      {/* NZ Customs desk mark — not a north arrow */}
      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="8"
        letterSpacing="1"
      >
        <text x="500" y="64" textAnchor="end">
          NZCS · BROKER DESK
        </text>
      </g>
    </>
  );
}

/**
 * Flat-lay customs docs → assembled clearance pack for BlueprintScene.
 * Parts are documents and tariff cards, not building/frame pieces.
 */
export function GatewayAssembleParts() {
  return (
    <>
      <g
        data-flat
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="1.2"
      >
        <text x="36" y="28">
          FLAT LAY · ENTRY DOCS / TARIFF PINS
        </text>
        <text x="430" y="28">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      {/* Job strip */}
      <g data-part data-sx="-28" data-sy="-34" data-sr="-2" stroke="#240B21" fill="none">
        <rect x="48" y="42" width="544" height="36" strokeWidth="1.8" />
      </g>

      {/* Invoice doc */}
      <g data-part data-sx="-58" data-sy="46" data-sr="-8" stroke="#240B21" fill="none">
        <rect x="48" y="92" width="176" height="150" strokeWidth="1.8" />
        <line x1="60" y1="120" x2="208" y2="120" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="138" x2="196" y2="138" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="156" x2="188" y2="156" strokeWidth="1" stroke="#654A4E" />
        <line x1="60" y1="174" x2="200" y2="174" strokeWidth="1" stroke="#654A4E" />
      </g>

      {/* Packing + COO */}
      <g data-part data-sx="24" data-sy="-48" data-sr="7" stroke="#240B21" fill="none">
        <rect x="236" y="92" width="152" height="150" strokeWidth="1.6" />
        <rect
          x="248"
          y="168"
          width="128"
          height="58"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          stroke="#916A70"
        />
      </g>

      {/* Tariff / HS card */}
      <g data-part data-sx="62" data-sy="-28" data-sr="9" stroke="#916A70" fill="none">
        <rect x="400" y="92" width="192" height="150" strokeWidth="2" />
        <rect x="414" y="122" width="164" height="26" strokeWidth="1.3" />
        <rect x="414" y="156" width="164" height="26" strokeWidth="1.3" />
        <rect x="414" y="190" width="164" height="26" strokeWidth="1.3" />
      </g>

      {/* Value strip + border clearance */}
      <g data-part data-sx="-22" data-sy="52" data-sr="-5" stroke="#240B21" fill="none">
        <rect x="48" y="256" width="360" height="72" strokeWidth="1.8" />
        <rect x="420" y="256" width="172" height="110" strokeWidth="1.6" />
        <circle cx="506" cy="308" r="26" strokeWidth="1.6" stroke="#916A70" />
        <line x1="168" y1="256" x2="168" y2="328" strokeWidth="1" opacity="0.45" />
        <line x1="288" y1="256" x2="288" y2="328" strokeWidth="1" opacity="0.45" />
      </g>

      <g
        data-assembled
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="9"
        letterSpacing="0.7"
        opacity="0"
      >
        <text x="60" y="64" fill="#240B21" fontSize="11" letterSpacing="1.2">
          IMPORT ENTRY DRAFT · DEMO · NOT LODGED
        </text>
        <text x="500" y="64" textAnchor="end" fontSize="8" letterSpacing="1">
          NZCS · BROKER DESK
        </text>
        <text x="60" y="110">
          COMMERCIAL INVOICE
        </text>
        <text x="248" y="110">
          PACKING · ORIGIN
        </text>
        <text x="264" y="198" fill="#916A70">
          COO / PREFERENCE
        </text>
        <text x="414" y="110" fill="#916A70">
          WORKING TARIFF
        </text>
        <text x="424" y="139" fill="#916A70" fontSize="8">
          HS · GRI · DUTY
        </text>
        <text x="424" y="173" fill="#916A70" fontSize="8">
          LINE 2 · PENDING
        </text>
        <text x="60" y="276">
          CIF
        </text>
        <text x="180" y="276">
          DUTY
        </text>
        <text x="300" y="276">
          IMPORT GST
        </text>
        <text x="60" y="314" fontSize="8">
          VALUATION EVIDENCE
        </text>
        <text x="434" y="276">
          BORDER CLEARANCE
        </text>
        <text x="434" y="352" fill="#916A70" fontSize="8">
          EVIDENCE RECEIPT
        </text>
      </g>

      <g data-assemble-stamp opacity="0">
        <rect x="48" y="348" width="120" height="42" fill="none" stroke="#916A70" strokeWidth="1.2" />
        <text
          x="108"
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
          x="108"
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

/** SVG underlay + assemble parts for Gateway customs entry plate. */

/** Assembled entry / tariff plate used by PlanPins. */
export function GatewayEntryUnderlay() {
  return (
    <>
      {/* Plate envelope */}
      <g stroke="#240B21" fill="none" strokeLinejoin="miter">
        <rect x="60" y="50" width="520" height="320" strokeWidth="2.4" />
        {/* Commercial invoice */}
        <rect x="80" y="70" width="200" height="130" strokeWidth="1.8" />
        {/* Packing / origin */}
        <rect x="300" y="70" width="120" height="130" strokeWidth="1.6" />
        {/* Tariff strip */}
        <rect x="440" y="70" width="120" height="130" strokeWidth="2" stroke="#916A70" />
        {/* Entry form */}
        <rect x="80" y="220" width="280" height="130" strokeWidth="1.8" />
        {/* Biosecurity / receipt */}
        <rect x="380" y="220" width="180" height="130" strokeWidth="1.6" />
      </g>

      {/* Invoice line ticks */}
      <g stroke="#654A4E" fill="none" opacity="0.85">
        <line x1="96" y1="100" x2="260" y2="100" strokeWidth="1" />
        <line x1="96" y1="118" x2="248" y2="118" strokeWidth="1" />
        <line x1="96" y1="136" x2="236" y2="136" strokeWidth="1" />
        <line x1="96" y1="154" x2="220" y2="154" strokeWidth="1" />
      </g>

      {/* Tariff HS cells */}
      <g stroke="#916A70" fill="none">
        <rect x="456" y="96" width="88" height="28" strokeWidth="1.4" />
        <rect x="456" y="132" width="88" height="28" strokeWidth="1.4" />
        <line x1="456" y1="110" x2="544" y2="110" strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* Entry field grid */}
      <g stroke="#240B21" fill="none" opacity="0.55">
        <line x1="100" y1="255" x2="340" y2="255" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="100" y1="280" x2="340" y2="280" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="100" y1="305" x2="300" y2="305" strokeWidth="1" strokeDasharray="4 3" />
      </g>

      {/* Border stamp */}
      <g stroke="#916A70" fill="none">
        <circle cx="470" cy="285" r="28" strokeWidth="1.6" />
        <circle cx="470" cy="285" r="20" strokeWidth="1" strokeDasharray="3 2" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
      >
        <text x="90" y="88">
          INVOICE
        </text>
        <text x="312" y="88">
          ORIGIN
        </text>
        <text x="456" y="88" fill="#916A70">
          TARIFF
        </text>
        <text x="90" y="240">
          ENTRY DRAFT
        </text>
        <text x="396" y="240">
          BORDER / MPI
        </text>
        <text x="100" y="330" fontSize="9">
          CIF · DUTY · GST
        </text>
        <text x="430" y="330" fontSize="9" fill="#916A70">
          RECEIPT
        </text>
      </g>

      {/* North / plate mark */}
      <g stroke="#240B21" fill="#240B21">
        <line x1="600" y1="90" x2="600" y2="58" strokeWidth="1" />
        <path d="M600 58 l-4 8 h8 z" />
        <text
          x="588"
          y="108"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          NZ
        </text>
      </g>
    </>
  );
}

/** Flat-lay → assemble parts for BlueprintScene. */
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
          FLAT LAY · ENTRY / TARIFF PINS
        </text>
        <text x="460" y="28">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      {/* Envelope */}
      <g
        data-part
        data-sx="-36"
        data-sy="-22"
        data-sr="-2"
        stroke="#240B21"
        fill="none"
        strokeLinejoin="miter"
      >
        <rect x="60" y="50" width="520" height="320" strokeWidth="2.4" />
      </g>

      {/* Invoice sheet */}
      <g data-part data-sx="-52" data-sy="38" data-sr="-7" stroke="#240B21" fill="none">
        <rect x="80" y="70" width="200" height="130" strokeWidth="1.8" />
        <line x1="96" y1="100" x2="260" y2="100" strokeWidth="1" stroke="#654A4E" />
        <line x1="96" y1="118" x2="248" y2="118" strokeWidth="1" stroke="#654A4E" />
        <line x1="96" y1="136" x2="236" y2="136" strokeWidth="1" stroke="#654A4E" />
      </g>

      {/* Origin / packing */}
      <g data-part data-sx="40" data-sy="-40" data-sr="6" stroke="#240B21" fill="none">
        <rect x="300" y="70" width="120" height="130" strokeWidth="1.6" />
      </g>

      {/* Tariff strip */}
      <g data-part data-sx="58" data-sy="-30" data-sr="8" stroke="#916A70" fill="none">
        <rect x="440" y="70" width="120" height="130" strokeWidth="2" />
        <rect x="456" y="96" width="88" height="28" strokeWidth="1.4" />
        <rect x="456" y="132" width="88" height="28" strokeWidth="1.4" />
      </g>

      {/* Entry form + border stamp */}
      <g data-part data-sx="-28" data-sy="48" data-sr="-5" stroke="#240B21" fill="none">
        <rect x="80" y="220" width="280" height="130" strokeWidth="1.8" />
        <rect x="380" y="220" width="180" height="130" strokeWidth="1.6" />
        <circle cx="470" cy="285" r="28" strokeWidth="1.6" stroke="#916A70" />
        <line
          x1="100"
          y1="255"
          x2="340"
          y2="255"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.55"
        />
        <line
          x1="100"
          y1="280"
          x2="340"
          y2="280"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.55"
        />
      </g>

      <g
        data-assembled
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
        opacity="0"
      >
        <text x="90" y="88">
          INVOICE
        </text>
        <text x="312" y="88">
          ORIGIN
        </text>
        <text x="456" y="88" fill="#916A70">
          TARIFF
        </text>
        <text x="90" y="240">
          ENTRY DRAFT
        </text>
        <text x="396" y="240">
          BORDER / MPI
        </text>
        <text x="100" y="330" fontSize="9">
          CIF · DUTY · GST
        </text>
        <text x="430" y="330" fontSize="9" fill="#916A70">
          RECEIPT
        </text>
      </g>

      <g data-assembled stroke="#240B21" fill="#240B21" opacity="0">
        <line x1="600" y1="90" x2="600" y2="58" strokeWidth="1" />
        <path d="M600 58 l-4 8 h8 z" />
        <text
          x="588"
          y="108"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          NZ
        </text>
      </g>

      <g data-assemble-stamp opacity="0">
        <rect x="500" y="340" width="100" height="42" fill="none" stroke="#916A70" strokeWidth="1.2" />
        <text
          x="550"
          y="358"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#916A70"
          letterSpacing="1.4"
        >
          DEMO
        </text>
        <text
          x="550"
          y="372"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="8"
          fill="#654A4E"
        >
          not lodged
        </text>
      </g>
    </>
  );
}

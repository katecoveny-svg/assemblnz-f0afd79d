/** SVG underlay + assemble parts for Forge dealership floor plate. */

/** Assembled isometric-ish floor plate used by PlanPins. */
export function ForgeFloorUnderlay() {
  return (
    <>
      {/* Building envelope */}
      <g stroke="#240B21" fill="none" strokeLinejoin="miter">
        <rect x="60" y="50" width="520" height="320" strokeWidth="2.4" />
        {/* Showroom */}
        <rect x="60" y="50" width="200" height="140" strokeWidth="1.8" />
        {/* Workshop */}
        <rect x="260" y="50" width="320" height="220" strokeWidth="1.8" />
        {/* WoF bay */}
        <rect x="280" y="80" width="110" height="160" strokeWidth="2" stroke="#916A70" />
        {/* Service bays */}
        <rect x="410" y="80" width="70" height="160" strokeWidth="1.6" />
        <rect x="490" y="80" width="70" height="160" strokeWidth="1.6" />
        {/* Parts / finance desk */}
        <rect x="60" y="210" width="180" height="160" strokeWidth="1.6" />
        <rect x="80" y="240" width="140" height="50" strokeWidth="1.2" strokeDasharray="4 3" />
        {/* Drive aisle */}
        <line
          x1="260"
          y1="300"
          x2="580"
          y2="300"
          strokeWidth="1.2"
          strokeDasharray="8 6"
          opacity="0.7"
        />
      </g>

      {/* Chassis silhouette in WoF bay */}
      <g stroke="#240B21" fill="none">
        <rect x="298" y="130" width="74" height="36" rx="4" strokeWidth="1.8" />
        <circle cx="312" cy="172" r="10" strokeWidth="1.6" />
        <circle cx="358" cy="172" r="10" strokeWidth="1.6" />
        <line x1="298" y1="148" x2="372" y2="148" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Lift posts */}
      <g stroke="#654A4E" fill="none">
        <line x1="290" y1="100" x2="290" y2="230" strokeWidth="2" />
        <line x1="380" y1="100" x2="380" y2="230" strokeWidth="2" />
        <line x1="290" y1="120" x2="380" y2="120" strokeWidth="1.4" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
      >
        <text x="90" y="80">
          SHOWROOM
        </text>
        <text x="300" y="72" fill="#916A70">
          WOF BAY
        </text>
        <text x="420" y="72">
          BAY 3
        </text>
        <text x="500" y="72">
          BAY 4
        </text>
        <text x="90" y="235">
          PARTS
        </text>
        <text x="90" y="320">
          FINANCE DESK
        </text>
        <text x="300" y="330">
          DRIVE AISLE
        </text>
      </g>

      {/* North */}
      <g stroke="#240B21" fill="#240B21">
        <line x1="600" y1="90" x2="600" y2="58" strokeWidth="1" />
        <path d="M600 58 l-4 8 h8 z" />
        <text
          x="595"
          y="108"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          N
        </text>
      </g>
    </>
  );
}

/** Flat-lay → assemble parts for BlueprintScene. */
export function ForgeAssembleParts() {
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
          FLAT LAY · SERVICE PARTS
        </text>
        <text x="460" y="28">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      {/* Envelope */}
      <g
        data-part
        data-sx="-40"
        data-sy="-24"
        data-sr="-3"
        stroke="#240B21"
        fill="none"
        strokeLinejoin="miter"
      >
        <rect x="60" y="50" width="520" height="320" strokeWidth="2.4" />
        <rect x="60" y="50" width="200" height="140" strokeWidth="1.8" />
        <rect x="260" y="50" width="320" height="220" strokeWidth="1.8" />
        <rect x="60" y="210" width="180" height="160" strokeWidth="1.6" />
      </g>

      {/* WoF bay */}
      <g data-part data-sx="56" data-sy="-36" data-sr="7" stroke="#916A70" fill="none">
        <rect x="280" y="80" width="110" height="160" strokeWidth="2" />
        <line x1="290" y1="100" x2="290" y2="230" strokeWidth="2" stroke="#654A4E" />
        <line x1="380" y1="100" x2="380" y2="230" strokeWidth="2" stroke="#654A4E" />
        <line x1="290" y1="120" x2="380" y2="120" strokeWidth="1.4" stroke="#654A4E" />
      </g>

      {/* Chassis */}
      <g data-part data-sx="-48" data-sy="42" data-sr="-8" stroke="#240B21" fill="none">
        <rect x="298" y="130" width="74" height="36" rx="4" strokeWidth="1.8" />
        <line x1="298" y1="148" x2="372" y2="148" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Wheels */}
      <g data-part data-sx="64" data-sy="50" data-sr="14" stroke="#240B21" fill="none">
        <circle cx="312" cy="172" r="10" strokeWidth="1.6" />
        <circle cx="358" cy="172" r="10" strokeWidth="1.6" />
      </g>

      {/* Service bays + finance desk */}
      <g data-part data-sx="30" data-sy="-48" data-sr="5" stroke="#240B21" fill="none">
        <rect x="410" y="80" width="70" height="160" strokeWidth="1.6" />
        <rect x="490" y="80" width="70" height="160" strokeWidth="1.6" />
        <rect x="80" y="240" width="140" height="50" strokeWidth="1.2" strokeDasharray="4 3" />
        <line
          x1="260"
          y1="300"
          x2="580"
          y2="300"
          strokeWidth="1.2"
          strokeDasharray="8 6"
          opacity="0.7"
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
        <text x="90" y="80">
          SHOWROOM
        </text>
        <text x="300" y="72" fill="#916A70">
          WOF BAY
        </text>
        <text x="420" y="72">
          BAY 3
        </text>
        <text x="500" y="72">
          BAY 4
        </text>
        <text x="90" y="235">
          PARTS
        </text>
        <text x="90" y="320">
          FINANCE DESK
        </text>
        <text x="300" y="330">
          DRIVE AISLE
        </text>
      </g>

      <g data-assembled stroke="#240B21" fill="#240B21" opacity="0">
        <line x1="600" y1="90" x2="600" y2="58" strokeWidth="1" />
        <path d="M600 58 l-4 8 h8 z" />
        <text
          x="595"
          y="108"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          N
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

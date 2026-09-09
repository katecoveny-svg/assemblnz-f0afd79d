/** SVG underlay + assemble parts for Ensemble studio floor plate / brand board. */

/** Assembled studio floor plate used by PlanPins. */
export function EnsembleFloorUnderlay() {
  return (
    <>
      {/* Building envelope */}
      <g stroke="#240B21" fill="none" strokeLinejoin="miter">
        <rect x="60" y="50" width="520" height="320" strokeWidth="2.4" />
        {/* Brand board wall */}
        <rect x="60" y="50" width="200" height="160" strokeWidth="1.8" />
        {/* Print / imposition bay */}
        <rect x="260" y="50" width="320" height="200" strokeWidth="1.8" />
        {/* Campaign set dock — dusty rose accent */}
        <rect x="280" y="75" width="130" height="150" strokeWidth="2" stroke="#916A70" />
        {/* Type + asset shelves */}
        <rect x="430" y="75" width="70" height="150" strokeWidth="1.6" />
        <rect x="510" y="75" width="50" height="150" strokeWidth="1.6" />
        {/* Briefing desk + review table */}
        <rect x="60" y="230" width="180" height="140" strokeWidth="1.6" />
        <rect x="80" y="260" width="140" height="50" strokeWidth="1.2" strokeDasharray="4 3" />
        {/* Circulation */}
        <line
          x1="260"
          y1="290"
          x2="580"
          y2="290"
          strokeWidth="1.2"
          strokeDasharray="8 6"
          opacity="0.7"
        />
      </g>

      {/* Campaign forme silhouette in dock */}
      <g stroke="#240B21" fill="none">
        <rect x="298" y="110" width="94" height="70" strokeWidth="1.8" />
        <line x1="310" y1="128" x2="380" y2="128" strokeWidth="1.2" />
        <line x1="310" y1="142" x2="360" y2="142" strokeWidth="1" opacity="0.55" />
        <line x1="310" y1="154" x2="370" y2="154" strokeWidth="1" opacity="0.55" />
      </g>

      {/* Brand board columns */}
      <g stroke="#654A4E" fill="none">
        <line x1="90" y1="80" x2="90" y2="180" strokeWidth="1.4" />
        <line x1="130" y1="80" x2="130" y2="180" strokeWidth="1.4" />
        <line x1="170" y1="80" x2="170" y2="180" strokeWidth="1.4" />
        <rect x="95" y="95" width="28" height="36" strokeWidth="1.2" stroke="#916A70" />
        <rect x="135" y="110" width="28" height="28" strokeWidth="1.2" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
      >
        <text x="90" y="72">
          BRAND BOARD
        </text>
        <text x="300" y="68" fill="#916A70">
          CAMPAIGN SET
        </text>
        <text x="438" y="68">
          TYPE
        </text>
        <text x="516" y="68">
          ASSETS
        </text>
        <text x="90" y="255">
          BRIEF DESK
        </text>
        <text x="90" y="340">
          REVIEW TABLE
        </text>
        <text x="300" y="320">
          STUDIO AISLE
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
export function EnsembleAssembleParts() {
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
          FLAT LAY · CAMPAIGN FORMES
        </text>
        <text x="460" y="28">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      {/* Envelope + brand board / print bay */}
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
        <rect x="60" y="50" width="200" height="160" strokeWidth="1.8" />
        <rect x="260" y="50" width="320" height="200" strokeWidth="1.8" />
        <rect x="60" y="230" width="180" height="140" strokeWidth="1.6" />
      </g>

      {/* Campaign set dock */}
      <g data-part data-sx="56" data-sy="-36" data-sr="7" stroke="#916A70" fill="none">
        <rect x="280" y="75" width="130" height="150" strokeWidth="2" />
      </g>

      {/* Type sheet forme */}
      <g data-part data-sx="-48" data-sy="42" data-sr="-8" stroke="#240B21" fill="none">
        <rect x="298" y="110" width="94" height="70" strokeWidth="1.8" />
        <line x1="310" y1="128" x2="380" y2="128" strokeWidth="1.2" />
        <line x1="310" y1="142" x2="360" y2="142" strokeWidth="1" opacity="0.55" />
        <line x1="310" y1="154" x2="370" y2="154" strokeWidth="1" opacity="0.55" />
      </g>

      {/* Brand board marks */}
      <g data-part data-sx="64" data-sy="50" data-sr="14" stroke="#654A4E" fill="none">
        <line x1="90" y1="80" x2="90" y2="180" strokeWidth="1.4" />
        <line x1="130" y1="80" x2="130" y2="180" strokeWidth="1.4" />
        <line x1="170" y1="80" x2="170" y2="180" strokeWidth="1.4" />
        <rect x="95" y="95" width="28" height="36" strokeWidth="1.2" stroke="#916A70" />
        <rect x="135" y="110" width="28" height="28" strokeWidth="1.2" />
      </g>

      {/* Type + asset shelves + desk */}
      <g data-part data-sx="30" data-sy="-48" data-sr="5" stroke="#240B21" fill="none">
        <rect x="430" y="75" width="70" height="150" strokeWidth="1.6" />
        <rect x="510" y="75" width="50" height="150" strokeWidth="1.6" />
        <rect x="80" y="260" width="140" height="50" strokeWidth="1.2" strokeDasharray="4 3" />
        <line
          x1="260"
          y1="290"
          x2="580"
          y2="290"
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
        <text x="90" y="72">
          BRAND BOARD
        </text>
        <text x="300" y="68" fill="#916A70">
          CAMPAIGN SET
        </text>
        <text x="438" y="68">
          TYPE
        </text>
        <text x="516" y="68">
          ASSETS
        </text>
        <text x="90" y="255">
          BRIEF DESK
        </text>
        <text x="90" y="340">
          REVIEW TABLE
        </text>
        <text x="300" y="320">
          STUDIO AISLE
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
          not published
        </text>
      </g>
    </>
  );
}

/** SVG underlay + assemble parts for Arc harbour terrace GA. */

export function ArcTerraceUnderlay() {
  return (
    <>
      <g stroke="#240B21" fill="none" strokeLinejoin="miter">
        <rect x="90" y="70" width="420" height="250" strokeWidth="3.2" />
        <line x1="270" y1="70" x2="270" y2="210" strokeWidth="2" />
        <line x1="90" y1="210" x2="270" y2="210" strokeWidth="2" />
        <line x1="360" y1="210" x2="510" y2="210" strokeWidth="2" />
        <line x1="360" y1="210" x2="360" y2="320" strokeWidth="2" />
        <rect x="430" y="230" width="80" height="90" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="430"
            y1={248 + i * 14}
            x2="510"
            y2={248 + i * 14}
            strokeWidth="1"
            opacity="0.75"
          />
        ))}
        <rect x="360" y="210" width="70" height="55" strokeWidth="2" />
        <circle cx="395" cy="238" r="14" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
        <rect
          x="90"
          y="320"
          width="220"
          height="48"
          strokeWidth="1.6"
          strokeDasharray="6 4"
          opacity="0.9"
        />
        <path d="M190 210 A22 22 0 0 1 212 232" strokeWidth="1.2" stroke="#654A4E" />
        <path d="M270 130 A20 20 0 0 1 290 150" strokeWidth="1.2" stroke="#654A4E" />
      </g>

      <g
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
      >
        <text x="140" y="145">
          BED 1
        </text>
        <text x="140" y="265">
          LIVING / KITCHEN
        </text>
        <text x="310" y="145">
          BED 2
        </text>
        <text x="372" y="242">
          WC
        </text>
        <text x="448" y="280">
          STAIR
        </text>
        <text x="155" y="348" fill="#916A70">
          DECK
        </text>
      </g>

      <g stroke="#240B21" fill="#240B21">
        <line x1="90" y1="52" x2="510" y2="52" strokeWidth="0.8" />
        <line x1="90" y1="48" x2="90" y2="56" strokeWidth="0.8" />
        <line x1="510" y1="48" x2="510" y2="56" strokeWidth="0.8" />
        <text
          x="300"
          y="46"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          12 400
        </text>
        <line x1="580" y1="90" x2="580" y2="58" strokeWidth="1" />
        <path d="M580 58 l-4 8 h8 z" />
        <text
          x="575"
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

export function ArcAssembleParts() {
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
          FLAT LAY · PARTS
        </text>
        <text x="480" y="28">
          SCROLL TO ASSEMBLE
        </text>
      </g>

      <g
        data-part
        data-sx="-48"
        data-sy="-28"
        data-sr="-4"
        stroke="#240B21"
        fill="none"
        strokeLinejoin="miter"
      >
        <rect x="90" y="70" width="420" height="250" strokeWidth="3.2" />
        <line x1="270" y1="70" x2="270" y2="210" strokeWidth="2" />
        <line x1="90" y1="210" x2="270" y2="210" strokeWidth="2" />
        <line x1="360" y1="210" x2="510" y2="210" strokeWidth="2" />
        <line x1="360" y1="210" x2="360" y2="320" strokeWidth="2" />
      </g>

      <g data-part data-sx="72" data-sy="36" data-sr="8" stroke="#240B21" fill="none">
        <rect x="430" y="230" width="80" height="90" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="430"
            y1={248 + i * 14}
            x2="510"
            y2={248 + i * 14}
            strokeWidth="1"
            opacity="0.75"
          />
        ))}
      </g>

      <g data-part data-sx="54" data-sy="-42" data-sr="6" stroke="#240B21" fill="none">
        <rect x="360" y="210" width="70" height="55" strokeWidth="2" />
        <circle cx="395" cy="238" r="14" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
      </g>

      <g data-part data-sx="-36" data-sy="58" data-sr="-3" stroke="#240B21" fill="none">
        <rect
          x="90"
          y="320"
          width="220"
          height="48"
          strokeWidth="1.6"
          strokeDasharray="6 4"
          opacity="0.9"
        />
      </g>

      <g data-part data-sx="20" data-sy="-50" data-sr="12" stroke="#654A4E" fill="none">
        <path d="M190 210 A22 22 0 0 1 212 232" strokeWidth="1.2" />
        <path d="M270 130 A20 20 0 0 1 290 150" strokeWidth="1.2" />
        <line x1="150" y1="70" x2="210" y2="70" strokeWidth="4" stroke="#FFFDFB" />
        <line x1="320" y1="70" x2="390" y2="70" strokeWidth="4" stroke="#FFFDFB" />
      </g>

      <g
        data-assembled
        fill="#654A4E"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="10"
        letterSpacing="0.8"
        opacity="0"
      >
        <text x="140" y="145">
          BED 1
        </text>
        <text x="140" y="265">
          LIVING / KITCHEN
        </text>
        <text x="310" y="145">
          BED 2
        </text>
        <text x="372" y="242">
          WC
        </text>
        <text x="448" y="280">
          STAIR
        </text>
        <text x="155" y="348" fill="#916A70">
          DECK
        </text>
      </g>

      <g data-assembled stroke="#240B21" fill="#240B21" opacity="0">
        <line x1="90" y1="52" x2="510" y2="52" strokeWidth="0.8" />
        <line x1="90" y1="48" x2="90" y2="56" strokeWidth="0.8" />
        <line x1="510" y1="48" x2="510" y2="56" strokeWidth="0.8" />
        <text
          x="300"
          y="46"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          12 400
        </text>
        <line x1="580" y1="90" x2="580" y2="58" strokeWidth="1" />
        <path d="M580 58 l-4 8 h8 z" />
        <text
          x="575"
          y="108"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
          fill="#654A4E"
        >
          N
        </text>
      </g>

      <g data-assemble-stamp opacity="0">
        <rect x="520" y="340" width="88" height="42" fill="none" stroke="#916A70" strokeWidth="1.2" />
        <text
          x="564"
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
          x="564"
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

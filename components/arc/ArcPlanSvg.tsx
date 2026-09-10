/** SVG underlay + assemble parts for Arc harbour terrace GA. */

/** Drafting detail for the existing fictional plan; room geometry and flag anchors stay fixed. */
function ArcPlanDetail() {
  return (
    <g aria-hidden="true">
      <g fill="#F5F1F2">
        <rect x="92" y="72" width="176" height="136" />
        <rect x="272" y="72" width="236" height="136" />
        <rect x="362" y="212" width="66" height="51" />
      </g>
      <g stroke="#916A70" strokeWidth="0.35" opacity="0.22">
        {Array.from({ length: 25 }, (_, i) => <line key={i} x1={98 + i * 10} y1="215" x2={98 + i * 10} y2="317" />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`deck-${i}`} x1="92" y1={325 + i * 6} x2="308" y2={325 + i * 6} />)}
      </g>
      <g stroke="#654A4E" strokeWidth="0.7" fill="#FFFDFB">
        {/* Bedroom joinery and beds. */}
        {[112, 312].map((x) => (
          <g key={x}>
            <rect x={x} y="86" width="67" height="43" />
            <path d={`M${x} 98h67 M${x + 8} 90h20v6h-20z M${x + 38} 90h20v6h-20z`} />
            <rect x={x - 12} y="86" width="8" height="11" />
            <rect x={x + 71} y="86" width="8" height="11" />
          </g>
        ))}
        <path d="M103 173h101v24H103z M128 173v24 M153 173v24 M178 173v24 M291 174h110v22H291z M318 174v22 M345 174v22 M372 174v22" />
        {/* Kitchen bench, sink and hob. */}
        <path d="M106 224h129v22H106z M110 228h30v14h-30z M118 228v14 M183 224v22 M207 224v22" />
        <circle cx="191" cy="231" r="3" /><circle cx="200" cy="239" r="3" />
        <circle cx="191" cy="239" r="3" /><circle cx="200" cy="231" r="3" />
        {/* Living room furniture and dining setting. */}
        <rect x="109" y="280" width="69" height="27" rx="2" />
        <path d="M113 284h61v15h-61z M144 284v15" />
        <rect x="190" y="283" width="29" height="19" rx="4" />
        <rect x="285" y="250" width="37" height="45" rx="2" />
        <path d="M275 255h7v13h-7z M275 279h7v13h-7z M325 255h7v13h-7z M325 279h7v13h-7z" />
        {/* Glazing: double lines and reveals on the original exterior wall. */}
        <path d="M130 68h77v5h-77z M325 68h73v5h-73z M507 116h5v62h-5z M115 318h79v5h-79z M220 318h71v5h-71z" />
        <path d="M130 70.5h77 M325 70.5h73 M509.5 116v62 M115 320.5h79 M220 320.5h71" />
      </g>
      <g stroke="#654A4E" strokeWidth="0.6" fill="none" opacity="0.5">
        <path d="M69 70v250 M64 70h10 M64 210h10 M64 320h10 M90 388h220 M90 383v10 M310 383v10" />
        <path d="M434 239h69 M434 253h69 M434 267h69 M434 281h69 M434 295h69 M434 309h69" />
        <path d="M469 303v-65m-3 5 3-5 3 5" />
      </g>
    </g>
  );
}

export function ArcTerraceUnderlay() {
  return (
    <>
      <ArcPlanDetail />
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
      <g data-assembled opacity="0"><ArcPlanDetail /></g>
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

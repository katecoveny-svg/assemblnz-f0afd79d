import type { CSSProperties } from 'react';
import styles from './TaskArt.module.css';

/**
 * Illustrated jobs for the Today board. Each scene acts out its task:
 * a gentle loop at rest, the full gesture on hover, focus or when the tile is open.
 * Pure SVG and CSS. Nothing here implies a live connection.
 */
const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const rays = [0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
  const r = (angle * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  return `M${(150 + c * 23).toFixed(1)} ${(30 + s * 23).toFixed(1)}L${(150 + c * 28).toFixed(1)} ${(30 + s * 28).toFixed(1)}`;
}).join('');

export function TaskArt({ kind, className }: { kind: string; className?: string }) {
  return <svg className={`${styles.art} ${className ?? ''}`} data-kind={kind} viewBox="0 0 200 120" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${kind}-plum`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#654A4E" /><stop offset="1" stopColor="#240B21" /></linearGradient>
      <linearGradient id={`${kind}-lilac`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ECE6FB" /><stop offset="1" stopColor="#C6BBE6" /></linearGradient>
      <linearGradient id={`${kind}-petal`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F5E0EC" /><stop offset="1" stopColor="#D9AEC8" /></linearGradient>
      <linearGradient id={`${kind}-rose`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B88F98" /><stop offset="1" stopColor="#7E5960" /></linearGradient>
      <linearGradient id={`${kind}-paper`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFDFB" /><stop offset="1" stopColor="#F2EAEE" /></linearGradient>
    </defs>

    {kind === 'briefing' && <>
      <g data-in style={d(0)}><g data-part="sun"><circle cx="150" cy="30" r="17" fill={`url(#${kind}-petal)`} /><path d={rays} stroke="#DDB3CD" strokeWidth="3" strokeLinecap="round" /></g></g>
      <g data-in style={d(80)}><rect x="38" y="52" width="124" height="60" rx="10" fill={`url(#${kind}-lilac)`} /><path d="M40 58 100 26l60 32" fill="#D7CCEE" /></g>
      <g data-in style={d(160)}><g data-part="letter">
        <rect x="56" y="30" width="88" height="62" rx="6" fill={`url(#${kind}-paper)`} />
        <path data-part="line" pathLength="1" d="M68 44h52" stroke="#C8A7BB" strokeWidth="4" strokeLinecap="round" style={d(0)} />
        <path data-part="line" pathLength="1" d="M68 55h38" stroke="#C8A7BB" strokeWidth="4" strokeLinecap="round" style={d(120)} />
        <path data-part="line" pathLength="1" d="M68 66h46" stroke="#E0C2CE" strokeWidth="4" strokeLinecap="round" style={d(240)} />
      </g></g>
      <g data-in style={d(240)}><path d="M38 62l62 32 62-32v42a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8z" fill={`url(#${kind}-petal)`} /><path d="M40 108l44-26m76 26-44-26" stroke="#FFFDFB" strokeOpacity=".6" strokeWidth="2" /></g>
      <g data-in style={d(320)}><g data-part="badge"><circle cx="146" cy="46" r="12" fill={`url(#${kind}-plum)`} /><path d="m140.5 46 4 4 7.5-8.5" stroke="#FFFDFB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></g></g>
    </>}

    {kind === 'travel' && <>
      <g data-in style={d(0)}><path data-part="route" d="M18 96C52 34 128 18 186 40" stroke="#916A70" strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" /></g>
      <g data-in style={d(60)}><path data-part="cloud" d="M22 44h34a8 8 0 0 0-3-15 11 11 0 0 0-21-3 9 9 0 0 0-10 18z" fill="#FFFDFB" /></g>
      <g data-in style={d(120)}><rect x="46" y="56" width="118" height="50" rx="8" fill={`url(#${kind}-lilac)`} transform="rotate(-8 105 81)" /></g>
      <g data-in style={d(200)}><g data-part="ticket">
        <path d="M54 60h114v13a8 8 0 0 0 0 16v13H54V89a8 8 0 0 0 0-16z" fill={`url(#${kind}-paper)`} />
        <path d="M140 63v36" stroke="#C8A7BB" strokeDasharray="3 4" />
        <path d="M66 74h40M66 84h54M66 94h28" stroke="#E3D3DD" strokeWidth="4" strokeLinecap="round" />
        <path d="M150 74h8m-8 10h8m-8 10h5" stroke="#916A70" strokeWidth="2.5" strokeLinecap="round" />
      </g></g>
      <g data-in style={d(300)}><g data-part="plane"><path d="M120 34l38-12-13 29-6-12z" fill={`url(#${kind}-plum)`} /><path d="m139 39 19-17" stroke="#EAC8DF" strokeWidth="1.5" /><path d="m139 39-3 9 9-6" fill="#492B3E" /></g></g>
    </>}

    {kind === 'dinner' && <>
      <g data-in style={d(0)}><ellipse cx="100" cy="104" rx="80" ry="10" fill="#E6D6D2" /></g>
      <g data-in style={d(80)}><ellipse cx="100" cy="88" rx="46" ry="17" fill={`url(#${kind}-paper)`} /><ellipse cx="100" cy="87" rx="31" ry="10.5" stroke="#E0C2CE" strokeWidth="2.5" /><g data-part="food"><path d="M90 86q8-9 16-1-8 7-16 1" fill="#928C75" /><circle cx="108" cy="88" r="5" fill={`url(#${kind}-rose)`} /><circle cx="96" cy="90" r="3" fill="#EAC8DF" /></g></g>
      <g data-in style={d(140)}><path d="M40 68v34m-5-34v9q5 6 10 0v-9" stroke="#654A4E" strokeWidth="2.5" strokeLinecap="round" /><path d="M160 68v34m0-34q9 10 0 19" stroke="#654A4E" strokeWidth="2.5" strokeLinecap="round" /></g>
      <g data-in style={d(220)}><g data-part="glassL">
        <path d="M66 18h22l-2 19a9 9 0 0 1-18 0z" fill={`url(#${kind}-lilac)`} fillOpacity=".9" /><path data-part="wine" d="M68.5 29h17l-1 8a7.6 7.6 0 0 1-15 0z" fill={`url(#${kind}-rose)`} />
        <path d="M77 46v15m-7 1h14" stroke="#B39AA8" strokeWidth="2.5" strokeLinecap="round" />
      </g></g>
      <g data-in style={d(260)}><g data-part="glassR">
        <path d="M112 18h22l-2 19a9 9 0 0 1-18 0z" fill={`url(#${kind}-lilac)`} fillOpacity=".9" /><path data-part="wine" d="M114.5 29h17l-1 8a7.6 7.6 0 0 1-15 0z" fill={`url(#${kind}-rose)`} />
        <path d="M123 46v15m-7 1h14" stroke="#B39AA8" strokeWidth="2.5" strokeLinecap="round" />
      </g></g>
      <g data-part="spark"><path d="M100 4l2.4 5.6L108 12l-5.6 2.4L100 20l-2.4-5.6L92 12l5.6-2.4z" fill="#EAC8DF" /><circle cx="112" cy="8" r="2" fill="#DAD2F4" /><circle cx="88" cy="16" r="1.6" fill="#DAD2F4" /></g>
    </>}

    {kind === 'appointments' && <>
      <g data-in style={d(0)}><rect x="40" y="28" width="104" height="80" rx="10" fill={`url(#${kind}-lilac)`} transform="rotate(-7 92 68)" /></g>
      <g data-in style={d(100)}><g data-part="page">
        <rect x="50" y="24" width="104" height="82" rx="10" fill={`url(#${kind}-paper)`} />
        <path d="M50 34a10 10 0 0 1 10-10h84a10 10 0 0 1 10 10v8H50z" fill={`url(#${kind}-plum)`} />
        <path d="M72 16v14m60-14v14" stroke="#492B3E" strokeWidth="4" strokeLinecap="round" />
        <g fill="#EBE1E7">{[56, 72, 88].flatMap(y => [62, 80, 98, 116, 134].map(x => <rect key={`${x}-${y}`} x={x} y={y - 4} width="10" height="8" rx="3" />))}</g>
        <circle data-part="date" cx="121" cy="72" r="10" fill="#EAC8DF" /><rect x="116" y="68" width="10" height="8" rx="3" fill="#916A70" />
      </g></g>
      <g data-in style={d(200)}><circle cx="166" cy="40" r="17" fill={`url(#${kind}-paper)`} stroke="#DAD2F4" strokeWidth="3" /><path d="M166 40v-8" stroke="#492B3E" strokeWidth="2.5" strokeLinecap="round" /><path data-part="hand" d="M166 40h10" stroke="#916A70" strokeWidth="2.5" strokeLinecap="round" /><circle cx="166" cy="40" r="2.4" fill="#492B3E" /></g>
      <g data-in style={d(300)}><g data-part="badge"><circle cx="148" cy="94" r="12" fill={`url(#${kind}-plum)`} /><path d="m142.5 94 4 4 7.5-8.5" stroke="#FFFDFB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></g></g>
    </>}

    {kind === 'shopping' && <>
      <g data-in style={d(0)}><g data-part="hanger">
        <path d="M76 14a6 6 0 1 1 6 6v6" stroke="#654A4E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 40l32-14 32 14" stroke="#654A4E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M54 38l16-6q12 10 24 0l16 6 10 16-12 6-6-8v46H62V52l-6 8-12-6z" fill={`url(#${kind}-rose)`} />
        <path d="M70 32q12 12 24 0" stroke="#EAC8DF" strokeWidth="3" />
        <path d="M70 72h24m-24 7h24" stroke="#A88089" strokeWidth="2" />
        <g data-part="tag"><path d="M114 44l10 12" stroke="#B39AA8" strokeWidth="1.5" /><path d="M119 55l14-4 6 20-14 4z" fill={`url(#${kind}-paper)`} /><circle cx="124" cy="57" r="1.8" fill="#916A70" /><path d="M123 63l9-2.5m-7.5 7 6-1.6" stroke="#D8C2CF" strokeWidth="2" strokeLinecap="round" /></g>
      </g></g>
      <g data-in style={d(160)}><rect x="134" y="80" width="42" height="28" rx="4" fill={`url(#${kind}-lilac)`} /><path d="M155 80v28" stroke={`url(#${kind}-plum)`} strokeWidth="5" /></g>
      <g data-in style={d(240)}><g data-part="lid"><rect x="130" y="71" width="50" height="11" rx="3" fill="#CDBFEA" /><path d="M155 71v11" stroke="#492B3E" strokeWidth="5" /><path d="M155 71q-13-13-15 0 2 4 15 0 13-13 15 0-2 4-15 0" fill={`url(#${kind}-rose)`} /></g></g>
    </>}

    {kind === 'meals' && <>
      <g data-in style={d(0)}><ellipse cx="100" cy="108" rx="64" ry="8" fill="#DECACA" /></g>
      <g>{[78, 100, 122].map((x, index) => <path key={x} data-part="steam" d={`M${x} 48q-6-7 0-14t0-14`} stroke="#C8A7BB" strokeWidth="3" strokeLinecap="round" style={d(index * 700)} />)}</g>
      <g data-in style={d(100)}><ellipse cx="100" cy="66" rx="56" ry="16" fill={`url(#${kind}-paper)`} /><path d="M44 66h112q-6 40-56 40T44 66" fill={`url(#${kind}-rose)`} /><path d="M58 84q42 18 84 0" stroke="#EAC8DF" strokeOpacity=".5" strokeWidth="2" /><ellipse cx="100" cy="66" rx="45" ry="11" fill="#E6D2C1" /></g>
      <g data-in style={d(200)}><g data-part="food">
        <path d="M72 64q10-9 18 0-9 7-18 0" fill="#928C75" /><path d="M98 58q12-8 19 2-11 6-19-2" fill="#A5A08A" /><path d="M112 68q9-8 16 1-9 6-16-1" fill="#928C75" />
        <circle cx="90" cy="70" r="3.2" fill="#916A70" /><circle cx="122" cy="62" r="2.6" fill="#B88F98" /><circle cx="82" cy="60" r="2.2" fill="#B88F98" />
      </g></g>
      <g data-in style={d(300)}><g data-part="spoon"><path d="M158 34l-30 30" stroke="#654A4E" strokeWidth="3.2" strokeLinecap="round" /><ellipse cx="161" cy="31" rx="7" ry="4.5" transform="rotate(-45 161 31)" fill={`url(#${kind}-plum)`} /></g></g>
    </>}
  </svg>;
}

import { useId } from 'react';

export type DoTaskSceneKind = 'shop' | 'school' | 'writing' | 'agenda' | 'travel' | 'bills' | 'pets' | 'car' | 'property';

/** Original Assembl still lifes. Decorative context, never a task result or live status. */
export function DoTaskScene({ kind, className }: { kind: DoTaskSceneKind; className?: string }) {
  const id = useId().replace(/:/g, '');
  const paper = `url(#${id}-paper)`;
  const glass = `url(#${id}-glass)`;
  const chrome = `url(#${id}-chrome)`;
  const sheet = <g transform="rotate(-8 155 100)"><rect x="106" y="37" width="104" height="132" rx="12" fill={paper} stroke="#916A70" strokeOpacity=".3" /><path d="M126 66h55M126 79h35" stroke="#654A4E" strokeWidth="4" strokeLinecap="round" />{[102, 123, 144].map(y => <g key={y}><rect x="124" y={y - 6} width="10" height="10" rx="3" fill="#916A70" fillOpacity=".35" /><path d={`M145 ${y}h42`} stroke="#654A4E" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" /></g>)}</g>;
  return <svg className={className} viewBox="0 0 320 200" fill="none" aria-hidden="true" focusable="false" data-do-task-scene={kind}>
    <defs>
      <linearGradient id={`${id}-paper`} x1="95" y1="30" x2="214" y2="178" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFDFB" /><stop offset="1" stopColor="#E8DDE2" /></linearGradient>
      <linearGradient id={`${id}-glass`} x1="98" y1="45" x2="235" y2="162" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFDFB" stopOpacity=".92" /><stop offset=".36" stopColor="#EAC8DF" stopOpacity=".65" /><stop offset="1" stopColor="#916A70" stopOpacity=".8" /></linearGradient>
      <linearGradient id={`${id}-chrome`} x1="93" y1="60" x2="211" y2="153" gradientUnits="userSpaceOnUse"><stop stopColor="#654A4E" /><stop offset=".35" stopColor="#FFFDFB" /><stop offset=".5" stopColor="#D5CDD1" /><stop offset="1" stopColor="#492B3E" /></linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#240B21" stopOpacity=".17" /><stop offset="1" stopColor="#240B21" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="160" cy="171" rx="124" ry="20" fill={`url(#${id}-shadow)`} />
    {kind === 'shop' ? <g>
      <path d="M102 106 113 53h26l5 65" fill={paper} stroke="#916A70" /><path d="m113 53 11-12 15 12" fill="#654A4E" /><path d="M164 120c-24-24-25-62-5-81 22 13 28 47 5 81Z" fill="#654A4E" /><path d="M167 118c-1-40 15-64 37-64 10 27-5 51-37 64Z" fill="#916A70" /><path d="m164 119 20-46" stroke="#FFFDFB" strokeOpacity=".6" strokeWidth="2" /><ellipse cx="211" cy="108" rx="23" ry="27" fill="#916A70" /><path d="m207 81 6-10" stroke="#492B3E" strokeWidth="4" strokeLinecap="round" />
      <path d="M82 103h155l-18 61H101Z" fill={glass} stroke="#FFFDFB" strokeWidth="2" /><path d="M101 106 126 75h62l31 31" stroke={chrome} strokeWidth="7" strokeLinecap="round" /><path d="m114 121 5 25m28-25 1 25m28-25-1 25m28-25-5 25" stroke="#FFFDFB" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
    </g> : kind === 'writing' ? <g>
      <g transform="rotate(8 161 100)"><rect x="101" y="32" width="119" height="120" rx="11" fill={paper} stroke="#916A70" strokeOpacity=".3" /><path d="M122 56h65m-65 15h47m-47 16h65" stroke="#654A4E" strokeWidth="3" strokeLinecap="round" /></g>
      <path d="M76 87h166v79H76Z" fill={glass} stroke="#FFFDFB" strokeWidth="2" /><path d="m77 89 82 55 82-55M77 165l57-44m107 44-57-44" stroke="#FFFDFB" strokeWidth="2" /><path d="m225 52 16 9-37 66-16 10 1-19Z" fill={chrome} stroke="#654A4E" strokeWidth="1.5" />
    </g> : kind === 'travel' ? <g>
      <path d="m65 71 59-21 64 21 54-20v106l-54 20-64-21-59 21Z" fill={paper} stroke="#916A70" strokeOpacity=".4" /><path d="M124 51v105m64-85v106" stroke="#916A70" strokeOpacity=".35" /><path d="M86 127c42-75 58 47 127-28" stroke="#916A70" strokeWidth="3" strokeDasharray="5 6" />
      <path d="M189 71c0-26 39-26 39 0 0 18-20 35-20 35s-19-17-19-35Z" fill="#492B3E" /><circle cx="209" cy="69" r="7" fill="#FFFDFB" /><rect x="90" y="99" width="66" height="65" rx="14" fill={glass} stroke="#FFFDFB" strokeWidth="2" /><path d="M112 99v-9h23v9m-24 19v29m23-29v29" stroke={chrome} strokeWidth="5" strokeLinecap="round" />
    </g> : kind === 'school' ? <g>{sheet}<path d="M76 95c0-20 58-20 58 0v66H76Z" fill="#654A4E" /><path d="M94 81v-9h20v9" stroke={chrome} strokeWidth="5" /><rect x="83" y="122" width="44" height="31" rx="9" fill={glass} /><path d="m222 68 10 3-25 88-11 10-1-15Z" fill="#916A70" stroke="#FFFDFB" strokeWidth="2" /></g>
    : kind === 'agenda' ? <g>{sheet}<circle cx="218" cy="128" r="38" fill={glass} stroke="#FFFDFB" strokeWidth="3" /><circle cx="218" cy="128" r="28" fill={paper} /><path d="M218 108v20l15 8" stroke="#492B3E" strokeWidth="3" strokeLinecap="round" /><path d="M111 37v16m25-20v16m25-20v16m25-20v16" stroke={chrome} strokeWidth="6" strokeLinecap="round" /></g>
    : kind === 'bills' ? <g>{sheet}<rect x="185" y="89" width="66" height="82" rx="12" fill="#492B3E" /><rect x="195" y="101" width="46" height="17" rx="4" fill={glass} />{[132, 151].map(y => [201, 218, 235].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#FFFDFB" fillOpacity=".8" />))}</g>
    : kind === 'pets' ? <g>{sheet}<path d="M66 130h101l-12 35H78Z" fill={glass} stroke="#FFFDFB" strokeWidth="2" /><ellipse cx="116" cy="130" rx="50" ry="12" fill={chrome} /><path d="M211 107c-25-19-40 10-21 22l21 15 21-15c19-12 4-41-21-22Z" fill="#916A70" /></g>
    : kind === 'car' ? <g><path d="m89 100 22-43h94l27 43" fill={glass} stroke="#FFFDFB" strokeWidth="3" /><path d="M75 103q85-23 168 0v48H75Z" fill="#654A4E" /><rect x="82" y="142" width="23" height="27" rx="9" fill="#240B21" /><rect x="213" y="142" width="23" height="27" rx="9" fill="#240B21" /><path d="M91 119h26m83 0h26m-89 12h44" stroke={chrome} strokeWidth="8" strokeLinecap="round" /><path d="M119 68h73" stroke="#FFFDFB" strokeOpacity=".7" strokeWidth="3" /></g>
    : <g><path d="m75 97 80-58 83 58" stroke={chrome} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" /><path d="M92 95 155 51l65 44v70H92Z" fill={glass} stroke="#FFFDFB" strokeWidth="2" /><path d="M139 165v-47h32v47" fill="#654A4E" /><rect x="105" y="105" width="21" height="22" rx="4" fill={paper} /><rect x="183" y="105" width="21" height="22" rx="4" fill={paper} /></g>}
  </svg>;
}

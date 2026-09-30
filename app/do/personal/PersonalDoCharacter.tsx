"use client";

import { useId } from "react";
import type { PersonalDoProfile } from "@/apps/do/personal/profile";
import styles from "./identity.module.css";

const silhouette = "M73 40H148C232 40 278 85 278 157C278 232 231 278 148 278H73V40ZM125 90V228H150C197 228 226 204 226 158C226 112 198 90 150 90H125Z";
/** The canonical D and luminous inner dot, with a personal material finish. No connection status implied. */
export function PersonalDoCharacter({ avatar, small = false }: {
  avatar: PersonalDoProfile["avatar"];
  small?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const pale = avatar === "pebble";
  return <span className={styles.character} data-small={small || undefined} data-character={avatar} aria-hidden="true">
    <svg viewBox="0 0 360 340" focusable="false">
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2=".85" y2="1">
          <stop stopColor={pale ? "#FFFDFB" : "#CDA6B4"} /><stop offset=".14" stopColor={pale ? "#EADFE2" : "#916A70"} /><stop offset=".3" stopColor={pale ? "#C0A6B0" : "#543046"} /><stop offset=".5" stopColor={pale ? "#F5F1F2" : "#240B21"} /><stop offset=".79" stopColor={pale ? "#D3BAC4" : "#43203B"} /><stop offset="1" stopColor="#916A70" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#B992A2" /><stop offset=".35" stopColor="#654A4E" /><stop offset=".65" stopColor="#240B21" /><stop offset="1" stopColor="#4C293F" /></linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#FFFDFB" /><stop offset=".25" stopColor="#F0CAD7" /><stop offset=".55" stopColor="#916A70" /><stop offset="1" stopColor="#F3D9E1" /></linearGradient>
        <radialGradient id={`${id}-light`}><stop stopColor="#F6DFE8" stopOpacity=".8" /><stop offset=".35" stopColor="#D9A9BE" stopOpacity=".26" /><stop offset="1" stopColor="#916A70" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-dot`} cx="35%" cy="25%" r="75%"><stop stopColor="#FFFDFB" /><stop offset=".36" stopColor="#FFF3F3" /><stop offset=".7" stopColor="#E9BBCD" /><stop offset="1" stopColor="#916A70" /></radialGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2=".4" y2="1"><stop stopColor="#FFFDFB" stopOpacity=".5" /><stop offset=".55" stopColor="#FFFDFB" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform="translate(8 5)">
        {[22, 18, 14, 10, 6].map(depth => <path key={depth} d={silhouette} fill={`url(#${id}-side)`} fillRule="evenodd" transform={`translate(${depth} ${depth * .55})`} />)}
        <path d={silhouette} fill={`url(#${id}-face)`} fillRule="evenodd" stroke={`url(#${id}-edge)`} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M80 48H148C200 48 237 67 254 103" fill="none" stroke="#FFFDFB" strokeOpacity=".48" strokeWidth="2" strokeLinecap="round" />
        <path d="M125 226V90H150C190 90 216 107 224 139" fill="none" stroke="#240B21" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round" />
        <path d="M84 56H146C184 56 210 63 230 80L182 92C163 85 151 86 126 86V172L84 191Z" fill={`url(#${id}-shine)`} />
        <circle cx="167" cy="157" r="68" fill={`url(#${id}-light)`} />
        <circle className={styles.characterCore} cx="167" cy="155" r="25" fill={`url(#${id}-dot)`} stroke="#FFF1F5" strokeOpacity=".65" />
        <circle cx="159" cy="147" r="9" fill="#FFFDFB" opacity=".45" />
        {avatar === "orbit" && <ellipse cx="168" cy="158" rx="137" ry="45" fill="none" stroke="#E4C0CD" strokeOpacity=".5" strokeWidth="1.8" transform="rotate(-30 168 158)" />}
        {avatar === "spark" && <path d="M288 46V70M276 58H300" stroke="#F5D5E1" strokeWidth="2" strokeLinecap="round" />}
      </g>
    </svg>
  </span>;
}

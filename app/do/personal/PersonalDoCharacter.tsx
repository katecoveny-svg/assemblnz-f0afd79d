"use client";

import { useId } from "react";
import type { PersonalDoProfile } from "@/apps/do/personal/profile";
import styles from "./identity.module.css";

/** Authored vector companions. Decorative, and never a connection or work-state indicator. */
export function PersonalDoCharacter({ avatar, small = false }: {
  avatar: PersonalDoProfile["avatar"];
  small?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const material = `url(#${id}-material)`;
  const edge = `url(#${id}-edge)`;
  return <span className={styles.character} data-small={small || undefined} data-character={avatar} aria-hidden="true">
    <svg viewBox="0 0 320 320" focusable="false">
      <defs>
        <linearGradient id={`${id}-material`} x1=".15" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#F2DDE0" /><stop offset=".19" stopColor="#D2ABB3" /><stop offset=".46" stopColor="#916A70" /><stop offset=".76" stopColor="#654A4E" /><stop offset="1" stopColor="#240B21" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFDFB" stopOpacity=".75" /><stop offset=".5" stopColor="#D6B4BE" stopOpacity=".28" /><stop offset="1" stopColor="#240B21" stopOpacity=".3" /></linearGradient>
        <radialGradient id={`${id}-core`} cx="35%" cy="28%" r="80%"><stop stopColor="#FFFDFB" /><stop offset=".42" stopColor="#EDD0D5" /><stop offset=".8" stopColor="#B38B93" /><stop offset="1" stopColor="#654A4E" /></radialGradient>
        <radialGradient id={`${id}-recess`}><stop stopColor="#240B21" /><stop offset=".75" stopColor="#4C283F" /><stop offset="1" stopColor="#916A70" /></radialGradient>
      </defs>
      {avatar === "bloom" && <g transform="rotate(-12 160 160)">
        {[180, 240, 300, 0, 60, 120].map(angle => <g key={angle} transform={`rotate(${angle} 160 160)`}>
          <path d="M144 171C112 135 98 68 122 37C141 12 177 22 190 51C207 91 189 150 174 174Z" fill="#240B21" opacity=".18" transform="translate(3 6)" />
          <path d="M143 170C111 134 98 66 122 36C141 12 177 22 190 51C207 91 189 150 173 173Z" fill={material} stroke={edge} strokeWidth="1.1" />
          <path d="M124 47C108 81 126 129 143 149" fill="none" stroke="#FFFDFB" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
        </g>)}
        <circle cx="160" cy="160" r="37" fill={`url(#${id}-recess)`} />
        <circle cx="159" cy="157" r="23" fill={`url(#${id}-core)`} stroke={edge} />
      </g>}
      {avatar === "orbit" && <g fill="none" stroke={material} strokeWidth="38">
        <ellipse cx="160" cy="160" rx="115" ry="66" transform="rotate(-40 160 160)" />
        <ellipse cx="160" cy="160" rx="115" ry="66" transform="rotate(40 160 160)" />
        <ellipse cx="160" cy="160" rx="115" ry="66" transform="rotate(40 160 160)" stroke={edge} strokeWidth="1.4" />
        <circle cx="160" cy="160" r="27" fill={`url(#${id}-core)`} stroke={edge} strokeWidth="1" />
      </g>}
      {avatar === "pebble" && <g>
        <path d="M74 85C111 29 218 24 259 100C299 176 232 273 159 278C75 283 25 174 74 85Z" fill={material} stroke={edge} strokeWidth="1.5" />
        <path d="M86 103C102 69 143 51 179 56" fill="none" stroke="#FFFDFB" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="169" cy="158" rx="30" ry="34" transform="rotate(18 169 158)" fill={`url(#${id}-recess)`} />
        <ellipse cx="167" cy="153" rx="19" ry="22" transform="rotate(18 167 153)" fill={`url(#${id}-core)`} />
      </g>}
      {avatar === "spark" && <g>
        <path d="M160 24C180 108 214 140 297 160C214 179 180 214 160 297C140 214 108 179 24 160C108 140 140 108 160 24Z" fill={material} stroke={edge} strokeWidth="1.5" />
        <path d="M160 47C151 107 117 142 57 159" fill="none" stroke="#FFFDFB" strokeOpacity=".4" strokeWidth="2" />
        <circle cx="160" cy="159" r="28" fill={`url(#${id}-recess)`} />
        <circle cx="159" cy="156" r="17" fill={`url(#${id}-core)`} />
      </g>}
    </svg>
  </span>;
}

"use client";

import { useId } from "react";
import type { PersonalDoProfile } from "@/apps/do/personal/profile";
import styles from "./identity.module.css";

/** A personal character sits beside, never replaces, the canonical DO mark. */
export function PersonalDoCharacter({ avatar, small = false }: {
  avatar: PersonalDoProfile["avatar"];
  small?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  return <span className={styles.character} data-small={small || undefined} aria-hidden="true">
    <svg viewBox="0 0 160 160" focusable="false">
      <defs>
        <radialGradient id={id} cx="32%" cy="20%" r="85%">
          <stop offset="0" stopColor="#D8B8BA" />
          <stop offset=".48" stopColor="#916A70" />
          <stop offset="1" stopColor="#240B21" />
        </radialGradient>
      </defs>
      <g fill={`url(#${id})`}>
        {avatar === "bloom" && <>{[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} cx="80" cy="48" rx="23" ry="34" transform={`rotate(${angle} 80 80)`} />)}<circle cx="80" cy="80" r="23" /></>}
        {avatar === "orbit" && <><ellipse cx="80" cy="80" rx="60" ry="31" transform="rotate(-36 80 80)" /><ellipse cx="80" cy="80" rx="60" ry="31" transform="rotate(36 80 80)" /><circle cx="80" cy="80" r="30" /></>}
        {avatar === "pebble" && <><path d="M39 44C58 17 111 18 130 51C151 91 115 137 79 138C37 139 14 84 39 44Z" /><path d="M46 48C56 34 76 28 90 32" fill="none" stroke="#FFFDFB" strokeOpacity=".32" strokeWidth="4" strokeLinecap="round" /></>}
        {avatar === "spark" && <path d="M80 15C89 55 104 70 145 80C104 89 89 104 80 145C70 104 55 89 15 80C55 70 70 55 80 15Z" />}
      </g>
      <circle cx="84" cy="74" r="8" fill="#FFFDFB" opacity=".92" />
    </svg>
  </span>;
}

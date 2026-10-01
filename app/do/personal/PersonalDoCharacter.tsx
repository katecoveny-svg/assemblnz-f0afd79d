"use client";

import type { PersonalDoProfile } from "@/apps/do/personal/profile";
import { DoPresence } from "@/components/do/DoPresence";
import styles from "./identity.module.css";

/** Personal finishes keep the one DO silhouette used in the site and portable controls. */
export function PersonalDoCharacter({ avatar, small = false }: {
  avatar: PersonalDoProfile["avatar"];
  small?: boolean;
}) {
  return <span className={styles.character} data-small={small || undefined} data-character={avatar} aria-hidden="true"><DoPresence size={small ? 'small' : 'large'} finish={avatar === 'pebble' ? 'paper' : 'plum'} />{avatar === 'orbit' && <span className={styles.personalOrbit} />}{avatar === 'spark' && <span className={styles.personalSpark}>＋</span>}</span>;
}

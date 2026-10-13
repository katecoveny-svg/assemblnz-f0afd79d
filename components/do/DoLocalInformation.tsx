'use client';

import { NzCareNavigation } from '@/app/do/personal/NzCareNavigation';
import { LifeAdminLocalUpdates } from '@/app/do/personal/LifeAdminLocalUpdates';
import styles from './do-local-information.module.css';

/** Existing, user-triggered sources. Opening a section does not fetch or grant permission. */
export function DoLocalInformation({ storageScope = 'guest' }: { storageScope?: string }) {
  return <section className={styles.local} aria-label="Local information and support">
    <h2>Check a source when you need it</h2>
    <p>New Zealand references alongside your plan. Check dates and source details before relying on them.</p>
    <details><summary>Weather &amp; public updates<span>Check on request</span></summary><LifeAdminLocalUpdates key={storageScope} /></details>
    <details><summary>Care &amp; later-life guides<span>Official references</span></summary><p>Find official information and questions to ask. DO does not provide health advice, arrange care or monitor anyone.</p><NzCareNavigation storageScope={storageScope} /></details>
  </section>;
}

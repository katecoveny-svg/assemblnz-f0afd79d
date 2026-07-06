'use client';

import { useState } from 'react';
import { draftGearReminderAction } from '@/app/customers/family/ops/actions';

/**
 * Packing lists — pick an activity, get the list, text it straight to the kid,
 * and drop a gear reminder into the week. NZ-specific, boating-family lists.
 * "Text it" opens Messages with the list pre-filled (a real sms: deep link) —
 * nothing sends on its own. Draft-only.
 */

const INK = '#1A1918';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';

type Kit = { key: string; label: string; who: string; items: string[] };

const KITS: Kit[] = [
  { key: 'boating', label: 'Boating day (Hauraki Gulf)', who: 'the crew', items: ['Lifejacket (fitted)', 'Sunhat + SPF50 sunscreen', 'Warm layer / spray jacket', 'Water bottle', 'Non-slip shoes', 'Towel + dry clothes', 'Snacks', 'Seasickness tablets', 'Dry bag for phone'] },
  { key: 'sacred-heart-sport', label: 'Sacred Heart sport / PE', who: 'Jack', items: ['SHC PE uniform', 'Sports shoes', 'Water bottle', 'Sunhat + sunscreen', 'Spare socks', 'Deodorant', 'Mouthguard (if contact)'] },
  { key: 'baradene-netball', label: 'Baradene netball', who: 'Mila', items: ['Red team top', 'Netball shoes', 'Water bottle', 'Bib (if provided)', 'Hair tie', 'Nails trimmed', 'Warm layer for the sideline'] },
  { key: 'school-camp', label: 'School camp', who: 'either', items: ['Sleeping bag + pillow', 'Torch', '3× named clothing sets', 'Raincoat', 'Togs + towel', 'Toiletries', 'Sunhat + sunscreen', 'Water bottle', 'Any medication (named, to the teacher)', 'A book'] },
  { key: 'beach', label: 'Beach day', who: 'the kids', items: ['Togs', 'Towel', 'Sunhat + sunscreen', 'Water + snacks', 'Dry clothes', 'Bucket & spade'] },
  { key: 'sleepover', label: 'Sleepover', who: 'the kids', items: ['PJs', 'Toothbrush', 'Change of clothes', 'Phone charger', 'Sleeping bag', 'A treat to share'] },
];

const chip = (active: boolean, color: string) => ({
  fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: '5px 11px', cursor: 'pointer',
  border: `1px solid ${active ? color : GOLD}55`, color: active ? '#fff' : INK, background: active ? color : 'transparent',
});

export function FamilyPacking() {
  const [sel, setSel] = useState<Kit>(KITS[0]);
  const smsBody = `${sel.label} — packing list:\n${sel.items.map((i) => `• ${i}`).join('\n')}\n\n(from our Family OS)`;
  const smsHref = `sms:&body=${encodeURIComponent(smsBody)}`;

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {KITS.map((k) => (
          <button key={k.key} type="button" onClick={() => setSel(k)} style={chip(sel.key === k.key, CORAL)}>{k.label}</button>
        ))}
      </div>

      <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${GOLD}33`, background: 'linear-gradient(180deg,#ffffff,#fffdf9)', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, fontFamily: 'var(--font-brand-display)' }}>{sel.label}</div>
          <div style={{ fontSize: 11, color: MUTED }}>for {sel.who} · {sel.items.length} things</div>
        </div>
        <ul style={{ margin: '10px 0 0', paddingLeft: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '3px 16px' }}>
          {sel.items.map((it) => <li key={it} style={{ fontSize: 12.5, color: INK }}>{it}</li>)}
        </ul>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <a href={smsHref} style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: SAGE, textDecoration: 'none', borderRadius: 999, padding: '8px 14px' }}>Text it to the kids ↗</a>
          <form action={draftGearReminderAction}>
            <input type="hidden" name="label" value={sel.label} />
            <input type="hidden" name="items" value={sel.items.join(', ')} />
            <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: CORAL, background: 'transparent', border: `1.5px solid ${CORAL}`, borderRadius: 999, padding: '7px 13px', cursor: 'pointer' }}>Add a gear reminder to the week</button>
          </form>
        </div>
        <div style={{ fontSize: 10.5, color: MUTED, marginTop: 8 }}>“Text it” opens Messages with the list ready — you hit send. The reminder lands in the week as a draft for you to approve.</div>
      </div>
    </div>
  );
}

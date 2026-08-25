import type { CSSProperties } from 'react';
import { woolworthsSearch, uberEatsSearch } from '@/lib/family/connectors';
import { draftGroceryOrderAction } from '@/app/customers/family/ops/actions';
import { FamilyDropzone } from '@/components/ops/family/FamilyDropzone';

/**
 * Kitchen + groceries — the Woolworths spoke.
 *
 * Everyday Rewards balance, the family's usual list, an ARC-style "what's for
 * dinner" suggestion grounded in the fridge + this week's specials, and a draft
 * list that can be queued for pickup or Uber Direct delivery. All DRAFT-ONLY:
 * "queue" files a pending request in your approvals — nothing is bought or paid.
 *
 * Countdown / Woolworths NZ green is used only as a scoped accent here (the
 * page stays champagne canon). Pricing + inventory shown are placeholder — a
 * real catalogue needs a Woolworths partnership (see the integration brief);
 * the delivery leg via Uber Direct is the part we can build today.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const SAGE = '#7A8B6F';
const WOOLIES = '#0A7D34';

const USUAL = ['Milk 2L', 'Weet-Bix', 'Wholemeal bread', 'Bananas', 'Beef mince 500g', 'Pasta', 'Tasty cheese block', 'Apples', 'Nut-free muesli bars', 'Coffee'];

const card: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fbfcfb)',
  padding: 14,
};
const label: CSSProperties = { fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED };

function DraftButton({ mode, label: text }: { mode: string; label: string }) {
  return (
    <form action={draftGroceryOrderAction}>
      <input type="hidden" name="mode" value={mode} />
      <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: WOOLIES, border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>{text}</button>
    </form>
  );
}

export function FamilyKitchen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, alignItems: 'start' }}>
      {/* Everyday Rewards + usual list */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: WOOLIES, color: '#fff', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>W</span>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Everyday Rewards</div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: WOOLIES }}>2,140</div>
            <div style={label}>points · ≈ $10.70</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: INK }}>6c<span style={{ fontSize: 12 }}>/L</span></div>
            <div style={label}>fuel offer ready</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>Member •••• 4821 · Woolworths St Heliers</div>

        <p style={{ ...label, marginTop: 14 }}>your family’s usual</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {USUAL.map((it) => (
            <a key={it} href={woolworthsSearch(it)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: INK, textDecoration: 'none', border: `1px solid ${GOLD}44`, borderRadius: 999, padding: '4px 9px', background: '#fbfcfb' }}>{it}</a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>Built from your last few shops · tap any item to open Woolworths</div>
      </div>

      {/* Dinner tonight — ARC-style suggestion */}
      <div style={card}>
        <p style={label}>what’s for dinner tonight?</p>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: INK, marginTop: 6, fontFamily: 'var(--font-brand-display)' }}>Spaghetti bolognese, hidden-veg sauce</div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginTop: 6 }}>
          You’ve mince and pasta in already; this week Countdown has beef mince on special and broccoli’s in season.
          Grate the broccoli and carrot into the sauce — <strong style={{ color: INK }}>nut-free</strong>, feeds four, about <strong style={{ color: WOOLIES }}>$14</strong>.
        </p>
        <div style={{ marginTop: 10, borderTop: `1px solid ${GOLD}22`, paddingTop: 10 }}>
          <p style={label}>missing from your kitchen</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {['Onion', 'Carrot', 'Broccoli', 'Tomato paste', 'Parmesan'].map((it) => (
              <a key={it} href={woolworthsSearch(it)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: WOOLIES, textDecoration: 'none', border: `1px solid ${WOOLIES}44`, borderRadius: 999, padding: '4px 9px', background: `${WOOLIES}0d` }}>{it}</a>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>Ask the assistant for “budget”, “no cook” or “use what’s in the fridge”.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <a href={uberEatsSearch('spaghetti bolognese', 'Kohimarama')} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: INK, textDecoration: 'none', borderRadius: 999, padding: '7px 13px' }}>Order it in via Uber Eats ↗</a>
          <span style={{ fontSize: 12, color: MUTED }}>Uber Eats opens where you finish. Assembl helps you decide.</span>
        </div>
      </div>

      {/* Draft basket → pickup / delivery + Uber Direct flow */}
      <div style={card}>
        <p style={label}>draft basket · 14 items</p>
        <div style={{ fontSize: 12.5, color: INK, marginTop: 6, lineHeight: 1.5 }}>Your usual + tonight’s missing five. Estimated <strong>$96</strong> before Everyday Rewards.</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <DraftButton mode="pickup" label="Queue for pickup (draft)" />
          <DraftButton mode="delivery" label="Queue Uber Direct delivery (draft)" />
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>“Queue” files a draft in your approvals — nothing is bought, paid or sent.</div>

        <div style={{ marginTop: 14, background: `${WOOLIES}0d`, border: `1px solid ${WOOLIES}33`, borderRadius: 12, padding: '10px 12px' }}>
          <p style={{ ...label, color: WOOLIES }}>delivery leg · uber direct</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap', fontSize: 12, color: INK }}>
            <span style={{ fontWeight: 600 }}>Your list</span>
            <span style={{ color: MUTED }}>→</span>
            <span style={{ fontWeight: 600 }}>Uber courier collects from Countdown St Heliers</span>
            <span style={{ color: MUTED }}>→</span>
            <span style={{ fontWeight: 600, color: WOOLIES }}>delivered to the door</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
            Uber Direct is live in NZ and needs no Woolworths deal for the drive. Live pricing, inventory and points
            need a Woolworths partnership — that’s the flagship (see the integration brief).
          </p>
        </div>
      </div>

      {/* Snap it in — receipts, fridge, product photos → the vision agent reads them */}
      <div style={card}>
        <p style={label}>snap it in</p>
        <div style={{ fontSize: 12, color: MUTED, margin: '6px 0 10px', lineHeight: 1.5 }}>A receipt, a fridge photo, or a product — the vision agent reads it and drops what it finds into your week, with a trust score to check.</div>
        <FamilyDropzone
          kinds={[{ key: 'receipt', label: 'Receipt' }, { key: 'fridge', label: 'Fridge / pantry' }, { key: 'product', label: 'Product' }]}
          defaultKind="receipt"
          hint="Read on-device · draft-only · auto-deleted after 30 days"
        />
      </div>

      <div style={{ gridColumn: '1 / -1', fontSize: 12, color: MUTED, borderTop: `1px solid ${GOLD}22`, paddingTop: 8 }}>
        <strong style={{ color: INK }}>Coming next: Uber Direct + Delivereasy partner API.</strong> Books couriers, tracks delivery, and closes the loop end-to-end. Requires commercial accounts (Kate’s pitching both).
      </div>
    </div>
  );
}

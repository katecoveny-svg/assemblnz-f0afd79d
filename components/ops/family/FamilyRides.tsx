import type { CSSProperties } from 'react';
import { mapsDirections, uberDeepLink, delivereasyHome, uberConnectSend } from '@/lib/family/connectors';
import { draftDelivereasyIntakeAction } from '@/app/customers/family/ops/actions';

/**
 * Rides + logistics — the transport spoke of Family OS.
 *
 * Turns the week's pickups into ride options with a fare estimate and a real
 * Uber deep link. Draft-only and confirm-and-tap: no ride is ever requested
 * automatically — the adult opens the pre-filled Uber and taps to book, per
 * the household rule "no Uber without approval". Under-18 solo rides go through
 * Uber Teens on the family profile.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const BLUE = '#6E93A6';
const SAGE = '#7A8B6F';
const CORAL = '#E08A6B';

const HOME = 'Kohimarama, Auckland';

type Ride = {
  who: string;
  trip: string;
  when: string;
  from: string;
  to: string;
  est: string;
  eta: string;
  note?: string;
  teens?: boolean;
};

// Real Auckland school runs (Kate's week). Fares are indicative estimates —
// Uber operates in Auckland and the deep-links are real, but live per-trip
// quotes need Uber's Developer API (the estimate MCP doesn't cover NZ).
const RIDES: Ride[] = [
  {
    who: 'Jack',
    trip: 'Sacred Heart pickup',
    when: 'Weekdays ~3:20pm',
    from: 'Sacred Heart College, Glendowie',
    to: HOME,
    est: '~$18–26',
    eta: 'Auckland · ~5–8 min',
    note: 'Glendowie → Kohimarama, ~6 km. Uber Teens if he’s riding solo. On Aaron’s weeks this is his run.',
    teens: true,
  },
  {
    who: 'Mila',
    trip: 'Baradene pickup',
    when: 'Weekdays ~3:30pm',
    from: 'Baradene College, Remuera',
    to: HOME,
    est: '~$16–23',
    eta: 'Auckland · ~7–10 min',
    note: 'Remuera → Kohimarama, ~5 km. Too young for Uber Teens — an adult confirms and rides, or it’s a parent pickup.',
  },
];

const card: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fbfcfb)',
  padding: 14,
};
function pill(color: string): CSSProperties {
  return { fontSize: 11.5, fontWeight: 600, color, textDecoration: 'none', border: `1px solid ${color}66`, borderRadius: 999, padding: '5px 11px', background: `${color}12`, display: 'inline-block' };
}

export function FamilyRides() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
      {RIDES.map((r) => (
        <div key={r.who + r.trip} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{r.who} · {r.trip}</div>
            {r.teens ? <span style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: BLUE, border: `1px solid ${BLUE}55`, borderRadius: 999, padding: '2px 7px' }}>Uber Teens</span> : null}
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{r.when} · {r.from} → home</div>

          <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>{r.est}</div>
              <div style={{ fontSize: 10.5, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>est. fare</div>
            </div>
            <div style={{ fontSize: 12, color: SAGE, fontWeight: 600 }}>{r.eta}</div>
          </div>

          {r.note ? <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>{r.note}</div> : null}

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <a href={uberDeepLink(r.to, r.from)} target="_blank" rel="noreferrer" style={pill(CORAL)}>Request in Uber (needs approval) ↗</a>
            <a href={mapsDirections(r.to, r.from)} target="_blank" rel="noreferrer" style={pill(BLUE)}>Maps ↗</a>
          </div>
        </div>
      ))}

      <div style={{ ...card, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>Confirm-and-tap only</div>
        <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.55, marginTop: 6 }}>
          I never book a ride for you. Tapping opens Uber with the trip pre-filled — you check the fare and confirm.
          Estimates are indicative (live per-trip quotes need Uber’s Developer API — the estimate tool doesn’t cover NZ). Uber Connect, the parcel courier, covers Auckland. For a child riding solo, use <strong style={{ color: INK }}>Uber Teens</strong> on the family profile.
        </p>
      </div>

      {/* Gear drops — send a courier (two real options: Uber Connect + Delivereasy) */}
      <div style={{ ...card, gridColumn: '1 / -1' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Gear drops — send a courier</div>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>
          Forgotten togs, a kit left at home, a shared plate to school — describe it and send a courier. Two real options; you pick and confirm the fare in-app. Nothing is booked by us.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginTop: 10 }}>
          <div style={{ border: `1px solid ${GOLD}33`, borderRadius: 10, padding: '10px 11px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Uber Connect</div>
            <div style={{ fontSize: 10.5, color: MUTED, margin: '3px 0 8px' }}>Uber’s send-a-parcel courier — <strong style={{ color: SAGE }}>live in Auckland &amp; metro</strong>, up to 20&nbsp;kg. Choose “Uber Connect” in the app.</div>
            <a href={uberConnectSend('Kohimarama, Auckland', 'Sacred Heart College, Glendowie')} target="_blank" rel="noreferrer" style={pill(CORAL)}>Send with Uber Connect ↗</a>
          </div>
          <div style={{ border: `1px solid ${GOLD}33`, borderRadius: 10, padding: '10px 11px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Delivereasy</div>
            <div style={{ fontSize: 10.5, color: MUTED, margin: '3px 0 8px' }}>NZ-owned courier — Auckland / Wellington / Christchurch. Their API is <strong style={{ color: GOLD }}>partner-gated</strong>, so it’s booked by hand today.</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <a href={delivereasyHome()} target="_blank" rel="noreferrer" style={pill(SAGE)}>Send with Delivereasy ↗</a>
              <form action={draftDelivereasyIntakeAction}>
                <button type="submit" style={{ ...pill(GOLD), cursor: 'pointer', background: `${GOLD}12` }}>Draft partner outreach</button>
              </form>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: MUTED, marginTop: 8 }}>
          You tap and confirm the fare — we never dispatch. Rural coverage varies; where neither courier runs, it’s a manual drop. We’ve drafted a Delivereasy partner outreach — it’s waiting in your approvals.
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1', fontSize: 10.5, color: MUTED, borderTop: `1px solid ${GOLD}22`, paddingTop: 8 }}>
        <strong style={{ color: INK }}>Coming next: Uber Direct + Delivereasy partner API.</strong> Books couriers, tracks delivery, and closes the loop end-to-end. Requires commercial accounts (Kate’s pitching both).
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';
import { mapsDirections, uberDeepLink } from '@/lib/family/connectors';

/**
 * Rides + logistics — the transport spoke of Family OS.
 *
 * Turns the week's pickups into ride options with a fare estimate and a real
 * Uber deep link. Draft-only and confirm-and-tap: no ride is ever requested
 * automatically — the adult opens the pre-filled Uber and taps to book, per
 * the household rule "no Uber without approval". Under-18 solo rides go through
 * Uber Teens on the family profile.
 */

const INK = '#2A2620';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const BLUE = '#6E93A6';
const SAGE = '#7A8B6F';
const CORAL = '#E08A6B';

const HOME = 'Mangawhai, Northland';

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

// Demo rides derived from this week's pickups (placeholder data).
const RIDES: Ride[] = [
  {
    who: 'Mila',
    trip: 'School disco pickup',
    when: 'Friday 8:00pm',
    from: 'Mangawhai Beach School hall',
    to: HOME,
    est: '$12–16',
    eta: '~6 min away',
    note: 'Disco ends 8:00pm sharp — Mum on the calendar; Uber is the backup if the night runs late.',
  },
  {
    who: 'Jack',
    trip: 'Cross country return',
    when: 'Tuesday ~2:30pm',
    from: 'Mangawhai Beach School',
    to: HOME,
    est: '$10–14',
    eta: '~5 min away',
    note: 'Dad can’t — late shift Tuesdays. Backup pickup: Ben (neighbour). Uber Teens if no adult’s free.',
    teens: true,
  },
];

const card: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fffdf9)',
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
          Estimates are indicative; rural coverage varies. For a child riding solo, use <strong style={{ color: INK }}>Uber Teens</strong> on the family profile.
        </p>
      </div>
    </div>
  );
}

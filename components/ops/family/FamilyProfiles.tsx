import type { CSSProperties } from 'react';
import type { Person, Custody } from '@/lib/family/profiles';
import { addFamilyMemberAction, toggleDemoModeAction } from '@/app/customers/family/ops/actions';

/**
 * The whānau — profile cards + the week's custody. Each member has a "file":
 * the details worth remembering (school + year for the kids, Franklin's monthly
 * Cytopoint, the co-parenting arrangement). Add anyone with the form; a
 * demo-mode toggle swaps to placeholder names for prospect showings.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';
const display = 'var(--font-brand-display)';

const card: CSSProperties = {
  borderRadius: 14, border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fbfcfb)', padding: 14,
};
const label: CSSProperties = { fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED };

function Mark({ letter, color }: { letter: string; color: string }) {
  return (
    <span aria-hidden style={{
      width: 40, height: 40, borderRadius: 12, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${color}55`, background: `${color}12`, fontFamily: display, fontSize: 24, color, lineHeight: 1,
    }}>{letter}</span>
  );
}

export function FamilyProfiles({ people, custody, demoMode }: { people: Person[]; custody: Custody; demoMode: boolean }) {
  return (
    <div>
      {/* Custody + homes banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderRadius: 12, border: `1px solid ${(custody.withAaron ? '#8E7BA6' : SAGE)}44`, background: '#fbfcfb', padding: '9px 13px', marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: custody.withAaron ? '#8E7BA6' : SAGE }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{custody.label}</span>
        <span style={{ fontSize: 12, color: MUTED }}>{custody.range} · {custody.homeThisWeek}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: MUTED }}>week-on / week-off with Aaron</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, alignItems: 'start' }}>
        {people.map((p) => (
          <div key={p.id} style={{ ...card, borderLeft: `3px solid ${p.accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mark letter={p.mark} color={p.accent} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{p.name}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{p.role}</div>
              </div>
            </div>
            {(p.school || p.home) ? (
              <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
                {p.school ? <span>{p.school}{p.year ? ` · Yr ${p.year}` : ''}</span> : null}
                {p.school && p.home ? <br /> : null}
                {p.home ? <span>{p.home}</span> : null}
              </div>
            ) : null}
            <p style={{ ...label, marginTop: 10 }}>their file</p>
            <ul style={{ margin: '6px 0 0', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {p.details.map((d) => <li key={d} style={{ fontSize: 12, color: INK }}>{d}</li>)}
            </ul>
            {p.medical?.length ? (
              <div style={{ marginTop: 8, borderTop: `1px solid ${GOLD}22`, paddingTop: 8 }}>
                <p style={{ ...label, color: CORAL }}>health · reminders</p>
                <ul style={{ margin: '5px 0 0', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {p.medical.map((m) => <li key={m} style={{ fontSize: 12, color: INK }}>{m}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ))}

        {/* Add a member */}
        <form action={addFamilyMemberAction} style={{ ...card, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <p style={label}>add someone</p>
          <input name="name" placeholder="Name" required style={inp} />
          <input name="role" placeholder="Role (e.g. Nana, coach, sitter)" style={inp} />
          <input name="details" placeholder="Anything to remember (comma-separated)" style={inp} />
          <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', marginTop: 2 }}>Add to the whānau</button>
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <form action={toggleDemoModeAction}>
          <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: MUTED, background: 'transparent', border: `1px solid ${GOLD}44`, borderRadius: 999, padding: '5px 11px', cursor: 'pointer' }}>
            {demoMode ? '● demo mode on — showing placeholders' : '○ switch to demo mode (placeholder names)'}
          </button>
        </form>
        <span style={{ fontSize: 12, color: MUTED }}>{demoMode ? 'Safe to show prospects — no real whānau details.' : 'Showing your real whānau.'}</span>
      </div>
    </div>
  );
}

const inp: CSSProperties = { fontSize: 12.5, color: INK, border: `1px solid ${GOLD}44`, borderRadius: 8, padding: '7px 10px', background: '#fff', outline: 'none', fontFamily: 'var(--font-brand-body)' };

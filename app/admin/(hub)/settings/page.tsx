import { BODY, C, GoldButton, Card, Eyebrow, Grid, MONO, PageHeader, Pill, SectionTitle, nzDate } from '@/components/admin/ui';
import { getDesignatedAdmins } from '@/lib/admin/v2-data';
import { addDesignatedAdmin, setDesignatedAdminActive } from './actions';

export const dynamic = 'force-dynamic';

const FOUNDER_EMAILS = new Set(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);

/** Env keys whose PRESENCE we surface — values are never read or rendered. */
const ENV_GROUPS: { group: string; keys: string[] }[] = [
  {
    group: 'Core',
    keys: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  {
    group: 'Agents & AI',
    keys: ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  {
    group: 'Billing',
    keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PRICE_ALL_ACCESS'],
  },
  {
    group: 'Email & alerts',
    keys: ['BREVO_API_KEY', 'BREVO_LIST_ID', 'HEALTH_CHECK_API_KEY'],
  },
];

const FLAGS: { key: string; label: string }[] = [
  { key: 'NEXT_PUBLIC_VOICE_AGENT_ENABLED', label: 'Voice agent (Aria)' },
];

const TOKENS: { name: string; hex: string }[] = [
  { name: 'Champagne gold', hex: C.gold },
  { name: 'Deep gold', hex: C.goldDeep },
  { name: 'Pale', hex: C.pale },
  { name: 'Charcoal', hex: C.ink },
  { name: 'Slate', hex: C.body },
  { name: 'Cream', hex: C.cream },
  { name: 'Hairline', hex: C.hairline },
  { name: 'Gold (eyebrow)', hex: C.goldEyebrow },
];

function isSet(key: string): boolean {
  const v = process.env[key];
  return typeof v === 'string' && v.length > 0;
}

export default async function SettingsPage() {
  const admins = await getDesignatedAdmins();

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Settings"
        title="Settings"
        lede="Operators, what's configured, what's switched on, and the brand tokens everything is built from. Secret values never leave the server."
      />

      <SectionTitle style={{ marginTop: 8 }}>Operators</SectionTitle>
      <Card style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 14px' }}>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>designated_admins</code> allowlist — everyone here can
          sign in at <code style={{ fontFamily: MONO, fontSize: 12.5 }}>/admin/login</code> with a magic link. The
          founder mailboxes can&apos;t be deactivated.
        </p>
        {!admins.available ? (
          <p style={{ fontFamily: MONO, fontSize: 12, color: C.muted, margin: 0 }}>
            Table not migrated in this environment yet (20260703100000) — the code allowlist in ensureAdmin still
            covers the founder mailboxes.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {admins.rows.map((a) => {
              const founder = FOUNDER_EMAILS.has(a.email);
              return (
                <div key={a.email} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <code style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink }}>{a.email}</code>
                  {a.display_name && (
                    <span style={{ fontFamily: BODY, fontSize: 13, color: C.body }}>{a.display_name}</span>
                  )}
                  <Pill tone={a.active ? 'ok' : 'neutral'}>{a.active ? 'active' : 'inactive'}</Pill>
                  {founder && <Pill tone="gold">founder</Pill>}
                  <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginLeft: 'auto' }}>
                    added {nzDate(a.created_at, false)}
                    {a.added_by ? ` by ${a.added_by}` : ''}
                  </span>
                  {!founder && (
                    <form action={setDesignatedAdminActive}>
                      <input type="hidden" name="email" value={a.email} />
                      <input type="hidden" name="active" value={a.active ? '0' : '1'} />
                      <button
                        type="submit"
                        style={{
                          fontFamily: BODY,
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: a.active ? C.bad : C.ok,
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textUnderlineOffset: 3,
                        }}
                      >
                        {a.active ? 'deactivate' : 'reactivate'}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {admins.available && (
          <form action={addDesignatedAdmin} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              name="email"
              type="email"
              required
              placeholder="new-operator@assembl.co.nz"
              style={{
                flex: '1 1 220px',
                maxWidth: 300,
                padding: '9px 13px',
                fontFamily: MONO,
                fontSize: 12.5,
                color: C.ink,
                background: C.paper,
                border: `1px solid ${C.hairline}`,
                borderRadius: 10,
              }}
            />
            <input
              name="display_name"
              placeholder="Name (optional)"
              style={{
                flex: '1 1 160px',
                maxWidth: 220,
                padding: '9px 13px',
                fontFamily: BODY,
                fontSize: 13.5,
                color: C.ink,
                background: C.paper,
                border: `1px solid ${C.hairline}`,
                borderRadius: 10,
              }}
            />
            <GoldButton style={{ padding: '9px 16px' }}>Add operator</GoldButton>
          </form>
        )}
      </Card>

      <SectionTitle style={{ marginTop: 8 }}>Environment</SectionTitle>
      <p style={{ fontFamily: BODY, color: C.muted, fontSize: 13, margin: '-6px 0 14px' }}>
        Presence only — secret values are never read here.
      </p>
      {ENV_GROUPS.map((g) => (
        <Card key={g.group} style={{ marginBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 12 }}>{g.group}</Eyebrow>
          <div style={{ display: 'grid', gap: 8 }}>
            {g.keys.map((k) => {
              const set = isSet(k);
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <code style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink }}>{k}</code>
                  <Pill tone={set ? 'ok' : 'bad'}>{set ? 'set' : 'missing'}</Pill>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <SectionTitle>Feature flags</SectionTitle>
      <Card>
        <div style={{ display: 'grid', gap: 10 }}>
          {FLAGS.map((f) => {
            const on = process.env[f.key] === 'true';
            return (
              <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: BODY, fontWeight: 700, color: C.ink, fontSize: 14 }}>{f.label}</div>
                  <code style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{f.key}</code>
                </div>
                <Pill tone={on ? 'ok' : 'neutral'}>{on ? 'on' : 'off'}</Pill>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle>Brand tokens</SectionTitle>
      <Card>
        <Eyebrow style={{ marginBottom: 14 }}>Locked palette · CANON 2026-06-23</Eyebrow>
        <Grid min={150} gap={12}>
          {TOKENS.map((t) => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: t.hex,
                  border: `1px solid ${C.hairline}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: C.ink }}>{t.name}</div>
                <code style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{t.hex}</code>
              </div>
            </div>
          ))}
        </Grid>
        <div style={{ marginTop: 22, borderTop: `1px solid ${C.hairline}`, paddingTop: 18 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Type</Eyebrow>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, fontSize: 24, color: C.ink }}>
              Cormorant Garamond — display &amp; headlines
            </div>
            <div style={{ fontFamily: BODY, color: C.body }}>Lato — body, UI and buttons</div>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase' }}>
              Space Mono — labels &amp; numerals
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

import { BODY, C, Card, Eyebrow, Grid, MONO, PageHeader, Pill, SectionTitle } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

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
  { name: 'Canary', hex: C.canary },
  { name: 'Deep gold', hex: C.gold },
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
  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Settings"
        title="Settings"
        lede="What's configured, what's switched on, and the brand tokens everything is built from. Read-only — values never leave the server."
      />

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
                  <code style={{ fontFamily: MONO, fontSize: 11.5, color: C.muted }}>{f.key}</code>
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
                <code style={{ fontFamily: MONO, fontSize: 11.5, color: C.muted }}>{t.hex}</code>
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

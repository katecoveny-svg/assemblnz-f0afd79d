import { getInviteContext } from '@/lib/demo-invites/server';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const GOLD = '#BFA37A';

/**
 * Personal greeting strip for demo magic-link visitors.
 *
 * Server component. Renders ONLY when this browser arrived on a valid,
 * unrevoked invite for THIS demo (signed cookie → demo_invites lookup) —
 * on every other request it renders nothing, so recipient names never
 * appear on a surface a basic-auth visitor or crawler could see.
 *
 * Greeting shape follows the invite's greeting_mode toggle:
 *   'name'    → "kia ora Liana"
 *   'company' → "welcome, Aironaut Customs Brokers"
 * Aironaut is English-led chrome (freight-industry audience), so its
 * name-mode greeting says "welcome," too.
 */
export async function InviteGreeting({ demo }: { demo: string }) {
  const invite = await getInviteContext();
  if (!invite || invite.demo !== demo) return null;

  const englishLed = demo === 'aironaut';
  const greetWord = invite.greetingMode === 'company' || englishLed ? 'welcome,' : 'kia ora';
  const greetName =
    invite.greetingMode === 'company' ? invite.recipientCompany : invite.recipientName;

  return (
    <section
      aria-label="personal welcome"
      className="relative px-6 pt-10 pb-2 text-center"
    >
      {/* no text-transform — recipient/company names keep their own casing */}
      <h2
        className="m-0"
        style={{
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)',
          letterSpacing: '0.01em',
          color: 'var(--brand-ink, #1f1d1a)',
        }}
      >
        {greetWord} {greetName}
        <span style={{ color: GOLD }}>.</span>
      </h2>
      <p
        className="mx-auto mt-2 mb-0 max-w-xl text-[13px] leading-relaxed"
        style={{ color: 'var(--brand-muted, #6b6459)' }}
      >
        this is a look at what assembl could run for {invite.recipientCompany}.
      </p>
    </section>
  );
}

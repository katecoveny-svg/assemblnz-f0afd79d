'use client';

/**
 * DashAgentLoader — the Assembling dachshund loader, ready to drop into any assembl
 * agent's "working" state. Wraps the real DashLoader in whitelabel mode (mascot
 * + cycling internal messages; no ads, no payout, no Sponsored label) and pulls
 * in the [data-dash] tokens + fonts it needs, so it renders correctly outside
 * the /dash route (e.g. the chat transcript).
 *
 * Usage: render while the agent is generating.
 *   {sending && <DashAgentLoader label={agentLabel} accent={accent} />}
 */
import '@/styles/dash-tokens.css';
import { DashLoader } from '@/components/dash';
import { dashFontVars } from '@/app/assembling/fonts';

export function DashAgentLoader({
  label = 'Your agent',
  accent = '#FFD42A',
  messages,
  maxWidth = 360,
}: {
  label?: string;
  accent?: string;
  messages?: string[];
  maxWidth?: number;
}) {
  return (
    <div className={dashFontVars} style={{ maxWidth }}>
      <DashLoader
        mode={{
          kind: 'whitelabel',
          brandConfig: {
            brandColour: accent,
            internalMessages:
              messages ?? [
                `${label} is working…`,
                'Reading the kete…',
                'Checking the rules…',
                'Drafting your answer…',
              ],
          },
        }}
        status="processing"
        errorMessage=""
      />
    </div>
  );
}

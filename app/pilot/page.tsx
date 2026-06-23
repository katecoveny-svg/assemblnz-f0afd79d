import type { Metadata } from 'next';
import { MarketplaceHeader, MarketplaceFooter } from '@/components/marketplace/MarketplaceChrome';
import { isVoiceConfigured } from '@/lib/voice/platform-voice';
import { getOwner } from '@/lib/pilot/store';
import { PilotFlow } from './PilotFlow';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pilot — build your own agent · assembl',
  description:
    'Pilot walks you through building your own agent — naming, testing and shipping it. No code. First one free.',
};

export default async function PilotPage() {
  // Voice is an enhancement; the flow works entirely on text without it.
  const voiceConfigured = isVoiceConfigured();
  // Auth is only needed to save/ship — the guided flow runs for everyone.
  const owner = await getOwner();

  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: '#FFF7EC' }}>
      <MarketplaceHeader />
      <PilotFlow voiceConfigured={voiceConfigured} signedIn={Boolean(owner)} />
      <MarketplaceFooter />
    </div>
  );
}

import { PilotGateView } from '@/components/assembl/PilotGateView';
import { submitPilotGate } from './gate-action';

/**
 * Passphrase gate for the Everyday Rewards pilot subtree. UI lives in the
 * assembl chrome kit (DIRECTION-LOCKED-2026-07-01); this wrapper binds the
 * subtree's scoped server action (its own post-unlock destination).
 */
export function PilotGate({ next }: { next?: string }) {
  return <PilotGateView action={submitPilotGate} next={next} />;
}

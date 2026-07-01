import { PilotGateView } from '@/components/assembl/PilotGateView';
import { submitPilotGate } from './gate-action';

/**
 * Passphrase gate for the shared customer pilot workspaces. UI lives in the
 * assembl chrome kit (DIRECTION-LOCKED-2026-07-01); this wrapper binds the
 * subtree's scoped server action.
 */
export function PilotGate({ next }: { next?: string }) {
  return <PilotGateView action={submitPilotGate} next={next} />;
}

import type { Metadata } from 'next';
import { ReadinessDiagnostic } from './ReadinessDiagnostic';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI readiness check — Atlas · assembl',
  description:
    'Ten plain questions, five minutes. Atlas reads your AI readiness, points you to the agents that fit, and flags the NZ Acts you need to keep in mind. Free, voice-enabled, no sign-up to start.',
};

export default function ReadinessPage() {
  return <ReadinessDiagnostic />;
}

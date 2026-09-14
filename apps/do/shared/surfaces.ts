/**
 * Launch surfaces — Chrome is the MVP surface; chat channels are stubs.
 * Surface ≠ agent. Adapters only normalise ingress into DoMessage.
 */

import type { DoMessage, LaunchSurface } from './pipeline';
import type { PageContext } from './types';

export interface SurfaceAdapter {
  surface: LaunchSurface;
  status: 'live' | 'stub';
  description: string;
  /** Normalise channel payload into a common message (stubs return honesty). */
  ingest(payload: Record<string, unknown>): DoMessage | { stub: true; honesty: string };
}

const chromeAdapter: SurfaceAdapter = {
  surface: 'chrome',
  status: 'live',
  description: 'MV3 extension — floating ✦ + side panel. Primary MVP launch surface.',
  ingest(payload) {
    const page = payload.page as PageContext | undefined;
    const brief = String(payload.brief || '');
    return {
      surface: 'chrome',
      intent: { brief, templateId: payload.templateId as string | undefined },
      context: { surface: 'chrome', page },
    };
  },
};

const webAdapter: SurfaceAdapter = {
  surface: 'web',
  status: 'live',
  description: 'DO home at /do — ✦ make agent in the browser.',
  ingest(payload) {
    return {
      surface: 'web',
      intent: {
        brief: String(payload.brief || ''),
        templateId: payload.templateId as string | undefined,
      },
      context: {
        surface: 'web',
        page: payload.page as PageContext | undefined,
      },
    };
  },
};

function stubChat(surface: LaunchSurface, description: string): SurfaceAdapter {
  return {
    surface,
    status: 'stub',
    description,
    ingest() {
      return {
        stub: true,
        honesty: `DEMO · ${surface} adapter is a stub. MVP ships Chrome ✦ + /do only. No webhook wired.`,
      };
    },
  };
}

export const SURFACES: SurfaceAdapter[] = [
  chromeAdapter,
  webAdapter,
  stubChat('whatsapp', 'WhatsApp Business webhook stub — not connected in v0.'),
  stubChat('sms', 'SMS / reply stub — not connected in v0.'),
  stubChat('messenger', 'Messenger webhook stub — not connected in v0.'),
];

export function getSurface(name: string): SurfaceAdapter | undefined {
  return SURFACES.find((s) => s.surface === name);
}

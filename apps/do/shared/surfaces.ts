/**
 * Launch surfaces — Chrome + /do are live; share / keyboard / chat are DEMO or stubs.
 * Surface ≠ agent. Adapters only normalise ingress into DoMessage.
 */

import type { DoMessage, LaunchSurface } from './pipeline';
import type { PageContext } from './types';
import { WHATSAPP_FIXTURE } from './share-fixtures';

export interface SurfaceAdapter {
  surface: LaunchSurface;
  status: 'live' | 'stub' | 'demo';
  description: string;
  /** Normalise channel payload into a common message (stubs return honesty). */
  ingest(payload: Record<string, unknown>): DoMessage | { stub: true; honesty: string };
}

const chromeAdapter: SurfaceAdapter = {
  surface: 'chrome',
  status: 'live',
  description: 'MV3 extension — floating ✦ + Clear writing overlay. Primary MVP launch surface.',
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

const shareAdapter: SurfaceAdapter = {
  surface: 'share',
  status: 'demo',
  description:
    'Web Share Target / paste-into-DO. iOS Share Sheet → native DO when the app ships; web DEMO accepts shared text/URL.',
  ingest(payload) {
    const title = String(payload.title || '');
    const text = String(payload.text || payload.brief || '');
    const url = String(payload.url || '');
    const brief =
      text ||
      (url ? `do something useful with this shared link: ${url}` : '') ||
      title ||
      'tell me if this changes';
    return {
      surface: 'share',
      intent: {
        brief,
        templateId: payload.templateId as string | undefined,
      },
      context: {
        surface: 'share',
        page: {
          url: url || 'share://do',
          title: title || 'Shared into DO',
          pageText: text || undefined,
          selectedText: text ? text.slice(0, 500) : undefined,
        },
      },
    };
  },
};

const keyboardAdapter: SurfaceAdapter = {
  surface: 'keyboard',
  status: 'demo',
  description: 'Native keyboard extension stubs (iOS / Android) — selection/clipboard → compile API.',
  ingest(payload) {
    const selection = String(payload.selection || payload.text || '');
    const brief = String(payload.brief || selection || 'tell me if this changes');
    return {
      surface: 'keyboard',
      intent: {
        brief,
        templateId: payload.templateId as string | undefined,
      },
      context: {
        surface: 'keyboard',
        page: {
          url: String(payload.hostBundleId || payload.url || 'keyboard://do'),
          title: String(payload.hostApp || 'Keyboard host'),
          selectedText: selection || undefined,
          pageText: selection || undefined,
        },
      },
    };
  },
};

const homeWidgetAdapter: SurfaceAdapter = {
  surface: 'home-widget',
  status: 'demo',
  description: 'Home Screen Needs you widget stubs — tap opens do://needs-you or /do.',
  ingest(payload) {
    return {
      surface: 'home-widget',
      intent: {
        brief: String(payload.brief || 'open needs you'),
        templateId: payload.templateId as string | undefined,
      },
      context: { surface: 'home-widget' },
    };
  },
};

/**
 * WhatsApp — live DEMO fixture sim when `demo: true` or body provided;
 * otherwise honest stub (no webhook).
 */
const whatsappAdapter: SurfaceAdapter = {
  surface: 'whatsapp',
  status: 'demo',
  description: 'WhatsApp Business — DEMO fixture sim on /do. Live webhook not connected.',
  ingest(payload) {
    const demo = payload.demo === true || payload.fixture === true;
    const body = String(payload.body || payload.brief || '');
    if (!demo && !body) {
      return {
        stub: true,
        honesty:
          'DEMO · WhatsApp webhook is not connected. Use the WhatsApp fixture sim on /do, or POST with { demo: true }.',
      };
    }
    const text = body || WHATSAPP_FIXTURE.body;
    return {
      surface: 'whatsapp',
      intent: {
        brief: text,
        templateId: (payload.templateId as string | undefined) || 'power-price-watch',
      },
      context: {
        surface: 'whatsapp',
        threadId: String(payload.threadId || WHATSAPP_FIXTURE.threadId),
        page: {
          url: 'whatsapp://demo',
          title: `WhatsApp · ${String(payload.from || WHATSAPP_FIXTURE.from)}`,
          pageText: text,
          selectedText: text.slice(0, 280),
        },
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
        honesty: `DEMO · ${surface} adapter is a stub. No webhook wired.`,
      };
    },
  };
}

export const SURFACES: SurfaceAdapter[] = [
  chromeAdapter,
  webAdapter,
  shareAdapter,
  keyboardAdapter,
  homeWidgetAdapter,
  whatsappAdapter,
  stubChat('sms', 'SMS / reply stub — not connected in v0.'),
  stubChat('messenger', 'Messenger webhook stub — not connected in v0.'),
];

export function getSurface(name: string): SurfaceAdapter | undefined {
  return SURFACES.find((s) => s.surface === name);
}

/**
 * Social studio presets — per-pilot platforms, voice, and starter briefs.
 * Draft-only: nothing publishes without a human yes.
 */

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'x';

export type SocialPilot = 'auckland-dog-trainer' | 'happy-tails' | 'toa-architects';

export type SocialPreset = {
  pilot: SocialPilot;
  brandLabel: string;
  accent: string;
  ink: string;
  surface: string;
  muted: string;
  handle: string;
  platforms: Array<{ id: SocialPlatform; label: string; connected: boolean }>;
  voiceNote: string;
  starters: string[];
  sampleDrafts: Array<{
    id: string;
    platform: SocialPlatform;
    title: string;
    body: string;
    status: 'draft' | 'ready' | 'scheduled';
  }>;
};

export const SOCIAL_PRESETS: Record<SocialPilot, SocialPreset> = {
  'auckland-dog-trainer': {
    pilot: 'auckland-dog-trainer',
    brandLabel: 'Auckland Dog Trainer',
    accent: '#D4A5B0',
    ink: '#1B2A4A',
    surface: '#FFFCFB',
    muted: '#6B7389',
    handle: '@aucklanddogtrainer',
    platforms: [
      { id: 'instagram', label: 'Instagram', connected: true },
      { id: 'facebook', label: 'Facebook', connected: true },
      { id: 'tiktok', label: 'TikTok', connected: false },
      { id: 'youtube', label: 'YouTube', connected: true },
      { id: 'linkedin', label: 'LinkedIn', connected: false },
    ],
    voiceNote:
      'Educational, calm, method-led. Fred’s voice — teach the human to talk dog. Never daycare “pack life”.',
    starters: [
      'Reel: 12s leash-pressure reset from today’s session clip',
      'Carousel: three hand signals every reactive-dog owner needs',
      'Story: homework win — soft eye contact on the footpath',
    ],
    sampleDrafts: [
      {
        id: 'adt-1',
        platform: 'instagram',
        title: 'Reactivity isn’t “bad dog”',
        body: 'It’s a conversation the dog is already having. Today’s session: soft eye → breathe → move. Save this for the next footpath moment. — Fred · Auckland Dog Trainer',
        status: 'ready',
      },
      {
        id: 'adt-2',
        platform: 'tiktok',
        title: 'Hook: Stop yanking the lead',
        body: 'Hook (0–2s): “Stop yanking.” Beat: show the reset. CTA: “Learn To Talk Dog — link in bio.” Draft only.',
        status: 'draft',
      },
    ],
  },
  'happy-tails': {
    pilot: 'happy-tails',
    brandLabel: 'Happy Tails',
    accent: '#8B5A2B',
    ink: '#1A1918',
    surface: '#FBF7F1',
    muted: '#6B655C',
    handle: '@happytailsnz',
    platforms: [
      { id: 'instagram', label: 'Instagram', connected: true },
      { id: 'facebook', label: 'Facebook', connected: true },
      { id: 'tiktok', label: 'TikTok', connected: true },
      { id: 'linkedin', label: 'LinkedIn', connected: false },
    ],
    voiceNote:
      'Warm daycare energy — Franklin & friends, bus runs, welcome packs. Two-voice rule: Mathis texts, Liana emails.',
    starters: [
      'Reel: morning bus drop-off energy (owner-approved clip)',
      'Carousel: what a first daycare week looks like',
      'Story: Franklin’s Friday pack photo',
    ],
    sampleDrafts: [
      {
        id: 'ht-1',
        platform: 'instagram',
        title: 'Friday pack photo',
        body: 'Friday faces. Bus home by 5. Welcome packs ready for Monday’s new pups. Tag us @happytailsnz — draft only, Liana approves before post.',
        status: 'ready',
      },
      {
        id: 'ht-2',
        platform: 'facebook',
        title: 'Enrolment open · spring',
        body: 'Spring enrolment is open. Trial day → welcome pack → settled routine. Message us for a tour. Draft — nothing publishes without a yes.',
        status: 'draft',
      },
    ],
  },
  'toa-architects': {
    pilot: 'toa-architects',
    brandLabel: 'TOA Architects',
    accent: '#BFA37A',
    ink: '#161516',
    surface: '#FFFFFF',
    muted: '#6F6F64',
    handle: 'TOA · practice desk',
    platforms: [
      { id: 'linkedin', label: 'LinkedIn', connected: true },
      { id: 'instagram', label: 'Instagram', connected: true },
      { id: 'facebook', label: 'Facebook', connected: false },
      { id: 'x', label: 'X', connected: false },
    ],
    voiceNote:
      'Quiet, monochrome, practice-led. Site progress and kaupapa — never hype. Concept pitch only; not endorsed by TOA.',
    starters: [
      'LinkedIn: Friday site update from a consent-ready project',
      'Instagram: massing study → built form (no client names)',
      'Carousel: what ARC drafted overnight for the studio',
    ],
    sampleDrafts: [
      {
        id: 'toa-1',
        platform: 'linkedin',
        title: 'Practice note · consents',
        body: 'Overnight: ARC flagged three RFI risks on a residential consent path. The studio reviews; nothing lodges without a principal’s yes. Concept demo only.',
        status: 'ready',
      },
      {
        id: 'toa-2',
        platform: 'instagram',
        title: 'Massing in charcoal',
        body: 'Wireframe before photography. A quiet look at how the practice thinks in volume. Draft — Nick approves.',
        status: 'draft',
      },
    ],
  },
};

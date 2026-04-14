export type KeteType = 'manaaki' | 'waihanga' | 'auaha' | 'arataki' | 'pikau' | 'toro';

export type TimeOfDay = 'dawn' | 'day' | 'evening' | 'night';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type EngagementDepth = 'new' | 'returning' | 'engaged';

export interface VisitorSignals {
  referralSource: string | null;
  utmParams: Record<string, string>;
  deviceType: DeviceType;
  timeOfDay: TimeOfDay;
  region: string | null;
  visitCount: number;
  pagesViewed: string[];
  lastKeteViewed: KeteType | null;
  engagementDepth: EngagementDepth;
  scrollDepth: number;
}

export interface VisitorPreferences {
  heroVariant: HeroVariant;
  keteOrder: KeteType[];
  ctaVariant: string;
  atmosphereMode: TimeOfDay;
}

export interface VisitorProfile {
  detectedIndustry: KeteType | null;
  confidence: number;
  signals: VisitorSignals;
  preferences: VisitorPreferences;
}

export interface HeroVariant {
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta: string;
  ctaLink: string;
  secondaryCta?: string;
  secondaryCtaLink?: string;
}

export const DEFAULT_KETE_ORDER: KeteType[] = ['manaaki', 'waihanga', 'auaha', 'arataki', 'pikau', 'toro'];

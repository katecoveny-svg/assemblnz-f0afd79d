import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { VisitorProfile, KeteType, TimeOfDay } from '@/lib/personalization/types';
import { DEFAULT_KETE_ORDER } from '@/lib/personalization/types';
import { collectSignals, recordPageView, getTimeOfDay } from '@/lib/personalization/signals';
import { classifyVisitor } from '@/lib/personalization/classifier';
import { getHeroVariant, getKeteOrder, getCtaVariant } from '@/lib/personalization/variants';
import { getAtmosphere, type AtmosphereConfig } from '@/lib/personalization/atmosphere';
import { useLocation } from 'react-router-dom';

interface PersonalizationContextValue {
  profile: VisitorProfile;
  atmosphere: AtmosphereConfig;
  isPersonalized: boolean;
  recordPage: (path: string) => void;
  refreshClassification: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextValue | null>(null);

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [profile, setProfile] = useState<VisitorProfile>(() => {
    const signals = collectSignals();
    const classification = classifyVisitor(signals);
    const timeOfDay = getTimeOfDay();
    const forceTime = new URLSearchParams(window.location.search).get('force_time') as TimeOfDay | null;
    const effectiveTime = (forceTime && ['dawn', 'day', 'evening', 'night'].includes(forceTime)) ? forceTime : timeOfDay;

    return {
      detectedIndustry: classification.industry,
      confidence: classification.confidence,
      signals,
      preferences: {
        heroVariant: getHeroVariant(classification.industry),
        keteOrder: getKeteOrder(classification.industry),
        ctaVariant: getCtaVariant(effectiveTime, classification.industry),
        atmosphereMode: effectiveTime,
      },
    };
  });

  const atmosphere = useMemo(() => getAtmosphere(profile.preferences.atmosphereMode), [profile.preferences.atmosphereMode]);

  // Track page views
  useEffect(() => {
    recordPageView(location.pathname);
  }, [location.pathname]);

  const refreshClassification = useCallback(() => {
    const signals = collectSignals();
    const classification = classifyVisitor(signals);
    const timeOfDay = getTimeOfDay();

    setProfile({
      detectedIndustry: classification.industry,
      confidence: classification.confidence,
      signals,
      preferences: {
        heroVariant: getHeroVariant(classification.industry),
        keteOrder: getKeteOrder(classification.industry),
        ctaVariant: getCtaVariant(timeOfDay, classification.industry),
        atmosphereMode: timeOfDay,
      },
    });
  }, []);

  const recordPage = useCallback((path: string) => {
    recordPageView(path);
  }, []);

  const isPersonalized = profile.detectedIndustry !== null && profile.confidence >= 0.2;

  return (
    <PersonalizationContext.Provider value={{ profile, atmosphere, isPersonalized, recordPage, refreshClassification }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) {
    // Return defaults if outside provider
    return {
      profile: {
        detectedIndustry: null,
        confidence: 0,
        signals: {
          referralSource: null,
          utmParams: {},
          deviceType: 'desktop' as const,
          timeOfDay: 'day' as const,
          region: null,
          visitCount: 1,
          pagesViewed: [],
          lastKeteViewed: null,
          engagementDepth: 'new' as const,
          scrollDepth: 0,
        },
        preferences: {
          heroVariant: getHeroVariant(null),
          keteOrder: DEFAULT_KETE_ORDER,
          ctaVariant: 'See it in action',
          atmosphereMode: 'day' as const,
        },
      },
      atmosphere: getAtmosphere('day'),
      isPersonalized: false,
      recordPage: () => {},
      refreshClassification: () => {},
    };
  }
  return ctx;
}

import type { TimeOfDay } from './types';

export interface AtmosphereConfig {
  glowWarmth: number;      // 0-1, higher = warmer gold tint
  particleBrightness: number; // 0-1
  animationSpeed: number;  // multiplier, 1 = normal
  bgOverlay: string;       // subtle CSS overlay color
}

const ATMOSPHERE_MAP: Record<TimeOfDay, AtmosphereConfig> = {
  dawn: {
    glowWarmth: 0.15,
    particleBrightness: 0.9,
    animationSpeed: 0.85,
    bgOverlay: 'rgba(212,168,67,0.02)',
  },
  day: {
    glowWarmth: 0,
    particleBrightness: 1,
    animationSpeed: 1,
    bgOverlay: 'transparent',
  },
  evening: {
    glowWarmth: 0.1,
    particleBrightness: 0.9,
    animationSpeed: 0.9,
    bgOverlay: 'rgba(212,168,67,0.015)',
  },
  night: {
    glowWarmth: 0,
    particleBrightness: 0.8,
    animationSpeed: 0.7,
    bgOverlay: 'rgba(0,0,0,0.03)',
  },
};

export function getAtmosphere(timeOfDay: TimeOfDay): AtmosphereConfig {
  // QA override
  const params = new URLSearchParams(window.location.search);
  const forceTime = params.get('force_time') as TimeOfDay | null;
  if (forceTime && ATMOSPHERE_MAP[forceTime]) {
    return ATMOSPHERE_MAP[forceTime];
  }
  return ATMOSPHERE_MAP[timeOfDay];
}

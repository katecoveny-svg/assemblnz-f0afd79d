import { useEffect, useRef } from 'react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const KETE_LABELS: Record<string, { name: string; path: string }> = {
  manaaki: { name: 'Manaaki (Hospitality)', path: '/manaaki' },
  waihanga: { name: 'Waihanga (Construction)', path: '/waihanga/about' },
  auaha: { name: 'Auaha (Creative)', path: '/auaha/about' },
  arataki: { name: 'Arataki (Automotive)', path: '/arataki' },
  pikau: { name: 'Pikau (Freight)', path: '/pikau' },
  toro: { name: 'Tōroa (Family)', path: '/toroa' },
};

export function useReturnVisitor() {
  const { profile } = usePersonalization();
  const navigate = useNavigate();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (profile.signals.engagementDepth === 'new') return;
    if (!profile.signals.lastKeteViewed) return;
    // Only show on homepage
    if (window.location.pathname !== '/') return;

    const kete = KETE_LABELS[profile.signals.lastKeteViewed];
    if (!kete) return;

    shown.current = true;

    // Delay slightly so it doesn't compete with page load
    const timer = setTimeout(() => {
      toast(`Pick up where you left off with ${kete.name}?`, {
        action: {
          label: 'Continue →',
          onClick: () => navigate(kete.path),
        },
        duration: 8000,
        style: {
          background: '#13131F',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile.signals.engagementDepth, profile.signals.lastKeteViewed, navigate]);
}

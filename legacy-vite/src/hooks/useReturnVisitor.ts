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
  toro: { name: 'Tōro (Family)', path: '/toroa' },
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
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.9)',
          color: '#3D4250',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04)',
        },
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile.signals.engagementDepth, profile.signals.lastKeteViewed, navigate]);
}

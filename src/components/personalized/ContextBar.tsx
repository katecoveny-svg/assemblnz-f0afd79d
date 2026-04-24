import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { ArrowRight, ChevronDown, Radio } from 'lucide-react';
import { KETE_CONFIG } from '@/components/kete/KeteConfig';
import KeteIcon from '@/components/kete/KeteIcon';
import { supabase } from '@/integrations/supabase/client';
import type { KeteType } from '@/lib/personalization/types';

const KETE_VARIANTS: Record<string, "standard" | "dense" | "organic" | "tricolor" | "warm"> = {
  manaaki: "warm",
  waihanga: "dense",
  auaha: "tricolor",
  arataki: "standard",
  pikau: "organic",
  toro: "warm",
};

const KETE_ACCENT_LIGHT: Record<string, string> = {
  manaaki: "#A8DDDB",
  waihanga: "#5AADA0",
  auaha: "#D6F0EE",
  arataki: "#C8C8D0",
  pikau: "#8ECFC6",
  toro: "#A8DDDB",
};

const KETE_INFO: Record<string, { name: string; nameEn: string; color: string; path: string; samplePath: string }> = Object.fromEntries(
  KETE_CONFIG.map(k => [k.id, {
    name: k.name.toUpperCase(),
    nameEn: k.nameEn,
    color: k.color,
    path: k.route,
    samplePath: '/sample/manaaki',
  }])
);

export default function ContextBar() {
  const { profile, isPersonalized } = usePersonalization();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState<{ title: string; url: string | null; published_at: string | null } | null>(null);

  useEffect(() => {
    if (!isPersonalized || dismissed) return;
    const kete = profile.detectedIndustry;
    if (!kete) return;

    const ketePages = profile.signals.pagesViewed.filter(p => {
      if (kete === 'manaaki') return p.startsWith('/manaaki');
      if (kete === 'waihanga') return p.startsWith('/waihanga');
      if (kete === 'auaha') return p.startsWith('/auaha');
      if (kete === 'arataki') return p.startsWith('/arataki');
      if (kete === 'pikau') return p.startsWith('/pikau');
      if (kete === 'toro') return p.startsWith('/toro');
      return false;
    });

    if (ketePages.length >= 2) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.6) {
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPersonalized, profile.detectedIndustry, profile.signals.pagesViewed, dismissed]);

  // Pull the latest live compliance update for the detected kete
  useEffect(() => {
    const kete = profile.detectedIndustry;
    if (!kete || !visible) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('kb_documents')
        .select('title, url, published_at, kb_sources!inner(agent_packs)')
        .is('superseded_by', null)
        .contains('kb_sources.agent_packs', [kete])
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || error || !data) return;
      setLiveUpdate({ title: data.title, url: data.url, published_at: data.published_at });
    })();
    return () => { cancelled = true; };
  }, [profile.detectedIndustry, visible]);

  if (!isPersonalized || !profile.detectedIndustry || dismissed) return null;

  const info = KETE_INFO[profile.detectedIndustry];
  if (!info) return null;

  const keteId = profile.detectedIndustry!;
  const rgb = hexToRgb(info.color);
  const variant = KETE_VARIANTS[keteId] ?? "standard";
  const accentLight = KETE_ACCENT_LIGHT[keteId] ?? info.color;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-16 left-0 right-0 z-[9998] flex items-center justify-center"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex items-center gap-3 px-5 h-[56px] text-[12px] w-full relative overflow-hidden"
            style={{
              background: '#EEEEF2',
              boxShadow: `
                0 6px 20px rgba(166,166,180,0.4),
                0 1px 0 rgba(255,255,255,0.9) inset,
                0 -1px 0 rgba(166,166,180,0.12) inset,
                0 0 30px rgba(${rgb},0.1)
              `,
              borderBottom: `1px solid rgba(${rgb},0.12)`,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {/* Liquid glass blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              <div className="absolute rounded-full" style={{
                width: 200, height: 70, left: '5%', top: '-15px',
                background: `radial-gradient(ellipse, rgba(${rgb},0.12) 0%, transparent 70%)`,
                animation: 'ctxLiquid1 8s ease-in-out infinite',
              }} />
              <div className="absolute rounded-full" style={{
                width: 140, height: 55, right: '15%', top: '-8px',
                background: `radial-gradient(ellipse, rgba(${rgb},0.08) 0%, transparent 70%)`,
                animation: 'ctxLiquid2 11s ease-in-out infinite',
              }} />
              <div className="absolute rounded-full" style={{
                width: 100, height: 45, left: '50%', bottom: '-10px',
                background: `radial-gradient(ellipse, rgba(200,195,220,0.08) 0%, transparent 70%)`,
                animation: 'ctxLiquid1 14s ease-in-out infinite reverse',
              }} />
            </div>

            {/* Accent glow line */}
            <div className="absolute top-0 left-[5%] right-[5%] h-[2px]" style={{
              background: `linear-gradient(90deg, transparent, rgba(${rgb},0.5), ${info.color}, rgba(${rgb},0.5), transparent)`,
              boxShadow: `0 0 16px rgba(${rgb},0.3), 0 0 6px rgba(${rgb},0.2)`,
            }} />
            <div className="absolute top-0 left-[3%] right-[3%] h-[1px] opacity-70" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
            }} />

            {/* ACTUAL Kete woven basket icon */}
            <div className="relative shrink-0 -my-2" style={{
              filter: `drop-shadow(0 0 8px rgba(${rgb},0.4))`,
            }}>
              <KeteIcon
                name={keteId}
                accentColor={info.color}
                accentLight={accentLight}
                variant={variant}
                size="small"
                animated={true}
              />
            </div>

            <span style={{ color: 'rgba(26,29,41,0.5)' }}>You're exploring</span>
            <span className="font-semibold tracking-[2px]" style={{
              color: info.color,
              textShadow: `0 0 12px rgba(${rgb},0.35)`,
            }}>
              {info.name}
            </span>
            <span style={{ color: 'rgba(26,29,41,0.15)' }}>·</span>

            {/* Live compliance ticker — pulled from kb_documents */}
            {liveUpdate && (
              <a
                href={liveUpdate.url ?? '#'}
                target={liveUpdate.url ? '_blank' : undefined}
                rel="noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full max-w-[360px] transition-all duration-200 hover:max-w-[420px]"
                style={{
                  background: `linear-gradient(145deg, rgba(${rgb},0.08), rgba(${rgb},0.04))`,
                  border: `1px solid rgba(${rgb},0.18)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 0 12px rgba(${rgb},0.1)`,
                }}
                title={liveUpdate.title}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: info.color }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: info.color }} />
                </span>
                <Radio size={10} style={{ color: info.color }} />
                <span className="text-[10px] uppercase tracking-[2px] font-semibold shrink-0" style={{ color: info.color }}>Live</span>
                <span className="text-[11px] truncate" style={{ color: '#3D4250', fontFamily: "'Inter', sans-serif" }}>
                  {liveUpdate.title}
                </span>
                {liveUpdate.published_at && (
                  <span className="text-[10px] shrink-0" style={{ color: 'rgba(26,29,41,0.4)' }}>
                    · {timeAgo(liveUpdate.published_at)}
                  </span>
                )}
              </a>
            )}

            {/* 3D pop-out button */}
            <Link
              to={info.samplePath}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 hover:-translate-y-[2px] active:translate-y-[1px]"
              style={{
                color: '#3D4250',
                background: 'linear-gradient(145deg, #F5F5F8, #E4E4E8)',
                boxShadow: `
                  4px 4px 10px rgba(166,166,180,0.5),
                  -4px -4px 10px rgba(255,255,255,0.95),
                  inset 0 1px 0 rgba(255,255,255,0.8),
                  0 0 12px rgba(${rgb},0.08)
                `,
                border: `1px solid rgba(${rgb},0.08)`,
              }}
            >
              See sample pack
              <ArrowRight size={11} />
            </Link>

            {/* 3D pop-out button */}
            <Link
              to="/kete"
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-[11px] transition-all duration-200 hover:-translate-y-[2px] active:translate-y-[1px]"
              style={{
                color: 'rgba(26,29,41,0.55)',
                background: 'linear-gradient(145deg, #F5F5F8, #E4E4E8)',
                boxShadow: `
                  4px 4px 10px rgba(166,166,180,0.45),
                  -4px -4px 10px rgba(255,255,255,0.9),
                  inset 0 1px 0 rgba(255,255,255,0.7)
                `,
              }}
            >
              Browse all
              <ChevronDown size={11} />
            </Link>

            {/* Dismiss — inset button */}
            <button
              onClick={() => setDismissed(true)}
              className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                color: 'rgba(26,29,41,0.3)',
                background: '#E6E6EA',
                boxShadow: `
                  inset 2px 2px 5px rgba(166,166,180,0.4),
                  inset -2px -2px 5px rgba(255,255,255,0.85)
                `,
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          <style>{`
            @keyframes ctxLiquid1 {
              0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.6; }
              33% { transform: translateX(25px) translateY(5px) scale(1.1); opacity: 0.9; }
              66% { transform: translateX(-15px) translateY(-3px) scale(1.05); opacity: 0.7; }
            }
            @keyframes ctxLiquid2 {
              0%, 100% { transform: translateX(0) scale(1); opacity: 0.5; }
              50% { transform: translateX(-25px) scale(1.15); opacity: 0.85; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}

'use client';

import { useEffect, useState } from 'react';
import { SAMPLE_VERTICALS } from '@/lib/living-site/verticals';
import { composeAd, hexToRgba, loadCampaignImage } from './compose';

type Campaign = {
  business: { name: string; slug: string; tagline: string; accent: string; ink: string; bg: string };
  headline: string;
  caption: string;
  imagePrompt: string;
  image: string;
  imageProvider: string;
  copyProvider: string;
  live: boolean;
};

type AdCard = { label: string; w: number; h: number; dataUrl: string };

const FORMATS: Array<[string, number, number]> = [
  ['Square 1:1', 1080, 1080],
  ['Story 9:16', 1080, 1920],
  ['Portrait 4:5', 1080, 1350],
  ['Landscape 16:9', 1920, 1080],
];

const BUSINESSES = [
  { slug: 'assembl', name: 'assembl (launch)' },
  ...SAMPLE_VERTICALS.map((v) => ({ slug: v.slug, name: v.businessName })),
];

type Dna = {
  url: string;
  name: string;
  descriptor: string;
  tagline: string;
  accent: string;
  ink: string;
  bg: string;
  facts: Array<{ label: string; value: string }>;
  source: 'muse' | 'meta';
};

export function AdStudioClient() {
  const [mode, setMode] = useState<'site' | 'sample'>('site');
  const [slug, setSlug] = useState(BUSINESSES[0]?.slug ?? '');
  const [url, setUrl] = useState('');
  const [dna, setDna] = useState<Dna | null>(null);
  const [reading, setReading] = useState(false);
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ads, setAds] = useState<AdCard[]>([]);
  const [note, setNote] = useState('');

  // Brand handed over from the homepage playground (same key as
  // components/home/BrandPlayground.tsx BRAND_DNA_KEY).
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('assembl-brand-dna');
      if (!raw) return;
      window.sessionStorage.removeItem('assembl-brand-dna');
      const d = JSON.parse(raw) as Dna;
      if (!d?.name) return;
      queueMicrotask(() => {
        setMode('site');
        setDna(d);
        setUrl(d.url ?? '');
        setNote('Check the brand read — edit anything that is off, then set the campaign goal.');
      });
    } catch {
      /* bad or absent handoff — the studio just starts empty */
    }
  }, []);

  const readSite = async () => {
    if (reading || !url.trim()) return;
    setReading(true);
    setDna(null);
    setNote('Reading the site…');
    try {
      const r = await fetch('/api/creative/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const d = await r.json();
      if (d.notConfigured) {
        setNote(`This needs ${d.envVar} set. ${d.detail}`);
        return;
      }
      if (d.error) {
        setNote(d.error);
        return;
      }
      setDna(d.dna as Dna);
      setNote('Check the brand read — edit anything that is off, then set the campaign goal.');
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setReading(false);
    }
  };

  const setDnaField = (patch: Partial<Dna>) => setDna((d) => (d ? { ...d, ...patch } : d));
  const removeFact = (i: number) =>
    setDna((d) => (d ? { ...d, facts: d.facts.filter((_, idx) => idx !== i) } : d));
  const editFact = (i: number, value: string) =>
    setDna((d) => (d ? { ...d, facts: d.facts.map((f, idx) => (idx === i ? { ...f, value } : f)) } : d));

  const generate = async () => {
    if (busy) return;
    if (mode === 'site' && !dna) {
      setNote('Read your website first — paste the address above.');
      return;
    }
    setBusy(true);
    setNote(
      mode === 'site'
        ? 'Briefing Muse + Prism with your brand…'
        : 'Reading the Genome and briefing Muse + Prism…',
    );
    setCampaign(null);
    setAds([]);
    try {
      const r = await fetch('/api/creative/ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'site' ? { dna, goal } : { slug, goal }),
      });
      const d = await r.json();
      if (d.notConfigured) {
        setNote(`This needs ${d.envVar} set. ${d.detail}`);
        return;
      }
      if (d.error) {
        setNote(d.error);
        return;
      }
      const c = d.campaign as Campaign;
      setCampaign(c);
      const img = await loadCampaignImage(c.image);
      if (document.fonts?.ready) await document.fonts.ready;
      const cards = FORMATS.map(([label, w, h]) => ({ label, w, h, dataUrl: composeAd(img, w, h, c) }));
      setAds(cards);
      setNote(
        `Campaign ready — ${c.copyProvider === 'muse' ? 'Muse wrote the copy' : 'copy from your brand facts'}, ${c.imageProvider} made the image${
          mode === 'sample' ? `, Genome ${c.live ? 'live' : 'sample'}` : ''
        }.`,
      );
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const download = (card: AdCard) => {
    const a = document.createElement('a');
    a.href = card.dataUrl;
    a.download = `assembl-ad-${mode === 'site' ? 'your-site' : slug}-${card.w}x${card.h}.png`;
    a.click();
  };
  const downloadAll = () => ads.forEach((card, i) => window.setTimeout(() => download(card), i * 250));

  const wrap: React.CSSProperties = { maxWidth: 1080, margin: '0 auto', padding: 'clamp(20px, 5vw, 40px)' };
  const label: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-mono), Space Mono, monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6b7581',
    margin: '0 0 6px',
  };
  const field: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 10,
    border: '1px solid rgba(49,60,66,0.16)',
    background: '#fff',
    color: '#313c42',
    fontSize: 15,
  };
  const button: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#3f7373',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.7 : 1,
  };

  return (
    <div style={wrap}>
      <p style={{ margin: '0 0 22px', color: '#4a5560', lineHeight: 1.55, maxWidth: 620 }}>
        Point it at your website. assembl reads your brand off the page, you check what it found,
        set the goal, and it writes the ad in your voice, generates an on-brand image, and lays the
        campaign out in every size — all drafts for your yes.
      </p>

      <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
        <div role="tablist" aria-label="Where the brand comes from" style={{ display: 'flex', gap: 8 }}>
          {(
            [
              ['site', 'Your website'],
              ['sample', 'Sample business'],
            ] as const
          ).map(([m, labelText]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                border: `1px solid ${mode === m ? '#3f7373' : 'rgba(49,60,66,0.16)'}`,
                background: mode === m ? 'rgba(63,115,115,0.1)' : '#fff',
                color: mode === m ? '#2e5a58' : '#4a5560',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {labelText}
            </button>
          ))}
        </div>

        {mode === 'site' ? (
          <>
            <div>
              <span style={label}>Your website</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...field, flex: 1 }}
                  type="url"
                  value={url}
                  placeholder="e.g. yourbusiness.co.nz"
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') readSite();
                  }}
                />
                <button
                  type="button"
                  onClick={readSite}
                  disabled={reading || !url.trim()}
                  style={{ ...button, width: 'auto', padding: '11px 18px', opacity: reading || !url.trim() ? 0.7 : 1 }}
                >
                  {reading ? 'Reading…' : 'Read the site'}
                </button>
              </div>
            </div>

            {dna && (
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${hexToRgba(dna.accent, 0.45)}`,
                  background: '#fbfaf6',
                }}
              >
                <span style={{ ...label, margin: 0, color: dna.accent }}>
                  Brand read from {dna.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} — yours to correct
                </span>
                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr auto' }}>
                  <div>
                    <span style={label}>Business name</span>
                    <input style={field} value={dna.name} maxLength={80} onChange={(e) => setDnaField({ name: e.target.value })} />
                  </div>
                  <div>
                    <span style={label}>Colour</span>
                    <input
                      type="color"
                      value={dna.accent}
                      onChange={(e) => setDnaField({ accent: e.target.value })}
                      style={{ width: 52, height: 44, padding: 2, borderRadius: 10, border: '1px solid rgba(49,60,66,0.16)', background: '#fff', cursor: 'pointer' }}
                      aria-label="Brand colour"
                    />
                  </div>
                </div>
                <div>
                  <span style={label}>Tagline</span>
                  <input style={field} value={dna.tagline} maxLength={160} onChange={(e) => setDnaField({ tagline: e.target.value })} />
                </div>
                {dna.facts.length > 0 && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <span style={{ ...label, margin: 0 }}>What the page said</span>
                    {dna.facts.map((f, i) => (
                      <div key={`${f.label}-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#6b7581', minWidth: 88, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {f.label}
                        </span>
                        <input
                          style={{ ...field, padding: '7px 10px', fontSize: 13 }}
                          value={f.value}
                          maxLength={240}
                          onChange={(e) => editFact(i, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeFact(i)}
                          aria-label={`Remove ${f.label}`}
                          style={{ border: 'none', background: 'transparent', color: '#6b7581', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <span style={label}>Business</span>
            <select style={field} value={slug} onChange={(e) => setSlug(e.target.value)}>
              {BUSINESSES.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <span style={label}>Goal or offer</span>
          <input
            style={field}
            type="text"
            value={goal}
            placeholder="e.g. fill the March intake, or promote a winter offer (optional)"
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        <button
          type="button"
          style={{ ...button, opacity: busy || (mode === 'site' && !dna) ? 0.7 : 1 }}
          onClick={generate}
          disabled={busy || (mode === 'site' && !dna)}
        >
          {busy ? 'Generating…' : 'Generate campaign'}
        </button>
        {note && (
          <p style={{ margin: 0, color: '#4a5560', lineHeight: 1.5, fontSize: 14 }} aria-live="polite">
            {note}
          </p>
        )}
      </div>

      {campaign && (
        <div style={{ marginTop: 28 }}>
          <p style={{ ...label, color: campaign.business.accent }}>
            {campaign.headline}
          </p>
          <p style={{ margin: '2px 0 0', color: '#4a5560', lineHeight: 1.55, maxWidth: 620 }}>
            {campaign.caption}
          </p>
        </div>
      )}

      {ads.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              margin: '26px 0 12px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ ...label, margin: 0 }}>Four sizes · draft — sign off before it runs</span>
            <button
              type="button"
              onClick={downloadAll}
              style={{ ...button, width: 'auto', padding: '9px 16px', fontSize: 13 }}
            >
              Download all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {ads.map((card) => (
              <figure key={card.label} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.dataUrl}
                  alt={`${campaign?.business.name} ad — ${card.label}`}
                  style={{ width: '100%', borderRadius: 10, display: 'block', border: '1px solid rgba(49,60,66,0.1)' }}
                />
                <figcaption
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8 }}
                >
                  <span style={{ fontSize: 12, color: '#6b7581' }}>{card.label}</span>
                  <button
                    type="button"
                    onClick={() => download(card)}
                    style={{
                      border: '1px solid rgba(63,115,115,0.4)',
                      background: 'transparent',
                      color: '#3f7373',
                      borderRadius: 8,
                      padding: '5px 11px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Download
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

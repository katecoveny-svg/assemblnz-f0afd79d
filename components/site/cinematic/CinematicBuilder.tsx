'use client';

import { useEffect, useRef, useState } from 'react';
import { CineFooter } from './CineFooter';
import * as THREE from 'three';

/**
 * /build-an-agent — Kate's agent-builder.html prototype, ported 1:1.
 * A contained 3D vitrine: six clickable parts orbit a navy core with a brass
 * glow heart and two rings. Drag to rotate; click (or use the 01–06 selector)
 * to inspect a part; share copies an agent-recipe card. Her hot-env material
 * recipe (near-black env + very high envMapIntensity) kept as-is.
 */

/** What /api/agent-brief reads back off a real business website. */
type Brief = {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
  source: string;
  /** Counted off their own stylesheets — null when the site has no clear palette. */
  brand: { primary: string; secondary: string | null; accent: string | null; ink: string } | null;
  /** How many of the extracted questions the site actually answers. */
  answered?: number;
  /** The ones it doesn't — used for the refusal demo. */
  unanswered?: string[];
};

const PARTS = [
  { n: 'memory', s: '01', q: 'What does it remember?', v: 'Customer preferences, past interactions, context that carries across sessions. Consent-based and data-minimised.', a: 'read/write · consent-based' },
  { n: 'knowledge', s: '02', q: 'What does it know?', v: 'Approved offers, prices, FAQs and business rules from the Blueprint. Reads only confirmed sources.', a: 'read only · confirmed sources' },
  { n: 'intelligence', s: '03', q: 'How does it reason?', v: 'Model selection, temperature, reasoning depth. Configurable per agent — tuned to the job.', a: 'configurable · testable' },
  { n: 'voice', s: '04', q: 'How does it speak?', v: 'Tone, formality, personality — warm, plain, helpful. Encoded from your business voice profile.', a: 'encoded · consistent' },
  { n: 'abilities', s: '05', q: 'What can it do?', v: 'Read, organise, compare and draft. Never sends, files, books or commits without approval.', a: 'bounded · visible' },
  { n: 'boundaries', s: '06', q: 'What stops it?', v: 'The operating limit — approval stays visible. The rule travels with the work.', a: 'enforced · traceable' },
];

export function CinematicBuilder() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  // The pieces placed in the gallery above carry down into this builder —
  // "the builder is meant to assemble from the parts" (Kate, 27 Jul).
  const [galleryParts, setGalleryParts] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('assembl-gallery-parts');
      if (raw) setGalleryParts(JSON.parse(raw) as string[]);
    } catch { /* no handoff — the builder stands alone */ }
  }, []);
  const [copied, setCopied] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [actionErr, setActionErr] = useState('');
  const [askQ, setAskQ] = useState('');
  const [askA, setAskA] = useState('');
  const [askBusy, setAskBusy] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefBusy, setBriefBusy] = useState(false);
  const [briefError, setBriefError] = useState('');
  // Keeping a blueprint is the one place anything is stored, so it is opt-in
  // and the email is the consent step.
  const [keepEmail, setKeepEmail] = useState('');
  const [keepBusy, setKeepBusy] = useState(false);
  const [keepError, setKeepError] = useState('');
  const [keptUrl, setKeptUrl] = useState('');
  const [keptCopied, setKeptCopied] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState(false);
  // Separate from keeping the blueprint — aggregate use is opted into, never inherited.
  const [aggregateConsent, setAggregateConsent] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  // Set by the scene effect: renders a fresh frame and returns it as a PNG
  // data-URI (WebGL buffers are cleared after present, so capture must
  // re-render synchronously).
  const captureRef = useRef<(() => string) | null>(null);
  /** The visitor's own brand palette, read live by the render loop. */
  const brandRef = useRef<{ primary: string; secondary: string | null } | null>(null);
  brandRef.current = brief?.brand ?? null;

  // A share link restores the named agent and the inspected part.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = q.get('name');
    const part = q.get('part');
    if (n) setAgentName(n.slice(0, 40));
    if (part && !Number.isNaN(+part)) setActive(Math.min(5, Math.max(0, +part)));

    // Arriving from the homepage invitation: the blueprint has already been
    // assembled, so pick it up rather than making the model read the page again.
    const site = q.get('site');
    if (!site) return;
    setSiteUrl(site);
    try {
      const stored = sessionStorage.getItem('assembl:brief');
      if (!stored) return;
      const parsed = JSON.parse(stored) as Brief;
      if (parsed?.source === site) {
        setBrief(parsed);
        if (!n) setAgentName(parsed.source.replace(/^www\./, '').split('.')[0]);
        if (parsed.questions?.[0]) setAskQ(parsed.questions[0]);
      }
      sessionStorage.removeItem('assembl:brief');
    } catch {
      /* nothing handed over — the visitor can assemble again from here */
    }
  }, []);

  function shareUrl() {
    const q = new URLSearchParams();
    if (agentName.trim()) q.set('name', agentName.trim());
    q.set('part', String(activeRef.current));
    return `https://www.assembl.co.nz/build-an-agent?${q.toString()}`;
  }

  function copyCard() {
    const p = PARTS[activeRef.current];
    const who = agentName.trim() || `${p.n} Agent`;
    navigator.clipboard.writeText(
      `assembl agent recipe — ${who}\n${p.s} — ${p.n}\n\n${p.q}\n${p.v}\n\nAccess: ${p.a}\nnothing sends without approval\n\n${shareUrl()}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /** Save the blueprint and mint the link that can actually be sent. */
  async function keepAndShare() {
    if (!brief || keepBusy) return;
    setKeepBusy(true);
    setKeepError('');
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, email: keepEmail.trim(), aggregateConsent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setKeepError(typeof data?.error === 'string' ? data.error : 'Could not keep that right now.');
        return;
      }
      setKeptUrl(String(data.url));
    } catch {
      setKeepError('Could not keep that right now — try again in a moment.');
    } finally {
      setKeepBusy(false);
    }
  }

  /**
   * Ask the agent something the website genuinely does not answer, and let the
   * visitor watch it decline rather than invent. Every competitor demos an AI
   * that answers; this is the one that earns trust.
   */
  function askTheHardOne() {
    const q = brief?.unanswered?.[0];
    if (!q) return;
    setAskQ(q);
    document.getElementById('ask-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { void askAgent(); }, 500);
  }

  function copyKept() {
    if (!keptUrl) return;
    navigator.clipboard.writeText(keptUrl);
    setKeptCopied(true);
    setTimeout(() => setKeptCopied(false), 2000);
  }

  function shareIntent(net: 'x' | 'li') {
    const text = `I assembled ${agentName.trim() || 'an agent'} with assembl — every part visible, nothing sends without approval.`;
    const url = keptUrl || shareUrl();
    const href =
      net === 'x'
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(href, '_blank', 'noopener');
  }

  /** Read a real business website and assemble its Business Blueprint. */
  async function assembleFromSite() {
    const url = siteUrl.trim();
    if (!url || briefBusy) return;
    setBriefBusy(true);
    setBriefError('');
    setBrief(null);
    setAskA('');
    try {
      const res = await fetch('/api/agent-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBriefError(typeof data?.error === 'string' ? data.error : 'That site could not be read.');
        return;
      }
      setBrief(data as Brief);
      if (!agentName.trim() && data.source) {
        setAgentName(String(data.source).replace(/^www\./, '').split('.')[0]);
      }
      if (Array.isArray(data.questions) && data.questions[0]) setAskQ(String(data.questions[0]));
    } catch {
      setBriefError('The blueprint service is resting — try again in a moment.');
    } finally {
      setBriefBusy(false);
    }
  }

  // Same live agent the homepage demo streams from — but once a blueprint is
  // assembled it answers as THAT business's agent, from that business's own
  // published facts, on the deep model tier.
  async function askAgent() {
    const question = askQ.trim();
    if (!question || askBusy) return;
    setAskBusy(true);
    setAskA('');
    try {
      const res = await fetch('/api/build-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          config: {
            name: agentName.trim() || 'assembl demo agent',
            business: brief
              ? [
                  `${brief.business} (public website: ${brief.source})`,
                  brief.sells.length ? `What they offer: ${brief.sells.join('; ')}.` : '',
                  brief.facts.length ? `Facts from their own site — treat these as the only ones you know: ${brief.facts.join(' | ')}` : '',
                  brief.blindSpots.length ? `Their site does NOT answer: ${brief.blindSpots.join('; ')}. If asked about these, say plainly that the website doesn't cover it and what you'd need.` : '',
                ].filter(Boolean).join('\n')
              : 'a New Zealand small business',
            // Deep tier: this is answering as someone's real business.
            modelTier: brief ? 'premium' : 'mid',
            memoryScope: 'session',
            tools: ['calendar', 'web-search'],
            knowledge: brief ? [`${brief.source} — public website`] : [],
            voice: brief?.voice
              ? `${brief.voice} Never invent a price, a service or a claim that isn't in the facts above.`
              : 'Warm, plain-spoken. Never invents prices.',
            guardrails: ['cite-sources', 'no-personal-data'],
          },
        }),
      });
      if (!res.ok || !res.body) {
        setAskA('The agent is resting — try again in a moment.');
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setAskA(acc);
      }
    } catch {
      setAskA('The agent is resting — try again in a moment.');
    } finally {
      setAskBusy(false);
    }
  }

  /**
   * The agent, in their colours, as a shareable image.
   *
   * This is the artefact someone posts publicly — it flatters them. (The gaps
   * are the thing people forward privately; different journey, different
   * design.) Composited on a canvas rather than rendered server-side so it uses
   * the exact frame the visitor is looking at.
   */
  async function downloadPortrait() {
    if (portraitBusy) return;
    const shot = captureRef.current?.();
    if (!shot) return;
    setPortraitBusy(true);
    try {
      const W = 1200, H = 630;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      const accent = brief?.brand?.primary ?? '#B8964F';
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, W, H);
      // a soft wash of their colour behind the agent
      const wash = ctx.createRadialGradient(W * 0.62, H * 0.5, 20, W * 0.62, H * 0.5, H * 0.85);
      wash.addColorStop(0, `${accent}26`);
      wash.addColorStop(1, '#FDFBF700');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      const img = new Image();
      img.src = shot;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const scale = Math.min((W * 0.58) / img.width, (H * 0.92) / img.height);
      const iw = img.width * scale, ih = img.height * scale;
      ctx.drawImage(img, W * 0.60 - iw / 2 + 60, H / 2 - ih / 2, iw, ih);

      const name = (brief?.source ?? agentName.trim() ?? 'your agent').replace(/^www\./, '');
      ctx.fillStyle = accent;
      ctx.font = '600 17px ui-monospace, monospace';
      ctx.fillText('YOUR AGENT · ASSEMBL', 64, 96);

      ctx.fillStyle = '#1A1918';
      ctx.font = '300 54px Lato, system-ui, sans-serif';
      ctx.fillText(name, 64, 168);

      ctx.fillStyle = 'rgba(26,25,24,0.62)';
      ctx.font = '300 23px Lato, system-ui, sans-serif';
      const line = brief?.brand?.secondary
        ? 'Built from our own website, wearing our own colours.'
        : 'Built from our own website.';
      ctx.fillText(line, 64, 212);

      // their palette, small
      const sw = [brief?.brand?.primary, brief?.brand?.secondary, brief?.brand?.accent].filter(Boolean) as string[];
      sw.forEach((hex, i) => {
        ctx.fillStyle = hex;
        ctx.fillRect(64 + i * 52, H - 148, 40, 40);
      });

      ctx.fillStyle = 'rgba(26,25,24,0.5)';
      ctx.font = '400 17px ui-monospace, monospace';
      ctx.fillText('assembl.co.nz', 64, H - 72);

      const blob: Blob | null = await new Promise((res) => cv.toBlob(res, 'image/png'));
      if (!blob) return;
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `${name.replace(/[^\w-]+/g, '-').toLowerCase()}-agent.png`;
      a.click();
      URL.revokeObjectURL(href);
    } finally {
      setPortraitBusy(false);
    }
  }

  async function downloadPdf() {
    if (pdfBusy) return;
    setPdfBusy(true);
    setActionErr('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210;
      const H = 297;
      const M = 20; // margin

      const hexToRgb = (hex: string): [number, number, number] => {
        const h = hex.replace('#', '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      };
      const PAPER: [number, number, number] = [253, 251, 247];
      const INK: [number, number, number] = brief?.brand?.ink ? hexToRgb(brief.brand.ink) : [26, 25, 23];
      const MUTED: [number, number, number] = [122, 118, 110];
      const BRASS: [number, number, number] = [184, 150, 79];
      // Their colour leads the document; assembl's brass stays as the maker's mark.
      const ACCENT: [number, number, number] = brief?.brand?.primary ? hexToRgb(brief.brand.primary) : BRASS;
      const ACCENT2: [number, number, number] | null = brief?.brand?.secondary ? hexToRgb(brief.brand.secondary) : null;
      const who = brief ? brief.source.replace(/^www\./, '') : (agentName.trim() || 'your agent');
      const dated = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

      const page = () => { doc.setFillColor(...PAPER); doc.rect(0, 0, W, H, 'F'); };
      const mono = (t: string, x: number, y: number, size = 7, col = MUTED, align?: 'right') => {
        doc.setFont('courier', 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...col);
        doc.text(t.toUpperCase(), x, y, align ? { align, charSpace: 0.5 } : { charSpace: 0.5 });
      };
      const foot = (n: string) => {
        doc.setDrawColor(230, 226, 218);
        doc.setLineWidth(0.2);
        doc.line(M, H - 18, W - M, H - 18);
        mono('assembl  ·  blueprint', M, H - 13);
        mono(n, W - M, H - 13, 7, MUTED, 'right');
      };

      // ── PAGE 1 · the cover, in their colour ──────────────────────────────
      page();
      doc.setFillColor(...ACCENT);
      doc.rect(0, 0, W, 88, 'F');
      if (ACCENT2) { doc.setFillColor(...ACCENT2); doc.rect(0, 88, W, 3.2, 'F'); }

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('BUSINESS BLUEPRINT', M, 26, { charSpace: 0.9 });
      doc.setFont('times', 'normal');
      doc.setFontSize(34);
      doc.text(doc.splitTextToSize(who, W - M * 2) as string[], M, 48);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text(`READ FROM THEIR OWN WEBSITE  ·  ${dated.toUpperCase()}`, M, 72, { charSpace: 0.6 });

      // The agent, wearing their colours. Fit to the vitrine's real aspect —
      // a fixed box stretches the sphere into an ellipse.
      const shot = captureRef.current?.();
      if (shot) {
        const cv = rootRef.current?.querySelector('#builder-canvas') as HTMLCanvasElement | null;
        const aspect = cv && cv.height ? cv.width / cv.height : 4 / 3;
        const boxW = 118;
        const boxH = 74;
        let imgW = boxW;
        let imgH = boxW / aspect;
        if (imgH > boxH) { imgH = boxH; imgW = boxH * aspect; }
        doc.addImage(shot, 'PNG', W / 2 - imgW / 2, 100 + (boxH - imgH) / 2, imgW, imgH);
      }

      doc.setFont('times', 'normal');
      doc.setFontSize(15);
      doc.setTextColor(...INK);
      if (brief) {
        doc.text(doc.splitTextToSize(brief.business, W - M * 2) as string[], M, 190);
      } else {
        doc.text('An agent assembled from six visible parts.', M, 190);
      }

      if (brief?.brand) {
        mono('the colours it is wearing', M, 232, 7, MUTED);
        const sw = [brief.brand.primary, brief.brand.secondary, brief.brand.accent].filter(Boolean) as string[];
        sw.forEach((hex, i) => {
          doc.setFillColor(...hexToRgb(hex));
          doc.roundedRect(M + i * 34, 236, 28, 16, 1.5, 1.5, 'F');
          mono(hex, M + i * 34, 258, 6, MUTED);
        });
      }
      foot('01');

      // ── PAGE 2 · what the website says ───────────────────────────────────
      if (brief) {
        doc.addPage(); page();
        doc.setFillColor(...ACCENT);
        doc.rect(0, 0, W, 2.4, 'F');
        mono('what your website says', M, 24, 8, ACCENT);

        let y = 40;
        const heading = (t: string) => {
          if (y > H - 46) { foot('02'); doc.addPage(); page(); y = 30; }
          mono(t, M, y, 7, ACCENT);
          y += 7;
        };
        const bullets = (items: string[]) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...INK);
          items.forEach((it) => {
            const wrapped = doc.splitTextToSize(it, W - M * 2 - 6) as string[];
            if (y + wrapped.length * 5 > H - 30) { foot('02'); doc.addPage(); page(); y = 30; }
            doc.setFillColor(...ACCENT);
            doc.circle(M + 1.4, y - 1.4, 0.9, 'F');
            doc.text(wrapped, M + 6, y);
            y += wrapped.length * 5 + 3.5;
          });
          y += 8;
        };
        const para = (t: string) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...INK);
          const wrapped = doc.splitTextToSize(t, W - M * 2) as string[];
          doc.text(wrapped, M, y);
          y += wrapped.length * 5 + 11;
        };

        if (brief.sells.length) { heading('what you offer'); bullets(brief.sells); }
        if (brief.facts.length) { heading('facts your agent will not invent around'); bullets(brief.facts); }
        if (brief.voice) { heading('your voice'); para(brief.voice); }
        foot('02');

        // ── PAGE 3 · the gaps — the page people forward ────────────────────
        if (brief.blindSpots.length) {
          doc.addPage(); page();
          doc.setFillColor(...ACCENT);
          doc.rect(0, 0, W, 2.4, 'F');
          mono('what your website does not answer', M, 24, 8, ACCENT);
          doc.setFont('times', 'normal');
          doc.setFontSize(19);
          doc.setTextColor(...INK);
          doc.text(doc.splitTextToSize('Every one of these is a question a customer already has.', W - M * 2) as string[], M, 42);

          let gy = 66;
          brief.blindSpots.forEach((b, i) => {
            const wrapped = doc.splitTextToSize(b, W - M * 2 - 16) as string[];
            const boxH = wrapped.length * 5.4 + 15;
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(M, gy, W - M * 2, boxH, 2.5, 2.5, 'F');
            mono(String(i + 1).padStart(2, '0'), M + 7, gy + 10, 8, ACCENT);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);
            doc.setTextColor(...INK);
            doc.text(wrapped, M + 18, gy + 10);
            gy += boxH + 6;
          });
          foot('03');
        }
      }

      // ── FINAL PAGE · the agent's own anatomy + the boundary ──────────────
      doc.addPage(); page();
      doc.setFillColor(...ACCENT);
      doc.rect(0, 0, W, 2.4, 'F');
      mono('the agent, part by part', M, 24, 8, ACCENT);
      let py = 38;
      PARTS.forEach((part) => {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, py, W - M * 2, 25, 2.5, 2.5, 'F');
        mono(part.s, M + 7, py + 9, 8, ACCENT);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...INK);
        doc.text(part.n, M + 18, py + 9);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text(doc.splitTextToSize(part.v, W - M * 2 - 26) as string[], M + 18, py + 15);
        py += 28;
      });

      doc.setFillColor(8, 13, 26);
      doc.roundedRect(M, py + 4, W - M * 2, 17, 2.5, 2.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(212, 168, 67);
      doc.text('Nothing sends without approval — the rule travels with the work.', M + 8, py + 14.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('Assembled by assembl from one public page on the date shown. Nothing was stored.', M, H - 30);
      doc.text('Confirm anything commercial before relying on it.', M, H - 25.5);
      doc.setTextColor(...BRASS);
      doc.textWithLink('assembl.co.nz/build-an-agent', M, H - 13, { url: shareUrl() });
      mono('assembl@assembl.co.nz  ·  aotearoa new zealand', W - M, H - 13, 7, MUTED, 'right');

      doc.save(`${who.replace(/[^\w-]+/g, '-').toLowerCase()}-blueprint.pdf`);
    } catch {
      // jsPDF loads on demand; a failed chunk (mid-deploy, offline) used to
      // strand the button on "assembling…" forever.
      setActionErr('The PDF could not be assembled just now — refresh and try again.');
    } finally {
      setPdfBusy(false);
    }
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = (t: EventTarget, e: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      t.addEventListener(e, fn, opts);
      cleanups.push(() => t.removeEventListener(e, fn));
    };
    const onKey = (ev: Event) => { if ((ev as KeyboardEvent).key === 'Escape') setShareOpen(false); };
    on(document, 'keydown', onKey);

    const canvas = root.querySelector('#builder-canvas') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    // The canvas lives far below the fold; its mount-time size can be stale by
    // the time it scrolls into view (Kate's cropped-object screenshot). A
    // ResizeObserver re-frames it whenever the real dimensions change.
    const reframe = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(reframe);
    ro.observe(canvas);
    cleanups.push(() => ro.disconnect());
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FDFBF7');
    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 9.2);
    camera.lookAt(0, 0, 0);

    // Kate's proven softbox recipe (assembl3d.js): emissive panels baked into
    // the env map give chrome its long specular streaks — directional lights
    // alone bake to almost nothing and everything reads as black blobs.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const softbox = (color: string, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    softbox('#FFFFFF', 14, 5, 0, 9, 0);
    softbox('#FFF6E8', 8, 12, -10, 2, 4);
    softbox('#E9EEF4', 8, 10, 10, 1, -3);
    softbox('#FFFFFF', 3, 14, 5, 2, 8);
    softbox('#D9DEE6', 16, 3, 0, -7, 0);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
    scene.add(new THREE.AmbientLight('#FFFFFF', 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', 2.5); key.position.set(5, 8, 5); scene.add(key);
    const fill = new THREE.DirectionalLight('#FFF8EE', 1); fill.position.set(-3, 3, 3); scene.add(fill);

    const brass = new THREE.MeshPhysicalMaterial({ color: '#B8964F', metalness: 1, roughness: 0.12, envMapIntensity: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const brassBright = new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8, clearcoatRoughness: 0.1 });
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 });
    const navy = new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 });
    const navyDark = new THREE.MeshPhysicalMaterial({ color: '#081026', metalness: 0.9, roughness: 0.04, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.04 });

    const group = new THREE.Group();
    scene.add(group);
    group.position.y = 0.1;

    const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), navy.clone());
    group.add(core);
    // Calmed from 0.5/0.95 — the old settings read as 'the super glowing 3d
    // thing' arriving out of nowhere under the gallery (Kate, 28 Jul).
    const glowMat = new THREE.MeshStandardMaterial({ color: '#D4A843', metalness: 0.5, roughness: 0.1, emissive: '#D4A843', emissiveIntensity: 0.22, transparent: true, opacity: 0.85 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), glowMat);
    group.add(glow);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 16, 96), brassBright.clone());
    ring1.rotation.x = Math.PI / 2.5; group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.06, 12, 72), chrome);
    ring2.rotation.x = Math.PI / 2.8; ring2.rotation.y = Math.PI / 4; group.add(ring2);

    const partShapes = [
      { geo: new THREE.TorusGeometry(0.45, 0.12, 16, 40), mat: brass },
      { geo: new THREE.OctahedronGeometry(0.5, 0), mat: navyDark },
      { geo: new THREE.ConeGeometry(0.4, 0.85, 4), mat: chrome },
      { geo: new THREE.TorusGeometry(0.38, 0.1, 12, 32), mat: brass },
      { geo: new THREE.TetrahedronGeometry(0.48, 0), mat: navyDark },
      { geo: new THREE.IcosahedronGeometry(0.45, 0), mat: chrome },
    ];
    type PartMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    const partMeshes: PartMesh[] = partShapes.map((sh, i) => {
      const mesh = new THREE.Mesh(sh.geo, sh.mat.clone()) as PartMesh;
      mesh.userData = { index: i, baseR: 3.2, speed: 0.2 + i * 0.08, phase: i * 1.05, baseEmissive: (sh.mat as THREE.MeshStandardMaterial).emissiveIntensity || 0 };
      group.add(mesh);
      return mesh;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false, dragged = false, prevX = 0, prevY = 0, hovered: number | null = null;

    on(canvas, 'mousedown', (ev) => { const e = ev as MouseEvent; isDragging = true; dragged = false; prevX = e.clientX; prevY = e.clientY; });
    on(canvas, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      if (isDragging) {
        const dx = e.clientX - prevX, dy = e.clientY - prevY;
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
        group.rotation.y += dx * 0.005;
        group.rotation.x += dy * 0.003;
        prevX = e.clientX; prevY = e.clientY;
      }
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(partMeshes);
      hovered = hits.length > 0 ? (hits[0].object.userData.index as number) : null;
      canvas.style.cursor = hovered !== null ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    });
    on(canvas, 'mouseup', () => { isDragging = false; });
    on(canvas, 'mouseleave', () => { isDragging = false; });
    on(canvas, 'click', (ev) => {
      if (dragged) return;
      const e = ev as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(partMeshes);
      if (hits.length > 0) setActive(hits[0].object.userData.index as number);
    });

    let t = 0, raf = 0;
    // Their colour goes in the middle; the rings take their second colour; the
    // chrome stays assembl's. Applied per-frame because a blueprint can land at
    // any moment — comparing first keeps it to a no-op the rest of the time.
    let appliedBrand = '';
    function applyBrand() {
      const b = brandRef.current;
      const sig = b ? `${b.primary}|${b.secondary ?? ''}` : '';
      if (sig === appliedBrand) return;
      appliedBrand = sig;
      if (b) {
        core.material.color.set(b.primary);
        core.material.emissive.set(b.primary);
        core.material.emissiveIntensity = 0.18;
        glowMat.color.set(b.primary);
        glowMat.emissive.set(b.primary);
        ring1.material.color.set(b.secondary ?? b.primary);
        ring1.material.emissiveIntensity = 0;
      } else {
        core.material.color.set('#080D1A');
        core.material.emissive.set('#080D1A');
        core.material.emissiveIntensity = 0.1;
        glowMat.color.set('#D4A843');
        glowMat.emissive.set('#D4A843');
        ring1.material.color.set('#D4A843');
      }
      core.material.needsUpdate = true;
      ring1.material.needsUpdate = true;
      glowMat.needsUpdate = true;
    }

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;
      applyBrand();
      core.rotation.y = t * 0.1;
      glow.rotation.y = -t * 0.15;
      ring1.rotation.z = t * 0.06;
      ring2.rotation.z = -t * 0.04;
      const act = activeRef.current;
      partMeshes.forEach((m, i) => {
        const d = m.userData;
        const a = d.phase + t * d.speed;
        m.position.set(Math.cos(a) * d.baseR, Math.sin(t * 0.3 + d.phase) * 0.8, Math.sin(a) * d.baseR);
        m.rotation.y = t * 0.25 + d.phase;
        m.rotation.x = Math.sin(t * 0.2 + d.phase) * 0.2;
        if (i === act) {
          m.material.emissive = new THREE.Color('#D4A843');
          m.material.emissiveIntensity = 0.3;
          m.scale.setScalar(1.15);
        } else if (i === hovered) {
          m.material.emissive = new THREE.Color('#D4A843');
          m.material.emissiveIntensity = 0.15 + Math.sin(t * 3) * 0.05;
          m.scale.setScalar(1);
        } else {
          m.material.emissive = new THREE.Color('#000000');
          m.material.emissiveIntensity = d.baseEmissive;
          m.scale.setScalar(1);
        }
      });
      renderer.render(scene, camera);
    }
    // Two WebGL scenes share /build-an-agent (the gallery above this) — only
    // the one on screen may render, or mobile browsers start dropping contexts.
    let running = false;
    const startLoop = () => { if (!running) { running = true; tick(); } };
    const stopLoop = () => { if (running) { running = false; cancelAnimationFrame(raf); } };
    const vio = new IntersectionObserver(
      (entries) => { (entries[0]?.isIntersecting ? startLoop : stopLoop)(); },
      { rootMargin: '200px 0px' },
    );
    vio.observe(canvas);
    const onCtxLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onCtxLost);
    cleanups.push(() => { stopLoop(); vio.disconnect(); canvas.removeEventListener('webglcontextlost', onCtxLost); });

    // PDF snapshot: re-render synchronously, then read the buffer.
    captureRef.current = () => {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    };
    cleanups.push(() => { captureRef.current = null; });

    on(window, 'resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    cleanups.push(() => { pmrem.dispose(); renderer.dispose(); });
    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  const p = PARTS[active];

  return (
    <div className="cine" ref={rootRef} style={{ cursor: 'auto' }}>
      <div className="content">
        <nav className="nav">
          <a className="wordmark" href="/">assembl</a>
          <div className="nav-links">
            <a href="/agents">agents</a>
            <a href="/pricing">pricing</a>
            <a href="/assembling">the agentic journey</a>
          </div>
          <a className="nav-cta" href="/">← home</a>
        </nav>

        <header className="page-header" style={{ paddingBottom: 24 }}>
          <div className="kicker">assemble an agent</div>
          <h1 className="builder-h1">Build intelligence<br /><span className="accent">you can see.</span></h1>
          <p className="lede" style={{ marginTop: 12 }}>Put your website in. Watch an agent assemble itself out of what your business already says — then ask it the question your customers keep asking. Nothing sends without approval.</p>
        </header>

        <div className="page-body" style={{ paddingBottom: 0 }}>
          <div className="glass-panel site-panel">
            <div className="panel-header">
              start here <span className="live">{briefBusy ? 'reading the site' : brief ? 'blueprint ready' : 'step 01'}</span>
            </div>
            {galleryParts.length > 0 && (
              <div className="gallery-hand">
                <b>Your {galleryParts.length} pieces from the gallery are in:</b> {galleryParts.join(' · ')}.
                Now give it your site — the agent assembles from these parts, in your colours, from your words.
              </div>
            )}
            <div className="site-row">
              <input
                className="site-input"
                type="text"
                inputMode="url"
                value={siteUrl}
                maxLength={200}
                placeholder="yourbusiness.co.nz"
                onChange={(e) => setSiteUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') assembleFromSite(); }}
              />
              <button className="btn btn-solid" onClick={assembleFromSite} disabled={briefBusy || !siteUrl.trim()}>
                {briefBusy ? 'assembling…' : 'assemble my agent'}
              </button>
            </div>
            <div className="site-note">
              Reads one public page. Nothing is stored, and nothing is sent anywhere.
            </div>
            {briefError ? <div className="site-error">{briefError}</div> : null}

            {brief ? (
              <div className="brief">
                <div className="brief-line">
                  <span className="brief-lab">what it understood</span>
                  <p>{brief.business}</p>
                </div>
                {brief.brand ? (
                  <div className="brief-line">
                    <span className="brief-lab">your colours · read off your own stylesheet</span>
                    <div className="brand-swatches">
                      <span className="sw" style={{ background: brief.brand.primary }} title={brief.brand.primary}>
                        <em>{brief.brand.primary}</em>
                      </span>
                      {brief.brand.secondary ? (
                        <span className="sw" style={{ background: brief.brand.secondary }} title={brief.brand.secondary}>
                          <em>{brief.brand.secondary}</em>
                        </span>
                      ) : null}
                      {brief.brand.accent ? (
                        <span className="sw" style={{ background: brief.brand.accent }} title={brief.brand.accent}>
                          <em>{brief.brand.accent}</em>
                        </span>
                      ) : null}
                      <span className="sw-note">your agent above is wearing them</span>
                    </div>
                  </div>
                ) : null}
                {brief.sells.length ? (
                  <div className="brief-line">
                    <span className="brief-lab">knowledge · what you offer</span>
                    <div className="brief-chips">{brief.sells.map((x) => <span className="brief-chip" key={x}>{x}</span>)}</div>
                  </div>
                ) : null}
                {brief.facts.length ? (
                  <div className="brief-line">
                    <span className="brief-lab">facts it will not invent around</span>
                    <ul className="brief-list">{brief.facts.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                ) : null}
                {brief.voice ? (
                  <div className="brief-line">
                    <span className="brief-lab">voice · how you already write</span>
                    <p>{brief.voice}</p>
                  </div>
                ) : null}
                {brief.blindSpots.length ? (
                  <div className="brief-line brief-gap">
                    <span className="brief-lab">what your site doesn&rsquo;t answer</span>
                    <ul className="brief-list">{brief.blindSpots.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                ) : null}
                {brief.unanswered?.length ? (
                  <div className="brief-line brief-refuse">
                    <span className="brief-lab">watch it refuse to make something up</span>
                    <p>
                      Your site doesn&rsquo;t answer &ldquo;{brief.unanswered[0]}&rdquo;. Ask it anyway — a useful agent
                      says so plainly instead of inventing an answer.
                    </p>
                    <button className="btn btn-solid" onClick={askTheHardOne} disabled={askBusy}>
                      ask it the hard one →
                    </button>
                  </div>
                ) : null}
                {brief.questions.length ? (
                  <div className="brief-line">
                    <span className="brief-lab">try asking it</span>
                    <div className="brief-chips">
                      {brief.questions.map((q) => (
                        <button className="brief-q" key={q} onClick={() => { setAskQ(q); document.getElementById('ask-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>{q}</button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="page-body">
          <div className="builder-3d">
            <canvas id="builder-canvas" />
            <div className="builder-hint"><span className="live-dot" />interactive 3d — drag to rotate</div>
            <div className="part-selector">
              {PARTS.map((pp, i) => (
                <button key={pp.s} className={`part-btn-3d ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>{pp.s}</button>
              ))}
            </div>
            <div className="inspector-overlay show">
              <h3><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: 'var(--brass)' }}>{p.s}</span> {p.n}</h3>
              <dl>
                <dt>question</dt><dd>{p.q}</dd>
                <dt>configured value</dt><dd>{p.v}</dd>
                <dt>access</dt><dd>{p.a}</dd>
              </dl>
              <div className="proof-note">Approval stays visible. The rule travels with the work.</div>
            </div>
            <div className="builder-ui">
              <div>
                <div className="part-label">part {p.s} of 06</div>
                <div className="part-name">{p.n}</div>
                <div className="part-desc">{p.v}</div>
              </div>
              <div className="part-actions">
                <button className="btn btn-glass" onClick={() => setShareOpen(true)}>share ↗</button>
                {/* This said "assemble →" and opened an email — Kate caught it.
                    Assemble means assemble: it builds the blueprint document. */}
                <button className="btn btn-solid" onClick={() => void downloadPdf()} disabled={pdfBusy}>
                  {pdfBusy ? 'assembling…' : 'assemble the document ↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="page-body" style={{ paddingTop: 0 }}>
          <div className="glass-panel" id="ask-panel" style={{ maxWidth: 720 }}>
            <div className="panel-header">
              {agentName.trim() ? `${agentName.trim()} — live` : 'Agent — live'}{' '}
              <span className="live">
                {askBusy ? 'drafting' : brief ? `grounded in ${brief.source}` : 'ready'}
              </span>
            </div>
            <textarea
              className="demo-input"
              rows={2}
              value={askQ}
              maxLength={400}
              placeholder="ask it something a customer would ask…"
              onChange={(e) => setAskQ(e.target.value)}
            />
            <button className="btn btn-solid demo-btn" onClick={askAgent} disabled={askBusy || !askQ.trim()}>
              {askBusy ? 'drafting…' : 'ask the agent'}
            </button>
            {askA ? <div className="demo-answer">{askA}</div> : null}
          </div>
        </div>

        <CineFooter />
      </div>

      {shareOpen ? (
        <div className="card-overlay show" onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="share-card">
            <button className="close-btn" onClick={() => setShareOpen(false)}>✕</button>
            <div className="sc-kicker">agent recipe · assembl</div>
            <div className="sc-title">{agentName.trim() || `${p.n} Agent`}</div>
            <input
              className="sc-name"
              type="text"
              value={agentName}
              maxLength={40}
              placeholder="name your agent…"
              onChange={(e) => setAgentName(e.target.value)}
            />
            <div className="sc-parts">{PARTS.map((pp) => <span className="sc-p" key={pp.s}>{pp.s} {pp.n}</span>)}</div>
            <div className="sc-desc">{p.v}</div>
            <div className="sc-proof">nothing sends without approval · {p.a}</div>
            {brief ? (
              <div className="sc-keep">
                {keptUrl ? (
                  <>
                    <span className="brief-lab">your blueprint has a home</span>
                    <div className="sc-keep-row">
                      <input className="sc-keep-input" readOnly value={keptUrl} onFocus={(e) => e.currentTarget.select()} />
                      <button className="btn btn-solid" onClick={copyKept}>{keptCopied ? 'copied' : 'copy link'}</button>
                    </div>
                    <div className="sc-keep-note">Kept for 90 days, then deleted.</div>
                  </>
                ) : (
                  <>
                    <span className="brief-lab">keep it, so you can send it</span>
                    <div className="sc-keep-row">
                      <input
                        className="sc-keep-input"
                        type="email"
                        value={keepEmail}
                        placeholder="you@yourbusiness.co.nz"
                        onChange={(e) => setKeepEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') keepAndShare(); }}
                      />
                      <button className="btn btn-solid" onClick={keepAndShare} disabled={keepBusy || !keepEmail.trim()}>
                        {keepBusy ? 'keeping…' : 'get my link'}
                      </button>
                    </div>
                    <div className="sc-keep-note">
                      Everything else here is read-and-forget. Keeping it stores this blueprint for 90 days so it has a
                      link you can send, and lets Kate write back once.
                    </div>
                    <label className="sc-consent">
                      <input
                        type="checkbox"
                        checked={aggregateConsent}
                        onChange={(e) => setAggregateConsent(e.target.checked)}
                      />
                      <span>
                        Optional: let assembl count this anonymously towards a yearly picture of what New Zealand
                        business websites leave unanswered. Your name and address are never published.
                      </span>
                    </label>
                    {keepError ? <div className="sc-keep-err">{keepError}</div> : null}
                  </>
                )}
              </div>
            ) : null}
            <div className="sc-actions">
              <button className="btn btn-solid" onClick={downloadPdf} disabled={pdfBusy}>
                {pdfBusy ? 'assembling…' : 'download the blueprint (pdf)'}
              </button>
              <button className="btn btn-glass" onClick={downloadPortrait} disabled={portraitBusy}>
                {portraitBusy ? 'drawing…' : 'download the agent image'}
              </button>
              <button className="btn btn-glass" onClick={copyCard}>{copied ? 'copied!' : 'copy link'}</button>
              <button className="btn btn-glass" onClick={() => shareIntent('x')}>share on X</button>
              <button className="btn btn-glass" onClick={() => shareIntent('li')}>linkedin</button>
            </div>
            {actionErr ? <div className="sc-keep-err">{actionErr}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

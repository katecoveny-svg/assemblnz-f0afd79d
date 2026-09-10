'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, Copy, Download, MessageCircle, Share2, Smartphone, X } from 'lucide-react';
import { VERTICALS, verticalShareUrl, type VerticalSlug } from '@/lib/verticals/config';
import './vertical-apps.css';

type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function VerticalAppTools({ slug, app = false }: { slug: VerticalSlug; app?: boolean }) {
  const v = VERTICALS[slug];
  const prompt = useRef<InstallEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [installed, setInstalled] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const [panel, setPanel] = useState<'install' | 'share'>('install');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const standalone = () => setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    standalone();
    const onPrompt = (event: Event) => { event.preventDefault(); prompt.current = event as InstallEvent; setPromptReady(true); };
    const onInstall = () => { setInstalled(true); setPromptReady(false); prompt.current = null; };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstall);
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register(`/agents/${slug}/sw.js`, { scope: `/agents/${slug}/`, updateViaCache: 'none' }).catch(() => undefined);
    }
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstall); };
  }, [slug]);

  function show(next: 'install' | 'share') {
    setPanel(next); setNote(''); setLink(verticalShareUrl(window.location.origin, slug));
    dialog.current?.showModal();
  }

  async function install() {
    const event = prompt.current;
    if (!event) { setNote('Use your browser’s install or Add to Home Screen option below.'); return; }
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'accepted') { setInstalled(true); setNote('Installation accepted. Your browser will finish adding the app.'); }
    } catch { setNote('Use your browser’s install menu to add the app.'); }
    finally { prompt.current = null; setPromptReady(false); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(link); setNote('App link copied. Your conversation is not included.'); }
    catch { setNote('Select and copy the app link below.'); }
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: `${v.name} · assembl`, text: v.description, url: link }); setNote('Share sheet completed.'); return; }
      catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    }
    await copyLink();
  }

  return <>
    <nav className={app ? 'va-app-tools' : 'va-dock'} aria-label={`${v.name} app controls`}>
      {!app && <a href="#live-agent" aria-label={`Try ${v.name} live chat`}><MessageCircle size={17} aria-hidden /><span>Try the agent</span></a>}
      {!app && <a href={`/agents/${slug}/app`} className="va-dock-open"><ArrowUpRight size={17} aria-hidden /><span>Open app</span></a>}
      <button type="button" onClick={() => show('install')} aria-label={`Install ${v.name}`}><Smartphone size={17} aria-hidden /><span>{installed ? 'App added' : 'Get app'}</span></button>
      <button type="button" onClick={() => show('share')} aria-label={`Share ${v.name}`}><Share2 size={17} aria-hidden /><span>Share</span></button>
    </nav>
    <dialog className="va-dialog" ref={dialog} aria-labelledby={`va-dialog-${slug}`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="va-dialog-inner">
        <button className="va-icon-button va-dialog-close" type="button" aria-label="Close" onClick={() => dialog.current?.close()}><X size={20} /></button>
        <Image unoptimized className="va-app-icon" src={`/brand/vertical-apps/${slug}/icon-192.png`} width={64} height={64} alt="" />
        <p className="va-eyebrow">{v.field} · <span style={{ textTransform: 'none' }}>assembl</span></p>
        <h2 id={`va-dialog-${slug}`}>{panel === 'install' ? `${v.name}, on your home screen.` : `Pass ${v.name} on.`}</h2>
        <p>{panel === 'install' ? 'Open your agent in its own app window, one tap away.' : 'Send the app to a colleague or save a card for your next demo. Your conversation stays out of the link.'}</p>
        {panel === 'install' ? <>
          {installed ? <p className="va-success"><Check size={18} />This app is added or running in its own window.</p> : promptReady && <button className="va-button va-button-primary" onClick={() => void install()}><Download size={17} />Add {v.name}</button>}
          <ol className="va-install-help">
            <li><strong>iPhone & iPad</strong><span>Open this page in Safari. Tap Share, then Add to Home Screen. Enable Open as Web App if offered.</span></li>
            <li><strong>Android</strong><span>Open in Chrome. Tap the menu, then Install app or Add to Home screen.</span></li>
            <li><strong>On your computer</strong><span>Use Chrome or Edge’s install icon in the address bar. In Safari, choose File → Add to Dock.</span></li>
          </ol>
          <p className="va-small">An internet connection is needed for live replies. No app-store download required.</p>
        </> : <>
          <Image className="va-share-preview" src={`/brand/vertical-apps/${slug}/share.jpg`} width={1200} height={630} sizes="500px" alt={`${v.name} app share card`} />
          <div className="va-dialog-buttons">
            <button className="va-button va-button-primary" onClick={() => void share()}><Share2 size={17} />Share app</button>
            <button className="va-button" onClick={() => void copyLink()}><Copy size={17} />Copy link</button>
            <a className="va-button" href={`/brand/vertical-apps/${slug}/share.jpg`} download={`${slug}-assembl.jpg`}><Download size={17} />Save card</a>
            <a className="va-button" href={`/brand/vertical-apps/${slug}/portrait.jpg`} download={`${slug}-assembl-portrait.jpg`}><Download size={17} />Portrait card</a>
          </div>
          <label className="va-link-label">App link<input readOnly value={link} onFocus={e => e.currentTarget.select()} /></label>
        </>}
        <p className="va-action-note" role="status">{note}</p>
      </div>
    </dialog>
  </>;
}

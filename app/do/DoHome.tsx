'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, Download, Film, Pause, Play, X } from 'lucide-react';
import { LivingAssembly } from './DoLivingAssembly';
import { DoWorkspace } from './DoWorkspace';
import { CustomerJourneys } from '@/components/site/assembl-the-work/CustomerJourneys';
import { DO_TASKS, type DoTask } from '@/apps/do/shared/preparation';
import '@/components/site/assembl-the-work/assembl-the-work.css';
import { readHomeBrief } from '@/apps/do/shared/home-handoff';

const VIEWS = [
  { name: 'write', eyebrow: 'Your writing and task agents. Ready when you are.', title: <>Write it.<br />Work it out.</>, copy: 'Draft a reply. Polish your writing. Turn notes into a plan. Bring the text and choose the agent that helps.' },
  { name: 'work', eyebrow: 'Less organising. A clearer next step.', title: <>A brief.<br />A plan. A reply.</>, copy: 'Compare the options, find the details or prepare the handoff. Six ready-made agents turn the text you choose into useful work.' },
  { name: 'anywhere', eyebrow: 'DO goes where the work is.', title: <>A little DO.<br />Alongside you.</>, copy: 'Select text in your browser or paste a message from another app. Get a draft, review it and copy it back. Keep DO close with the widget.' },
];
const subscribeMotion = (fn: () => void) => { const q = matchMedia('(prefers-reduced-motion: reduce)'); q.addEventListener('change', fn); return () => q.removeEventListener('change', fn); };
const subscribeVisibility = (fn: () => void) => { document.addEventListener('visibilitychange', fn); return () => document.removeEventListener('visibilitychange', fn); };

export function DoHome() {
  const [view, setView] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [brief, setBrief] = useState('');
  const [selectedTask, setSelectedTask] = useState<DoTask>('reply');
  const [handoffError, setHandoffError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState('');
  const workspace = useRef<HTMLDialogElement>(null);
  const downloads = useRef<HTMLDialogElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => true);
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const running = !paused && !reduced && visible && !modalOpen;

  function openWorkspace() { workspace.current?.showModal(); setModalOpen(true); }
  useEffect(() => {
    // Hydrate the tab's external handoff only after the dialog has mounted.
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const selected = DO_TASKS.find(item => item.id === params.get('task'));
      if (selected) setSelectedTask(selected.id);
      if (params.get('from') !== 'home' && params.get('open') !== '1' && !selected) return;
      if (params.get('from') === 'home') {
        try {
          const incoming = readHomeBrief(sessionStorage, params.get('handoff') || '');
          if (incoming) { setBrief(incoming); setSelectedTask('brief'); }
          else setHandoffError('This homepage draft has expired or is unavailable in this tab. Add your text below to continue.');
        } catch { setHandoffError('This browser could not open the homepage draft. Add your text below to continue.'); }
      }
      workspace.current?.showModal(); setModalOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setCinema(false); };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, []);

  return <div className="do-product">
    <section className={`do-world ${cinema ? 'do-cinema' : ''}`} aria-label="DO, by assembl">
      <LivingAssembly running={running} reduced={reduced} view={view} cinema={cinema} />
      <div className="do-world-shade" />
      <header className="do-world-header do-interface"><Link href="/do" className="do-world-logo" aria-label="DO home">DO<span aria-hidden>✦</span></Link><Link href="/" className="do-by">by <strong>assembl</strong></Link><nav aria-label="DO"><button onClick={() => { downloads.current?.showModal(); setModalOpen(true); }}><Download size={15} />Take DO with you</button><button onClick={openWorkspace}>Open DO <ArrowUpRight size={16} /></button></nav></header>
      <div className="do-world-story do-interface" key={view}><p>{VIEWS[view].eyebrow}</p><h1>{VIEWS[view].title}</h1><p className="do-world-lede">{VIEWS[view].copy}</p><button className="do-world-make" onClick={openWorkspace}><span aria-hidden>✦</span> Choose an agent <ArrowUpRight size={20} /></button><span className="do-world-boundary">Prepare · review · take it with you</span></div>
      <aside className="do-world-peek do-interface"><span className="do-small-label">SIX READY-MADE AGENTS</span><button onClick={openWorkspace}><span aria-hidden>✦</span><span><strong>{view === 0 ? 'A reply. A plan. A clearer draft.' : view === 1 ? 'A clearer comparison.' : 'A brief ready for your review.'}</strong><small>Pick an agent. Add text. Take the result with you.</small></span><ArrowUpRight size={19} /></button></aside>
      <footer className="do-world-footer do-interface"><div className="do-viewpoints"><span className="do-small-label">VIEWPOINT</span><div role="group" aria-label="Change viewpoint">{VIEWS.map((item, index) => <button key={item.name} aria-pressed={view === index} onClick={() => setView(index)}><span>0{index + 1}</span>{item.name}</button>)}</div></div><div className="do-motion-controls"><button aria-label={paused ? 'Play motion' : 'Pause motion'} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused ? <Play size={17} /> : <Pause size={17} />}</button><button aria-label="Enter cinema mode" onClick={() => setCinema(true)}><Film size={17} /></button></div><p>Generated imagery · living motion.<br />{reduced ? 'Reduced motion is on.' : 'A study in assembly.'}</p></footer>
      {cinema && <div className="do-cinema-controls"><button onClick={() => setPaused(value => !value)} disabled={reduced} aria-label={paused ? 'Play motion' : 'Pause motion'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button><button onClick={() => setCinema(false)}>Exit cinema</button></div>}
    </section>
    <section className="do-product-detail" aria-label="What you can do"><div><span className="do-small-label">A PRODUCT IN ITS OWN RIGHT</span><h2>Your writing.<br />Your work. Your DO.</h2></div><div><p>Six ready-made agents help you reply, write, plan, brief, compare and find the details. Use selected webpage text, a document excerpt or a message you paste. Edit the result, then copy it into your email, message or document.</p><div className="do-detail-links"><button onClick={openWorkspace}>Start a task <ArrowUpRight size={16} /></button><button onClick={() => { downloads.current?.showModal(); setModalOpen(true); }}>Get the widget <ArrowUpRight size={16} /></button></div><p className="do-product-boundary">The current product prepares work for review. Account connections, background monitoring and external actions require a separately configured workflow.</p></div></section>
    <section className="do-agent-directory" aria-label="Ready-made DO agents"><div><span className="do-small-label">PICK THE HELP YOU NEED</span><h2>Six agents.<br/>One little DO.</h2></div><div className="do-agent-directory-grid">{DO_TASKS.map(agent=><button key={agent.id} onClick={()=>{setSelectedTask(agent.id);openWorkspace();}}><span aria-hidden>{agent.glyph}</span><strong>{agent.title}</strong><p>{agent.description}</p><ArrowUpRight size={17}/></button>)}</div></section>
    <section className="do-portability" id="take-do-with-you"><span className="do-small-label">KEEP DO CLOSE</span><h2>Where the work is.</h2><div><article><h3>In your browser.</h3><p>Select the part of a page you need. Open the extension, choose an agent and review the result.</p><a href="/api/do/download?format=extension" download>Download browser extension <Download size={16}/></a></article><article><h3>In your messages.</h3><p>Paste a message into DO. Draft a reply, adjust the tone and copy it back into your messaging or email app.</p><button onClick={()=>{setSelectedTask('reply');openWorkspace();}}>Write a reply <ArrowUpRight size={16}/></button></article><article><h3>On your website.</h3><p>Add a small DO launcher. Visitors can bring text, choose an agent and prepare their next step.</p><a href="/api/do/download?format=embed" download>Download website widget <Download size={16}/></a></article></div><button className="do-install-help" onClick={()=>{downloads.current?.showModal();setModalOpen(true);}}>Installation and embed code <ArrowUpRight size={16}/></button></section>
    <div className="atw"><CustomerJourneys /></div>
    <section className="do-product-family"><span className="do-small-label">BUY ONE PRODUCT. OR CONNECT THE WHOLE SYSTEM.</span><p>DO for the next step. Pursuit for the next client. Creative Studio for the work they see.</p><div><Link href="/contact?product=do">DO for your team <ArrowUpRight size={16} /></Link><Link href="/pursuit">Pursuit <ArrowUpRight size={16} /></Link><Link href="/creative-studio">Creative Studio <ArrowUpRight size={16} /></Link></div></section>
    <dialog ref={workspace} aria-label="DO preparation workspace" className="do-workspace-dialog" onClose={() => setModalOpen(false)}><button className="do-dialog-close" aria-label="Close DO workspace" onClick={() => workspace.current?.close()}><X size={21} /></button>{handoffError && <p className="do-error" role="alert">{handoffError}</p>}<DoWorkspace key={brief + selectedTask} initialBrief={brief} initialTask={selectedTask} /></dialog>
    <dialog ref={downloads} aria-label="Download DO" className="do-download-dialog" onClose={() => setModalOpen(false)}><button className="do-dialog-close" aria-label="Close downloads" onClick={() => downloads.current?.close()}><X size={21} /></button><span className="do-small-label">TAKE DO WITH YOU</span><h2>Your DO.<br />Where you need it.</h2><p>Use DO on a page, in your browser, or as part of your own website.</p><div className="do-download-card"><span aria-hidden>↗</span><div><h3>Browser extension</h3><p>Capture selected text when you choose. Review it before preparation. Includes the complete extension source.</p><a href="/api/do/download?format=extension" download><Download size={16} />Download extension ZIP</a><details><summary>Install in Chrome or Edge</summary><ol><li>Download and unzip the extension.</li><li>Open the browser’s Extensions page and turn on Developer mode.</li><li>Choose “Load unpacked” and select the unzipped folder.</li><li>Pin DO. Capture a selection, review it and choose a task.</li></ol><p>This is a direct install. It is not a Chrome Web Store listing.</p></details></div></div><div className="do-download-card"><span aria-hidden>✦</span><div><h3>Website widget</h3><p>A small DO launcher for your site. Visitors paste text into a separate preparation window.</p><a href="/api/do/download?format=embed" download><Download size={16} />Download widget kit</a><button onClick={async () => { try { await navigator.clipboard.writeText('<script src="https://www.assembl.co.nz/api/do/widget" defer></script>'); setDownloadNotice('Widget embed copied.'); } catch { setDownloadNotice('Download the widget kit to get the embed code.'); } }}>Copy embed code</button></div></div>{downloadNotice && <p className="do-success" role="status">{downloadNotice}</p>}<p className="do-download-note">The hosted runtime stays with assembl. Downloads contain no provider keys. Preparation availability and limits are shared with the web product.</p></dialog>
  </div>;
}

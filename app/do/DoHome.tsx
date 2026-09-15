'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Download, PlugZap, X } from 'lucide-react';
import { DoWorkspace } from './DoWorkspace';
import { DO_TASKS, type DoTask } from '@/apps/do/shared/preparation';
import { readHomeBrief } from '@/apps/do/shared/home-handoff';
import './do-current.css';

const PATHS = [
  { n: '01', name: 'companion', copy: 'Keep DO beside the work in your browser or on your Mac. Bring selected context when you choose.', href: '/do/widget' },
  { n: '02', name: 'office', copy: 'See your DO team, active work, approvals, handoffs and receipts in one place.', href: '/do/office' },
  { n: '03', name: 'Builderdoo', copy: 'Give your persistent chief builder a software job. The model can change; the build contract stays.', href: '/do/builder' },
  { n: '04', name: 'connections', copy: 'Connect the capabilities your DOs need once, with user-scoped OAuth and visible authority.', href: '/do/connections' },
] as const;

export function DoHome() {
  const [brief, setBrief] = useState('');
  const [selectedTask, setSelectedTask] = useState<DoTask>('reply');
  const [handoffError, setHandoffError] = useState('');
  const [downloadNotice, setDownloadNotice] = useState('');
  const workspace = useRef<HTMLDialogElement>(null);
  const downloads = useRef<HTMLDialogElement>(null);

  function openWorkspace(task?: DoTask) {
    if (task) setSelectedTask(task);
    workspace.current?.showModal();
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const selected = DO_TASKS.find((item) => item.id === params.get('task'));
      if (selected) setSelectedTask(selected.id);
      if (params.get('from') !== 'home' && params.get('open') !== '1' && !selected) return;
      if (params.get('from') === 'home') {
        try {
          const incoming = readHomeBrief(sessionStorage, params.get('handoff') || '');
          if (incoming) { setBrief(incoming); setSelectedTask('brief'); }
          else setHandoffError('This homepage draft has expired or is unavailable in this tab. Add your text below to continue.');
        } catch { setHandoffError('This browser could not open the homepage draft. Add your text below to continue.'); }
      }
      workspace.current?.showModal();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <div className="do-current">
    <header className="doc-nav">
      <div className="doc-brand"><Link href="/do" className="doc-logo">DO</Link><Link href="/" className="doc-by">by <strong>assembl</strong></Link></div>
      <nav className="doc-nav-links" aria-label="DO">
        <Link href="/do/office">office</Link><Link href="/do/builder">Builderdoo</Link><Link href="/do/connections">connections</Link>
        <button type="button" onClick={() => downloads.current?.showModal()}><Download size={14}/> take DO with you</button>
        <button type="button" className="doc-primary" onClick={() => openWorkspace()}>open DO <ArrowUpRight size={15}/></button>
      </nav>
    </header>

    <section className="doc-hero">
      <p className="doc-kicker">YOUR PORTABLE AGENT WORKFORCE</p>
      <h1>the work moves.<br/>your DOs come with you.</h1>
      <div className="doc-hero-copy">
        <p>Give one DO a job or assemble a team. Bring the right context, tools and model to the work without rebuilding yourself in every new chat.</p>
        <div className="doc-hero-actions"><button type="button" onClick={() => openWorkspace()}>give DO a job <ArrowUpRight size={17}/></button><Link href="/do/office">see the office <ArrowUpRight size={17}/></Link></div>
      </div>
    </section>

    <main className="doc-main">
      <section>
        <div className="doc-section-head"><div><p className="doc-kicker">ONE RUNTIME · DIFFERENT SURFACES</p><h2>start where<br/>the work is.</h2></div><p>DO keeps identity, context, permissions, evidence and task state separate from the model underneath. Use the surface that fits the moment.</p></div>
        <div className="doc-paths">{PATHS.map((path) => <Link className="doc-path" href={path.href} key={path.name}><span>{path.n}</span><h3>{path.name}</h3><p>{path.copy}</p><strong>open <ArrowUpRight size={14}/></strong></Link>)}</div>
      </section>

      <section className="doc-workforce">
        <div><p className="doc-kicker">CAPABILITY FIRST</p><h2>your DO asks for the tool it needs.</h2><p>Email, CRM, Sheets, image, video and spatial production sit behind one capability layer. Connect an account once; the DO still needs the right authority before consequential actions happen.</p></div>
        <div className="doc-cap-list">
          <Link href="/do/connections"><span>01</span><strong>email + business tools</strong><small>user-scoped connections</small></Link>
          <Link href="/do/connections"><span>02</span><strong>creative production</strong><small>image · video · web · 3D</small></Link>
          <Link href="/do/builder"><span>03</span><strong>software factory</strong><small>model-agnostic Builderdoo</small></Link>
          <Link href="/do/office"><span>04</span><strong>coordination + proof</strong><small>approvals · receipts · handoffs</small></Link>
        </div>
      </section>

      <section className="doc-anywhere">
        <div className="doc-section-head"><div><p className="doc-kicker">USEFUL NOW</p><h2>small jobs.<br/>real outcomes.</h2></div><p>Start with bounded work today. As you connect tools and grant authority, the same DO can take on deeper workflows without changing its identity.</p></div>
        <div className="doc-anywhere-grid">
          <article><h3>prepare something</h3><p>Reply, plan, compare, brief, find details or create a visual draft with the material you choose.</p><button type="button" onClick={() => openWorkspace()}>start a task <ArrowUpRight size={14}/></button></article>
          <article><h3>build something</h3><p>Give Builderdoo a software objective, proof requirements and authority boundary, then hand the job to the best available builder.</p><Link href="/do/builder">open Builderdoo <ArrowUpRight size={14}/></Link></article>
          <article><h3>connect something</h3><p>Add a supported account once. DO sees the capability and health state, not your raw OAuth credentials.</p><Link href="/do/connections">manage connections <PlugZap size={14}/></Link></article>
        </div>
      </section>

      <section className="doc-boundary"><h2>powerful because<br/>the boundary is visible.</h2><p>A connected tool is not blanket permission. DO can observe, draft, recommend or act only within the authority granted to that task. Sending, publishing, spending and sensitive changes remain approval-gated and leave evidence.</p></section>
    </main>

    <footer className="doc-footer"><Link href="/" className="doc-logo">assembl</Link><p>DO · portable agents for real work.<br/>Built in Aotearoa.</p><nav><Link href="/do/office">Office</Link><Link href="/do/builder">Builderdoo</Link><Link href="/do/connections">Connections</Link><Link href="/contact?product=do">DO for your team</Link></nav></footer>

    <dialog ref={workspace} aria-label="DO preparation workspace" className="do-workspace-dialog"><button className="do-dialog-close" aria-label="Close DO workspace" onClick={() => workspace.current?.close()}><X size={21}/></button>{handoffError && <p className="do-error" role="alert">{handoffError}</p>}<DoWorkspace key={brief + selectedTask} initialBrief={brief} initialTask={selectedTask}/></dialog>

    <dialog ref={downloads} aria-label="Take DO with you" className="do-download-dialog"><button className="do-dialog-close" aria-label="Close downloads" onClick={() => downloads.current?.close()}><X size={21}/></button><span className="do-small-label">TAKE DO WITH YOU</span><h2>Your DO.<br/>Where you need it.</h2><p>The browser extension brings reviewed page context into DO. The native Mac companion is the persistent cross-app direction.</p><div className="do-download-card"><span aria-hidden>↗</span><div><h3>Browser extension</h3><p>Capture selected context when you choose and prepare the next step.</p><a href="/api/do/download?format=extension" download><Download size={16}/>Download extension ZIP</a></div></div><div className="do-download-card"><span aria-hidden>✦</span><div><h3>Website widget</h3><p>Add a small DO launcher to a website without shipping provider keys.</p><a href="/api/do/download?format=embed" download><Download size={16}/>Download widget kit</a><button onClick={async () => { try { await navigator.clipboard.writeText('<script src="https://www.assembl.co.nz/api/do/widget" defer></script>'); setDownloadNotice('Widget embed copied.'); } catch { setDownloadNotice('Download the widget kit to get the embed code.'); } }}>Copy embed code</button></div></div>{downloadNotice && <p className="do-success" role="status">{downloadNotice}</p>}</dialog>
  </div>;
}

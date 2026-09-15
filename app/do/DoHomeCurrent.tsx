'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Cable, Hammer, Layers3, MonitorUp, Sparkles, X } from 'lucide-react';
import { DoWorkspace } from './DoWorkspace';
import styles from './do-current.module.css';

const SURFACES = [
  { href: '/do/office', icon: Layers3, label: 'DO Office', note: 'See what needs you, what is working and what is done.' },
  { href: '/do/builder', icon: Hammer, label: 'Builderdoo', note: 'Give your chief builder a product or software job.' },
  { href: '/do/connections', icon: Cable, label: 'Connections', note: 'Connect the capabilities your DOs need once.' },
  { href: '/do/widget', icon: MonitorUp, label: 'Companion', note: 'Keep DO beside the work in your browser.' },
] as const;

const DO_TYPES = [
  { label: 'Personal', copy: 'Admin, bills, family, travel and the work of everyday life.' },
  { label: 'Work', copy: 'Research, briefs, customer work, building, writing and operations.' },
  { label: 'Specialist', copy: 'Builder, Creative Director, Pursuit, Finance and workflow-specific DOs.' },
] as const;

export function DoHomeCurrent() {
  const workspace = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  function openWorkspace() { setOpen(true); workspace.current?.showModal(); }

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.brand}><Link href="/do">DO</Link><span>by</span><Link href="/">assembl</Link></div>
      <nav aria-label="DO"><Link href="/do/office">Office</Link><Link href="/do/connections">Connections</Link><Link href="/do/builder">Builderdoo</Link><button type="button" onClick={openWorkspace}>Open DO <ArrowUpRight size={15}/></button></nav>
    </header>

    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>your portable agent workforce</p>
          <h1>give the work.<br/>keep the context.</h1>
          <p className={styles.lede}>Your DOs can research, prepare, build and coordinate around a real outcome. The model can change. Your context, tools, permissions and proof stay with the work.</p>
          <div className={styles.actions}><button type="button" onClick={openWorkspace}>Give DO a job <ArrowRight size={18}/></button><Link href="/do/office">Open your Office <ArrowUpRight size={18}/></Link></div>
        </div>
        <aside className={styles.system} aria-label="How DO works">
          <div><span>01</span><strong>Context</strong><p>Bring only what matters for this job.</p></div>
          <div><span>02</span><strong>Capability</strong><p>DO uses the right tools and model for the work.</p></div>
          <div><span>03</span><strong>Authority</strong><p>Sending, spending and publishing stay permissioned.</p></div>
          <div><span>04</span><strong>Receipt</strong><p>See what happened, what changed and what still needs you.</p></div>
        </aside>
      </section>

      <section className={styles.surfaceSection}>
        <header><p className={styles.eyebrow}>one DO runtime · different ways in</p><h2>work where the work is.</h2></header>
        <div className={styles.surfaceGrid}>{SURFACES.map(({href, icon: Icon, label, note}) => <Link href={href} key={href}><Icon size={20}/><div><strong>{label}</strong><p>{note}</p></div><ArrowUpRight size={16}/></Link>)}</div>
      </section>

      <section className={styles.teamSection}>
        <div><p className={styles.eyebrow}>your team of DOs</p><h2>small specialists.<br/>one shared memory.</h2><p>Start with one useful DO. Add specialists when the work demands them. Personal, work and client context stay scoped instead of becoming one giant prompt.</p></div>
        <div className={styles.teamCards}>{DO_TYPES.map((item, index) => <article key={item.label}><span>0{index+1}</span><BriefcaseBusiness size={19}/><strong>{item.label}</strong><p>{item.copy}</p></article>)}</div>
      </section>

      <section className={styles.connectionSection}>
        <div><Cable size={24}/><p className={styles.eyebrow}>connect once</p><h2>email, work apps and creative tools without the setup wall.</h2></div>
        <div><p>DO asks for a capability, not a pile of API keys. Connect the account you want to use; credentials stay with the authorised connector layer and consequential actions still require the right approval.</p><Link href="/do/connections">Manage connections <ArrowUpRight size={17}/></Link></div>
      </section>

      <section className={styles.builderSection}>
        <Sparkles size={26}/><div><p className={styles.eyebrow}>for builders</p><h2>Builderdoo keeps the job.<br/>the coding model is replaceable.</h2><p>Plan the build once, then hand the same job contract to Codex, Claude Code, Grok Build or another compatible execution harness.</p></div><Link href="/do/builder">Open Builderdoo <ArrowUpRight size={17}/></Link>
      </section>
    </main>

    <footer className={styles.footer}><Link href="/">assembl</Link><span>Find it. DO it. Show it.</span><div><Link href="/do/office">Office</Link><Link href="/do/connections">Connections</Link><Link href="/legal/privacy">Privacy</Link></div></footer>

    <dialog ref={workspace} className="do-workspace-dialog" aria-label="DO workspace" onClose={() => setOpen(false)}><button className="do-dialog-close" aria-label="Close DO workspace" onClick={() => workspace.current?.close()}><X size={21}/></button>{open ? <DoWorkspace/> : null}</dialog>
  </div>;
}

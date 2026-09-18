'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Layers3, LockKeyhole, Play, ScanLine } from 'lucide-react';
import { DoMark } from '@/components/do/DoMark';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import styles from './immersive-experience.module.css';

const steps = [
  { name: 'Pursuit', verb: 'find it.', title: 'A reason to act.', body: 'Gather the signal, the source and the customer context. Decide what is worth pursuing.', output: 'An opportunity brief', detail: 'The opening. The evidence. The next conversation.', state: 'Example opportunity', icon: ScanLine },
  { name: 'DO', verb: 'DO it.', title: 'The work takes shape.', body: 'Bring the right context and tools to the job. Prepare the response and keep the important decisions with a person.', output: 'A prepared response', detail: 'A clear plan. A useful draft. Ready for a person to review.', state: 'Example draft · review required', icon: FileText },
  { name: 'Studio', verb: 'show it.', title: 'Now they can see it.', body: 'Turn the idea into a pitch, a website, a campaign or an experience someone can actually try.', output: 'A possibility made tangible', detail: 'One brief becomes a demonstrator, a story and a next step.', state: 'Example experience', icon: Layers3 },
] as const;

/** A local illustrative interaction, not a live agent or an external action. */
export function LivingBrief() {
  const ref = useRef<HTMLElement>(null);
  const touched = useRef(false);
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] });
  const drift = useTransform(scrollYProgress, [0, 1], [20, -20]);
  useMotionValueEvent(scrollYProgress, 'change', value => {
    if (!touched.current && !reduced) setStep(Math.min(2, Math.floor(value * 3)));
  });
  const choose = (index: number) => { touched.current = true; setStep(index); };
  const current = steps[step];
  const Icon = current.icon;

  return (
    <section className={styles.brief} ref={ref} aria-labelledby="living-brief-title" id="how-it-works">
      <div className={styles.briefCopy}>
        <p className={styles.eyebrow}>one opportunity. three connected moves.</p>
        <h2 id="living-brief-title">Watch the work<br /><span>come together.</span></h2>
        <p className={styles.lede}>Not three disconnected tools. One idea, carried from the first signal to something worth showing.</p>
        <div className={styles.steps} aria-label="Explore the work loop">
          {steps.map((item, index) => (
            <button type="button" key={item.name} aria-pressed={step === index} onClick={() => choose(index)}>
              <span className={styles.stepIndex}>0{index + 1}</span>
              <span><strong>{item.name}</strong><small>{item.verb}</small></span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className={styles.caption}>Interactive example. No accounts connected. Nothing is sent or published.</p>
      </div>
      <motion.div className={styles.briefStage} style={{ y: reduced ? 0 : drift }} data-step={step}>
        <div className={styles.stageGrid} aria-hidden="true" />
        <div className={styles.stageHalo} aria-hidden="true" />
        <div className={styles.stageLabel}><span>the living brief</span><span>0{step + 1} / 03</span></div>
        <div className={styles.sourceA} aria-hidden="true"><ScanLine size={18} /><strong>the signal</strong><span>A useful change.</span><i /><i /></div>
        <div className={styles.sourceB} aria-hidden="true"><FileText size={18} /><strong>the context</strong><span>The right details.</span><i /><i /></div>
        <div className={styles.sourceC} aria-hidden="true"><Layers3 size={18} /><strong>the possibility</strong><span>Something to try.</span><i /><i /></div>
        <div className={styles.output}>
          <div className={styles.outputTop}><span><i /><i /><i /></span><small>{current.name} / {current.verb}</small><Icon size={18} aria-hidden="true" /></div>
          <div className={styles.outputBody}>
            <span className={styles.outputState}>{current.state}</span>
            <h3>{current.title}</h3>
            <p>{current.body}</p>
            <div className={styles.outputPreview} aria-hidden="true">
              <div className={styles.previewOrb}><DoMark /></div>
              <div><span /><span /><span /></div>
              <div className={styles.previewTile}><Check size={19} /></div>
            </div>
            <div className={styles.outputResult}><span>{current.output}</span><ArrowUpRight size={19} aria-hidden="true" /><p>{current.detail}</p></div>
          </div>
        </div>
        <label className={styles.scrubber}>Move through the example<input aria-label="Work loop stage" type="range" min={0} max={2} step={1} value={step} onChange={event => choose(Number(event.target.value))} /><span>{current.name}</span></label>
      </motion.div>
    </section>
  );
}

const doors = [
  { id: 'pursuit', name: 'Pursuit', verb: 'find it.', heading: 'See the opening.', body: 'Turn business signals, tenders and customer context into opportunities worth acting on.', tags: 'signals / opportunities / client hubs', href: PRODUCT_DESTINATIONS.pursuit.overview, action: 'Explore Pursuit', workspace: PRODUCT_DESTINATIONS.pursuit.workspace, workspaceLabel: 'Open client hubs' },
  { id: 'do', name: 'DO', verb: 'DO it.', heading: 'Move the work.', body: 'Bring agents, context and tools to the work in front of you. Keep control of what happens next.', tags: 'context / tools / approved action', href: PRODUCT_DESTINATIONS.do.overview, action: 'Meet DO', workspace: '/contact?product=do', workspaceLabel: 'Bring a job' },
  { id: 'studio', name: 'Studio', verb: 'show it.', heading: 'Make it tangible.', body: 'Build the demonstrator, website, pitch, campaign or film that makes an idea real to someone else.', tags: 'web / demos / image / film', href: PRODUCT_DESTINATIONS.studio.overview, action: 'Explore Studio', workspace: PRODUCT_DESTINATIONS.studio.workspace, workspaceLabel: 'Open Creative Studio' },
] as const;

function ProductDoor({ product, index }: { product: typeof doors[number]; index: number }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 180, damping: 26 });
  const rotateY = useSpring(x, { stiffness: 180, damping: 26 });
  const baseTilt = [-2.4, 1.2, -1.7][index] ?? 0;
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - box.left) / box.width - 0.5) * 7);
    y.set(-((event.clientY - box.top) / box.height - 0.5) * 5);
  };
  const reset = () => { x.set(0); y.set(0); };
  const external = product.workspace.startsWith('https://');
  return (
    <motion.article
      className={styles.door}
      data-product={product.id}
      id={product.id}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        rotateZ: reduced ? 0 : baseTilt,
        transformPerspective: 1400,
      }}
      initial={reduced ? false : { opacity: 0, y: 42 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      whileHover={reduced ? undefined : { y: -12, scale: 1.018, rotateZ: 0 }}
      whileTap={reduced ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div className={styles.doorTop}><span>0{index + 1}</span><span>{product.verb}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
      <h3>{product.name}</h3>
      <div className={styles.doorArt} aria-hidden="true">
        {product.id === 'pursuit' ? <div className={styles.signalArt}><span /><span /><span /><i /><i /><i /><b>the next move.</b></div> : product.id === 'do' ? <div className={styles.doArt}><div /><DoMark /><span>ready when you are.</span></div> : <div className={styles.studioArt}><Image src="/do/office/office-poster.webp" alt="" fill sizes="(max-width: 760px) 90vw, 30vw" /><span>give the idea a world.</span></div>}
      </div>
      <p className={styles.doorTags}>{product.tags}</p>
      <h4>{product.heading}</h4>
      <p className={styles.doorBody}>{product.body}</p>
      <div className={styles.doorActions}>
        <Link href={product.href}>{product.action}<ArrowRight size={17} aria-hidden="true" /></Link>
        {external ? <a href={product.workspace} target="_blank" rel="noopener noreferrer">{product.workspaceLabel}<LockKeyhole size={13} aria-hidden="true" /></a> : <Link href={product.workspace}>{product.workspaceLabel}<ArrowUpRight size={14} aria-hidden="true" /></Link>}
      </div>
    </motion.article>
  );
}

export function ProductDoors() {
  const reduced = useReducedMotion();
  return <section className={styles.products} id="products" aria-labelledby="products-title">
    <motion.header
      className={styles.sectionHead}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    ><div><p className={styles.eyebrow}>pursuit / DO / studio</p><h2 id="products-title">Start anywhere.<br /><span>Keep it connected.</span></h2></div><p>Use one. Connect two. Run the whole loop.<br /><small>Client hubs and Creative Studio open your existing private workspaces. Sign-in required.</small></p></motion.header>
    <div className={styles.doors}>{doors.map((product, index) => <ProductDoor key={product.id} product={product} index={index} />)}</div>
  </section>;
}

const studies = [
  { id:'space', name:'Spatial', title:'An idea you can step inside.', body:'Explore the existing atelier: three spaces, one scroll-led experience.', image:'/do/world/atelier-poster.png', href:'/preview/do-world', action:'Explore the space' },
  { id:'motion', name:'Motion', title:'An identity with movement.', body:'A short assembl motion study. Play the film to see the material, light and movement.', image:'/do/cinema/do-orb-poster.webp', href:'/do/cinema/do-orb-loop.mp4', action:'Watch the film' },
  { id:'identity', name:'Identity', title:'A small mark. A whole world.', body:'The existing DO identity, carried into a visual system for the product.', image:'/do/canvas/identity-plum.svg', href:'/do', action:'Meet DO' },
] as const;

/** Existing approved visual work only; no invented client work or endorsements. */
export function StudioGallery() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const study = studies[index];
  return <section className={styles.gallery} id="studio-work" aria-labelledby="studio-work-title">
    <header className={styles.sectionHead}><div><p className={styles.eyebrow}>studio / a few ways to show it</p><h2 id="studio-work-title">Less explaining.<br /><span>More experiencing.</span></h2></div><p>Spatial worlds. Moving identities. Something to open, move through and remember.</p></header>
    <div className={styles.galleryControls} aria-label="Choose a visual example">{studies.map((item,i)=><button type="button" key={item.id} aria-pressed={index===i} onClick={()=>{setIndex(i);setPlaying(false);}}>0{i+1}<span>{item.name}</span><ArrowDown size={15} aria-hidden="true" /></button>)}</div>
    <div className={styles.galleryFrame}>
      <div className={styles.galleryMedia}>
        {playing && study.id==='motion' ? <video controls autoPlay playsInline preload="metadata" poster={study.image} aria-label="Assembl motion study"><source src="/do/cinema/do-orb-loop.mp4" type="video/mp4" /></video> : <Image src={study.image} alt={study.title} fill sizes="(max-width: 760px) 100vw, 75vw" />}
        {study.id==='motion' && !playing && <button type="button" className={styles.play} onClick={()=>setPlaying(true)}><Play size={22} aria-hidden="true" />Play film</button>}
      </div>
      <div className={styles.galleryCaption}><span className={styles.eyebrow}>assembl visual work / 0{index+1}</span><h3>{study.title}</h3><p>{study.body}</p>{study.id!=='motion' ? <Link href={study.href}>{study.action}<ArrowUpRight size={18} aria-hidden="true" /></Link> : <button type="button" onClick={()=>setPlaying(true)}>{playing?'Film playing above':'Play the film'}<Play size={16} aria-hidden="true" /></button>}<small>Assembl concept and identity work. Not a client endorsement or live agent activity.</small></div>
    </div>
  </section>;
}

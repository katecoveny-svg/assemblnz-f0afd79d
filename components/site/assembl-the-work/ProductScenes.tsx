'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, ArrowRight, FileText, ScanLine, Check, LockKeyhole } from 'lucide-react';
import { DoGlowCard } from '@/components/do/DoGlowCard';
import { DoPresence } from '@/components/do/DoPresence';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { POSITIONING } from './copy';
import styles from './product-scenes.module.css';
import { FluidField } from '../craft/FluidField';
import '../craft/fluid-type.css';

const products = [
  { id:'pursuit', name:'Pursuit', verb:'find the work.', body:POSITIONING.pursuit, href:PRODUCT_DESTINATIONS.pursuit.overview, cta:'Explore Pursuit', workspace:PRODUCT_DESTINATIONS.pursuit.workspace, workspaceLabel:'Open client hubs', detail:'Signals. Sources. The next conversation.' },
  { id:'do', name:'DO', verb:'DO the work.', body:POSITIONING.do, href:PRODUCT_DESTINATIONS.do.overview, cta:'Open DO', workspace:'/do/widget', workspaceLabel:'Open workspace', detail:'Your context. Your tools. Your call.' },
  { id:'studio', name:'Studio', verb:'show the possibility.', body:POSITIONING.studio, href:PRODUCT_DESTINATIONS.studio.overview, cta:'Explore Studio', workspace:PRODUCT_DESTINATIONS.studio.workspace, workspaceLabel:'Open Creative Studio', detail:'An idea they can step inside.' },
] as const;

function ProductArtwork({ product }: { product: typeof products[number]['id'] }) {
  if (product === 'pursuit') return <div className={styles.signalComposition}>
    <div className={styles.signalLine} />
    <div className={styles.signalNote}><ScanLine size={22} /><span>A meaningful<br />change.</span><small>THE SIGNAL</small></div>
    <div className={styles.sourceNote}><FileText size={20} /><span>The right<br />context.</span><small>THE SOURCE</small></div>
    <div className={styles.briefSheet}>
      <div className={styles.sheetTop}><span>Pursuit</span><ArrowUpRight size={19} /></div>
      <p>AN OPPORTUNITY BRIEF</p><strong>A reason<br />to act.</strong>
      <div className={styles.sheetLines}><i /><i /><i /></div>
      <div className={styles.sheetFoot}>Evidence first.<br />A useful next move.<ArrowRight size={22} /></div>
    </div>
  </div>;
  if (product === 'do') return <div className={styles.doComposition}>
    <div className={styles.contextSlip}><FileText size={20} /><span>The task.<br />The context.</span></div>
    <div className={styles.identity}><DoPresence size="large" /></div>
    <div className={styles.reviewSlip}><span className={styles.reviewIcon}><Check size={19} /></span><div><small>A DRAFT TO REVIEW</small><strong>The next step,<br />assembled.</strong></div><ArrowUpRight size={24} /></div>
  </div>;
  return <div className={styles.studioComposition}>
    <div className={styles.studioWord}>show<br /><span>it.</span></div>
    <div className={styles.studioImage}><Image src="/do/world/atelier-poster.png" alt="" fill sizes="(max-width: 760px) 90vw, 48vw" /><div><span>AN IDEA YOU CAN ENTER</span><ArrowUpRight size={22} /></div></div>
    <div className={styles.studioDetail}><Image src="/do/office/office-poster.webp" alt="" fill sizes="(max-width: 760px) 38vw, 20vw" /></div>
    <span className={styles.studioLabel}>SPACE / STORY / EXPERIENCE</span>
  </div>;
}

function ProductScene({ product, index }: { product: typeof products[number]; index: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target:root, offset:['start end','end start'] });
  const artY = useTransform(scrollYProgress, [0,1], [46,-46]);
  const artRotate = useTransform(scrollYProgress, [0,1], [-2,2]);
  const wordY = useTransform(scrollYProgress, [0,1], [26,-26]);
  const external = product.workspace.startsWith('https://');
  return <article className={styles.scene} data-product={product.id} id={product.id} ref={root} aria-labelledby={product.id + '-scene-title'}>
    <FluidField />
    <div className={styles.sceneHeading}>
      <span className={styles.index}>0{index + 1} /</span>
      <motion.h3 className="fluid-text" id={product.id + '-scene-title'} style={{ y:reduced ? 0 : wordY }}>{product.name}<span>.</span></motion.h3>
      <p>{product.verb}</p>
    </div>
    <div className={styles.sceneBody}>
      <div className={styles.copy}>
        <h4>{product.detail}</h4><p>{product.body}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={product.href}>{product.cta}<span><ArrowUpRight size={21} /></span></Link>
          {external ? <a href={product.workspace} target="_blank" rel="noopener noreferrer">{product.workspaceLabel}<LockKeyhole size={13} /></a> : <Link href={product.workspace}>{product.workspaceLabel}<ArrowRight size={17} /></Link>}
        </div>
      </div>
      <motion.div className={styles.artMotion} style={{ y:reduced ? 0 : artY, rotate:reduced ? 0 : artRotate }}>
        <DoGlowCard as="div" variant="bare" className={styles.artSurface}>
          <div className={styles.art} aria-hidden="true"><ProductArtwork product={product.id} /></div>
          <p className={styles.caption}>{product.id === 'studio' ? 'assembl concept work · not a client endorsement' : 'Illustrative workflow · no live activity'}</p>
        </DoGlowCard>
      </motion.div>
    </div>
  </article>;
}

/** Large product compositions; exact approved positioning and real destinations remain in HTML. */
export function ProductScenes() {
  return <section className={styles.products} id="products" aria-labelledby="products-title">
    <header className={styles.intro}>
      <div><p className={styles.eyebrow}>THREE WAYS IN.</p><h2 id="products-title">One way<br /><span className="fluid-text">forward.</span></h2></div>
      <div className={styles.introAside}><p>Use one. Connect two.<br />Run the whole loop.</p><a href="#pursuit">Explore the system<ArrowDown size={21} /></a><small>Client hubs and Creative Studio open your existing private workspaces. Sign-in required.</small></div>
    </header>
    {products.map((product,index) => <ProductScene key={product.id} product={product} index={index} />)}
  </section>;
}

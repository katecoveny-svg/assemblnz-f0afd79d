'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { DoWorkspace } from '@/app/do/DoWorkspace';
import '@/app/do/do.css';
export function GlowDoWidget() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  return <><button className="atw-do-glow" aria-label="Open DO task workspace" onClick={() => { setOpened(true); dialog.current?.showModal(); }}><Image src="/cinematic-nature/do-portable.png" alt="" width={120} height={100} sizes="110px" priority /><span className="sr-only">DO</span></button><dialog ref={dialog} className="do-workspace-dialog atw-widget-dialog" aria-label="DO preparation workspace"><button className="do-dialog-close" aria-label="Close DO workspace" onClick={() => dialog.current?.close()}><X size={21} /></button>{opened && <DoWorkspace />}<Link className="atw-widget-takeaway" href="/do">Get the downloadable DO widget <ArrowUpRight size={15} /></Link></dialog></>;
}

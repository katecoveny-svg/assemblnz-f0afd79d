"use client";
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
const Scene=dynamic(()=>import('@/components/site/assembl-the-work/DoObjectScene'),{ssr:false});
export default function DoObjectEmbed(){const[progress,setProgress]=useState(.85);useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.source!==window.parent||event.data?.type!=='assembl-do:assembly'||typeof event.data.progress!=='number'||!Number.isFinite(event.data.progress))return;setProgress(Math.max(0,Math.min(1,event.data.progress)));};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);return <div style={{height:'100svh',width:'100%',background:'#240b21'}}><Scene progress={progress}/></div>;}

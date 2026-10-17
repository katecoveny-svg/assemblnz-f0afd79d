"use client";
import {useState} from "react";
const prototypes=[
 {id:"AL-GRID-160",name:"Modular grid panel",size:"160 × 160 × 8 mm",family:"grid",note:"Wall attachment and loads require testing."},
 {id:"AL-GRID-LEDGE",name:"Two-peg accessory ledge",size:"58 × 62 mm footprint",family:"grid",note:"Peg engagement and retention require testing."},
 {id:"AL-TILE-120",name:"Open organiser tray",size:"120 × 80 × 30 mm",family:"tile",note:"Stacking and fit require testing."},
 {id:"AL-TILE-DIVIDER",name:"Removable tray divider",size:"113.2 mm long",family:"tile",note:"Clearance and repeated insertion require testing."},
 {id:"AL-TILE-CUP",name:"Accessory cup",size:"38 × 38 × 54 mm",family:"tile",note:"Compatibility adapter not yet validated."},
 {id:"AL-STACK-160",name:"Freestanding riser",size:"160 × 120 × 75 mm",family:"stack",note:"For light objects; no load rating established."},
 {id:"AL-SKIN-78",name:"Decorative nameplate",size:"78 × 24 × 3 mm",family:"skin",note:"Personalised geometry not yet validated."}
];
export default function LivingPrototypeLibrary(){
 const [family,setFamily]=useState("all");
 const shown=prototypes.filter(p=>family==="all"||p.family===family);
 return <section id="prototype-library" style={{padding:"75px 5%",background:"#e9e5df",color:"#39363a",fontFamily:"Arial,sans-serif"}}>
 <p style={{fontSize:11,letterSpacing:2,color:"#9d7d89"}}>05 / ENGINEERING LIBRARY · AL-01</p>
 <h2 style={{fontWeight:400,fontSize:"clamp(38px,5vw,65px)",letterSpacing:"-.06em",margin:"18px 0"}}>real parts.<br/><em style={{fontFamily:"Georgia,serif",color:"#a88a95"}}>real dimensions.</em></h2>
 <p style={{maxWidth:680,lineHeight:1.7}}>Seven CAD prototypes already exist in the development pack. This catalogue records their dimensions and intended use. Their STEP/STL files are not yet hosted on this deployment; the models are not physically validated or orderable.</p>
 <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"28px 0"}}>{["all","grid","tile","stack","skin"].map(f=><button key={f} onClick={()=>setFamily(f)} style={{border:"1px solid #bcb5b3",padding:"10px 17px",cursor:"pointer",background:family===f?"#493b46":"transparent",color:family===f?"white":"#39363a"}}>{f}</button>)}</div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>{shown.map(p=><article key={p.id} style={{background:"#f8f6f2",padding:22,minHeight:205}}><small style={{letterSpacing:1.4,color:"#997c87"}}>{p.id} · {p.family.toUpperCase()}</small><h3 style={{fontWeight:500,fontSize:22}}>{p.name}</h3><strong style={{fontSize:14}}>{p.size}</strong><p style={{fontSize:12,color:"#777",lineHeight:1.5}}>{p.note}</p><small style={{color:"#957d87"}}>DIGITAL PROTOTYPE · NOT FOR SALE</small></article>)}</div>
 <p style={{fontSize:12,marginTop:24,color:"#777"}}>Next release gate: publish verified source files, inspect fit specimens, document print settings and obtain a manufacturer quote before enabling checkout.</p>
 </section>;
}
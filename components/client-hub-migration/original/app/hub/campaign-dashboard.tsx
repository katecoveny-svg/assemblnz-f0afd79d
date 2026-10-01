"use client";
import PreviewImage from "@/components/client-hub-migration/PreviewImage";
import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";
import {useEffect,useMemo,useState} from "react";
import {BarChart3,ArrowUpRight,ShieldAlert} from "lucide-react";
import {salesStages,defaultEnterprisePlan,dealVulnerability,type DealVulnerability} from "@/components/client-hub-migration/original/lib/enterprise-plan";
import {clients} from "@/components/client-hub-migration/original/lib/concept-engine";
import {hubSchema} from "@/components/client-hub-migration/original/lib/pursuit-hub";
import {companyIdentity} from "@/components/client-hub-migration/original/lib/workspace-identity";

type Campaign={
  id:string;name:string;buyer:string;seller:string;sector:keyof typeof clients;
  stage:typeof salesStages[number];owner:string;value:number|null;currency:string;
  nextAction:string;nextDate:string;closeDate:string;updatedAt:number;
  completed:number;total:number;blockedMilestones?:number;image:string;
  vulnerability?:DealVulnerability;
};

const levelLabel: Record<DealVulnerability["level"], string> = {
  stable: "Stable",
  watch: "Watch",
  at_risk: "At risk",
  critical: "Critical",
};

export default function CampaignDashboard({company,localPreview,onOpen}:{company:string;localPreview:boolean;onOpen:(id:string,sector:Campaign["sector"])=>void}){
  const [items,setItems]=useState<Campaign[]>([]),[stage,setStage]=useState("All"),[search,setSearch]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  const asOf=new Intl.DateTimeFormat("en-CA",{timeZone:"Pacific/Auckland",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

  useEffect(()=>{let active=true;(async()=>{
    try{
      if(localPreview){
        const saved:Campaign[]=[];
        for(let i=0;i<localStorage.length;i++){
          const key=localStorage.key(i)!;
          if(!key.startsWith("assembl-pursuit-preview-v2:"))continue;
          try{
            const h=hubSchema.parse(JSON.parse(localStorage.getItem(key)!));
            if(companyIdentity(h.seller)!==companyIdentity(company))continue;
            const p=h.enterprise||defaultEnterprisePlan(h);
            const completed=p.milestones.filter(x=>x.status==="Complete").length;
            const blockedMilestones=p.milestones.filter(x=>x.status==="Blocked").length;
            const economicBuyer=p.stakeholders.find(s=>/economic|sponsor|decision/i.test(s.role))?.status || p.stakeholders[1]?.status || "";
            const caseInputs=[p.businessCase.hours,p.businessCase.hourlyCost,p.businessCase.adoption,p.businessCase.reduction,p.businessCase.setup,p.businessCase.monthly];
            const vulnerability=dealVulnerability({stage:p.stage,owner:p.owner,nextAction:p.nextAction,nextDate:p.nextDate,closeDate:p.closeDate,value:p.value,completed,total:p.milestones.length,blockedMilestones,economicBuyerStatus:economicBuyer,businessCaseComplete:caseInputs.every(v=>v!==null),asOf});
            saved.push({id:key,name:p.campaign||h.name,buyer:h.buyer,seller:h.seller,sector:h.engine?.sector||"custom",stage:p.stage,owner:p.owner,value:p.value,currency:p.currency,nextAction:p.nextAction,nextDate:p.nextDate,closeDate:p.closeDate,updatedAt:0,completed,total:p.milestones.length,blockedMilestones,image:h.design.frame.artwork?.src||"",vulnerability});
          }catch{}
        }
        if(active)setItems(saved);
        return;
      }
      const r=await fetch(`/api/campaigns?company=${encodeURIComponent(company)}`);
      const d=await r.json() as {error?:string;items:Campaign[]};
      if(!r.ok)throw Error(d.error);
      if(active)setItems(d.items);
    }catch(x){if(active)setError((x as Error).message);}
    finally{if(active)setLoading(false);}
  })();return()=>{active=false;};},[company,localPreview,asOf]);

  const today=asOf;
  const withVuln=useMemo(()=>items.map(x=>({...x,vulnerability:x.vulnerability||dealVulnerability({stage:x.stage,owner:x.owner,nextAction:x.nextAction,nextDate:x.nextDate,closeDate:x.closeDate,value:x.value,completed:x.completed,total:x.total,blockedMilestones:x.blockedMilestones||0,asOf:today})})),[items,today]);
  const live=withVuln.filter(x=>!["Won","Lost","Parked"].includes(x.stage));
  const due=live.filter(x=>x.nextDate&&x.nextDate<today);
  const atRisk=live.filter(x=>x.vulnerability.level==="at_risk"||x.vulnerability.level==="critical");
  const watch=live.filter(x=>x.vulnerability.level==="watch");
  const critical=live.filter(x=>x.vulnerability.level==="critical");
  const totals=live.reduce<Record<string,number>>((n,x)=>{if(x.value!==null)n[x.currency]=(n[x.currency]||0)+x.value;return n;},{});
  const filtered=withVuln.filter(x=>(stage==="All"||x.stage===stage)&&`${x.name} ${x.buyer} ${x.owner} ${x.vulnerability.biggestConcern}`.toLowerCase().includes(search.toLowerCase()));
  const priorities=live.filter(x=>x.vulnerability.level==="critical"||x.vulnerability.level==="at_risk").sort((a,b)=>b.vulnerability.score-a.vulnerability.score).slice(0,3);

  return <div className="enterprise-panel">
    <div className="ep-title">
      <div>
        <span className="cs-eyebrow">{company} · SALES MANAGER VIEW</span>
        <h2>Manager cockpit</h2>
        <p className="cs-small">Portfolio overview across your team’s pursuits · week ending {today}</p>
      </div>
      <ShieldAlert size={32}/>
    </div>
    <p>{localPreview?"Saved examples on this device.":"Saved pursuits in this company’s private hub."} Vulnerability is inferred from the deal plan (owner, next action, milestones, buyer access, business case). Not a CRM win-probability.</p>

    <div className="ep-metrics ep-metrics-vuln">
      <div className="ep-metric-stable"><small>Active deals</small><b>{live.length}</b></div>
      <div className="ep-metric-watch"><small>Watch</small><b>{watch.length}</b><small>of {live.length||0}</small></div>
      <div className="ep-metric-risk"><small>At risk</small><b>{atRisk.length}</b><small>{critical.length?`${critical.length} critical`: "No change pulse"}</small></div>
      <div className="ep-metric-overdue"><small>Next actions overdue</small><b>{due.length}</b></div>
      <div className="ep-metric-value"><small>Open value</small><b>{Object.entries(totals).map(([currency,value])=>`${currency} ${value.toLocaleString("en-NZ")}`).join(" / ")||"Not priced"}</b><small>{live.filter(x=>x.value===null).length} unpriced</small></div>
    </div>

    {priorities.length>0&&<section className="ep-vuln-priorities" aria-label="This week's priorities">
      <h3>This week’s priorities</h3>
      <ul>
        {priorities.map(x=><li key={x.id}>
          <span className={`ep-vuln-pill ep-vuln-${x.vulnerability.level}`}>{levelLabel[x.vulnerability.level]} · {x.vulnerability.score}</span>
          <div>
            <b>{x.buyer}</b>
            <p>{x.vulnerability.biggestConcern}</p>
            <small>Next best action: {x.vulnerability.nextBestAction}</small>
          </div>
        </li>)}
      </ul>
    </section>}

    <div className="ep-pipeline">{salesStages.map(s=><button key={s} aria-pressed={stage===s} onClick={()=>setStage(stage===s?"All":s)}><span>{s}</span><b>{items.filter(x=>x.stage===s).length}</b></button>)}</div>
    <label>Find a campaign, client, owner or concern<input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${company} pursuits`}/></label>
    {stage!=="All"&&<button className="cs-text" onClick={()=>setStage("All")}>Show all stages</button>}

    {loading?<p role="status">Loading saved campaigns…</p>:error?<p className="ep-error" role="alert">{error}</p>:!items.length?<div className="cs-empty"><h3>Your first campaign starts with a saved pitch.</h3><p>Add its stage, owner and next action in Deal plan, then save it.</p></div>:<div className="ep-campaigns ep-campaigns-table">
      {filtered.map(x=><article className={`ep-campaign ep-campaign-vuln ep-vuln-row-${x.vulnerability.level}`} key={x.id}>
        <PreviewImage src={x.image||clients[x.sector]?.image||clients.custom.image} alt={`Illustrative ${x.buyer} concept`}/>
        <div>
          <span className="cs-eyebrow">{x.buyer} · {x.stage}</span>
          <h3>{x.name}</h3>
          <p className="ep-vuln-concern"><strong>Biggest concern:</strong> {x.vulnerability.biggestConcern}</p>
          <p>{x.vulnerability.nextBestAction}</p>
          <div className="ep-campaign-meta">
            <span>{x.owner||"Owner to assign"}</span>
            <span>{x.nextDate?`Next: ${x.nextDate}`:"Date to agree"}</span>
            <span>{x.value===null?"Unpriced":`${x.currency} ${x.value.toLocaleString("en-NZ")}`}</span>
            <span className={`ep-vuln-pill ep-vuln-${x.vulnerability.level}`}>{levelLabel[x.vulnerability.level]} · {x.vulnerability.score}</span>
          </div>
          <p className="cs-small">{x.completed} of {x.total} milestones complete · decision {x.closeDate||"date to agree"}{(x.blockedMilestones||0)>0?` · ${x.blockedMilestones} blocked`:""}</p>
          <button className="cs-primary" onClick={()=>onOpen(x.id,x.sector)}>Open campaign<ArrowUpRight size={16}/></button>
        </div>
      </article>)}
    </div>}
    <p className="cs-small">Up to 200 saved pursuits. Vulnerability is a manager attention score from the deal plan, not a win probability. No CRM sync.</p>
  </div>;
}

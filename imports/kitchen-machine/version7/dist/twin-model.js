// Transparent demonstration models. No retailer, vehicle or IoT system is connected.
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
export const defaults={winger:{bays:3,approval:25,parts:0,rush:false},home:{solar:5,battery:5,smart:true,occupied:true,cloud:0.8},school:{solar:20,battery:0,smart:true,occupied:true,cloud:0.8},grocery:{solar:15,battery:0,smart:true,occupied:true,cloud:0.8},retail:{solar:10,battery:0,smart:true,occupied:true,cloud:0.8}};
export const zones={
 winger:[['inspect','Inspection & WOF'],['bay1','Service bay 01'],['bay2','Service bay 02'],['bay3','Service bay 03'],['quality','Final checks'],['parts','Parts & approval hold'],['lounge','Customer lounge'],['arrival','Arrival & handover']],
 home:[['living','Living room'],['kitchen','Kitchen & hot water'],['bedrooms','Bedrooms'],['garage','Garage & EV'],['solar','Solar roof'],['battery','Home battery']],
 school:[['classA','Learning block A'],['classB','Learning block B'],['hall','Hall & shared spaces'],['admin','Administration'],['solar','Solar canopy'],['plant','Essential services']],
 grocery:[['cold','Chilled & frozen'],['aisles','Shopping aisles'],['prep','Preparation area'],['pickup','Pick-up & dispatch'],['solar','Solar canopy'],['plant','Essential services']],
 retail:[['showroom','Showroom'],['stock','Stockroom'],['collection','Click & collect'],['office','Team spaces'],['solar','Solar canopy'],['plant','Essential services']]
};
export function workshop(options={}){
 const o={...defaults.winger,...options};const bays=Math.round(clamp(o.bays,1,3)),approval=clamp(o.approval,0,60),parts=clamp(o.parts,0,90);
 const jobs=Array.from({length:o.rush?13:10},(_,i)=>({id:'V'+String(i+1).padStart(2,'0'),arrival:i*18,work:[55,80,45,100,65][i%5],needsApproval:i%3===1,needsParts:i%4===2}));
 let inspectionFree=0,qualityFree=0;const bayFree=Array(bays).fill(0);
 for(const j of jobs){j.inspectStart=Math.max(j.arrival,inspectionFree);j.inspectEnd=j.inspectStart+15;inspectionFree=j.inspectEnd;
 j.ready=j.inspectEnd+(j.needsApproval?approval:0)+(j.needsParts?parts:0);
 }
 // First-ready, first-served. Approval and parts waits happen in a separate holding area.
 for(const j of [...jobs].sort((a,b)=>a.ready-b.ready||a.arrival-b.arrival)){
  j.bay=bayFree.indexOf(Math.min(...bayFree));j.serviceStart=Math.max(j.ready,bayFree[j.bay]);j.serviceEnd=j.serviceStart+j.work;bayFree[j.bay]=j.serviceEnd;
 }
 for(const j of [...jobs].sort((a,b)=>a.serviceEnd-b.serviceEnd)){j.checkStart=Math.max(j.serviceEnd,qualityFree);j.finish=j.checkStart+10;qualityFree=j.finish;}
 for(const j of jobs)j.wait=j.finish-j.arrival-15-j.work-10;
 return {jobs,finished:jobs.filter(j=>j.finish<=540).length,meanWait:jobs.reduce((n,j)=>n+j.wait,0)/jobs.length,lastFinish:Math.max(...jobs.map(j=>j.finish)),bays};
}
export function jobState(j,minute){
 if(minute<j.arrival)return 'not-arrived';if(minute<j.inspectStart)return 'arrival';if(minute<j.inspectEnd)return 'inspect';if(minute<j.ready)return 'parts';if(minute<j.serviceStart)return 'arrival';if(minute<j.serviceEnd)return 'bay'+(j.bay+1);if(minute<j.checkStart)return 'arrival';if(minute<j.finish)return 'quality';return 'complete';
}
export function loads(kind,h,o){
 const day=h>=8&&h<17,evening=h>=17&&h<23;const active=o.occupied&&(day||kind==='home'&&evening);const smart=o.smart;
 if(kind==='home'){const ev=smart?(h>=11&&h<13):(h>=18&&h<20);return {living:active?1.2:.12,kitchen:.18+((h>=7&&h<8)||(h>=18&&h<19)?2:0)+(smart?(h>=12&&h<14?2:0):(h>=6&&h<8?2:0)),bedrooms:evening&&o.occupied?.45:.08,garage:.06+(ev?3.6:0)};}
 if(kind==='school')return {classA:active?5:smart?.25:2.5,classB:active?5:smart?.25:2.5,hall:active?3:smart?.2:1.2,admin:active?1.5:.2,plant:.6};
 if(kind==='grocery')return {cold:12+(o.occupied?2.4:0),aisles:active?4:smart?.3:2,prep:day?4:.6,pickup:day&&o.occupied?1.5:.2,plant:.8};
 return {showroom:active?6:smart?.3:3,stock:active?1.8:smart?.2:.8,collection:active?1.2:.1,office:active?1.4:.15,plant:.4};
}
export function energyDay(kind,options={}){
 const o={...defaults[kind],...options},capacity=clamp(o.battery,0,20),solar=clamp(o.solar,0,40),cloud=clamp(o.cloud,.1,1);
 // Battery starts empty each demonstration day; 95% charge and discharge efficiency, 3 kW limit.
 let stored=0;const hours=[];
 for(let h=0;h<24;h++){
  const z=loads(kind,h,o),load=Object.values(z).reduce((a,b)=>a+b,0),pv=Math.max(0,Math.sin((h-6)/12*Math.PI))*(h>=6&&h<=18?1:0)*solar*cloud;
  let excess=Math.max(0,pv-load),deficit=Math.max(0,load-pv),charge=0,discharge=0;
  if(excess>0){charge=Math.min(excess,3,(capacity-stored)/.95);stored+=charge*.95;excess-=charge;}
  else {discharge=Math.min(deficit,3,stored*.95);stored-=discharge/.95;deficit-=discharge;}
  hours.push({h,z,load,pv,imported:deficit,exported:excess,charge,discharge,stored});
 }
 return {hours,imports:hours.reduce((n,h)=>n+h.imported,0),exports:hours.reduce((n,h)=>n+h.exported,0),consumption:hours.reduce((n,h)=>n+h.load,0),generation:hours.reduce((n,h)=>n+h.pv,0)};
}
export function parseReadings(csv,kind,now=Date.now()){
 const lines=csv.trim().split(/\r?\n/);if(lines[0]?.trim()!=='zone_id,power_kw,timestamp')throw Error('Use the header zone_id,power_kw,timestamp.');
 const ids=zones[kind].map(z=>z[0]).filter(id=>!['solar','battery'].includes(id));const seen=new Set();
 const rows=lines.slice(1).filter(Boolean).map(line=>{const cells=line.split(',');if(cells.length!==3)throw Error('Each row needs exactly three comma-separated values.');const [id,raw,time]=cells.map(s=>s.trim()),power=Number(raw),timestamp=Date.parse(time);if(!ids.includes(id)||seen.has(id))throw Error('Unknown or duplicate zone: '+id);if(!raw||!Number.isFinite(power)||power<0||power>1000)throw Error('Power must be between 0 and 1000 kW.');if(!/(Z|[+-]\d{2}:\d{2})$/.test(time)||!Number.isFinite(timestamp)||timestamp>now+60000)throw Error('Use a valid ISO timestamp that is not in the future.');seen.add(id);return {id,power,timestamp,stale:now-timestamp>900000};});
 if(rows.length!==ids.length)throw Error('Include one reading for every load zone: '+ids.join(', ')+'.');return rows;
}

import assert from 'node:assert/strict';
import {defaults,zones,workshop,jobState,energyDay,parseReadings} from '../dist/twin-model.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
let cases=0;
for(const bays of [1,2,3])for(const approval of [0,25,60])for(const parts of [0,90])for(const rush of [false,true]){
 const r=workshop({bays,approval,parts,rush});assert.equal(r.jobs.length,rush?13:10);
 for(const j of r.jobs){assert.ok(j.arrival<=j.inspectStart&&j.inspectEnd<=j.ready&&j.ready<=j.serviceStart&&j.serviceEnd<=j.checkStart&&j.checkStart<j.finish);assert.ok(j.wait>=0);assert.equal(jobState(j,j.finish),'complete');assert.equal(jobState(j,j.serviceStart),'bay'+(j.bay+1));}
 for(let b=0;b<bays;b++){const list=r.jobs.filter(j=>j.bay===b).sort((a,b)=>a.serviceStart-b.serviceStart);for(let i=1;i<list.length;i++)assert.ok(list[i-1].serviceEnd<=list[i].serviceStart,'Two vehicles cannot occupy one service bay');}
 for(const [start,end] of [['inspectStart','inspectEnd'],['checkStart','finish']]){const list=[...r.jobs].sort((a,b)=>a[start]-b[start]);for(let i=1;i<list.length;i++)assert.ok(list[i-1][end]<=list[i][start]);}cases++;
}
assert.ok(workshop({bays:1,rush:true}).finished<13,'An overloaded day must show unfinished jobs');
assert.ok(workshop({bays:2}).meanWait>workshop({bays:3}).meanWait,'Less capacity increases waiting in the sample');
for(const kind of ['home','school','grocery','retail'])for(const solar of [0,5,40])for(const battery of [0,5,20])for(const smart of [false,true]){
 const r=energyDay(kind,{solar,battery,smart});let stored=0;
 for(const h of r.hours){close(h.pv+h.imported+h.discharge,h.load+h.charge+h.exported);close(h.stored,stored+h.charge*.95-h.discharge/.95);assert.ok(h.stored>=-1e-8&&h.stored<=battery+1e-8);assert.ok(h.charge<=3&&h.discharge<=3);assert.ok(h.imported>=-1e-8&&h.exported>=-1e-8);stored=h.stored;if(solar===0)assert.equal(h.discharge,0);}
 close(r.consumption,r.hours.reduce((sum,h)=>sum+h.load,0));cases++;
}
close(energyDay('home',{smart:true}).consumption,energyDay('home',{smart:false}).consumption);
assert.ok(energyDay('school',{smart:true,occupied:false}).consumption<energyDay('school',{smart:false,occupied:false}).consumption);
assert.ok(energyDay('grocery',{occupied:false}).hours.every(h=>h.z.cold>0),'Cold chain remains on');
const now=Date.parse('2026-10-23T00:00:00Z');
const csv='zone_id,power_kw,timestamp\n'+zones.home.filter(([id])=>!['solar','battery'].includes(id)).map(([id])=>id+',1.2,2026-10-22T22:00:00Z').join('\n');
const readings=parseReadings(csv,'home',now);assert.equal(readings.length,4);assert.ok(readings.every(r=>r.stale));
for(const invalid of [csv.replaceAll('2026-10-22T22:00:00Z','2026-10-22T22:00:00'),csv.replace('1.2','NaN'),csv.replace('1.2','-1'),csv.replace('living','unknown'),csv+'\nliving,1,2026-10-22T22:00:00Z',csv.split('\n').slice(0,3).join('\n'),csv.replaceAll('2026-10-22T22:00:00Z','2026-10-25T00:00:00Z')])assert.throws(()=>parseReadings(invalid,'home',now));
console.log(`Spatial models: ${cases} schedule and energy configurations passed, plus snapshot validation and conservation checks.`);

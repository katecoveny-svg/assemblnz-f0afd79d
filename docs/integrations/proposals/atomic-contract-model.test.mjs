// Deterministic contract model ONLY: no SQL, isolation, permissions or database proof.
import {test} from 'node:test';
import assert from 'node:assert/strict';
const copy=x=>structuredClone(x);
const canonical=x=>JSON.stringify(x===null||typeof x!=='object'?x:Array.isArray(x)?x.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(x).sort().map(k=>[k,JSON.parse(canonical(x[k]))])));
class Model {
 source={version:0,status:'error',active:true,checked:1,success:0,changed:0,failures:2}; runs=new Map(); clock=2; locks=[];
 transaction(fn){const saved=copy({source:this.source,runs:this.runs,clock:this.clock});try{return fn();}catch(e){Object.assign(this,saved);throw e;}}
 start(key,options={}){return this.transaction(()=>{
  const o=typeof options==='boolean'?{fail:options}:options;this.locks.push('source');if(!key)throw Error('key');
  if(this.runs.has(key))return copy(this.runs.get(key).identity);assert.equal(this.source.active,true,'inactive source');
  const original=copy(this.source),identity={source:'s',run:key,version:this.source.version+1,key};
  const expected={...copy(this.source),version:identity.version,status:'running',checked:this.clock++};
  if(!o.sourceSuppress)this.source=copy(expected);if(o.sourceRewrite)this.source.status='unexpected';
  assert.deepEqual(this.source,expected,'source persisted contract');
  if(o.fail)throw Error('insert failure');
  const row={identity,status:'running',receipt:null};if(!o.runSuppress)this.runs.set(key,copy(row));
  if(o.runRewrite&&this.runs.has(key))this.runs.get(key).status='unexpected';
  if(o.afterSourceRewrite)this.source=original;
  assert.deepEqual(this.runs.get(key),row,'run persisted contract');assert.deepEqual(this.source,expected,'post run source contract');
  return copy(this.runs.get(key).identity);
 });}
 finish(identity,payload,o={}){return this.transaction(()=>{
  this.locks.push('source','run');const r=this.runs.get(identity.run);assert.deepEqual(r?.identity,identity);
  assert.ok(['ok','error'].includes(payload.outcome));assert.ok(Number.isInteger(payload.added)&&payload.added>=0&&Number.isInteger(payload.updated)&&payload.updated>=0);
  if(payload.outcome==='ok')assert.equal(payload.error,null);
  const p={...copy(payload),identity:copy(identity)};
  if(r.receipt){assert.equal(canonical(r.payload),canonical(p),'payload conflict');return copy(r.receipt);}
  assert.equal(r.status,'running');if(identity.version===this.source.version){assert.equal(this.source.status,'running');assert.equal(this.source.active,true);}const state=identity.version===this.source.version?'committed':'superseded';
  const time=Math.max(this.clock++,this.source.checked,this.source.success,this.source.changed),expected=copy(this.source);
  if(state==='committed'){expected.status=p.outcome;expected.checked=time;if(p.outcome==='ok'){expected.success=time;if(p.added||p.updated)expected.changed=time;expected.failures=0;}else expected.failures++;}
  if(!o.sourceSuppress)this.source=copy(expected);if(o.sourceRewrite)this.source.status='unexpected';assert.deepEqual(this.source,expected,'source persisted contract');
  if(o.fail)throw Error('between source and run');
  const receipt={state,payload:p,time,source:copy(expected)},expectedRun={...copy(r),status:state==='superseded'?'error':p.outcome,payload:p,receipt};
  if(!o.runSuppress)this.runs.set(identity.run,copy(expectedRun));if(o.runRewrite)this.runs.get(identity.run).receipt={state:'fabricated'};
  if(o.trigger)throw Error('trigger failure');if(o.afterSourceRewrite)this.source.status='unexpected';
  assert.deepEqual(this.runs.get(identity.run),expectedRun,'run persisted contract');assert.deepEqual(this.source,expected,'post run source contract');
  return copy(this.runs.get(identity.run).receipt);
 });}
 lookup(i){const r=this.runs.get(i.run);if(!r||canonical(r.identity)!==canonical(i))return null;return copy(r.receipt??{state:'pending'});}
}

const ok={outcome:'ok',added:1,updated:0,error:null};
test('atomic start repeats key after ACK loss and increments version only once',()=>{const m=new Model();const a=m.start('a');assert.deepEqual(m.start('a'),a);assert.equal(m.source.version,1);assert.equal(m.runs.size,1);assert.equal(m.start('b').version,2);});
test('failed run creation rolls back source version and health',()=>{const m=new Model(),before=copy(m.source);assert.throws(()=>m.start('a',true));assert.deepEqual(m.source,before);assert.equal(m.runs.size,0);});
test('payload identity is immutable, including errors/counts and value types',()=>{const m=new Model(),a=m.start('a'),r=m.finish(a,ok),before=copy(m.source);assert.deepEqual(m.finish(a,{error:null,updated:0,added:1,outcome:'ok'}),r);for(const p of [{...ok,added:2},{...ok,outcome:'error'},{...ok,error:{}},{...ok,added:'1'}])assert.throws(()=>m.finish(a,p));assert.deepEqual(m.source,before);});
test('superseded completion and old receipt retry never mutate newer health',()=>{const m=new Model(),a=m.start('a'),b=m.start('b');m.finish(b,ok);const health=copy(m.source),r=m.finish(a,ok);assert.equal(r.state,'superseded');assert.deepEqual(m.source,health);assert.deepEqual(m.lookup(a),r);assert.deepEqual(m.finish(a,ok),r);assert.deepEqual(m.source,health);});
test('full timestamp/status ABA cannot revive old attempt ownership',()=>{const m=new Model(),a=m.start('a'),health=copy(m.source);m.start('b');const v=m.source.version;m.source={...health,version:v};assert.equal(m.finish(a,ok).state,'superseded');assert.deepEqual(m.source,{...health,version:v});});
test('old committed receipt remains exact after a newer success',()=>{const m=new Model(),a=m.start('a'),r=m.finish(a,ok),b=m.start('b');m.finish(b,ok);const health=copy(m.source);assert.deepEqual(m.lookup(a),r);assert.deepEqual(m.finish(a,ok),r);assert.deepEqual(m.source,health);assert.notDeepEqual(r.source,health);});
test('lost final ACK reconciles receipt without replaying documents or compensation',()=>{const m=new Model(),a=m.start('a');assert.deepEqual(m.lookup(a),{state:'pending'});const committed=m.finish(a,ok);const response={state:'finalization_unknown'};assert.equal(response.state,'finalization_unknown');assert.deepEqual(m.lookup(a),committed);assert.deepEqual(m.finish(a,ok),committed);assert.equal(m.runs.size,1);});
test('precommit ACK loss leaves pending and only exact finalization may retry',()=>{const m=new Model(),a=m.start('a');assert.throws(()=>m.finish(a,ok,{fail:true}));assert.deepEqual(m.lookup(a),{state:'pending'});assert.equal(m.finish(a,ok).state,'committed');assert.equal(m.lookup({...a,version:999}),null);});
test('source/run rollback on statement or trigger failure',()=>{for(const option of [{fail:true},{trigger:true}]){const m=new Model(),a=m.start('a'),before=copy(m.source);assert.throws(()=>m.finish(a,ok,option));assert.deepEqual(m.source,before);assert.equal(m.runs.get('a').status,'running');assert.equal(m.lookup(a).state,'pending');}});
test('error preserves timestamps; unchanged success advances only successful fetch',()=>{const m=new Model(),a=m.start('a');m.finish(a,ok);const success=m.source.success,changed=m.source.changed;const b=m.start('b');m.finish(b,{outcome:'error',added:0,updated:0,error:{blocked:true}});assert.equal(m.source.success,success);assert.equal(m.source.changed,changed);const c=m.start('c');m.finish(c,{...ok,added:0});assert.ok(m.source.success>success);assert.equal(m.source.changed,changed);});
test('both legal serial schedules preserve version ordering and source-first locks',()=>{for(const order of ['finish-first','start-first']){const m=new Model(),a=m.start('a');if(order==='finish-first'){assert.equal(m.finish(a,ok).state,'committed');m.start('b');}else{m.start('b');assert.equal(m.finish(a,ok).state,'superseded');}for(let i=0;i<m.locks.length;i++)if(m.locks[i]==='run')assert.equal(m.locks[i-1],'source');}});
function reconcile(identity,payload,response){
 if(!response||!['committed','superseded'].includes(response.state)||!response.payload||canonical(response.payload)!==canonical({...payload,identity}))return {state:'finalization_unknown'};
 return copy(response);
}
test('unavailable, pending, malformed and mismatched receipt reads remain unknown',()=>{const m=new Model(),a=m.start('a'),r=m.finish(a,ok);for(const response of [null,undefined,{state:'pending'},{state:'committed'}, {...r,payload:{...r.payload,added:99}}, {...r,payload:{...r.payload,identity:{...a,version:99}}}])assert.deepEqual(reconcile(a,ok,response),{state:'finalization_unknown'});assert.deepEqual(reconcile(a,ok,r),r);});
test('recovery never promotes old receipt snapshot into current source health',()=>{const m=new Model(),a=m.start('a'),r=m.finish(a,ok),b=m.start('b');m.finish(b,{outcome:'error',added:0,updated:0,error:{blocked:true}});const health=copy(m.source);assert.equal(reconcile(a,ok,r).state,'committed');assert.deepEqual(m.source,health);assert.equal(m.source.status,'error');assert.equal(r.source.status,'ok');});

test('start suppress/rewrite of source or run rolls back all persisted state',()=>{for(const key of ['sourceSuppress','sourceRewrite','runSuppress','runRewrite','afterSourceRewrite']){const m=new Model(),before=copy(m.source);assert.throws(()=>m.start('a',{[key]:true}),undefined,key);assert.deepEqual(m.source,before);assert.equal(m.runs.size,0);}});
test('final suppression/rewriting cannot return receipt or leave source-only success',()=>{for(const key of ['sourceSuppress','sourceRewrite','runSuppress','runRewrite','afterSourceRewrite']){const m=new Model(),a=m.start('a'),before=copy(m.source),run=copy(m.runs.get('a'));assert.throws(()=>m.finish(a,ok,{[key]:true}),undefined,key);assert.deepEqual(m.source,before);assert.deepEqual(m.runs.get('a'),run);}});
test('null active and run status fail closed with unchanged persisted state',()=>{const m=new Model();m.source.active=null;const before=copy(m.source);assert.throws(()=>m.start('a'));assert.deepEqual(m.source,before);m.source.active=true;const a=m.start('a');m.runs.get('a').status=null;const run=copy(m.runs.get('a')),health=copy(m.source);assert.throws(()=>m.finish(a,ok));assert.deepEqual(m.source,health);assert.deepEqual(m.runs.get('a'),run);});
test('invalid finalization args leave source and run unchanged',()=>{const m=new Model(),a=m.start('a'),source=copy(m.source),run=copy(m.runs.get('a'));for(const payload of [{...ok,added:-1},{...ok,added:null},{...ok,outcome:null},{...ok,error:{invalid:true}},{...ok,updated:'0'}])assert.throws(()=>m.finish(a,payload));assert.deepEqual(m.source,source);assert.deepEqual(m.runs.get('a'),run);});
test('identical and conflicting finalizers have one durable winner across serial orders',()=>{for(const order of [[1,2],[2,1]]){const m=new Model(),a=m.start('a'),receipt=m.finish(a,{...ok,added:order[0]}),health=copy(m.source);assert.deepEqual(m.finish(a,{...ok,added:order[0]}),receipt);assert.throws(()=>m.finish(a,{...ok,added:order[1]}));assert.deepEqual(m.source,health);assert.deepEqual(m.lookup(a),receipt);}});

test('current source null status or disabled active cannot finalize successfully',()=>{for(const change of [{status:null},{active:null},{active:false}]){const m=new Model(),a=m.start('a');Object.assign(m.source,change);const source=copy(m.source),run=copy(m.runs.get('a'));assert.throws(()=>m.finish(a,ok));assert.deepEqual(m.source,source);assert.deepEqual(m.runs.get('a'),run);}});

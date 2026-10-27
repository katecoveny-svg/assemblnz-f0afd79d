import assert from 'node:assert/strict';
import {defaults,plan,sceneInventory,stockStatus,sanitise,findFood} from '../dist/model.js';
const base=defaults();const p=plan(base);
assert.ok(p.total>0&&p.avoided>0);
assert.ok(plan({...base,kidsHome:false}).total<p.total,'Kids off should reduce shopping cost');
assert.ok(plan({...base,away:true}).total<p.total,'Weekend away should reduce demand');
assert.ok(plan(base,{ignoreStock:true}).basket>=p.basket,'Existing usable stock should reduce purchases');
assert.equal(plan(base,{top:'None'}).shops.length,1);
assert.ok(plan(base,{top:'None'}).atRisk>p.atRisk,'Split shop should reduce freshness exposure in the sample');
const veg=plan({...base,diet:'vegetarian'});assert.ok(veg.shops.every(s=>s.items.every(x=>x.id!=='chicken')));
const late={...base,inventory:[{id:'chicken',qty:20,due:-1,place:'fridge',action:null}]};assert.equal(plan(late).avoided,0,'Expired planning stock must not offset shopping');
const frozen={...late,inventory:[{...late.inventory[0],place:'freezer'}]};assert.ok(plan(frozen).avoided>0);
assert.equal(stockStatus({due:1,place:'fridge'},3),'overdue');assert.equal(stockStatus({due:1,place:'freezer'},6),'frozen');
const monday=sceneInventory({...base,includePlanned:false}).reduce((n,x)=>n+x.qty,0);const friday=sceneInventory({...base,day:4,includePlanned:false}).reduce((n,x)=>n+x.qty,0);assert.ok(friday<monday,'Time travel consumes projected stock');
for(const kids of [0,2,8])for(const adults of [1,4,8])for(const top of ['None','Wednesday','Thursday']){const q=plan({...base,kids,adults,topDay:top});assert.ok(Number.isFinite(q.total)&&q.total>=0);assert.ok(q.shops.every(s=>s.items.every(x=>Number.isFinite(x.cost)&&x.qty>0)));}
assert.deepEqual(findFood('MILK 2L\nspinach carrots apples bread'),['carrot','apple','bread','milk','spinach']);
assert.equal(sanitise({adults:999,inventory:[{id:'<script>',qty:100}]}).adults,8);
assert.equal(sanitise({inventory:[{id:'<script>',qty:100}]}).inventory.length,0);
console.log('PASS: household, pantry deduction, timing, freshness, vegetarian, projection, parser and 27 scenario checks.');

assert.ok(sceneInventory(base).length>sceneInventory({...base,includePlanned:false}).length,'Planned shop arrivals add food to 3D projection');

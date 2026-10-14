const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{})});try{
 const page=await browser.newPage();await page.route('https://fixture.invalid/**',r=>{const file=new URL(r.request().url()).pathname.slice(1);const p=path.join('apps/do/extension',file);return r.fulfill({body:fs.readFileSync(p),contentType:file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'image/webp'});});
 await page.addInitScript(()=>{window.calls=[];window.state={connected:false};window.chrome={runtime:{sendMessage:async m=>{window.calls.push(m);if(m.action==='inspect')return{ok:true,data:{selected:{id:8,url:'http://127.0.0.1:4198/cart-fixture.html'},workspaces:[{id:9,url:'https://www.assembl.co.nz/do/personal'}],connection:window.state}};if(m.action==='connect')window.state={connected:true,connectionId:'test-connection',expiresAt:Date.now()+120000,target:{url:'http://127.0.0.1:4198/cart-fixture.html'},readGranted:false};if(m.action==='allow-read')window.state.readGranted=true;if(m.action==='cancel')window.state={connected:false};if(m.action==='approve')window.state.receipt={status:'verified',items:[{productId:'fictional-oats',status:'verified',observedQuantity:2}]};return{ok:true,data:window.state};}}};});
 await page.goto('https://fixture.invalid/browser-connection.html');
 const out='output/playwright/companion';fs.mkdirSync(out,{recursive:true});
 for(const width of [320,375,900]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${out}/idle-${width}.png`,fullPage:true});}
 assert.equal(await page.locator('#cancel').isVisible(),false);assert.equal(await page.locator('#allow-read').isVisible(),false);assert.equal(await page.locator('#connect').isVisible(),false);
 assert.equal(await page.locator('nav a').count(),3);assert.match(await page.locator('nav a').nth(1).getAttribute('href'),/entry=talk$/);
 assert.deepEqual(await page.evaluate(()=>calls.map(m=>m.action)),['status']);
 await page.locator('#setup summary').click();await page.locator('#inspect').click();assert.equal(await page.locator('#connect').isEnabled(),true);
 await page.locator('#connect').click();assert.equal(await page.locator('#setup').isVisible(),false);assert.equal(await page.locator('#cancel').isVisible(),true);assert.equal(await page.locator('#read-step').isVisible(),true);
 assert.equal(await page.evaluate(()=>calls.some(m=>m.action==='allow-read')),false);
 await page.locator('#allow-read').click();assert.equal(await page.locator('#next-step').isVisible(),true);
 await page.evaluate(()=>{state.proposal={items:[{productId:'fictional-oats',name:'Fictional rolled oats',quantity:0,targetQuantity:2,unitPriceCents:350}]};state.digest='review-digest';state.brief='Two packets for the fictional cart';});
 await page.locator('#review').waitFor({state:'visible'});assert.match(await page.locator('#items').innerText(),/0 → 2, NZD 3.50/);
 for(const width of [320,900]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${out}/review-${width}.png`,fullPage:true});}
 await page.locator('#approve').click();assert.equal(await page.locator('#review').isVisible(),false);assert.equal(await page.locator('#result').isVisible(),true);assert.match(await page.locator('#result-items').innerText(),/verified quantity 2/);assert.equal(await page.locator('#receipt').isVisible(),false);
 assert.deepEqual(await page.evaluate(()=>calls.find(m=>m.action==='approve')),{type:'do:browser-companion',action:'approve',connectionId:'test-connection',digest:'review-digest'});
 await page.locator('#cancel').click();assert.equal(await page.locator('#result').isVisible(),false);assert.equal(await page.locator('#cancel').isVisible(),false);
 console.log('PASS companion: 3 entry links, idle disclosure, explicit connect/read/review/cancel, exact approval binding, readable receipt, 320/375/900px no overflow. Synthetic UI transport only; no native execution claim.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

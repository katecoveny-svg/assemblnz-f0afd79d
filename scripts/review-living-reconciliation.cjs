// Synthetic local browser proof; only the local unconditional checkout gate may receive POST.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:3000';
 const output = process.env.RECONCILIATION_OUTPUT || 'output/playwright/living-reconciliation';
 fs.mkdirSync(output, {recursive:true});
 const browser = await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-unsafe-swiftshader']});
 const results=[];
 try {
  for (const width of [375,1440]) {
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
   const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
   await page.goto(origin+'/living',{waitUntil:'networkidle'});
   assert.match(await page.locator('main').innerText(),/TURN/);
   await noOverflow(); await page.screenshot({path:`${output}/system-${width}.png`});
   await page.goto(origin+'/living/shop',{waitUntil:'networkidle'});
   await page.getByRole('button',{name:'Configure The Essentials Pegboard Kit',exact:true}).click();
   const modal=page.getByRole('dialog',{name:'The Essentials Pegboard Kit'});
   await modal.waitFor();
   await modal.getByText('Related TURN source parts · v0.3',{exact:true}).click();
   assert.match(await modal.innerText(),/not the geometry or bill of materials/);
   const studio=modal.getByRole('link',{name:'Build a measured layout in Space Studio →'});
   assert.equal(await studio.getAttribute('href'),'/living/studio?surface=wall');
   await modal.getByPlaceholder('a name, a word, your thing').fill('Proof only');
   await modal.getByLabel('Available width in millimetres').fill('480');
   await modal.getByLabel('Available depth in millimetres').fill('320');
   await modal.getByLabel('I have measured and checked this space.').check();
   await page.screenshot({path:`${output}/shop-concept-${width}.png`});
   await modal.getByRole('button',{name:/save .* to my kit/}).click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('assembl.living.shop.v1')||'[]').length===2);
   await page.reload({waitUntil:'networkidle'});
   await page.getByRole('button',{name:'Open my kit, 2 pieces',exact:true}).click();
   const bag=page.getByRole('dialog',{name:'my kit.',exact:true}); await bag.waitFor();
   const download=page.waitForEvent('download'); await bag.getByRole('button',{name:'export my kit',exact:true}).click();
   const data=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));
   assert.equal(data.orderCreated,false); assert.equal(data.items.length,2);
   assert.equal(data.items[0].text,'Proof only'); assert.equal(data.items[0].engineeringReferenceRelationship,'related-family-only');
   assert(data.items[0].engineeringReference.some(p=>p.partId==='grid-board-4x4'));
   for(const item of data.items){assert.equal(item.manufacturingRevision,null);assert.equal(item.approvedForManufacture,false);}
   // The browser's request context calls only this local, unconditional release gate.
   const gate=await context.request.post(origin+'/api/living/shop-checkout',{data:{approvedForManufacture:true,items:data.items}});
   assert.equal(gate.status(),409);assert.equal(gate.headers()['cache-control'],'no-store');
   assert.deepEqual(await gate.json().then(x=>[x.orderCreated,x.checkoutUrl]),[false,null]);
   await bag.getByRole('button',{name:'Close my kit'}).click();await noOverflow();
   await page.goto(origin+'/living/studio?kit=no-drill-door-wall',{waitUntil:'networkidle'});
   await page.getByRole('button',{name:'confirm fit →',exact:true}).click();
   await page.getByLabel('Width available, mm').fill('500');await page.getByLabel('Height available, mm').fill('500');
   await page.getByLabel('Door thickness, mm (up to 35)').fill('30');
   await page.getByRole('button',{name:'the 4 mm gauge step fits',exact:true}).click();
   await page.getByLabel('I measured this space myself and these numbers are right.').check();
   const configDownload=page.waitForEvent('download');
   await page.getByRole('button',{name:'download configuration (JSON)',exact:true}).click();
   const config=JSON.parse(fs.readFileSync(await (await configDownload).path(),'utf8'));
   assert.equal(config.schema,'assembl.living.configuration/2');assert.equal(config.interface.pitchMm,42);
   assert.equal(config.interface.pack,'v0.3');assert.equal(config.purchasing.status,'not_enabled');assert.equal(config.fit.status,'fits');
   assert(config.lines.length>0); assert(config.lines.every(l=>l.printFiles.length>0));
   await noOverflow();await page.screenshot({path:`${output}/studio-${width}.png`});assert.deepEqual(errors,[]);
   results.push({width,shopPersistence:true,relatedReferences:true,checkoutStatus:409,studioSchema:config.schema,overflow:false,errors});
   await context.close();
  }
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

/* Synthetic local-only proof. All API responses are intercepted; external requests are blocked. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DO_REVIEW_BASE || 'http://127.0.0.1:3099';
const output = 'output/playwright/pet-weekly';
const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
(async () => {
 fs.mkdirSync(output, {recursive:true});
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const report=[];
 try {
  for (const width of [1440,320]) {
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   let owner=a; const writes=[]; const errors=[]; const blocked=[];
   await context.route('**/*', async route => {
    const request=route.request(), url=new URL(request.url());
    if(url.origin !== base) { blocked.push(url.origin); return route.abort(); }
    if(url.pathname==='/api/do/personal') return route.fulfill({status:owner==='guest'?401:200,contentType:'application/json',body:JSON.stringify({workspaceKey:owner,responsibilities:[],runs:[],storage:{available:true},worker:{configured:false,lastSeenAt:null}})});
    if(url.pathname==='/api/do/personal/checklists') {
     if(request.method()==='POST') writes.push(request.postDataJSON());
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({plans:[],revision:0,savedAt:null})});
    }
    if(url.pathname.startsWith('/api/')) return route.fulfill({status:503,contentType:'application/json',body:'{}'});
    if(!['GET','HEAD'].includes(request.method())) throw new Error('Unexpected write '+request.url());
    return route.continue();
   });
   const page=await context.newPage(); page.on('pageerror',error=>errors.push(error.message));
   page.on('dialog',dialog=>dialog.accept());
   await page.goto(base+'/do/personal');
   async function create() {
    await page.getByRole('button',{name:'Pet weekly routine · session only'}).click();
    await page.getByRole('textbox',{name:'Pet nickname',exact:true}).fill('Demo pet');
    await page.getByRole('textbox',{name:'Your routine wording'}).fill('Put the blue toy in its basket.');
    await page.getByRole('button',{name:'Arrange my week'}).click();
    assert.equal(await page.getByRole('region',{name:'Seven-day pet routine'}).count(),0);
    await page.getByRole('checkbox',{name:'Monday',exact:true}).focus(); await page.keyboard.press('Space');
    await page.getByRole('checkbox',{name:'Thursday',exact:true}).check();
    await page.getByRole('button',{name:'Arrange my week'}).click();
    await page.getByRole('region',{name:'Seven-day pet routine'}).waitFor();
   }
   await create();
   const week=page.getByRole('region',{name:'Seven-day pet routine'});
   assert.deepEqual(await week.getByRole('heading',{level:5}).allTextContents(),['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']);
   assert.equal(await week.getByText('No routine supplied',{exact:true}).count(),5);
   await page.getByRole('button',{name:'I’ve checked my week · review'}).click();
   assert.equal(await week.getByText('Done · recorded by you',{exact:true}).count(),0);
   await page.getByRole('button',{name:'Record completion for Monday'}).click();
   await page.getByRole('textbox',{name:'Your completion note'}).fill('I put the blue toy away.');
   await page.getByRole('button',{name:'Save completion',exact:true}).click();
   await page.getByRole('button',{name:'Edit for Thursday'}).click();
   await page.getByRole('textbox',{name:'Routine for Thursday'}).fill('Put the green toy in its basket.');
   assert(await page.getByRole('button',{name:'Close checklist details'}).isDisabled());
   assert(await page.getByRole('button',{name:/^Needs you/}).isDisabled());
   await page.getByText('Choose a checklist',{exact:true}).click();
   await page.getByRole('button',{name:/School & whānau/}).click();
   await page.getByRole('textbox',{name:'What would you like done?',exact:true}).fill('School notice: bring a blue folder.');
   assert(await page.getByRole('button',{name:'Start',exact:true}).isDisabled());
   await page.getByText('Choose a checklist',{exact:true}).click();
   await page.getByRole('textbox',{name:'Routine for Thursday'}).focus(); await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Save day');
   await page.keyboard.press('Enter');
   await page.getByRole('button',{name:'I’ve checked my week · review'}).waitFor();
   await page.getByRole('button',{name:'I’ve checked my week · review'}).click();
   assert.equal(await week.getByText('Done · recorded by you',{exact:true}).count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await week.screenshot({path:`${output}/final-${width}.png`});
   assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(key=>key.includes('life-admin'))),false);
   const downloadPromise=page.waitForEvent('download');
   await page.getByRole('button',{name:'Download Pet routines',exact:true}).click();
   const download=await downloadPromise; await download.saveAs(`${output}/export-${width}.txt`);
   assert(fs.readFileSync(`${output}/export-${width}.txt`,'utf8').includes('Put the green toy in its basket.'));
   // Existing checklist controls create a mixed collection; only non-Pet content may be saved.
   await page.getByText('Choose a checklist',{exact:true}).click();
   await page.getByRole('button',{name:/School & whānau/}).click();
   await page.getByRole('textbox',{name:'What would you like done?',exact:true}).fill('School notice: bring a blue folder.');
   await page.getByRole('button',{name:'Start',exact:true}).click();
   await page.getByText('Keep this for later',{exact:true}).click();
   await page.getByRole('checkbox',{name:'I want to save or open checklist data in this browser for this DO account.'}).check();
   await page.getByRole('button',{name:'Save browser snapshot'}).click();
   const snapshot=await page.evaluate(owner=>JSON.parse(localStorage.getItem('assembl:personal:life-admin:v1:'+owner)),a);
   assert.equal(snapshot.plans.length,1); assert.equal(snapshot.plans[0].category,'school');
   assert(await page.getByRole('button',{name:'Download Pet routines',exact:true}).isVisible());
   await page.locator('summary').filter({hasText:'Saved checklists'}).click();
   await page.getByRole('button',{name:'Open saved checklists'}).click();
   await page.getByRole('checkbox',{name:'I want to save or remove this checklist collection in my private Assembl account.'}).check();
   await page.getByRole('button',{name:'Save 1 checklist to my account'}).click();
   await page.getByText('Checklists saved to your account.',{exact:false}).waitFor();
   assert.equal(writes.length,1); assert.equal(writes[0].plans.length,1); assert.equal(writes[0].plans[0].category,'school');
   // Focus revalidation exercises the existing account-keyed LifeAdmin remount.
   owner=b; await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
   await page.getByRole('button',{name:'Download Pet routines',exact:true}).waitFor({state:'detached'});
   await create();
   await page.getByRole('button',{name:'Edit for Monday'}).click();
   await page.getByRole('textbox',{name:'Routine for Monday'}).fill('An unfinished local edit.');
   owner='guest'; await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
   await page.getByRole('region',{name:'Seven-day pet routine'}).waitFor({state:'detached'});
   await page.getByRole('button',{name:'Pet weekly routine · session only'}).click();
   assert.equal(await page.getByRole('textbox',{name:'Pet nickname',exact:true}).inputValue(),'');
   assert.equal(await page.getByRole('textbox',{name:'Your routine wording'}).inputValue(),'');
   assert.deepEqual(errors,[]);
   report.push({width,sevenDays:true,emptyDaysRejected:true,keyboard:true,reviewIsNotCompletion:true,editInvalidatesReview:true,unfinishedEditProtected:true,export:true,mixedSavesExcludePet:true,accountSwitchAndSignOutClear:true,noHorizontalOverflow:true,pageErrors:errors,cloudWrites:'one mocked non-Pet collection',blockedExternalOrigins:[...new Set(blocked)]});
   await context.close();
  }
  fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

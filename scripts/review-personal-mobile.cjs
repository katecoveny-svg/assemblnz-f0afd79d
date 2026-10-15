/* Local synthetic proof. All API requests mocked; no microphone or providers. */
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/tmp/do-bills-browser-deps/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3192';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/personal-mobile-r2';
const checks = [], errors = [], writes = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); console.log('PASS '+name); };
(async () => {
 fs.mkdirSync(out, {recursive:true});
 const browser = await chromium.launch({headless:true});
 try {
  const context = await browser.newContext({ reducedMotion:'reduce', serviceWorkers:'block' });
  let owner = 'guest';
  await context.route('**/*', async route => {
   const req=route.request(), url=new URL(req.url());
   if(url.origin !== origin) return route.abort();
   if(!url.pathname.startsWith('/api/')) return route.continue();
   if(req.method() !== 'GET') writes.push(url.pathname);
   if(url.pathname === '/api/do/personal') return route.fulfill({status:owner === 'guest' ? 401 : 200,json:{workspaceKey:owner,responsibilities:[],runs:[],worker:{configured:false}}});
   if(url.pathname === '/api/do/session') return route.fulfill({json:{workspaceKey:owner}});
   if(url.pathname === '/api/do/personal/assistant') return route.fulfill({json:{ready:false,signedIn:owner !== 'guest',reason:'sign_in_required',message:'Synthetic fixture: drafting unavailable.',externalActions:false}});
   if(url.pathname === '/api/do/live-token') return route.fulfill({json:{enabled:false,configured:false,signedIn:false,remaining:0}});
   return route.fulfill({status:503,json:{error:'Synthetic connection unavailable',enabled:false}});
  });
  const page=await context.newPage();
  async function home() { const back=page.getByRole('button',{name:'Back to Today',exact:true}); if(await back.isVisible()) { await back.focus(); await page.keyboard.press('Enter'); await page.waitForFunction(()=>document.activeElement?.id==='personal-today-heading'); } }
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [375,320,1440]) {
   await page.setViewportSize({width,height:1000});
   await page.goto(origin+'/do/personal');
   await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
   check(width+': Today directly follows entry controls',await page.evaluate(()=>{const nav=document.querySelector('nav[aria-label="Choose how to start"]'); const today=document.querySelector('#personal-today-heading'); return nav.compareDocumentPosition(today)&Node.DOCUMENT_POSITION_FOLLOWING && today.getBoundingClientRect().top-nav.getBoundingClientRect().bottom<45;}));
   check(width+': compact two-column phone cards',await page.locator('[data-task]').evaluateAll((cards,width)=>width>600 || Math.abs(cards[0].getBoundingClientRect().top-cards[1].getBoundingClientRect().top)<2,width));
   check(width+': six visual task cards',await page.locator('[data-task]').count()===6);
   check(width+': no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(width+': no invented calendar activity',await page.getByText('No inbox or calendar has been read for this view.').isVisible());
   await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
   await page.screenshot({path:`${out}/home-${width}.png`,fullPage:true});
   await page.screenshot({path:`${out}/today-${width}.png`});
   const nav=page.getByRole('navigation',{name:'Choose how to start'});
   await nav.getByRole('button',{name:'Write',exact:true}).click();
   await page.locator('#personal-assistant-input').fill('Synthetic existing draft: keep this wording.');
   await home();
   check(width+': Back to Today moves keyboard focus',await page.locator('#personal-today-heading').evaluate(el=>el===document.activeElement));
   await page.locator('[data-task="dinner"] button').first().focus();
   await page.keyboard.press('Enter');
   await page.keyboard.press('Tab');
   check(width+': keyboard opens task and reaches its action',await page.getByRole('button',{name:'Write a dinner request',exact:true}).evaluate(el=>el===document.activeElement));
   check(width+': dinner cannot claim booking',await page.getByText('Write what you have in mind and prepare a request. DO cannot check restaurant availability or reserve a table here.').isVisible());
   await page.getByRole('button',{name:'Write a dinner request',exact:true}).click();
   check(width+': task entry preserves unfinished text',await page.locator('#personal-assistant-input').inputValue()==='Synthetic existing draft: keep this wording.');
   await page.waitForFunction(() => document.activeElement?.id === 'personal-assistant-input');
   check(width+': task entry focuses shared composer',await page.locator('#personal-assistant-input').evaluate(el=>el===document.activeElement));
   check(width+': selected dinner intent is visible beside draft',await page.getByRole('complementary',{name:'Chosen task'}).isVisible() && (await page.getByRole('complementary',{name:'Chosen task'}).innerText()).includes('A table for us'));
   await page.screenshot({path:`${out}/intent-${width}.png`});
   await home();
   await page.locator('[data-task="travel"] button').first().click();
   check(width+': one open task detail',await page.locator('[data-task] button[aria-expanded="true"]').count()===1);
   check(width+': existing travel route retained',await page.getByRole('link',{name:'Open travel workspace'}).getAttribute('href')==='/do/travel');
   await page.locator('[data-task="briefing"] button').first().click();
   check(width+': mail route retains account verification entry',await page.getByRole('link',{name:'Open mail review'}).getAttribute('href')==='/do/mail');
   await page.locator('[data-task="meals"] button').first().click();
   check(width+': meal route retained',await page.getByRole('link',{name:'Open meal planner'}).getAttribute('href')==='/do/shop');
   await page.locator('[data-task="meals"] button').first().click();
   for (const [id,action,title] of [['appointments','Write a service request','Appointments'],['shopping','Write a shopping request','Clothes & gifts']]) {
    await page.locator(`[data-task="${id}"] button`).first().click();
    await page.getByRole('button',{name:action,exact:true}).click();
    check(width+': '+id+' retains distinct intent', (await page.getByRole('complementary',{name:'Chosen task'}).innerText()).includes(title));
    check(width+': '+id+' does not overwrite draft',await page.locator('#personal-assistant-input').inputValue()==='Synthetic existing draft: keep this wording.');
    await home();
   }
   await nav.getByRole('button',{name:'Write',exact:true}).click();
   await page.getByRole('button',{name:'Clear task',exact:true}).click();
   check(width+': clearing intent preserves draft',await page.locator('#personal-assistant-input').inputValue()==='Synthetic existing draft: keep this wording.' && await page.getByRole('complementary',{name:'Chosen task'}).count()===0);
   await page.locator('#personal-assistant-input').fill('');
   await nav.getByText('Add',{exact:true}).click();
   await page.getByRole('button',{name:'Note or checklist',exact:true}).click();
   check(width+': Add uses existing local editor',await page.locator('#life-admin-source').isVisible());
   // Review regression: clear a selected task after changing to the checklist editor.
   await page.locator('#life-admin-source').fill('Synthetic checklist note to preserve.');
   await home();
   await page.locator('[data-task="dinner"] button').first().click();
   await page.getByRole('button',{name:'Write a dinner request',exact:true}).click();
   await nav.getByText('Add',{exact:true}).click();
   await page.getByRole('button',{name:'Note or checklist',exact:true}).click();
   await page.getByRole('button',{name:'Clear task',exact:true}).focus();
   await page.keyboard.press('Enter');
   check(width+': Clear task focuses the visible checklist editor',await page.locator('#life-admin-source').evaluate(el=>el===document.activeElement && el.getClientRects().length>0));
   // Focus is synchronous; task-context removal completes in the React commit.
   await page.getByRole('complementary',{name:'Chosen task'}).waitFor({state:'detached'});
   assert.equal(await page.locator('#life-admin-source').inputValue(),'Synthetic checklist note to preserve.',width+': Clear task must preserve the exact checklist note');
   check(width+': Clear task preserves checklist note and hides task context',await page.getByRole('complementary',{name:'Chosen task'}).count()===0);
   check(width+': Clear task never focuses hidden Write editor',!await page.locator('#personal-assistant-input').isVisible() && !await page.locator('#personal-assistant-input').evaluate(el=>el===document.activeElement));
   await page.locator('#life-admin-source').fill('');

   await nav.getByRole('button',{name:'Write',exact:true}).click();
   await home();
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`${out}/returned-${width}.png`,fullPage:true});
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`${out}/returned-focus-${width}.png`});
  }
  await page.getByRole('button',{name:'Try a fictional example',exact:true}).click();
  await page.getByRole('button',{name:'Try fictional school notice',exact:true}).click();
  check('actual local task updates Today',await page.getByRole('heading',{name:'1 thing needs you',exact:true}).isVisible());
  await page.getByRole('button',{name:'Review my tasks',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.id==='personal-task-board-summary');
  check('Review tasks moves focus to board summary',await page.locator('#personal-task-board-summary').evaluate(el=>el===document.activeElement));
  check('Today opens existing review board',await page.locator('#personal-task-board').getAttribute('open')!==null);
  check('review retains distinction from external action',(await page.locator('#personal-task-board').innerText()).includes('does not approve sending, payments, bookings or submissions'));
  await page.screenshot({path:`${out}/review-desktop.png`,fullPage:true});
  // The view is keyed by verified owner, including its expanded cards and local plans.
  owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>!document.body.textContent.includes('1 thing needs you'));
  await page.getByRole('navigation',{name:'Choose how to start'}).getByRole('button',{name:'Write',exact:true}).click();
  await page.locator('#personal-assistant-input').fill('Synthetic owner A private draft');
  await home();
  await page.locator('[data-task="shopping"] button').first().click();
  await page.getByRole('button',{name:'Write a shopping request',exact:true}).click();
  owner='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>document.querySelector('#personal-assistant-input')?.value === '');
  check('owner switch clears old draft',await page.locator('#personal-assistant-input').inputValue()==='');
  check('owner switch clears chosen intent',await page.getByRole('complementary',{name:'Chosen task'}).count()===0);
  check('owner switch resets expanded task',await page.locator('[data-task] button[aria-expanded="true"]').count()===0);
  check('owner switch returns to Today',!await page.locator('#personal-assistant-input').isVisible());
  await page.getByRole('navigation',{name:'Choose how to start'}).getByRole('button',{name:'Talk',exact:true}).click();
  check('Talk opens existing consented voice surface',await page.locator('#personal-do-call').isVisible());
  await page.getByText('Choose a checklist',{exact:true}).click();
  await page.getByRole('button').filter({hasText:'Care appointments'}).click();
  check('existing checklist shortcut still reveals editor',await page.locator('#life-admin-source').isVisible());
  await page.getByRole('navigation',{name:'Choose how to start'}).getByText('Add',{exact:true}).click();
  await page.getByRole('button',{name:'Photo or image',exact:true}).click();
  await page.locator('#do-vision-context > summary').click();
  await page.getByLabel('Choose an image for DO').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC','base64')});
  const photoConsent=page.getByRole('checkbox',{name:/Send this image and question/});
  await photoConsent.check();
  await home();
  await page.getByRole('navigation',{name:'Choose how to start'}).getByText('Add',{exact:true}).click();
  await page.getByRole('button',{name:'Photo or image',exact:true}).click();
  check('Back to Today revokes photo consent',!await photoConsent.isChecked());
  check('photo cannot resubmit without renewed consent',await page.getByRole('button',{name:'Ask DO to look · 1 task',exact:true}).isDisabled());
  check('no API writes',writes.length===0);check('no browser errors',errors.length===0);
  fs.writeFileSync(`${out}/results.json`,JSON.stringify({checks,errors,writes},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

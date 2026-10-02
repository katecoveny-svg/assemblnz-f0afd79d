"""Mocked local UI proof. Every research POST intercepted; no provider call."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path(__file__).parent
async def main():
 report=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='chrome')
  for width in [375,1440]:
   context=await browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce')
   page=await context.new_page();posts=[];recovery_modes=[];errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   async def mock(route):
    if route.request.method=='GET':
     await route.fulfill(json={'ready':not posts,'typesafeReady':not posts,'message':'Mocked availability: allowance exhausted.' if posts else 'Mocked availability: ready.'})
    else:
     posts.append(route.request.post_data_json)
     recovery_modes.append(route.request.headers.get('x-pursuit-recovery'))
     if len(posts)>1:await asyncio.sleep(0.8)
     await route.fulfill(status=503 if len(posts)==1 else 409,json={'error':'No verified source trail. Mocked failure.' if len(posts)==1 else 'This saved request failed. Recovery has not started another research call.','code':'untraced_source' if len(posts)==1 else 'failed'})
   await page.route('**/api/pursuit/research',mock)
   await page.goto('http://127.0.0.1:3164/pursuit',wait_until='networkidle')
   await page.wait_for_timeout(1000)
   canvas=page.locator('#try-pursuit')
   await canvas.get_by_label('Company or sector',exact=True).fill('assembl.co.nz')
   await canvas.get_by_label('What should the agent investigate?',exact=True).fill('Fictional independent consultancy: research one public source-backed opening.')
   await canvas.locator('input[type=checkbox]').first.check()
   await canvas.get_by_label('Also share the public research draft',exact=False).check()
   assert await canvas.locator('form').evaluate('(form)=>form.checkValidity()'),await canvas.locator('form').evaluate('(form)=>Array.from(form.elements).map(e=>({name:e.name,value:e.value,valid:e.validity.valid}))')
   await canvas.get_by_role('button',name='Research an opportunity',exact=True).click()
   print(width,'submitted',posts,flush=True)
   await page.wait_for_timeout(1500)
   (OUT/f'dom-{width}.txt').write_text(await canvas.inner_text())
   await expect(canvas.get_by_role('heading',name='No verified research result.',exact=True)).to_be_visible()
   await expect(canvas.get_by_role('region',name='Pursuit illustrated walkthrough')).to_have_count(0)
   await expect(canvas.get_by_text('DRAFT / SOURCE-LINKED',exact=True)).to_have_count(0)
   await expect(canvas.get_by_role('button',name='Recover this request',exact=True)).to_be_enabled()
   await canvas.scroll_into_view_if_needed()
   await canvas.screenshot(path=str(OUT/f'failure-{width}.png'))
   await canvas.get_by_role('button',name='Recover this request',exact=True).click()
   await expect(canvas.get_by_role('button',name='Checking saved request…',exact=True)).to_be_visible()
   await expect(canvas.get_by_role('status')).to_contain_text('This lookup does not start research')
   await expect(canvas.get_by_role('alert')).to_contain_text('Recovery has not started another research call')
   assert len(posts)==2 and posts[0]==posts[1],posts
   assert recovery_modes==[None,'lookup-only'],recovery_modes
   assert posts[0]['useTypeSafe'] is True
   await expect(canvas.get_by_role('region',name='Pursuit illustrated walkthrough')).to_have_count(0)
   await canvas.screenshot(path=str(OUT/f'recovery-{width}.png'))
   await canvas.locator('textarea[name=goal]').fill('Changed brief requires new allowance and cannot silently retry.')
   await expect(canvas.get_by_role('button',name='Research an opportunity',exact=True)).to_be_disabled()
   assert not errors,errors
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   report.append({'width':width,'failureShowsNoFixture':True,'sameIdAndBody':True,'lookupOnlyRecoveryHeader':True,'typeSafeSelectionFrozenAcrossAvailabilityChange':True,'recoveryEnabledWhenAllowanceExhausted':True,'changedBriefBlocked':True,'interceptedPosts':len(posts),'providerCalls':0,'errors':errors})
   await context.close()
  await browser.close()
 (OUT/'browser-report.json').write_text(json.dumps(report,indent=2))
asyncio.run(main())

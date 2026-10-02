"""Intercepted UI regressions: no real research or database calls."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path(__file__).parent
async def main():
 report=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='chrome')
  for width in [375,1440]:
   for case in ['429_missing','abort_missing','network_pending']:
    context=await browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce')
    page=await context.new_page();posts=[];modes=[];first_started=asyncio.Event();release=asyncio.Event()
    async def mock(route):
     if route.request.method=='GET':await route.fulfill(json={'ready':not posts,'typesafeReady':False,'message':'Mocked availability'})
     else:
      posts.append(route.request.post_data_json);modes.append(route.request.headers.get('x-pursuit-recovery'));first_started.set()
      if len(posts)==1:
       if case=='429_missing':await route.fulfill(status=429,json={'code':'client_limit','error':'Mocked rejected admission.'})
       elif case=='network_pending':await route.abort('failed')
       else:
        await release.wait()
        try:await route.fulfill(status=503,json={'code':'research_unavailable','error':'Mocked delayed response.'})
        except Exception:pass # Browser already aborted its wait; no live server involved.
      elif case=='network_pending':await route.fulfill(status=409,json={'code':'pending','error':'This request is still being handled. Recover the same brief later.'})
      else:await route.fulfill(status=409,json={'code':'not_found','error':'No saved request was found. Recovery has not started research.'})
    await page.route('**/api/pursuit/research',mock)
    await page.goto('http://127.0.0.1:3164/pursuit',wait_until='networkidle');await page.wait_for_timeout(1000)
    canvas=page.locator('#try-pursuit')
    await canvas.get_by_label('Company or sector',exact=True).fill('assembl.co.nz')
    await canvas.get_by_label('What should the agent investigate?',exact=True).fill('Fictional independent consultancy public research brief.')
    await canvas.locator('input[type=checkbox]').first.check()
    await canvas.get_by_role('button',name='Research an opportunity',exact=True).click();await first_started.wait()
    if case=='abort_missing':await canvas.get_by_role('button',name='Stop waiting',exact=True).click()
    first_heading='Research was not started.' if case=='429_missing' else 'Request status is unknown.'
    await expect(canvas.get_by_role('heading',name=first_heading,exact=True)).to_be_visible()
    await expect(canvas.get_by_role('heading',name='No verified research result.',exact=True)).to_have_count(0)
    release.set()
    await canvas.get_by_role('button',name='Recover this request',exact=True).click()
    recovered_heading='Research is still running.' if case=='network_pending' else 'No saved request found.'
    await expect(canvas.get_by_role('heading',name=recovered_heading,exact=True)).to_be_visible()
    await expect(canvas.get_by_role('region',name='Pursuit illustrated walkthrough')).to_have_count(0)
    assert posts[0]==posts[1] and modes==[None,'lookup-only'],(posts,modes)
    await canvas.screenshot(path=str(OUT/f'{case}-{width}.png'))
    report.append({'width':width,'case':case,'initialHeading':first_heading,'recoveryHeading':recovered_heading,'sameFrozenBody':True,'lookupOnlyRecovery':True,'fixtureAsResult':False,'providerCalls':0})
    await context.close()
  await browser.close()
 (OUT/'browser-admission-report.json').write_text(json.dumps(report,indent=2))
asyncio.run(main())

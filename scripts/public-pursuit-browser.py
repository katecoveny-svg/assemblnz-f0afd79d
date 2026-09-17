"""Local-build UI proof. Research POST is mocked: this does not prove a provider call."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path('visual-evidence/public-pursuit');OUT.mkdir(parents=True,exist_ok=True)
fixture={'mode':'live','draft':{'company':'Example NZ business','title':'A source-backed proposal','summary':'Prepare a customer-facing explanation and small demonstrator for review.','evidence':[{'claim':'This fictional fixture validates the evidence layout, not a business claim.','url':'https://www.nzbn.govt.nz/'}],'opportunity':'Propose a clearer way to prepare customer questions before a conversation.','proposedWork':'Prepare a source brief and demonstrator for a person to review.','deliverables':['A source brief','A working demonstrator'],'nextSteps':['Review the sources','Agree one test'],'unknowns':['Budget and demand have not been established']},'trace':{'id':'00000000-0000-4000-8000-000000000001','at':'2026-09-18T00:00:00Z','model':'test-fixture-not-provider','webSearches':1,'knowledgeIds':['pursuit'],'sources':[{'url':'https://www.nzbn.govt.nz/','title':'Fixture','retrievedAt':'2026-09-18'}],'typesafe':{'status':'not_requested'}},'warning':'UI fixture only'}
async def main():
  report=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch()
    for width in [375,1440]:
      ctx=await browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce',accept_downloads=True)
      page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      async def mock(route):
        if route.request.method=='GET':await route.fulfill(json={'ready':True,'typesafeReady':False})
        else:await route.fulfill(json=fixture)
      await page.route('**/api/pursuit/research',mock)
      await page.goto('http://127.0.0.1:3000/',wait_until='domcontentloaded')
      canvas=page.locator('#try-pursuit');await canvas.scroll_into_view_if_needed()
      await canvas.get_by_label('Company or sector',exact=True).fill('Example NZ business')
      await canvas.get_by_label('What should the agent investigate?',exact=True).fill('Research a useful customer service proposal from public sources.')
      await canvas.locator('input[type=checkbox]').first.check()
      await canvas.get_by_role('button',name='Research an opportunity').click()
      await expect(canvas.get_by_role('heading',name='A source-backed proposal')).to_be_visible()
      await canvas.get_by_role('button',name='proposal',exact=True).click()
      await expect(canvas.get_by_text(fixture['draft']['opportunity'],exact=True)).to_be_visible()
      await page.screenshot(path=str(OUT/f'canvas-{width}.png'),timeout=60000)
      await canvas.get_by_role('button',name='plan',exact=True).click()
      await expect(canvas.get_by_text('Budget and demand have not been established',exact=True)).to_be_visible()
      await expect(canvas.get_by_role('button',name='Export the pitch')).to_be_disabled()
      await canvas.get_by_label('I have reviewed the evidence',exact=False).check()
      async with page.expect_download() as down:
        await canvas.get_by_role('button',name='Export the pitch').click()
      downloaded=await down.value;await downloaded.save_as(OUT/f'pitch-fixture-{width}.html')
      assert not errors,errors
      assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
      report.append({'width':width,'UI':'passed with mocked research','providerCall':False,'errors':errors})
      await ctx.close()
    request=await p.request.new_context(base_url='http://127.0.0.1:3000')
    r=await request.get('/api/knowledge/search?q=pursuit');data=await r.json();assert r.status==200 and data['records'] and data['privateKnowledge']==False
    m=await request.post('/api/knowledge/mcp',data={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'search_assembl_public_knowledge','arguments':{'query':'Studio'}}});payload=await m.json();assert payload['result']['structuredContent']['records']
    status=await request.get('/api/pursuit/research');assert not (await status.json())['ready']
    report.append({'publicKnowledge':'passed','MCP':'passed','unconfiguredTrial':'correctly unavailable'})
    await request.dispose();await browser.close()
  (OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
asyncio.run(main())

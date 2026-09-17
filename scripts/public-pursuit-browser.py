"""Browser evidence for the real UI, with an explicitly mocked provider result.
Protocol/availability calls use the built local server. No live provider costs.
"""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path('visual-evidence/public-pursuit');OUT.mkdir(parents=True,exist_ok=True)
ORIGIN='http://127.0.0.1:3000'
DRAFT={'company':'Fictional test company','title':'A clearer next step for the customer','summary':'A fictional test result used to verify the research canvas and deck export.','evidence':[{'claim':'The test fixture supplies this public source link.','url':'https://example.com/'}],'opportunity':'Propose a small explanation of the next customer step.','proposedWork':'Prepare a source-linked demonstrator for a person to review.','deliverables':['An opportunity brief','A draft demonstrator'],'nextSteps':['Review the original source','Ask which step causes difficulty'],'unknowns':['Demand and budget have not been established.']}
FIXTURE={'mode':'live','draft':DRAFT,'trace':{'id':'72b1797b-420a-4c56-a6bf-cf74832c948e','at':'2026-09-18T00:00:00Z','model':'test-fixture-not-a-provider','providerCalls':1,'webSearches':1,'knowledgeIds':['pursuit','studio'],'sources':[{'url':'https://example.com/','title':'Test source','retrievedAt':'2026-09-18'}],'inputTokens':0,'outputTokens':0,'typesafe':{'status':'not_requested'},'persisted':True},'warning':'TEST FIXTURE. No live search or private record access occurred.'}
async def main():
 report={'providerMode':'mocked for UI only','checks':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  api=await p.request.new_context()
  status=await api.get(ORIGIN+'/api/pursuit/research');s=await status.json();assert status.status==200 and s['ready'] is False
  report['checks'].append('Unconfigured local API reports unavailable')
  knowledge=await api.get(ORIGIN+'/api/knowledge/search?q=studio');k=await knowledge.json();assert k['results'] and k['charged'] is False and k['privateKnowledgeSearched'] is False
  mcp=await api.post(ORIGIN+'/api/knowledge/mcp',headers={'Content-Type':'application/json','Accept':'application/json,text/event-stream'},data=json.dumps({'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'search_assembl_public_knowledge','arguments':{'query':'Studio'}}}));m=await mcp.json();assert m['result']['structuredContent']['results'];report['checks'].append('Real local public knowledge and MCP retrieval')
  for width in [375,1440]:
   ctx=await browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce',accept_downloads=True)
   page=await ctx.new_page()
   await page.goto(ORIGIN,wait_until='domcontentloaded');await page.locator('#try-pursuit').scroll_into_view_if_needed();await expect(page.get_by_text('Live research is not enabled on this deployment',exact=True)).to_be_visible();await page.screenshot(path=str(OUT/f'canvas-{width}-unavailable.png'))
   async def mock(route):
    if route.request.method=='GET':await route.fulfill(json={'ready':True,'typesafeReady':False,'limits':{'globalDaily':5,'perClientDaily':1}})
    else:await route.fulfill(json=FIXTURE)
   await page.route('**/api/pursuit/research',mock)
   await page.reload(wait_until='domcontentloaded');canvas=page.locator('#try-pursuit');await canvas.scroll_into_view_if_needed()
   await canvas.get_by_label('Company or sector',exact=True).fill('Fictional test company');await canvas.get_by_label('What could you help them do?',exact=True).fill('Prepare a fictional browser test of the opportunity canvas.');await canvas.locator('input[type=checkbox]').first.check();await canvas.get_by_role('button',name='Research this opportunity').click();await expect(canvas.get_by_text(DRAFT['title'],exact=True)).to_be_visible();await page.screenshot(path=str(OUT/f'canvas-{width}-mock-result.png'))
   async with page.expect_download() as download_info:await canvas.get_by_role('button',name='Download pitch deck').click()
   download=await download_info.value;await download.save_as(str(OUT/f'test-pitch-{width}.html'))
   text=(OUT/f'test-pitch-{width}.html').read_text();assert text.count('class="slide"')==6 and '<script>' not in text
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
   report['checks'].append(f'{width}px form, consent, fixture rendering, source link and six-slide export')
   deck=await ctx.new_page();await deck.set_content(text);await deck.screenshot(path=str(OUT/f'deck-{width}.png'));await ctx.close()
  page=await browser.new_page(viewport={'width':1200,'height':900});await page.goto(ORIGIN+'/tools/agents');await expect(page.get_by_text('Useful knowledge.')).to_be_visible();await page.screenshot(path=str(OUT/'agent-access.png'))
  await api.dispose();await browser.close()
 (OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
asyncio.run(main())

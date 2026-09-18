"""Verify actual embedded DO context handoff and media navigation without live providers."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE='http://127.0.0.1:3000'
OUT=Path('visual-evidence/do-focus')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':900,'height':900},reduced_motion='reduce');posts=[]
  async def api(r):
   if r.request.method=='POST':posts.append(r.request.url)
   await r.fulfill(status=200,content_type='application/json',body=json.dumps({'signedIn':False,'availability':{'note':'Embedded UI fixture; no provider.'},'enabled':False,'configured':False}))
  await ctx.route('**/api/**',api)
  page=await ctx.new_page()
  await page.set_content('<iframe title="Embedded DO" src="'+BASE+'/do/widget" style="width:375px;height:850px;border:0"></iframe>')
  frame=page.frame_locator('iframe')
  await expect(frame.get_by_role('heading',name='What needs doing?')).to_be_visible()
  await page.evaluate("document.querySelector('iframe').contentWindow.postMessage({type:'assembl-do:context',text:'Reviewed example text from the host. Please prepare a reply.',title:'Host fixture',url:'https://example.test/page'},'http://127.0.0.1:3000')")
  await expect(frame.locator('#do-source')).to_have_value('Reviewed example text from the host. Please prepare a reply.')
  await expect(frame.get_by_role('checkbox',name='Use this text for this preparation.',exact=False)).not_to_be_checked()
  await frame.get_by_role('button',name='Talk',exact=True).click()
  link=frame.get_by_role('link',name='Open voice in a full window',exact=True)
  await expect(link).to_have_attribute('target','_blank');await expect(link).to_have_attribute('href','/do/widget?tool=talk')
  await frame.get_by_role('button',name='Look',exact=True).click()
  await expect(frame.get_by_role('link',name='Open vision in a full window',exact=True)).to_have_attribute('target','_blank')
  await expect(frame.get_by_role('link',name='Meet',exact=True)).to_have_attribute('target','_blank')
  await frame.get_by_text('More',exact=False).first.click()
  await expect(frame.get_by_role('link',name='Saved tasks',exact=True)).to_have_attribute('target','_blank')
  assert not posts,posts
  await page.screenshot(path=str(OUT/'workspace-embedded-375.png'))
  await page.goto(BASE+'/do/meetings')
  duration=await page.locator('[class*="recordRing"]').first.evaluate("e=>getComputedStyle(e).animationDuration")
  assert duration in ['0s','0s, 0s'],duration
  await page.get_by_role('link',name='DO workspace',exact=True).click()
  await page.get_by_role('button',name='Talk',exact=True).click()
  await expect(page.get_by_role('region',name='Talk to DO',exact=True)).to_be_visible()
  assert not posts,posts
  (OUT/'embedded-report.json').write_text(json.dumps({'actualNextUI':True,'hostContextRequiresFreshConsent':True,'mediaUsesFullWindowWhenEmbedded':True,'topLevelStaysInApp':True,'reducedMotion':'passed','providerPosts':0},indent=2))
  await b.close()
asyncio.run(main())

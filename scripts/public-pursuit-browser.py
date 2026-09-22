"""Local-build UI proof. Research POST is mocked: this does not prove a provider call."""
import asyncio,json,base64,struct
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
      # New website-to-outreach flow: explicit fixture, no live provider claim.
      outreach_fixture=json.loads(json.dumps(fixture))
      outreach_fixture['campaign']={'seller':{'name':'Fixture seller','website':'https://seller.example.com/','offer':'A fictional business service used only for this UI test.'},'market':'Fictional businesses for UI testing','prospects':[{'company':'Fixture prospect','website':'https://buyer.example.com/','buyerRole':'Operations manager','signal':{'claim':'A fictional public service announcement for UI verification.','url':'https://buyer.example.com/news','publishedAt':None},'fit':'The published service may fit the proposed offer.','hypothesis':'Could a small walkthrough help the team?','proof':'Propose a focused service walkthrough.','contactUrl':None,'unknowns':['Buyer and contact permission are not established.'],'subject':'A proposed walkthrough','opening':'Your service announcement prompted a question. Would a short walkthrough help?','followUp':'Possible later follow-up: would an outline be useful?'}],'gaps':['Test fixture only; no contact is verified.']}
      outreach_fixture['trace']['sources']=[{'url':u,'title':'UI fixture','retrievedAt':'2026-09-22'} for u in ['https://seller.example.com/','https://buyer.example.com/','https://buyer.example.com/news']]
      await page.unroute('**/api/pursuit/research')
      async def outreach_mock(route):
        if route.request.method=='GET':await route.fulfill(json={'ready':True,'typesafeReady':False})
        else:
          body=route.request.post_data_json
          assert body['workflow']=='website_outreach' and body['consent']==True
          await route.fulfill(json=outreach_fixture)
      await page.route('**/api/pursuit/research',outreach_mock)
      await page.goto('http://127.0.0.1:3000/pursuit',wait_until='domcontentloaded')
      await page.screenshot(path=str(OUT/f'pursuit-hero-{width}.png'),timeout=60000)
      await page.locator('#pursuit-canvas').scroll_into_view_if_needed()
      await page.screenshot(path=str(OUT/f'pursuit-sources-{width}.png'),timeout=60000)
      await page.get_by_role('button',name='03 Proposal',exact=False).click()
      await expect(page.get_by_role('heading',name='An evidence brief. A proposal to review.')).to_be_visible()
      outreach=page.locator('#website-outreach')
      await outreach.get_by_role('button',name='Use Assembl as an example').click()
      await expect(outreach.get_by_label('Your business website',exact=True)).to_have_value('https://www.assembl.co.nz')
      await expect(outreach.get_by_label('Who would you like to work with? (optional)',exact=True)).to_have_value('')
      await outreach.scroll_into_view_if_needed()
      await outreach.get_by_label('Your business website',exact=True).fill('https://seller.example.com/')
      await outreach.get_by_label('Who would you like to work with? (optional)',exact=True).fill('Find businesses for a fictional service pilot.')
      await expect(outreach.get_by_role('button',name='Find prospects')).to_be_disabled()
      await outreach.get_by_label('Research these public details',exact=False).check()
      await outreach.get_by_role('button',name='Find prospects').click()
      await expect(outreach.get_by_role('heading',name='Fixture seller',exact=True)).to_be_visible()
      export_button=outreach.get_by_role('button',name='Download reviewed outreach')
      await expect(export_button).to_be_disabled()
      review=outreach.get_by_label('I have reviewed these exact drafts',exact=False)
      await review.check()
      await expect(export_button).to_be_enabled()
      await outreach.get_by_label('Opening message',exact=True).fill('Edited message for the UI verification fixture only.')
      await expect(export_button).to_be_disabled()
      await review.check()
      async with page.expect_download() as outreach_down:
        await export_button.click()
      artifact=await outreach_down.value
      await artifact.save_as(OUT/f'outreach-fixture-{width}.txt')
      assert 'NOT SENT' in (OUT/f'outreach-fixture-{width}.txt').read_text()
      await outreach.scroll_into_view_if_needed()
      await page.screenshot(path=str(OUT/f'outreach-{width}.png'),timeout=60000)
      assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
      await outreach.get_by_label('Your business website',exact=True).fill('different.example.com')
      await expect(outreach.get_by_role('heading',name='Fixture seller',exact=True)).to_have_count(0)
      assert not errors,errors
      report.append({'width':width,'websiteOutreach':'review, edit invalidation, export and changed-brief reset passed','providerCall':False})
      # Assembl maker: actual canvas exports; provider response is a labelled fixture.
      generation_requests=[]
      asset=base64.b64encode(Path('public/do/world/atelier-poster.png').read_bytes()).decode()
      async def image_mock(route):
        body=route.request.post_data_json
        assert body['brandProfile']=='assembl-2026-09' and body['count']==1
        assert body['referenceDataUrl'].startswith('data:image/jpeg;base64,')
        assert len(base64.b64decode(body['referenceDataUrl'].split(',')[1]))>1000
        generation_requests.append(body)
        await route.fulfill(json={'images':['data:image/png;base64,'+asset],'remaining':2})
      await page.route('**/api/creative/image',image_mock)
      await page.goto('http://127.0.0.1:3000/creative-studio/assembl',wait_until='domcontentloaded')
      design=page.get_by_role('region',name='Design a post',exact=True)
      await design.get_by_label('headline',exact=False).fill('Good work comes together.')
      for label,dimensions in [('LinkedIn 1200 × 627',(1200,627)),('square 1080 × 1080',(1080,1080)),('portrait 1080 × 1350',(1080,1350)),('story 1080 × 1920',(1080,1920))]:
        await design.get_by_role('button',name=label,exact=True).click()
        async with page.expect_download() as png:
          await design.get_by_role('button',name='download PNG',exact=True).click()
        file=await png.value
        target=OUT/f'studio-{width}-{dimensions[0]}x{dimensions[1]}.png'
        await file.save_as(target)
        assert struct.unpack('>II',target.read_bytes()[16:24])==dimensions
      await design.get_by_role('button',name='LinkedIn 1200 × 627',exact=True).click()
      await page.screenshot(path=str(OUT/f'studio-post-{width}.png'),full_page=True,timeout=60000)
      assert not generation_requests
      await page.get_by_role('button',name='02 / Prepare an image',exact=True).click()
      image_maker=page.get_by_role('region',name='Prepare an image',exact=True)
      await image_maker.get_by_role('button',name='generate on-brand image',exact=True).click()
      await expect(image_maker.get_by_role('heading',name='generated draft',exact=True)).to_be_visible()
      assert len(generation_requests)==1
      await page.screenshot(path=str(OUT/f'studio-image-{width}.png'),full_page=True,timeout=60000)
      await image_maker.get_by_role('button',name='Use image in my post',exact=True).click()
      await expect(design).to_be_visible()
      await expect(design.get_by_label('headline',exact=False)).to_have_value('Good work comes together.')
      assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
      assert not errors,errors
      report.append({'width':width,'AssemblStudio':'four PNG sizes, explicit generation, image-to-post handoff and preserved editable headline passed','providerCall':False})
      await ctx.close()
    request=await p.request.new_context(base_url='http://127.0.0.1:3000')
    r=await request.get('/api/knowledge/search?q=pursuit');data=await r.json();assert r.status==200 and data['records'] and data['privateKnowledge']==False
    m=await request.post('/api/knowledge/mcp',data={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'search_assembl_public_knowledge','arguments':{'query':'Studio'}}});payload=await m.json();assert payload['result']['structuredContent']['records']
    status=await request.get('/api/pursuit/research');assert not (await status.json())['ready']
    report.append({'publicKnowledge':'passed','MCP':'passed','unconfiguredTrial':'correctly unavailable'})
    await request.dispose();await browser.close()
  (OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
asyncio.run(main())

"""Actual Next/Studio UI proof with CI-generated component and synthetic transport only."""
import asyncio, json, os, re, hashlib, subprocess
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright, expect
ORIGIN=os.environ.get('ASSEMBL_REVIEW_ORIGIN','http://127.0.0.1:3000')
OUT=Path('visual-evidence/studio-ci'); OUT.mkdir(parents=True,exist_ok=True)
FIXTURE='/studio-ci-fixture'
ID='00000000-0000-4000-8000-000000000011'
REPORT={'checkedSha':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'componentSha256':hashlib.sha256(Path('components/client-hub-migration/original/app/hub/concept-studio.tsx').read_bytes()).hexdigest(),'fixtureOnly':True,'accountPersistenceProven':False,'ownerAuthenticationProven':False,'providerCalls':0,'cases':[]}
async def mode(page,value): await page.evaluate('(v)=>window.__studioCi.mode=v',value)
async def posts(page): return await page.evaluate("window.__studioCi.requests.filter(r=>r.method==='POST')")
async def close_panel(page):
    button=page.get_by_role('button',name='Close panel',exact=True)
    if await button.count(): await button.click()
async def fresh(page):
    await page.goto(ORIGIN+FIXTURE,wait_until='domcontentloaded')
    await page.get_by_label('Target company',exact=True).wait_for()
async def brief(page):
    await page.get_by_label('Target company',exact=True).fill('FICTIONAL Independent Company')
    await page.get_by_label('Starting point',exact=True).select_option('prospect')
    await page.get_by_label('Audience',exact=True).select_option('GM')
    await page.get_by_label('Position this piece for',exact=True).select_option('Both')
    await page.get_by_label('Job advertisement or prospect brief',exact=True).fill('FICTIONAL authored brief: demonstrate a useful selected project handoff for a GM.')
    await page.get_by_role('button',name='Use this brief',exact=True).click()
async def backup(page,name):
    await close_panel(page)
    await page.get_by_role('button',name='My concepts',exact=True).click()
    async with page.expect_download() as pending:
        await page.get_by_role('button',name='Export private backup',exact=True).click()
    download=await pending.value; path=OUT/name; await download.save_as(path)
    await close_panel(page); return json.loads(path.read_text())
async def record(page,name):
    await page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
    REPORT['cases'].append(name)
async def fixture_context(browser,width):
    ctx=await browser.new_context(viewport={'width':width,'height':900},accept_downloads=True,reduced_motion='reduce')
    page=await ctx.new_page();page.set_default_timeout(15000)
    errors=[];api=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    async def network(route):
        u=urlparse(route.request.url)
        if u.netloc!=urlparse(ORIGIN).netloc:
            external.append(route.request.url);await route.abort();return
        if u.path=='/studio/workspace' and route.request.is_navigation_request():
            # Fixture-only reload routing; the production guard is tested separately without this interception.
            await route.fulfill(status=302,headers={'location':FIXTURE+('?' +u.query if u.query else '')});return
        if u.path.startswith('/api/'):
            api.append(route.request.url);await route.abort();return
        await route.continue_()
    await page.route('**/*',network)
    page.on('dialog',lambda d:d.accept())
    await fresh(page)
    await expect(page.get_by_role('note')).to_contain_text('FICTIONAL LOCAL UI VERIFICATION')
    assert await page.locator('[data-nextjs-dialog], nextjs-portal').count()==0
    assert await page.locator('body').inner_text()
    return ctx,page,errors,api,external
async def journey(page,width):
    await brief(page)
    await page.get_by_role('button',name='Review sources',exact=True).click()
    await page.get_by_text('Add a public source extract',exact=True).click()
    await page.get_by_label('Source title',exact=True).fill('FICTIONAL manually pasted public reference')
    await page.get_by_label('Source web link',exact=True).fill('https://example.org/supplied')
    await page.get_by_label('Relevant fact extract',exact=True).fill('FICTIONAL supplied extract, not independently verified')
    await page.get_by_role('button',name='Add source for review',exact=True).click()
    await page.get_by_label('Claim status',exact=True).select_option('source')
    await page.get_by_label('Use in concept and client evidence',exact=True).check()
    await close_panel(page)
    await page.get_by_role('button',name='Add a working idea',exact=True).click()
    await page.get_by_label('Concept headline',exact=True).fill('FICTIONAL useful manual concept')
    await close_panel(page)
    await page.get_by_role('button',name=re.compile('Develop ideas')).click()
    handle=page.get_by_role('button',name=re.compile('Move The idea'))
    await handle.wait_for();before=await handle.locator('..').get_attribute('style');box=await handle.bounding_box();assert box
    await handle.scroll_into_view_if_needed();box=await handle.bounding_box()
    x=max(5,min(width-50,box['x']+20));y=box['y']+12
    await page.mouse.move(x,y);await page.mouse.down()
    await page.mouse.move(x+25,y+20,steps=5);await page.mouse.up()
    pointer=await handle.locator('..').get_attribute('style');assert pointer!=before
    await handle.focus();await handle.press('ArrowRight');after=await handle.locator('..').get_attribute('style');assert after!=pointer
    REPORT.setdefault('canvasMoves',[]).append({'width':width,'before':before,'after':after,'pointerAndKeyboard':True})
    await page.get_by_role('button',name='Try the concept',exact=True).click()
    await expect(page.get_by_title('Client demonstrator')).to_be_visible()
    await page.get_by_role('button',name='Prepare the pitch',exact=True).click()
    await expect(page.get_by_text('FICTIONAL useful manual concept',exact=True).first).to_be_visible()
    await mode(page,'lost');await page.locator('.cs-save').click()
    await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible()
    submitted=(await posts(page))[0]['body'];assert submitted['revision']==0
    stable=parse_qs(urlparse(page.url).query)['id'][0];assert stable==submitted['id']
    await close_panel(page);await page.locator('.cs-save').click()
    assert len(await posts(page))==1
    await close_panel(page);await page.get_by_role('button',name=re.compile('The opportunity')).click()
    await page.get_by_label('Section headline',exact=True).fill('FICTIONAL newer unsaved direction')
    await page.get_by_role('button',name='My concepts',exact=True).click()
    await mode(page,'ack');await page.get_by_role('button',name='Retry original create',exact=True).click()
    await expect(page.get_by_text('Hub saved to your private workspace.',exact=False)).to_be_visible()
    requests=await posts(page);assert requests[1]['body']==submitted and len(requests)==2
    assert await page.evaluate('window.__studioCi.records()[0].revision')==1
    await close_panel(page)
    retained=await backup(page,f'newer-{width}.json')
    assert retained['design']['frame']['content']['headline']=='FICTIONAL newer unsaved direction'
    assert retained['engine']['board']==submitted['payload']['engine']['board']
    # Later updates use the acknowledged revision; explicit reopen releases the old uncertain update.
    await mode(page,'lost');await page.locator('.cs-save').click()
    await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible()
    await page.get_by_role('button',name='Refresh saved projects',exact=True).click()
    await page.get_by_role('button',name=re.compile('Open saved .*revision 2')).click()
    await close_panel(page);await mode(page,'ack');await page.locator('.cs-save').click()
    await expect(page.get_by_text('Hub saved to your private workspace.',exact=False)).to_be_visible()
    assert (await posts(page))[-1]['body']['revision']==2
    await page.reload();await page.locator('.cs-save').wait_for()
    await record(page,f'journey-recovery-{width}')
    return submitted
async def missing(page,width):
    await page.evaluate("sessionStorage.removeItem('FICTIONAL-STUDIO-CI-RECORDS')")
    await fresh(page);await brief(page);await mode(page,'missing');await page.locator('.cs-save').click()
    await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible()
    first=(await posts(page))[-1]['body']
    await page.get_by_role('button',name='Read/reconcile this project ID',exact=True).click()
    await expect(page.get_by_text('FICTIONAL missing row',exact=True)).to_be_visible()
    await mode(page,'ack');await page.get_by_role('button',name='Retry original create',exact=True).click()
    assert (await posts(page))[-1]['body']==first
    await close_panel(page)
    # Refresh losing the original capture must never reconstruct/create it.
    await page.evaluate("sessionStorage.removeItem('FICTIONAL-STUDIO-CI-RECORDS')")
    await page.reload();await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible()
    assert await page.get_by_role('button',name='Retry original create',exact=True).count()==0
    assert len(await posts(page))==0
    await page.get_by_role('button',name='Start a separate project',exact=True).click()
    await expect(page.get_by_label('Target company',exact=True)).to_be_visible()
    assert len(await posts(page))==0
    await record(page,f'missing-refresh-{width}')
async def legacy_export(page,width):
    await page.evaluate('(id)=>window.__studioCi.seed(id,"quarantine")',ID)
    await page.goto(ORIGIN+FIXTURE+'?id='+ID,wait_until='domcontentloaded')
    await page.get_by_title('Client demonstrator').wait_for()
    html=await page.get_by_title('Client demonstrator').get_attribute('srcdoc')
    assert 'CREATIVE_TITLE_SENTINEL' not in html and 'CREATIVE_CLAIM_SENTINEL' not in html
    assert 'FICTIONAL factual reference' in html
    await page.get_by_role('button',name=re.compile('The opportunity')).click()
    original=await page.get_by_label('What do you want to demonstrate?',exact=True).input_value();assert len(original)>4700
    # Reject replacement confirmation; original full Hub must survive.
    page.remove_all_listeners('dialog');page.on('dialog',lambda d:d.dismiss())
    await page.get_by_role('button',name='Prepare a replacement job or prospect brief',exact=True).click()
    await page.get_by_label('Job advertisement or prospect brief',exact=True).fill('FICTIONAL proposed replacement brief')
    await page.get_by_role('button',name='Use this brief',exact=True).click()
    await page.get_by_role('button',name='Keep the existing brief',exact=True).click()
    assert await page.get_by_label('What do you want to demonstrate?',exact=True).input_value()==original
    page.remove_all_listeners('dialog');page.on('dialog',lambda d:d.accept())
    for label,value in [('Campaign objective','FICTIONAL bounded handoff'),('Content audience','FICTIONAL GM'),('Core proposition','FICTIONAL useful proposed workflow'),('Brand voice','Plain supplied draft'),('Call to action','Review the fictional pilot')]:
        await page.get_by_label(label,exact=True).fill(value)
    await page.get_by_role('button',name='Create local channel templates',exact=True).click()
    await page.get_by_text('Original draft context receipt',exact=True).click()
    receipt=await page.locator('details').filter(has=page.get_by_text('Original draft context receipt',exact=True)).locator('pre').inner_text()
    context=json.loads(receipt);assert [s['id'] for s in context['sources']]==['factual']
    await page.get_by_label('Intended audience description',exact=True).fill('FICTIONAL GM reviewing a proposed handoff')
    for format in ['text','json']:
        await page.get_by_label('Draft file format',exact=True).select_option(format)
        await page.get_by_role('button',name='Preview exact draft bytes',exact=True).click()
        preview=page.get_by_label('Exact draft bytes',exact=True);await preview.wait_for();text=await preview.text_content()
        assert 'CREATIVE_TITLE_SENTINEL' not in text and 'CREATIVE_CLAIM_SENTINEL' not in text and 'PRIVATE_BACKUP_SENTINEL' not in text
        assert 'FICTIONAL factual reference' in text
        await page.get_by_label('I reviewed these exact bytes for this audience',exact=True).check()
        async with page.expect_download() as pending:await page.get_by_role('button',name='Download reviewed draft',exact=True).click()
        download=await pending.value;path=OUT/f'presentation-{width}.{format}';await download.save_as(path)
        assert path.read_text()==text
    before_edit=await backup(page,f'legacy-before-edit-{width}.json')
    assert before_edit['engine']['concepts'][0]['title']=='FICTIONAL preserved legacy idea'
    assert before_edit['engine']['brief']==original and before_edit['privateNotes']=='PRIVATE_BACKUP_SENTINEL'
    assert any(s['id']=='creative-bound' for s in before_edit['sources'])
    # Current Hub change invalidates reviewed bytes and synchronizes the selected concept title.
    await page.get_by_label('Section headline',exact=True).fill('FICTIONAL edited after preview')
    assert await page.get_by_role('button',name='Download reviewed draft',exact=True).count()==0
    saved=await backup(page,f'legacy-full-{width}.json')
    assert saved['engine']['brief']==original and saved['privateNotes']=='PRIVATE_BACKUP_SENTINEL'
    assert any(s['id']=='creative-bound' for s in saved['sources'])
    assert saved['engine']['concepts'][0]['title']=='FICTIONAL edited after preview'
    assert saved['engine']['board']==before_edit['engine']['board']
    assert saved['sources']==before_edit['sources']
    await record(page,f'legacy-export-quarantine-{width}')
async def interrupted(page):
    await page.evaluate('(id)=>window.__studioCi.seed(id,"legacy")',ID)
    await page.goto(ORIGIN+FIXTURE+'?id='+ID,wait_until='domcontentloaded');await page.locator('.cs-save').wait_for()
    await mode(page,'lost');await page.locator('.cs-save').click()
    await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible()
    await mode(page,'hang-body');await page.get_by_role('button',name='Read/reconcile this project ID',exact=True).click()
    await expect(page.get_by_role('button',name='Start a separate project',exact=True)).to_be_enabled(timeout=26000)
    await page.get_by_role('button',name='Start a separate project',exact=True).click()
    await page.get_by_label('Target company',exact=True).wait_for()
    await page.evaluate('window.__studioCi.release()')
    await expect(page.get_by_label('Target company',exact=True)).to_have_value('Your client')
    await record(page,'hung-body-project-switch')
    await brief(page);await mode(page,'hang-post');await page.locator('.cs-save').click()
    await expect(page.get_by_role('alert').filter(has_text='Save outcome uncertain')).to_be_visible(timeout=26000)
    count=len(await posts(page));await page.get_by_role('button',name='Start a separate project',exact=True).click()
    await mode(page,'ack');await page.evaluate('window.__studioCi.release()')
    await expect(page.get_by_label('Target company',exact=True)).to_have_value('Your client')
    assert len(await posts(page))==count
    await record(page,'hung-post-late-result')
async def guard(browser,submitted):
    # No fixture document/API interception in this context; actual production routes.
    ctx=await browser.new_context();page=await ctx.new_page()
    response=await page.goto(ORIGIN+'/studio/workspace',wait_until='domcontentloaded')
    assert response.status==404
    assert await page.locator('[data-owner-workspace]').count()==0
    get=await ctx.request.get(ORIGIN+'/api/client-hub-migration/owner');assert get.status==404
    body={**submitted,'revision':1}
    post=await ctx.request.post(ORIGIN+'/api/client-hub-migration/owner',data=body,headers={'Origin':ORIGIN})
    assert post.status==404
    REPORT['productionGuard']={'page':response.status,'get':get.status,'post':post.status,'noSession':True,'fixtureIntercepted':False,'authActivationProven':False}
    await page.screenshot(path=str(OUT/'real-owner-route-closed.png'));await ctx.close()
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        try:
            submitted=None
            for width in [1440,375]:
                ctx,page,errors,api,external=await fixture_context(browser,width)
                try:
                    submitted=await journey(page,width)
                    await missing(page,width);await legacy_export(page,width)
                    if width==1440:await interrupted(page)
                    assert not errors,errors;assert not api,api
                    REPORT.setdefault('viewports',[]).append({'width':width,'pageErrors':errors,'unforwardedApiRequests':api,'blockedExternalRequests':external})
                except Exception as e:
                    REPORT['failure']={'width':width,'error':str(e),'pageErrors':errors,'unforwardedApiRequests':api}
                    await page.screenshot(path=str(OUT/f'failure-{width}.png'),full_page=True);raise
                finally:
                    if await page.evaluate('!!window.__studioCi'): (OUT/f'synthetic-transport-{width}.json').write_text(json.dumps(await page.evaluate('window.__studioCi.requests'),indent=2))
                    await ctx.close()
            await guard(browser,submitted)
        finally:
            (OUT/'assertions.json').write_text(json.dumps(REPORT,indent=2));await browser.close()
if __name__=='__main__':asyncio.run(main())

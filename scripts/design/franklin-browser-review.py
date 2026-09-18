"""Exercise the real homepage WebGL scene. No sign-in, forms or provider calls."""
import asyncio, json, os
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
from playwright.async_api import async_playwright, expect
OUT=Path('visual-evidence/franklin-browser');OUT.mkdir(parents=True,exist_ok=True)
ORIGIN=os.environ.get('ASSEMBL_ORIGIN','http://127.0.0.1:3000').rstrip('/')
if ORIGIN not in ['http://127.0.0.1:3000','https://www.assembl.co.nz']:
    raise SystemExit('Use only the local review or public assembl origin')

async def read_only(route):
    await (route.continue_() if route.request.method in ['GET','HEAD','OPTIONS'] else route.abort())
async def shot(page,name):
    await page.screenshot(path=str(OUT/(name+'.png')),timeout=60000)
async def facts(page):
    return await page.evaluate('''() => ({
      h1:document.querySelector('h1')?.innerText,
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      navs:document.querySelectorAll('nav[aria-label="Primary"]').length,
      camera:document.querySelector('canvas[data-scene="franklin-v1"]')?.dataset.cameraPosition,
      target:document.querySelector('canvas[data-scene="franklin-v1"]')?.dataset.cameraTarget,
      dogMeshes:document.querySelector('canvas[data-scene="franklin-v1"]')?.dataset.franklinMeshes,
      batches:document.querySelector('canvas[data-scene="franklin-v1"]')?.dataset.sceneBatches,
      poster:document.querySelector('[data-world="franklin"] img')?.currentSrc,
      links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))
    })''')

def image_difference(a,b):
    a=Image.open(a).convert('RGB').resize((360,225));b=Image.open(b).convert('RGB').resize((360,225))
    return sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3

async def main():
    reports=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'])
        for width,height in [(1440,900),(375,812)]:
            context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=width<500,has_touch=width<500,reduced_motion='no-preference')
            await context.route('**/*',read_only)
            page=await context.new_page();errors=[];models=[]
            page.on('pageerror',lambda e,sink=errors:sink.append(str(e)[:600]))
            page.on('response',lambda r,sink=models:sink.append({'url':r.url,'status':r.status}) if '/franklin-v1/office.glb' in r.url else None)
            report={'width':width,'origin':ORIGIN}
            try:
                response=await page.goto(ORIGIN,wait_until='domcontentloaded',timeout=45000)
                assert response.status==200
                canvas=page.locator('canvas[data-franklin-ready="true"]')
                await expect(canvas).to_be_visible(timeout=60000)
                await page.evaluate('document.fonts.ready')
                await page.wait_for_timeout(1700)
                start=await facts(page)
                assert int(start['dogMeshes'])>10,'Missing authored Franklin meshes'
                assert int(start['batches'])<140,'Static geometry batching did not reduce draw-call count'
                assert not start['overflow'] and start['navs']==1
                assert any(x['status']==200 for x in models),'No successful real GLB load'
                for href in ['/pursuit','/do','/creative-studio','https://assembl-pursuit.katecoveny.chatgpt.site/studios','https://assembl-pursuit.katecoveny.chatgpt.site/agency']:
                    assert href in start['links'],'Missing preserved destination: '+href
                await shot(page,f'home-{width}-wide')
                await canvas.screenshot(path=str(OUT/f'canvas-{width}-wide.png'),timeout=60000)
                await page.get_by_role('button',name='View DO scene',exact=True).click()
                await page.wait_for_timeout(3200)
                await expect(page.locator('.franklin-hero')).to_have_attribute('data-chapter','1')
                middle=await facts(page);assert middle['camera']!=start['camera'],'Camera did not move through actual geometry'
                await shot(page,f'home-{width}-workroom')
                await canvas.screenshot(path=str(OUT/f'canvas-{width}-workroom.png'),timeout=60000)
                await page.get_by_role('button',name='View Studio scene',exact=True).click()
                await page.wait_for_timeout(3200)
                end=await facts(page);assert end['camera']!=middle['camera']
                await shot(page,f'home-{width}-studio')
                await canvas.screenshot(path=str(OUT/f'canvas-{width}-studio.png'),timeout=60000)
                await page.get_by_role('button',name='Pause scene motion',exact=True).click()
                held=(await facts(page))['camera']
                await page.evaluate('scrollBy(0,60)');await page.wait_for_timeout(800)
                assert (await facts(page))['camera']==held,'Pause did not hold the real camera'
                await page.get_by_role('button',name='Resume scene motion',exact=True).click()
                differences=[image_difference(OUT/f'canvas-{width}-wide.png',OUT/f'canvas-{width}-workroom.png'),image_difference(OUT/f'canvas-{width}-workroom.png',OUT/f'canvas-{width}-studio.png')]
                assert min(differences)>2,'Camera metadata changed but visible scene did not'
                report.update(passed=True,start=start,middle=middle,end=end,pixelDifferences=differences,modelRequests=models,errors=errors)
                assert not errors,'Unhandled browser error'
            except Exception as e:report.update(passed=False,failure=str(e)[:1800],errors=errors)
            reports.append(report);(OUT/'report.json').write_text(json.dumps(reports,indent=2));await context.close()
        for name,options in [('reduced',{'reduced_motion':'reduce'}),('no-js',{'java_script_enabled':False}),('model-failure',{})]:
            ctx=await browser.new_context(viewport={'width':375,'height':812},**options)
            await ctx.route('**/*',read_only)
            if name=='model-failure':await ctx.route('**/franklin-v1/office.glb',lambda r:r.abort())
            page=await ctx.new_page();r={'case':name}
            try:
                await page.goto(ORIGIN,wait_until='domcontentloaded',timeout=45000)
                await page.wait_for_timeout(3000)
                await expect(page.locator('h1')).to_be_visible()
                image=page.locator('[data-world="franklin"] img')
                assert await image.evaluate('(img)=>img.complete&&img.naturalWidth>0'),'Missing real rendered fallback'
                if name=='model-failure':await expect(page.locator('.franklin-hero')).to_have_attribute('data-static','true',timeout=30000)
                if name=='reduced':assert await page.locator('canvas').count()==0
                assert not (await facts(page))['overflow']
                await shot(page,'home-375-'+name);r['passed']=True
            except Exception as e:r.update(passed=False,failure=str(e)[:1200])
            reports.append(r);await ctx.close()
        await browser.close()
    (OUT/'report.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))
    if not all(r.get('passed') for r in reports):raise SystemExit('Franklin browser review failed. Inspect screenshots and report.')
asyncio.run(main())

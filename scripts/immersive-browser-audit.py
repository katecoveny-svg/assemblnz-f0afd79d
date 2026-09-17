"""Read-only public browser review; --local exercises the proposed build.
No sign-in, form submission, credentials, paid generation or external writes.
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright, expect

OUT = Path('visual-evidence')
OUT.mkdir(exist_ok=True)
LOCAL = '--local' in sys.argv
ORIGIN = 'http://127.0.0.1:3000' if LOCAL else 'https://www.assembl.co.nz'
PAGES = [('/', 'home'), ('/pursuit', 'pursuit'), ('/do', 'do'), ('/creative-studio', 'studio')]

async def read_only(route):
    if route.request.method not in ('GET', 'HEAD', 'OPTIONS'):
        await route.abort()
    else:
        await route.continue_()

async def capture(page, name):
    await page.screenshot(path=str(OUT / f'{name}.png'), timeout=90000)

async def hold_scene(page):
    pause = page.get_by_role('button', name='Pause scene motion', exact=True)
    if await pause.count() and await pause.is_enabled():
        await pause.click()
        await page.wait_for_timeout(400)

async def main():
    reports = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for width, height in [(1440, 1000), (375, 812)]:
            context = await browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, is_mobile=width < 500, has_touch=width < 500, reduced_motion='no-preference')
            await context.route('**/*', read_only)
            for path, name in PAGES:
                page = await context.new_page()
                errors = []
                page.on('pageerror', lambda e, sink=errors: sink.append(str(e)[:500]))
                result = {'name': name, 'width': width, 'requested': ORIGIN + path, 'source': 'proposed build' if LOCAL else 'live public site'}
                try:
                    response = await page.goto(ORIGIN + path, wait_until='domcontentloaded', timeout=45000)
                    await page.wait_for_timeout(6000)
                    await page.evaluate('document.fonts.ready')
                    result.update(status=response.status if response else None, final_url=page.url)
                    result['page'] = await page.evaluate('''() => ({
                      title: document.title,
                      h1: [...document.querySelectorAll('h1')].map(e=>e.textContent),
                      overflow: document.documentElement.scrollWidth > innerWidth + 1,
                      primaryNavs: document.querySelectorAll('nav[aria-label="Primary"]').length,
                      canvasCount: document.querySelectorAll('canvas').length,
                      fonts: [...new Set([...document.querySelectorAll('h1,h2,nav')].map(e=>getComputedStyle(e).fontFamily))],
                      links: [...document.querySelectorAll('a[href]')].filter(e=>e.textContent.trim()).map(e=>({text:e.textContent.trim().slice(0,90),href:e.getAttribute('href')})),
                      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
                    })''')
                    assert not result['page']['overflow'], 'Horizontal page overflow'
                    assert response and response.status == 200, 'Page did not return 200'
                    if name in ('home','pursuit','studio'):
                        assert result['page']['primaryNavs'] == 1, 'Duplicate or missing primary navigation'
                    if name == 'home':
                        await hold_scene(page)
                    await capture(page, f'{name}-{width}-top')
                    if name == 'home' and LOCAL:
                        await page.get_by_role('button', name='View DO scene', exact=True).click()
                        await page.wait_for_timeout(3500)
                        await expect(page.locator('[data-chapter]')).to_have_attribute('data-chapter','1',timeout=10000)
                        await hold_scene(page)
                        await capture(page, f'{name}-{width}-chapter-do')
                        await page.locator('#how-it-works').scroll_into_view_if_needed()
                        await page.locator('#how-it-works button').nth(1).click()
                        await expect(page.locator('#how-it-works h3')).to_have_text('The work takes shape.')
                        await page.wait_for_timeout(1100)
                        await capture(page,f'{name}-{width}-brief-do')
                        await page.get_by_role('slider',name='Work loop stage').focus()
                        await page.get_by_role('slider',name='Work loop stage').press('End')
                        await expect(page.locator('#how-it-works h3')).to_have_text('Now they can see it.')
                        await page.wait_for_timeout(1100)
                        await capture(page,f'{name}-{width}-brief-studio')
                        await page.evaluate('document.querySelector("#products").scrollIntoView({behavior:"instant"})')
                        await page.wait_for_timeout(1200)
                        await capture(page,f'{name}-{width}-products')
                        if width > 1000:
                            await page.locator('article[data-product="do"]').hover(position={'x':24,'y':24})
                            await page.wait_for_timeout(500)
                            result['hoverTransform'] = await page.locator('article[data-product="do"]').evaluate('(e)=>getComputedStyle(e).transform')
                            await capture(page,f'{name}-{width}-hover')
                        for ending in ['/studios','/agency']:
                            assert any(a['href'] == 'https://assembl-pursuit.katecoveny.chatgpt.site' + ending for a in result['page']['links']), 'Missing exact workspace destination'
                        result['interactions'] = ['scene chapter','example buttons','example slider','workspace destinations']
                    elif name == 'studio' and LOCAL:
                        gallery = page.locator('#studio-work')
                        await gallery.scroll_into_view_if_needed()
                        await gallery.locator('[aria-label="Choose a visual example"] button').nth(1).click()
                        await expect(gallery.locator('h3')).to_have_text('An identity with movement.')
                        await capture(page,f'{name}-{width}-motion')
                        await gallery.get_by_role('button',name='Play film',exact=True).click()
                        await expect(gallery.locator('video')).to_be_visible()
                        await gallery.locator('video').evaluate('(e)=>e.pause()')
                        await gallery.locator('[aria-label="Choose a visual example"] button').nth(2).click()
                        await expect(gallery.locator('h3')).to_have_text('A small mark. A whole world.')
                        await capture(page,f'{name}-{width}-identity')
                        result['interactions']=['gallery selection','user-initiated video','identity selection']
                    else:
                        await page.evaluate('window.scrollTo({top:700,behavior:"instant"})')
                        await page.wait_for_timeout(1600)
                        await capture(page,f'{name}-{width}-scroll')
                    result['errors'] = errors
                    assert not errors, 'Unhandled page errors'
                except Exception as e:
                    result['failure'] = str(e)[:1500]
                    result['errors'] = errors
                reports.append(result)
                (OUT/'report.json').write_text(json.dumps(reports, indent=2))
                await page.close()
            await context.close()
        for label, settings in [('reduced',{'reduced_motion':'reduce'}),('no-js',{'java_script_enabled':False})]:
            ctx = await browser.new_context(viewport={'width':375,'height':812}, **settings)
            await ctx.route('**/*',read_only)
            page = await ctx.new_page()
            result={'name':label,'width':375}
            try:
                await page.goto(ORIGIN, wait_until='domcontentloaded', timeout=45000)
                await page.wait_for_timeout(2000)
                await expect(page.locator('h1')).to_be_visible()
                await capture(page,f'home-375-{label}')
                if LOCAL:
                    await expect(page.locator('#products h2')).to_be_visible()
                    await expect(page.locator('article[data-product="do"]')).to_be_visible()
                    assert await page.locator('a[href="https://assembl-pursuit.katecoveny.chatgpt.site/studios"]').count() > 0
                result['passed']=True
            except Exception as e:
                result['failure']=str(e)[:1200]
            reports.append(result)
            await ctx.close()
        await browser.close()
    (OUT/'report.json').write_text(json.dumps(reports,indent=2))
    print(json.dumps(reports,indent=2))
    if any('failure' in r for r in reports):
        raise SystemExit('Browser review needs attention. Inspect report.json and screenshots.')

asyncio.run(main())

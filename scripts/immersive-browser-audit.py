"""Anonymous, read-only browser evidence. Never signs in or submits a form.
Use --local after starting the built app to validate a proposed change.
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path('visual-evidence')
OUT.mkdir(exist_ok=True)
LOCAL = '--local' in sys.argv
ORIGIN = 'http://127.0.0.1:3000' if LOCAL else 'https://www.assembl.co.nz'
PAGES = [('/', 'home'), ('/pursuit', 'pursuit'), ('/do', 'do'), ('/creative-studio', 'studio')]

async def main():
    reports = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for width, height in [(1440, 1000), (375, 812)]:
            context = await browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, is_mobile=width < 500, has_touch=width < 500, reduced_motion='no-preference')
            # Do not submit or mutate anything during a public-site review.
            async def safe_route(route):
                if route.request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    await route.abort()
                else:
                    await route.continue_()
            await context.route('**/*', safe_route)
            for path, name in PAGES:
                page = await context.new_page()
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)[:500]))
                result = {'name': name, 'width': width, 'requested': ORIGIN + path}
                try:
                    response = await page.goto(ORIGIN + path, wait_until='domcontentloaded', timeout=45000)
                    await page.wait_for_timeout(7000)
                    await page.evaluate('document.fonts.ready')
                    result.update(status=response.status if response else None, final_url=page.url)
                    result['page'] = await page.evaluate('''() => ({
                      title: document.title,
                      h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
                      overflow: document.documentElement.scrollWidth > innerWidth + 1,
                      primaryNavs: document.querySelectorAll('nav[aria-label="Primary"]').length,
                      canvasCount: document.querySelectorAll('canvas').length,
                      fonts: [...new Set([...document.querySelectorAll('h1,h2,nav')].map(e => getComputedStyle(e).fontFamily))],
                      links: [...document.querySelectorAll('a[href]')].filter(e=>e.textContent.trim()).map(e=>({text:e.textContent.trim().slice(0,90),href:e.getAttribute('href')})),
                      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
                    })''')
                    await page.screenshot(path=str(OUT / f'{name}-{width}-top.png'))
                    await page.evaluate('window.scrollTo(0, Math.min(700, document.documentElement.scrollHeight - innerHeight))')
                    await page.wait_for_timeout(1500)
                    await page.screenshot(path=str(OUT / f'{name}-{width}-scroll.png'))
                    if name == 'home':
                        await page.evaluate('document.querySelector("#products")?.scrollIntoView()')
                        await page.wait_for_timeout(1400)
                        await page.screenshot(path=str(OUT / f'{name}-{width}-products.png'))
                        await page.screenshot(path=str(OUT / f'{name}-{width}-full.png'), full_page=True)
                    result['errors'] = errors
                except Exception as e:
                    result['failure'] = str(e)[:1200]
                reports.append(result)
                await page.close()
            await context.close()
        # Explicit reduced motion must retain readable content.
        ctx = await browser.new_context(viewport={'width':375,'height':812}, reduced_motion='reduce')
        page = await ctx.new_page()
        try:
            await page.goto(ORIGIN, wait_until='domcontentloaded', timeout=45000)
            await page.wait_for_timeout(3000)
            await page.screenshot(path=str(OUT/'home-375-reduced.png'))
            reports.append({'name':'reduced-motion','h1':await page.locator('h1').all_text_contents()})
        except Exception as e:
            reports.append({'name':'reduced-motion','failure':str(e)[:800]})
        await ctx.close()
        await browser.close()
    (OUT/'report.json').write_text(json.dumps(reports, indent=2))
    print(json.dumps(reports, indent=2))
    if any('failure' in r for r in reports):
        raise SystemExit('A browser capture failed; inspect report.json')

asyncio.run(main())

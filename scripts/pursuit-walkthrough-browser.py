"""Walkthrough UI proof. All research POSTs are blocked; this spends no quota."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, expect

ORIGIN = os.environ.get('ASSEMBL_REVIEW_ORIGIN', 'http://127.0.0.1:3000')
OUT = Path('visual-evidence/pursuit-walkthrough')
OUT.mkdir(parents=True, exist_ok=True)

async def main():
    report = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(args=['--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'], **({'executable_path': os.environ['PLAYWRIGHT_EXECUTABLE_PATH']} if os.environ.get('PLAYWRIGHT_EXECUTABLE_PATH') else {}))
        for width in (375, 1440):
            for motion in ('no-preference', 'reduce'):
                context = await browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion=motion)
                page = await context.new_page()
                errors, posts = [], []
                page.on('pageerror', lambda error: errors.append(str(error)))
                async def research(route):
                    if route.request.method == 'POST':
                        posts.append(route.request.url)
                        await route.abort()
                    else:
                        await route.fulfill(json={'ready': False, 'typesafeReady': False, 'message': 'UI test: research not submitted.'})
                await page.route('**/api/pursuit/research', research)
                for path in ('/', '/pursuit'):
                    await page.goto(ORIGIN + path, wait_until='domcontentloaded', timeout=120000)
                    demo = page.get_by_role('region', name='Pursuit illustrated walkthrough')
                    await expect(demo).to_be_visible(timeout=120000)
                    await expect(demo).to_have_attribute('data-reduced', str(motion == 'reduce').lower())
                    await expect(demo.get_by_text('Illustrated example · no live research', exact=True)).to_be_visible()
                    if path == '/':
                        await expect(page.get_by_role('heading', name='assembl the work.', exact=True)).to_be_attached()
                        await expect(page.locator('#live-data')).to_be_attached()
                        await page.screenshot(path=str(OUT / f'home-{width}-{motion}.png'), full_page=False)
                        scene = page.get_by_role('region', name='assembl the work.', exact=True)
                        if motion == 'reduce':
                            await expect(scene.get_by_role('button', name='Pause scene motion', exact=True)).to_be_disabled()
                            await expect(scene.get_by_label('The complete work loop')).to_be_visible()
                        else:
                            # Exercise native keyboard activation without waiting for two
                            # stable software-WebGL frames (the immersive audit uses this path).
                            pause = scene.get_by_role('button', name='Pause scene motion', exact=True)
                            await pause.focus()
                            await pause.press('Enter')
                            await expect(scene.get_by_role('button', name='Resume scene motion', exact=True)).to_have_attribute('aria-pressed', 'true')
                            await scene.get_by_role('button', name='Resume scene motion', exact=True).press('Enter')
                            await expect(scene.get_by_role('button', name='Pause scene motion', exact=True)).to_have_attribute('aria-pressed', 'false')
                            chapter = scene.get_by_role('button', name='View Studio scene', exact=True)
                            await chapter.focus()
                            await chapter.press('Enter')
                            await expect(scene).to_have_attribute('data-chapter', '2', timeout=30000)
                    await demo.scroll_into_view_if_needed()
                    await demo.get_by_role('button', name='Next walkthrough step', exact=True).click()
                    await expect(demo).to_have_attribute('data-step', '1')
                    # Name spacing is renderer-dependent; use the stable pressed step button.
                    control = demo.locator('button[aria-pressed=true]').filter(has_text='Match your services')
                    await control.focus()
                    await page.keyboard.press('End')
                    await expect(demo).to_have_attribute('data-step', '2')
                    await demo.get_by_role('button', name='Drainage plan', exact=True).click()
                    await expect(demo.get_by_text('Outline options to check with the project engineer.', exact=True)).to_be_visible()
                    await demo.evaluate('node => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }')
                    assert await demo.get_by_role('heading', name='School drainage. Our approach.', exact=True).evaluate('node => getComputedStyle(node).color') == 'rgb(255, 253, 251)'
                    assert await demo.evaluate('node => { const bounds = node.getBoundingClientRect(); return [...node.querySelectorAll("button")].every(button => { const rect = button.getBoundingClientRect(); return rect.width === 0 || (rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1); }); }'), 'walkthrough control clipped'
                    await demo.screenshot(path=str(OUT / f'{"home" if path == "/" else "pursuit"}-pitch-{width}-{motion}.png'))
                    if motion == 'reduce':
                        await expect(demo.get_by_role('button', name='Still view', exact=True)).to_be_disabled()
                        assert await demo.locator('article').evaluate_all("nodes => nodes.every(n => getComputedStyle(n).display !== 'none' && getComputedStyle(n).transitionDuration === '0s')")
                    else:
                        await demo.get_by_role('button', name='Play walkthrough', exact=True).click()
                        await expect(demo).to_have_attribute('data-step', '0')
                        await expect(demo.get_by_role('button', name='Play walkthrough', exact=True)).to_be_visible(timeout=16000)
                        await expect(demo).to_have_attribute('data-step', '2')
                        await demo.get_by_role('button', name='Previous walkthrough step', exact=True).click()
                        await expect(demo).to_have_attribute('data-step', '1')
                    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'overflow {path} {width}'
                    assert not await page.locator('[data-nextjs-dialog]').count(), 'Next error overlay'
                    assert not posts, posts
                    assert not errors, errors
                    font = await demo.evaluate('node => getComputedStyle(node).fontFamily')
                    report.append({'route': path, 'width': width, 'motion': motion, 'controls': 'passed', 'researchPosts': len(posts), 'errors': errors.copy(), 'font': font})
                await context.close()
        await browser.close()
    (OUT / 'report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))

asyncio.run(main())

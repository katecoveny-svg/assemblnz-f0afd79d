"""Walkthrough UI proof. All research POSTs are blocked; this spends no quota."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, expect

ORIGIN = os.environ.get('ASSEMBL_REVIEW_ORIGIN', 'http://127.0.0.1:3000')
OUT = Path('visual-evidence/pursuit-walkthrough')
OUT.mkdir(parents=True, exist_ok=True)

async def pointer(page, demo, button, path, width, motion):
    """Preserve Playwright's real pointer checks and diagnose any actionability stall."""
    geometry = await button.evaluate('''node => ({
      name: node.getAttribute('aria-label') || node.textContent,
      display: getComputedStyle(node).display, visibility: getComputedStyle(node).visibility,
      disabled: node.disabled, rect: node.getBoundingClientRect().toJSON(),
      ancestors: (() => { const result=[]; for(let n=node.parentElement; n; n=n.parentElement) {
        result.push({tag:n.tagName, transform:getComputedStyle(n).transform, rect:n.getBoundingClientRect().toJSON()});
        if(n.matches('section')) break;
      } return result; })()
    })''')
    # A shell compositor can stop producing frames after a software-WebGL scene
    # is released. Record that independently of selectors and React state.
    frames = await page.evaluate('''() => new Promise(resolve => {
      let count=0; const started=performance.now();
      const timer=setTimeout(() => resolve({count, elapsed:performance.now()-started}), 3000);
      const frame=() => { if(++count===2) { clearTimeout(timer); resolve({count, elapsed:performance.now()-started}); }
        else requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    })''')
    try:
        await button.click()
    except Exception:
        diagnostics = await demo.evaluate('''node => ({
          scrollY, viewport: {width:innerWidth,height:innerHeight}, stage:node.dataset.step,
          animations:node.getAnimations({subtree:true}).map(a => ({state:a.playState,time:String(a.currentTime),target:a.effect?.target?.tagName}))
        })''')
        (OUT / f'failure-{width}-{motion}.json').write_text(json.dumps({'route':path, 'button':geometry, 'frames':frames, **diagnostics}, indent=2))
        try:
            await page.screenshot(path=str(OUT / f'failure-{width}-{motion}.png'), timeout=10000)
        except Exception:
            pass  # Keep the original pointer failure if its compositor cannot capture.
        raise
    print(json.dumps({'route':path,'width':width,'motion':motion,'action':geometry['name'],'frames':frames}), flush=True)

async def main():
    report = []
    async with async_playwright() as playwright:
        # Full Chromium's new headless mode shares the production browser compositor.
        # Keep WebGL and normal motion enabled; never bypass pointer actionability.
        browser = await playwright.chromium.launch(channel='chromium', args=['--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'], **({'executable_path': os.environ['PLAYWRIGHT_EXECUTABLE_PATH']} if os.environ.get('PLAYWRIGHT_EXECUTABLE_PATH') else {}))
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
                    await expect(demo).to_have_attribute('data-step', '3')
                    await expect(demo.get_by_text('Fictional sources, businesses and brands', exact=True)).to_be_visible()
                    assert 'school drainage' not in (await demo.inner_text()).lower()
                    # Industry tabs support native roving focus; the demonstration is broad.
                    tab = demo.get_by_role('tab', name='Property & construction', exact=True)
                    await tab.focus()
                    await page.keyboard.press('ArrowRight')
                    await expect(demo).to_have_attribute('data-industry', 'customer')
                    await expect(demo.get_by_role('tab', name='Customer journeys', exact=True)).to_be_focused()
                    await page.keyboard.press('End')
                    await expect(demo).to_have_attribute('data-industry', 'services')
                    await page.keyboard.press('Home')
                    await expect(demo).to_have_attribute('data-industry', 'property')
                    cases = [
                      ('Property & construction','property','place','Horizon Build','See the plan take shape.','The plan','Turn the concept into a plan to discuss.'),
                      ('Customer journeys','customer','journey','Neighbour Home','Ready for the whole job.','Pickup plan','Prepare collection details without changing an order.'),
                      ('Professional services','services','brief','Civic Practice','Know what to ask.','Shape the scope','Show a small, reviewable piece of proposed work.'),
                    ]
                    for label, industry, template, business, headline, option, caption in cases:
                        await pointer(page, demo, demo.get_by_role('tab',name=label,exact=True),path,width,motion)
                        await expect(demo).to_have_attribute('data-industry',industry)
                        await expect(demo).to_have_attribute('data-step','3')
                        await pointer(page,demo,demo.get_by_label('Walkthrough steps').locator('button').filter(has_text='The businesses'),path,width,motion)
                        await expect(demo).to_have_attribute('data-step','1')
                        account=demo.get_by_role('button',name=business,exact=False)
                        await pointer(page,demo,account,path,width,motion)
                        await expect(account).to_have_attribute('aria-pressed','true')
                        await pointer(page,demo,demo.get_by_label('Walkthrough steps').locator('button').filter(has_text='The opportunity'),path,width,motion)
                        await expect(demo).to_have_attribute('data-step','2')
                        await expect(demo.get_by_text('Hypothesis',exact=True)).to_be_visible()
                        await pointer(page,demo,demo.get_by_label('Walkthrough steps').locator('button').filter(has_text='The pitch'),path,width,motion)
                        await expect(demo).to_have_attribute('data-step','3')
                        pitch=demo.locator(f'article[data-template="{template}"]')
                        await expect(pitch.get_by_role('heading',name=headline,exact=True)).to_be_visible()
                        assert await pitch.evaluate('node=>getComputedStyle(node).transform')=='none'
                        assert await pitch.get_by_role('heading',name=headline,exact=True).evaluate('node=>getComputedStyle(node).color')=='rgb(255, 253, 251)'
                        await pointer(page,demo,pitch.get_by_role('button',name=option,exact=True),path,width,motion)
                        await expect(pitch.get_by_text(caption,exact=True)).to_be_visible()
                        assert await pitch.locator('li').count()==3
                        await demo.evaluate('node=>document.activeElement?.blur()')
                        await demo.screenshot(path=str(OUT/f'{"home" if path=="/" else "pursuit"}-{industry}-{width}-{motion}.png'))
                        # Viewport evidence avoids locator capture relocating fixed skip links.
                        await pitch.evaluate('node=>node.scrollIntoView({block:"center"})')
                        await page.screenshot(path=str(OUT/f'viewport-{"home" if path=="/" else "pursuit"}-{industry}-{width}-{motion}.png'))
                    control=demo.get_by_label('Walkthrough steps').locator('button[aria-pressed=true]').filter(has_text='The pitch')
                    await control.focus()
                    await page.keyboard.press('Home')
                    await expect(demo).to_have_attribute('data-step','0')
                    await pointer(page,demo,demo.get_by_role('button',name='Next walkthrough step',exact=True),path,width,motion)
                    await expect(demo).to_have_attribute('data-step','1')
                    await pointer(page,demo,demo.get_by_role('button',name='Previous walkthrough step',exact=True),path,width,motion)
                    await expect(demo).to_have_attribute('data-step','0')
                    await demo.get_by_label('Walkthrough steps').locator('button[aria-pressed=true]').filter(has_text='The signal').focus()
                    await page.keyboard.press('End')
                    await expect(demo).to_have_attribute('data-step','3')
                    assert await demo.evaluate('node=>{const bounds=node.getBoundingClientRect(); return [...node.querySelectorAll("button")].every(button=>{const rect=button.getBoundingClientRect();return rect.width===0||(rect.left>=bounds.left-1&&rect.right<=bounds.right+1);});}'), 'walkthrough control clipped'
                    if motion=='reduce':
                        await expect(demo.get_by_role('button',name='Still view',exact=True)).to_be_disabled()
                        assert await demo.locator('article').evaluate_all('nodes=>nodes.every(n=>getComputedStyle(n).display!=="none"&&getComputedStyle(n).transitionDuration==="0s")')
                    else:
                        await pointer(page,demo,demo.get_by_role('button',name='Play walkthrough',exact=True),path,width,motion)
                        await expect(demo).to_have_attribute('data-step','0')
                        await expect(demo.get_by_role('button',name='Play walkthrough',exact=True)).to_be_visible(timeout=22000)
                        await expect(demo).to_have_attribute('data-step','3')
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

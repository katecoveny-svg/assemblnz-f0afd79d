"""Synthetic-only browser proof. No health data, providers, storage writes or shopping effects."""
import asyncio, json, os
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect
BASE = os.environ.get('DO_REVIEW_BASE', 'http://127.0.0.1:3000')
OUT = Path('output/playwright/do-fitness')

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    report = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for width in [375, 1440]:
            context = await browser.new_context(viewport={'width': width, 'height': 960}, reduced_motion='reduce')
            posts, errors = [], []
            async def route(r):
                req = r.request
                if req.method not in ['GET', 'HEAD', 'OPTIONS']:
                    posts.append(req.url)
                    await r.abort()
                elif urlparse(req.url).netloc != urlparse(BASE).netloc:
                    await r.abort()
                elif '/api/' in req.url:
                    await r.fulfill(status=503, content_type='application/json', body='{}')
                else:
                    await r.continue_()
            await context.route('**/*', route)
            page = await context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.goto(BASE + '/do/fitness', wait_until='networkidle')
            await expect(page.get_by_role('heading', name='A little movement. A plan you can review.')).to_be_visible()
            await page.locator('[data-glass-identity] img').evaluate('(e) => e.decode()')
            assert await page.get_by_role('heading', level=1).evaluate('(e) => getComputedStyle(e).color') == 'rgb(73, 43, 62)'
            assert await page.get_by_role('main').count() == 1
            before = await page.evaluate('JSON.stringify({...localStorage})')
            start = page.get_by_role('button', name='Ask Fitness to prepare')
            await expect(start).to_be_disabled()
            assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
            await page.screenshot(path=str(OUT / f'fitness-ready-{width}.png'), full_page=True)
            await page.get_by_role('checkbox', name='I reviewed these synthetic adult inputs.').check()
            await start.click()
            await expect(page.get_by_role('heading', name='Movement, prepared')).to_be_visible()
            await page.get_by_role('checkbox', name='Record this sample session as done').check()
            await expect(page.get_by_text('1 manually marked sample session', exact=False)).to_be_visible()
            send = page.get_by_role('button', name='Give reviewed ingredients to Shop')
            await expect(send).to_be_disabled()
            await page.get_by_role('combobox', name='Servings per chosen dinner').select_option('4')
            await expect(page.get_by_test_id('food-quantities-salmon-kumara')).to_contain_text('salmon fillet 720 g')
            await expect(page.get_by_test_id('food-quantities-salmon-kumara')).to_contain_text('kūmara 1000 g')
            await expect(page.get_by_test_id('food-quantities-beef-tacos')).to_contain_text('lean beef mince 720 g')
            await expect(send).to_be_disabled()
            await expect(page.get_by_role('heading', name='Shop’s ingredient review')).to_have_count(0)
            await page.get_by_role('checkbox', name='I reviewed these food choices and quantities for Shop.').check()
            await send.click()
            await expect(page.get_by_role('heading', name='Shop’s ingredient review')).to_be_visible()
            await expect(page.get_by_role('region', name='Shop’s ingredient review').get_by_role('listitem').filter(has_text='salmon fillet')).to_contain_text('720 g')
            assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
            await page.screenshot(path=str(OUT / f'fitness-reviewed-{width}.png'), full_page=True)
            await page.get_by_role('combobox', name='Servings per chosen dinner').select_option('2')
            await expect(page.get_by_role('heading', name='Shop’s ingredient review')).to_have_count(0)
            await expect(send).to_be_disabled()
            await expect(page.get_by_text('Servings changed. Review the quantities again before Shop.', exact=True)).to_be_visible()
            await page.get_by_role('checkbox', name='I reviewed these food choices and quantities for Shop.').check()
            await send.click()
            await page.get_by_role('button', name='Withdraw food handoff').click()
            await expect(page.get_by_text('Food handoff withdrawn. Shop has no current ingredient handoff.', exact=True)).to_be_visible()
            await expect(page.get_by_role('heading', name='Shop’s ingredient review')).to_have_count(0)
            await page.get_by_role('combobox', name='Servings per chosen dinner').select_option('4')
            await page.get_by_role('button', name='Reset sample').click()
            await expect(start).to_be_disabled()
            await page.get_by_role('checkbox', name='I reviewed these synthetic adult inputs.').check()
            await start.click()
            await expect(page.get_by_role('combobox', name='Servings per chosen dinner')).to_have_value('1')
            await page.get_by_role('checkbox', name='I reviewed these synthetic adult inputs.').uncheck()
            await expect(page.get_by_role('heading', name='Movement, prepared')).to_have_count(0)
            await page.get_by_role('combobox', name='Food requirements', exact=True).select_option('allergy-or-medical')
            await expect(page.get_by_role('heading', name='Movement, prepared')).to_have_count(0)
            await page.get_by_role('checkbox', name='I reviewed these synthetic adult inputs.').check()
            await start.click()
            await expect(page.get_by_text('Meal suggestions withheld:', exact=False)).to_be_visible()
            await expect(send).to_have_count(0)
            await page.screenshot(path=str(OUT / f'fitness-withheld-{width}.png'), full_page=True)
            assert before == await page.evaluate('JSON.stringify({...localStorage})'), 'This workflow must not write localStorage'
            await page.reload(wait_until='networkidle')
            await expect(page.get_by_role('heading', name='Movement, prepared')).to_have_count(0)
            assert not posts, posts
            assert not errors, errors
            report.append({'width': width, 'reviewGates': 'passed', 'materialEditInvalidation': 'passed', 'unsupportedFoodRequirements': 'withheld', 'localStorageUnchanged': True, 'outboundWrites': posts, 'pageErrors': errors, 'noHorizontalOverflow': True, 'refreshClearsDraft': True, 'resetRestoresOneServing': True, 'reviewWithdrawalClearsDraft': True, 'handoffNoticeTracksCurrentState': True, 'scaledQuantitiesVisibleBeforeApproval': True})
            await context.close()
        await browser.close()
    (OUT / 'report.json').write_text(json.dumps(report, indent=2))

asyncio.run(main())

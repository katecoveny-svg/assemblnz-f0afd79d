"""Current coastal homepage contract shared by browser reviews; no external actions."""
from playwright.async_api import expect

async def verify_coastal_home(page, motion):
    await expect(page.get_by_role('heading', name='assembl. Useful work.', exact=True)).to_have_count(1)
    await expect(page.get_by_role('navigation', name='Primary', exact=True)).to_have_count(1)
    await expect(page.locator('.clear-coastal-poster')).to_be_attached()
    await page.wait_for_function("document.querySelector('.clear-coastal-poster').naturalWidth > 0")
    pause = page.locator('[data-pause]')
    if motion == 'reduce':
        await expect(pause).to_have_text('Motion reduced')
        await expect(pause).to_be_disabled()
        assert await page.locator('[data-coastal-video]').evaluate('v => v.paused')
    else:
        await page.wait_for_function("document.querySelector('.direction-4c').hasAttribute('data-ready')", timeout=30000)
        await pause.focus()
        await pause.press('Enter')
        await expect(pause).to_have_attribute('aria-pressed', 'true')
        assert await page.locator('[data-coastal-video]').evaluate('v => v.paused')
        await pause.press('Enter')
        await expect(pause).to_have_attribute('aria-pressed', 'false')
        await pause.press('Enter')
    for href in ['/do?tool=write', '/do?tool=talk', '/do']:
        link = page.locator(f'#try a[href="{href}"]')
        await link.scroll_into_view_if_needed()
        await link.click(trial=True)
    demo = page.locator('#try')
    await expect(demo.locator('.td-kicker')).to_contain_text('simulated', ignore_case=True)
    await demo.get_by_role('tab', name='Write', exact=True).click()
    await demo.get_by_role('textbox', name='What would you like done?').fill('Prepare a fictional weekend plan')
    # Typing in the preview is local; no research or real action is submitted.
    await expect(demo.get_by_role('textbox', name='What would you like done?')).to_have_value('Prepare a fictional weekend plan')
    launcher = page.get_by_role('button', name='Ask DO', exact=True)
    await launcher.focus()
    await launcher.press('Enter')
    await expect(page.locator('#site-do-workspace')).to_be_visible()
    await page.get_by_role('button', name='Close DO', exact=True).click()
    await expect(launcher).to_be_focused()
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Homepage overflow'

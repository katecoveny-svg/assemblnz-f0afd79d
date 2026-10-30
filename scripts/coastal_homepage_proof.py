"""Current coastal homepage contract shared by browser reviews; no external actions."""
from playwright.async_api import expect

async def verify_coastal_home(page, motion):
    assert ' '.join((await page.locator('h1').inner_text()).split()) == 'Make the next step worth waiting for.'
    await expect(page.get_by_role('navigation', name='Primary', exact=True)).to_have_count(1)
    await expect(page.locator('.assembly-plane')).to_have_count(7)
    if motion == 'reduce':
        await expect(page.get_by_role('button', name='Motion reduced', exact=True)).to_be_disabled()
    else:
        pause = page.get_by_role('button', name='Pause motion', exact=True)
        await pause.click()
        await expect(page.get_by_role('button', name='Play motion', exact=True)).to_have_attribute('aria-pressed', 'true')
    for href in ('/ai-ready', '/contact', '/pursuit', '/do', '/studio', '/lab'):
        assert await page.locator(f'.clear-home a[href="{href}"]').count() > 0
    launcher = page.get_by_role('button', name='Ask DO', exact=True)
    await launcher.focus()
    await launcher.press('Enter')
    panel = page.locator('#site-do-workspace')
    await expect(panel).to_be_visible()
    await expect(panel.get_by_role('region', name='Prepared company guide')).to_be_visible()
    await expect(panel.locator('form, textarea, input[type="checkbox"]')).to_have_count(0)
    await panel.get_by_text('What can this guide actually do?', exact=True).click()
    await expect(panel.get_by_text('It cannot access your account', exact=False)).to_be_visible()
    await expect(panel.locator('a[href^="/do"]')).to_have_count(0)
    await page.get_by_role('button', name='Close DO', exact=True).click()
    await expect(launcher).to_be_focused()
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Homepage overflow'

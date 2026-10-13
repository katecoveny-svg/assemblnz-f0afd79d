"""Synthetic, signed-out UI proof. No model calls, media capture or account access."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('output/playwright/do-task-art')
out.mkdir(parents=True, exist_ok=True)
report = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in (375, 390, 1440):
        page = browser.new_page(viewport={'width': width, 'height': 960}, reduced_motion='reduce')
        page.route('**/*', lambda route: route.continue_() if route.request.method in ('GET', 'HEAD', 'OPTIONS') else route.abort())
        page.goto('http://127.0.0.1:3000/about')
        page.get_by_role('button', name='Write', exact=True).click()
        page.wait_for_function("document.activeElement?.id === 'personal-assistant-input'")
        assert page.locator('[data-do-companion]').count() == 0
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        page.get_by_role('heading', name='Start with something useful').evaluate("e => e.scrollIntoView({block:'start'})")
        page.screenshot(path=str(out / f'scenes-{width}.png'))
        assert page.locator('[data-do-task-scene]').count() == 12
        page.get_by_text('Draft something else', exact=True).click()
        page.locator('[data-do-idea=school]').evaluate("e => e.scrollIntoView({block:'center'})")
        page.screenshot(path=str(out / f'school-briefing-{width}.png'))
        page.locator('[data-do-idea=school]').click()
        assert page.locator('#personal-assistant-input').input_value() == 'Turn this notice into next steps'
        page.get_by_role('button', name='Write', exact=True).click()
        page.wait_for_function("document.activeElement?.id === 'personal-assistant-input'")
        page.once('dialog', lambda dialog: dialog.dismiss())
        page.get_by_role('button', name='Close DO', exact=True).click()
        assert page.get_by_role('region', name='DO drafting workspace').is_visible()
        speak = page.get_by_role('link', name='Speak with DO — check availability in a new window')
        assert speak.get_attribute('href') == '/do/widget?entry=talk'
        assert speak.get_attribute('target') == '_blank'
        assert not page.locator('[aria-label="Ideas to get started"]').evaluate("e => /[↗→➡]/u.test(e.textContent)")
        report.append({'width': width, 'overflow': False, 'scenes': 12, 'write_focus': True, 'draft_starter': True, 'declined_close_preserves_draft': True, 'speak': 'availability destination only; no voice claim', 'reduced_motion': True})
        page.close()
    browser.close()
(out / 'report.json').write_text(json.dumps(report, indent=2))

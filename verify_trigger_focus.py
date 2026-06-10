from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        page.goto('http://localhost:3000')

        # Focus the trigger button
        trigger = page.get_by_role("button", name="Ask assembl")
        trigger.focus()

        # Take a screenshot of the focused trigger
        os.makedirs('verification/screenshots', exist_ok=True)
        trigger.screenshot(path='verification/screenshots/trigger_focus.png')

        browser.close()

if __name__ == "__main__":
    run()

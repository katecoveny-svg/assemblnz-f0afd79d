import asyncio
from pathlib import Path
from playwright.async_api import async_playwright, expect

OUT=Path("visual-evidence/home-recovery"); OUT.mkdir(parents=True,exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(args=["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        for width,height in [(1440,1000),(375,812)]:
            ctx=await browser.new_context(viewport={"width":width,"height":height}, reduced_motion="no-preference")
            page=await ctx.new_page()
            errors=[]
            page.on("pageerror", lambda e: errors.append(str(e)))
            resp=await page.goto("http://127.0.0.1:3000/",wait_until="domcontentloaded",timeout=45000)
            assert resp and resp.status==200
            await page.wait_for_timeout(5000)
            await expect(page.locator("h1")).to_contain_text("assembl")
            assert not await page.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
            cards=page.locator("article[data-product]")
            await expect(cards).to_have_count(3)
            await expect(page.locator('article[data-product="pursuit"] img[src*="pursuit-canvas-poster"]')).to_be_visible()
            await expect(page.locator('article[data-product="do"] img[src*="identity-plum"]')).to_be_visible()
            await expect(page.locator('article[data-product="studio"] img[src*="office-poster"]')).to_be_visible()
            await page.screenshot(path=str(OUT/f"home-{width}-top.png"))
            await cards.first.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
            rotations=await cards.evaluate_all("(els)=>els.map(e=>getComputedStyle(e).rotate)")
            assert any(r not in ("none","0deg","0") for r in rotations), rotations
            await page.screenshot(path=str(OUT/f"home-{width}-products.png"))
            if width>1000:
                before=await cards.first.bounding_box()
                await cards.first.hover()
                await page.wait_for_timeout(500)
                after=await cards.first.bounding_box()
                assert before and after and after["y"] < before["y"]+1
                await page.screenshot(path=str(OUT/f"home-{width}-hover.png"))
            assert not errors, errors
            await ctx.close()
        await browser.close()

asyncio.run(main())

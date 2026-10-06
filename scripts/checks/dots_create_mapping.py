import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1700,"height":950})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(__import__("os").environ.get("BASE_URL","http://localhost:4173/"))
        await pg.wait_for_timeout(500)
        await pg.get_by_role("button", name="Manage Products").first.click()
        await pg.wait_for_timeout(500)
        dots = lambda: pg.evaluate("({tabs:[...document.querySelectorAll('[role=tab]')].map(t=>t.textContent.trim()+':'+!!t.querySelector('.tab-dot')), rows:[...document.querySelectorAll('.ag-center-cols-container .ag-row')].map(r=>r.className.includes('row-changed')||!!r.querySelector('.row-dot')).filter(Boolean).length})")
        await pg.get_by_role("button", name="Create Mapping").click()
        await pg.wait_for_timeout(500)
        await pg.locator('#f-type').click(); await pg.locator('li[role=option]', has_text="O").first.click()
        await pg.locator('#f-activityType').click(); await pg.locator('li[role=option]').nth(2).click()
        await pg.locator('#f-category').click(); await pg.locator('li[role=option]').first.click(); await pg.keyboard.press("Escape")
        await pg.locator('[id="fam-Category A"]').click(); await pg.locator('li[role=option]').first.click(); await pg.keyboard.press("Escape")
        await pg.get_by_role("button", name="Create", exact=True).click()
        await pg.wait_for_timeout(700)
        for i in range(2):
            if await pg.locator(".confirm-paper").count(): await pg.get_by_role("button", name="Create", exact=True).last.click(); await pg.wait_for_timeout(600)
        print(await dots())
        print(await pg.evaluate("[...document.querySelectorAll('.ag-center-cols-container .ag-row')].map(r=>r.className.split(' ').filter(c=>/chang|new|dot/.test(c)).join(','))"))
        await pg.screenshot(path="/tmp/shot_md.png")
        print(errs)
        await b.close()
asyncio.run(main())

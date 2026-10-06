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
        await pg.get_by_role("tab", name="Schedule").click()
        await pg.wait_for_timeout(900)
        await pg.locator('.ag-pinned-left-cols-container .ag-row').first.locator('[col-id="fixed"]').click()
        await pg.wait_for_timeout(300)
        await pg.locator('input[id^="fixed-"]').click()
        await pg.wait_for_timeout(300)
        print(await pg.evaluate("[...document.querySelectorAll('.MuiAutocomplete-option')].map(o=>o.textContent.trim())"))
        await pg.locator('li[role="option"]', has_text="TOYS").first.click()
        await pg.wait_for_timeout(300)
        print("chips", await pg.evaluate("[...document.querySelectorAll('input[id^=fixed-]')][0].closest('.MuiAutocomplete-root').textContent"))
        await pg.screenshot(path="/tmp/shot_code.png")
        print("errors:", errs)
        await b.close()
asyncio.run(main())

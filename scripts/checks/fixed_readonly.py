# Schedule > Unit: Fixed is read-only (plain Products of unmapped families); months offer Type T/X families only.
# Mapping > Create: Type options are O, T/X, X; Type X fills Code PREP.
import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1700,"height":950})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(os.environ.get("BASE_URL","http://localhost:4173/"))
        await pg.wait_for_timeout(500)
        await pg.get_by_role("button", name="Manage Products").first.click()
        await pg.wait_for_timeout(600)
        # Mapping tab: types shown in the list
        print("mapping types", await pg.evaluate("[...document.querySelectorAll('.ag-center-cols-container [col-id=type]')].map(c=>c.textContent.trim())"))
        await pg.get_by_role("button", name="Create Mapping").click()
        await pg.wait_for_timeout(400)
        await pg.locator("#f-type").click()
        print("type options", await pg.evaluate("[...document.querySelectorAll('li[role=option]')].map(o=>o.textContent.trim())"))
        await pg.keyboard.press("Escape")
        await pg.get_by_role("button", name="Discard").click()
        await pg.wait_for_timeout(300)
        await pg.get_by_role("tab", name="Schedule").click()
        await pg.wait_for_timeout(900)
        fixed = await pg.evaluate("[...document.querySelectorAll('.ag-pinned-left-cols-container [col-id=fixed]')].map(c=>c.textContent.trim())")
        print("fixed", fixed)
        row = pg.locator('.ag-pinned-left-cols-container .ag-row').first
        await pg.locator('.ag-center-cols-container .ag-row').first.locator('.month-cell').first.click()
        await pg.wait_for_timeout(300)
        print("fixed inputs while editing:", await pg.locator('input[id^="fixed-"]').count())
        print("fixed header:", await pg.evaluate("document.querySelector('.ag-pinned-left-header [col-id=fixed]').textContent.trim()"))
        await pg.locator('input[id^="cell-"]').first.click()
        await pg.wait_for_timeout(300)
        print("month options", await pg.evaluate("[...document.querySelectorAll('.MuiAutocomplete-option')].map(o=>o.textContent.trim())"))
        await pg.screenshot(path=os.environ.get("SHOT","/tmp/shot_unit.png"))
        print("errors:", errs)
        await b.close()
asyncio.run(main())

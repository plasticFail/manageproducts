# Rows of editable tabs go cyan + underline on hover and open the Update form on click; Update forms have a far-left Delete (outlined red/400);
# FIXED Products have a disabled "x" with the tooltip "Fixed for <Unit> Unit"; the FIXED family cannot be deleted. View-only personas get none of it.
import asyncio, os
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
SHOT = os.environ.get("SHOT_DIR", "/tmp")
CELL_STYLE = "(el)=>{const s=getComputedStyle(el);return [s.color,s.textDecorationLine]}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1700, "height": 950})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        async def open_modal(persona):
            await pg.get_by_role("tab", name=f"Persona {persona}").click()
            await pg.get_by_role("button", name="Manage Products").click(); await pg.wait_for_timeout(700)
        for persona in "ABC":
            await open_modal(persona)
            row = pg.locator(".ag-center-cols-container .ag-row").first
            await row.hover(); await pg.wait_for_timeout(400)
            cell = row.locator("[col-id=type]")
            print(persona, "Mapping hover (color, decoration):", await cell.evaluate(CELL_STYLE))
            chip = row.locator(".table-chip").first
            print(persona, "  chip:", await chip.evaluate(CELL_STYLE) if await chip.count() else None)
            if persona == "A":
                await pg.screenshot(path=f"{SHOT}/rl_mapping_hover.png")
            await row.click(position={"x": 300, "y": 20}); await pg.wait_for_timeout(500)
            print(persona, "  after row click, title:", (await pg.locator(".modal-head h2").inner_text()).strip())
            if persona == "A":
                foot = pg.locator(".modal-footer")
                btns = [(await x.inner_text(), await x.evaluate("(e)=>[Math.round(e.getBoundingClientRect().x), getComputedStyle(e).color, getComputedStyle(e).borderTopColor]")) for x in await foot.locator("button").all()]
                print("  footer buttons (label, [x, color, border]):", btns)
                await pg.screenshot(path=f"{SHOT}/rl_mapping_update.png")
                await pg.get_by_role("button", name="Discard").click(); await pg.wait_for_timeout(300)
                await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(900)
            else:
                await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(900)
            srow = pg.locator(".ag-center-cols-container .ag-row").first
            await srow.hover(); await pg.wait_for_timeout(400)
            print(persona, "Schedule hover Unit cell (no hover effect expected, white):", await pg.locator(".ag-pinned-left-cols-container .ag-row").first.locator("[col-id=unit]").evaluate(CELL_STYLE))
            if persona == "A": await pg.screenshot(path=f"{SHOT}/rl_schedule_hover.png")
            await pg.get_by_role("tab", name="Product Family").click(); await pg.wait_for_timeout(900)
            frow = pg.locator(".ag-center-cols-container .ag-row").first
            await frow.hover(); await pg.wait_for_timeout(300)
            print(persona, "Family first row:", (await frow.locator("[col-id=name]").inner_text()).strip(), await frow.locator("[col-id=name]").evaluate(CELL_STYLE))
            if persona == "A":
                await frow.click(position={"x": 300, "y": 20}); await pg.wait_for_timeout(500)
                print("  title:", (await pg.locator(".modal-head h2").inner_text()).strip())
                rm = pg.locator("button[aria-label='Remove product']")
                print("  remove buttons:", await rm.count(), "disabled:", await pg.locator("button[aria-label='Remove product'][disabled]").count())
                await pg.locator(".remove-locked").first.hover(); await pg.wait_for_timeout(500)
                print("  tooltip:", await pg.locator(".MuiTooltip-tooltip").inner_text())
                dele = pg.locator(".modal-footer button", has_text="Delete")
                print("  FIXED Delete disabled:", await dele.is_disabled())
                await pg.screenshot(path=f"{SHOT}/rl_fixed_update.png")
                await pg.get_by_role("button", name="Discard").click(); await pg.wait_for_timeout(300)
                # another family: Delete enabled, x enabled
                await pg.locator(".ag-center-cols-container .ag-row").nth(1).click(position={"x": 300, "y": 20}); await pg.wait_for_timeout(500)
                print("  other family:", (await pg.locator("input[id=fam-name]").input_value()), "| Delete disabled:", await pg.locator(".modal-footer button", has_text="Delete").is_disabled(),
                      "| disabled x:", await pg.locator("button[aria-label='Remove product'][disabled]").count())
                await pg.get_by_role("button", name="Discard").click(); await pg.wait_for_timeout(300)
            else:
                await frow.click(position={"x": 300, "y": 20}); await pg.wait_for_timeout(400)
                print(persona, "  after click title:", (await pg.locator(".modal-head h2").inner_text()).strip())
            await pg.get_by_role("button", name="Close").click(); await pg.wait_for_timeout(300)
        print("errors:", errs)
        await b.close()
asyncio.run(main())

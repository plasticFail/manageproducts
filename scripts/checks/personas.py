# Personas A (full access) and B (view only) share one dataset.
# View-only tabs: no Create button, no Actions column, table 24px above the modal's bottom edge.
# Empty states: A links to Create Mapping; B gets plain copy.
import asyncio, os
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
SHOT = os.environ.get("SHOT_DIR", "/tmp")
async def tab_facts(pg):
    return await pg.evaluate("""() => {
      const paper = document.querySelector('.MuiDialog-paper').getBoundingClientRect();
      const g = document.querySelector('.grid-wrap, .list-empty');
      const gr = g.getBoundingClientRect();
      const btn = [...document.querySelectorAll('.modal-footer button')].map(b => b.textContent.trim());
      const actions = !!document.querySelector('.ag-header-cell[col-id=actions]');
      return { gapToModalEnd: Math.round(paper.bottom - gr.bottom), footerButtons: btn, actionsColumn: actions };
    }""")
async def open_modal(pg):
    await pg.get_by_role("button", name="Manage Products").first.click()
    await pg.wait_for_timeout(700)
async def close_modal(pg):
    await pg.get_by_role("button", name="Close").click()
    await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1700, "height": 950})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        for pid, label in [("A", "Persona A"), ("B", "Persona B")]:
            await pg.get_by_role("tab", name=label).click(); await pg.wait_for_timeout(200)
            await open_modal(pg)
            for tab in ["Mapping", "Schedule", "Product Family"]:
                await pg.get_by_role("tab", name=tab, exact=True).click(); await pg.wait_for_timeout(900)
                print(pid, tab, await tab_facts(pg))
            await pg.screenshot(path=f"{SHOT}/persona_{pid}_products.png")
            await pg.get_by_role("tab", name="Mapping", exact=True).click(); await pg.wait_for_timeout(700)
            await pg.screenshot(path=f"{SHOT}/persona_{pid}_mapping.png")
            await close_modal(pg)
        # Linked data: A deletes the second Product Family (the first is FIXED, which can't be deleted); C sees one family fewer.
        await pg.get_by_role("tab", name="Persona B").click(); await open_modal(pg)
        await pg.get_by_role("tab", name="Product Family").click(); await pg.wait_for_timeout(800)
        n_c = await pg.locator(".ag-center-cols-container .ag-row").count()
        names_c = await pg.evaluate("[...document.querySelectorAll('.ag-center-cols-container [col-id=name]')].map(c=>c.textContent.trim())")
        await close_modal(pg)
        await pg.get_by_role("tab", name="Persona A").click(); await open_modal(pg)
        await pg.get_by_role("tab", name="Product Family").click(); await pg.wait_for_timeout(800)
        name = await pg.locator(".ag-center-cols-container .ag-row").nth(1).locator("[col-id=name]").inner_text()
        await pg.locator(".ag-pinned-right-cols-container .ag-row, .ag-center-cols-container .ag-row").nth(1).locator('button[title=Delete]').click()
        await pg.wait_for_timeout(300)
        await pg.get_by_role("button", name="Delete", exact=True).last.click(); await pg.wait_for_timeout(500)
        await close_modal(pg)
        await pg.get_by_role("tab", name="Persona B").click(); await open_modal(pg)
        await pg.get_by_role("tab", name="Product Family").click(); await pg.wait_for_timeout(800)
        names_c2 = await pg.evaluate("[...document.querySelectorAll('.ag-center-cols-container [col-id=name]')].map(c=>c.textContent.trim())")
        print("linked data: deleted in A:", name.strip(), "| C before", n_c, "after", len(names_c2), "| still there:", name.strip() in names_c2)
        await close_modal(pg)
        # Empty states with no data at all.
        await pg.goto(BASE + "?data=blank"); await pg.wait_for_timeout(500)
        for pid in ["A", "B"]:
            await pg.get_by_role("tab", name=f"Persona {pid}").click(); await open_modal(pg)
            print(pid, "mapping empty:", (await pg.locator(".list-empty").inner_text()).strip(), "| footer:", await pg.locator(".modal-footer").count())
            await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(900)
            await pg.locator(".ag-center-cols-container .ag-row").first.locator(".month-cell").first.click(); await pg.wait_for_timeout(400)
            span = pg.locator(".span-empty")
            print(pid, "unit tab empty:", (await span.inner_text()).strip() if await span.count() else "(row does not open)", "| link:", await span.locator(".text-link").count() if await span.count() else 0)
            await pg.screenshot(path=f"{SHOT}/persona_{pid}_unit_empty.png")
            await pg.get_by_role("button", name="Activity Type").click(); await pg.wait_for_timeout(500)
            print(pid, "activity tab empty:", (await pg.locator(".list-empty").inner_text()).strip(), "| link:", await pg.locator(".list-empty .text-link").count())
            await pg.screenshot(path=f"{SHOT}/persona_{pid}_activity_empty.png")
            await close_modal(pg)
        # Dropdown options carry no Type line.
        await pg.goto(BASE); await pg.wait_for_timeout(500); await open_modal(pg)
        await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(900)
        await pg.locator(".ag-center-cols-container .ag-row").first.locator(".month-cell").first.click(); await pg.wait_for_timeout(300)
        await pg.locator('input[id^="cell-"]').first.click(); await pg.wait_for_timeout(300)
        print("unit dropdown option text:", await pg.evaluate("[...document.querySelectorAll('.MuiAutocomplete-option')].map(o=>o.textContent.trim())"))
        await pg.screenshot(path=f"{SHOT}/persona_A_dropdown.png")
        print("errors:", errs)
        await b.close()
asyncio.run(main())

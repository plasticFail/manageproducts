# V2.3.1 Type - Code: grouped dropdown (Default / Special Codes), locked Activity Type, O/T/X Codes with a Products field per Unit
# (options = Products of FIXED, taken ones disabled), "111 Unit:" table display, delete flows. Run `npm run build && npm run preview` first.
import asyncio, os
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
SHOT = os.environ.get("SHOT_DIR", "/tmp")
fails = []
def check(name, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  {extra}" if extra and not cond else ""))
    if not cond: fails.append(name)
async def table(pg):
    return await pg.evaluate("""() => {
      const rows = [...document.querySelectorAll('.list-grid .ag-row')];
      const ids = [...new Set(rows.map(r => r.getAttribute('row-id')))];
      return ids.map(id => {
        const o = {id};
        document.querySelectorAll(`.list-grid .ag-row[row-id="${id}"] .ag-cell`).forEach(c => o[c.getAttribute('col-id')] = c.innerText.replace(/\\n+/g, ' ').trim());
        return o;
      }).sort((a, b) => Number(a.id) - Number(b.id));
    }""")
async def order(pg):
    return await pg.evaluate("""() => [...document.querySelectorAll('.list-grid .ag-center-cols-container .ag-row')]
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      .map(r => r.querySelector('[col-id=type]').innerText.trim() + ' ' + r.querySelector('[col-id=activityType]').innerText.trim())""")
async def options(pg, sel):
    return await pg.evaluate("(s) => [...document.querySelectorAll(s)].map(o => ({t: o.innerText.replace(/\\n/g,' | '), d: o.getAttribute('aria-disabled') === 'true' || o.classList.contains('Mui-disabled')}))", sel)
async def confirm_delete(pg):
    await pg.get_by_role("button", name="Delete", exact=True).last.click(); await pg.wait_for_timeout(500)
def state(opts):  # {"FIXED1": "Mapped to 111 Unit" | "free"}
    return {o["t"].split(" | ")[0]: (o["t"].split(" | ")[1] if o["d"] and " | " in o["t"] else ("disabled" if o["d"] else "free")) for o in opts}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1700, "height": 950})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        await pg.get_by_role("button", name="Manage Products").first.click(); await pg.wait_for_timeout(800)
        t = await table(pg)
        by = {(r["type"], r["activityType"]): r for r in t}
        print("table:", [(r["type"], r["activityType"], r["families"]) for r in t])
        o = await order(pg)
        check("O/T/X rows sit below the existing rows", o[-2:] == ["O/T/X - DEF DEF", "O/T/X - ABC ABC"] and len(o) == 7, str(o))
        check("no Unit column", await pg.locator(".ag-header-cell[col-id=units]").count() == 0)
        abc = by.get(("O/T/X - ABC", "ABC"), {}).get("families", ""); dfn = by.get(("O/T/X - DEF", "DEF"), {}).get("families", "")
        check("ABC rows read '111 Unit:' then its Products", abc == "111 Unit: SAVE1 145 Unit: SAVE2", abc)
        check("DEF rows read '112 Unit:' then its Products", dfn == "112 Unit: SAVE5 123 Unit: SAVE6", dfn)
        chips = await pg.evaluate("() => [...document.querySelectorAll('.list-grid .ag-row')].filter(r => /Unit:/.test(r.innerText)).map(r => r.querySelectorAll('.table-chip').length)")
        check("Products show as plain text, not chips", chips and all(c == 0 for c in chips), str(chips))
        check("PREP row", by.get(("X - PREP", "PREP"), {}).get("families") == "FOOD")
        await pg.screenshot(path=f"{SHOT}/v231_mapping_list.png")

        # FIXED holds the extras
        await pg.get_by_role("tab", name="Product Family", exact=True).click(); await pg.wait_for_timeout(600)
        await pg.locator("#tabSearchInput").fill("FIXED"); await pg.wait_for_timeout(400)
        fx = await pg.locator('.list-grid .ag-row', has_text="SAVE").first.inner_text()
        check("FIXED has the SAVE extras", all(x in fx for x in ["SAVE1", "SAVE2", "SAVE5", "SAVE6", "FIXED7"]), fx)
        await pg.locator("#tabSearchInput").fill(""); await pg.get_by_role("tab", name="Mapping", exact=True).click(); await pg.wait_for_timeout(500)

        # Free up DEF, then create it again from the form
        await pg.locator('.list-grid .ag-row', has_text="O/T/X - DEF").first.locator('button[title=Delete]').click(); await pg.wait_for_timeout(400)
        title = await pg.locator(".confirm-paper h2").inner_text(); body = await pg.locator(".confirm-paper .confirm-message").inner_text()
        check("delete title", title.strip() == "Delete O/T/X - DEF Mapping")
        check("delete body is only the undo note", body.strip() == "This action cannot be undone.", body)
        await confirm_delete(pg)
        await pg.get_by_role("button", name="Create Mapping").click(); await pg.wait_for_timeout(500)
        await pg.locator("#f-type").click(); await pg.wait_for_timeout(300)
        menu = await options(pg, ".MuiMenu-list > li")
        check("menu order", [m["t"].split(" | ")[0] for m in menu] == ["Default", "O - Default", "T/X - Default", "Special Codes", "X - PREP", "O/T/X - ABC", "O/T/X - DEF"])
        dis = {m["t"].split(" | ")[0]: m["d"] for m in menu if m["t"] not in ("Default", "Special Codes")}
        check("used options disabled", dis == {"O - Default": False, "T/X - Default": True, "X - PREP": True, "O/T/X - ABC": True, "O/T/X - DEF": False}, str(dis))
        await pg.screenshot(path=f"{SHOT}/v231_type_dropdown.png")
        await pg.get_by_role("option", name="O/T/X - DEF").click(); await pg.wait_for_timeout(300)
        check("Activity Type filled with DEF", "DEF" in (await pg.locator("#f-activityType").inner_text()))
        check("Activity Type locked", await pg.evaluate("() => document.querySelector('#f-activityType').closest('.MuiInputBase-root').classList.contains('Mui-disabled')"))
        check("third field is Unit", (await pg.locator("label[for=f-units]").inner_text()).strip() == "Unit")
        check("Products wait for a Unit", "Select all dropdown options to continue" in await pg.locator(".modal-body").inner_text())
        await pg.locator("#f-units").click(); await pg.wait_for_timeout(300)
        us = state(await options(pg, ".MuiAutocomplete-option"))
        print("units:", us)
        check("111 and 145 are taken by O/T/X - ABC", us["111"] == "Mapped to O/T/X - ABC" and us["145"] == "Mapped to O/T/X - ABC", str(us))
        check("other Units selectable", all(us[u] == "free" for u in ["112", "123", "134", "140", "142"]), str(us))
        await pg.get_by_role("option", name="140").click(); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        heads = await pg.locator(".section-heading").all_inner_texts()
        check("one Products field for Unit 140", heads == ["Products mapped to 140 Unit"], str(heads))
        await pg.locator("#fam-140").click(); await pg.wait_for_timeout(300)
        ps = state(await options(pg, ".MuiAutocomplete-option"))
        print("products for 140:", ps)
        check("options are the Products of FIXED", list(ps) == ["FIXED1", "FIXED2", "FIXED3", "FIXED4", "FIXED5", "FIXED6", "FIXED7", "SAVE1", "SAVE2", "SAVE5", "SAVE6"], str(list(ps)))
        check("other Units' Products are taken", ps["FIXED1"] == "Mapped to 111 Unit" and ps["FIXED4"] == "Mapped to 134 Unit" and ps["FIXED7"] == "Mapped to 145 Unit" and ps["SAVE1"] == "Mapped to 111 Unit" and ps["SAVE2"] == "Mapped to 145 Unit", str(ps))
        check("a Unit's own Fixed Product is taken too", ps["FIXED5"] == "Mapped to 140 Unit" and all(ps[f"FIXED{i}"].startswith("Mapped to") for i in range(1, 8)), str(ps))
        check("the freed SAVE extras are free", ps["SAVE5"] == "free" and ps["SAVE6"] == "free", str(ps))
        await pg.get_by_role("option", name="SAVE5").click(); await pg.keyboard.press("Escape")
        await pg.locator("#f-units").click(); await pg.get_by_role("option", name="142").click(); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        heads = await pg.locator(".section-heading").all_inner_texts()
        check("second field once 142 is added", heads == ["Products mapped to 140 Unit", "Products mapped to 142 Unit"], str(heads))
        await pg.locator("#fam-142").click(); await pg.wait_for_timeout(300)
        ps = state(await options(pg, ".MuiAutocomplete-option"))
        check("Products chosen for 140 are taken under 142", ps["SAVE5"] == "Mapped to 140 Unit" and ps["FIXED5"] == "Mapped to 140 Unit" and ps["SAVE6"] == "free", str(ps))
        await pg.get_by_role("option", name="SAVE6").click(); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f"{SHOT}/v231_create_def.png")
        await pg.get_by_role("button", name="Create", exact=True).click(); await pg.wait_for_timeout(800)
        t = await table(pg); d = next((r for r in t if r["type"] == "O/T/X - DEF"), None)
        print("DEF row:", d)
        check("DEF created with its Products per Unit", d is not None and d["families"] == "140 Unit: SAVE5 142 Unit: SAVE6", str(d))
        await pg.screenshot(path=f"{SHOT}/v231_after_create.png")

        # Edit ABC: own Units selectable, DEF's taken; Products held by DEF are taken
        await pg.locator('.list-grid .ag-row', has_text="O/T/X - ABC").first.click(); await pg.wait_for_timeout(500)
        await pg.locator("#f-units").click(); await pg.wait_for_timeout(300)
        us = state(await options(pg, ".MuiAutocomplete-option"))
        check("ABC keeps its Units, DEF Units taken", us["111"] == "free" and us["145"] == "free" and us["140"] == "Mapped to O/T/X - DEF" and us["142"] == "Mapped to O/T/X - DEF", str(us))
        await pg.keyboard.press("Escape")
        await pg.locator("#fam-111").click(); await pg.wait_for_timeout(200)
        ps = state(await options(pg, ".MuiAutocomplete-option"))
        check("Products held by DEF are taken for ABC", ps["SAVE5"] == "Mapped to 140 Unit" and ps["SAVE6"] == "Mapped to 142 Unit" and ps["FIXED1"] == "Mapped to 111 Unit" and ps["SAVE1"] == "free" and ps["SAVE2"] == "Mapped to 145 Unit", str(ps))
        await pg.keyboard.press("Escape")
        await pg.get_by_role("button", name="Discard").click(); await pg.wait_for_timeout(400)

        # Deleting an unrelated Product Family leaves the O/T/X Mappings alone
        await pg.get_by_role("tab", name="Product Family", exact=True).click(); await pg.wait_for_timeout(800)
        await pg.locator("#tabSearchInput").fill("AUTO"); await pg.wait_for_timeout(400)
        await pg.locator('.list-grid .ag-row', has_text="AUTO").first.locator('button[title=Delete]').click(); await pg.wait_for_timeout(400)
        await confirm_delete(pg)
        await pg.locator("#tabSearchInput").fill(""); await pg.get_by_role("tab", name="Mapping", exact=True).click(); await pg.wait_for_timeout(600)
        t = await table(pg)
        check("O/T/X Mappings survive a Product Family delete", sum(1 for r in t if r["type"].startswith("O/T/X")) == 2, str([r["type"] for r in t]))
        # Start with presets: a third one clears the Schedule of FA · F only
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        labels = await pg.locator(".segmented button").all_inner_texts()
        check("Start with has three presets", labels == ["Dummy data", "No Mapping / Schedule", "FA · F Schedule cleared"], str(labels))
        async def act_rows(pg):
            await pg.get_by_role("button", name="Manage Products").first.click(); await pg.wait_for_timeout(700)
            await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(700)
            await pg.get_by_role("button", name="Activity Type").click(); await pg.wait_for_timeout(700)
            return await pg.evaluate("""() => [...document.querySelectorAll('.ag-center-cols-container .ag-row')]
              .reduce((m, r) => { const id = r.getAttribute('row-id'); m[id] = r.innerText.replace(/\\n+/g, ' '); return m; }, {})""")
        full = await act_rows(pg)
        await pg.goto(BASE + "?data=faf"); await pg.wait_for_timeout(500)
        faf = await act_rows(pg)
        print("activity rows (full):", full); print("activity rows (faf):", faf)
        fa = [k for k in faf if "FA" in k and "|F" in k or k.endswith("FA|F")]
        check("FA · F row is still listed but has no Schedule", bool(fa) and all("FRUITS" in full[k] and "FRUITS" not in faf[k] and "MALL" not in faf[k] for k in fa), str(fa))
        other = [k for k in faf if k not in fa]
        check("the other rows keep their Schedule", bool(other) and all(faf[k] == full[k] for k in other), str(other))
        check("no page errors", not errs, str(errs))
        await b.close()
    print("FAILED:", fails if fails else "none")
asyncio.run(main())

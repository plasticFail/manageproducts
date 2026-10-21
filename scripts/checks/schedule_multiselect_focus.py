# Schedule month multi-select: while the field has focus the Clear X replaces the counter (also right after picking an option); once focus leaves, the counter returns.
import asyncio, os
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fails = []
def check(name, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  {extra}" if extra and not cond else ""))
    if not cond: fails.append(name)
VIS = """() => { const c = document.activeElement && document.activeElement.closest('.MuiAutocomplete-root'); if (!c) return null;
  const v = e => !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  return {x: v(c.querySelector('.typing-x')), counter: v(c.querySelector('.count-chip'))}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1700, "height": 950})
        await pg.goto(BASE); await pg.wait_for_timeout(600)
        await pg.get_by_role("button", name="Manage Products").first.click(); await pg.wait_for_timeout(600)
        await pg.get_by_role("tab", name="Schedule", exact=True).click(); await pg.wait_for_timeout(800)
        await pg.locator(".ag-center-cols-container .ag-row").nth(1).click(); await pg.wait_for_timeout(600)
        cell = pg.locator(".ag-center-cols-container .ag-row .MuiAutocomplete-root").nth(1)
        await cell.click(); await pg.wait_for_timeout(400)
        r = await pg.evaluate(VIS)
        check("focus on a cell with values shows the X, not the counter", r and r["x"] and not r["counter"], str(r))
        await pg.locator("li[role=option]:not([aria-disabled=true])").first.click(); await pg.wait_for_timeout(300)
        r = await pg.evaluate(VIS)
        check("after picking an option the X stays", r and r["x"] and not r["counter"], str(r))
        await pg.mouse.click(10, 10); await pg.wait_for_timeout(400)
        counters = await pg.evaluate("() => [...document.querySelectorAll('.ag-center-cols-container .ag-row .count-chip')].filter(e => getComputedStyle(e).display !== 'none').length")
        check("once focus leaves, the counters show", counters >= 3, str(counters))
        await b.close()
    print("FAILED:", ", ".join(fails) or "none")
asyncio.run(main())

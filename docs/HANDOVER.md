# Handover: Manage Products prototype (first cut)

For developers picking this up. The prototype is the reference for **behaviour and interaction**; it is not production code. Run it with `npm install && npm run dev`.

## What it is
A modal with three tabs:
- **Mapping**: admins create Mappings by **Type** (O, T, X). Type O = Activity Type + Categories, each Category with its own Product Families. Type T = Product Families scheduled per Unit. Type X = Product Families with an optional Code (e.g. PREP).
- **Schedule**: two sub-tabs. *Unit* rows: Fixed (a Product Family or Product that is not scheduled monthly) plus one Type T family choice per month. *Activity Type* rows: one row per Activity Type × Category, months choose from the families linked to that pair in its Type O Mapping. Six months visible at a time.
- **Product Family**: families and their Products.

## What is prototype-only (replace with real services)
- All data is in memory, from `src/data/initialDb.js`. No API, no persistence, no auth.
- Units (`HOUSEHOLDS`), Activity Types, Categories and months come from `src/constants.js`; real lists come from the system.
- "Today" is fixed: the current month is hard-coded (`CURRENT_MONTH_KEY` in `src/lib/utils.js`, Sep 2026) and created/updated timestamps count from a fictional clock, so the screens are stable.
- Row/tab dots are session state only.

## Data shape (`db`)
`families[{name, products[], createdAt, updatedAt}]` · `mappings[{id, cycle, code, projectType, personnel[], links{category:[families]}, families[]}]` · `schedules[{household, key:"YYYY-M" (0-based month), family}]` · `projectSchedules[{projectType, personnel, key, family}]` · `fixed{household:[{kind:"family"|"product", name}]}` · `changedMappings/changedFamilies/changedHouseholds/changedProjectRows` (ids with a row dot) · `tabDots`.
Naming note: code identifiers are the old names (`household`=Unit, `cycle`=Type, `projectType`=Activity Type, `personnel`=Category). Only UI text was renamed.

## Business rules worth porting (all in `src/lib/domain.js`)
- `fixedPool`: Fixed offers families not in Type O/T. Type X families are offered whole; unmapped families can also be broken into Products (family and products stay in sync).
- `pruneSchedule`: after any Mapping or Product Family change, schedule entries that no longer fit are removed, and the confirm dialog previews exactly what will go.
- `validateFamily`: names must be unique across Product Families and Products; Products must be unique too.
- `withTabDots` and row dots: new/updated rows are flagged until clicked; a tab shows a dot while it has any flagged row.
- A Product Family can be mapped only once: to one Type, and within Type O to one Activity Type + Category. Deleting a Product Family removes it from its Mapping, and a Mapping left with no families is deleted.

## Where things are
See `CLAUDE.md` ("Layout of src") for the file map and `src/theme/mpTheme.js` for every colour, size and global style (PRIZM 3.0 dark plus product layer). Table layout numbers (modal 1600px, month columns 168px, Unit 100 / Fixed 220 etc.) are listed in `CLAUDE.md`.

## Known gaps in this cut
- A few unused leftovers (`npm run lint` warnings) from the original single-file build.
- No automated tests beyond the Playwright smoke checks in `scripts/checks/`.
- Accessibility: keyboard and screen-reader behaviour of the multi-select and grid cells has not been reviewed.

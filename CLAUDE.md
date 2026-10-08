# Manage Products prototype (V2.3)

It is a prototype, not production code: all data is in-memory (`src/data/initialDb.js`) and resets on reload.

Stack: React 18, MUI v6, AG Grid Community v33 (themeQuartz), Vite, JSX. Styling follows PRIZM 3.0 (dark) plus a product layer. Owner: Xinyi (UX/UI designer). She iterates on behaviour/visuals by describing changes and reviewing the published artifact.

## Commands
- `npm install`, `npm run dev` (live), `npm run build` (static site in `dist/`), `npm run lint`, `npm run format`.
- `npm run build:artifact` → `dist-artifact/{index.html, app.js}`: one classic-script bundle for publishing as a claude.ai Artifact.
- Publish: Artifact tool, `url` = the V2.3 artifact (https://claude.ai/artifact/8sEhAjG98T9p4A5WW3c4F8; V2.2 stays at https://claude.ai/artifact/7iX4sbmEcjaVn4b8PUJhN9), `file_path` = `dist-artifact/index.html`, `files` = `{"app.js": "<abs path>/dist-artifact/app.js"}`. Publish only when the user wants to look at something, once per round of changes. Local page needs `<!doctype html>` (the artifact host adds it).
- Checks: `npm install --legacy-peer-deps` (eslint 10 vs eslint-plugin-react peer conflict), then `npm run build && npm run preview` then `python3 scripts/checks/<name>.py` (Playwright; `BASE_URL` env to override). Run only the check for the flow you changed.

## Layout of `src/`
`constants.js` option lists and sizes · `data/initialDb.js` sample data and the db shape · `lib/domain.js` business rules (Fixed pool, pruning, tab dots, validation) · `lib/utils.js` small helpers · `theme/mpTheme.js` ALL tokens, MUI overrides, AG Grid params and global CSS · `theme/index.js` createTheme + grid theme · `components/` shared UI (PickerField multi-select, cells, previews, EditGrid, dialogs) · `mapping/` Mapping list + create/update form · `schedule/` Schedule grid, cells, month nav, legend · `products/` Product Family list, form, fields · `App.jsx` modal shell, tabs, db state.

## Terminology (UI text vs code)
UI text and code use the same names: **Unit / Type / Activity Type / Category** (`unit`, `type`, `activityType`, `category`; sub-tab values `"unit"` / `"activity"`). The Mapping field is **Type - Code**: one dropdown whose options read "O - All", "T/X - All except PREP" and "X - PREP" (labels from `typeCodeLabel` in `utils.js`; field keys O, T/X, X-PREP). Stored data is `type` (O, T/X, X) plus `code` (PREP for X, else null). T/X means Type T and X share the Product Families (all Codes except PREP). In the real system T, X and O are stored separately; the prototype keeps one T/X record, so devs save it as a T and an X record with the same families. Phrases like "Mapped to Type O" are literal. Sample Category values: Category A–D.

## Rules the prototype encodes
- **Type O** Mapping: Activity Type + Categories, each Category links its own Product Families (`links`). Schedule "Activity Type" tab rows = Activity Type × Category pairs, months pick that pair's families.
- **Type T/X** Mapping (one Mapping; the old Type T and Type X-without-Code are merged): Product Families scheduled per Unit per month. With no Type T/X Mapping, a Unit row in edit shows one spanning message "No results found. Start by creating a Type T/X Mapping here." (`here` = link opening Create Mapping with Type T/X, row resumes afterwards with its unsaved draft). Empty Activity Type tab links to Type O the same way.
- **X - PREP** (Type X, Code PREP) Mapping: one Product Family, not scheduled, so never offered in the Schedule. One Mapping each for T/X and X - PREP; an option already mapped shows "Mapped" and is disabled. A future Code would add one more option (X - ABC) with no new field. Create Mapping has three fields: Type - Code, Activity Type, Category (equal width).
- **Chips**: every table chip (Mapping and Schedule) uses one fill, #2C2C2C (grey/900) with white text and no border (`.table-chip`), so there are no legends and no info icons. Multi-select chips (`.multi-chip`) are #FFFFFF at 16% on the field.
- **Fixed** (Unit tab) is read-only and never involves a mapped Product Family: each Unit holds its own Product (plain text like the Unit column, not a chip; column header "Fixed Product", left aligned) from the unmapped Product Family **FIXED** (FIXED 01 to FIXED 16, one per Unit, no overlaps), assigned in `initialDb.js`. `fixedPool` lists the Products of unmapped families; if a family later gets mapped, its Fixed Products are pruned like any other Schedule entry (and listed in the confirm dialog). The "No Mapping / Schedule" preset clears Fixed.
- Create/update/delete of Mappings and Product Families prune Schedule entries that no longer fit and list what is removed in the confirm dialog. Creating a Mapping with a new inline Product Family asks for confirmation.
- **Dots**: a new or saved row gets a #00DCFF row dot, cleared by clicking the row. A **tab dot** shows while any row under that tab has a dot (including the active tab) and disappears when the last one is cleared.
- After creating a Mapping from Schedule the user stays on Schedule; the snackbar CTA is skipped in that case.
- Delete Mapping dialog shows only Type - Code.

## Layout numbers
Modal 1600px (app width 1920). Month columns min 168, six visible; same widths on both Schedule tabs. Unit 100 / Fixed Product 220; Activity Type 160 / Category 160 (left aligned; only months centred). Mapping Type - Code column 220 (no separate Code column), no truncation. Toolbar 64px, row heights multiples of 4. Schedule and Product Family tables fill the background like the Mapping table when rows don't overflow.

## Working notes
- Keep edits small and direct; no codegen step. `theme/mpTheme.js` is the single place for colours/CSS.
- Verify in a browser, not by reading code; compare against screenshots when touching layout.
- Unused leftovers from the old build (lint warnings: `MappingPreview`, `familyUsage`, `YEAR_*`) are harmless; remove when convenient.

# Manage Products prototype (V2.2)

It is a prototype, not production code: all data is in-memory (`src/data/initialDb.js`) and resets on reload.

Stack: React 18, MUI v6, AG Grid Community v33 (themeQuartz), Vite, JSX. Styling follows PRIZM 3.0 (dark) plus a product layer. Owner: Xinyi (UX/UI designer). She iterates on behaviour/visuals by describing changes and reviewing the published artifact.

## Commands
- `npm install`, `npm run dev` (live), `npm run build` (static site in `dist/`), `npm run lint`, `npm run format`.
- `npm run build:artifact` → `dist-artifact/{index.html, app.js}`: one classic-script bundle for publishing as a claude.ai Artifact.
- Publish: Artifact tool, `url` = the existing artifact (https://claude.ai/artifact/7iX4sbmEcjaVn4b8PUJhN9), `file_path` = `dist-artifact/index.html`, `files` = `{"app.js": "<abs path>/dist-artifact/app.js"}`. Publish only when the user wants to look at something, once per round of changes. Local page needs `<!doctype html>` (the artifact host adds it).
- Checks: `npm run build && npm run preview` then `python3 scripts/checks/<name>.py` (Playwright; `BASE_URL` env to override). Run only the check for the flow you changed.

## Layout of `src/`
`constants.js` option lists and sizes · `data/initialDb.js` sample data and the db shape · `lib/domain.js` business rules (Fixed pool, pruning, tab dots, validation) · `lib/utils.js` small helpers · `theme/mpTheme.js` ALL tokens, MUI overrides, AG Grid params and global CSS · `theme/index.js` createTheme + grid theme · `components/` shared UI (PickerField multi-select, cells, previews, EditGrid, dialogs) · `mapping/` Mapping list + create/update form · `schedule/` Schedule grid, cells, month nav, legend · `products/` Product Family list, form, fields · `App.jsx` modal shell, tabs, db state.

## Terminology (UI text vs code)
UI text and code use the same names: **Unit / Type / Activity Type / Category** (`unit`, `type`, `activityType`, `category`; sub-tab values `"unit"` / `"activity"`). Type values are O, T, X. Phrases like "Mapped to Type O" are literal. Sample Category values: Category A–D.

## Rules the prototype encodes
- **Type O** Mapping: Activity Type + Categories, each Category links its own Product Families (`links`). Schedule "Activity Type" tab rows = Activity Type × Category pairs, months pick that pair's families.
- **Type T** Mapping: Product Families scheduled per Unit per month. With no Type T Mapping, a Unit row in edit shows one spanning message "No results found. Start by creating a Type T Mapping here." (`here` = link opening Create Mapping with Type T, row resumes afterwards with its unsaved draft). Empty Activity Type tab links to Type O the same way.
- **Type X** Mapping: families with an optional Code. Only Type X and unmapped families can go in **Fixed**, except Type X with Code **PREP**: those families are not scheduled, so never offered in the Schedule (`NOT_SCHEDULED_CODES` in `constants.js`).
- **Fixed pool** (`fixedPool`): families not in Type O/T and not in a Type X Mapping with Code PREP. Type X families are offered whole only, shown like the month options (name, "Type X · CODE", products as detail line, no indentation). Unmapped families are family option plus indented Products with checkboxes; family and products stay in sync (all products selected ⇒ family selected; selecting family selects all).
- Create/update/delete of Mappings and Product Families prune Schedule entries that no longer fit and list what is removed in the confirm dialog. Creating a Mapping with a new inline Product Family asks for confirmation.
- **Dots**: a new or saved row gets a #00DCFF row dot, cleared by clicking the row. A **tab dot** shows while any row under that tab has a dot (including the active tab) and disappears when the last one is cleared.
- After creating a Mapping from Schedule the user stays on Schedule; the snackbar CTA is skipped in that case.
- Delete Mapping dialog shows only Type / Code.

## Layout numbers
Modal 1600px (app width 1920). Month columns min 168, six visible; same widths on both Schedule tabs. Unit 100 / Fixed 220; Activity Type 160 / Category 160 (left aligned; only Fixed and months centred). Mapping Type column 100, no truncation. Toolbar 64px, row heights multiples of 4. Schedule and Product Family tables fill the background like the Mapping table when rows don't overflow.

## Working notes
- Keep edits small and direct; no codegen step. `theme/mpTheme.js` is the single place for colours/CSS.
- Verify in a browser, not by reading code; compare against screenshots when touching layout.
- Unused leftovers from the old build (lint warnings: `MappingPreview`, `familyUsage`, `YEAR_*`) are harmless; remove when convenient.

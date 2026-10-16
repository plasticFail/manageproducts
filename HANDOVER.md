# Manage Products: developer handover

Design handover for the Manage Products modal (Mapping, Schedule, Product Family). The repo is a **prototype** (Vite + React, JSX, MUI v6, AG Grid Community v33, PRIZM 3.0 dark plus a product layer). It shows the intended behaviour and visuals; it is not production code. Owner: Xinyi (UX/UI). *Draft: Xinyi will update this document.*

Prototype: https://claude.ai/artifact/8sEhAjG98T9p4A5WW3c4F8

## 1. What developers need to change

The prototype is built to be read, not shipped. Before it goes into the product:

1. **Align with PRIZM 3 library components.** The prototype hand-styles MUI and AG Grid in `src/theme/mpTheme.js`. Use the PRIZM 3 component for every control that has one (Button, Tabs, Toggle button group, Dialog, Snackbar, Tooltip, Select / multi-select, Checkbox, Chip, Text field, data grid). Use the PRIZM tokens rather than the raw values in `mpTheme.js`. Anything with no PRIZM equivalent is a product-layer component and follows the specs below (multi-select chips, table chips, the month cell select, row dots).
2. **Icons: use GC3 Common Icons.** The repo uses Material UI icons; replace them with the GC3 Common Icons equivalent. Keep an MUI icon only when GC3 has no substitute. Icons in use today: Close, Edit (outlined), Delete (outlined), Save, Add, Cancel (outlined, the remove-row action, in `components/icons.jsx`), Keyboard arrow down (select chevron), Chevron left / right (month stepper), Arrow upward / downward (date sort).
3. **Replace the in-memory data.** All data lives in `src/data/initialDb.js` and resets on reload. Mapping, Product Family, Schedule and Fixed Product reads and writes need the real API. Pruning rules (section 4) must run on the server or be mirrored there.
4. **Save a T/X Mapping as two records.** The prototype keeps one T/X record (`type: "T/X"`). In the real system T, X and O are stored separately, so a T/X Mapping is saved as a Type T record and a Type X record with the same Product Families. X - PREP is stored as Type X with Code PREP.
5. **Remove prototype-only controls.** The launcher page, the "Start with" data presets (Dummy data / No Mapping / Schedule, `?data=empty`, `?data=blank`), the persona tabs (A full access, B view only) and the `clickMode` constant in `ScheduleGrid.jsx`. Access should come from real permissions (see section 3).
6. **Wire the final copy.** All UI strings are in the components; the empty-state copy is `NO_MAPPING_COPY` in `src/constants.js`. Confirm with Xinyi before changing any wording.

## 2. Terminology

**Unit / Type / Activity Type / Category** (`unit`, `type`, `activityType`, `category`). The Mapping field is **Type - Code**, one dropdown with the options "O - All", "T/X - All except PREP" and "X - PREP" (labels from `typeCodeLabel` in `src/lib/utils.js`). Stored data is `type` (O, T/X, X) plus `code` (PREP for X, otherwise null). T/X means Type T and X share the Product Families (all Codes except PREP). A future Code adds one more option (for example X - ABC), no new field. Phrases like "Mapped to Type O" are literal. Capitalise Mapping, Product Family, Schedule, Unit.

## 3. Access

- **Full access**: can edit Mapping, Schedule and Product Family.
- **View only**: no CTA anywhere. No Create button, no Actions column, no "Start by creating…" text, no row hover or click-to-open, and the table ends 24px above the modal's bottom edge.
- Schedule empty states (no Type T/X or Type O Mapping): full access sees "No results found. Start by creating a Type T/X Mapping here." (the link opens Create Mapping and restores any unsaved Schedule drafts); view only sees "No Type T/X Mapping found." (Unit) or "No Type O Mapping found." (Activity Type), no link.

## 4. Behaviour rules

**Mapping**
- **Type O**: Activity Type + Categories; each Category links its own Product Families. Schedule "Activity Type" rows are Activity Type × Category pairs. One Mapping per Activity Type + Category pair.
- **T/X**: one Mapping. Product Families are scheduled per Unit per month.
- **X - PREP**: one Product Family, never scheduled, never offered in Schedule. One Mapping each for T/X and X - PREP; an option already mapped shows "Mapped" and is disabled.
- Create Mapping has three equal-width fields: Type - Code, Activity Type, Category. A Product Family can be mapped once; options already used show "Mapped to: …" and are disabled. FIXED is disabled with "Mapped to respective units".
- **Changing the Activity Type of a Type O Mapping** keeps its Categories and linked Product Families, and moves the Schedule of each kept Category to the new Activity Type · Category row (the old row disappears). That row gets the changed dot, as does any Activity Type · Category row whose Product Families change in an edit. If another Mapping already holds that Activity Type + Category, the Category field shows "HA · H already exists." (several: "HA · H and HA · T already exist.") and Save is blocked until the user removes the Category or chooses another Activity Type.
- Create / update / delete of Mappings and Product Families prune Schedule entries that no longer fit and list what is removed in the confirm dialog. Creating a Mapping with a new inline Product Family asks for confirmation.
- After creating a Mapping from Schedule the user stays on Schedule; the snackbar CTA is skipped.
- Snackbars close on their own timer: 5 s minimum (8 s for a newly created Type O Mapping or a snackbar with an action), longer for long messages, 10 s maximum.

**Schedule**
- Two sub-views: **Unit** (months hold T/X Product Families) and **Activity Type** (months hold the pair's Product Families). Six months visible, paged with the month stepper.
- Rows read as chips; clicking a row (full access) opens its selects, one row at a time. Each month cell is a multi-select with no border of its own, only a 1px white line at the bottom; the active field gets a 2px accent border. Chips are never truncated and wrap; the right side holds a 32px counter (rectangle, radius 4, white 16%) and the chevron. While the user types, the counter is replaced by a Clear X (clears the typed text); once an option is selected the counter returns. An empty month shows only the chevron. Cancel / Save in Actions apply to the open row, Save returns the row to chips. Leaving the tab, switching Unit / Activity Type, paging months or opening another row asks to discard unsaved changes.
- Chips sit 12px from the top of the cell; chips are 4px apart and wrapped chip rows 8px apart (table cells, Mapping table and multi-selects). Schedule rows are at least 48px, also when every month is empty.
- **Fixed Product** (Unit view) is read-only: each Unit holds its own Product (plain text, not a chip) from the unmapped Product Family FIXED (FIXED01 to FIXED16, one per Unit). If FIXED were ever mapped, its Fixed Products are pruned like any Schedule entry and listed in the confirm dialog.
- **Dots**: a new or saved row gets a row dot (6px, #00DCFF), cleared by clicking the row. **Mark all as reviewed** (accent text button, left of the search box in the tab row) appears while any dot exists and clears every row, toggle and tab dot at once. A **tab dot** shows beside a tab while any row under it has a dot, and **beside Unit / Activity Type** in the Schedule toggle while any row in that view has one; each disappears when the last dot under it is cleared.

**Lists (Mapping, Product Family)**
- Full access: hovering a row turns the row text cyan (#00DCFF) and underlined (not the Mapping Product Family chips) and clicking opens the Update form, same as the Edit icon.
- Created and Last Updated headers sort; default is Created, newest first. An outlined arrow 8px right of the active label shows the direction (down = newest first). Only one column is sorted.
- Update Mapping and Update Product Family have an outlined red **Delete** at the far left of the footer, sharing the list's delete flow. The FIXED Product Family can be neither edited nor deleted: its Edit and Delete icons are disabled in the list, its row does not open the Update form and has no hover. (Should a FIXED form ever open, Delete is disabled and every Fixed Product's remove button is disabled with the tooltip "Fixed for <Unit> Unit".)
- Every table row is at least 48px (also dialog tables); row heights are multiples of 4.

**Delete dialogs** (title names the item, CTA "Delete"). Order in every dialog that has a table (also Create / Update Mapping): the explanation sentence(s), then the table, then "This action cannot be undone." last.
- Product Family, in use: "Product Family is currently in use. Deleting this will also remove it from Type O Mapping and Schedule." (Type T/X Mapping or X - PREP Mapping for those Types; Mapping or Schedule alone when only one applies). If it is the last Product Family in its Mapping the same sentence continues: "…remove it from X - PREP Mapping, and delete the Mapping as it has no other Product Family." With Schedule entries a two-column table follows (Unit or Activity Type · Category, Schedule); without Schedule entries there is no table. Not in use: "Product Family is not currently in use. Deleting this will not affect Mapping or Schedule."
- Mapping: title "Delete Type T/X Mapping", "Delete Type O Mapping" or "Delete X - PREP Mapping". When deleting removes Schedule entries: a table (Unit or Activity Type · Category, Schedule, Product Family) and "Mapping is currently in use. Deleting this will also remove it from Schedule." Otherwise "Mapping is not currently in use in Schedule. Deleting this will not affect Schedule." and no table (X - PREP is never scheduled, so its dialog has no sentence, only "This action cannot be undone.").

## 5. Visual specs

- Modal 1600px wide (page 1920). Toolbar 64px. Month columns min 168px. Unit 120 + Fixed Product 160 on the Unit view; Activity Type 140 + Category 140 on the Activity Type view (both 280, so the month columns line up on both; left aligned, only months centred). Mapping list: Created and Last Updated 200, Type - Code 240, Activity Type 160; Actions column 120 in every table.
- Table text starts 16px from the table's left edge and cells have 16px horizontal padding; in tables with the changed-dot column (Mapping, Product Family, Schedule) that column is 36px wide, the 6px dot sits 16px from the edge and the first text column starts at 36px.
- Delete dialog sizes: Delete Type O and Type T/X Mapping, and Create / Update Mapping when a table is shown, use the full dialog width (680px max). Delete Product Family and Delete X - PREP Mapping hug their content (min 504px). Tables in the Mapping and Product Family delete dialogs fill the dialog width: Unit, Schedule and Product Family share it equally; with Activity Type · Category that column is 232px (so its header is not truncated) and the others share the rest.
- Confirmation dialog tables are always the maximum height (300px): rows scroll under a fixed header when they overflow, and below the last row (even with a single row) the table shows the placeholder fill #1f1f1f.
- Table chips (Mapping and Schedule): fill #2C2C2C (grey/900), white text, no border, 14px / 18px line height; Category labels ("H:", "F:") follow (14px); 4px between chips and between wrapped chip rows, 8px between Category lines. Multi-select chips: white at 16%.
- Snackbar: #121212 fill, 1px #FDFDFD 5% border, elevation shadow, #FDFDFD text.
- Toggle buttons (Unit / Activity Type, launcher toggles, month picker): text #FDFDFD; selected = #FDFDFD 16% fill with a #FDFDFD 12% border (no cyan).
- Outlined (secondary) launch button; the destructive outlined button is red/400.
- All tokens, MUI overrides, AG Grid params and global CSS are in `src/theme/mpTheme.js`. A hex that matches a PRIZM palette step uses the token; a raw hex is a deviation to record in the design system.

## 6. Sample data (prototype)

Mappings: O - All FA · F (FRUITS, MALL, GARDEN, SPORTS); O - All HA · H (OFFICE, WRITING, ZOO); O - All Another · H (PET CARE, GADGETS, COOKWARE) and T (WELLNESS, ART KITS, BABY); T/X (CARS, BEAUTY, BOOKS, CLOTHES, HARDWARE, PAINT, DECOR, MUSIC, MACHINES, TOYS, FOOTWEAR, so the chips wrap onto a second line); X - PREP (FOOD). U is only an option. Sample Activity Types: FA, HA, Another. Schedule: 5 Units (123, 345, 678, 112, 445) hold T/X families Jul to Dec 2026 with no repeat in a Unit across months and no two Units sharing a family in a month; the Activity Type rows hold their families with none in consecutive months.

## 7. Running the prototype

`npm install --legacy-peer-deps`, `npm run dev`, `npm run build`, `npm run lint`. Source map: `constants.js` option lists and sizes · `data/initialDb.js` sample data · `lib/domain.js` business rules (Fixed pool, pruning, tab dots, validation) · `lib/utils.js` helpers · `theme/` tokens and overrides · `components/` shared UI · `mapping/` · `schedule/` · `products/` · `App.jsx` modal shell and db state. Playwright checks for individual flows are in `scripts/checks/` (some are out of date with the new sample data).

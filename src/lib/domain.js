import { MONTH_NAMES, NOT_SCHEDULED_CODES, PERSONNEL_LIST, PROJECT_TYPES } from "../constants";
import { up } from "./utils";

export function cycleForFamily(db, name) {
  const m = db.mappings.find((mm) => mm.families.includes(name));
  return m ? m.cycle : null;
}
const keyLabel = (k) => {
  const [y, mo] = k.split("-").map(Number);
  return `${MONTH_NAMES[mo]} ${y}`;
};
const sortKeys = (keys) =>
  [...keys].sort((a, b) => {
    const [ya, ma] = a.split("-").map(Number),
      [yb, mb] = b.split("-").map(Number);
    return ya - yb || ma - mb;
  });
const familiesFor = (db, pred) => [...new Set(db.mappings.filter(pred).flatMap((m) => m.families))].sort((a, b) => a.localeCompare(b));
// Household tab, month cells: Cycle T Product Families only.
export const householdCellFamilies = (db) => familiesFor(db, (m) => m.cycle === "T");
export const pairLabel = (pt, p) => `${pt} · ${p}`;
export const projectRowId = (pt, p) => `${pt}|${p}`;
// Project Type tab rows: one per Project Type + Personnel pair in a Cycle O Mapping. A pair appears as soon as its Mapping exists.
export function projectRows(db) {
  const rows = [];
  db.mappings
    .filter((m) => m.cycle === "O")
    .forEach((m) =>
      (m.personnel || []).forEach((p) =>
        rows.push({
          rowId: projectRowId(m.projectType, p),
          projectType: m.projectType,
          personnel: p,
          families: [...((m.links || {})[p] || [])],
          mappingId: m.id,
        }),
      ),
    );
  return rows.sort(
    (a, b) =>
      PROJECT_TYPES.indexOf(a.projectType) - PROJECT_TYPES.indexOf(b.projectType) ||
      PERSONNEL_LIST.indexOf(a.personnel) - PERSONNEL_LIST.indexOf(b.personnel),
  );
}
// Household tab, Fixed column: Type X Product Families (whole only) and unmapped Product Families with their Products; never Type O, T or Type X with Code PREP.
export function fixedPool(db) {
  // Type O and T families are scheduled elsewhere; Type X families with a hidden Code (PREP) are not scheduled at all.
  const taken = new Set(
    db.mappings
      .filter((m) => m.cycle === "O" || m.cycle === "T" || (m.cycle === "X" && NOT_SCHEDULED_CODES.includes(m.code)))
      .flatMap((m) => m.families),
  );
  const fams = db.families.filter((f) => !taken.has(f.name));
  // A Product Family in a Type X Mapping can only be picked as a whole ("whole"); unmapped Product Families can also be broken down into Products.
  const whole = fams.filter((f) => db.mappings.some((m) => m.families.includes(f.name))).map((f) => f.name);
  const byName = (a, b) => a.localeCompare(b);
  return {
    whole,
    families: fams.map((f) => f.name).sort(byName),
    products: fams
      .filter((f) => !whole.includes(f.name))
      .flatMap((f) => f.products.map((p) => ({ name: p, family: f.name })))
      .sort((a, b) => byName(a.name, b.name)),
  };
}
// Where each of these Product Families is scheduled: [{ family, where: "Household 123A" | "Alpha · Team 1", when: "Sep 2026, Nov 2026" | "Fixed" }, …]
export function scheduleUsage(db, families) {
  const out = [];
  const group = (rows, keyOf) => {
    const g = {};
    rows.forEach((s) => (g[keyOf(s)] = g[keyOf(s)] || []).push(s.key));
    return g;
  };
  families.forEach((f) => {
    const byHh = group(
      db.schedules.filter((s) => s.family === f),
      (s) => s.household,
    );
    Object.keys(byHh)
      .sort()
      .forEach((w) => out.push({ family: f, kind: "household", where: w, when: sortKeys(byHh[w]).map(keyLabel).join(", ") }));
    const byRow = group(
      db.projectSchedules.filter((s) => s.family === f),
      (s) => pairLabel(s.projectType, s.personnel),
    );
    Object.keys(byRow)
      .sort()
      .forEach((w) => out.push({ family: f, kind: "project", where: w, when: sortKeys(byRow[w]).map(keyLabel).join(", ") }));
    const fam = db.families.find((x) => x.name === f);
    Object.keys(db.fixed)
      .sort()
      .forEach((h) =>
        (db.fixed[h] || []).forEach((x) => {
          if (x.kind === "family" && x.name === f) out.push({ family: f, kind: "household", where: h, when: "Fixed" });
          else if (x.kind === "product" && fam && fam.products.includes(x.name))
            out.push({ family: f, kind: "household", where: h, when: `Fixed · ${x.name}` });
        }),
      );
  });
  return out;
}
// After a Mapping or Product Family change, Schedule entries that no longer fit are removed:
// Household months need Cycle T; Project Type months need the Product Family linked to that Project Type + Personnel (Cycle O);
// Fixed needs a Product Family or Product that is not mapped to Cycle O or T.
// Returns the pruned db and the removed entries as preview rows { family, where, when }.
export function pruneSchedule(d) {
  const removed = [];
  const tFams = householdCellFamilies(d);
  const pRows = projectRows(d);
  const grouped = {};
  const note = (family, kind, where, key) =>
    (grouped[family + "|" + kind + "|" + where] = grouped[family + "|" + kind + "|" + where] || {
      family,
      kind,
      where,
      keys: [],
    }).keys.push(key);
  const schedules = d.schedules.filter((x) => tFams.includes(x.family) || (note(x.family, "household", x.household, x.key), false));
  const projectSchedules = d.projectSchedules.filter(
    (x) =>
      pRows.some((r) => r.rowId === projectRowId(x.projectType, x.personnel) && r.families.includes(x.family)) ||
      (note(x.family, "project", pairLabel(x.projectType, x.personnel), x.key), false),
  );
  Object.keys(grouped)
    .sort()
    .forEach((k) => {
      const g = grouped[k];
      removed.push({ family: g.family, kind: g.kind, where: g.where, when: sortKeys(g.keys).map(keyLabel).join(", ") });
    });
  const pool = fixedPool(d);
  const fixed = {};
  Object.keys(d.fixed)
    .sort()
    .forEach((h) => {
      const keep = (d.fixed[h] || []).filter((x) => {
        const ok =
          x.kind === "family"
            ? pool.families.includes(x.name)
            : pool.products.some((p) => p.name === x.name && !pool.whole.includes(p.family));
        if (!ok) {
          const owner = x.kind === "family" ? x.name : (d.families.find((f) => f.products.includes(x.name)) || {}).name || x.name;
          removed.push({ family: owner, kind: "household", where: h, when: x.kind === "family" ? "Fixed" : `Fixed · ${x.name}` });
        }
        return ok;
      });
      if (keep.length) fixed[h] = keep;
    });
  return { db: removed.length ? { ...d, schedules, projectSchedules, fixed } : d, removed };
}
function familyUsage(db, name) {
  return db.mappings.some((m) => m.families.includes(name)) || scheduleUsage(db, [name]).length > 0;
}
// Tab dots: a tab gets a dot when a row in it picks up the changed dot while the user is on another tab, and loses it when the tab is opened.
// Mapping: a Mapping row added or saved. Product Family: a Product Family row added or saved. Schedule: a new Activity Type row (or a saved Schedule row).
// Changes that only alter a dropdown's options, rename things inside other rows, or remove entries add no row dot, so they add no tab dot either.
export function withTabDots(before, after, fromTab) {
  const grew = (key) => (after[key] || []).some((id) => !(before[key] || []).includes(id));
  const dots = new Set(after.tabDots || []);
  if (grew("changedMappings")) dots.add("mapping");
  if (grew("changedFamilies")) dots.add("products");
  if (grew("changedProjectRows") || grew("changedHouseholds")) dots.add("schedule");
  dots.delete(fromTab);
  return { ...after, tabDots: [...dots] };
}
export function validateFamily(allFamilies, rawName, rawProducts, editingName = null) {
  const errors = {};
  const name = up((rawName || "").trim());
  if (!name) errors.name = "This is a required field.";
  else if (allFamilies.some((f) => f.name.toLowerCase() === name.toLowerCase() && f.name !== editingName))
    errors.name = "Already exists as a Product Family.";
  else {
    const prodClash = allFamilies.find((f) => f.name !== editingName && f.products.some((e) => e.toLowerCase() === name.toLowerCase()));
    if (prodClash) errors.name = `Already exists as a Product in ${prodClash.name} Product Family.`;
  }
  const rows = rawProducts.map((p) => up((p || "").trim()));
  const productErrors = {};
  rows.forEach((v, i) => {
    if (!v) {
      productErrors[i] = "This is a required field.";
      return;
    }
    if (name && v.toLowerCase() === name.toLowerCase()) {
      productErrors[i] = "Same as this Product Family's name.";
      return;
    }
    if (rows.slice(0, i).some((e) => e.toLowerCase() === v.toLowerCase())) {
      productErrors[i] = "This Product is already listed above.";
      return;
    }
    const famClash = allFamilies.find((f) => f.name !== editingName && f.name.toLowerCase() === v.toLowerCase());
    if (famClash) {
      productErrors[i] = "Already exists as a Product Family.";
      return;
    }
    const clash = allFamilies.find((f) => f.name !== editingName && f.products.some((e) => e.toLowerCase() === v.toLowerCase()));
    if (clash) productErrors[i] = `Already exists in ${clash.name} Product Family.`;
  });
  if (Object.keys(productErrors).length) errors.products = productErrors;
  if (Object.keys(errors).length) return { errors };
  return { name, products: rows.filter(Boolean) };
}

export const up = (s) => (s || "").toUpperCase();
let fictionalNow = new Date("2026-09-26T15:00:00");
export function nowStamp() {
  fictionalNow = new Date(fictionalNow.getTime() + 6e4);
  return fictionalNow.toISOString();
}
export function formatDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())} ${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(-2)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export const productTextList = (products) => products.join(" \xB7 ");
export const without = (arr, v) => arr.filter((x) => x !== v);
export const withAdded = (arr, v) => (arr.includes(v) ? arr : [...arr, v]);
export const toggle = (arr, v) => (arr.includes(v) ? without(arr, v) : [...arr, v]);
// Type - Code field. Stored as type "O" | "T/X" | "X" | "O/T/X" plus code (null, PREP, ABC or DEF). The field's key is "O", "T/X" or `${type}-${code}`.
// Default options (O, T/X) cover every Code that has no Mapping of its own; T/X means Type T and X share the Product Families.
// Specific Codes get one option and one Mapping each: not scheduled, one Product Family, Activity Type filled from the Code and locked.
// O/T/X Codes (ABC, DEF) link Product Families per Unit (like Type O does per Category); a Unit sits in one Code at a time. X - PREP takes one Product Family and no Units.
// A future Code is one more row here.
export const SPECIAL_CODES = [
  { key: "X-PREP", type: "X", code: "PREP", units: false },
  { key: "O/T/X-ABC", type: "O/T/X", code: "ABC", units: true },
  { key: "O/T/X-DEF", type: "O/T/X", code: "DEF", units: true },
];
export const specialByKey = (key) => SPECIAL_CODES.find((s) => s.key === key) || null;
export const typeCodeKey = (m) => (m.code ? `${m.type}-${m.code}` : m.type);
export const typeCodeLabel = (key) =>
  key === "O" ? "O - Default" : key === "T/X" ? "T/X - Default" : (key || "").replace("-", " - ");
export const byUnit = (a, b) => a.localeCompare(b, undefined, { numeric: true });
export const isCategoryType = (c) => c === "O" || c === "S";
// Mappings that link Product Families per group: Type O per Category, O/T/X Codes per Unit (both keep them in `links`).
export const hasGroups = (m) => isCategoryType(m.type) || !!m.units;
export const groupsOf = (m) => (isCategoryType(m.type) ? m.category || [] : m.units || []);
export function monthAt(offset) {
  const d = new Date(2024, offset, 1);
  return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-US", { month: "short" }) + " " + d.getFullYear() };
}
export const CURRENT_MONTH_KEY = monthAt(32).key;
// Where a Product Family is already mapped. A Product Family can be mapped once: to one Type, and within Type O to one Activity Type + Category.
// A Mapping being edited is skipped, so its own Product Families stay selectable.
export function ownershipLabels(db, familyName, { excludeCategory = null, editingId = null, formLinks = {} } = {}) {
  const labels = [];
  db.mappings.forEach((m) => {
    if (m.id === editingId || !m.families.includes(familyName)) return;
    if (hasGroups(m)) {
      groupsOf(m).forEach((p) => {
        if (((m.links || {})[p] || []).includes(familyName)) labels.push(isCategoryType(m.type) ? `${m.type} · ${m.activityType} · ${p}` : `${typeCodeKey(m)} · ${p}`);
      });
    } else {
      labels.push(typeCodeKey(m));
    }
  });
  Object.keys(formLinks).forEach((p) => {
    if (p !== excludeCategory && (formLinks[p] || []).includes(familyName)) labels.push(p);
  });
  return [...new Set(labels)];
}

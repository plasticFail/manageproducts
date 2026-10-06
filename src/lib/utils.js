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
export const isCategoryType = (c) => c === "O" || c === "S";
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
    if (isCategoryType(m.type)) {
      (m.category || []).forEach((p) => {
        if (((m.links || {})[p] || []).includes(familyName)) labels.push(`${m.type}, ${m.activityType} · ${p}`);
      });
    } else {
      labels.push(m.code ? `${m.type}/${m.code}` : m.type);
    }
  });
  Object.keys(formLinks).forEach((p) => {
    if (p !== excludeCategory && (formLinks[p] || []).includes(familyName)) labels.push(p);
  });
  return [...new Set(labels)];
}

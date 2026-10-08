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
// Type - Code field. Stored as type "O" | "T/X" | "X" plus code (PREP for X, otherwise null). The field's key is "O", "T/X" or "X-PREP";
// T/X means Type T and X share the Product Families, with any Code except PREP. X-PREP is not scheduled.
export const typeCodeKey = (m) => (m.type === "X" ? `X-${m.code}` : m.type);
export const typeCodeLabel = (key) =>
  key === "O" ? "O - All" : key === "T/X" ? "T/X - All except PREP" : (key || "").replace("-", " - ");
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
      labels.push(typeCodeKey(m));
    }
  });
  Object.keys(formLinks).forEach((p) => {
    if (p !== excludeCategory && (formLinks[p] || []).includes(familyName)) labels.push(p);
  });
  return [...new Set(labels)];
}

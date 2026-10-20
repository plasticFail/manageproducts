export const ACTIVITY_TYPES = ["FA", "HA", "SW"];
export const CATEGORY_LIST = ["H", "F", "U", "T"];
export const CATEGORY_BY_ACTIVITY_TYPE = { FA: CATEGORY_LIST, HA: CATEGORY_LIST, SW: CATEGORY_LIST };
export const UNITS = ["111", "112", "123", "134", "140", "142", "145"]; // ascending
export const VISIBLE_MONTHS = 6;
// Year (and Month) column width in the Schedule for All Units tables
const YEAR_COL_W = 180;
const TYPE_FILTERS = ["All", "O", "T/X", "X-PREP", "O/T/X-ABC", "O/T/X-DEF"]; // Type - Code field keys
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = 2026;
const YEAR_OPTIONS = ["2025", "2026", "2027", "2028", "2029", "2030"];

// Prototype personas. `access` says which tabs the persona can edit; a tab without access is view only
// (no CTAs, no action buttons). All personas share the same data.
export const PERSONAS = [
  {
    id: "A",
    label: "Persona A",
    role: "Full access",
    access: { mapping: true, schedule: true, products: true },
  },
  {
    id: "B",
    label: "Persona B",
    role: "View only",
    access: { mapping: false, schedule: false, products: false },
  },
];
// Schedule empty states for people who cannot create Mappings (no link to follow).
export const NO_MAPPING_COPY = { unit: "No Type T/X Mapping found.", activity: "No Type O Mapping found." };
// The Product Family that supplies each Unit's read-only Fixed Product. It cannot be deleted.
export const FIXED_FAMILY = "FIXED";
